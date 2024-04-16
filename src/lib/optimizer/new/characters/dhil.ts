import { HsrElement, Trait } from '../stats/context'
import { Modifiers } from '../stats/modifier'
import { StepBuilder } from '../step/builder'
import { StepScope } from '../step/formula'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type ILMetadata = {
  basicEnhanced: 0 | 1 | 2 | 3
  skillStack: 0 | 1 | 2 | 3 | 4
  talentStack: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  e6ResPenStacks: 0 | 1 | 2 | 3
}

const DEFAULT_METADATA: ILMetadata = {
  basicEnhanced: 3,
  skillStack: 0,
  talentStack: 0,
  e6ResPenStacks: 3,
}

type NorAHits = 1 | 2 | 3 | 4 | 5 | 6 | 7

const KEY_TALENT_RIGHTEOUS_HEART = 'IL-Talent-Righteous Heart'
const KEY_SKILL_OUTROAR = 'IL-Skill-Outroar'
export class ImbibitorLunae extends Character<ILMetadata> {
  private modifiers: Modifiers = {
    early: [],
    late: [],
    unconditional: [],
  }

  constructor(eid: Eidolon, metadata: ILMetadata = DEFAULT_METADATA) {
    super(eid, metadata)

    if (metadata.basicEnhanced !== 3) {
      throw new Error('Unimplemented')
    }

    if (eid === 6 && metadata.e6ResPenStacks) {
      this.modifiers.unconditional.push({ res: -0.2 * metadata.e6ResPenStacks })
    }
  }

  asTeammate: Modifiers = { early: [], late: [], unconditional: [] }
  asOptiTarget: CharacterSteps[] = [
    {
      type: 'basic enhanced 3',
      modifiers: this.modifiers,
      steps: ([1, 2, 3, 4, 5, 6, 7] as NorAHits[])
        .map((i) => this.stepFor(i, this.metadata.talentStack, this.metadata.skillStack)),
    },
  ]

  presets: CharacterPreset[] = []

  private stepFor(hit: NorAHits, talent: ILMetadata['talentStack'], skill: ILMetadata['skillStack']) {
    const ret = StepBuilder.damage(HsrElement.IMAGINARY, [Trait.NORMAL], hit === 7 ? 0.148 : 0.142, 'atk')
    if (hit === 1) {
      // The first hit could either use 0 or `stack`.
      ret.with((bd) => {
        bd
          .unconditional(KEY_TALENT_RIGHTEOUS_HEART, {
            scope: StepScope.MANUAL,
            newStep: (_) => ({ dmgBoost: talent * 0.1 }),
          })
          // While the first 4 hits couldn't gain any Outroar stack, they can use
          // Outroar stacks from the initial stacks.
          .unconditional(KEY_SKILL_OUTROAR, {
            scope: StepScope.MANUAL,
            newStep: (_) => ({ crit: { critDmg: skill * 0.12 } }),
          })
      })
    } else {
      // After a hit, gain a stack -> starting from the 2nd hit, before a hit,
      // gain a stack
      ret.with((bd) => {
        bd.unconditional(KEY_TALENT_RIGHTEOUS_HEART, {
          scope: StepScope.MANUAL,
          // prev is undefined means that the previous stack count is reset
          // somewhere, this hit will be `dmgBoost: 0`, next will be `dmgBoost:
          // 0.1`
          newStep: (prev) => ({ dmgBoost: Math.min(prev?.dmgBoost ?? -0.1 + 0.1, this.eidolon === 6 ? 1 : 0.6) }),
        })
      })
    }
    if (hit >= 4) {
      // Starting from the 4th hit, before a hit, gain a stack
      ret.with((bd) => {
        bd.unconditional(KEY_SKILL_OUTROAR, {
          scope: StepScope.MANUAL,
          // same as above, if prev is undef, it means it is reset somewhere
          // manually (although first hit should already set it to `critDmg: 0`)
          newStep: (prev) => ({ crit: { critDmg: Math.min(prev?.crit?.critDmg ?? 0 + 0.12, 4 * 0.12) } }),
        })
      })
    }
    return ret
  }
}
