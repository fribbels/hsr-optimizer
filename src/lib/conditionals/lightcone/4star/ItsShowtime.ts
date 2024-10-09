import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesAtkBuff = [0.20, 0.24, 0.28, 0.32, 0.36]
  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.ItsShowtime.Content')
    return [{
      lc: true,
      id: 'trickStacks',
      name: 'trickStacks',
      formItem: 'slider',
      text: t('trickStacks.text'),
      title: t('trickStacks.title'),
      content: t('trickStacks.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]), AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]) }),
      min: 0,
      max: 3,
    }]
  })()

  return {
    content: () => content,
    defaults: () => ({
      trickStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

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
        condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          return x[Stats.EHR] >= 0.80
        },
        effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.characterConditionals

          const stateValue = params.conditionalState[this.id] || 0
          const buffValue = sValuesAtkBuff[s] * request.baseAtk

          params.conditionalState[this.id] = buffValue
          buffStat(x, request, params, Stats.ATK, buffValue - stateValue)
        },
        gpu: function (request: Form, params: OptimizerParams) {
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
