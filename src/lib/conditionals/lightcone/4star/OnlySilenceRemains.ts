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
    id: '21003',
    skill: 'Record',
    desc: "If there are 2 or fewer enemies on the field, increases wearer's CRIT Rate by #2[i]%.",
    params: [
      [0.16, 0.12],
      [0.2, 0.15],
      [0.24, 0.18],
      [0.28, 0.21],
      [0.32, 0.24],
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
    id: 'enemies2CrBuff',
    name: 'enemies2CrBuff',
    formItem: 'switch',
    text: '≤ 2 enemies CR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemies2CrBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.enemies2CrBuff && request.enemyCount <= 2) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
