import { internalToDisplay } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { OptimizerFormState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { Form } from 'types/form'

/**
 * Sync antd Form state to the Zustand store.
 * Called at lifecycle boundaries where the form state is "settled."
 *
 * The Form object is in INTERNAL format (what antd holds):
 * - Stat filters: 0 = no min, MAX_INT = no max, percentages as decimals
 * - Teammates: flat teammate0/1/2
 *
 * This function converts to DISPLAY format (what the store holds):
 * - Stat filters: undefined = no filter, percentages as whole numbers
 * - Teammates: tuple
 */
export function syncFormToStore(form: Form): void {
  // Convert stat/rating filters and teammates using internalToDisplay
  const { statFilters, ratingFilters, teammates } = internalToDisplay(form)

  const storeState: Partial<OptimizerFormState> = {
    // Character identity
    characterId: form.characterId,
    characterEidolon: form.characterEidolon,
    characterLevel: form.characterLevel,
    lightCone: form.lightCone,
    lightConeLevel: form.lightConeLevel,
    lightConeSuperimposition: form.lightConeSuperimposition,

    // Teammates
    teammates,

    // Conditionals
    characterConditionals: form.characterConditionals ?? {},
    lightConeConditionals: form.lightConeConditionals ?? {},
    setConditionals: form.setConditionals,

    // Relic filters
    enhance: form.enhance,
    grade: form.grade,
    rank: form.rank,
    exclude: form.exclude ?? [],
    includeEquippedRelics: form.includeEquippedRelics,
    keepCurrentRelics: form.keepCurrentRelics,
    rankFilter: form.rankFilter,
    mainStatUpscaleLevel: form.mainStatUpscaleLevel,
    mainHead: form.mainHead ?? [],
    mainHands: form.mainHands ?? [],
    mainBody: form.mainBody ?? [],
    mainFeet: form.mainFeet ?? [],
    mainPlanarSphere: form.mainPlanarSphere ?? [],
    mainLinkRope: form.mainLinkRope ?? [],
    relicSets: form.relicSets ?? [],
    ornamentSets: form.ornamentSets ?? [],
    weights: form.weights,

    // Stat / rating filters (converted to display format)
    statFilters,
    ratingFilters,

    // Enemy config
    enemyLevel: form.enemyLevel,
    enemyCount: form.enemyCount,
    enemyResistance: form.enemyResistance,
    enemyEffectResistance: form.enemyEffectResistance,
    enemyMaxToughness: form.enemyMaxToughness,
    enemyElementalWeak: form.enemyElementalWeak,
    enemyWeaknessBroken: form.enemyWeaknessBroken,

    // Combo
    comboType: form.comboType,
    comboStateJson: form.comboStateJson,
    comboPreprocessor: form.comboPreprocessor,
    comboTurnAbilities: form.comboTurnAbilities,
    comboDot: form.comboDot,

    // Scoring / display
    resultSort: form.resultSort,
    resultsLimit: form.resultsLimit ?? 1024,
    deprioritizeBuffs: form.deprioritizeBuffs ?? false,
    combatBuffs: form.combatBuffs ?? {},
    statDisplay: form.statDisplay,
    memoDisplay: form.memoDisplay,

    // Team set contribution
    teamRelicSet: form.teamRelicSet,
    teamOrnamentSet: form.teamOrnamentSet,

    // Stat sim
    statSim: form.statSim,
  }

  useOptimizerFormStore.setState(storeState)
}

/**
 * Dev-mode assertion: verify antd Form and Zustand store are in sync.
 * Logs a console.warn with differing fields. No-op in production.
 * Call on setTimeout(0) after syncFormToStore so the form has settled.
 */
export function verifySync(): void {
  if (!import.meta.env.DEV) return

  const form = window.optimizerForm?.getFieldsValue?.()
  if (!form) return

  const state = useOptimizerFormStore.getState()

  const diffs: string[] = []

  // Check a representative subset of fields
  if (form.characterId !== state.characterId) diffs.push(`characterId: form=${form.characterId} store=${state.characterId}`)
  if (form.characterEidolon !== state.characterEidolon) diffs.push(`characterEidolon: form=${form.characterEidolon} store=${state.characterEidolon}`)
  if (form.lightCone !== state.lightCone) diffs.push(`lightCone: form=${form.lightCone} store=${state.lightCone}`)
  if (form.enhance !== state.enhance) diffs.push(`enhance: form=${form.enhance} store=${state.enhance}`)
  if (form.grade !== state.grade) diffs.push(`grade: form=${form.grade} store=${state.grade}`)
  if (form.enemyLevel !== state.enemyLevel) diffs.push(`enemyLevel: form=${form.enemyLevel} store=${state.enemyLevel}`)

  if (diffs.length > 0) {
    console.warn('[syncFormToStore] Form/Store divergence detected:', diffs)
  }
}
