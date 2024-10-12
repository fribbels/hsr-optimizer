import { Stats } from 'lib/constants'

import { ASHBLAZING_ATK_STACK, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yanqing')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuffActive',
    name: 'ultBuffActive',
    text: t('Content.ultBuffActive.text'),
    title: t('Content.ultBuffActive.title'),
    content: t('Content.ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
  }, {
    formItem: 'switch',
    id: 'soulsteelBuffActive',
    name: 'soulsteelBuffActive',
    text: t('Content.soulsteelBuffActive.text'),
    title: t('Content.soulsteelBuffActive.title'),
    content: t('Content.soulsteelBuffActive.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue), talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue), ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
  }, {
    formItem: 'switch',
    id: 'critSpdBuff',
    name: 'critSpdBuff',
    text: t('Content.critSpdBuff.text'),
    title: t('Content.critSpdBuff.title'),
    content: t('Content.critSpdBuff.content'),
  }, {
    formItem: 'switch',
    id: 'e1TargetFrozen',
    name: 'e1TargetFrozen',
    text: t('Content.e1TargetFrozen.text'),
    title: t('Content.e1TargetFrozen.title'),
    content: t('Content.e1TargetFrozen.content'),
    disabled: (e < 1),
  }, {
    formItem: 'switch',
    id: 'e4CurrentHp80',
    name: 'e4CurrentHp80',
    text: t('Content.e4CurrentHp80.text'),
    title: t('Content.e4CurrentHp80.title'),
    content: t('Content.e4CurrentHp80.content'),
    disabled: (e < 4),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuffActive: true,
      soulsteelBuffActive: true,
      critSpdBuff: true,
      e1TargetFrozen: true,
      e4CurrentHp80: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.CR] += (r.ultBuffActive) ? 0.60 : 0
      x[Stats.CD] += (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0
      x[Stats.CR] += (r.soulsteelBuffActive) ? talentCrBuffValue : 0
      x[Stats.CD] += (r.soulsteelBuffActive) ? talentCdBuffValue : 0
      x[Stats.RES] += (r.soulsteelBuffActive) ? 0.20 : 0
      x[Stats.SPD_P] += (r.critSpdBuff) ? 0.10 : 0
      x[Stats.ERR] += (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      x.BASIC_SCALING += (context.enemyElementalWeak) ? 0.30 : 0
      x.SKILL_SCALING += (context.enemyElementalWeak) ? 0.30 : 0
      x.ULT_SCALING += (context.enemyElementalWeak) ? 0.30 : 0
      x.FUA_SCALING += (context.enemyElementalWeak) ? 0.30 : 0

      x.BASIC_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.SKILL_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.ULT_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0
      x.FUA_SCALING += (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Boost
      x.ICE_RES_PEN += (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
  }
}
