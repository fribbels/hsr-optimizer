import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.0036, 0.0042, 0.0048, 0.0054, 0.006]

  const lcRank: LightConeRawRank = {
    id: '23018',
    skill: "A Knight's Pilgrimage",
    desc: "When the wearer uses Ultimate, increases the wearer's Ultimate DMG based on their Max Energy. Each point of Energy increases the Ultimate DMG by #2[f2]%, up to #3[i] points of Energy.",
    params: [
      [0.36, 0.0036, 180],
      [0.42, 0.0042, 180],
      [0.48, 0.0048, 180],
      [0.54, 0.0054, 180],
      [0.6, 0.006, 180],
    ],
    properties: [
      [{ type: 'CriticalDamageBase', value: 0.36 }],
      [{ type: 'CriticalDamageBase', value: 0.42 }],
      [{ type: 'CriticalDamageBase', value: 0.48 }],
      [{ type: 'CriticalDamageBase', value: 0.54 }],
      [{ type: 'CriticalDamageBase', value: 0.6 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyUltDmgStacks',
    name: 'maxEnergyUltDmgStacks',
    formItem: 'slider',
    text: 'Max Energy',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 180,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      maxEnergyUltDmgStacks: 180,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ULT_BOOST += r.maxEnergyUltDmgStacks * sValues[s]
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
