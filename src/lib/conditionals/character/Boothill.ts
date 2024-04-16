import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants.ts'

const betaUpdate = 'All calculations are subject to change. Last updated 04-15-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const standoffDmgBoost = skill(e, 0.30, 0.33)

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
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'pocketTrickshotStacks',
      name: 'pocketTrickshotStacks',
      text: 'Pocket Trickshots',
      title: 'Pocket Trickshots',
      content: betaUpdate,
      min: 0,
      max: 3,
    },
    {
      formItem: 'switch',
      id: 'beToCritBoost',
      name: 'beToCritBoost',
      text: 'BE to CR / CD boost',
      title: 'BE to CR / CD boost',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'talentBreakDmgScaling',
      name: 'talentBreakDmgScaling',
      text: 'Talent break DMG (forces weakness break)',
      title: 'Talent break DMG',
      content: betaUpdate,
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: 'E1 DEF shred',
      title: 'E1 DEF shred',
      content: betaUpdate,
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BeBuff',
      name: 'e2BeBuff',
      text: 'E2 BE buff',
      title: 'E2 BE buff',
      content: betaUpdate,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4TargetStandoffVulnerability',
      name: 'e4TargetStandoffVulnerability',
      text: 'E4 Standoff vulnerability',
      title: 'E4 Standoff vulnerability',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6AdditionalBreakDmg',
      name: 'e6AdditionalBreakDmg',
      text: 'E6 Break DMG boost',
      title: 'E6 Break DMG boost',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
  ]

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
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.BE] += (e >= 2 && r.e2BeBuff) ? 0.30 : 0
      x.ELEMENTAL_DMG += (r.standoffActive) ? standoffDmgBoost : 0

      x.DEF_SHRED += (e >= 1 && r.e1DefShred) ? 0.16 : 0
      x.DMG_TAKEN_MULTI += (e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0

      x.BASIC_SCALING += (r.standoffActive) ? basicEnhancedScaling : basicScaling
      x.BREAK_EFFICIENCY_BOOST += r.pocketTrickshotStacks * 0.50

      x.ULT_SCALING += ultScaling

      // Special case where we force the weakness break on if the talent break option is enabled
      if (r.talentBreakDmgScaling) {
        request.enemyWeaknessBroken = true
      }

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
