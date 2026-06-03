import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  DEFAULT_WARP_REQUEST,
  type WarpRequest,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { type Nullable } from 'types/common'

// Seed with a fresh request (own copy of the targets array) so the shared module-level
// DEFAULT_WARP_REQUEST can never be mutated through the store.
const defaultStateValues: { request: WarpRequest } = {
  request: { ...DEFAULT_WARP_REQUEST, targets: DEFAULT_WARP_REQUEST.targets.map((target) => ({ ...target })) },
}

type WarpCalculatorStateValues = typeof defaultStateValues

type WarpCalculatorStateActions = {
  setRequest: (request: Nullable<WarpRequest>) => void,
}

type WarpCalculatorStoreState = WarpCalculatorStateValues & WarpCalculatorStateActions

export const useWarpCalculatorStore = createTabAwareStore<WarpCalculatorStoreState>((set) => ({
  ...defaultStateValues,

  setRequest: (request) => set({ request: request ?? DEFAULT_WARP_REQUEST }),
}))
