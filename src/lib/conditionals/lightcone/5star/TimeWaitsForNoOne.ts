import { ContentItem } from 'types/Conditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const lcRank: LightConeRawRank = {
    id: '23013',
    skill: 'Morn, Noon, Dusk, and Night',
    desc: "When the wearer heals allies, record the amount of Outgoing Healing. When any ally launches an attack, a random attacked enemy takes Additional DMG equal to #3[i]% of the recorded Outgoing Healing value. The type of this Additional DMG is of the same Type as the wearer's. This Additional DMG is not affected by other buffs, and can only occur 1 time per turn.",
    params: [
      [0.18, 0.12, 0.36],
      [0.21, 0.14, 0.42],
      [0.24, 0.16, 0.48],
      [0.27, 0.18, 0.54],
      [0.3, 0.2, 0.6],
    ],
    properties: [
      [{ type: 'HPAddedRatio', value: 0.18 }, { type: 'HealRatioBase', value: 0.12 }],
      [{ type: 'HPAddedRatio', value: 0.21 }, { type: 'HealRatioBase', value: 0.14 }],
      [{ type: 'HPAddedRatio', value: 0.24 }, { type: 'HealRatioBase', value: 0.16 }],
      [{ type: 'HPAddedRatio', value: 0.27 }, { type: 'HealRatioBase', value: 0.18 }],
      [{ type: 'HPAddedRatio', value: 0.3 }, { type: 'HealRatioBase', value: 0.2 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'healingBasedDmgProc',
    name: 'healingBasedDmgProc',
    formItem: 'switch',
    text: 'Healing based dmg proc (Not implemented)',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      healingBasedDmgProc: false,
    }),
    precomputeEffects: (/* x, request */) => {
      // let r = request.lightConeConditionals
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
