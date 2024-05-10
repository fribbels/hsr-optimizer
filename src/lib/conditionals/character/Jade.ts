import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated 05-05-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  // TODO: Ashblazing
  const basicScaling = basic(e, 0.90, 0.99)
  const skillScaling = skill(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedFollowUp',
      name: 'enhancedFollowUp',
      text: 'Enhanced Followup',
      title: 'Enhanced Followup',
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'pawnedAssetStacks',
      name: 'pawnedAssetStacks',
      text: 'Pawned Asset stacks',
      title: 'Pawned Asset stacks',
      content: betaUpdate,
      min: 0,
      max: 50,
    },
    {
      formItem: 'switch',
      id: 'e1FuaDmgBoost',
      name: 'e1FuaDmgBoost',
      text: 'E1 FUA DMG boost',
      title: 'E1 FUA DMG boost',
      content: betaUpdate,
      disabled: e < 1,
    },
    {

      formItem: 'switch',
      id: 'e2CrBuff',
      name: 'e2CrBuff',
      text: 'E2 CR buff',
      title: 'E2 CR buff',
      content: betaUpdate,
      disabled: e < 2,
    },
    {

      formItem: 'switch',
      id: 'e4DefShredBuff',
      name: 'e4DefShredBuff',
      text: 'E4 DEF shred buff',
      title: 'E4 DEF shred buff',
      content: betaUpdate,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6ResShredBuff',
      name: 'e6ResShredBuff',
      text: 'E6 RES shred buff',
      title: 'E6 RES shred buff',
      content: betaUpdate,
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'debtCollectorSpdBuff',
      name: 'debtCollectorSpdBuff',
      text: 'Debt Collector SPD buff',
      title: 'Debt Collector SPD buff',
      content: betaUpdate,
    },
  ]

  const defaults = {
    enhancedFollowUp: true,
    pawnedAssetStacks: 50,
    e1FuaDmgBoost: true,
    e2CrBuff: true,
    e4DefShredBuff: true,
    e6ResShredBuff: true,
  }

  const teammateDefaults = {
    debtCollectorSpdBuff: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.CD] += r.pawnedAssetStacks * pawnedAssetCdScaling
      x[Stats.ATK_P] += r.pawnedAssetStacks * 0.005
      x[Stats.CR] += (e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.enhancedFollowUp) ? ultFuaScalingBuff : 0

      x.FUA_BOOST += (e >= 1 && r.e1FuaDmgBoost) ? 0.20 : 0
      x.DEF_SHRED += (e >= 4 && r.e4DefShredBuff) ? 0.12 : 0
      x.QUANTUM_RES_PEN += (e >= 6 && r.e6ResShredBuff) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD] += (t.debtCollectorSpdBuff) ? 30 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      // x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK] // Removing since its not on her action
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.ATK]
    },
  }
}
