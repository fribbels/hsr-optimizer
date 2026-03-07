import { Optimizer } from 'lib/optimization/optimizer'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'

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
