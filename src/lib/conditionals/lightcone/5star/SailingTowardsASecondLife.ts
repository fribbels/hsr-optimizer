import { BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SailingTowardsASecondLife')

  const sValuesSpdBuff = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDefShred = [0.20, 0.23, 0.26, 0.29, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'breakDmgDefShred',
      formItem: 'switch',
      text: t('Content.breakDmgDefShred.text'),
      content: t('Content.breakDmgDefShred.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
    },
    {
      lc: true,
      id: 'spdBuffConditional',
      formItem: 'switch',
      text: t('Content.spdBuffConditional.text'),
      content: t('Content.spdBuffConditional.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      breakDmgDefShred: true,
      spdBuffConditional: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals
      buffAbilityDefPen(x, BREAK_TYPE, sValuesDefShred[s], (r.breakDmgDefShred))
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
    },
    dynamicConditionals: [
      {
        id: 'SailingTowardsASecondLifeConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.BE],
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals

          return r.spdBuffConditional && x[Stats.BE] >= 1.50
        },
        effect: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
          buffStat(x, Stats.SPD, (sValuesSpdBuff[s]) * context.baseSPD, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (
  (*p_state).SailingTowardsASecondLifeConditional == 0.0 &&
  (*p_x).BE >= 1.50
) {
  (*p_state).SailingTowardsASecondLifeConditional = 1.0;
  buffDynamicSPD_P(${sValuesSpdBuff[s]}, p_x, p_state);
}
    `)
        },
      },
    ],
  }
}
