import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const lcRanks = {
    id: '20007',
    skill: 'War Cry',
    desc: 'When the wearer defeats an enemy, increases ATK by #1[i]% for #2[i] turn(s).',
    params: [
      [0.24, 3],
      [0.3, 3],
      [0.36, 3],
      [0.42, 3],
      [0.48, 3],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyAtkBuff',
    name: 'defeatedEnemyAtkBuff',
    formItem: 'switch',
    text: 'Defeated enemy ATK buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defeatedEnemyAtkBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += (r.defeatedEnemyAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
