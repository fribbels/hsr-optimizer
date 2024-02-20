import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21000',
    skill: 'Mutual Healing',
    desc: "Increases the wearer's Outgoing Healing when they use their Ultimate by #2[i]%.",
    params: [[0.08, 0.12], [0.1, 0.15], [0.12, 0.18], [0.14, 0.21], [0.16, 0.24]],
    properties: [[{ type: 'SPRatioBase', value: 0.08 }], [{ type: 'SPRatioBase', value: 0.1 }], [{ type: 'SPRatioBase', value: 0.12 }], [{ type: 'SPRatioBase', value: 0.14 }], [{ type: 'SPRatioBase', value: 0.16 }]],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltHealingBoost',
    name: 'postUltHealingBoost',
    formItem: 'switch',
    text: 'Ult healing boost',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      postUltHealingBoost: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.OHB] += (r.postUltHealingBoost) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
