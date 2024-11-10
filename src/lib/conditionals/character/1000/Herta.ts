import { ASHBLAZING_ATK_STACK, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditionalsController } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Herta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

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
    const r: Conditionals<typeof content> = action.characterConditionals

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
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x.ATK_P.buff((r.techniqueBuff) ? 0.40 : 0, Source.NONE)
      x.CR.buff((e >= 2) ? r.e2TalentCritStacks * 0.03 : 0, Source.NONE)
      x.ATK_P.buff((e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.BASIC_SCALING.buff((e >= 1 && r.enemyHpLte50) ? 0.40 : 0, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff(fuaScaling * r.fuaStacks, Source.NONE)

      buffAbilityDmg(x, SKILL_TYPE, (r.enemyHpGte50) ? 0.20 : 0, Source.NONE)

      // Boost
      buffAbilityDmg(x, ULT_TYPE, (r.targetFrozen) ? 0.20 : 0, Source.NONE)
      buffAbilityDmg(x, FUA_TYPE, (e >= 4) ? 0.10 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(15 * r.fuaStacks, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
