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

  registerTeammateConditionals(conditionalRegistry, context.teammate0Metadata, action, 0)
  registerTeammateConditionals(conditionalRegistry, context.teammate1Metadata, action, 1)
  registerTeammateConditionals(conditionalRegistry, context.teammate2Metadata, action, 2)

  action.conditionalRegistry = conditionalRegistry
  action.conditionalState = {}
}

export function registerTeammateConditionals(conditionalRegistry: { [key: string]: DynamicConditional[] }, teammateMetadata: CharacterMetadata, action: OptimizerAction, index: number) {
  if (teammateMetadata) {
    const teammateCharacterConditionals: CharacterConditional = CharacterConditionals.get(teammateMetadata)
    const dynamicConditionals = (teammateCharacterConditionals.teammateDynamicConditionals ?? [])
      .map(dynamicConditional => {
        const wrapped = wrapTeammateDynamicConditional(dynamicConditional, index)
        action.teammateDynamicConditionals.push(wrapped)
        return wrapped
      })
    registerConditionals(conditionalRegistry, dynamicConditionals)
  }
}

export function wrapTeammateDynamicConditional(dynamicConditional: DynamicConditional, index: number) {
  return {
    ...dynamicConditional,
    teammateIndex: index
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
