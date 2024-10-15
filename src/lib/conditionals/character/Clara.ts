import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Clara')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: t('Content.ultBuff.text'),
    title: t('Content.ultBuff.title'),
    content: t('Content.ultBuff.content', { ultFuaExtraScaling: TsUtils.precisionRound(100 * ultFuaExtraScaling) }),
  }, {
    formItem: 'switch',
    id: 'talentEnemyMarked',
    name: 'talentEnemyMarked',
    text: t('Content.talentEnemyMarked.text'),
    title: t('Content.talentEnemyMarked.title'),
    content: t('Content.talentEnemyMarked.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
  }, {
    formItem: 'switch',
    id: 'e2UltAtkBuff',
    name: 'e2UltAtkBuff',
    text: t('Content.e2UltAtkBuff.text'),
    title: t('Content.e2UltAtkBuff.title'),
    content: t('Content.e2UltAtkBuff.content'),
    disabled: e < 2,
  }, {
    formItem: 'switch',
    id: 'e4DmgReductionBuff',
    name: 'e4DmgReductionBuff',
    text: t('Content.e4DmgReductionBuff.text'),
    title: t('Content.e4DmgReductionBuff.title'),
    content: t('Content.e4DmgReductionBuff.content'),
    disabled: e < 4,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultBuff: true,
      talentEnemyMarked: true,
      e2UltAtkBuff: true,
      e4DmgReductionBuff: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.ATK_P] += (e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += r.talentEnemyMarked ? skillScaling : 0

      x.FUA_SCALING += fuaScaling
      x.FUA_SCALING += r.ultBuff ? ultFuaExtraScaling : 0

      // Boost
      x.DMG_RED_MULTI *= (1 - 0.10)
      x.DMG_RED_MULTI *= r.ultBuff ? (1 - ultDmgReductionValue) : 1
      x.DMG_RED_MULTI *= (e >= 4 && r.e4DmgReductionBuff) ? (1 - 0.30) : 1
      buffAbilityDmg(x, FUA_TYPE, 0.30)

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      standardFuaAtkFinalizer(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
  }
}
