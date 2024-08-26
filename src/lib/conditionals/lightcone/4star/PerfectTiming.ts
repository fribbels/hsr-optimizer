import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'
import { Form } from 'types/Form'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.33, 0.36, 0.39, 0.42, 0.45]
  const sMaxValues = [0.15, 0.18, 0.21, 0.24, 0.27]
  const lcRanks = {
    id: '21014',
    skill: 'Refraction of Sightline',
    desc: "Increases the wearer's Outgoing Healing by an amount that is equal to #2[i]% of Effect RES. Outgoing Healing can be increased this way by up to #3[i]%.",
    params: [
      [0.16, 0.33, 0.15],
      [0.2, 0.36, 0.18],
      [0.24, 0.39, 0.21],
      [0.28, 0.42, 0.24],
      [0.32, 0.45, 0.27],
    ],
    properties: [
      [{ type: 'StatusResistanceBase', value: 0.16 }],
      [{ type: 'StatusResistanceBase', value: 0.2 }],
      [{ type: 'StatusResistanceBase', value: 0.24 }],
      [{ type: 'StatusResistanceBase', value: 0.28 }],
      [{ type: 'StatusResistanceBase', value: 0.32 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'resToHealingBoost',
    name: 'resToHealingBoost',
    formItem: 'switch',
    text: 'RES to healing boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      resToHealingBoost: true,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request) => {
    },
    dynamicConditionals: [
      {
        id: 'PerfectTimingConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.RES],
        condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.lightConeConditionals

          return r.resToHealingBoost
        },
        effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
          const boost = Math.min(sMaxValues[s], sValues[s] * x[Stats.RES])
          buffStat(x, request, params, Stats.OHB, boost)
        },
        gpu: function () {
          return conditionalWgslWrapper(this, `
if (
  (*p_state).PerfectTimingConditional == 0.0
) {
  (*p_state).PerfectTimingConditional = 1.0;
  
  let boost = min(${sMaxValues[s]}, ${sValues[s]} * x.RES);
  buffDynamicOHB(boost, p_x, p_state);
}
    `)
        },
      },
    ],
  }
}
