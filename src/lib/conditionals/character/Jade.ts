import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, precisionRound, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 0.90, 0.99)
  const skillScaling = skill(e, 0.25, 0.27)
  const ultScaling = ult(e, 2.40, 2.64)
  const ultFuaScalingBuff = ult(e, 0.80, 0.88)
  const fuaScaling = talent(e, 1.20, 1.32)
  const pawnedAssetCdScaling = talent(e, 0.024, 0.0264)

  const unenhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25), // 0.15
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.345
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25), // 0.405
  }

  const enhancedHitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.60), // 0.24
    3: ASHBLAZING_ATK_STACK * (2 * 0.10 + 5 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.426
    5: ASHBLAZING_ATK_STACK * (3 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.10 + 8 * 0.60), // 0.45
  }

  function getHitMulti(request: Form) {
    const r = request.characterConditionals
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[request.enemyCount]
      : unenhancedHitMultiByTargets[request.enemyCount]
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedFollowUp',
      name: 'enhancedFollowUp',
      text: 'Enhanced Followup',
      title: 'Enhanced Followup',
      content: `Jade enhances her Talent's follow-up attack, increasing its DMG multiplier 
      by ${precisionRound(ultFuaScalingBuff * 100)}%.`,
    },
    {
      formItem: 'slider',
      id: 'pawnedAssetStacks',
      name: 'pawnedAssetStacks',
      text: 'Pawned Asset stacks',
      title: 'Pawned Asset stacks',
      content: `When launching her Talent's follow-up attack, Jade immediately gains 5 stack(s) of Pawned Asset, 
      with each stack increasing CRIT DMG by ${precisionRound(pawnedAssetCdScaling * 100)}%, stacking up to 50 times. 
      Each Pawned Asset stack from the Talent additionally increases Jade's ATK by 0.5%.`,
      min: 0,
      max: 50,
    },
    {
      formItem: 'switch',
      id: 'e1FuaDmgBoost',
      name: 'e1FuaDmgBoost',
      text: 'E1 FUA DMG boost',
      title: 'E1 FUA DMG boost',
      content: `The follow-up attack DMG from Jade's Talent increases by 32%. After the Debt Collector character 
      attacks and the number of the enemy target(s) hit is either 2 or 1, Jade additionally gains 1 or 2 point(s) of 
      Charge respectively.`,
      disabled: e < 1,
    },
    {

      formItem: 'switch',
      id: 'e2CrBuff',
      name: 'e2CrBuff',
      text: 'E2 CR buff',
      title: 'E2 CR buff',
      content: `When there are 15 stacks of Pawned Asset, Jade's CRIT Rate increases by 18%.`,
      disabled: e < 2,
    },
    {

      formItem: 'switch',
      id: 'e4DefShredBuff',
      name: 'e4DefShredBuff',
      text: 'E4 DEF shred buff',
      title: 'E4 DEF shred buff',
      content: `When using Ultimate, enables the DMG dealt by Jade to ignore 12% of enemy targets' DEF, lasting 
      for 3 turn(s).`,
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6ResShredBuff',
      name: 'e6ResShredBuff',
      text: 'E6 RES shred buff',
      title: 'E6 RES shred buff',
      content: `When the Debt Collector character exists on the field, Jade's Quantum RES PEN increases by 20%, 
      and Jade gains the Debt Collector state.`,
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
      content: `Makes a single target ally become the Debt Collector and increases their SPD by 30, lasting for 3 turn(s).`,
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
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      x[Stats.CD] += r.pawnedAssetStacks * pawnedAssetCdScaling
      x[Stats.ATK_P] += r.pawnedAssetStacks * 0.005
      x[Stats.CR] += (e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += (r.enhancedFollowUp) ? ultFuaScalingBuff : 0

      buffAbilityDmg(x, FUA_TYPE, 0.32, (e >= 1 && r.e1FuaDmgBoost))
      x.DEF_PEN += (e >= 4 && r.e4DefShredBuff) ? 0.12 : 0
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
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, getHitMulti(request))
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(request))
    },
  }
}
