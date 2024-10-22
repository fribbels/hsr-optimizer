import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Stats } from 'lib/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalSets } from 'lib/gpu/conditionals/setConditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CharacterMetadata, OptimizerAction, OptimizerContext } from 'types/Optimizer'

export function calculateContextConditionalRegistry(action: OptimizerAction, context: OptimizerContext) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(context)
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(context)

  const conditionalRegistry: ConditionalRegistry = emptyRegistry()

  registerConditionals(conditionalRegistry, lightConeConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, characterConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, ConditionalSets || [])

  registerTeammateConditionals(conditionalRegistry, context.teammate0Metadata)
  registerTeammateConditionals(conditionalRegistry, context.teammate1Metadata)
  registerTeammateConditionals(conditionalRegistry, context.teammate2Metadata)

  action.conditionalRegistry = conditionalRegistry
  action.conditionalState = {}
}

function registerTeammateConditionals(conditionalRegistry: { [key: string]: DynamicConditional[] }, teammateMetadata: CharacterMetadata) {
  if (teammateMetadata) {
    const teammateCharacterConditionals: CharacterConditional = CharacterConditionals.get(teammateMetadata)
    registerConditionals(conditionalRegistry, teammateCharacterConditionals.teammateDynamicConditionals ?? [])
  }
}

export type ConditionalRegistry = {
  [key: string]: DynamicConditional[]
}

function emptyRegistry() {
  return {
    [Stats.HP]: [],
    [Stats.ATK]: [],
    [Stats.DEF]: [],
    [Stats.SPD]: [],
    [Stats.CR]: [],
    [Stats.CD]: [],
    [Stats.EHR]: [],
    [Stats.RES]: [],
    [Stats.BE]: [],
    [Stats.OHB]: [],
    [Stats.ERR]: [],
  }
}

function registerConditionals(conditionalRegistry: { [key: string]: DynamicConditional[] }, conditionals: DynamicConditional[]) {
  for (const conditional of conditionals) {
    for (const stat of conditional.dependsOn) {
      conditionalRegistry[stat].push(conditional)
    }
  }
}
