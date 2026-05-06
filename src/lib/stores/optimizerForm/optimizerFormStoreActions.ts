import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { generateConditionalResolverMetadata } from 'lib/optimization/combo/comboInitializers'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { internalFormToState } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { createDefaultFormState } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import {
  type OptimizerRequestState,
  type TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import { type SetFilters } from 'lib/stores/optimizerForm/setFilterTypes'
import type {
  MainConditionalType,
  TeammateConditionalType,
} from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { mergeDefinedValues } from 'lib/utils/objectUtils'
import { type Form } from 'types/form'

export type SuggestionFixes = {
  setFilters?: SetFilters,
  mainBody?: string[],
  mainFeet?: string[],
  mainPlanarSphere?: string[],
  mainLinkRope?: string[],
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
  if (converted.setConditionals && defaults.setConditionals) {
    merged.setConditionals = { ...defaults.setConditionals, ...converted.setConditionals }
  }

  mergeConditionalDefaults(merged, form)

  return merged
}

/**
 * Fills in missing conditional values from controller defaults.
 * Saved values take priority — defaults only fill gaps from newly added conditionals.
 * Covers: main character (char + LC), all teammates (char + LC).
 */
function mergeConditionalDefaults(state: OptimizerRequestState, form: Form): void {
  const dbMetadata = getGameMetadata()
  if (!dbMetadata?.characters) return

  // Main character conditionals
  if (form.characterId) {
    const charController = CharacterConditionalsResolver.get({
      characterId: form.characterId,
      characterEidolon: form.characterEidolon,
    })
    const charDefaults = charController.defaults?.()
    if (charDefaults) {
      state.characterConditionals = { ...charDefaults, ...state.characterConditionals }
    }

    if (form.lightCone) {
      const lcDefaults = resolveLcDefaults(form, dbMetadata, false)
      if (lcDefaults) {
        state.lightConeConditionals = { ...lcDefaults, ...state.lightConeConditionals }
      }
    }
  }

  // Teammate conditionals
  const teammates = [form.teammate0, form.teammate1, form.teammate2] as const
  for (let i = 0; i < 3; i++) {
    const teammate = teammates[i]
    if (!teammate?.characterId) continue
    const tmState = state.teammates[i]

    const charController = CharacterConditionalsResolver.get({
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
    })
    const charDefaults = charController.teammateDefaults?.()
    if (charDefaults) {
      tmState.characterConditionals = { ...charDefaults, ...tmState.characterConditionals }
    }

    if (teammate.lightCone) {
      const lcDefaults = resolveLcDefaults(teammate, dbMetadata, true)
      if (lcDefaults) {
        tmState.lightConeConditionals = { ...lcDefaults, ...tmState.lightConeConditionals }
      }
    }
  }
}

export function resolveLcDefaults(
  config: { characterId: string, characterEidolon: number, lightCone: string, lightConeSuperimposition: number },
  dbMetadata: ReturnType<typeof getGameMetadata>,
  isTeammate: boolean,
): Record<string, boolean | number> | undefined {
  const lcRequest = generateConditionalResolverMetadata(config as any, dbMetadata)
  const lcController = LightConeConditionalsResolver.get(lcRequest)
  return isTeammate ? lcController.teammateDefaults?.() : lcController.defaults?.()
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
