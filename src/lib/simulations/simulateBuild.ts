import type { ElementName } from 'lib/constants/constants'
import {
  ElementToStatKeyDmgBoost,
  type Parts,
  PartsArray,
} from 'lib/constants/constants'
import type { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { calculateBaseMultis } from 'lib/optimization/calculateDamage'
import { resetConditionalState } from 'lib/optimization/conditionalStateUtils'
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
  GlobalRegister,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  calculateEhp,
  getDamageFunction,
} from 'lib/optimization/engine/damage/damageCalculator'
import { type AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import {
  OrnamentSetCount,
  OrnamentSetToIndex,
  RelicSetCount,
  RelicSetToIndex,
} from 'lib/sets/setConfigRegistry'
import type {
  ActionBuffSnapshot,
  ActionDamage,
  PrimaryActionStats,
  RotationBuffStep,
  RotationDamageStep,
  SimulateBuildResult,
  SimulationRelic,
  SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

function startTrace(x: ComputedStatsContainer, action: OptimizerAction) {
  x.enableTracing()
  x.mergePrecomputedTraces(action.precomputedStats)
}

function captureSnapshot(x: ComputedStatsContainer): ActionBuffSnapshot {
  x.trace = false
  return { buffs: [...x.buffs], buffsMemo: [...x.buffsMemo] }
}

// To use after combo state and context has been initialized.
// skipDefaults=true skips defaultActions processing (actionDamage, primaryActionStats,
// calculateEhp). Use only when the caller only needs COMBO_DMG (e.g. scoring workers).
export function simulateBuild(
  relics: SimulationRelicByPart,
  context: OptimizerContext,
  cachedBasicStatsArrayCore: BasicStatsArrayCore | null,
  cachedComputedStatsContainer: ComputedStatsContainer | null = null,
  trace: boolean = false,
  forcedBasicSpd: number = 0,
  skipDefaults: boolean = false,
): SimulateBuildResult {
  // Compute
  const { Head, Hands, Body, Feet, PlanarSphere, LinkRope } = extractRelics(relics)

  // When the relic is empty / has no set, we have to use an unused set index to simulate a broken set
  let unusedSetCounter = 0
  const unusedSets = generateUnusedSets(relics)
  const setH = RelicSetToIndex[relics.Head.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setG = RelicSetToIndex[relics.Hands.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setB = RelicSetToIndex[relics.Body.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setF = RelicSetToIndex[relics.Feet.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]
  const setL = OrnamentSetToIndex[relics.LinkRope.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]

  const c = (cachedBasicStatsArrayCore ?? new BasicStatsArrayCore(false)) as BasicStatsArray

  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount

  const sets = [setH, setG, setB, setF, setP, setL]
  const setCounts = calculateSetCounts(sets)
  c.init(relicSetIndex, ornamentSetIndex, setCounts, sets, -1)

  calculateBasicSetEffects(c, context, setCounts, sets)
  calculateRelicStats(c, Head, Hands, Body, Feet, PlanarSphere, LinkRope)
  calculateBaseStats(c, context)
  calculateElementalStats(c, context)

  if (forcedBasicSpd) {
    // Special scoring use case where basic spd stat needs to be enforced
    c.SPD.set(forcedBasicSpd, Source.NONE)
  }

  let comboDmg = 0

  const defaultActions = context.defaultActions

  const x = cachedComputedStatsContainer ?? new ComputedStatsContainer()

  if (cachedComputedStatsContainer) {
    x.clearRegisters()
  } else {
    x.initializeArrays(context.maxContainerArrayLength, context)
  }
  x.setBasic(c)

  // Store trace request - when tracing, we trace each action separately
  const shouldTrace = trace
  const actionBuffSnapshots: Record<string, ActionBuffSnapshot> | undefined = shouldTrace ? {} : undefined
  const rotationBuffSteps: RotationBuffStep[] | undefined = shouldTrace ? [] : undefined

  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    x.setConfig(action.config)

    resetConditionalState(action)

    x.setPrecompute(action.precomputedStats.a)

    if (shouldTrace) startTrace(x, action)

    calculateBasicEffects(x, action, context)
    calculateComputedStats(x, action, context)
    calculateBaseMultis(x, action, context)

    if (shouldTrace) {
      rotationBuffSteps!.push({ actionType: action.actionType, snapshot: captureSnapshot(x) })
    }

    let sum = 0

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      const hit = action.hits![hitIndex]

      const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
      x.setHitRegisterValue(hit.registerIndex, dmg)
      if (hit.outputTag === OutputTag.DAMAGE) {
        hit.computedTrueDmgModifier = x.getValue(StatKey.TRUE_DMG_MODIFIER, hitIndex) + (hit.trueDmgModifier ?? 0)
      }

      if (hit.recorded !== false) {
        sum += dmg
        if (hit.outputTag === OutputTag.DAMAGE) {
          comboDmg += dmg
        }
      }
    }

    x.setActionRegisterValue(action.registerIndex, sum)
  }

  // Track primary action stats for the scoring action (for combat stats display)
  let primaryActionStats: PrimaryActionStats = {
    DMG_BOOST: 0,
    sourceEntityCR: 0,
    sourceEntityCD: 0,
    sourceEntityElementDmgBoost: 0,
  }

  const actionDamage: ActionDamage = {}
  const rotationDamage: RotationDamageStep[] = []

  if (!skipDefaults) {
    for (let i = 0; i < context.defaultActions.length; i++) {
      const action = context.defaultActions[i]
      x.setConfig(action.config)

      resetConditionalState(action)

      x.setPrecompute(action.precomputedStats.a)

      if (shouldTrace) startTrace(x, action)

      calculateBasicEffects(x, action, context)
      calculateComputedStats(x, action, context)
      calculateBaseMultis(x, action, context)

      if (shouldTrace) {
        actionBuffSnapshots![action.actionName] = captureSnapshot(x)
      }

      // Capture stats for the primary scoring action (from scoringMetadata.sortOption.key)
      // This must happen after calculateComputedStats but before stats are overwritten by next action
      if (action.actionName === context.primaryAbilityKey) {
        // Resolve the source entity index from the primary hit (hit 0)
        // For memosprite characters, the source entity is the memosprite (entity 1), not the main char (entity 0)
        const sourceEntityIndex = action.hits?.length ? (action.hits[0].sourceEntityIndex ?? 0) : 0
        const elementDmgBoostKey = ElementToStatKeyDmgBoost[context.element as ElementName]

        // Capture fully resolved stats matching the damage formula:
        const hasHits = action.hits?.length ?? 0
        primaryActionStats = {
          DMG_BOOST: hasHits ? x.getValue(StatKey.DMG_BOOST, 0) : 0,
          sourceEntityCR: (hasHits ? x.getValue(StatKey.CR, 0) : 0) + x.getActionValueByIndex(StatKey.CR_BOOST, sourceEntityIndex),
          sourceEntityCD: (hasHits ? x.getValue(StatKey.CD, 0) : 0) + x.getActionValueByIndex(StatKey.CD_BOOST, sourceEntityIndex),
          sourceEntityElementDmgBoost: x.getActionValueByIndex(elementDmgBoostKey, sourceEntityIndex),
        }
      }

      let sum = 0

      for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
        const hit = action.hits![hitIndex]

        const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
        x.setHitRegisterValue(hit.registerIndex, dmg)
        if (hit.outputTag === OutputTag.DAMAGE) {
          hit.computedTrueDmgModifier = x.getValue(StatKey.TRUE_DMG_MODIFIER, hitIndex) + (hit.trueDmgModifier ?? 0)
        }

        if (hit.recorded !== false) {
          sum += dmg
        }
      }

      x.setActionRegisterValue(action.registerIndex, sum)
    }

    calculateEhp(x, context)

    // Capture action damage for each default action
    for (const action of defaultActions) {
      actionDamage[action.actionName as AbilityKind] = x.getActionRegisterValue(action.registerIndex)
    }

    // Capture per-step rotation damage
    for (const action of context.rotationActions) {
      rotationDamage.push({
        actionType: action.actionType,
        damage: x.getActionRegisterValue(action.registerIndex),
      })
    }
  }

  x.setGlobalRegisterValue(GlobalRegister.COMBO_DMG, comboDmg)

  return {
    x,
    primaryActionStats,
    actionDamage,
    rotationDamage,
    actionBuffSnapshots,
    rotationBuffSteps,
  }
}

function generateUnusedSets(relics: SimulationRelicByPart) {
  const usedSets = new Set([
    RelicSetToIndex[relics.Head.set as SetsRelics],
    RelicSetToIndex[relics.Hands.set as SetsRelics],
    RelicSetToIndex[relics.Body.set as SetsRelics],
    RelicSetToIndex[relics.Feet.set as SetsRelics],
    OrnamentSetToIndex[relics.PlanarSphere.set as SetsOrnaments],
    OrnamentSetToIndex[relics.LinkRope.set as SetsOrnaments],
  ])
  return [0, 1, 2, 3, 4, 5].filter((x) => !usedSets.has(x))
}

function extractRelics(relics: SimulationRelicByPart) {
  for (const part of PartsArray) {
    if (!relics[part]) {
      relics[part as Parts] = emptyRelicWithSetAndSubstats()
    }
  }
  return relics
}

function emptyRelicWithSetAndSubstats(): SimulationRelic {
  return {
    set: '',
    condensedStats: [],
  }
}
