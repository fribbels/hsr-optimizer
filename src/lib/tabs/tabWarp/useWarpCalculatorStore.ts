import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  DEFAULT_WARP_REQUEST,
  type WarpRequest,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { type Nullable } from 'types/common'

// Create a fresh request so the shared module-level DEFAULT_WARP_REQUEST can never
// be mutated through the store.
function createDefaultWarpRequest(): WarpRequest {
  return {
    ...DEFAULT_WARP_REQUEST,
    targets: DEFAULT_WARP_REQUEST.targets.map((target) => ({ ...target })),
  }
}

const defaultStateValues: { request: WarpRequest } = {
  request: createDefaultWarpRequest(),
}

type WarpCalculatorStateValues = typeof defaultStateValues

type WarpCalculatorStateActions = {
  setRequest: (request: Nullable<WarpRequest>) => void,
}

type WarpCalculatorStoreState = WarpCalculatorStateValues & WarpCalculatorStateActions

export const useWarpCalculatorStore = createTabAwareStore<WarpCalculatorStoreState>((set) => ({
  ...defaultStateValues,

  setRequest: (request) => set({ request: request ?? createDefaultWarpRequest() }),
}))
