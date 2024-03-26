import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

const betaUpdate = 'All calculations are subject to change. Last updated 03-26-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const standoffDmgBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 1.80, 1.98)
  const basicExtraHitScaling = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 4.00, 4.32)

  // const talentBreakDmgScaling = talent(e, 0.56, 0.616) // TODO

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
      id: 'talentBreakDmg',
      name: 'talentBreakDmg',
      text: 'Talent break DMG (WIP)',
      title: 'Talent break DMG (WIP)',
      content: betaUpdate,
      disabled: true,
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
  ]

  const teammateContent: ContentItem[] = [
  ]

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    beToCritBoost: true,
    talentBreakDmg: true,
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

      x.BASIC_SCALING += (r.standoffActive) ? basicEnhancedScaling + r.pocketTrickshotStacks * basicExtraHitScaling : basicScaling
      x.ULT_SCALING += ultScaling

      x[Stats.BE] += (e >= 2 && r.e2BeBuff) ? 0.30 : 0
      x.DEF_SHRED += (e >= 1 && r.e1DefShred) ? 0.16 : 0
      x.ELEMENTAL_DMG += (r.standoffActive) ? standoffDmgBoost : 0

      x.DMG_TAKEN_MULTI += (e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c['x']

      x[Stats.CR] += (r.beToCritBoost) ? Math.min(0.30, 0.10 * x[Stats.BE]) : 0
      x[Stats.CD] += (r.beToCritBoost) ? Math.min(1.50, 0.50 * x[Stats.BE]) : 0

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
