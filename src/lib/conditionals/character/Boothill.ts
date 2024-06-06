import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'standoffActive',
      name: 'standoffActive',
      text: 'Standoff Active',
      title: 'Standoff Active',
      content: `Forces Boothill and a single target enemy into the Standoff state. Boothill's Basic ATK gets Enhanced, and he cannot use his Skill, lasting for 2 turn(s). This duration reduces by 1 at the start of Boothill's every turn.
The enemy target in the Standoff becomes Taunted. When this enemy target/Boothill gets attacked by the other party in the Standoff, the DMG they receive increases by ${precisionRound(standoffVulnerabilityBoost * 100)}%/15%.`,
    },
    {
      formItem: 'slider',
      id: 'pocketTrickshotStacks',
      name: 'pocketTrickshotStacks',
      text: 'Pocket Trickshots',
      title: 'Pocket Trickshots',
      content: `Each stack of Pocket Trickshot increases the Enhanced Basic Attack's Toughness Reduction by 50%, stacking up to 3 time(s).
If the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks`,
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'beToCritBoost',
      name: 'beToCritBoost',
      text: 'BE to CR / CD boost',
      title: 'BE to CR / CD boost',
      content: `Increase this character's CRIT Rate/CRIT DMG, by an amount equal to 10%/50% of Break Effect, up to a max increase of 30%/150%.`,
    },
    {
      formItem: 'switch',
      id: 'talentBreakDmgScaling',
      name: 'talentBreakDmgScaling',
      text: 'Talent Break DMG (force weakness break)',
      title: 'Talent Break DMG',
      content: `If the target is Weakness Broken while the Enhanced Basic ATK is being used, based on the number of Pocket Trickshot stacks, deals Break DMG to this target based on Boothill's Physical Break DMG. The max Toughness taken into account for this DMG cannot exceed 16 times the base Toughness Reduction of the Basic Attack "Skullcrush Spurs."`,
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: 'E1 DEF shred',
      title: 'E1 DEF shred',
      content: `When the battle starts, obtains 1 stack of Pocket Trickshot. When Boothill deals DMG, ignores 16% of the enemy target's DEF.`,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BeBuff',
      name: 'e2BeBuff',
      text: 'E2 BE buff',
      title: 'E2 BE buff',
      content: `When in Standoff and gaining Pocket Trickshot, recovers 1 Skill Point(s) and increases Break Effect by 30%, lasting for 2 turn(s). Can also trigger this effect when gaining Pocket Trickshot stacks that exceed the max limit. But cannot trigger repeatedly within one turn.`,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4TargetStandoffVulnerability',
      name: 'e4TargetStandoffVulnerability',
      text: 'E4 Skill vulnerability',
      title: 'E4 Skill vulnerability',
      content: `When the enemy target in the Standoff is attacked by Boothill, the DMG they receive additionally increases by 12%. When Boothill is attacked by the enemy target in the Standoff, the effect of him receiving increased DMG is offset by 12%.`,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6AdditionalBreakDmg',
      name: 'e6AdditionalBreakDmg',
      text: 'E6 Break DMG boost',
      title: 'E6 Break DMG boost',
      content: `When triggering the Talent's Break DMG, additionally deals Break DMG to the target equal to 40% of the original DMG multiplier and additionally deals Break DMG to adjacent targets equal to 70% of the original DMG multiplier.`,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = []

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Special case where we force the weakness break on if the talent break option is enabled
      if (r.talentBreakDmgScaling) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }

      x[Stats.BE] += (e >= 2 && r.e2BeBuff) ? 0.30 : 0
      x.DMG_TAKEN_MULTI += (r.standoffActive) ? standoffVulnerabilityBoost : 0

      x.DEF_SHRED += (e >= 1 && r.e1DefShred) ? 0.16 : 0
      x.DMG_TAKEN_MULTI += (e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0

      x.BASIC_SCALING += (r.standoffActive) ? basicEnhancedScaling : basicScaling
      x.BASIC_BREAK_EFFICIENCY_BOOST += (r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0

      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG += (r.standoffActive) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      // Since his toughness scaling is capped at 1600% x 30, we invert the toughness scaling on the original break dmg and apply the new scaling
      const newMaxToughness = Math.min(16.00 * 30, request.enemyMaxToughness)
      const inverseBreakToughnessMultiplier = 1 / (0.5 + request.enemyMaxToughness / 120)
      const newBreakToughnessMultiplier = (0.5 + newMaxToughness / 120)
      let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
      talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0
      x.BASIC_BREAK_DMG_MODIFIER += (r.talentBreakDmgScaling && r.standoffActive) ? inverseBreakToughnessMultiplier * newBreakToughnessMultiplier * talentBreakDmgScaling : 0

      x[Stats.CR] += (r.beToCritBoost) ? Math.min(0.30, 0.10 * x[Stats.BE]) : 0
      x[Stats.CD] += (r.beToCritBoost) ? Math.min(1.50, 0.50 * x[Stats.BE]) : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
