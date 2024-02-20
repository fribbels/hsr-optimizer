import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const lcRanks = {
    id: '21022',
    skill: 'Semibreve Rest',
    desc: "Increases the wearer's DMG to enemies afflicted with Shock or Wind Shear by #2[i]%. This also applies to DoT.",
    params: [
      [0.16, 0.16],
      [0.2, 0.2],
      [0.24, 0.24],
      [0.28, 0.28],
      [0.32, 0.32],
    ],
    properties: [
      [{ type: 'BreakDamageAddedRatioBase', value: 0.16 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.2 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.24 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.28 }],
      [{ type: 'BreakDamageAddedRatioBase', value: 0.32 }]],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyShockWindShear',
    name: 'enemyShockWindShear',
    formItem: 'switch',
    text: 'Enemy shocked / wind sheared',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyShockWindShear: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyShockWindShear) ? sValues[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
