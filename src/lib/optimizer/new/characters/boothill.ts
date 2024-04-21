import { LateConditional, ToStat, TransformingStat } from '../stats/conditional'
import { HsrElement, SupportedContextStat, Trait } from '../stats/context'
import { alwaysMatch } from '../stats/matcher'
import { MapLikeModifiers, Modifiers } from '../stats/modifier'
import { FinalStats, PartialModifiableStats } from '../stats/stat'
import { StepBuilder } from '../step/builder'
import { CritType, DamageStep, NormalDamageStep, StatLimit, Step } from '../step/step'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type Metadata = {
  standoffActive: boolean
  pocketTrickshotStacks: 0 | 1 | 2 | 3
  e1DefShred: true /** Always on if E1 */
  e2BeBuff: boolean
  e4TargetStandoffVulnerability: boolean
  beToCritBoost: true /** Always on */
  talentBreakDmgScaling: true /** Always on */
  // This is irrelevant to damage
  // talentMaxToughnessReduction: boolean
  enemyMaxToughness: number
}

const DEFAULT: Metadata = {
  standoffActive: true,
  pocketTrickshotStacks: 3,
  e1DefShred: true,
  e2BeBuff: true,
  e4TargetStandoffVulnerability: true,
  beToCritBoost: true,
  talentBreakDmgScaling: true,
  enemyMaxToughness: 360,
}

/** IMPORTANT: this function is not implemented, as all break damage is, well,
 * it is what it is, I'm lazy */
function basePhysBreak(characterLevel: number, toughness: number) {
  return characterLevel * toughness
}

function calculatePhysicalBreak(characterLevel: number, breakEffect: number, toughness: number) {
  return basePhysBreak(characterLevel, toughness) * (1 + breakEffect)
}

const standoffDmgBonus: PartialModifiableStats = { dmgBoost: 0.3 }
const e1DefIgnore: PartialModifiableStats = { targetDef: { percent: -0.16 } }

export class Boothill extends Character<Metadata> {
  constructor(eid: Eidolon, metadata: Metadata = DEFAULT) {
    super(eid, metadata)
    if (metadata.standoffActive) {
      this.modifiers.unconditional.push(standoffDmgBonus)
      if (eid >= 1) {
        this.modifiers.unconditional.push(e1DefIgnore)
      }
    }
  }

  asTeammate: Modifiers = {
    early: [],
    late: [],
    unconditional: [],
  }

  private modifiers: Modifiers = {
    late: [
      new LateConditional(
        alwaysMatch(),
        new TransformingStat(SupportedContextStat.BREAK_EFFECT, ToStat.CRIT_RATE, 0.1, 0.3),
      ),
      new LateConditional(
        alwaysMatch(),
        new TransformingStat(SupportedContextStat.BREAK_EFFECT, ToStat.CRIT_DMG, 0.5, 1.5),
      ),
    ],
    early: [],
    unconditional: [],
  }

  asOptiTarget: CharacterSteps[] = [
    {
      type: 'basic',
      modifiers: this.modifiers,
      steps: [
        /** I havent implemented anything related to break dmg, so whatever,
         * here's a typical step implementation (it also shows whats going
         * underneath the builder) */
        new BoothillNADamageStep(this.metadata.enemyMaxToughness, this.metadata.pocketTrickshotStacks, true),
      ],
    },
    {
      type: 'ult',
      modifiers: this.modifiers,
      steps: [StepBuilder.damage(HsrElement.PHYSICAL, [Trait.ULTIMATE], 4, 'atk')],
    },
  ]

  presets: CharacterPreset[] = []
}

class BoothillNADamageStep implements Step {
  private naStep: NormalDamageStep
  private talentStep: BoothillBreakDamageStep
  constructor(private toughness: number, private stack: number, private broken: boolean) {
    this.naStep = new NormalDamageStep(broken, {}, HsrElement.PHYSICAL, [Trait.NORMAL], 2.2, 'atk', CritType.AVERAGE)
    const toughnessToUse = this.toughness > 480 /** 16 * 30 */ ? 480 : this.toughness
    this.talentStep = new BoothillBreakDamageStep(toughnessToUse)
  }

  calculate(
    stat: FinalStats,
  ): number {
    // Boothill dmg has 2 part, one is his normal source, and one from talent
    // the normal one (with skill scale) is crittable, has dmg bonus...
    // the break part DOES NOT.

    // Internally we represent these 2 damage source by 2 step (yes it is a hack).
    const normalStepDamage = this.naStep.calculate(stat)
    if (!this.broken) {
      return normalStepDamage
    }
    const talentBreakDamage = this.talentStep.calculate(stat) * (this.stack === 0 ? 1 : (0.2 + 0.5 * this.stack))

    return normalStepDamage + talentBreakDamage
  }

  mods: MapLikeModifiers = {}
  element: HsrElement = HsrElement.PHYSICAL
  traits: Trait[] = [Trait.NORMAL]
  limit?: StatLimit | undefined
}

// Ideally this should be BreakDamageStep (but I didnt implement it...)
class BoothillBreakDamageStep extends DamageStep {
  constructor(private toughness: number) {
    super(true, {}, HsrElement.PHYSICAL, [], CritType.NO_CRIT)
  }

  protected dmgBoost(_percent: number): number {
    return 1
  }

  protected dmgReduction(_reductions: number[]): number {
    return 1
  }

  protected base(stat: FinalStats): number {
    return calculatePhysicalBreak(80, stat.breakEffect, this.toughness)
  }
}
