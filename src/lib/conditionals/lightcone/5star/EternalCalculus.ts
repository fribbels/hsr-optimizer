import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { precisionRound } from 'lib/conditionals/conditionalUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesAtkBuff = [0.04, 0.05, 0.06, 0.07, 0.08]
  const sValuesSpdBuff = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'atkBuffStacks',
      name: 'atkBuffStacks',
      formItem: 'slider',
      text: 'ATK buff stacks',
      title: 'ATK buff stacks',
      content: `After using an attack, for each enemy target hit, additionally increases ATK by ${precisionRound(sValuesAtkBuff[s] * 100)}%. 
      This effect can stack up to 5 times and last until the next attack.`,
      min: 0,
      max: 5,
    },
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: '3 targets hit SPD buff',
      title: '3 targets hit SPD buff',
      content: `If there are 3 or more enemy targets hit, this unit's SPD increases by ${sValuesSpdBuff[s] * 100}%, lasting for 1 turn(s).`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      atkBuffStacks: 5,
      spdBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBuffStacks * sValuesAtkBuff[s]
      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpdBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
