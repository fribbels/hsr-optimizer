import i18next from 'i18next'
import { IRowNode } from 'ag-grid-community'
import {
  Constants,
  DEFAULT_STAT_DISPLAY,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { calculateCurrentlyEquippedRow, Optimizer } from 'lib/optimization/optimizer'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { initializeComboState, updateConditionalChange } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Utils } from 'lib/utils/utils'
import { Build, CharacterId } from 'types/character'
import { Form } from 'types/form'

export const optimizerFormCache: Record<string, Form> = {}

const teammateKeys = new Set(['teammate0', 'teammate1', 'teammate2'])

/**
 * Called when a conditional value changes in the UI.
 * Updates the store and patches combo state.
 */
export function handleConditionalChange(
  itemName: (string | number)[],
  value: unknown,
) {
  const store = useOptimizerFormStore.getState()
  store.setConditionalValue(itemName, value)

  const request = displayToInternal(store)
  const comboState = initializeComboState(request, true)

  // Build a changedValues-like object for updateConditionalChange
  const [first, ...rest] = itemName

  if (teammateKeys.has(first as string)) {
    // Teammate path: ['teammate0', 'characterConditionals', 'key']
    const [condType, key] = rest
    updateConditionalChange(comboState, { [first]: { [condType]: { [key]: value } } } as unknown as Form)
  } else if (first === 'setConditionals') {
    // Set conditional: ['setConditionals', 'SetName', 1]
    const [setName] = rest
    // Set conditionals use legacy [undefined, value] format in change events
    updateConditionalChange(comboState, { setConditionals: { [setName]: [undefined, value] } } as unknown as Form)
  } else {
    // Main character: ['characterConditionals', 'key'] or ['lightConeConditionals', 'key']
    const [condType, key] = itemName
    updateConditionalChange(comboState, { [condType]: { [key]: value } } as unknown as Form)
  }
}

/**
 * Recalculate permutation counts from current store state.
 * Call this after any form change that affects relic filtering.
 * Replaces external calls to `window.onOptimizerFormValuesChange({} as Form, form)`.
 */
export function recalculatePermutations(): void {
  const state = useOptimizerFormStore.getState()
  if (!state.characterId) return

  const request = displayToInternal(state)
  const [relics, preFilteredRelicsByPart] = Optimizer.getFilteredRelics(request)

  const permutationDetails = {
    Head: relics.Head.length,
    Hands: relics.Hands.length,
    Body: relics.Body.length,
    Feet: relics.Feet.length,
    PlanarSphere: relics.PlanarSphere.length,
    LinkRope: relics.LinkRope.length,
    HeadTotal: preFilteredRelicsByPart.Head.length,
    HandsTotal: preFilteredRelicsByPart.Hands.length,
    BodyTotal: preFilteredRelicsByPart.Body.length,
    FeetTotal: preFilteredRelicsByPart.Feet.length,
    PlanarSphereTotal: preFilteredRelicsByPart.PlanarSphere.length,
    LinkRopeTotal: preFilteredRelicsByPart.LinkRope.length,
  }
  useOptimizerUIStore.getState().setPermutationDetails(permutationDetails)
  useOptimizerUIStore.getState().setPermutations(
    relics.Head.length
      * relics.Hands.length
      * relics.Body.length
      * relics.Feet.length
      * relics.PlanarSphere.length
      * relics.LinkRope.length,
  )
}

// ----- Functions moved from OptimizerTabController -----

/**
 * Get a form that's ready for optimizer submission.
 */
export function getForm(): Form {
  return displayToInternal(useOptimizerFormStore.getState())
}

/**
 * Validate the optimizer form before submission.
 */
export function validateForm(form: Form): boolean {
  console.log('validate', form)
  const t = i18next.getFixedT(null, 'optimizerTab', 'ValidationMessages')
  if (!form.lightCone || !form.lightConeSuperimposition) {
    Message.error(t('Error.MissingLightCone'))
    console.log('Missing light cone')
    return false
  }

  if (!form.characterId || form.characterEidolon == undefined) {
    Message.error(t('Error.MissingCharacter'))
    console.log('Missing character')
    return false
  }

  if (!form.resultsLimit || !form.resultSort) {
    Message.error(t('Error.MissingTarget'))
    console.log('Missing optimization target fields')
    return false
  }

  if (Object.values(Constants.SubStats).map((stat) => form.weights[stat]).filter((x) => !!x).length == 0) {
    Message.error(t('Error.TopPercent'), 10)
    console.log('Top percent')
    return false
  }

  const metadata = DB.getMetadata()
  const lcMeta = metadata.lightCones[form.lightCone]
  const charMeta = metadata.characters[form.characterId]

  if (lcMeta.path != charMeta.path) {
    Message.warning(t('Warning.PathMismatch'), 10)
    console.log('Path mismatch')
  }

  if (charMeta.scoringMetadata.simulation && (!form.teammate0?.characterId || !form.teammate1?.characterId || !form.teammate2?.characterId)) {
    Message.warning(t('Warning.MissingTeammates'), 10)
    console.log('Missing teammates')
  }

  return true
}

/**
 * Equip the currently selected optimizer result to the character.
 */
export function equipClicked(): void {
  console.log('Equip clicked')
  const form = getForm()
  const characterId = form.characterId

  if (!characterId) {
    return
  }

  DB.addFromForm(form)

  const selectedNodes = window.optimizerGrid.current?.api?.getSelectedNodes() as IRowNode<OptimizerDisplayDataStatSim>[] | undefined
  if (!selectedNodes || selectedNodes.length == 0 || (selectedNodes[0]?.data?.statSim)) {
    // Cannot equip a stat sim or empty row
    return
  }

  const row = selectedNodes[0].data!
  const build = OptimizerTabController.calculateRelicIdsFromId(row.id) as Build

  DB.equipRelicIdsToCharacter(Object.values(build), characterId)
  Message.success(i18next.t('optimizerTab:Sidebar.ResultsGroup.EquipSuccessMessage') /*'Equipped relics'*/)
  OptimizerTabController.setTopRow(row)
  useOptimizerUIStore.getState().setOptimizerBuild(build)
  SaveState.delayedSave()
  recalculatePermutations()
}

/**
 * Reset form filters to defaults while preserving character/LC selection.
 */
export function resetFilters(): void {
  const fieldValues = getForm()
  const newForm: Partial<Form> = {
    characterEidolon: fieldValues.characterEidolon,
    characterId: fieldValues.characterId,
    characterLevel: 80,
    enhance: 9,
    grade: 5,
    mainStatUpscaleLevel: 15,
    rankFilter: true,
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    lightCone: fieldValues.lightCone,
    lightConeLevel: 80,
    lightConeSuperimposition: fieldValues.lightConeSuperimposition,
    mainBody: [],
    mainFeet: [],
    mainHands: [],
    mainHead: [],
    mainLinkRope: [],
    mainPlanarSphere: [],
    ornamentSets: [],
    relicSets: [],
  }

  useOptimizerFormStore.getState().resetFilters()
  useOptimizerFormStore.getState().loadForm(newForm as Form)
  recalculatePermutations()
}

/**
 * Manually set the selected character.
 */
export function setCharacter(id: CharacterId): void {
  useOptimizerUIStore.getState().setFocusCharacterId(id)
  useOptimizerFormStore.getState().setCharacterId(id)

  SaveState.delayedSave()
}

/**
 * Update form values with the character's saved form data.
 * Resets grid, loads the character's form, recalculates context and permutations.
 */
export function updateCharacter(characterId: CharacterId): void {
  console.log('@updateCharacter', characterId)
  if (!characterId) return

  OptimizerTabController.setRows([])
  OptimizerTabController.resetDataSource()
  const character = DB.getCharacterById(characterId)

  const form = character ? character.form : getDefaultForm({ id: characterId })

  // Load form into store (replaces formToDisplay + setFieldsValue)
  useOptimizerFormStore.getState().loadForm(form)

  useOptimizerUIStore.getState().setFocusCharacterId(characterId)
  useOptimizerFormStore.getState().setStatDisplay(form.statDisplay ?? DEFAULT_STAT_DISPLAY)
  useOptimizerUIStore.getState().setStatSimulations(form.statSim?.simulations ?? [])
  useOptimizerUIStore.getState().setOptimizerSelectedRowData(null)
  window.optimizerGrid.current?.api?.deselectAll()

  const currentRequest = displayToInternal(useOptimizerFormStore.getState())
  generateContext(currentRequest)
  calculateCurrentlyEquippedRow(currentRequest)

  recalculatePermutations()
}

/**
 * Start an optimizer run. Validates the form, sets up run state, and kicks off optimization.
 * Extracted from OptimizerForm.tsx to allow direct import (replaces window.optimizerStartClicked).
 */
export function startOptimization(): void {
  console.log('Start clicked')

  const form = getForm()

  if (!validateForm(form)) {
    return
  }

  useOptimizerUIStore.getState().setPermutationsSearched(0)
  useOptimizerUIStore.getState().setPermutationsResults(0)
  useOptimizerUIStore.getState().setOptimizationInProgress(true)

  setTimeout(() => {
    // Delay the state update since this rerenders the characters tab
    DB.addFromForm(form)
  }, 2000)
  SaveState.delayedSave()

  const optimizationId = Utils.randomId()
  useOptimizerUIStore.getState().setOptimizationId(optimizationId)
  form.optimizationId = optimizationId
  form.statDisplay = useOptimizerFormStore.getState().statDisplay

  optimizerFormCache[optimizationId] = form

  console.log('Form finished', form)

  setTimeout(() => Optimizer.optimize(form), 50)
}
