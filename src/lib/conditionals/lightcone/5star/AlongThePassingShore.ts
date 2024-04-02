import { ContentItem } from 'types/Conditionals'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { precisionRound } from 'lib/conditionals/utils.ts'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesUltDmgBoost = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'emptyBubblesDebuff',
      name: 'emptyBubblesDebuff',
      formItem: 'switch',
      text: 'Mirage Fizzle debuff',
      title: 'Steerer',
      content: `When the wearer hits an enemy target, inflicts Mirage Fizzle on the enemy, lasting for 1 turn. Each time the wearer attacks, this effect can only trigger 1 time on each target. The wearer deals ${precisionRound(sValuesDmgBoost[s] * 100)}% increased DMG to targets afflicted with Mirage Fizzle, and the DMG dealt by the wearer's Ultimate additionally increases by ${precisionRound(sValuesUltDmgBoost[s] * 100)}%.`,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      emptyBubblesDebuff: true,
    }),
    precomputeEffects: (x: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals

      x.ELEMENTAL_DMG += (r.emptyBubblesDebuff) ? sValuesDmgBoost[s] : 0
      x.ULT_BOOST += (r.emptyBubblesDebuff) ? sValuesUltDmgBoost[s] : 0
    },
    calculatePassives: (/* c, request */) => { },
    calculateBaseMultis: (/* c, request */) => { },
  }
}
