import { inPlaceSort } from 'fast-sort'
import DB from './db'
import { Message } from './message'
import { SaveState } from './saveState'
import { CombatBuffs, Constants, DamageKeys, DEFAULT_STAT_DISPLAY } from './constants.ts'
import { Utils } from './utils'
import { LightConeConditionals } from './lightConeConditionals'
import { CharacterConditionals } from './characterConditionals'
import { CharacterStats } from './characterStats'
import { StatCalculator } from './statCalculator'
import { defaultSetConditionals, defaultTeammate, getDefaultForm } from 'lib/defaultForm'
import { SavedSessionKeys } from 'lib/constantsSession'
import { applyMetadataPresetToForm } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'

let relics
let consts
let aggs
let rows = []
let filteredIndices
let filterModel
let sortModel

let columnsToAggregate
let columnsToAggregateMap

export const OptimizerTabController = {
  setMetadata: (inputConsts, inputRelics) => {
    consts = inputConsts
    relics = inputRelics
  },

  setAggs: (x) => {
    aggs = x
  },

  getAggs: () => {
    return aggs
  },

  setRows: (x) => {
    rows = x
  },

  setTopRow: (x) => {
    // delete x.id
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: [x] })
  },

  getRows: () => {
    return rows
  },

  scrollToGrid: () => {
    document.getElementById('optimizerGridContainer').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  },

  equipClicked: () => {
    console.log('Equip clicked')
    const formValues = OptimizerTabController.getForm()
    const characterId = formValues.characterId

    if (!characterId) {
      return
    }
    DB.addFromForm(formValues)

    const selectedNodes = window.optimizerGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    const row = selectedNodes[0].data
    const build = OptimizerTabController.calculateRelicsFromId(row.id)

    DB.equipRelicIdsToCharacter(Object.values(build), characterId)
    Message.success('Equipped relics')
    OptimizerTabController.setTopRow(row)
    window.setOptimizerBuild(build)
    SaveState.save()
    OptimizerTabController.updateFilters()
  },

  cellClicked: (event) => {
    const data = event.data

    if (event.rowPinned == 'top') {
      console.log('Top row clicked', event.data)
      const fieldValues = OptimizerTabController.getForm()
      if (event.data && fieldValues.characterId) {
        const character = DB.getCharacterById(fieldValues.characterId)

        if (character) {
          window.setOptimizerBuild(character.equipped)
        }
      }
      return
    }

    if (data.statSim) {
      const key = data.statSim.key
      window.store.getState().setSelectedStatSimulations([key])
      window.setOptimizerBuild({})
      return
    }

    console.log('cellClicked', event)

    const build = OptimizerTabController.calculateRelicsFromId(data.id)
    console.log('build', build)
    window.setOptimizerBuild(build)
  },

  getColumnsToAggregate: (map) => {
    if (!columnsToAggregate) {
      columnsToAggregateMap = {
        [Constants.Stats.HP]: true,
        [Constants.Stats.ATK]: true,
        [Constants.Stats.DEF]: true,
        [Constants.Stats.SPD]: true,
        [Constants.Stats.CR]: true,
        [Constants.Stats.CD]: true,
        [Constants.Stats.EHR]: true,
        [Constants.Stats.RES]: true,
        [Constants.Stats.BE]: true,
        [Constants.Stats.ERR]: true,
        [Constants.Stats.OHB]: true,
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
      columnsToAggregate = Object.keys(columnsToAggregateMap)
    }

    return map ? columnsToAggregateMap : columnsToAggregate
  },

  resetDataSource: () => {
    window.optimizerGrid.current.api.updateGridOptions({ datasource: OptimizerTabController.getDataSource(sortModel, filterModel) })
  },

  getDataSource: (newSortModel, newFilterModel) => {
    sortModel = newSortModel
    filterModel = newFilterModel
    return {
      getRows: (params) => {
        aggs = undefined

        // fast clickers can race unmount/remount and cause NPE here.
        if (window?.optimizerGrid?.current?.api) {
          window.optimizerGrid.current.api.showLoadingOverlay()
        }

        // Give it time to show the loading page before we block
        Utils.sleep(100).then(() => {
          if (params.sortModel.length > 0 && params.sortModel[0] != sortModel) {
            sortModel = params.sortModel[0]
            sort()
          }

          if (filterModel) {
            filter(filterModel)
            const indicesSubArray = filteredIndices.slice(params.startRow, params.endRow)
            const subArray = []
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
            window.optimizerGrid.current.api.hideOverlay()
          }
          OptimizerTabController.redrawRows()
        })
      },
    }
  },

  calculateRelicsFromId: (id, returnRelics = false) => {
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

    const characterId = OptimizerTabController.getForm().characterId
    relics.Head[h].optimizerCharacterId = characterId
    relics.Hands[g].optimizerCharacterId = characterId
    relics.Body[b].optimizerCharacterId = characterId
    relics.Feet[f].optimizerCharacterId = characterId
    relics.PlanarSphere[p].optimizerCharacterId = characterId
    relics.LinkRope[l].optimizerCharacterId = characterId

    if (returnRelics) {
      return {
        Head: relics.Head[h],
        Hands: relics.Hands[g],
        Body: relics.Body[b],
        Feet: relics.Feet[f],
        PlanarSphere: relics.PlanarSphere[p],
        LinkRope: relics.LinkRope[l],
      }
    }

    return {
      Head: relics.Head[h].id,
      Hands: relics.Hands[g].id,
      Body: relics.Body[b].id,
      Feet: relics.Feet[f].id,
      PlanarSphere: relics.PlanarSphere[p].id,
      LinkRope: relics.LinkRope[l].id,
    }
  },

  // Get a form that's ready for submission
  getForm: () => {
    const form = window.optimizerForm.getFieldsValue()
    return OptimizerTabController.fixForm(form)
  },

  // Convert a form to its visual representation
  getDisplayFormValues: (form) => {
    const newForm = Utils.clone(form)
    const metadata = DB.getMetadata().characters[form.characterId]
    const scoringMetadata = DB.getScoringMetadata(form.characterId)

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

    newForm.maxWeight = unsetMax(form.maxWeight)
    newForm.minWeight = unsetMin(form.minWeight)
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
    newForm.maxCombo = unsetMax(form.maxCombo)
    newForm.minCombo = unsetMin(form.minCombo)

    newForm.combatBuffs = {}
    if (!form.combatBuffs) form.combatBuffs = {}
    for (const buff of Object.values(CombatBuffs)) {
      newForm.combatBuffs[buff.key] = unsetMin(form.combatBuffs[buff.key], buff.percent)
    }

    newForm.combo = {}
    if (!form.combo) form.combo = {}
    for (const key of DamageKeys) {
      newForm.combo[key] = unsetMin(form.combo[key])
    }

    if (!newForm.setConditionals) {
      newForm.setConditionals = defaultSetConditionals
    } else {
      Utils.mergeUndefinedValues(newForm.setConditionals, defaultSetConditionals)
    }

    if (!form.enemyLevel) {
      newForm.enemyLevel = 95
    }

    if (!form.enemyCount) {
      newForm.enemyCount = 1
    }

    if (!form.enemyResistance) {
      newForm.enemyResistance = 0.2
    }

    if (form.enemyElementalWeak == null) {
      newForm.enemyElementalWeak = true
    }

    if (form.enemyWeaknessBroken == null) {
      newForm.enemyWeaknessBroken = false
    }

    if (!form.enemyMaxToughness) {
      newForm.enemyMaxToughness = 360
    }

    if (newForm.characterId) {
      const defaultOptions = CharacterConditionals.get(newForm).defaults()
      if (!newForm.characterConditionals) {
        newForm.characterConditionals = {}
      }
      for (const option of Object.keys(defaultOptions)) {
        if (newForm.characterConditionals[option] == undefined) {
          newForm.characterConditionals[option] = defaultOptions[option]
        }
      }
    }

    if (newForm.lightCone) {
      const defaultLcOptions = LightConeConditionals.get(newForm).defaults()
      if (!newForm.lightConeConditionals) {
        newForm.lightConeConditionals = {}
      }
      for (const option of Object.keys(defaultLcOptions)) {
        if (newForm.lightConeConditionals[option] == undefined) {
          newForm.lightConeConditionals[option] = defaultLcOptions[option]
        }
      }
    } else {
      newForm.lightCone = null
      newForm.lightConeLevel = 80
      newForm.lightConeSuperimposition = 1
      newForm.lightConeConditionals = {}
    }

    if (!newForm.statDisplay) {
      newForm.statDisplay = DEFAULT_STAT_DISPLAY
    }

    const character = DB.getCharacterById(newForm.characterId)
    if (character) {
      newForm.rank = character.rank
    } else {
      newForm.rank = DB.getCharacters().length

      // Apply any presets to new characters
      if (metadata) {
        for (const applyPreset of scoringMetadata.presets || []) {
          applyPreset(newForm)
        }

        newForm.mainBody = scoringMetadata.parts[Constants.Parts.Body]
        newForm.mainFeet = scoringMetadata.parts[Constants.Parts.Feet]
        newForm.mainPlanarSphere = scoringMetadata.parts[Constants.Parts.PlanarSphere]
        newForm.mainLinkRope = scoringMetadata.parts[Constants.Parts.LinkRope]
        newForm.weights = scoringMetadata.stats
        newForm.weights.topPercent = 100

        applyMetadataPresetToForm(newForm, scoringMetadata)
      }
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

    if (![1, 3, 5].includes(newForm.enemyCount)) {
      newForm.enemyCount = 1
    }

    for (const i of [0, 1, 2]) {
      const teammateProperty = `teammate${i}`
      if (!newForm[teammateProperty] || !newForm[teammateProperty].characterId) {
        newForm[teammateProperty] = defaultTeammate()
      }
    }

    if (!newForm.weights) {
      newForm.weights = {
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.SPD_P]: 1,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CD]: 1,
        [Constants.Stats.CR]: 1,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 1,
        [Constants.Stats.BE]: 1,
        topPercent: 100,
      }
    }

    if (!newForm.resultSort) {
      if (metadata) {
        newForm.resultSort = metadata.scoringMetadata.sortOption.key
      }
    }

    if (!newForm.resultLimit) {
      newForm.resultLimit = 100000
    }

    if (!newForm.statSim) {
      newForm.statSim = {}
    }

    if (!newForm.statSim.simulations) {
      newForm.statSim.simulations = []
    }

    console.log('Form update', newForm)
    return newForm
  },

  validateForm: (x) => {
    console.log('validate', x)
    if (!x.lightCone || !x.lightConeSuperimposition) {
      Message.error('Missing light cone fields')
      console.log('Missing light cone')
      return false
    }

    if (!x.characterId || x.characterEidolon == undefined) {
      Message.error('Missing character fields')
      console.log('Missing character')
      return false
    }

    if (!x.resultLimit || !x.resultSort) {
      Message.error('Missing optimization target fields')
      console.log('Missing optimization target fields')
      return false
    }

    if (!x.weights || !x.weights.topPercent) {
      Message.error('Substat weight filter should have a Top % value greater than 0%. Make sure to set the Top % value with your substat weights.', 10)
      console.log('Top percent')
      return false
    }

    if (x.weights.topPercent > 0 && Object.values(Constants.Stats).map((stat) => x.weights[stat]).filter((x) => !!x).length == 0) {
      Message.error('Top % of weighted relics was selected but all weights are set to 0. Make sure to set the substat weights for your character.', 10)
      console.log('Top percent')
      return false
    }

    const lcMeta = DB.getMetadata().lightCones[x.lightCone]
    const charMeta = DB.getMetadata().characters[x.characterId]
    if (lcMeta.path != charMeta.path) {
      Message.warning('Character path doesn\'t match light cone path.', 10)
      console.log('Path mismatch')
    }

    return true
  },

  // Parse out any invalid values and prepare the form for submission to optimizer
  fixForm: (x) => {
    const MAX_INT = Constants.MAX_INT

    x.statDisplay = window.store.getState().statDisplay || DEFAULT_STAT_DISPLAY

    x.maxHp = fixValue(x.maxHp, MAX_INT)
    x.minHp = fixValue(x.minHp, 0)
    x.maxAtk = fixValue(x.maxAtk, MAX_INT)
    x.minAtk = fixValue(x.minAtk, 0)
    x.maxDef = fixValue(x.maxDef, MAX_INT)
    x.minDef = fixValue(x.minDef, 0)
    x.maxSpd = fixValue(x.maxSpd, MAX_INT)
    x.minSpd = fixValue(x.minSpd, 0)
    x.maxCr = fixValue(x.maxCr, MAX_INT, 100)
    x.minCr = fixValue(x.minCr, 0, 100)
    x.maxCd = fixValue(x.maxCd, MAX_INT, 100)
    x.minCd = fixValue(x.minCd, 0, 100)
    x.maxEhr = fixValue(x.maxEhr, MAX_INT, 100)
    x.minEhr = fixValue(x.minEhr, 0, 100)
    x.maxRes = fixValue(x.maxRes, MAX_INT, 100)
    x.minRes = fixValue(x.minRes, 0, 100)
    x.maxBe = fixValue(x.maxBe, MAX_INT, 100)
    x.minBe = fixValue(x.minBe, 0, 100)
    x.maxErr = fixValue(x.maxErr, MAX_INT, 100)
    x.minErr = fixValue(x.minErr, 0, 100)

    x.maxWeight = fixValue(x.maxWeight, MAX_INT)
    x.minWeight = fixValue(x.minWeight, 0)
    x.maxEhp = fixValue(x.maxEhp, MAX_INT)
    x.minEhp = fixValue(x.minEhp, 0)

    x.maxBasic = fixValue(x.maxBasic, MAX_INT)
    x.minBasic = fixValue(x.minBasic, 0)
    x.maxSkill = fixValue(x.maxSkill, MAX_INT)
    x.minSkill = fixValue(x.minSkill, 0)
    x.maxUlt = fixValue(x.maxUlt, MAX_INT)
    x.minUlt = fixValue(x.minUlt, 0)
    x.maxFua = fixValue(x.maxFua, MAX_INT)
    x.minFua = fixValue(x.minFua, 0)
    x.maxDot = fixValue(x.maxDot, MAX_INT)
    x.minDot = fixValue(x.minDot, 0)
    x.maxBreak = fixValue(x.maxBreak, MAX_INT)
    x.minBreak = fixValue(x.minBreak, 0)
    x.maxCombo = fixValue(x.maxCombo, MAX_INT)
    x.minCombo = fixValue(x.minCombo, 0)

    if (!x.combatBuffs) x.combatBuffs = {}
    for (const buff of Object.values(CombatBuffs)) {
      x.combatBuffs[buff.key] = fixValue(x.combatBuffs[buff.key], 0, buff.percent ? 100 : 0)
    }

    if (!x.combo) x.combo = {}
    for (const key of DamageKeys) {
      x.combo[key] = fixValue(x.combo[key], 0, 0)
    }

    x.mainHead = x.mainHead || []
    x.mainHands = x.mainHands || []
    x.mainBody = x.mainBody || []
    x.mainFeet = x.mainFeet || []
    x.mainPlanarSphere = x.mainPlanarSphere || []
    x.mainLinkRope = x.mainLinkRope || []

    return x
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
    const newForm = {
      characterEidolon: fieldValues.characterEidolon,
      characterId: fieldValues.characterId,
      characterLevel: 80,
      enhance: 9,
      grade: 5,
      predictMaxedMainStat: true,
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

    window.optimizerForm.setFieldsValue(OptimizerTabController.getDisplayFormValues(newForm))
    OptimizerTabController.updateFilters()
  },

  // Manually set the selected character
  setCharacter: (id) => {
    window.store.getState().setOptimizerTabFocusCharacter(id)
    window.optimizerForm.setFieldValue('characterId', id)

    window.store.getState().setSavedSessionKey(SavedSessionKeys.optimizerCharacterId, id)
    setTimeout(() => SaveState.save(), 1000)
  },

  // Update form values with the character
  updateCharacter: (characterId) => {
    console.log('@updateCharacter', characterId)
    if (!characterId) return
    const character = DB.getCharacterById(characterId)

    const form = character ? character.form : getDefaultForm({ id: characterId })
    const displayFormValues = OptimizerTabController.getDisplayFormValues(form)
    window.optimizerForm.setFieldsValue(displayFormValues)

    // Setting timeout so this doesn't lag the modal close animation. The delay is mostly hidden by the animation
    setTimeout(() => {
      window.store.getState().setOptimizerFormSelectedLightCone(form.lightCone)
      window.store.getState().setOptimizerFormSelectedLightConeSuperimposition(form.lightConeSuperimposition)
      window.store.getState().setOptimizerTabFocusCharacter(characterId)
      window.store.getState().setOptimizerFormCharacterEidolon(form.characterEidolon)
      window.store.getState().setStatDisplay(form.statDisplay || DEFAULT_STAT_DISPLAY)
      window.store.getState().setStatSimulations(form.statSim?.simulations || [])
      console.log('@updateForm', displayFormValues, character)

      window.onOptimizerFormValuesChange({}, displayFormValues)
    }, 50)
  },

  redrawRows: () => {
    window.optimizerGrid.current.api.redrawRows()
  },

  applyRowFilters: () => {
    const fieldValues = OptimizerTabController.getForm()
    fieldValues.statDisplay = window.store.getState().statDisplay
    filterModel = fieldValues
    console.log('Apply filters to rows', fieldValues)
    OptimizerTabController.resetDataSource()
  },
}

function unsetMin(value, percent) {
  if (value == undefined) return undefined
  return value == 0 ? undefined : parseFloat((percent == true ? value * 100 : value).toFixed(3))
}

function unsetMax(value, percent) {
  if (value == undefined) return undefined
  return value == Constants.MAX_INT ? undefined : parseFloat((percent == true ? value * 100 : value).toFixed(3))
}

function fixValue(value, def, div) {
  if (value == null) {
    return def
  }
  div = div || 1
  return value / div
}

function aggregate(subArray) {
  const minAgg = CharacterStats.getZeroes()
  for (const column of OptimizerTabController.getColumnsToAggregate()) {
    minAgg[column] = Constants.MAX_INT
  }

  function setMinMax(name) {
    minAgg[name] = Constants.MAX_INT
    maxAgg[name] = 0
  }

  const maxAgg = CharacterStats.getZeroes()
  minAgg['ED'] = Constants.MAX_INT
  maxAgg['ED'] = 0
  minAgg['WEIGHT'] = Constants.MAX_INT
  maxAgg['WEIGHT'] = 0
  minAgg['EHP'] = Constants.MAX_INT
  maxAgg['EHP'] = 0

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
    inPlaceSort(rows).desc(sortModel.colId)
  } else {
    inPlaceSort(rows).asc(sortModel.colId)
  }
}

function filter(filterModel) {
  const isCombat = filterModel.statDisplay == 'combat'
  const indices = []

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
        && row.WEIGHT >= filterModel.minWeight && row.WEIGHT <= filterModel.maxWeight
        && row.BASIC >= filterModel.minBasic && row.BASIC <= filterModel.maxBasic
        && row.SKILL >= filterModel.minSkill && row.SKILL <= filterModel.maxSkill
        && row.ULT >= filterModel.minUlt && row.ULT <= filterModel.maxUlt
        && row.FUA >= filterModel.minFua && row.FUA <= filterModel.maxFua
        && row.DOT >= filterModel.minDot && row.DOT <= filterModel.maxDot
        && row.BREAK >= filterModel.minBreak && row.BREAK <= filterModel.maxBreak
        && row.COMBO >= filterModel.minCombo && row.COMBO <= filterModel.maxCombo
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
        && row.WEIGHT >= filterModel.minWeight && row.WEIGHT <= filterModel.maxWeight
        && row.BASIC >= filterModel.minBasic && row.BASIC <= filterModel.maxBasic
        && row.SKILL >= filterModel.minSkill && row.SKILL <= filterModel.maxSkill
        && row.ULT >= filterModel.minUlt && row.ULT <= filterModel.maxUlt
        && row.FUA >= filterModel.minFua && row.FUA <= filterModel.maxFua
        && row.DOT >= filterModel.minDot && row.DOT <= filterModel.maxDot
        && row.BREAK >= filterModel.minBreak && row.BREAK <= filterModel.maxBreak
        && row.COMBO >= filterModel.minCombo && row.COMBO <= filterModel.maxCombo
      if (valid) {
        indices.push(i)
      }
    }
  }

  filteredIndices = indices
}

function setPinnedRow(characterId) {
  const character = DB.getCharacterById(characterId)
  const stats = StatCalculator.calculate(character)

  // transitioning from CharacterTab to OptimizerTab, grid is not yet rendered - check or throw
  if (window.optimizerGrid?.current?.api?.updateGridOptions !== undefined) {
    window.optimizerGrid.current.api.updateGridOptions({ pinnedTopRowData: [stats] })
  }
}
