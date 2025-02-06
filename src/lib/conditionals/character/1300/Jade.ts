import { ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.enhancedFollowUp
      ? enhancedHitMultiByTargets[context.enemyCount]
      : unenhancedHitMultiByTargets[context.enemyCount]
  }

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

  const content: ContentDefinition<typeof defaults> = {
    enhancedFollowUp: {
      id: 'enhancedFollowUp',
      formItem: 'switch',
      text: t('Content.enhancedFollowUp.text'),
      content: t('Content.enhancedFollowUp.content', { ultFuaScalingBuff: TsUtils.precisionRound(100 * ultFuaScalingBuff) }),
    },
    pawnedAssetStacks: {
      id: 'pawnedAssetStacks',
      formItem: 'slider',
      text: t('Content.pawnedAssetStacks.text'),
      content: t('Content.pawnedAssetStacks.content', { pawnedAssetCdScaling: TsUtils.precisionRound(100 * pawnedAssetCdScaling) }),
      min: 0,
      max: 50,
    },
    e1FuaDmgBoost: {
      id: 'e1FuaDmgBoost',
      formItem: 'switch',
      text: t('Content.e1FuaDmgBoost.text'),
      content: t('Content.e1FuaDmgBoost.content'),
      disabled: e < 1,
    },
    e2CrBuff: {
      id: 'e2CrBuff',
      formItem: 'switch',
      text: t('Content.e2CrBuff.text'),
      content: t('Content.e2CrBuff.content'),
      disabled: e < 2,
    },
    e4DefShredBuff: {
      id: 'e4DefShredBuff',
      formItem: 'switch',
      text: t('Content.e4DefShredBuff.text'),
      content: t('Content.e4DefShredBuff.content'),
      disabled: e < 4,
    },
    e6ResShredBuff: {
      id: 'e6ResShredBuff',
      formItem: 'switch',
      text: t('Content.e6ResShredBuff.text'),
      content: t('Content.e6ResShredBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    debtCollectorSpdBuff: {
      id: 'debtCollectorSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.debtCollectorSpdBuff.text'),
      content: t('TeammateContent.debtCollectorSpdBuff.content'),
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.pawnedAssetStacks * pawnedAssetCdScaling, Source.NONE)
      x.ATK_P.buff(r.pawnedAssetStacks * 0.005, Source.NONE)
      x.CR.buff((e >= 2 && r.e2CrBuff && r.pawnedAssetStacks >= 15) ? 0.18 : 0, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling, Source.NONE)
      x.FUA_SCALING.buff((r.enhancedFollowUp) ? ultFuaScalingBuff : 0, Source.NONE)

      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1 && r.e1FuaDmgBoost) ? 0.32 : 0, Source.NONE)
      x.DEF_PEN.buff((e >= 4 && r.e4DefShredBuff) ? 0.12 : 0, Source.NONE)
      x.QUANTUM_RES_PEN.buff((e >= 6 && r.e6ResShredBuff) ? 0.20 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffSingle((t.debtCollectorSpdBuff) ? 30 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
