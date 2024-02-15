import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import getContentFromLCRanks from '../getContentFromLCRank'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional, LightConeRawRank } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const lcRank: LightConeRawRank = {
    id: '24002',
    skill: 'Treasure',
    desc: 'If the wearer is attacked and has no Shield, they gain a Shield equal to #2[i]% of their Max HP for #3[i] turn(s). This effect can only be triggered once every #4[i] turn(s). If the wearer has a Shield when attacked, the DMG they receive decreases by #5[i]%.',
    params: [
      [0.08, 0.16, 2, 3, 0.12],
      [0.1, 0.2, 2, 3, 0.15],
      [0.12, 0.24, 2, 3, 0.18],
      [0.14, 0.28, 2, 3, 0.21],
      [0.16, 0.32, 2, 3, 0.24],
    ],
    properties: [
      [{ type: 'StatusResistanceBase', value: 0.08 }],
      [{ type: 'StatusResistanceBase', value: 0.1 }],
      [{ type: 'StatusResistanceBase', value: 0.12 }],
      [{ type: 'StatusResistanceBase', value: 0.14 }],
      [{ type: 'StatusResistanceBase', value: 0.16 }],
    ],
  }

  const content: ContentItem[] = [{
    lc: true,
    id: 'activeShieldDmgDecrease',
    name: 'activeShieldDmgDecrease',
    formItem: 'switch',
    text: 'Active shield DMG taken decrease',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      activeShieldDmgDecrease: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.DMG_RED_MULTI *= (r.activeShieldDmgDecrease) ? (1 - sValues[s]) : 1
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
