import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const lcRank: LightConeRawRank = {
    id: '23009',
    skill: 'Unfulfilled Yearning',
    desc: 'When the wearer is attacked or consumes their own HP, their DMG increases by #3[i]%. This effect is removed after the wearer uses an attack.',
    params: [
      [0.18, 0.18, 0.24],
      [0.21, 0.21, 0.28],
      [0.24, 0.24, 0.32],
      [0.27, 0.27, 0.36],
      [0.3, 0.3, 0.4],
    ],
    properties: [
      [{ type: 'CriticalChanceBase', value: 0.18 }, { type: 'HPAddedRatio', value: 0.18 }],
      [{ type: 'CriticalChanceBase', value: 0.21 }, { type: 'HPAddedRatio', value: 0.21 }],
      [{ type: 'CriticalChanceBase', value: 0.24 }, { type: 'HPAddedRatio', value: 0.24 }],
      [{ type: 'CriticalChanceBase', value: 0.27 }, { type: 'HPAddedRatio', value: 0.27 }],
      [{ type: 'CriticalChanceBase', value: 0.3 }, { type: 'HPAddedRatio', value: 0.3 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuff',
    name: 'dmgBuff',
    formItem: 'switch',
    text: 'HP consumed or attacked DMG buff',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
