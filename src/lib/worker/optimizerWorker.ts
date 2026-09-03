import { Constants } from 'lib/constants/constants'
import {
  type BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import {
  BasicKey,
  type BasicKeyType,
} from 'lib/optimization/basicStatsArray'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import { calculateBaseMultis } from 'lib/optimization/calculateDamage'
import {
  calculateBaseStats,
  calculateBasicEffects,
  calculateBasicSetEffects,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
} from 'lib/optimization/calculateStats'
import { resetConditionalState } from 'lib/optimization/conditionalStateUtils'
import {
  GlobalRegister,
  StatKey,
  type StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import {
  ComputedStatsContainer,
  type OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
import {
  calculateEhp,
  getDamageFunction,
} from 'lib/optimization/engine/damage/damageCalculator'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  computeSetMatchesInPlace,
  emptySetMatches,
  type MutableSetMatches,
} from 'lib/optimization/setMatchState'
import { isSetSolutionValid } from 'lib/optimization/setSolutionBitset'
import {
  SortOption,
  type SortOptionProperties,
} from 'lib/optimization/sortOptions'
import {
  encodeOrnamentSetIndex,
  encodeRelicSetIndex,
  OrnamentSetToIndex,
  RelicSetToIndex,
  type SetsOrnaments,
  type SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { type SimulationRelicArrayByPart } from 'lib/simulations/statSimulationTypes'
import type { BaseWorkerInput } from 'lib/worker/workerPool'
import type { WorkerType } from 'lib/worker/workerUtils'
import { type Form } from 'types/form'
import { type OptimizerContext } from 'types/optimizer'
import { type Relic } from 'types/relic'

export interface OptimizerWorkerInput extends BaseWorkerInput, OptimizerEventData {
  workerType: WorkerType.OPTIMIZER
}

type OptimizerEventData = {
  relics: {
    LinkRope: Relic[],
    PlanarSphere: Relic[],
    Feet: Relic[],
    Body: Relic[],
    Hands: Relic[],
    Head: Relic[],
  },
  request: Form,
  context: OptimizerContext,
  buffer: ArrayBuffer,
  relicSetSolutions: number[],
  ornamentSetSolutions: number[],
  permutations: number,
  WIDTH: number,
  skip: number,
}

export function optimizerWorker(e: MessageEvent<OptimizerWorkerInput>) {
  // console.log('Message received from main script', e.data)
  // console.log("Request received from main script", JSON.stringify(e.data.request.characterConditionals, null, 4));

  const data: OptimizerEventData = e.data
  const request: Form = data.request
  const context: OptimizerContext = data.context

  const relics = data.relics as SimulationRelicArrayByPart
  const arr = new Float32Array(data.buffer)

  const lSize = relics.LinkRope.length
  const pSize = relics.PlanarSphere.length
  const fSize = relics.Feet.length
  const bSize = relics.Body.length
  const gSize = relics.Hands.length
  const hSize = relics.Head.length

  const relicSetSolutions = data.relicSetSolutions
  const ornamentSetSolutions = data.ornamentSetSolutions

  const combatDisplay = request.statDisplay === 'combat'
  const baseDisplay = !combatDisplay
  const memoDisplay = request.memoDisplay === 'memo'
  let passCount = 0

  initializeContextConditionals(context)

  const limit = Math.min(data.permutations, data.WIDTH)

  const c = new BasicStatsArrayCore(false) as BasicStatsArray
  const x = new ComputedStatsContainer()

  // Initialize arrays once with maximum size (performance optimization)
  x.initializeArrays(context.maxContainerArrayLength, context)

  const displayConfig = context.defaultActions[context.defaultActions.length - 1]?.config
  let memospriteEntityIndex = -1
  if (displayConfig) {
    for (let i = 0; i < displayConfig.entitiesLength; i++) {
      const entity = displayConfig.entitiesArray[i]
      if (entity.memosprite) {
        memospriteEntityIndex = i
        break
      }
    }
  }

  const displayEntityIndex = (memoDisplay && memospriteEntityIndex >= 0) ? memospriteEntityIndex : 0
  const memoEntity = memoDisplay && memospriteEntityIndex >= 0 && displayConfig
    ? displayConfig.entitiesArray[memospriteEntityIndex]
    : undefined
  const { failsBasicThresholdFilter, failsComputedThresholdFilter } = generateResultMinFilter(request, context, displayEntityIndex, memoEntity)

  const failsCombatStatsFilter = combatStatsFilter(request)
  const failsBasicStatsFilter = basicStatsFilter(request, memoEntity)
  const failsEhpFilter = ehpFilter(request, displayEntityIndex)
  const failsRatingFilter = ratingFilter(request, context)
  const rotationActionOutputTags = context.rotationActions.map((action) => AbilityMeta[action.actionType].outputTag)
  const defaultActionOutputTags = context.defaultActions.map((action) => AbilityMeta[action.actionType].outputTag)

  const sets = Array.from<number>({ length: 6 })
  const setMatches: MutableSetMatches = emptySetMatches()

  for (let col = 0; col < limit; col++) {
    const index = data.skip + col

    if (index >= data.permutations) {
      break
    }

    const l = index % lSize
    const p = ((index - l) / lSize) % pSize
    const f = ((index - p * lSize - l) / (lSize * pSize)) % fSize
    const b = ((index - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize
    const g = ((index - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize
    const h =
      ((index - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize))
      % hSize

    const head = relics.Head[h]
    const hands = relics.Hands[g]
    const body = relics.Body[b]
    const feet = relics.Feet[f]
    const planarSphere = relics.PlanarSphere[p]
    const linkRope = relics.LinkRope[l]

    const setH = RelicSetToIndex[head.set as SetsRelics]
    const setG = RelicSetToIndex[hands.set as SetsRelics]
    const setB = RelicSetToIndex[body.set as SetsRelics]
    const setF = RelicSetToIndex[feet.set as SetsRelics]
    const setP = OrnamentSetToIndex[planarSphere.set as SetsOrnaments]
    const setL = OrnamentSetToIndex[linkRope.set as SetsOrnaments]

    const relicSetIndex = encodeRelicSetIndex(setH, setG, setB, setF)
    const ornamentSetIndex = encodeOrnamentSetIndex(setP, setL)

    // Exit early if sets don't match
    const relicValid = isSetSolutionValid(relicSetSolutions, relicSetIndex)
    const ornamentValid = isSetSolutionValid(ornamentSetSolutions, ornamentSetIndex)
    if (!relicValid || !ornamentValid) {
      continue
    }

    sets[0] = setH
    sets[1] = setG
    sets[2] = setB
    sets[3] = setF
    sets[4] = setP
    sets[5] = setL

    computeSetMatchesInPlace(setMatches, sets)
    c.init(relicSetIndex, ornamentSetIndex, setMatches, col)

    calculateBasicSetEffects(c, context, setMatches)
    calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope)
    calculateBaseStats(c, context)
    calculateElementalStats(c, context)

    // Exit early on base display filters failing
    if (baseDisplay && (failsBasicThresholdFilter(c.a) || failsBasicStatsFilter(c))) {
      continue
    }

    x.setBasic(c)
    x.clearRegisters()

    let comboDmg = 0
    let comboHeal = 0
    let comboShield = 0
    let comboBuff = 0

    // Calculate rotation actions for combo damage
    for (let i = 0; i < context.rotationActions.length; i++) {
      const action = context.rotationActions[i]
      const actionOutputTag = rotationActionOutputTags[i]
      x.setConfig(action.config)
      resetConditionalState(action)

      x.setPrecompute(action.precomputedStats.a)
      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      let actionOutput = 0
      for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
        const hit = action.hits![hitIndex]
        const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
        x.setHitRegisterValue(hit.registerIndex, dmg)

        if (hit.recorded !== false) {
          if (hit.outputTag === actionOutputTag) {
            if (actionOutputTag === OutputTag.BUFF) {
              actionOutput = dmg
            } else {
              actionOutput += dmg
            }
          }
          if (hit.outputTag === OutputTag.DAMAGE) {
            comboDmg += dmg
          } else if (hit.outputTag === OutputTag.HEAL) {
            comboHeal += dmg
          } else if (hit.outputTag === OutputTag.SHIELD) {
            comboShield += dmg
          } else if (hit.outputTag === OutputTag.BUFF) {
            comboBuff = dmg
          }
        }
      }
      x.setActionRegisterValue(action.registerIndex, actionOutput)
    }

    // Calculate default actions for display stats and store in registers
    for (let i = 0; i < context.defaultActions.length; i++) {
      const action = context.defaultActions[i]
      const actionOutputTag = defaultActionOutputTags[i]
      x.setConfig(action.config)
      resetConditionalState(action)

      x.setPrecompute(action.precomputedStats.a)
      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      let actionOutput = 0
      for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
        const hit = action.hits![hitIndex]
        const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
        x.setHitRegisterValue(hit.registerIndex, dmg)

        if (hit.recorded !== false) {
          if (hit.outputTag === actionOutputTag) {
            if (actionOutputTag === OutputTag.BUFF) {
              actionOutput = dmg
            } else {
              actionOutput += dmg
            }
          }
          if (hit.outputTag === OutputTag.BUFF) {
            comboBuff = dmg
          }
        }
      }
      x.setActionRegisterValue(action.registerIndex, actionOutput)
    }

    calculateEhp(x, context)

    x.setGlobalRegisterValue(GlobalRegister.COMBO_DMG, comboDmg)
    x.setGlobalRegisterValue(GlobalRegister.COMBO_HEAL, comboHeal)
    x.setGlobalRegisterValue(GlobalRegister.COMBO_SHIELD, comboShield)
    x.setGlobalRegisterValue(GlobalRegister.COMBO_BUFF, comboBuff)

    // Combat stats filtering
    if (combatDisplay && failsCombatStatsFilter(x, displayEntityIndex)) {
      continue
    }

    // EHP filtering
    if (failsEhpFilter(x)) {
      continue
    }

    // Rating filters (BASIC, SKILL, ULT, FUA, DOT, BREAK, MEMO_SKILL, MEMO_TALENT)
    if (failsRatingFilter(x)) {
      continue
    }

    // Computed rating threshold filter (rising floor from priority queue)
    if (failsComputedThresholdFilter(x)) {
      continue
    }

    BufferPacker.packCharacterContainer(arr, passCount, x, c, context, memospriteEntityIndex)
    passCount++
  }

  self.postMessage({
    rows: [],
    buffer: data.buffer,
  }, [data.buffer])
}

function addBasicConditionIfNeeded(
  conditions: ((c: BasicStatsArray) => boolean)[],
  statKey: StatKeyValue,
  min: number,
  max: number,
  transform?: BasicStatTransform,
) {
  if (min === 0 && max === Constants.MAX_INT) return

  if (!transform) {
    conditions.push((c) => c.a[statKey] < min || c.a[statKey] > max)
    return
  }

  const [scale, flat] = transform
  conditions.push((c) => {
    const value = scale * c.a[statKey] + flat
    return value < min || value > max
  })
}

type BasicStatTransform = readonly [scale: number, flat: number]

function getMemoBasicStatTransform(
  statKey: number,
  memoEntity?: OptimizerEntity,
): BasicStatTransform | undefined {
  if (!memoEntity) return undefined

  switch (statKey) {
    case StatKey.HP:
      return [memoEntity.memoBaseHpScaling ?? 0, memoEntity.memoBaseHpFlat ?? 0]
    case StatKey.ATK:
      return [memoEntity.memoBaseAtkScaling ?? 0, memoEntity.memoBaseAtkFlat ?? 0]
    case StatKey.DEF:
      return [memoEntity.memoBaseDefScaling ?? 0, memoEntity.memoBaseDefFlat ?? 0]
    case StatKey.SPD:
      return [memoEntity.memoBaseSpdScaling ?? 0, memoEntity.memoBaseSpdFlat ?? 0]
    default:
      return undefined
  }
}

function addCombatConditionIfNeeded(
  conditions: ((x: ComputedStatsContainer, entityIndex: number) => boolean)[],
  statKey: StatKeyValue,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((x, entityIndex) => {
      const entityName = x.config.entitiesArray[entityIndex].name
      const value = x.getActionValue(statKey, entityName)
      return value < min || value > max
    })
  }
}

function addCombatBoostedConditionIfNeeded(
  conditions: ((x: ComputedStatsContainer, entityIndex: number) => boolean)[],
  statKey: StatKeyValue,
  boostKey: StatKeyValue,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((x, entityIndex) => {
      const entityName = x.config.entitiesArray[entityIndex].name
      const value = x.getActionValue(statKey, entityName) + x.getActionValue(boostKey, entityName)
      return value < min || value > max
    })
  }
}

function basicStatsFilter(request: Form, memoEntity?: OptimizerEntity) {
  const conditions: ((c: BasicStatsArray) => boolean)[] = []
  const add = (statKey: StatKeyValue, min: number, max: number) => {
    addBasicConditionIfNeeded(conditions, statKey, min, max, getMemoBasicStatTransform(statKey, memoEntity))
  }

  add(StatKey.HP, request.minHp, request.maxHp)
  add(StatKey.ATK, request.minAtk, request.maxAtk)
  add(StatKey.DEF, request.minDef, request.maxDef)
  add(StatKey.SPD, request.minSpd, request.maxSpd)
  add(StatKey.CR, request.minCr, request.maxCr)
  add(StatKey.CD, request.minCd, request.maxCd)
  add(StatKey.EHR, request.minEhr, request.maxEhr)
  add(StatKey.RES, request.minRes, request.maxRes)
  add(StatKey.BE, request.minBe, request.maxBe)
  add(StatKey.ERR, request.minErr, request.maxErr)

  return (c: BasicStatsArray) => conditions.some((condition) => condition(c))
}

function combatStatsFilter(request: Form) {
  const conditions: ((x: ComputedStatsContainer, entityIndex: number) => boolean)[] = []

  addCombatConditionIfNeeded(conditions, StatKey.HP, request.minHp, request.maxHp)
  addCombatConditionIfNeeded(conditions, StatKey.ATK, request.minAtk, request.maxAtk)
  addCombatConditionIfNeeded(conditions, StatKey.DEF, request.minDef, request.maxDef)
  addCombatConditionIfNeeded(conditions, StatKey.SPD, request.minSpd, request.maxSpd)
  addCombatBoostedConditionIfNeeded(conditions, StatKey.CR, StatKey.CR_BOOST, request.minCr, request.maxCr)
  addCombatBoostedConditionIfNeeded(conditions, StatKey.CD, StatKey.CD_BOOST, request.minCd, request.maxCd)
  addCombatConditionIfNeeded(conditions, StatKey.EHR, request.minEhr, request.maxEhr)
  addCombatConditionIfNeeded(conditions, StatKey.RES, request.minRes, request.maxRes)
  addCombatConditionIfNeeded(conditions, StatKey.BE, request.minBe, request.maxBe)
  addCombatConditionIfNeeded(conditions, StatKey.ERR, request.minErr, request.maxErr)

  return (x: ComputedStatsContainer, entityIndex: number) => conditions.some((condition) => condition(x, entityIndex))
}

function ehpFilter(request: Form, displayEntityIndex: number) {
  const minEhp = request.minEhp
  const maxEhp = request.maxEhp

  if (minEhp === 0 && maxEhp === Constants.MAX_INT) {
    return () => false
  }

  return (x: ComputedStatsContainer) => {
    const ehp = x.getActionValueByIndex(StatKey.EHP, displayEntityIndex)
    return ehp < minEhp || ehp > maxEhp
  }
}

function ratingFilter(request: Form, context: OptimizerContext) {
  const conditions: ((x: ComputedStatsContainer) => boolean)[] = []

  for (const sortOption of Object.values(SortOption)) {
    if (!sortOption.minFilterKey || !sortOption.maxFilterKey) continue

    const min = request[sortOption.minFilterKey as keyof Form] as number
    const max = request[sortOption.maxFilterKey as keyof Form] as number
    if (min === 0 && max === Constants.MAX_INT) continue

    const action = context.defaultActions.find((a) => a.actionName === sortOption.key)
    if (!action) continue

    const registerIndex = action.registerIndex
    conditions.push((x) => {
      const value = x.getActionRegisterValue(registerIndex)
      return value < min || value > max
    })
  }

  if (conditions.length === 0) {
    return () => false
  }

  return (x: ComputedStatsContainer) => conditions.some((condition) => condition(x))
}

// Returns threshold filters that skip builds whose sort value is below the rising min floor.
// Basic stats can be checked before simulation (early exit), computed ratings only after.
function generateResultMinFilter(
  request: Form,
  context: OptimizerContext,
  displayEntityIndex: number,
  memoEntity?: OptimizerEntity,
) {
  const threshold = request.resultMinFilter
  const sortOption = SortOption[request.resultSort!] as SortOptionProperties
  const pass = () => false

  if (!sortOption.isComputedRating) {
    const key = BasicKey[sortOption.key as BasicKeyType]
    const transform = getMemoBasicStatTransform(key, memoEntity)
    const getValue = transform
      ? (c: Float32Array) => transform[0] * c[key] + transform[1]
      : (c: Float32Array) => c[key]
    return {
      failsBasicThresholdFilter: (c: Float32Array) => getValue(c) < threshold,
      failsComputedThresholdFilter: pass,
    }
  }

  let getComputedValue: (x: ComputedStatsContainer) => number

  if (sortOption.statKey != null) {
    const statKey = sortOption.statKey
    getComputedValue = (x) => x.getActionValueByIndex(statKey, displayEntityIndex)
  } else if (sortOption.globalRegisterIndex != null) {
    const globalRegisterIndex = sortOption.globalRegisterIndex
    getComputedValue = (x) => x.getGlobalRegisterValue(globalRegisterIndex)
  } else {
    const action = context.defaultActions.find((a) => a.actionName === sortOption.key)
    if (!action) {
      return { failsBasicThresholdFilter: pass, failsComputedThresholdFilter: pass }
    }
    const registerIndex = action.registerIndex
    getComputedValue = (x) => x.getActionRegisterValue(registerIndex)
  }

  return {
    failsBasicThresholdFilter: pass,
    failsComputedThresholdFilter: (x: ComputedStatsContainer) => getComputedValue(x) < threshold,
  }
}
