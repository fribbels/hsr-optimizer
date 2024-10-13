import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jade')
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

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[context.enemyCount]
      : unenhancedHitMultiByTargets[context.enemyCount]
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedFollowUp',
      name: 'enhancedFollowUp',
      text: t('Content.enhancedFollowUp.text'),
      title: t('Content.enhancedFollowUp.title'),
      content: t('Content.enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
    },
    {
      formItem: 'slider',
      id: 'pawnedAssetStacks',
      name: 'pawnedAssetStacks',
      text: t('Content.pawnedAssetStacks.text'),
      title: t('Content.pawnedAssetStacks.title'),
      content: t('Content.pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
      min: 0,
      max: 50,
    },
    {
      formItem: 'switch',
      id: 'e1FuaDmgBoost',
      name: 'e1FuaDmgBoost',
      text: t('Content.e1FuaDmgBoost.text'),
      title: t('Content.e1FuaDmgBoost.title'),
      content: t('Content.e1FuaDmgBoost.content'),
      disabled: e < 1,
    },
    {

      formItem: 'switch',
      id: 'e2CrBuff',
      name: 'e2CrBuff',
      text: t('Content.e2CrBuff.text'),
      title: t('Content.e2CrBuff.title'),
      content: t('Content.e2CrBuff.content'),
      disabled: e < 2,
    },
    {

      formItem: 'switch',
      id: 'e4DefShredBuff',
      name: 'e4DefShredBuff',
      text: t('Content.e4DefShredBuff.text'),
      title: t('Content.e4DefShredBuff.title'),
      content: t('Content.e4DefShredBuff.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6ResShredBuff',
      name: 'e6ResShredBuff',
      text: t('Content.e6ResShredBuff.text'),
      title: t('Content.e6ResShredBuff.title'),
      content: t('Content.e6ResShredBuff.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'debtCollectorSpdBuff',
      name: 'debtCollectorSpdBuff',
      text: t('TeammateContent.debtCollectorSpdBuff.text'),
      title: t('TeammateContent.debtCollectorSpdBuff.title'),
      content: t('TeammateContent.debtCollectorSpdBuff.content'),
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
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

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
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals

      x[Stats.SPD] += (t.debtCollectorSpdBuff) ? 30 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
