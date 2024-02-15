import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]
  const lcRanks = {
    id: '21020',
    skill: 'Each Now Has a Role to Play',
    desc: "When the wearer defeats an enemy, the wearer's CRIT DMG increases by #2[i]% for #3[i] turn(s).",
    params: [
      [0.16, 0.24, 3],
      [0.2, 0.3, 3],
      [0.24, 0.36, 3],
      [0.28, 0.42, 3],
      [0.32, 0.48, 3],
    ],
    properties: [
      [{ type: 'AttackAddedRatio', value: 0.16 }],
      [{ type: 'AttackAddedRatio', value: 0.2 }],
      [{ type: 'AttackAddedRatio', value: 0.24 }],
      [{ type: 'AttackAddedRatio', value: 0.28 }],
      [{ type: 'AttackAddedRatio', value: 0.32 }]],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'defeatedEnemyCdBuff',
    name: 'defeatedEnemyCdBuff',
    formItem: 'switch',
    text: 'Defeated enemy CD buff',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      defeatedEnemyCdBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += (r.defeatedEnemyCdBuff) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
