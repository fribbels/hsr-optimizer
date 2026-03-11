import i18next from 'i18next'
import {
  Constants,
  DEFAULT_STAT_DISPLAY,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { calculateCurrentlyEquippedRow, Optimizer } from 'lib/optimization/optimizer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { MainConditionalType, TeammateConditionalType, useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { initializeComboState, updateConditionalChange } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { gridStore } from 'lib/utils/gridStore'
import { Utils } from 'lib/utils/utils'
import { Build, CharacterId } from 'types/character'
import { Form } from 'types/form'

const OPTIMIZER_FORM_CACHE_MAX = 50
const _optimizerFormCacheMap = new Map<string, Form>()

export const optimizerFormCache = {
  get(key: string): Form | undefined {
    return _optimizerFormCacheMap.get(key)
  },
  set(key: string, value: Form) {
    // Evict oldest entries when at capacity
    if (_optimizerFormCacheMap.size >= OPTIMIZER_FORM_CACHE_MAX && !_optimizerFormCacheMap.has(key)) {
      const oldest = _optimizerFormCacheMap.keys().next().value!
      _optimizerFormCacheMap.delete(oldest)
    }
    _optimizerFormCacheMap.set(key, value)
  },
}

const teammateKeyToIndex: Record<string, 0 | 1 | 2> = {
  teammate0: 0,
  teammate1: 1,
  teammate2: 2,
}

/**
 * Called when a main character conditional (characterConditionals or lightConeConditionals) changes.
 */
export function handleMainCharacterConditionalChange(
  condType: MainConditionalType,
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setMainCharacterConditional(condType, key, value)

  const request = displayToInternal(store)
  const comboState = initializeComboState(request, true)
  updateConditionalChange(comboState, { [condType]: { [key]: value } } as unknown as Form)
}

/**
 * Called when a teammate conditional changes.
 */
export function handleTeammateConditionalChange(
  teammateIndex: 0 | 1 | 2,
  condType: TeammateConditionalType,
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setTeammateConditional(teammateIndex, condType, key, value)

  const request = displayToInternal(store)
  const comboState = initializeComboState(request, true)
  const teammateKey = `teammate${teammateIndex}`
  updateConditionalChange(comboState, { [teammateKey]: { [condType]: { [key]: value } } } as unknown as Form)
}

/**
 * Called when a set conditional changes.
 */
export function handleSetConditionalChange(
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setSetConditional(key, value)

  const request = displayToInternal(store)
  const comboState = initializeComboState(request, true)
  updateConditionalChange(comboState, { setConditionals: { [key]: [undefined, value] } } as unknown as Form)
}

/**
 * Called when a conditional value changes in the UI.
 * Dispatches to the appropriate typed handler based on itemName structure.
 * This is a convenience wrapper used by UI components that construct itemName paths.
 */
export function handleConditionalChange(
  itemName: (string | number)[],
  value: unknown,
) {
  const [first, ...rest] = itemName

  const tmIndex = teammateKeyToIndex[first as string]
  if (tmIndex != null) {
    // Teammate path: ['teammate0', 'characterConditionals', 'key']
    const [condType, key] = rest as [TeammateConditionalType, string]
    handleTeammateConditionalChange(tmIndex, condType, key, value as boolean | number)
    return
  }

  if (first === 'setConditionals') {
    // Set conditional: ['setConditionals', 'SetName', 1]
    const [setName] = rest as [string]
    handleSetConditionalChange(setName, value as boolean | number)
    return
  }

  // Main character: ['characterConditionals', 'key'] or ['lightConeConditionals', 'key']
  const [condType, key] = itemName as [MainConditionalType, string]
  handleMainCharacterConditionalChange(condType, key, value as boolean | number)
}

/**
 * Recalculate permutation counts from current store state.
 * Call this after any form change that affects relic filtering.
 * Replaces external calls to `window.onOptimizerFormValuesChange({} as Form, form)`.
 */
export function recalculatePermutations(): void {
  const state = useOptimizerRequestStore.getState()
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
  useOptimizerDisplayStore.getState().setPermutationDetails(permutationDetails)
  useOptimizerDisplayStore.getState().setPermutations(
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
  return displayToInternal(useOptimizerRequestStore.getState())
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

  const metadata = getGameMetadata()
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

  const selectedNodes = gridStore.optimizerGridApi()?.getSelectedNodes()
  if (!selectedNodes || selectedNodes.length == 0 || (selectedNodes[0]?.data?.statSim)) {
    // Cannot equip a stat sim or empty row
    return
  }

  const row = selectedNodes[0].data!
  const build = OptimizerTabController.calculateRelicIdsFromId(row.id) as Build

  DB.equipRelicIdsToCharacter(Object.values(build), characterId)
  Message.success(i18next.t('optimizerTab:Sidebar.ResultsGroup.EquipSuccessMessage') /*'Equipped relics'*/)
  OptimizerTabController.setTopRow(row)
  useOptimizerDisplayStore.getState().setOptimizerBuild(build)
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

  useOptimizerRequestStore.getState().resetFilters()
  useOptimizerRequestStore.getState().loadForm(newForm as Form)
  recalculatePermutations()
}

/**
 * Manually set the selected character.
 */
export function setCharacter(id: CharacterId): void {
  useOptimizerDisplayStore.getState().setFocusCharacterId(id)
  useOptimizerRequestStore.getState().setCharacterId(id)

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
  useOptimizerRequestStore.getState().loadForm(form)

  useOptimizerDisplayStore.getState().setFocusCharacterId(characterId)
  useOptimizerRequestStore.getState().setStatDisplay(form.statDisplay ?? DEFAULT_STAT_DISPLAY)
  useOptimizerDisplayStore.getState().setStatSimulations(form.statSim?.simulations ?? [])
  useOptimizerDisplayStore.getState().setOptimizerSelectedRowData(null)
  gridStore.optimizerGridApi()?.deselectAll()

  const currentRequest = displayToInternal(useOptimizerRequestStore.getState())
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

  useOptimizerDisplayStore.getState().setPermutationsSearched(0)
  useOptimizerDisplayStore.getState().setPermutationsResults(0)
  useOptimizerDisplayStore.getState().setOptimizationInProgress(true)

  // Delay the DB save so it doesn't block the optimizer start with a characters tab re-render
  requestIdleCallback(() => {
    DB.addFromForm(form)
  })
  SaveState.delayedSave()

  const optimizationId = Utils.randomId()
  useOptimizerDisplayStore.getState().setOptimizationId(optimizationId)
  form.optimizationId = optimizationId
  form.statDisplay = useOptimizerRequestStore.getState().statDisplay

  optimizerFormCache.set(optimizationId, form)

  console.log('Form finished', form)

  // Use setTimeout(0) to yield to the browser so the UI can update (loading state) before the optimizer starts
  setTimeout(() => Optimizer.optimize(form), 0)
}
