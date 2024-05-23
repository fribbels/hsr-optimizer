import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants'

const betaUpdate = 'All calculations are subject to change. Last updated v3 05-20-2024.'

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
      content: betaUpdate,
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
      content: betaUpdate,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      atkBuffStacks: 5,
      spdBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBuffStacks * sValuesAtkBuff[s]
      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpdBuff[s] : 0
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
