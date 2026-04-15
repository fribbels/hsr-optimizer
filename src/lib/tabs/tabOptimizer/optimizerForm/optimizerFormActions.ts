import i18next from 'i18next'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import {
  Constants,
  DEFAULT_STAT_DISPLAY,
} from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  calculateCurrentlyEquippedRow,
  Optimizer,
} from 'lib/optimization/optimizer'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { gridStore } from 'lib/stores/gridStore'
import {
  displayToInternal,
  patchComboConditionalDefault,
} from 'lib/stores/optimizerForm/optimizerFormConversions'
import {
  type MainConditionalType,
  type TeammateConditionalType,
  useOptimizerRequestStore,
} from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { syncFormToCharacterStore } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { uuid } from 'lib/utils/miscUtils'
import type {
  Build,
  CharacterId,
} from 'types/character'
import type { Form } from 'types/form'

// Sync optimizer form to character store before page unload so SaveState.save() has latest data
window.addEventListener('beforeunload', () => syncFormToCharacterStore())

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
function handleMainCharacterConditionalChange(
  condType: MainConditionalType,
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setMainCharacterConditional(condType, key, value)

  // Surgical patch: only updates activations[0] (default slot), preserving per-turn customizations.
  // The old path via initializeComboState + updateConditionalChange overwrote ALL activations.
  const conditionalsType = condType === 'characterConditionals' ? 'character' : 'lightCone' as const
  const patchedJson = patchComboConditionalDefault(store.comboStateJson, conditionalsType, { [key]: value })
  store.setComboStateJson(patchedJson)
}

/**
 * Called when a teammate conditional changes.
 */
function handleTeammateConditionalChange(
  teammateIndex: 0 | 1 | 2,
  condType: TeammateConditionalType,
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setTeammateConditional(teammateIndex, condType, key, value)

  // Surgical patch: only updates activations[0] (default slot), preserving per-turn customizations.
  const conditionalsType = condType === 'characterConditionals' ? 'character' : 'lightCone' as const
  const patchedJson = patchComboConditionalDefault(store.comboStateJson, conditionalsType, { [key]: value }, teammateIndex)
  store.setComboStateJson(patchedJson)
}

/**
 * Called when a set conditional changes.
 */
function handleSetConditionalChange(
  key: string,
  value: boolean | number,
) {
  const store = useOptimizerRequestStore.getState()
  store.setSetConditional(key, value)

  const patchedJson = patchComboConditionalDefault(store.comboStateJson, 'set', { [key]: value })
  store.setComboStateJson(patchedJson)
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
 * Prefer letting the auto-subscription handle this — only call manually
 * when external data (relic/character DB) changes without a store field update.
 */
export function recalculatePermutations(): void {
  const state = useOptimizerRequestStore.getState()
  if (!state.characterId) return

  const request = displayToInternal(state)
  const { counts, preCounts } = Optimizer.getFilteredRelicCounts(request)

  const permutationDetails = {
    Head: counts.Head,
    Hands: counts.Hands,
    Body: counts.Body,
    Feet: counts.Feet,
    PlanarSphere: counts.PlanarSphere,
    LinkRope: counts.LinkRope,
    HeadTotal: preCounts.Head,
    HandsTotal: preCounts.Hands,
    BodyTotal: preCounts.Body,
    FeetTotal: preCounts.Feet,
    PlanarSphereTotal: preCounts.PlanarSphere,
    LinkRopeTotal: preCounts.LinkRope,
  }
  useOptimizerDisplayStore.getState().setPermutationDetails(permutationDetails)
  useOptimizerDisplayStore.getState().setPermutations(
    counts.Head
      * counts.Hands
      * counts.Body
      * counts.Feet
      * counts.PlanarSphere
      * counts.LinkRope,
  )
}

/**
 * Store fields that affect permutation counts. When any of these change,
 * permutations are automatically recalculated via the subscription below.
 */
const PERMUTATION_KEYS = [
  'characterId',
  'rank',
  'rankFilter',
  'enhance',
  'grade',
  'exclude',
  'includeEquippedRelics',
  'keepCurrentRelics',
  'mainBody',
  'mainFeet',
  'mainPlanarSphere',
  'mainLinkRope',
  'mainStatUpscaleLevel',
  'setFilters',
  'weights',
] as const

let permutationRafId: number | null = null

useOptimizerRequestStore.subscribe((state, prev) => {
  for (const key of PERMUTATION_KEYS) {
    if (state[key] !== prev[key]) {
      if (permutationRafId != null) cancelAnimationFrame(permutationRafId)
      permutationRafId = requestAnimationFrame(() => {
        permutationRafId = null
        recalculatePermutations()
      })
      return
    }
  }
})

// ----- Functions moved from OptimizerTabController -----

/**
 * Get a form that's ready for optimizer submission.
 */
export function getForm(): Form {
  const form = displayToInternal(useOptimizerRequestStore.getState())
  const simulations = useOptimizerDisplayStore.getState().statSimulations
  if (form.statSim) {
    form.statSim = {
      ...form.statSim,
      simulations,
    }
  }
  return form
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

  if (Object.values(Constants.SubStats).map((stat) => form.weights[stat]).filter((x) => !!x).length === 0) {
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

  persistenceService.upsertCharacterFromForm(form)
  SaveState.delayedSave()

  const selectedNodes = gridStore.optimizerGridApi()?.getSelectedNodes()
  if (!selectedNodes || selectedNodes.length === 0 || (selectedNodes[0]?.data?.statSim)) {
    // Cannot equip a stat sim or empty row
    return
  }

  const row = selectedNodes[0].data!
  const build = OptimizerTabController.calculateRelicIdsFromId(row.id) as Build

  equipmentService.equipRelicIds(Object.values(build), characterId)
  Message.success(i18next.t('optimizerTab:Sidebar.ResultsGroup.EquipSuccessMessage') /*'Equipped relics'*/)
  OptimizerTabController.setTopRow(row)
  useOptimizerDisplayStore.getState().setOptimizerBuild(build)
  SaveState.delayedSave()
}

/**
 * Reset form filters to defaults while preserving character/LC selection.
 */
export function resetFilters(): void {
  useOptimizerRequestStore.getState().resetFilters()
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

  // Persist the outgoing character's form before loading the new one
  const currentCharId = useOptimizerRequestStore.getState().characterId
  if (currentCharId && currentCharId !== characterId) {
    syncFormToCharacterStore()
  }

  OptimizerTabController.setRows([])
  OptimizerTabController.resetDataSource()
  const character = getCharacterById(characterId)
  const baseForm = character ? character.form : getDefaultForm({ id: characterId })
  // Spread defaults first, then saved values overwrite — fills gaps from newly added conditionals
  const controller = CharacterConditionalsResolver.get({ characterId, characterEidolon: baseForm.characterEidolon })
  const form = {
    ...baseForm,
    characterConditionals: {
      ...controller.defaults?.(),
      ...baseForm.characterConditionals,
    },
  }

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

  // Reset all progress and timing fields to prevent stale data from previous run
  useOptimizerDisplayStore.setState({
    permutationsSearched: 0,
    permutationsResults: 0,
    optimizerStartTime: null,
    optimizerEndTime: null,
    optimizationInProgress: true,
  })

  // Clear any stale post-search row filter so new results aren't filtered by a previous run's thresholds
  OptimizerTabController.clearFilterModel()

  // Delay the DB save so it doesn't block the optimizer start with a characters tab re-render
  requestIdleCallback(() => {
    persistenceService.upsertCharacterFromForm(form)
  })
  SaveState.delayedSave()

  const optimizationId = uuid()
  useOptimizerDisplayStore.getState().setOptimizationId(optimizationId)
  form.optimizationId = optimizationId
  form.statDisplay = useOptimizerRequestStore.getState().statDisplay

  optimizerFormCache.set(optimizationId, form)

  console.log('Form finished', form)

  // Use setTimeout(0) to yield to the browser so the UI can update (loading state) before the optimizer starts
  setTimeout(() => Optimizer.optimize(form), 0)
}
