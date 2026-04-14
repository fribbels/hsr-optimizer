import { internalFormToState } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { createDefaultFormState } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { type OptimizerRequestState, type TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import type { MainConditionalType, TeammateConditionalType } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { type SetFilters } from 'lib/stores/optimizerForm/setFilterTypes'
import { mergeDefinedValues } from 'lib/utils/objectUtils'
import { type Form } from 'types/form'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'

export type SuggestionFixes = {
  setFilters?: SetFilters
  mainBody?: string[]
  mainFeet?: string[]
  mainPlanarSphere?: string[]
  mainLinkRope?: string[]
}

/**
 * Pure function: compute the new state for resetFilters.
 * Resets relic filter fields to defaults while preserving character/LC identity.
 */
export function computeResetFilters(state: OptimizerRequestState): Partial<OptimizerRequestState> {
  const defaults = createDefaultFormState()
  return {
    // Reset relic filter fields to defaults
    enhance: defaults.enhance,
    grade: defaults.grade,
    rank: defaults.rank,
    exclude: defaults.exclude,
    includeEquippedRelics: defaults.includeEquippedRelics,
    keepCurrentRelics: defaults.keepCurrentRelics,
    mainStatUpscaleLevel: defaults.mainStatUpscaleLevel,
    rankFilter: defaults.rankFilter,
    mainHead: defaults.mainHead,
    mainHands: defaults.mainHands,
    mainBody: defaults.mainBody,
    mainFeet: defaults.mainFeet,
    mainPlanarSphere: defaults.mainPlanarSphere,
    mainLinkRope: defaults.mainLinkRope,
    setFilters: defaults.setFilters,
    // Preserve character/LC
    characterId: state.characterId,
    characterEidolon: state.characterEidolon,
    lightCone: state.lightCone,
    lightConeSuperimposition: state.lightConeSuperimposition,
  }
}

/**
 * Pure function: compute the patch for applySuggestionFixes.
 * Returns only the fields that are present in fixes.
 */
export function computeApplySuggestionFixes(_state: OptimizerRequestState, fixes: SuggestionFixes): Partial<OptimizerRequestState> {
  const patch: Partial<OptimizerRequestState> = {}
  if (fixes.setFilters !== undefined) patch.setFilters = fixes.setFilters
  if (fixes.mainBody !== undefined) patch.mainBody = fixes.mainBody
  if (fixes.mainFeet !== undefined) patch.mainFeet = fixes.mainFeet
  if (fixes.mainPlanarSphere !== undefined) patch.mainPlanarSphere = fixes.mainPlanarSphere
  if (fixes.mainLinkRope !== undefined) patch.mainLinkRope = fixes.mainLinkRope
  return patch
}

/**
 * Pure function: compute the new state for loadForm.
 * Converts an internal Form to display-format state, merging with defaults.
 */
export function computeLoadForm(form: Form): OptimizerRequestState {
  const defaults = createDefaultFormState()
  const converted = internalFormToState(form)
  const merged = mergeDefinedValues({ ...defaults }, converted)
  // Merge setConditionals: fill in missing keys from defaults (handles old saves missing newer sets)
  if (converted.setConditionals && defaults.setConditionals) {
    merged.setConditionals = { ...defaults.setConditionals, ...converted.setConditionals }
  }
  return merged
}

/**
 * Pure function: compute state update for setting a main character conditional.
 * Handles both characterConditionals and lightConeConditionals.
 */
export function computeSetMainCharacterConditional(
  state: OptimizerRequestState,
  condType: MainConditionalType,
  key: string,
  value: boolean | number,
): Partial<OptimizerRequestState> {
  return {
    [condType]: {
      ...state[condType],
      [key]: value,
    },
  }
}

/**
 * Pure function: compute state update for setting a teammate conditional.
 */
export function computeSetTeammateConditional(
  state: OptimizerRequestState,
  teammateIndex: 0 | 1 | 2,
  condType: TeammateConditionalType,
  key: string,
  value: boolean | number,
): Partial<OptimizerRequestState> {
  const teammates = [...state.teammates] as [TeammateState, TeammateState, TeammateState]
  const tm = { ...teammates[teammateIndex] }
  tm[condType] = {
    ...tm[condType],
    [key]: value,
  }
  teammates[teammateIndex] = tm
  return { teammates }
}

/**
 * Pure function: compute state update for setting a set conditional.
 * Set conditionals use the legacy [undefined, value] tuple format.
 */
export function computeSetSetConditional(
  state: { setConditionals: SetConditionals },
  key: string,
  value: boolean | number,
): { setConditionals: SetConditionals } {
  const setConditionals = { ...state.setConditionals } as Record<string, [undefined, boolean | number]>
  const existing = setConditionals[key]
  const tuple: [undefined, boolean | number] = existing ? [...existing] : [undefined, value]
  tuple[1] = value
  setConditionals[key] = tuple
  return { setConditionals }
}
