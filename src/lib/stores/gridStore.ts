import type { ApplyColumnStateParams } from 'ag-grid-community'
import type { AgGridReact } from 'ag-grid-react'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import type { ScoredRelic } from 'lib/relics/scoreRelics'
import type { RefObject } from 'react'

let _optimizerGrid: RefObject<AgGridReact<OptimizerDisplayDataStatSim> | null> | null = null
let _relicsGrid: RefObject<AgGridReact<ScoredRelic> | null> | null = null

export const gridStore = {
  // Optimizer grid
  setOptimizerGrid(ref: RefObject<AgGridReact<OptimizerDisplayDataStatSim> | null>) {
    _optimizerGrid = ref
  },
  getOptimizerGrid() {
    return _optimizerGrid
  },
  optimizerGridApi() {
    const api = _optimizerGrid?.current?.api
    return api && !api.isDestroyed() ? api : undefined
  },

  // Relics grid
  setRelicsGrid(ref: RefObject<AgGridReact<ScoredRelic> | null>) {
    _relicsGrid = ref
  },
  getRelicsGrid() {
    return _relicsGrid
  },
  relicsGridApi() {
    const api = _relicsGrid?.current?.api
    return api && !api.isDestroyed() ? api : undefined
  },
}

export function setSortColumn(columnId: string) {
  const columnState: ApplyColumnStateParams = {
    state: [{ colId: columnId, sort: 'desc' }],
    defaultState: { sort: null },
  }
  gridStore.optimizerGridApi()?.applyColumnState(columnState)
}
