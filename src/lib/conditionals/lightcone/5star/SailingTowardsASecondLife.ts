import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { BREAK_TYPE, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { precisionRound } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { OptimizerParams } from 'lib/optimizer/calculateParams'
import { buffStat, conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalActivation, ConditionalType } from 'lib/gpu/conditionals/setConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesSpdBuff = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDefShred = [0.20, 0.23, 0.26, 0.29, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'breakDmgDefShred',
      name: 'breakDmgDefShred',
      formItem: 'switch',
      text: 'Break DMG DEF shred',
      title: 'Break DMG DEF shred',
      content: `The Break DMG dealt by the wearer ignores ${precisionRound(sValuesDefShred[s] * 100)}% of the target's DEF.`,
    },
    {
      lc: true,
      id: 'spdBuffConditional',
      name: 'spdBuffConditional',
      formItem: 'switch',
      text: 'BE ≥ 150 SPD buff',
      title: 'BE ≥ 150 SPD buff',
      content: `When the wearer's Break Effect in battle is at 150% or greater, increases their SPD by ${precisionRound(sValuesSpdBuff[s] * 100)}%.`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      breakDmgDefShred: true,
      spdBuffConditional: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals
      buffAbilityDefPen(x, BREAK_TYPE, sValuesDefShred[s], (r.breakDmgDefShred))
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
    },
    dynamicConditionals: [
      {
        id: 'SailingTowardsASecondLifeConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.BE],
        condition: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
          const r = request.lightConeConditionals

          return r.spdBuffConditional && x[Stats.BE] >= 1.50
        },
        effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
          buffStat(x, request, params, Stats.SPD, (sValuesSpdBuff[s]) * request.baseSpd)
        },
        gpu: function () {
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
