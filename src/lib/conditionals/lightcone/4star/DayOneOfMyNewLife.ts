import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const lcRanks = {
    id: '21002',
    skill: 'At This Very Moment',
    desc: 'After entering battle, increases All-Type RES of all allies by #2[i]%. Effects of the same type cannot stack.',
    params: [
      [0.16, 0.08],
      [0.18, 0.09],
      [0.2, 0.1],
      [0.22, 0.11],
      [0.24, 0.12],
    ],
    properties: [
      [{ type: 'DefenceAddedRatio', value: 0.16 }],
      [{ type: 'DefenceAddedRatio', value: 0.18 }],
      [{ type: 'DefenceAddedRatio', value: 0.2 }],
      [{ type: 'DefenceAddedRatio', value: 0.22 }],
      [{ type: 'DefenceAddedRatio', value: 0.24 }]],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgResBuff',
    name: 'dmgResBuff',
    formItem: 'switch',
    text: 'Dmg RES buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      dmgResBuff: true,
    }),
    teammateDefaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: (_x: PrecomputedCharacterConditional, _request: Form) => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x.DMG_RED_MULTI *= (m.dmgResBuff) ? (1 - sValues[s]) : 1
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
