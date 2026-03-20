import type { OptimizerAction } from 'types/optimizer'

/**
 * Resets conditionalState by zeroing all existing keys instead of allocating a new object.
 * This avoids GC pressure from creating ~90K objects per search (15K evaluations × 6 actions).
 * V8 keeps the hidden class stable since we write the same property keys each time.
 */
export function resetConditionalState(action: OptimizerAction): void {
  const state = action.conditionalState
  if (state) {
    for (const key in state) {
      state[key] = 0
    }
  } else {
    action.conditionalState = {}
  }
}
