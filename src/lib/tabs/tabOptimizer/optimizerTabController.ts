import { CellClickedEvent, IGetRowsParams, IRowNode } from 'ag-grid-community'
import { inPlaceSort } from 'fast-sort'
import { Constants, DEFAULT_STAT_DISPLAY, Stats } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import { OptimizerDisplayData, OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { StatCalculator } from 'lib/relics/statCalculator'
import { GridAggregations } from 'lib/rendering/gradient'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { initializeComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { displayToForm, formToDisplay } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormTransform'
import { optimizerGridApi } from 'lib/utils/gridUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'

type PermutationSizes = {
  hSize: number
  gSize: number
  bSize: number
  fSize: number
  pSize: number
  lSize: number
}

type SortModel = {
  colId: string
  sort: string
}

let relics: RelicsByPart
let permutationSizes: PermutationSizes
let aggregations: GridAggregations
let rows: OptimizerDisplayData[] = []
let filteredIndices: number[]
let filterModel: Form
let sortModel: SortModel

const columnsToAggregateMap = {
  [Stats.HP]: true,
  [Stats.ATK]: true,
  [Stats.DEF]: true,
  [Stats.SPD]: true,
  [Stats.CR]: true,
  [Stats.CD]: true,
  [Stats.EHR]: true,
  [Stats.RES]: true,
  [Stats.BE]: true,
  [Stats.ERR]: true,
  [Stats.OHB]: true,

  // For custom rows remember to set the min/max in aggregate()

  ED: true,
  WEIGHT: true,
  EHP: true,

  BASIC: true,
  SKILL: true,
  ULT: true,
  FUA: true,
  DOT: true,
  BREAK: true,
  COMBO: true,
  HEAL: true,
  SHIELD: true,

  xATK: true,
  xDEF: true,
  xHP: true,
  xSPD: true,
  xCR: true,
  xCD: true,
  xEHR: true,
  xRES: true,
  xBE: true,
  xERR: true,
  xOHB: true,
  xELEMENTAL_DMG: true,
}
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
      window.optimizerGrid.current?.api.updateGridOptions({ pinnedTopRowData: [row] })
      return
    }

    const currentPinned = window.optimizerGrid.current?.api.getGridOption('pinnedTopRowData') ?? []
    currentPinned[0] = row
    window.optimizerGrid.current?.api.updateGridOptions({ pinnedTopRowData: currentPinned })
  },

  getRows: () => {
    return rows
  },

  scrollToGrid: () => {
    document.getElementById('optimizerGridContainer')!.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },

  // Get a form that's ready for optimizer submission
  getForm: () => {
    const form = window.optimizerForm.getFieldsValue() as Form
    return OptimizerTabController.displayToForm(form)
  },

  // Convert a form to its visual representation
  formToDisplay: (form: Form) => {
    return formToDisplay(form)
  },

  // Parse out any invalid values and prepare the form for submission to optimizer
  displayToForm: (form: Form) => {
    return displayToForm(form)
  },

  equipClicked: () => {
    console.log('Equip clicked')
    const form = OptimizerTabController.getForm()
    const characterId = form.characterId

    if (!characterId) {
      return
    }

    DB.addFromForm(form)

    const selectedNodes = window.optimizerGrid.current?.api.getSelectedNodes() as IRowNode<OptimizerDisplayDataStatSim>[]
    if (!selectedNodes || selectedNodes.length == 0 || (selectedNodes[0]?.data?.statSim)) {
      // Cannot equip a stat sim or empty row
      return
    }

    const row = selectedNodes[0].data!
    const build = OptimizerTabController.calculateRelicIdsFromId(row.id)

    DB.equipRelicIdsToCharacter(Object.values(build), characterId)
    Message.success('Equipped relics')
    OptimizerTabController.setTopRow(row)
    window.store.getState().setOptimizerBuild(build)
    SaveState.delayedSave()
    OptimizerTabController.updateFilters()
  },

  cellClicked: (event: CellClickedEvent) => {
    const data = event.data as OptimizerDisplayDataStatSim
    const gridApi = optimizerGridApi()

    if (event.rowPinned == 'top') {
      // Clicking the top row should display current relics
      console.log('Top row clicked', data)
      const form = OptimizerTabController.getForm()
      if (data && form.characterId) {
        if (!data.id) {
          gridApi.deselectAll()
        }

        const character = DB.getCharacterById(form.characterId)

        if (character && data.id) {
          const rowId = data.id
          const build = OptimizerTabController.calculateRelicIdsFromId(rowId)
          window.store.getState().setOptimizerBuild(build)

          // Find the row by its string ID and select it
          const rowNode: IRowNode<OptimizerDisplayData> = gridApi.getRowNode(String(data.id)) as IRowNode<OptimizerDisplayData>
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
          window.store.getState().setOptimizerBuild(character.equipped)
        }
      }
      return
    }

    if (data.statSim) {
      const key = data.statSim.key
      window.store.getState().setSelectedStatSimulations([key])
      window.store.getState().setOptimizerBuild({})
      window.optimizerGrid.current?.api.deselectAll()
      return
    }

    console.log('cellClicked', event)

    const build = OptimizerTabController.calculateRelicIdsFromId(data.id)
    console.log('build', build)
    window.store.getState().setOptimizerBuild(build)
  },

  getColumnsToAggregate: () => {
    return columnsToAggregate
  },
  getColumnsToAggregateMap: () => {
    return columnsToAggregateMap
  },

  resetDataSource: () => {
    window.optimizerGrid.current?.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource(sortModel, filterModel) })
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
        void TsUtils.sleep(100).then(() => {
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
  calculateRelicsFromId: (id: number) => {
    const lSize = permutationSizes.lSize
    const pSize = permutationSizes.pSize
    const fSize = permutationSizes.fSize
    const bSize = permutationSizes.bSize
    const gSize = permutationSizes.gSize
    const hSize = permutationSizes.hSize

    const x = id
    const l = (x % lSize)
    const p = (((x - l) / lSize) % pSize)
    const f = (((x - p * lSize - l) / (lSize * pSize)) % fSize)
    const b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize)
    const g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize)
    const h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize)

    return {
      Head: relics.Head[h],
      Hands: relics.Hands[g],
      Body: relics.Body[b],
      Feet: relics.Feet[f],
      PlanarSphere: relics.PlanarSphere[p],
      LinkRope: relics.LinkRope[l],
    }
  },

  calculateRelicIdsFromId: (id: number) => {
    const relicsFromId = OptimizerTabController.calculateRelicsFromId(id)

    return {
      Head: relicsFromId.Head.id,
      Hands: relicsFromId.Hands.id,
      Body: relicsFromId.Body.id,
      Feet: relicsFromId.Feet.id,
      PlanarSphere: relicsFromId.PlanarSphere.id,
      LinkRope: relicsFromId.LinkRope.id,
    }
  },

  validateForm: (form: Form) => {
    console.log('validate', form)
    if (!form.lightCone || !form.lightConeSuperimposition) {
      Message.error('Missing light cone fields')
      console.log('Missing light cone')
      return false
    }

    if (!form.characterId || form.characterEidolon == undefined) {
      Message.error('Missing character fields')
      console.log('Missing character')
      return false
    }

    if (!form.resultsLimit || !form.resultSort) {
      Message.error('Missing optimization target fields')
      console.log('Missing optimization target fields')
      return false
    }

    if (Object.values(Constants.Stats).map((stat) => form.weights[stat]).filter((x) => !!x).length == 0) {
      Message.error('All substat weights are set to 0. Make sure to set the substat weights for your character or use the Recommended presets button.', 10)
      console.log('Top percent')
      return false
    }

    const metadata = DB.getMetadata()
    const lcMeta = metadata.lightCones[form.lightCone]
    const charMeta = metadata.characters[form.characterId]

    if (lcMeta.path != charMeta.path) {
      Message.warning('Character path doesn\'t match light cone path.', 10)
      console.log('Path mismatch')
    }

    return true
  },

  updateFilters: () => {
    if (window.optimizerForm && window.onOptimizerFormValuesChange) {
      const fieldValues = OptimizerTabController.getForm()
      window.onOptimizerFormValuesChange({} as Form, fieldValues)
    }
  },

  resetFilters: () => {
    const fieldValues = OptimizerTabController.getForm()
    const newForm: Partial<Form> = {
      characterEidolon: fieldValues.characterEidolon,
      characterId: fieldValues.characterId,
      characterLevel: 80,
      enhance: 9,
      grade: 5,
      mainStatUpscaleLevel: 15,
      rankFilter: true,
      includeEquippedRelics: true,
      keepCurrentRelics: false,
      lightCone: fieldValues.lightCone,
      lightConeLevel: 80,
      lightConeSuperimposition: fieldValues.lightConeSuperimposition,
      mainBody: [],
      mainFeet: [],
      mainHands: [],
      mainHead: [],
      mainLinkRope: [],
      mainPlanarSphere: [],
      ornamentSets: [],
      relicSets: [],
    }

    window.optimizerForm.setFieldsValue(OptimizerTabController.formToDisplay(newForm as Form))
    OptimizerTabController.updateFilters()
  },

  // Manually set the selected character
  setCharacter: (id: string) => {
    window.store.getState().setOptimizerTabFocusCharacter(id)
    window.optimizerForm.setFieldValue('characterId', id)

    window.store.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, id)
    SaveState.delayedSave()
  },

  // Update form values with the character
  updateCharacter: (characterId: string) => {
    console.log('@updateCharacter', characterId)
    if (!characterId) return
    const character = DB.getCharacterById(characterId)

    const form = character ? character.form : getDefaultForm({ id: characterId })
    const displayFormValues = OptimizerTabController.formToDisplay(form as Form)
    window.optimizerForm.setFieldsValue(displayFormValues)

    const comboState = initializeComboState(displayFormValues, true)
    window.store.getState().setComboState(comboState)

    // Setting timeout so this doesn't lag the modal close animation. The delay is mostly hidden by the animation
    setTimeout(() => {
      window.store.getState().setOptimizerFormSelectedLightCone(form.lightCone)
      window.store.getState().setOptimizerFormSelectedLightConeSuperimposition(form.lightConeSuperimposition)
      window.store.getState().setOptimizerTabFocusCharacter(characterId)
      window.store.getState().setOptimizerFormCharacterEidolon(form.characterEidolon)
      window.store.getState().setStatDisplay(form.statDisplay ?? DEFAULT_STAT_DISPLAY)
      window.store.getState().setStatSimulations(form.statSim?.simulations ?? [])
      // console.log('@updateForm', displayFormValues, character)

      window.onOptimizerFormValuesChange({} as Form, displayFormValues)
    }, 50)
  },

  redrawRows: () => {
    window.optimizerGrid.current?.api.refreshCells({ force: true })
  },

  applyRowFilters: () => {
    const fieldValues = OptimizerTabController.getForm()
    fieldValues.statDisplay = window.store.getState().statDisplay
    filterModel = fieldValues
    console.log('Apply filters to rows', fieldValues)
    OptimizerTabController.resetDataSource()
  },
}

function aggregate(subArray: OptimizerDisplayData[]) {
  const minAgg: Record<string, number> = StatCalculator.getZeroes()
  for (const column of OptimizerTabController.getColumnsToAggregate()) {
    minAgg[column] = Constants.MAX_INT
  }

  function setMinMax(name: string) {
    minAgg[name] = Constants.MAX_INT
    maxAgg[name] = 0
  }

  const maxAgg: Record<string, number> = StatCalculator.getZeroes()
  minAgg.ED = Constants.MAX_INT
  maxAgg.ED = 0
  minAgg.WEIGHT = Constants.MAX_INT
  maxAgg.WEIGHT = 0
  minAgg.EHP = Constants.MAX_INT
  maxAgg.EHP = 0

  setMinMax('BASIC')
  setMinMax('SKILL')
  setMinMax('ULT')
  setMinMax('FUA')
  setMinMax('DOT')
  setMinMax('BREAK')
  setMinMax('COMBO')
  setMinMax('HEAL')
  setMinMax('SHIELD')
  setMinMax('xATK')
  setMinMax('xDEF')
  setMinMax('xHP')
  setMinMax('xSPD')
  setMinMax('xCR')
  setMinMax('xCD')
  setMinMax('xEHR')
  setMinMax('xRES')
  setMinMax('xBE')
  setMinMax('xERR')
  setMinMax('xOHB')
  setMinMax('xELEMENTAL_DMG')

  for (const row of subArray) {
    for (const column of OptimizerTabController.getColumnsToAggregate()) {
      const value: number = row[column as keyof OptimizerDisplayData]
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
  const isCombat = filterModel.statDisplay == 'combat'
  const indices: number[] = []

  if (isCombat) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const valid
        = row.xHP >= filterModel.minHp && row.xHP <= filterModel.maxHp
        && row.xATK >= filterModel.minAtk && row.xATK <= filterModel.maxAtk
        && row.xDEF >= filterModel.minDef && row.xDEF <= filterModel.maxDef
        && row.xSPD >= filterModel.minSpd && row.xSPD <= filterModel.maxSpd
        && row.xCR >= filterModel.minCr && row.xCR <= filterModel.maxCr
        && row.xCD >= filterModel.minCd && row.xCD <= filterModel.maxCd
        && row.xEHR >= filterModel.minEhr && row.xEHR <= filterModel.maxEhr
        && row.xRES >= filterModel.minRes && row.xRES <= filterModel.maxRes
        && row.xBE >= filterModel.minBe && row.xBE <= filterModel.maxBe
        && row.xERR >= filterModel.minErr && row.xERR <= filterModel.maxErr
        && row.EHP >= filterModel.minEhp && row.EHP <= filterModel.maxEhp
        && row.BASIC >= filterModel.minBasic && row.BASIC <= filterModel.maxBasic
        && row.SKILL >= filterModel.minSkill && row.SKILL <= filterModel.maxSkill
        && row.ULT >= filterModel.minUlt && row.ULT <= filterModel.maxUlt
        && row.FUA >= filterModel.minFua && row.FUA <= filterModel.maxFua
        && row.DOT >= filterModel.minDot && row.DOT <= filterModel.maxDot
        && row.BREAK >= filterModel.minBreak && row.BREAK <= filterModel.maxBreak
        && row.HEAL >= filterModel.minHeal && row.HEAL <= filterModel.maxHeal
        && row.SHIELD >= filterModel.minShield && row.SHIELD <= filterModel.maxShield
      if (valid) {
        indices.push(i)
      }
    }
  } else {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const valid
        = row[Constants.Stats.HP] >= filterModel.minHp && row[Constants.Stats.HP] <= filterModel.maxHp
        && row[Constants.Stats.ATK] >= filterModel.minAtk && row[Constants.Stats.ATK] <= filterModel.maxAtk
        && row[Constants.Stats.DEF] >= filterModel.minDef && row[Constants.Stats.DEF] <= filterModel.maxDef
        && row[Constants.Stats.SPD] >= filterModel.minSpd && row[Constants.Stats.SPD] <= filterModel.maxSpd
        && row[Constants.Stats.CR] >= filterModel.minCr && row[Constants.Stats.CR] <= filterModel.maxCr
        && row[Constants.Stats.CD] >= filterModel.minCd && row[Constants.Stats.CD] <= filterModel.maxCd
        && row[Constants.Stats.EHR] >= filterModel.minEhr && row[Constants.Stats.EHR] <= filterModel.maxEhr
        && row[Constants.Stats.RES] >= filterModel.minRes && row[Constants.Stats.RES] <= filterModel.maxRes
        && row[Constants.Stats.BE] >= filterModel.minBe && row[Constants.Stats.BE] <= filterModel.maxBe
        && row[Constants.Stats.ERR] >= filterModel.minErr && row[Constants.Stats.ERR] <= filterModel.maxErr
        && row.EHP >= filterModel.minEhp && row.EHP <= filterModel.maxEhp
        && row.BASIC >= filterModel.minBasic && row.BASIC <= filterModel.maxBasic
        && row.SKILL >= filterModel.minSkill && row.SKILL <= filterModel.maxSkill
        && row.ULT >= filterModel.minUlt && row.ULT <= filterModel.maxUlt
        && row.FUA >= filterModel.minFua && row.FUA <= filterModel.maxFua
        && row.DOT >= filterModel.minDot && row.DOT <= filterModel.maxDot
        && row.BREAK >= filterModel.minBreak && row.BREAK <= filterModel.maxBreak
        && row.HEAL >= filterModel.minHeal && row.HEAL <= filterModel.maxHeal
        && row.SHIELD >= filterModel.minShield && row.SHIELD <= filterModel.maxShield
      if (valid) {
        indices.push(i)
      }
    }
  }

  filteredIndices = indices
}
