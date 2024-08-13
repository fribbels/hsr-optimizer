import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { BETA_UPDATE } from "lib/constants";
import { buffAbilityDefShred } from "lib/optimizer/calculateBuffs";

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentItem[] = [
    {
      lc: true,
      formItem: 'slider',
      id: 'luminfluxUltStacks',
      name: 'luminfluxUltStacks',
      text: 'Luminflux stacks',
      title: 'Luminflux stacks',
      content: BETA_UPDATE,
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      luminfluxUltStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDefShred(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s])
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (_c: PrecomputedCharacterConditional, _request: Form) => {
    },
  }
}
