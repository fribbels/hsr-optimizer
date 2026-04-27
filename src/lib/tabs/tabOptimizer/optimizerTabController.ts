import type {
  IGetRowsParams,
  IRowNode,
} from 'ag-grid-community'
import {
  Constants,
  type Parts,
} from 'lib/constants/constants'
import type {
  RelicsByPart,
  SingleRelicByPart,
} from 'lib/gpu/webgpuTypes'
import type {
  OptimizerDisplayData,
  OptimizerDisplayDataStatSim,
} from 'lib/optimization/bufferPacker'
import {
  columnsToAggregateMap,
  getGridColumn,
  SortOption,
} from 'lib/optimization/sortOptions'
import {
  Gradient,
  type GridAggregations,
} from 'lib/rendering/gradient'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { gridStore } from 'lib/stores/gridStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { getRelicById } from 'lib/stores/relic/relicStore'
import {
  getForm,
  optimizerFormCache,
} from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { smoothScrollNearest } from 'lib/utils/frontendUtils'
import type {
  Form,
  OptimizerForm,
} from 'types/form'

type PermutationSizes = {
  hSize: number,
  gSize: number,
  bSize: number,
  fSize: number,
  pSize: number,
  lSize: number,
}

type SortModel = {
  colId: string,
  sort: 'asc' | 'desc' | null,
}

const controllerState: {
  relics: RelicsByPart,
  permutationSizes: PermutationSizes,
  aggregations: GridAggregations | undefined,
  rows: OptimizerDisplayData[],
  filteredIndices: number[],
  filterModel: Form | undefined,
  sortModel: SortModel,
} = {
  relics: { Head: [], Hands: [], Body: [], Feet: [], PlanarSphere: [], LinkRope: [] },
  permutationSizes: { hSize: 0, gSize: 0, bSize: 0, fSize: 0, pSize: 0, lSize: 0 },
  aggregations: undefined,
  rows: [],
  filteredIndices: [],
  filterModel: undefined,
  sortModel: { colId: '', sort: null },
}

const columnsToAggregate = Object.keys(columnsToAggregateMap)

export const OptimizerTabController = {
  setMetadata: (inputPermutationSizes: PermutationSizes, inputRelics: RelicsByPart) => {
    controllerState.permutationSizes = inputPermutationSizes
    controllerState.relics = inputRelics
  },

  getAggregations: () => {
    return controllerState.aggregations
  },

  setRows: (newRows: OptimizerDisplayData[]) => {
    controllerState.rows = newRows
  },

  setTopRow: (row: OptimizerDisplayData, overwrite = false) => {
    if (overwrite) {
      gridStore.optimizerGridApi()?.updateGridOptions({ pinnedTopRowData: [row] })
      return
    }

    const currentPinned = gridStore.optimizerGridApi()?.getGridOption('pinnedTopRowData') ?? []
    currentPinned[0] = row
    gridStore.optimizerGridApi()?.updateGridOptions({ pinnedTopRowData: currentPinned })
  },

  getRows: () => {
    return controllerState.rows
  },

  scrollToGrid: () => {
    const element = document.getElementById('optimizerGridContainer')
    if (element) {
      smoothScrollNearest(element, 250)
    }
  },

  cellClicked: (node: IRowNode<OptimizerDisplayDataStatSim>) => {
    const data = node.data!
    const gridApi = gridStore.optimizerGridApi()

    useOptimizerDisplayStore.getState().setOptimizerSelectedRowData(data)

    if (!gridApi) return

    if (node.rowPinned === 'top') {
      // Clicking the top row should display current relics
      console.log('Top row clicked', data)
      const form = getForm()
      if (data && form.characterId) {
        if (!data.id) {
          gridApi.deselectAll()
        }

        const character = getCharacterById(form.characterId)

        if (character && data.id) {
          // These are pinned rows
          const rowId = data.id
          const build = OptimizerTabController.calculateRelicIdsFromId(rowId, form)

          useOptimizerDisplayStore.getState().setOptimizerBuild(build)

          // Find the row by its string ID and select it
          const rowNode: IRowNode<OptimizerDisplayData> = gridApi.getRowNode(String(data.id))!
          if (rowNode) {
            const currentPinned: OptimizerDisplayData[] = gridApi.getGridOption('pinnedTopRowData') ?? []

            if (String(currentPinned[0].id) === String(rowNode.data!.id)) {
              // The currently equipped top row shouldn't correspond to an optimizer row, deselect
              gridStore.optimizerGridApi()?.deselectAll()
            } else {
              gridApi.deselectAll()
              rowNode.setSelected(true)
            }
          }
        } else if (character) {
          useOptimizerDisplayStore.getState().setOptimizerBuild(character.equipped)
        }
      }
      return
    }

    console.log('cellClicked', node)

    if (data.statSim) {
      const key = data.statSim.key
      useOptimizerDisplayStore.getState().setSelectedStatSimulations([key])
      useOptimizerDisplayStore.getState().setOptimizerBuild({})
      gridStore.optimizerGridApi()?.deselectAll()
      return
    }

    gridApi.deselectAll()
    node.setSelected(true)
    const build = OptimizerTabController.calculateRelicIdsFromId(data.id)

    useOptimizerDisplayStore.getState().setOptimizerBuild(build)
  },

  getColumnsToAggregate: () => {
    return columnsToAggregate
  },
  getColumnsToAggregateMap: () => {
    return columnsToAggregateMap
  },

  clearFilterModel: () => {
    controllerState.filterModel = undefined
  },

  resetDataSource: () => {
    gridStore.optimizerGridApi()?.updateGridOptions({
      datasource: OptimizerTabController.getDataSource(controllerState.sortModel, controllerState.filterModel),
    })
  },

  getDataSource: (newSortModel?: SortModel, newFilterModel?: Form) => {
    if (newSortModel) controllerState.sortModel = newSortModel
    if (newFilterModel) controllerState.filterModel = newFilterModel

    return {
      getRows: (params: IGetRowsParams) => {
        // fast clickers can race unmount/remount and cause NPE here.
        gridStore.optimizerGridApi()?.setGridOption('loading', true)

        // Yield one frame so the loading indicator can paint before we block
        requestAnimationFrame(() => {
          if (!gridStore.optimizerGridApi()) return
          Gradient.clearOptimizerGradientCache()
          const newSort = params.sortModel[0]
          if (
            params.sortModel.length > 0
            && (newSort.colId !== controllerState.sortModel.colId
              || newSort.sort !== controllerState.sortModel.sort)
          ) {
            controllerState.sortModel = newSort
            sort()
          }

          if (controllerState.filterModel) {
            filter(controllerState.filterModel)
            const indicesSubArray = controllerState.filteredIndices.slice(params.startRow, params.endRow)
            const subArray: OptimizerDisplayData[] = []
            for (const index of indicesSubArray) {
              subArray.push(controllerState.rows[index])
            }
            aggregate(subArray)
            params.successCallback(subArray, controllerState.filteredIndices.length)
          } else {
            const subArray = controllerState.rows.slice(params.startRow, params.endRow)
            aggregate(subArray)

            params.successCallback(subArray, controllerState.rows.length)
          }

          // Refresh pinned top row so its gradient colors reflect the updated aggregations
          const pinnedNode = gridStore.optimizerGridApi()?.getPinnedTopRow(0)
          if (pinnedNode) {
            gridStore.optimizerGridApi()?.refreshCells({ rowNodes: [pinnedNode], force: true })
          }

          // cannot assume a fast click race-condition didn't happen
          gridStore.optimizerGridApi()?.setGridOption('loading', false)
        })
      },
    }
  },

  // Unpack a permutation ID to its respective relics
  calculateRelicsFromId: (id: number, form?: OptimizerForm) => {
    if (id === -1) { // special case for equipped build optimizer row
      const request = form ?? optimizerFormCache.get(useOptimizerDisplayStore.getState().optimizationId!)
      if (!request) {
        return {}
      }

      const build = getCharacterById(request.characterId)!.equipped
      const out: Partial<SingleRelicByPart> = {}
      for (const key of Object.keys(build) as Parts[]) {
        out[key] = getRelicById(build[key]!)
      }
      return out
    }
    const lSize = controllerState.permutationSizes.lSize
    const pSize = controllerState.permutationSizes.pSize
    const fSize = controllerState.permutationSizes.fSize
    const bSize = controllerState.permutationSizes.bSize
    const gSize = controllerState.permutationSizes.gSize
    const hSize = controllerState.permutationSizes.hSize

    const x = id
    const l = x % lSize
    const p = ((x - l) / lSize) % pSize
    const f = ((x - p * lSize - l) / (lSize * pSize)) % fSize
    const b = ((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize
    const g = ((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize
    const h =
      ((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize))
      % hSize

    return {
      Head: controllerState.relics.Head[h],
      Hands: controllerState.relics.Hands[g],
      Body: controllerState.relics.Body[b],
      Feet: controllerState.relics.Feet[f],
      PlanarSphere: controllerState.relics.PlanarSphere[p],
      LinkRope: controllerState.relics.LinkRope[l],
    }
  },

  calculateRelicIdsFromId: (id: number, form?: Form) => {
    const relicsFromId = OptimizerTabController.calculateRelicsFromId(id, form)

    return {
      Head: relicsFromId.Head?.id,
      Hands: relicsFromId.Hands?.id,
      Body: relicsFromId.Body?.id,
      Feet: relicsFromId.Feet?.id,
      PlanarSphere: relicsFromId.PlanarSphere?.id,
      LinkRope: relicsFromId.LinkRope?.id,
    }
  },

  redrawRows: () => {
    gridStore.optimizerGridApi()?.refreshCells({ force: true })
  },

  applyRowFilters: () => {
    const fieldValues = getForm()
    fieldValues.statDisplay = useOptimizerRequestStore.getState().statDisplay
    controllerState.filterModel = fieldValues
    console.log('Apply filters to rows', fieldValues)
    OptimizerTabController.resetDataSource()
  },
}

function aggregate(subArray: OptimizerDisplayData[]) {
  const minAgg: Record<string, number> = {}
  const maxAgg: Record<string, number> = {}
  for (const column of OptimizerTabController.getColumnsToAggregate()) {
    minAgg[column] = Constants.MAX_INT
    maxAgg[column] = 0
  }

  minAgg.WEIGHT = Constants.MAX_INT
  maxAgg.WEIGHT = 0

  for (const row of subArray) {
    for (const column of OptimizerTabController.getColumnsToAggregate()) {
      const value = row[column as keyof OptimizerDisplayData] as number
      if (value < minAgg[column]) minAgg[column] = value
      if (value > maxAgg[column]) maxAgg[column] = value
    }
  }
  controllerState.aggregations = {
    min: minAgg,
    max: maxAgg,
  }
}

function sort() {
  const colId = controllerState.sortModel.colId as keyof OptimizerDisplayData
  const desc = controllerState.sortModel.sort === 'desc'
  controllerState.rows.sort((a, b) => {
    const aVal = a[colId] as number
    const bVal = b[colId] as number
    return desc ? bVal - aVal : aVal - bVal
  })
}

function filter(filterModel: Form) {
  const statDisplay = filterModel.statDisplay ?? ''
  const memoDisplay = filterModel.memoDisplay ?? ''

  // Precompute active filter checks from SortOption (grid column depends on display mode)
  const checks: { col: keyof OptimizerDisplayData, min: number, max: number }[] = []
  for (const option of Object.values(SortOption)) {
    if (!option.minFilterKey || !option.maxFilterKey) continue
    const min = filterModel[option.minFilterKey as keyof Form] as number
    const max = filterModel[option.maxFilterKey as keyof Form] as number
    if (min === 0 && max === Constants.MAX_INT) continue
    const col = getGridColumn(option, statDisplay, memoDisplay) as keyof OptimizerDisplayData
    checks.push({ col, min, max })
  }

  const indices: number[] = []
  for (let i = 0; i < controllerState.rows.length; i++) {
    const row = controllerState.rows[i]
    let valid = true
    for (const check of checks) {
      const value = row[check.col] as number
      if (value < check.min || value > check.max) {
        valid = false
        break
      }
    }
    if (valid) {
      indices.push(i)
    }
  }

  controllerState.filteredIndices = indices
}
