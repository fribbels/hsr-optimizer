import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  Constants,
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnaments,
  SetsRelics,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { BufferPacker } from 'lib/optimization/bufferPacker'
import {
  calculateContextConditionalRegistry,
  wrapTeammateDynamicConditional,
} from 'lib/optimization/calculateConditionals'
import { calculateBaseMultis } from 'lib/optimization/calculateDamage'
import {
  calculateBaseStats,
  calculateBasicEffects,
  calculateBasicSetEffects,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
  calculateSetCounts,
} from 'lib/optimization/calculateStats'
import {
  ComputedStatsArray,
  ComputedStatsArrayCore,
  Key,
  KeysType,
} from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer, rebuildEntityRegistry } from 'lib/optimization/engine/container/computedStatsContainer'
import { calculateEhp, getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SortOption,
  SortOptionProperties,
} from 'lib/optimization/sortOptions'
import { SimulationRelicArrayByPart } from 'lib/simulations/statSimulationTypes'
import { Form } from 'types/form'
import {
  CharacterMetadata,
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import { Relic } from 'types/relic'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length

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

export function optimizerWorker(e: MessageEvent) {
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

  const combatDisplay = request.statDisplay == 'combat'
  const baseDisplay = !combatDisplay
  const memoDisplay = request.memoDisplay == 'memo'
  const summonerDisplay = !memoDisplay
  let passCount = 0

  const {
    failsBasicThresholdFilter,
    failsCombatThresholdFilter,
    // @ts-ignore
  } = generateResultMinFilter(request, combatDisplay, memoDisplay)

  // Calculate conditional registry for all actions
  for (const action of context.rotationActions) {
    calculateContextConditionalRegistry(action, context)
  }
  for (const action of context.defaultActions) {
    calculateContextConditionalRegistry(action, context)
  }

  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  function calculateTeammateDynamicConditionals(action: OptimizerAction, teammateMetadata: CharacterMetadata, index: number) {
    if (teammateMetadata?.characterId) {
      const teammateCharacterConditionalController = CharacterConditionalsResolver.get(teammateMetadata)
      const dynamicConditionals = (teammateCharacterConditionalController.teammateDynamicConditionals ?? [])
        .map((dynamicConditional: DynamicConditional) => {
          const wrapped = wrapTeammateDynamicConditional(dynamicConditional, index)
          action.teammateDynamicConditionals.push(wrapped)
          return wrapped
        })
    }
  }

  // Setup teammate dynamic conditionals for all actions
  for (const action of context.rotationActions) {
    action.teammateDynamicConditionals = []
    if (context.teammate0Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate0Metadata, 0)
    if (context.teammate1Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate1Metadata, 1)
    if (context.teammate2Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate2Metadata, 2)

    // Reconstruct arrays after transfer
    action.precomputedStats.a = new Float32Array(Object.values(action.precomputedStats.a))

    // Rebuild entityRegistry from entitiesArray after serialization
    if (action.config) {
      rebuildEntityRegistry(action.config)
    }
  }
  for (const action of context.defaultActions) {
    action.teammateDynamicConditionals = []
    if (context.teammate0Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate0Metadata, 0)
    if (context.teammate1Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate1Metadata, 1)
    if (context.teammate2Metadata?.characterId) calculateTeammateDynamicConditionals(action, context.teammate2Metadata, 2)

    // Reconstruct arrays after transfer
    action.precomputedStats.a = new Float32Array(Object.values(action.precomputedStats.a))

    // Rebuild entityRegistry from entitiesArray after serialization
    if (action.config) {
      rebuildEntityRegistry(action.config)
    }
  }

  const limit = Math.min(data.permutations, data.WIDTH)

  const c = new BasicStatsArrayCore(false) as BasicStatsArray
  const x = new ComputedStatsContainer()

  // Initialize arrays once with maximum size (performance optimization)
  x.initializeArrays(context.maxContainerArrayLength, context)

  // Find memosprite entity index from first default action
  let memospriteEntityIndex = -1
  if (context.defaultActions.length > 0) {
    const firstAction = context.defaultActions[0]
    for (let i = 1; i < firstAction.config.entitiesLength; i++) {
      const entity = firstAction.config.entitiesArray[i]
      if (entity.memosprite) {
        memospriteEntityIndex = i
        break
      }
    }
  }

  const failsCombatStatsFilter = combatStatsFilter(request)
  const failsBasicStatsFilter = basicStatsFilter(request)
  const failsEhpFilter = ehpFilter(request)

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

    const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
    const ornamentSetIndex = setP + setL * ornamentSetCount

    // Exit early if sets don't match
    if (relicSetSolutions[relicSetIndex] != 1 || ornamentSetSolutions[ornamentSetIndex] != 1) {
      continue
    }

    const sets = [setH, setG, setB, setF, setP, setL]
    const setCounts = calculateSetCounts(sets)
    c.init(relicSetIndex, ornamentSetIndex, setCounts, sets, col)

    calculateBasicSetEffects(c, context, setCounts, sets)
    calculateRelicStats(c, head, hands, body, feet, planarSphere, linkRope)
    calculateBaseStats(c, context)
    calculateElementalStats(c, context)

    // Exit early on base display filters failing
    if (baseDisplay && summonerDisplay && (failsBasicThresholdFilter(c.a) || failsBasicStatsFilter(c))) {
      continue
    }

    x.setBasic(c)
    x.clearRegisters()

    let comboDmg = 0

    // Calculate rotation actions for combo damage
    for (let i = 0; i < context.rotationActions.length; i++) {
      const action = context.rotationActions[i]
      x.setConfig(action.config)
      action.conditionalState = {}

      x.setPrecompute(action.precomputedStats.a)
      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      const dotComboMultiplier = getDotComboMultiplier(action, context)
      let sum = 0
      for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
        const hit = action.hits![hitIndex]
        const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
        x.setHitRegisterValue(hit.registerIndex, dmg)

        // Only accumulate recorded damage hits to sum and comboDmg (not heals/shields)
        if (hit.outputTag == OutputTag.DAMAGE && hit.recorded !== false) {
          sum += dmg
          comboDmg += dmg * dotComboMultiplier
        }
      }
      x.setActionRegisterValue(action.registerIndex, sum)
    }

    // Calculate default actions for display stats and store in registers
    calculateComputedStats(x, context.defaultActions[0], context)

    for (let i = 0; i < context.defaultActions.length; i++) {
      const action = context.defaultActions[i]
      x.setConfig(action.config)
      action.conditionalState = {}

      x.setPrecompute(action.precomputedStats.a)
      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      let sum = 0
      for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
        const hit = action.hits![hitIndex]
        const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
        x.setHitRegisterValue(hit.registerIndex, dmg)

        // Accumulate recorded hits to sum (damage, heal, or shield)
        if (hit.recorded !== false) {
          sum += dmg
        }
      }
      x.setActionRegisterValue(action.registerIndex, sum)
    }

    calculateEhp(x, context)

    x.a[StatKey.COMBO_DMG] = comboDmg

    // Display mode filtering using entity-aware filters
    const displayEntityIndex = (memoDisplay && memospriteEntityIndex >= 0) ? memospriteEntityIndex : 0

    // Combat stats filtering
    if (combatDisplay && failsCombatStatsFilter(x, displayEntityIndex)) {
      continue
    }

    // EHP filtering
    if (failsEhpFilter(x)) {
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
  statKey: any,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((c) => c.a[statKey] < min || c.a[statKey] > max)
  }
}

function addCombatConditionIfNeeded(
  conditions: ((x: ComputedStatsContainer, entityIndex: number) => boolean)[],
  statKey: any,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((x, entityIndex) => {
      const entityName = x.config.entitiesArray[entityIndex].name
      const value = x.getActionValue(statKey as any, entityName)
      return value < min || value > max
    })
  }
}

function addCombatBoostedConditionIfNeeded(
  conditions: ((x: ComputedStatsContainer, entityIndex: number) => boolean)[],
  statKey: any,
  boostKey: any,
  min: number,
  max: number,
) {
  if (min !== 0 || max !== Constants.MAX_INT) {
    conditions.push((x, entityIndex) => {
      const entityName = x.config.entitiesArray[entityIndex].name
      const value = x.getActionValue(statKey as any, entityName) + x.getActionValue(boostKey as any, entityName)
      return value < min || value > max
    })
  }
}

function basicStatsFilter(request: Form) {
  const conditions: ((c: BasicStatsArray) => boolean)[] = []

  addBasicConditionIfNeeded(conditions, StatKey.HP, request.minHp, request.maxHp)
  addBasicConditionIfNeeded(conditions, StatKey.ATK, request.minAtk, request.maxAtk)
  addBasicConditionIfNeeded(conditions, StatKey.DEF, request.minDef, request.maxDef)
  addBasicConditionIfNeeded(conditions, StatKey.SPD, request.minSpd, request.maxSpd)
  addBasicConditionIfNeeded(conditions, StatKey.CR, request.minCr, request.maxCr)
  addBasicConditionIfNeeded(conditions, StatKey.CD, request.minCd, request.maxCd)
  addBasicConditionIfNeeded(conditions, StatKey.EHR, request.minEhr, request.maxEhr)
  addBasicConditionIfNeeded(conditions, StatKey.RES, request.minRes, request.maxRes)
  addBasicConditionIfNeeded(conditions, StatKey.BE, request.minBe, request.maxBe)
  addBasicConditionIfNeeded(conditions, StatKey.ERR, request.minErr, request.maxErr)

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

function ehpFilter(request: Form) {
  const minEhp = request.minEhp
  const maxEhp = request.maxEhp

  if (minEhp === 0 && maxEhp === Constants.MAX_INT) {
    return () => false
  }

  return (x: ComputedStatsContainer) => {
    const ehp = x.a[StatKey.EHP]
    return ehp < minEhp || ehp > maxEhp
  }
}

function generateResultMinFilter(request: Form, combatDisplay: string) {
  const filter = request.resultMinFilter
  // @ts-ignore
  const sortOption = SortOption[request.resultSort] as SortOptionProperties
  const isComputedRating = sortOption.isComputedRating

  // Combat and basic filters apply at different places in the loop
  // Computed ratings (EHP, DMG, WEIGHT) only apply to the computed x values independent of the stat display
  if (combatDisplay || isComputedRating) {
    const key = sortOption.optimizerKey
    return {
      failsBasicThresholdFilter: () => false,
      failsCombatThresholdFilter: (candidate: Float32Array) => {
        return candidate[key] < filter
      },
    }
  } else {
    const property = sortOption.gpuProperty as KeysType
    const key = Key[property]
    return {
      failsBasicThresholdFilter: (candidate: Float32Array) => {
        return candidate[key] < filter
      },
      failsCombatThresholdFilter: () => false,
    }
  }
}

/**
 * Returns the combo multiplier for a rotation action.
 * DOT actions get their damage multiplied by (comboDot / dotAbilities) to represent
 * multiple ticks of DOT damage occurring during the rotation.
 * Non-DOT actions get a multiplier of 1.
 */
function getDotComboMultiplier(action: OptimizerAction, context: OptimizerContext): number {
  if (action.actionType === AbilityKind.DOT && context.comboDot > 0 && context.dotAbilities > 0) {
    return context.comboDot / context.dotAbilities
  }
  return 1
}
