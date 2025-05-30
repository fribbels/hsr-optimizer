import { DEFAULT_WARP_REQUEST, WarpRequest, WarpResult } from 'lib/tabs/tabWarp/warpCalculatorController'
import { create } from 'zustand'

const defaultStateValues = {
  request: DEFAULT_WARP_REQUEST,
  result: null as WarpResult,
}

type WarpCalculatorStateValues = typeof defaultStateValues

type WarpCalculatorStateActions = {
  setRequest: (request: WarpRequest) => void
  setResult: (result: WarpResult) => void
}

type WarpCalculatorStoreState = WarpCalculatorStateValues & WarpCalculatorStateActions

export const useWarpCalculatorStore = create<WarpCalculatorStoreState>()((set) => ({
  ...defaultStateValues,

  setRequest: (request: WarpRequest | null | undefined) => set({ request: request ?? DEFAULT_WARP_REQUEST }),
  setResult: (result: WarpResult) => set({ result }),
}))
