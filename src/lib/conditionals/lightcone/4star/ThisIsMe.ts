import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const lcRank = {
    id: '21030',
    skill: 'New Chapter',
    desc: "Increases the DMG of the wearer when they use their Ultimate by #2[i]% of the wearer's DEF. This effect only applies 1 time per enemy target during each use of the wearer's Ultimate.",
    params: [
      [0.16, 0.6],
      [0.2, 0.75],
      [0.24, 0.9],
      [0.28, 1.05],
      [0.32, 1.2],
    ],
    properties: [
      [{ type: 'DefenceAddedRatio', value: 0.16 }],
      [{ type: 'DefenceAddedRatio', value: 0.2 }],
      [{ type: 'DefenceAddedRatio', value: 0.24 }],
      [{ type: 'DefenceAddedRatio', value: 0.28 }],
      [{ type: 'DefenceAddedRatio', value: 0.32 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'defScalingUltDmg',
    name: 'defScalingUltDmg',
    formItem: 'switch',
    text: 'DEF scaling ult DMG (Not implemented)',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    defaults: () => ({
      defScalingUltDmg: false,
    }),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
      // TODO: NOT IMPLEMENTED
    },
  }
}
