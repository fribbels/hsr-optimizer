import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export type ActionModifier = { modify: (action: OptimizerAction, context: OptimizerContext) => void }

// export function calculateEntities(request: OptimizerForm, context: OptimizerContext) {
//   const characterConditionalController = CharacterConditionalsResolver.get(context)
//
//   // Define entities
//   const entityNames: string[] = [
//     ...characterConditionalController.entityDeclaration(),
//   ]
//
//   const teammates = [
//     context.teammate0Metadata,
//     context.teammate1Metadata,
//     context.teammate2Metadata,
//   ].filter((x) => !!x?.characterId)
//   for (let i = 0; i < teammates.length; i++) {
//     const teammate = teammates[i]!
//
//     const teammateCharacterConditionals = CharacterConditionalsResolver.get(teammate)
//     const teammateLightConeConditionals = LightConeConditionalsResolver.get(teammate)
//
//     if (teammateCharacterConditionals.entityDeclaration) {
//       entityNames.push(...teammateCharacterConditionals.entityDeclaration())
//     }
//   }
//
//   context.entityNames = entityNames
// }
