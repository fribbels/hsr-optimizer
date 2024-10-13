import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
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
    const r = action.characterConditionals

    const hitMultiStacks = getHitMultiByTargetsAndHits(r.fuaStacks, context)
    const hitMultiByTargets: NumberToNumberMap = {
      1: ASHBLAZING_ATK_STACK * hitMultiStacks,
      3: ASHBLAZING_ATK_STACK * hitMultiStacks,
      5: ASHBLAZING_ATK_STACK * hitMultiStacks,
    }

    return hitMultiByTargets[context.enemyCount]
  }

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'fuaStacks',
      name: 'fuaStacks',
      text: t('Content.fuaStacks.text'),
      title: t('Content.fuaStacks.title'),
      content: t('Content.fuaStacks.content'),
      min: 1,
      max: 5,
    },
    {
      formItem: 'switch',
      id: 'targetFrozen',
      name: 'targetFrozen',
      text: t('Content.targetFrozen.text'),
      title: t('Content.targetFrozen.title'),
      content: t('Content.targetFrozen.content'),
    },
    {
      formItem: 'switch',
      id: 'enemyHpGte50',
      name: 'enemyHpGte50',
      text: t('Content.enemyHpGte50.text'),
      title: t('Content.enemyHpGte50.title'),
      content: t('Content.enemyHpGte50.content'),
    },
    {
      formItem: 'switch',
      id: 'techniqueBuff',
      name: 'techniqueBuff',
      text: t('Content.techniqueBuff.text'),
      title: t('Content.techniqueBuff.title'),
      content: t('Content.techniqueBuff.content'),
    },
    {
      formItem: 'switch',
      id: 'enemyHpLte50',
      name: 'enemyHpLte50',
      text: t('Content.enemyHpLte50.text'),
      title: t('Content.enemyHpLte50.title'),
      content: t('Content.enemyHpLte50.content'),
      disabled: e < 1,
    },
    {
      formItem: 'slider',
      id: 'e2TalentCritStacks',
      name: 'e2TalentCritStacks',
      text: t('Content.e2TalentCritStacks.text'),
      title: t('Content.e2TalentCritStacks.title'),
      content: t('Content.e2TalentCritStacks.content'),
      min: 0,
      max: 5,
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6UltAtkBuff',
      name: 'e6UltAtkBuff',
      text: t('Content.e6UltAtkBuff.text'),
      title: t('Content.e6UltAtkBuff.title'),
      content: t('Content.e6UltAtkBuff.content'),
      disabled: e < 6,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      fuaStacks: 5,
      techniqueBuff: false,
      targetFrozen: true,
      e2TalentCritStacks: 5,
      e6UltAtkBuff: true,
      enemyHpGte50: true,
      enemyHpLte50: false,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.ATK_P] += (r.techniqueBuff) ? 0.40 : 0
      x[Stats.CR] += (e >= 2) ? r.e2TalentCritStacks * 0.03 : 0
      x[Stats.ATK_P] += (e >= 6 && r.e6UltAtkBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += (e >= 1 && r.enemyHpLte50) ? 0.40 : 0
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling * r.fuaStacks

      buffAbilityDmg(x, SKILL_TYPE, 0.20, (r.enemyHpGte50))

      // Boost
      buffAbilityDmg(x, ULT_TYPE, 0.20, (r.targetFrozen))
      buffAbilityDmg(x, FUA_TYPE, 0.10, (e >= 4))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 15 // TODO: * spin count

      return x
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuConstants: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      return {
        HertaFuaStacks: r.fuaStacks,
      }
    },
    gpuFinalizeCalculations: (context: OptimizerContext) => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;

let constants: ConditionalConstants = actions[(*p_state).actionIndex].constants;

switch i32(constants.HertaFuaStacks) {
  case 1: {
    switch enemyCount {
      case 1: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 1)); }
      case 3: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 2)); }
      case 5: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 3)); }
      default: { }
    }
  }
  case 2: {
    switch enemyCount {
      case 1: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 1.5)); }
      case 3: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 3.5)); }
      case 5: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 5.5)); }
      default: { }
    }
  }
  case 3: {
    switch enemyCount {
      case 1: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 2)); }
      case 3: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 5)); }
      case 5: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 6.3333333)); }
      default: { }
    }
  }
  case 4: {
    switch enemyCount {
      case 1: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 2.5)); }
      case 3: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 5.75)); }
      case 5: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 6.75)); }
      default: { }
    }
  }
  case 5: {
    switch enemyCount {
      case 1: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 3)); }
      case 3: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 6.2)); }
      case 5: { x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, 0.06 * 7)); }
      default: { }
    }
  }
  default: {
  
  }
}
`
    },
  }
}
