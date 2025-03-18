import { Sets } from 'lib/constants/constants'
import { ComboBooleanConditional, ComboNumberConditional, ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'

/**
 * Some passives such as Scholar Lost In Erudition set only activate after abilities trigger them.
 * Use the simulation ability rotation to precompute when their activations are active.
 */
export function precomputeConditionalActivations(comboState: ComboState, request: Form) {
  const setPreprocessors = [
    scholarLostInEruditionPreprocessor(comboState, request),
    // Hunter of Glacial Forest
    // Firesmith of Lava-Forging
    // Band of Sizzling Thunder
  ]

  const characterPreprocessors = [
    castoricePreprocessor(comboState, request),
  ].filter((x) => x.id == request.characterId)

  for (let i = 1; i < comboState.comboAbilities.length; i++) {
    const ability = comboState.comboAbilities[i]

    for (const preprocessor of setPreprocessors) {
      preprocessor.processAbility(ability, i)
    }

    for (const preprocessor of characterPreprocessors) {
      preprocessor.processAbility(ability, i)
    }
  }
}

type AbilityPreprocessor = {
  id: string
  state: Record<string, boolean | number>
  processAbility: (ability: string, index: number) => void
}

function scholarLostInEruditionPreprocessor(comboState: ComboState, request: Form): AbilityPreprocessor {
  return {
    id: Sets.ScholarLostInErudition,
    state: {
      scholarActivated: false,
    },
    processAbility: function (ability: string, index: number) {
      if (ability == 'ULT') {
        this.state.scholarActivated = true
      }

      if (ability == 'SKILL' && this.state.scholarActivated) {
        this.state.scholarActivated = false
        setComboBooleanCategorySetActivation(comboState, Sets.ScholarLostInErudition, index, true)
      } else {
        setComboBooleanCategorySetActivation(comboState, Sets.ScholarLostInErudition, index, false)
      }
    },
  }
}

function castoricePreprocessor(comboState: ComboState, request: Form): AbilityPreprocessor {
  return {
    id: '1407',
    state: {
      memoSkillEnhances: 1,
      memoDmgStacks: 1,
      e2Activated: false,
    },
    processAbility: function (ability: string, index: number) {
      // E1

      let memoDmgStacks = this.state.memoDmgStacks as number
      if (ability == 'MEMO_SKILL') {
        memoDmgStacks = Math.min(6, memoDmgStacks + 1)
        setComboNumberCategoryCharacterActivation(comboState, 'memoDmgStacks', index, memoDmgStacks)
      } else {
        memoDmgStacks = 1
        setComboNumberCategoryCharacterActivation(comboState, 'memoDmgStacks', index, memoDmgStacks)
      }
      this.state.memoDmgStacks = memoDmgStacks

      // E2

      if (ability == 'ULT') {
        this.state.e2Activated = true
      }

      if (ability == 'MEMO_SKILL' && this.state.e2Activated) {
        this.state.e2Activated = false
        setComboBooleanCategoryCharacterActivation(comboState, 'e2MemoSkillDmgBoost', index, true)
      } else {
        setComboBooleanCategoryCharacterActivation(comboState, 'e2MemoSkillDmgBoost', index, false)
      }
    },
  }
}

function setComboBooleanCategorySetActivation(comboState: ComboState, set: string, index: number, value: boolean) {
  const category = comboState.comboCharacter.setConditionals[set] as ComboBooleanConditional
  category.activations[index] = value
}

function setComboBooleanCategoryCharacterActivation(comboState: ComboState, conditional: string, index: number, value: boolean) {
  const category = comboState.comboCharacter.characterConditionals[conditional] as ComboBooleanConditional
  if (category) {
    category.activations[index] = value
  }
}

function setComboNumberCategoryCharacterActivation(comboState: ComboState, conditional: string, index: number, value: number) {
  const category = comboState.comboCharacter.characterConditionals[conditional] as ComboNumberConditional
  if (category) {
    const partition = category.partitions.find((x) => x.value == value)
    if (partition) {
      category.partitions.forEach((x) => x.activations[index] = false)
      partition.activations[index] = true
    } else {
      category.partitions.forEach((x) => x.activations[index] = false)
      const newPartition = {
        value: value,
        activations: new Array(comboState.comboAbilities.length).fill(false),
      }
      newPartition.activations[index] = true
      category.partitions.push(newPartition)
    }

    category.partitions = category.partitions.sort((a, b) => a.value - b.value)
  }
}
