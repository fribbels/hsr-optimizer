import { ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, gpuStandardFuaAtkFinalizer, standardAdditionalDmgAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Herta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1013')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.40, 0.43)

  function getHitMultiByTargetsAndHits(hits: number, context: OptimizerContext) {
    const div = 1 / hits

    if (context.enemyCount == 1) {
      let stacks = 1
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 1)
      }
      return multi
    }

    if (context.enemyCount == 3) {
      let stacks = 2
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 3)
      }
      return multi
    }

    if (context.enemyCount == 5) {
      let stacks = 3
      let multi = 0
      for (let i = 0; i < hits; i++) {
        multi += div * stacks
        stacks = Math.min(8, stacks + 5)
      }
      return multi
    }

    return 1
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    const hitMultiStacks = getHitMultiByTargetsAndHits(r.fuaStacks, context)
    const hitMultiByTargets: NumberToNumberMap = {
      1: ASHBLAZING_ATK_STACK * hitMultiStacks,
      3: ASHBLAZING_ATK_STACK * hitMultiStacks,
      5: ASHBLAZING_ATK_STACK * hitMultiStacks,
    }

    return hitMultiByTargets[context.enemyCount]
  }

  const defaults = {
    fuaStacks: 5,
    techniqueBuff: false,
    targetFrozen: true,
    e2TalentCritStacks: 5,
    e6UltAtkBuff: true,
    enemyHpGte50: true,
    enemyHpLte50: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaStacks: {
      id: 'fuaStacks',
      formItem: 'slider',
      text: t('Content.fuaStacks.text'),
      content: t('Content.fuaStacks.content'),
      min: 1,
      max: 5,
    },
    targetFrozen: {
      id: 'targetFrozen',
      formItem: 'switch',
      text: t('Content.targetFrozen.text'),
      content: t('Content.targetFrozen.content'),
    },
    enemyHpGte50: {
      id: 'enemyHpGte50',
      formItem: 'switch',
      text: t('Content.enemyHpGte50.text'),
      content: t('Content.enemyHpGte50.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
    },
    enemyHpLte50: {
      id: 'enemyHpLte50',
      formItem: 'switch',
      text: t('Content.enemyHpLte50.text'),
      content: t('Content.enemyHpLte50.content'),
      disabled: e < 1,
    },
    e2TalentCritStacks: {
      id: 'e2TalentCritStacks',
      formItem: 'slider',
      text: t('Content.e2TalentCritStacks.text'),
      content: t('Content.e2TalentCritStacks.content'),
      min: 0,
      max: 5,
      disabled: e < 2,
    },
    e6UltAtkBuff: {
      id: 'e6UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e6UltAtkBuff.text'),
      content: t('Content.e6UltAtkBuff.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.techniqueBuff) ? 0.40 : 0, SOURCE_TECHNIQUE)
      x.CR.buff((e >= 2) ? r.e2TalentCritStacks * 0.03 : 0, SOURCE_E2)
      x.ATK_P.buff((e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0, SOURCE_E6)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((e >= 1 && r.enemyHpLte50) ? 0.40 : 0, SOURCE_E1)
      x.SKILL_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_SCALING.buff(fuaScaling * r.fuaStacks, SOURCE_TALENT)

      buffAbilityDmg(x, SKILL_DMG_TYPE, (r.enemyHpGte50) ? 0.20 : 0, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.targetFrozen) ? 0.20 : 0, SOURCE_ULT)
      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 4) ? 0.10 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(30, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(60, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(15 * r.fuaStacks, SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context)) + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
