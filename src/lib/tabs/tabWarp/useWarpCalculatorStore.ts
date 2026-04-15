import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  DEFAULT_WARP_REQUEST,
  type WarpRequest,
  type WarpResult,
} from 'lib/tabs/tabWarp/warpCalculatorController'
import { type Nullable } from 'types/common'

const defaultStateValues = {
  request: DEFAULT_WARP_REQUEST,
  result: null as WarpResult,
}

type WarpCalculatorStateValues = typeof defaultStateValues

type WarpCalculatorStateActions = {
  setRequest: (request: Nullable<WarpRequest>) => void,
  setResult: (result: WarpResult) => void,
}

type WarpCalculatorStoreState = WarpCalculatorStateValues & WarpCalculatorStateActions

export const useWarpCalculatorStore = createTabAwareStore<WarpCalculatorStoreState>((set) => ({
  ...defaultStateValues,

  setRequest: (request) => set({ request: request ?? DEFAULT_WARP_REQUEST }),
  setResult: (result) => set({ result }),
}))
