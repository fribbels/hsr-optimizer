import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmgBoost = [0.18, 0.21, 0.24, 0.27, 0.30]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      formItem: 'switch',
      text: 'Ult usage DMG buff',
      title: 'Ult usage DMG buff',
      content: 'Ult usage DMG buff',
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals as ConditionalLightConeMap

      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? sValuesDmgBoost[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
