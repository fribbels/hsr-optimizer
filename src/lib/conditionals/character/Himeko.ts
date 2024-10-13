import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Himeko')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const ultScaling = ult(e, 2.30, 2.484)
  const fuaScaling = talent(e, 1.40, 1.54)
  const dotScaling = 0.30

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.40), // 0.168
    3: ASHBLAZING_ATK_STACK * (2 * 0.20 + 5 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.372
    5: ASHBLAZING_ATK_STACK * (3 * 0.20 + 8 * 0.20 + 8 * 0.20 + 8 * 0.40), // 0.42
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'targetBurned',
      name: 'targetBurned',
      text: t('Content.targetBurned.text'),
      title: t('Content.targetBurned.title'),
      content: t('Content.targetBurned.content'),
    },
    {
      formItem: 'switch',
      id: 'selfCurrentHp80Percent',
      name: 'selfCurrentHp80Percent',
      text: t('Content.selfCurrentHp80Percent.text'),
      title: t('Content.selfCurrentHp80Percent.title'),
      content: t('Content.selfCurrentHp80Percent.content'),
    },
    {
      formItem: 'switch',
      id: 'e1TalentSpdBuff',
      name: 'e1TalentSpdBuff',
      text: t('Content.e1TalentSpdBuff.text'),
      title: t('Content.e1TalentSpdBuff.title'),
      content: t('Content.e1TalentSpdBuff.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2EnemyHp50DmgBoost',
      name: 'e2EnemyHp50DmgBoost',
      text: t('Content.e2EnemyHp50DmgBoost.text'),
      title: t('Content.e2EnemyHp50DmgBoost.title'),
      content: t('Content.e2EnemyHp50DmgBoost.content'),
      disabled: e < 2,
    },
    {
      formItem: 'slider',
      id: 'e6UltExtraHits',
      name: 'e6UltExtraHits',
      text: t('Content.e6UltExtraHits.text'),
      title: t('Content.e6UltExtraHits.title'),
      content: t('Content.e6UltExtraHits.content'),
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      targetBurned: true,
      selfCurrentHp80Percent: true,
      e1TalentSpdBuff: false,
      e6UltExtraHits: 2,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.CR] += (r.selfCurrentHp80Percent) ? 0.15 : 0
      x[Stats.SPD_P] += (e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0
      x.FUA_SCALING += fuaScaling
      x.DOT_SCALING += dotScaling

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, 0.20, (r.targetBurned))
      x.ELEMENTAL_DMG += (e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30

      x.DOT_CHANCE = 0.50

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByTargets[context.enemyCount])
    },
  }
}
