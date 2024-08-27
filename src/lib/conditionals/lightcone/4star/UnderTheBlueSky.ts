import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21019',
    skill: 'Rye Under the Sun',
    desc: "When the wearer defeats an enemy, the wearer's CRIT Rate increases by #2[i]% for #3[i] turn(s).",
    params: [
      [0.16, 0.12, 3],
      [0.2, 0.15, 3],
      [0.24, 0.18, 3],
      [0.28, 0.21, 3],
      [0.32, 0.24, 3],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.16 }],
      [{ type: 'AttackAddedRatio', value: 0.2 }],
      [{ type: 'AttackAddedRatio', value: 0.24 }],
      [{ type: 'AttackAddedRatio', value: 0.28 }],
      [{ type: 'AttackAddedRatio', value: 0.32 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyCrBuff',
    name: 'defeatedEnemyCrBuff',
    formItem: 'switch',
    text: 'Defeated enemy CR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyCrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.defeatedEnemyCrBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
