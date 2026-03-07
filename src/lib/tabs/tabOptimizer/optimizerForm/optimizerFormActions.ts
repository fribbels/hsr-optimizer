import { Optimizer } from 'lib/optimization/optimizer'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { updateConditionalChange } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { Form } from 'types/form'

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

  // Build a changedValues-like object for updateConditionalChange
  const [first, ...rest] = itemName

  if (teammateKeys.has(first as string)) {
    // Teammate path: ['teammate0', 'characterConditionals', 'key']
    const [condType, key] = rest
    updateConditionalChange({ [first]: { [condType]: { [key]: value } } } as unknown as Form)
  } else if (first === 'setConditionals') {
    // Set conditional: ['setConditionals', 'SetName', 1]
    const [setName] = rest
    // Set conditionals use legacy [undefined, value] format in change events
    updateConditionalChange({ setConditionals: { [setName]: [undefined, value] } } as unknown as Form)
  } else {
    // Main character: ['characterConditionals', 'key'] or ['lightConeConditionals', 'key']
    const [condType, key] = itemName
    updateConditionalChange({ [condType]: { [key]: value } } as unknown as Form)
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
  window.store.getState().setPermutationDetails(permutationDetails)
  window.store.getState().setPermutations(
    relics.Head.length
      * relics.Hands.length
      * relics.Body.length
      * relics.Feet.length
      * relics.PlanarSphere.length
      * relics.LinkRope.length,
  )
}
