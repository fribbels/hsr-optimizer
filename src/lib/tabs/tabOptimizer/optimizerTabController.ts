import {
  IGetRowsParams,
  IRowNode,
} from 'ag-grid-community'
import { inPlaceSort } from 'fast-sort'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  RelicsByPart,
  SingleRelicByPart,
} from 'lib/gpu/webgpuTypes'
import {
  OptimizerDisplayData,
  OptimizerDisplayDataStatSim,
} from 'lib/optimization/bufferPacker'
import { GridAggregations } from 'lib/rendering/gradient'
import {
  columnsToAggregateMap,
  getGridColumn,
  SortOption,
} from 'lib/optimization/sortOptions'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import {
  equipClicked,
  getForm,
  optimizerFormCache,
  recalculatePermutations,
  resetFilters,
  setCharacter,
  updateCharacter,
  validateForm,
} from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { optimizerGridApi } from 'lib/utils/gridUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import {
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
  sort: string,
}

let relics: RelicsByPart
let permutationSizes: PermutationSizes
let aggregations: GridAggregations
let rows: OptimizerDisplayData[] = []
let filteredIndices: number[]
let filterModel: Form
let sortModel: SortModel

const columnsToAggregate = Object.keys(columnsToAggregateMap)

export const OptimizerTabController = {
  setMetadata: (inputPermutationSizes: PermutationSizes, inputRelics: RelicsByPart) => {
    permutationSizes = inputPermutationSizes
    relics = inputRelics
  },

  getAggregations: () => {
    return aggregations
  },

  setRows: (newRows: OptimizerDisplayData[]) => {
    rows = newRows
  },

  setTopRow: (row: OptimizerDisplayData, overwrite = false) => {
    if (overwrite) {
      window.optimizerGrid.current?.api?.updateGridOptions({ pinnedTopRowData: [row] })
      return
    }

    const currentPinned = window.optimizerGrid?.current?.api?.getGridOption('pinnedTopRowData') ?? []
    currentPinned[0] = row
    window.optimizerGrid.current?.api?.updateGridOptions({ pinnedTopRowData: currentPinned })
  },

  getRows: () => {
    return rows
  },

  scrollToGrid: () => {
    const element = document.getElementById('optimizerGridContainer')
    if (element) {
      TsUtils.smoothScrollNearest(element, 250)
    }
  },

  // Delegate to optimizerFormActions
  getForm: () => getForm(),
  validateForm: (form: Form) => validateForm(form),
  equipClicked: () => equipClicked(),
  resetFilters: () => resetFilters(),
  setCharacter: (id: CharacterId) => setCharacter(id),
  updateCharacter: (characterId: CharacterId) => updateCharacter(characterId),

  updateFilters: () => {
    recalculatePermutations()
  },

  cellClicked: (node: IRowNode<OptimizerDisplayDataStatSim>) => {
    const data = node.data!
    const gridApi = optimizerGridApi()

    useOptimizerUIStore.getState().setOptimizerSelectedRowData(data)

    if (!gridApi) return

    if (node.rowPinned == 'top') {
      // Clicking the top row should display current relics
      console.log('Top row clicked', data)
      const form = getForm()
      if (data && form.characterId) {
        if (!data.id) {
          gridApi.deselectAll()
        }

        const character = DB.getCharacterById(form.characterId)

        if (character && data.id) {
          // These are pinned rows
          const rowId = data.id
          const build = OptimizerTabController.calculateRelicIdsFromId(rowId, form)

          useOptimizerUIStore.getState().setOptimizerBuild(build)

          // Find the row by its string ID and select it
          const rowNode: IRowNode<OptimizerDisplayData> = gridApi.getRowNode(String(data.id))!
          if (rowNode) {
            const currentPinned: OptimizerDisplayData[] = gridApi.getGridOption('pinnedTopRowData') ?? []

            if (String(currentPinned[0].id) == String(rowNode.data!.id)) {
              // The currently equipped top row shouldn't correspond to an optimizer row, deselect
              window.optimizerGrid.current?.api.deselectAll()
            } else {
              rowNode.setSelected(true)
            }
          }
        } else if (character) {
          useOptimizerUIStore.getState().setOptimizerBuild(character.equipped)
        }
      }
      return
    }

    console.log('cellClicked', node)

    if (data.statSim) {
      const key = data.statSim.key
      useOptimizerUIStore.getState().setSelectedStatSimulations([key])
      useOptimizerUIStore.getState().setOptimizerBuild({})
      window.optimizerGrid.current?.api.deselectAll()
      return
    }

    const build = OptimizerTabController.calculateRelicIdsFromId(data.id)

    useOptimizerUIStore.getState().setOptimizerBuild(build)
  },

  getColumnsToAggregate: () => {
    return columnsToAggregate
  },
  getColumnsToAggregateMap: () => {
    return columnsToAggregateMap
  },

  resetDataSource: () => {
    window.optimizerGrid.current?.api?.updateGridOptions({ datasource: OptimizerTabController.getDataSource(sortModel, filterModel) })
  },

  getDataSource: (newSortModel?: SortModel, newFilterModel?: Form) => {
    if (newSortModel) sortModel = newSortModel
    if (newFilterModel) filterModel = newFilterModel

    return {
      getRows: (params: IGetRowsParams) => {
        // @ts-ignore
        aggregations = undefined

        // fast clickers can race unmount/remount and cause NPE here.
        if (window?.optimizerGrid?.current?.api) {
          window.optimizerGrid.current?.api.setGridOption('loading', true)
        }

        // Give it time to show the loading page before we block
        void TsUtils.sleep(100)
          .then(() => {
            if (params.sortModel.length > 0 && params.sortModel[0] != sortModel) {
              sortModel = params.sortModel[0]
              sort()
            }

            if (filterModel) {
              filter(filterModel)
              const indicesSubArray = filteredIndices.slice(params.startRow, params.endRow)
              const subArray: OptimizerDisplayData[] = []
              for (const index of indicesSubArray) {
                subArray.push(rows[index])
              }
              aggregate(subArray)
              params.successCallback(subArray, filteredIndices.length)
            } else {
              const subArray = rows.slice(params.startRow, params.endRow)
              aggregate(subArray)

              params.successCallback(subArray, rows.length)
            }

            // cannot assume a fast click race-condition didn't happen
            if (window?.optimizerGrid?.current?.api) {
              window.optimizerGrid.current?.api.setGridOption('loading', false)
            }
            OptimizerTabController.redrawRows()
          })
      },
    }
  },

  // Unpack a permutation ID to its respective relics
  calculateRelicsFromId: (id: number, form?: OptimizerForm) => {
    if (id === -1) { // special case for equipped build optimizer row
      const request = form ?? optimizerFormCache[useOptimizerUIStore.getState().optimizationId!]
      if (!request) {
        return {}
      }

      const build = DB.getCharacterById(request.characterId)!.equipped
      const out: Partial<SingleRelicByPart> = {}
      for (const key of Object.keys(build) as Parts[]) {
        out[key] = DB.getRelicById(build[key]!)
      }
      return out
    }
    const lSize = permutationSizes.lSize
    const pSize = permutationSizes.pSize
    const fSize = permutationSizes.fSize
    const bSize = permutationSizes.bSize
    const gSize = permutationSizes.gSize
    const hSize = permutationSizes.hSize

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
      Head: relics.Head[h],
      Hands: relics.Hands[g],
      Body: relics.Body[b],
      Feet: relics.Feet[f],
      PlanarSphere: relics.PlanarSphere[p],
      LinkRope: relics.LinkRope[l],
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
    window.optimizerGrid.current?.api.refreshCells({ force: true })
  },

  applyRowFilters: () => {
    const fieldValues = getForm()
    fieldValues.statDisplay = useOptimizerFormStore.getState().statDisplay
    filterModel = fieldValues
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
  aggregations = {
    min: minAgg,
    max: maxAgg,
  }
}

function sort() {
  if (sortModel.sort == 'desc') {
    inPlaceSort(rows).desc((x) => x[sortModel.colId as keyof OptimizerDisplayData])
  } else {
    inPlaceSort(rows).asc((x) => x[sortModel.colId as keyof OptimizerDisplayData])
  }
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
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
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

  filteredIndices = indices
}
