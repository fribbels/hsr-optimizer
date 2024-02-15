import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { Stats } from 'lib/constants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.15, 0.1875, 0.225, 0.2625, 0.3]
  const lcRanks = {
    id: '21042',
    skill: 'Inheritance',
    desc: "Increases the wearer's Break Effect by #1[i]%. When the wearer uses their Ultimate, increases CRIT Rate by #2[i]%, lasting for #3[i] turn(s).",
    params: [
      [0.28, 0.15, 2],
      [0.35, 0.1875, 2],
      [0.42, 0.225, 2],
      [0.49, 0.2625, 2],
      [0.56, 0.3, 2],
    ],
    properties: [
      [{ type: 'BreakDamageAddedRatioBase', value: 0.28 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.35 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.42 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.49 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.56 }],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'crBuff',
    name: 'crBuff',
    formItem: 'switch',
    text: 'Ult CR buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      crBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CR] += (r.crBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
