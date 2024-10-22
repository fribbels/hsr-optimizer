import { ASHBLAZING_ATK_STACK, BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import { buffStat, conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Lingsha')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.80, 0.88)
  const ultScaling = ult(e, 1.50, 1.65)
  const ultBreakVulnerability = ult(e, 0.25, 0.27)
  const fuaScaling = talent(e, 0.75, 0.825)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 2 + 3 * 1 / 2),
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 2 + 4 * 1 / 2),
  }

  const defaults = {
    beConversion: true,
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    befogState: true,
    e1DefShred: true,
    e2BeBuff: true,
    e6ResShred: true,
  }

  type LingshaConditionalConstants = typeof defaults
  type LingshaTeammateConditionalConstants = typeof teammateDefaults

  const content: (ContentItem & { id: keyof LingshaConditionalConstants })[] = [
    {
      formItem: 'switch',
      id: 'beConversion',
      name: 'beConversion',
      text: t('Content.beConversion.text'),
      title: t('Content.beConversion.title'),
      content: t('Content.beConversion.content'),
    },
    {
      formItem: 'switch',
      id: 'befogState',
      name: 'befogState',
      text: t('Content.befogState.text'),
      title: t('Content.befogState.title'),
      content: t('Content.befogState.content', { BefogVulnerability: TsUtils.precisionRound(100 * ultBreakVulnerability) }),
    },
    {
      formItem: 'switch',
      id: 'e1DefShred',
      name: 'e1DefShred',
      text: t('Content.e1DefShred.text'),
      title: t('Content.e1DefShred.title'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    {
      formItem: 'switch',
      id: 'e2BeBuff',
      name: 'e2BeBuff',
      text: t('Content.e2BeBuff.text'),
      title: t('Content.e2BeBuff.title'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e6ResShred',
      name: 'e6ResShred',
      text: t('Content.e6ResShred.text'),
      title: t('Content.e6ResShred.title'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'befogState'),
    findContentId(content, 'e1DefShred'),
    findContentId(content, 'e2BeBuff'),
    findContentId(content, 'e6ResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.SUMMONS = 1
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.FUA_SCALING += fuaScaling * 2
      x.ULT_SCALING += ultScaling

      x.BREAK_EFFICIENCY_BOOST += (e >= 1) ? 0.50 : 0
      x.FUA_SCALING += (e >= 6 && r.e6ResShred) ? 0.50 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += 30 * 2
      x.FUA_TOUGHNESS_DMG += (e >= 6) ? 15 : 0

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      if (x.ENEMY_WEAKNESS_BROKEN) {
        x.DEF_PEN += (e >= 1 && m.e1DefShred) ? 0.20 : 0
      }

      buffAbilityVulnerability(x, BREAK_TYPE, ultBreakVulnerability, (m.befogState))

      x[Stats.BE] += (e >= 2 && m.e2BeBuff) ? 0.40 : 0
      x.RES_PEN += (e >= 6 && m.e6ResShred) ? 0.20 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByTargets[context.enemyCount])
    },
    dynamicConditionals: [LingshaConversionConditional],
  }
}

const LingshaConversionConditional: DynamicConditional = {
  id: 'LingshaConversionConditional',
  type: ConditionalType.ABILITY,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
    return true
  },
  effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals
    if (!r.beConversion) {
      return
    }

    const stateValue = action.conditionalState[this.id] || 0
    const buffValueAtk = Math.min(0.50, 0.25 * x[Stats.BE]) * context.baseATK
    const buffValueOhb = Math.min(0.20, 0.10 * x[Stats.BE])

    const stateBuffValueAtk = Math.min(0.50, 0.25 * stateValue) * context.baseATK
    const stateBuffValueOhb = Math.min(0.20, 0.10 * stateValue)

    action.conditionalState[this.id] = x[Stats.BE]

    const finalBuffAtk = buffValueAtk - (stateValue ? stateBuffValueAtk : 0)
    const finalBuffOhb = buffValueOhb - (stateValue ? stateBuffValueOhb : 0)

    buffStat(x, Stats.ATK, finalBuffAtk, action, context)
    buffStat(x, Stats.OHB, finalBuffOhb, action, context)
  },
  gpu: function (action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals

    return conditionalWgslWrapper(this, `
if (${wgslFalse(r.beConversion)}) {
  return;
}

let stateValue: f32 = (*p_state).LingshaConversionConditional;

let buffValueAtk = min(0.50, 0.25 * x.BE) * baseATK;
let buffValueOhb = min(0.20, 0.10 * x.BE);

let stateBuffValueAtk = min(0.50, 0.25 * stateValue) * baseATK;
let stateBuffValueOhb = min(0.20, 0.10 * stateValue);

(*p_state).LingshaConversionConditional = (*p_x).BE;

let finalBuffAtk = buffValueAtk - select(0, stateBuffValueAtk, stateValue > 0);
let finalBuffOhb = buffValueOhb - select(0, stateBuffValueOhb, stateValue > 0);

buffDynamicATK(finalBuffAtk, p_x, p_state);
buffDynamicOHB(finalBuffOhb, p_x, p_state);
    `)
  },
}
