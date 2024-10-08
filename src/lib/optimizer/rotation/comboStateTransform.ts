import { ComboBooleanConditional, ComboConditionals, ComboSelectConditional, ComboState } from 'lib/optimizer/rotation/comboDrawerController'
import { Form } from 'types/Form'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { CharacterConditional } from 'types/CharacterConditional'
import { LightConeConditional } from 'types/LightConeConditionals'

export type ComboForm = {

}

export function transformComboState(request: Form, context: OptimizerContext) {
  console.debug('transformComboState')
  console.debug(request)
  console.debug(context)

  if (!request.comboStateJson || request.comboStateJson == '{}') return
  const comboState = JSON.parse(request.comboStateJson) as ComboState

  if (request.comboType == 'advanced') {

  } else {
    simpleTransform(comboState, request, context)
  }
}

function advancedTransform() {

}

function simpleTransform(comboState: ComboState, request: Form, context: OptimizerContext) {
  const comboAbilities = getComboAbilities(request.comboAbilities)
  for (let i = 0; i < comboAbilities.length; i++) {
    const ability = comboAbilities[i]
    transformAction(i, comboState, comboAbilities)
  }
}

function transformAction(actionIndex: number, comboState: ComboState, comboAbilities: string[]) {
  const action: OptimizerAction = {
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: {},
  } as OptimizerAction
  action.actionType = comboAbilities[actionIndex]

  const characterConditionals = comboState.comboCharacter.characterConditionals

  action.characterConditionals = transformConditionals(actionIndex, comboState.comboCharacter.characterConditionals) as CharacterConditional
  action.lightConeConditionals = transformConditionals(actionIndex, comboState.comboCharacter.characterConditionals) as LightConeConditional
  // action.setConditionals = transformConditionals(actionIndex, comboState.comboCharacter.characterConditionals) as SetConditionals

  console.log({ action })
}

function transformConditionals(actionIndex: number, conditionals: ComboConditionals) {
  const transformedConditionals = {}
  for (const [key, category] of Object.entries(conditionals)) {
    if (category.type == 'boolean') {
      const booleanCategory = category as ComboBooleanConditional
      transformedConditionals[key] = booleanCategory.activations[actionIndex]
    } else {
      const partitionCategory = category as ComboSelectConditional
      for (let i = 0; i < partitionCategory.partitions.length; i++) {
        const partition = partitionCategory.partitions[i]
        if (partition.activations[actionIndex]) {
          transformedConditionals[key] = partition.value
        }
      }
    }
  }

  return transformedConditionals
}

function getComboAbilities(comboAbilities: string[]) {
  let newComboAbilities = ['DEFAULT']
  for (let i = 1; i <= 8; i++) {
    if (comboAbilities[i] == null) break
    newComboAbilities.push(comboAbilities[i])
  }
  return newComboAbilities
}