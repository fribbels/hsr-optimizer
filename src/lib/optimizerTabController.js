import {inPlaceSort} from 'fast-sort';
import DB from './db';

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

  getMetadata: () => {
    return {
      consts: consts,
      relics: relics,
    }
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

  getRows: () => {
    return rows
  },

  equipClicked: (x) => {
    console.log('Equip clicked');
    let formValues = OptimizerTabController.getForm()
    let characterId = formValues.characterId

    if (!characterId) {
      return;
    }
    DB.addFromForm(formValues)

    let selectedNodes = optimizerGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    let row = selectedNodes[0].data
    let build = OptimizerTabController.calculateRelicsFromId(row.id)
    
    DB.equipRelicIdsToCharacter(Object.values(build), characterId)
    Message.success('Equipped relics')
    setPinnedRow(characterId)
    setOptimizerBuild(build);
    relicsGrid.current.api.redrawRows()
    SaveState.save()
  },

  cellClicked: (event) => {
    let data = event.data
    
    if (event.rowPinned == "top") {
      console.log('Top row clicked', event.data)
      let fieldValues = OptimizerTabController.getForm()
      if (event.data && fieldValues.characterId) {
        let character = DB.getCharacterById(fieldValues.characterId);

        if (character) {
          setOptimizerBuild(character.equipped);
        }
      }
      return
    }
    
    console.log('cellClicked', event);

    let build = OptimizerTabController.calculateRelicsFromId(data.id)
    console.log('build', build)
    setOptimizerBuild(build);
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
        'ED': true,
        'CV': true,
        'DMG': true,
        'MCD': true,
        'EHP': true,
      }
      columnsToAggregate = Object.keys(columnsToAggregateMap)
    }

    return map ? columnsToAggregateMap : columnsToAggregate
  },

  resetDataSource: () => {
    optimizerGrid.current.api.setDatasource(OptimizerTabController.getDataSource(sortModel, filterModel));
  },

  getDataSource: (newSortModel, newFilterModel) => {
    sortModel = newSortModel
    filterModel = newFilterModel
    return {
      getRows: (params) => {
        console.log(params);
        aggs = undefined
        optimizerGrid.current.api.showLoadingOverlay()

        // Give it time to show the loading page before we block
        Utils.sleep(100).then(x => {
          if (params.sortModel.length > 0 && params.sortModel[0] != sortModel) {
            sortModel = params.sortModel[0]
            sort()
          }

          if (filterModel) {
            filter(filterModel)
            let indicesSubArray = filteredIndices.slice(params.startRow, params.endRow);
            let subArray = []
            for (let index of indicesSubArray) {
              subArray.push(rows[index])
            }
            aggregate(subArray)
            params.successCallback(subArray, filteredIndices.length)
          } else {
            let subArray = rows.slice(params.startRow, params.endRow);
            aggregate(subArray)

            params.successCallback(subArray, rows.length)
          }
          optimizerGrid.current.api.hideOverlay()
          OptimizerTabController.refreshPinned()
        })
      },
    };
  },

  calculateRelicsFromId: (id) => {
    let lSize = consts.lSize
    let pSize = consts.pSize
    let fSize = consts.fSize
    let bSize = consts.bSize
    let gSize = consts.gSize
    let hSize = consts.hSize

    let x = id
    let l = (x % lSize);
    let p = (((x - l) / lSize) % pSize);
    let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
    let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
    let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
    let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

    let characterId = OptimizerTabController.getForm().characterId
    relics.Head[h].optimizerCharacterId = characterId
    relics.Hands[g].optimizerCharacterId = characterId
    relics.Body[b].optimizerCharacterId = characterId
    relics.Feet[f].optimizerCharacterId = characterId
    relics.PlanarSphere[p].optimizerCharacterId = characterId
    relics.LinkRope[l].optimizerCharacterId = characterId

    let build = {
      Head: relics.Head[h].id,
      Hands: relics.Hands[g].id,
      Body: relics.Body[b].id,
      Feet: relics.Feet[f].id,
      PlanarSphere: relics.PlanarSphere[p].id,
      LinkRope: relics.LinkRope[l].id
    }

    return build;
  },

  getForm: () => {
    let form = optimizerForm.getFieldsValue();
    return OptimizerTabController.fixForm(form);
  },

  getDisplayFormValues: (form) => {
    let newForm = JSON.parse(JSON.stringify(form))

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
    newForm.maxCv = unsetMax(form.maxCv)
    newForm.minCv = unsetMin(form.minCv)
    newForm.maxDmg = unsetMax(form.maxDmg)
    newForm.minDmg = unsetMin(form.minDmg)
    newForm.maxMcd = unsetMax(form.maxMcd)
    newForm.minMcd = unsetMin(form.minMcd)
    newForm.maxEhp = unsetMax(form.maxEhp)
    newForm.minEhp = unsetMin(form.minEhp)
    newForm.buffAtk = unsetMin(form.buffAtk)
    newForm.buffAtkP = unsetMin(form.buffAtkP, true)
    newForm.buffCr = unsetMin(form.buffCr, true)
    newForm.buffCd = unsetMin(form.buffCd, true)
    if (!newForm.setConditionals) {
      newForm.setConditionals = {
        [Constants.Sets.PasserbyOfWanderingCloud]: [undefined, true],
        [Constants.Sets.MusketeerOfWildWheat]: [undefined, true],
        [Constants.Sets.KnightOfPurityPalace]: [undefined, true],
        [Constants.Sets.HunterOfGlacialForest]: [undefined, true],
        [Constants.Sets.ChampionOfStreetwiseBoxing]: [undefined, 5],
        [Constants.Sets.GuardOfWutheringSnow]: [undefined, true],
        [Constants.Sets.FiresmithOfLavaForging]: [undefined, true],
        [Constants.Sets.GeniusOfBrilliantStars]: [undefined, true],
        [Constants.Sets.BandOfSizzlingThunder]: [undefined, true],
        [Constants.Sets.EagleOfTwilightLine]: [undefined, true],
        [Constants.Sets.ThiefOfShootingMeteor]: [undefined, true],
        [Constants.Sets.WastelanderOfBanditryDesert]: [undefined, 0],
        [Constants.Sets.LongevousDisciple]: [undefined, 2],
        [Constants.Sets.MessengerTraversingHackerspace]: [undefined, true],
        [Constants.Sets.TheAshblazingGrandDuke]: [undefined, 0],
        [Constants.Sets.PrisonerInDeepConfinement]: [undefined, 0],
        [Constants.Sets.SpaceSealingStation]: [undefined, true],
        [Constants.Sets.FleetOfTheAgeless]: [undefined, true],
        [Constants.Sets.PanCosmicCommercialEnterprise]: [undefined, true],
        [Constants.Sets.BelobogOfTheArchitects]: [undefined, true],
        [Constants.Sets.CelestialDifferentiator]: [undefined, false],
        [Constants.Sets.InertSalsotto]: [undefined, true],
        [Constants.Sets.TaliaKingdomOfBanditry]: [undefined, true],
        [Constants.Sets.SprightlyVonwacq]: [undefined, true],
        [Constants.Sets.RutilantArena]: [undefined, true],
        [Constants.Sets.BrokenKeel]: [undefined, true],
        [Constants.Sets.FirmamentFrontlineGlamoth]: [undefined, true],
        [Constants.Sets.PenaconyLandOfTheDreams]: [undefined, true],
      }
    }

    if (!form.enemyLevel) {
      newForm.enemyLevel = 95
      newForm.enemyCount = 1
      newForm.enemyResistance = 0.2
      newForm.enemyHpPercent = 1.0
      newForm.enemyElementalWeak = true
      newForm.enemyQuantumWeak = true
      newForm.enemyWeaknessBroken = false
      newForm.enemyElementalResistance = false
    }

    let defaultOptions = CharacterConditionals.get(form).defaults()
    if (!newForm.characterConditionals) newForm.characterConditionals = {}

    for (let option of Object.keys(defaultOptions)) {
      if (newForm.characterConditionals[option] == undefined) {
        newForm.characterConditionals[option] = defaultOptions[option]
      }
    }

    console.warn('!!!!', form, newForm, defaultOptions)
    return newForm
  },

  validateForm: (x) => {
    console.log('validate', x)
    if (!x.lightCone || !x.lightConeLevel || !x.lightConeSuperimposition) {
      Message.error('Missing light cone fields')
      console.log('Missing light cone')
      return false;
    }
    
    if (!x.characterId || !x.characterLevel || x.characterEidolon == undefined) {
      Message.error('Missing character fields')
      console.log('Missing character')
      return false;
    }
    
    return true
  },
  
  fixForm: (x) => {
    let MAX_INT = Constants.MAX_INT;

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

    x.maxCv = fixValue(x.maxCv, MAX_INT)
    x.minCv = fixValue(x.minCv, 0)
    x.maxDmg = fixValue(x.maxDmg, MAX_INT)
    x.minDmg = fixValue(x.minDmg, 0)
    x.maxMcd = fixValue(x.maxMcd, MAX_INT)
    x.minMcd = fixValue(x.minMcd, 0)
    x.maxEhp = fixValue(x.maxEhp, MAX_INT)
    x.minEhp = fixValue(x.minEhp, 0)

    x.buffAtk = fixValue(x.buffAtk, 0)
    x.buffAtkP = fixValue(x.buffAtkP, 0, 100)
    x.buffCr = fixValue(x.buffCr, 0, 100)
    x.buffCd = fixValue(x.buffCd, 0, 100)

    x.mainHead = x.mainHead || []
    x.mainHands = x.mainHands || []
    x.mainBody = x.mainBody || []
    x.mainFeet = x.mainFeet || []
    x.mainPlanarSphere = x.mainPlanarSphere || []
    x.mainLinkRope = x.mainLinkRope || []

    return x
  },

  updateFilters: () => {
    if (window.optimizerForm) {
      let fieldValues = OptimizerTabController.getForm()
      onOptimizerFormValuesChange({}, fieldValues);
    }
  },

  resetFilters: () => {
    let fieldValues = OptimizerTabController.getForm()
    let newForm = {
      "characterId": fieldValues.characterId,
      "characterLevel": fieldValues.characterLevel,
      "characterEidolon": fieldValues.characterEidolon,
      "lightCone": fieldValues.lightCone,
      "lightConeLevel": fieldValues.lightConeLevel,
      "lightConeSuperimposition": fieldValues.lightConeSuperimposition,
      "mainBody": [],
      "mainFeet": [],
      "mainPlanarSphere": [],
      "mainLinkRope": [],
      "relicSets": [],
      "ornamentSets": [],
      "rankFilter": true,
      "predictMaxedMainStat": true,
      "keepCurrentRelics": false,
      "enhance": 15,
      "grade": 5,
      "mainHead": [],
      "mainHands": []
    }

    optimizerForm.setFieldsValue(OptimizerTabController.getDisplayFormValues(newForm))
    OptimizerTabController.updateFilters()
  },

  changeCharacter: (id) => {
    let character = DB.getCharacterById(id)
    if (character) {
      let displayFormValues = OptimizerTabController.getDisplayFormValues(character.form)
      optimizerForm.setFieldsValue(displayFormValues)
      console.log('Changed character form', displayFormValues)
    }
    setPinnedRow(id)
    OptimizerTabController.updateFilters()
  },

  refreshPinned: () => {
    let fieldValues = OptimizerTabController.getForm()
    if (fieldValues.characterId) {
      setPinnedRow(fieldValues.characterId)
    }
  },

  applyRowFilters: () => {
    let fieldValues = OptimizerTabController.getForm()
    filterModel = fieldValues
    console.log('Apply filters to rows', fieldValues);
    OptimizerTabController.resetDataSource()
  }
}

function unsetMin(value, percent) {
  if (value == undefined) return undefined
  return value == 0 ? undefined : parseFloat((percent == true ? value * 100 : value).toFixed(1))
}
function unsetMax(value, percent) {
  if (value == undefined) return undefined
  return value == Constants.MAX_INT ? undefined : parseFloat((percent == true ? value * 100 : value).toFixed(1))
}

function fixValue(value, def, div) {
  if (value == null) {
    return def
  }
  div = div || 1
  return value / div
}

function aggregate(subArray) {
  let minAgg = CharacterStats.getZeroes()
  for (let column of OptimizerTabController.getColumnsToAggregate()) {
    minAgg[column] = Constants.MAX_INT
  }

  let maxAgg = CharacterStats.getZeroes()
  minAgg['ED'] = Constants.MAX_INT
  maxAgg['ED'] = 0
  minAgg['CV'] = Constants.MAX_INT
  maxAgg['CV'] = 0
  minAgg['DMG'] = Constants.MAX_INT
  maxAgg['DMG'] = 0
  minAgg['MCD'] = Constants.MAX_INT
  maxAgg['MCD'] = 0
  minAgg['EHP'] = Constants.MAX_INT
  maxAgg['EHP'] = 0
  for (let row of subArray) {
    for (let column of OptimizerTabController.getColumnsToAggregate()) {
      let value = row[column]
      if (value < minAgg[column]) minAgg[column] = value
      if (value > maxAgg[column]) maxAgg[column] = value
    }
  }
  aggs = {
    minAgg: minAgg,
    maxAgg: maxAgg
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
  let indices = []
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i]
    let valid = 
      row[Constants.Stats.HP] >= filterModel.minHp && row[Constants.Stats.HP] <= filterModel.maxHp &&
      row[Constants.Stats.ATK] >= filterModel.minAtk && row[Constants.Stats.ATK] <= filterModel.maxAtk &&
      row[Constants.Stats.DEF] >= filterModel.minDef && row[Constants.Stats.DEF] <= filterModel.maxDef &&
      row[Constants.Stats.SPD] >= filterModel.minSpd && row[Constants.Stats.SPD] <= filterModel.maxSpd &&
      row[Constants.Stats.CR] >= filterModel.minCr && row[Constants.Stats.CR] <= filterModel.maxCr &&
      row[Constants.Stats.CD] >= filterModel.minCd && row[Constants.Stats.CD] <= filterModel.maxCd &&
      row[Constants.Stats.EHR] >= filterModel.minEhr && row[Constants.Stats.EHR] <= filterModel.maxEhr &&
      row[Constants.Stats.RES] >= filterModel.minRes && row[Constants.Stats.RES] <= filterModel.maxRes &&
      row[Constants.Stats.BE] >= filterModel.minBe && row[Constants.Stats.BE] <= filterModel.maxBe &&
      row['CV'] >= filterModel.minCv && row['CV'] <= filterModel.maxCv &&
      row['DMG'] >= filterModel.minDmg && row['DMG'] <= filterModel.maxDmg &&
      row['MCD'] >= filterModel.minMcd && row['MCD'] <= filterModel.maxMcd &&
      row['EHP'] >= filterModel.minEhp && row['EHP'] <= filterModel.maxEhp

    if (valid) {
      indices.push(i)
    }
  }

  filteredIndices = indices
}
function setPinnedRow(characterId) {
  let character = DB.getCharacterById(characterId)
  let stats = StatCalculator.calculate(character)

  optimizerGrid.current.api.setPinnedTopRowData([stats]);
}