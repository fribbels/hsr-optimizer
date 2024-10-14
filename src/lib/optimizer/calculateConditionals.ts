import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { Stats } from 'lib/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalSets } from 'lib/gpu/conditionals/setConditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction } from 'types/Optimizer'
import { ComboCharacterMetadata } from 'lib/optimizer/rotation/comboDrawerController'

export function calculateContextConditionalRegistry(action: OptimizerAction, comboCharacterMetadata: ComboCharacterMetadata) {
  const characterConditionals: CharacterConditional = CharacterConditionals.get(comboCharacterMetadata)
  const lightConeConditionals: LightConeConditional = LightConeConditionals.get(comboCharacterMetadata)

  const conditionalRegistry: ConditionalRegistry = emptyRegistry()

  registerConditionals(conditionalRegistry, lightConeConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, characterConditionals.dynamicConditionals ?? [])
  registerConditionals(conditionalRegistry, ConditionalSets || [])

  action.conditionalRegistry = conditionalRegistry
  action.conditionalState = {}
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

function registerConditionals(registeredConditionals: { [key: string]: DynamicConditional[] }, conditionals: DynamicConditional[]) {
  for (const conditional of conditionals) {
    for (const stat of conditional.dependsOn) {
      registeredConditionals[stat].push(conditional)
    }
  }
}
