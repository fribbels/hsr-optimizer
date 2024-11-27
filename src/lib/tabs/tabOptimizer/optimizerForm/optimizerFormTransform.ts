import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { CombatBuffs, ConditionalDataType, Constants, DEFAULT_STAT_DISPLAY, Sets } from 'lib/constants/constants'
import { defaultEnemyOptions, defaultSetConditionals, defaultTeammate, getDefaultWeights } from 'lib/optimization/defaultForm'
import { ConditionalSetMetadata } from 'lib/optimization/rotation/setConditionalContent'
import DB from 'lib/state/db'
import { applyMetadataPresetToForm } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Form, Teammate } from 'types/form'
import { OptimizerCombatBuffs } from 'types/optimizer'

// Convert the rendered form values into an internal form
export function displayToForm(form: Form) {
  const MAX_INT = Constants.MAX_INT

  form.statDisplay = window.store.getState().statDisplay || DEFAULT_STAT_DISPLAY

  form.maxHp = getNumber(form.maxHp, MAX_INT)
  form.minHp = getNumber(form.minHp, 0)
  form.maxAtk = getNumber(form.maxAtk, MAX_INT)
  form.minAtk = getNumber(form.minAtk, 0)
  form.maxDef = getNumber(form.maxDef, MAX_INT)
  form.minDef = getNumber(form.minDef, 0)
  form.maxSpd = getNumber(form.maxSpd, MAX_INT)
  form.minSpd = getNumber(form.minSpd, 0)
  form.maxCr = getNumber(form.maxCr, MAX_INT, 100)
  form.minCr = getNumber(form.minCr, 0, 100)
  form.maxCd = getNumber(form.maxCd, MAX_INT, 100)
  form.minCd = getNumber(form.minCd, 0, 100)
  form.maxEhr = getNumber(form.maxEhr, MAX_INT, 100)
  form.minEhr = getNumber(form.minEhr, 0, 100)
  form.maxRes = getNumber(form.maxRes, MAX_INT, 100)
  form.minRes = getNumber(form.minRes, 0, 100)
  form.maxBe = getNumber(form.maxBe, MAX_INT, 100)
  form.minBe = getNumber(form.minBe, 0, 100)
  form.maxErr = getNumber(form.maxErr, MAX_INT, 100)
  form.minErr = getNumber(form.minErr, 0, 100)

  form.maxEhp = getNumber(form.maxEhp, MAX_INT)
  form.minEhp = getNumber(form.minEhp, 0)

  form.maxBasic = getNumber(form.maxBasic, MAX_INT)
  form.minBasic = getNumber(form.minBasic, 0)
  form.maxSkill = getNumber(form.maxSkill, MAX_INT)
  form.minSkill = getNumber(form.minSkill, 0)
  form.maxUlt = getNumber(form.maxUlt, MAX_INT)
  form.minUlt = getNumber(form.minUlt, 0)
  form.maxFua = getNumber(form.maxFua, MAX_INT)
  form.minFua = getNumber(form.minFua, 0)
  form.maxDot = getNumber(form.maxDot, MAX_INT)
  form.minDot = getNumber(form.minDot, 0)
  form.maxBreak = getNumber(form.maxBreak, MAX_INT)
  form.minBreak = getNumber(form.minBreak, 0)
  form.maxHeal = getNumber(form.maxHeal, MAX_INT)
  form.minHeal = getNumber(form.minHeal, 0)
  form.maxShield = getNumber(form.maxShield, MAX_INT)
  form.minShield = getNumber(form.minShield, 0)

  if (!form.combatBuffs) form.combatBuffs = {}
  for (const buff of Object.values(CombatBuffs)) {
    form.combatBuffs[buff.key] = getNumber(form.combatBuffs[buff.key], 0, buff.percent ? 100 : 0)
  }

  form.mainHead = form.mainHead || []
  form.mainHands = form.mainHands || []
  form.mainBody = form.mainBody || []
  form.mainFeet = form.mainFeet || []
  form.mainPlanarSphere = form.mainPlanarSphere || []
  form.mainLinkRope = form.mainLinkRope || []

  return form
}

// Convert the internal form into a renderable form
export function formToDisplay(form: Form) {
  const characterId = form.characterId
  const newForm: Partial<Form> = TsUtils.clone(form)
  const metadata = characterId ? DB.getMetadata().characters[characterId] : null
  const scoringMetadata = characterId ? DB.getScoringMetadata(characterId) : null

  // Erase inputs where min == 0 and max == MAX_INT to hide the displayed values
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
  newForm.maxHeal = unsetMax(form.maxHeal)
  newForm.minHeal = unsetMin(form.minHeal)
  newForm.maxShield = unsetMax(form.maxShield)
  newForm.minShield = unsetMin(form.minShield)

  const combatBuffs = {} as Partial<OptimizerCombatBuffs>
  if (!form.combatBuffs) form.combatBuffs = {}
  for (const buff of Object.values(CombatBuffs)) {
    combatBuffs[buff.key as keyof OptimizerCombatBuffs] = unsetMin(form.combatBuffs[buff.key], buff.percent)
  }
  newForm.combatBuffs = combatBuffs

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
    const defaultOptions = CharacterConditionalsResolver.get(form).defaults()
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
    const defaultLcOptions = LightConeConditionalsResolver.get(form).defaults()
    if (!newForm.lightConeConditionals) {
      newForm.lightConeConditionals = {}
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
    newForm.lightConeConditionals = {}
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
    if (metadata && scoringMetadata) {
      for (const preset of scoringMetadata.presets || []) {
        preset.apply(newForm as Form)
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

  newForm.teammate0 = cloneTeammate(form.teammate0)
  newForm.teammate1 = cloneTeammate(form.teammate1)
  newForm.teammate2 = cloneTeammate(form.teammate2)

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

  if (!newForm.comboStateJson) {
    newForm.comboStateJson = '{}'
  }

  if (!newForm.comboAbilities && metadata) {
    const simulation = metadata.scoringMetadata?.simulation
    newForm.comboAbilities = simulation?.comboAbilities ?? [null, 'BASIC'] as string[]
    newForm.comboDot = simulation?.comboDot ?? 0
    newForm.comboBreak = simulation?.comboBreak ?? 0
  }

  if (!newForm.comboType) {
    newForm.comboType = 'simple'
  }

  for (const [key, value] of Object.entries(newForm.setConditionals)) {
    const setName = key as Sets
    if (!ConditionalSetMetadata[setName]) {
      // Clear out invalid sets
      delete form.setConditionals[setName]
      delete newForm.setConditionals[setName]
      continue
    }
    if (ConditionalSetMetadata[setName].type === ConditionalDataType.SELECT) {
      // Fix incorrect set conditional data types by restoring the default value
      if (typeof value[1] != 'number') {
        newForm.setConditionals[setName][1] = defaultSetConditionals[setName][1]
      }
    } else {
      if (typeof value[1] != 'boolean') {
        newForm.setConditionals[setName][1] = defaultSetConditionals[setName][1]
      }
    }
  }

  return newForm as Form
}

// Convert a display value to its internal form value
function getNumber(value: number, defaultValue: number, divide: number = 0) {
  if (value == null) {
    return defaultValue
  }
  divide = divide || 1
  return value / divide
}

// Display a number, rendering 0 as blank
function unsetMin(value: number, percent: boolean = false) {
  if (value == undefined) return undefined
  return value == 0 ? undefined : parseFloat((percent ? value * 100 : value).toFixed(3))
}

// Display a number, rendering MAX_INT as blank
function unsetMax(value: number, percent: boolean = false) {
  if (value == undefined) return undefined
  return value == Constants.MAX_INT ? undefined : parseFloat((percent ? value * 100 : value).toFixed(3))
}

// Clone teammate and replace undefined values with null to force the form to keep the null
function cloneTeammate(teammate: Teammate | undefined) {
  if (!teammate?.characterId) return defaultTeammate() as Teammate

  return {
    characterId: teammate.characterId ?? null,
    characterEidolon: teammate.characterEidolon ?? null,
    lightCone: teammate.lightCone ?? null,
    lightConeSuperimposition: teammate.lightConeSuperimposition ?? null,
  } as Teammate
}
