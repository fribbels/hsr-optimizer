import { inPlaceSort } from 'fast-sort'
import DB from 'lib/db'
import { Message } from 'lib/message'
import { SaveState } from 'lib/saveState'
import { CombatBuffs, ConditionalDataType, Constants, DamageKeys, DEFAULT_STAT_DISPLAY, Stats } from 'lib/constants'
import { Utils } from 'lib/utils'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { CharacterConditionals } from 'lib/characterConditionals'
import { CharacterStats } from 'lib/characterStats'
import { defaultEnemyOptions, defaultSetConditionals, defaultTeammate, getDefaultForm, getDefaultWeights } from 'lib/defaultForm'
import { SavedSessionKeys } from 'lib/constantsSession'
import { applyMetadataPresetToForm } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { initializeComboState } from 'lib/optimizer/rotation/comboDrawerController'
import { ConditionalSetMetadata } from 'lib/optimizer/rotation/setConditionalContent'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { GridAggregations } from 'lib/gradient'
import { Form, Teammate } from 'types/Form'
import { TsUtils } from 'lib/TsUtils'
import { CharacterConditionalMap } from 'types/CharacterConditional'
import { LightConeConditionalMap } from 'types/LightConeConditionals'
import { OptimizerDisplayData } from 'lib/bufferPacker'
import { CellClickedEvent, IGetRowsParams, IRowNode } from 'ag-grid-community'
import { OptimizerCombatBuffs } from 'types/Optimizer'

let relics: RelicsByPart
let consts: OptimizerSizes
let aggs: GridAggregations
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
  // For custom ones remember to set the min/max in aggregate()
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

type OptimizerSizes = {
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

export const OptimizerTabController = {
  setMetadata: (inputConsts: OptimizerSizes, inputRelics: RelicsByPart) => {
    consts = inputConsts
    relics = inputRelics
  },

  setAggs: (x: GridAggregations) => {
    aggs = x
  },

  getAggs: () => {
    return aggs
  },

  setRows: (x: OptimizerDisplayData[]) => {
    rows = x
  },

  setTopRow: (x: OptimizerDisplayData, overwrite = false) => {
    if (overwrite) {
      window.optimizerGrid.current?.api.updateGridOptions({ pinnedTopRowData: [x] })
      return
    }

    const currentPinned = window.optimizerGrid.current?.api.getGridOption('pinnedTopRowData') ?? []
    currentPinned[0] = x
    window.optimizerGrid.current?.api.updateGridOptions({ pinnedTopRowData: currentPinned })
  },

  getRows: () => {
    return rows
  },

  scrollToGrid: () => {
    document.getElementById('optimizerGridContainer')!.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },

  equipClicked: () => {
    console.log('Equip clicked')
    const formValues = OptimizerTabController.getForm()
    const characterId = formValues.characterId

    if (!characterId) {
      return
    }
    DB.addFromForm(formValues)

    const selectedNodes = window.optimizerGrid.current?.api.getSelectedNodes() as IRowNode<OptimizerDisplayData>[]
    if (!selectedNodes || selectedNodes.length == 0 || (selectedNodes[0]?.data?.statSim)) {
      return
    }

    const row = selectedNodes[0].data!
    const build = OptimizerTabController.calculateRelicIdsFromId(row.id)

    DB.equipRelicIdsToCharacter(Object.values(build), characterId)
    Message.success('Equipped relics')
    OptimizerTabController.setTopRow(row)
    window.setOptimizerBuild(build)
    SaveState.delayedSave()
    OptimizerTabController.updateFilters()
  },

  cellClicked: (event: CellClickedEvent) => {
    const data = event.data as OptimizerDisplayData

    if (event.rowPinned == 'top') {
      console.log('Top row clicked', event.data)
      const fieldValues = OptimizerTabController.getForm()
      if (event.data && fieldValues.characterId) {
        const character = DB.getCharacterById(fieldValues.characterId)

        if (!data.id) {
          window.optimizerGrid.current?.api.deselectAll()
        }

        if (character && data.id) {
          const rowId = data.id
          const build = OptimizerTabController.calculateRelicIdsFromId(rowId)
          window.setOptimizerBuild(build)

          // Find the row by its string ID and select it
          const rowNode: IRowNode<OptimizerDisplayData> = window.optimizerGrid.current?.api.getRowNode(String(data.id)) as IRowNode<OptimizerDisplayData>
          if (rowNode) {
            const currentPinned: OptimizerDisplayData[] = window.optimizerGrid.current?.api.getGridOption('pinnedTopRowData') ?? []

            if (String(currentPinned[0].id) == String(rowNode.data!.id)) {
              // The currently equipped top row shouldn't correspond to an optimizer row, deselect
              window.optimizerGrid.current?.api.deselectAll()
            } else {
              rowNode.setSelected(true)
            }
          }
        } else if (character) {
          window.setOptimizerBuild(character.equipped)
        }
      }
      return
    }

    if (data.statSim) {
      const key = data.statSim.key
      window.store.getState().setSelectedStatSimulations([key])
      window.setOptimizerBuild({})
      window.optimizerGrid.current?.api.deselectAll()
      return
    }

    console.log('cellClicked', event)

    const build = OptimizerTabController.calculateRelicIdsFromId(data.id)
    console.log('build', build)
    window.setOptimizerBuild(build)
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

  getDataSource: (newSortModel: SortModel, newFilterModel: Form) => {
    sortModel = newSortModel
    filterModel = newFilterModel
    return {
      getRows: (params: IGetRowsParams) => {
        // @ts-ignore
        aggs = undefined

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

  calculateRelicsFromId: (id: number) => {
    const lSize = consts.lSize
    const pSize = consts.pSize
    const fSize = consts.fSize
    const bSize = consts.bSize
    const gSize = consts.gSize
    const hSize = consts.hSize

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
  // Get a form that's ready for submission
  getForm: () => {
    const form = window.optimizerForm.getFieldsValue() as Form
    return OptimizerTabController.fixForm(form)
  },

  // Convert a form to its visual representation
  getDisplayFormValues: (form: Form) => {
    const characterId = form.characterId
    const newForm: Partial<Form> = TsUtils.clone(form)
    const metadata = DB.getMetadata().characters[characterId]
    const scoringMetadata = DB.getScoringMetadata(characterId)

    // Erase inputs where min == 0 and max == MAX_INT
    newForm.maxHp = unsetMax(form.maxHp)
    newForm.minHp = unsetMin(form.minHp)
    newForm.maxAtk = unsetMax(form.maxAtk)
    newForm.minAtk = unsetMin(form.minAtk)
    newForm.maxDef = unsetMax(form.maxDef)
    newForm.minDef = unsetMin(form.minDef)
    newForm.maxSpd = unsetMax(form.maxSpd)
    newForm.minSpd = unsetMin(form.minSpd)
    newForm.maxCr = unsetMax(form.maxCr, true)
    newForm.minCr = unsetMin(form.minCr, true)
    newForm.maxCd = unsetMax(form.maxCd, true)
    newForm.minCd = unsetMin(form.minCd, true)
    newForm.maxEhr = unsetMax(form.maxEhr, true)
    newForm.minEhr = unsetMin(form.minEhr, true)
    newForm.maxRes = unsetMax(form.maxRes, true)
    newForm.minRes = unsetMin(form.minRes, true)
    newForm.maxBe = unsetMax(form.maxBe, true)
    newForm.minBe = unsetMin(form.minBe, true)
    newForm.maxErr = unsetMax(form.maxErr, true)
    newForm.minErr = unsetMin(form.minErr, true)

    newForm.maxEhp = unsetMax(form.maxEhp)
    newForm.minEhp = unsetMin(form.minEhp)
    newForm.maxBasic = unsetMax(form.maxBasic)
    newForm.minBasic = unsetMin(form.minBasic)
    newForm.maxSkill = unsetMax(form.maxSkill)
    newForm.minSkill = unsetMin(form.minSkill)
    newForm.maxUlt = unsetMax(form.maxUlt)
    newForm.minUlt = unsetMin(form.minUlt)
    newForm.maxFua = unsetMax(form.maxFua)
    newForm.minFua = unsetMin(form.minFua)
    newForm.maxDot = unsetMax(form.maxDot)
    newForm.minDot = unsetMin(form.minDot)
    newForm.maxBreak = unsetMax(form.maxBreak)
    newForm.minBreak = unsetMin(form.minBreak)

    const combatBuffs = {} as Partial<OptimizerCombatBuffs>
    if (!form.combatBuffs) form.combatBuffs = {}
    for (const buff of Object.values(CombatBuffs)) {
      combatBuffs[buff.key] = unsetMin(form.combatBuffs[buff.key], buff.percent)
    }
    newForm.combatBuffs = combatBuffs as OptimizerCombatBuffs

    if (!newForm.setConditionals) {
      newForm.setConditionals = defaultSetConditionals
    } else {
      Utils.mergeUndefinedValues(newForm.setConditionals, defaultSetConditionals)
    }

    const enemyOptions = defaultEnemyOptions()

    if (!form.enemyLevel) {
      newForm.enemyLevel = enemyOptions.enemyLevel
    }

    if (!form.enemyCount) {
      newForm.enemyCount = enemyOptions.enemyCount
    }

    if (!form.enemyResistance) {
      newForm.enemyResistance = enemyOptions.enemyResistance
    }

    if (!form.enemyEffectResistance) {
      newForm.enemyEffectResistance = enemyOptions.enemyEffectResistance
    }

    if (form.enemyElementalWeak == null) {
      newForm.enemyElementalWeak = enemyOptions.enemyElementalWeak
    }

    if (form.enemyWeaknessBroken == null) {
      newForm.enemyWeaknessBroken = enemyOptions.enemyWeaknessBroken
    }

    if (!form.enemyMaxToughness) {
      newForm.enemyMaxToughness = enemyOptions.enemyMaxToughness
    }

    if (newForm.characterId) {
      const defaultOptions = CharacterConditionals.get(form).defaults()
      if (!newForm.characterConditionals) {
        newForm.characterConditionals = {} as CharacterConditionalMap
      }
      for (const option of Object.keys(defaultOptions)) {
        if (newForm.characterConditionals[option] == undefined) {
          newForm.characterConditionals[option] = defaultOptions[option]
        }
      }
    }

    if (newForm.lightCone) {
      const defaultLcOptions = LightConeConditionals.get(form).defaults()
      if (!newForm.lightConeConditionals) {
        newForm.lightConeConditionals = {} as LightConeConditionalMap
      }
      for (const option of Object.keys(defaultLcOptions)) {
        if (newForm.lightConeConditionals[option] == undefined) {
          newForm.lightConeConditionals[option] = defaultLcOptions[option]
        }
      }
    } else {
      newForm.lightCone = undefined
      newForm.lightConeLevel = 80
      newForm.lightConeSuperimposition = 1
      newForm.lightConeConditionals = {} as CharacterConditionalMap
    }

    if (!newForm.statDisplay) {
      newForm.statDisplay = DEFAULT_STAT_DISPLAY
    }

    const character = DB.getCharacterById(characterId)
    if (character) {
      newForm.rank = character.rank
    } else {
      newForm.rank = DB.getCharacters().length

      // Apply any presets to new characters
      if (metadata) {
        for (const preset of scoringMetadata.presets || []) {
          preset.apply(newForm)
        }

        newForm.mainBody = scoringMetadata.parts[Constants.Parts.Body]
        newForm.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
        newForm.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
        newForm.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
        newForm.weights = scoringMetadata.stats
        newForm.weights.headHands = 0
        newForm.weights.bodyFeet = 0
        newForm.weights.sphereRope = 0

        applyMetadataPresetToForm(newForm as Form, scoringMetadata)
      }
    }

    if (!newForm.weights) {
      newForm.weights = getDefaultWeights(characterId)
    }

    if (!newForm.weights.headHands) {
      newForm.weights.headHands = 0
    }
    if (!newForm.weights.bodyFeet) {
      newForm.weights.bodyFeet = 0
    }
    if (!newForm.weights.sphereRope) {
      newForm.weights.sphereRope = 0
    }

    if (!newForm.exclude) {
      newForm.exclude = []
    }

    // Clean up any deleted excluded characters
    newForm.exclude = newForm.exclude.filter((id) => DB.getCharacterById(id))

    // Some pre-existing saves had this default to undefined while the toggle defaults to true and hides the undefined.
    // Keeping this here for now
    if (newForm.includeEquippedRelics == null) {
      newForm.includeEquippedRelics = true
    }

    if (![1, 3, 5].includes(newForm.enemyCount!)) {
      newForm.enemyCount = 1
    }

    if (!form.teammate0?.characterId) form.teammate0 = defaultTeammate() as Teammate
    if (!form.teammate1?.characterId) form.teammate1 = defaultTeammate() as Teammate
    if (!form.teammate2?.characterId) form.teammate2 = defaultTeammate() as Teammate

    if (!newForm.weights) {
      newForm.weights = getDefaultWeights()
    }

    if (!newForm.resultSort) {
      if (metadata) {
        newForm.resultSort = metadata.scoringMetadata.sortOption.key
      }
    }

    if (!newForm.resultsLimit) {
      newForm.resultsLimit = 1024
    }

    if (!newForm.mainStatUpscaleLevel) {
      newForm.mainStatUpscaleLevel = 15
    }

    // if (!newForm.statSim) {
    //   newForm.statSim = {} as StatSim
    // }

    // if (!newForm.statSim.simulations) {
    //   newForm.statSim.simulations = []
    // }

    if (!newForm.combo) {
      newForm.combo = {}
    }

    if (!newForm.comboStateJson) {
      newForm.comboStateJson = '{}'
    }

    if (!newForm.comboAbilities) {
      const simulation = metadata.scoringMetadata?.simulation
      newForm.comboAbilities = simulation?.comboAbilities ?? [null, 'BASIC']
      newForm.comboDot = simulation?.comboDot ?? 0
      newForm.comboBreak = simulation?.comboBreak ?? 0
    }

    if (!newForm.comboType) {
      newForm.comboType = 'simple'
    }

    for (const [key, value] of Object.entries(newForm.setConditionals)) {
      if (!ConditionalSetMetadata[key]) {
        delete form.setConditionals[key]
        delete newForm.setConditionals[key]
        continue
      }
      if (ConditionalSetMetadata[key].type === ConditionalDataType.SELECT) {
        if (typeof value[1] != 'number') {
          newForm.setConditionals[key][1] = defaultSetConditionals[key][1]
        }
      } else {
        if (typeof value[1] != 'boolean') {
          newForm.setConditionals[key][1] = defaultSetConditionals[key][1]
        }
      }
    }

    // console.log('Form update', newForm)
    return newForm
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

    const lcMeta = DB.getMetadata().lightCones[form.lightCone]
    const charMeta = DB.getMetadata().characters[form.characterId]
    if (lcMeta.path != charMeta.path) {
      Message.warning('Character path doesn\'t match light cone path.', 10)
      console.log('Path mismatch')
    }

    return true
  },

  // Parse out any invalid values and prepare the form for submission to optimizer
  fixForm: (form: Form) => {
    const MAX_INT = Constants.MAX_INT

    form.statDisplay = window.store.getState().statDisplay || DEFAULT_STAT_DISPLAY

    form.maxHp = fixValue(form.maxHp, MAX_INT)
    form.minHp = fixValue(form.minHp, 0)
    form.maxAtk = fixValue(form.maxAtk, MAX_INT)
    form.minAtk = fixValue(form.minAtk, 0)
    form.maxDef = fixValue(form.maxDef, MAX_INT)
    form.minDef = fixValue(form.minDef, 0)
    form.maxSpd = fixValue(form.maxSpd, MAX_INT)
    form.minSpd = fixValue(form.minSpd, 0)
    form.maxCr = fixValue(form.maxCr, MAX_INT, 100)
    form.minCr = fixValue(form.minCr, 0, 100)
    form.maxCd = fixValue(form.maxCd, MAX_INT, 100)
    form.minCd = fixValue(form.minCd, 0, 100)
    form.maxEhr = fixValue(form.maxEhr, MAX_INT, 100)
    form.minEhr = fixValue(form.minEhr, 0, 100)
    form.maxRes = fixValue(form.maxRes, MAX_INT, 100)
    form.minRes = fixValue(form.minRes, 0, 100)
    form.maxBe = fixValue(form.maxBe, MAX_INT, 100)
    form.minBe = fixValue(form.minBe, 0, 100)
    form.maxErr = fixValue(form.maxErr, MAX_INT, 100)
    form.minErr = fixValue(form.minErr, 0, 100)

    form.maxEhp = fixValue(form.maxEhp, MAX_INT)
    form.minEhp = fixValue(form.minEhp, 0)

    form.maxBasic = fixValue(form.maxBasic, MAX_INT)
    form.minBasic = fixValue(form.minBasic, 0)
    form.maxSkill = fixValue(form.maxSkill, MAX_INT)
    form.minSkill = fixValue(form.minSkill, 0)
    form.maxUlt = fixValue(form.maxUlt, MAX_INT)
    form.minUlt = fixValue(form.minUlt, 0)
    form.maxFua = fixValue(form.maxFua, MAX_INT)
    form.minFua = fixValue(form.minFua, 0)
    form.maxDot = fixValue(form.maxDot, MAX_INT)
    form.minDot = fixValue(form.minDot, 0)
    form.maxBreak = fixValue(form.maxBreak, MAX_INT)
    form.minBreak = fixValue(form.minBreak, 0)

    if (!form.combatBuffs) form.combatBuffs = {}
    for (const buff of Object.values(CombatBuffs)) {
      form.combatBuffs[buff.key] = fixValue(form.combatBuffs[buff.key], 0, buff.percent ? 100 : 0)
    }

    if (!form.combo) form.combo = {}
    for (const key of DamageKeys) {
      form.combo[key] = fixValue(form.combo[key], 0, 0)
    }

    form.mainHead = form.mainHead || []
    form.mainHands = form.mainHands || []
    form.mainBody = form.mainBody || []
    form.mainFeet = form.mainFeet || []
    form.mainPlanarSphere = form.mainPlanarSphere || []
    form.mainLinkRope = form.mainLinkRope || []

    return form
  },

  updateFilters: () => {
    if (window.optimizerForm && window.onOptimizerFormValuesChange) {
      const fieldValues = OptimizerTabController.getForm()
      window.onOptimizerFormValuesChange({}, fieldValues)
    }
  },

  resetFilters: () => {
    console.info('@resetFilters')
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

    window.optimizerForm.setFieldsValue(OptimizerTabController.getDisplayFormValues(newForm as Form))
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
    const displayFormValues = OptimizerTabController.getDisplayFormValues(form as Form)
    window.optimizerForm.setFieldsValue(displayFormValues)

    const comboState = initializeComboState(displayFormValues as Form, true)
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

      window.onOptimizerFormValuesChange({}, displayFormValues)
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

function unsetMin(value: number, percent: boolean = false) {
  if (value == undefined) return undefined
  return value == 0 ? undefined : parseFloat((percent ? value * 100 : value).toFixed(3))
}

function unsetMax(value: number, percent: boolean = false) {
  if (value == undefined) return undefined
  return value == Constants.MAX_INT ? undefined : parseFloat((percent ? value * 100 : value).toFixed(3))
}

function fixValue(value: number, def: number, div?: number) {
  if (value == null) {
    return def
  }
  div = div || 1
  return value / div
}

function aggregate(subArray: OptimizerDisplayData[]) {
  const minAgg = CharacterStats.getZeroes()
  for (const column of OptimizerTabController.getColumnsToAggregate()) {
    minAgg[column] = Constants.MAX_INT
  }

  function setMinMax(name: string) {
    minAgg[name] = Constants.MAX_INT
    maxAgg[name] = 0
  }

  const maxAgg = CharacterStats.getZeroes()
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
      const value = row[column]
      if (value < minAgg[column]) minAgg[column] = value
      if (value > maxAgg[column]) maxAgg[column] = value
    }
  }
  aggs = {
    minAgg: minAgg,
    maxAgg: maxAgg,
  }
}

function sort() {
  if (sortModel.sort == 'desc') {
    inPlaceSort(rows).desc((x) => x[sortModel.colId])
  } else {
    inPlaceSort(rows).asc((x) => x[sortModel.colId])
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
      if (valid) {
        indices.push(i)
      }
    }
  }

  filteredIndices = indices
}
