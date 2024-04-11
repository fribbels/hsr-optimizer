import { EarlyConditional } from '../stats/conditional'
import { HsrElement, Trait } from '../stats/context'
import { matchByTraits } from '../stats/matcher'
import { Modifiers } from '../stats/modifier'
import { StepBuilder } from '../step/builder'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type JingliuMetadata = {
  talentEnhancedState: boolean
  talentHpDrainAtkBuff: number
  e1CdBuff: boolean
  e2SkillDmgBuff: boolean
}

const DEFAULT_METADATA = {
  talentEnhancedState: true,
  talentHpDrainAtkBuff: 1.8,
  e1CdBuff: true,
  e2SkillDmgBuff: true,
}
export class Jingliu extends Character<JingliuMetadata> {
  private modifiers: Modifiers = {
    early: [],
    late: [],
    unconditional: [],
  }

  constructor(eid: Eidolon, metadata: JingliuMetadata = DEFAULT_METADATA) {
    super(eid, metadata)
    if (eid > 0 && metadata.e1CdBuff) {
      this.modifiers.unconditional.push({ crit: { critDmg: 0.25 } })
    }
    if (eid > 1 && metadata.e2SkillDmgBuff) {
      this.modifiers.early.push(new EarlyConditional(matchByTraits(Trait.SKILL), { dmgBoost: 0.8 }))
    }
    if (metadata.talentEnhancedState) {
      this.modifiers.unconditional.push({ basic: { percent: { atk: metadata.talentHpDrainAtkBuff } } })
    }
  }

  asTeammate: Modifiers = this.modifiers

  asOptiTarget: CharacterSteps[] = [
    {
      type: 'skill',
      modifiers: this.modifiers,
      // It is possible to handle hitsplit here, should we?
      steps: [StepBuilder.damage(HsrElement.ICE, [Trait.SKILL], 2.5, 'atk')],
    },
  ]

  presets: CharacterPreset[] = []
}
