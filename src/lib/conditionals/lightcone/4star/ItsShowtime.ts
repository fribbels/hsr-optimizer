import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ItsShowtime')
  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesAtkBuff = [0.20, 0.24, 0.28, 0.32, 0.36]
  const content: ContentItem[] = [{
    lc: true,
    id: 'trickStacks',
    name: 'trickStacks',
    formItem: 'slider',
    text: t('Content.trickStacks.text'),
    title: t('Content.trickStacks.title'),
    content: t('Content.trickStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]), AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]) }),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      trickStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += r.trickStacks * sValuesDmg[s]
    },
    finalizeCalculations: () => {
    },
    dynamicConditionals: [
      {
        id: 'ItsShowtimeConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        condition: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          return x[Stats.EHR] >= 0.80
        },
        effect: function (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = sValuesAtkBuff[s] * context.baseATK

          action.conditionalState[this.id] = buffValue
          buffStat(x, Stats.ATK, buffValue - stateValue, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (x.EHR < 0.80) {
  return;
}

let stateValue: f32 = (*p_state).ItsShowtimeConversionConditional;
let buffValue: f32 = ${sValuesAtkBuff[s]};

(*p_state).ItsShowtimeConversionConditional = buffValue;
buffDynamicATK_P(buffValue - stateValue, p_x, p_state);
    `)
        },
      },
    ],
  }
}
