import { ASHBLAZING_ATK_STACK, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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

  const defaults = {
    targetBurned: true,
    selfCurrentHp80Percent: true,
    e1TalentSpdBuff: false,
    e2EnemyHp50DmgBoost: true,
    e6UltExtraHits: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content'),
    },
    selfCurrentHp80Percent: {
      id: 'selfCurrentHp80Percent',
      formItem: 'switch',
      text: t('Content.selfCurrentHp80Percent.text'),
      content: t('Content.selfCurrentHp80Percent.content'),
    },
    e1TalentSpdBuff: {
      id: 'e1TalentSpdBuff',
      formItem: 'switch',
      text: t('Content.e1TalentSpdBuff.text'),
      content: t('Content.e1TalentSpdBuff.content'),
      disabled: e < 1,
    },
    e2EnemyHp50DmgBoost: {
      id: 'e2EnemyHp50DmgBoost',
      formItem: 'switch',
      text: t('Content.e2EnemyHp50DmgBoost.text'),
      content: t('Content.e2EnemyHp50DmgBoost.content'),
      disabled: e < 2,
    },
    e6UltExtraHits: {
      id: 'e6UltExtraHits',
      formItem: 'slider',
      text: t('Content.e6UltExtraHits.text'),
      content: t('Content.e6UltExtraHits.content'),
      min: 0,
      max: 2,
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((r.selfCurrentHp80Percent) ? 0.15 : 0, Source.NONE)
      x.SPD_P.buff((e >= 1 && r.e1TalentSpdBuff) ? 0.20 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.ULT_SCALING.buff((e >= 6) ? r.e6UltExtraHits * ultScaling * 0.40 : 0, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling, Source.NONE)
      x.DOT_SCALING.buff(dotScaling, Source.NONE)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (r.targetBurned) ? 0.20 : 0, Source.NONE)
      x.ELEMENTAL_DMG.buff((e >= 2 && r.e2EnemyHp50DmgBoost) ? 0.15 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(30, Source.NONE)

      x.DOT_CHANCE.set(0.50, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByTargets[context.enemyCount])
    },
  }
}
