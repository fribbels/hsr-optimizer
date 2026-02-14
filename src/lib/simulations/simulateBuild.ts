import {
  ElementName,
  ElementToStatKeyDmgBoost,
  OrnamentSetCount,
  OrnamentSetToIndex,
  Parts,
  PartsArray,
  RelicSetCount,
  RelicSetToIndex,
  SetsOrnaments,
  SetsRelics,
} from 'lib/constants/constants'
import {
  BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
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
import { ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { calculateEhp, getDamageFunction } from 'lib/optimization/engine/damage/damageCalculator'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { logRegisters } from 'lib/simulations/registerLogger'
import {
  ActionDamage,
  PrimaryActionStats,
  SimulateBuildResult,
  SimulationRelic,
  SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

// To use after combo state and context has been initialized
export function simulateBuild(
  relics: SimulationRelicByPart,
  context: OptimizerContext,
  cachedBasicStatsArrayCore: BasicStatsArrayCore | null,
  cachedComputedStatsArrayCore: ComputedStatsArrayCore | null,
  forcedBasicSpd: number = 0,
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

  // if (x.a[Key.MEMOSPRITE]) {
  //   m.setBasic(c.m)
  //   c.initMemo()
  // }

  let comboDmg = 0

  let combo = 0
  const hitActions = context.hitActions!
  const defaultActions = context.defaultActions

  // for (let i = 0; i < hitActions.length; i++) {
  //   calculateAction(hitActions[i])
  // }
  // for (let i = 0; i < defaultActions.length; i++) {
  //   calculateAction(defaultActions[i])
  // }

  const x = new ComputedStatsContainer()
  x.initializeArrays(context.maxContainerArrayLength, context)
  x.setBasic(c)

  // Store trace request - tracing is deferred to the primary default action only
  const shouldTrace = cachedComputedStatsArrayCore?.trace ?? false

  for (let i = 0; i < context.rotationActions.length; i++) {
    const action = context.rotationActions[i]
    x.setConfig(action.config)

    action.conditionalState = {}

    x.setPrecompute(action.precomputedStats.a)
    // if (x.a[Key.MEMOSPRITE]) {
    //   m.setPrecompute(action.precomputedM.a)
    // }

    calculateBasicEffects(x, action, context)
    calculateComputedStats(x, action, context)
    calculateBaseMultis(x, action, context)

    const dotComboMultiplier = getDotComboMultiplier(action, context)
    let sum = 0

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      const hit = action.hits![hitIndex]

      const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
      x.setHitRegisterValue(hit.registerIndex, dmg)

      if (hit.recorded !== false) {
        sum += dmg
        if (hit.outputTag == OutputTag.DAMAGE) {
          comboDmg += dmg * dotComboMultiplier
        }
      }
    }

    x.setActionRegisterValue(action.registerIndex, sum)
  }

  calculateComputedStats(x, context.defaultActions[0], context)

  // Track primary action stats for the scoring action (for combat stats display)
  let primaryActionStats: PrimaryActionStats = {
    DMG_BOOST: 0,
    sourceEntityCR: 0,
    sourceEntityCD: 0,
    sourceEntityElementDmgBoost: 0,
  }

  for (let i = 0; i < context.defaultActions.length; i++) {
    const action = context.defaultActions[i]
    x.setConfig(action.config)

    action.conditionalState = {}

    x.setPrecompute(action.precomputedStats.a)

    // Only trace buffs for the primary scoring action to avoid duplicates
    const isPrimaryAction = shouldTrace && action.actionName === context.primaryAbilityKey
    if (isPrimaryAction) {
      x.enableTracing()
      x.mergePrecomputedTraces(action.precomputedStats)
    }

    calculateBasicEffects(x, action, context)
    calculateComputedStats(x, action, context)
    calculateBaseMultis(x, action, context)

    if (isPrimaryAction) {
      x.trace = false
    }

    // Capture stats for the primary scoring action (from scoringMetadata.sortOption.key)
    // This must happen after calculateComputedStats but before stats are overwritten by next action
    if (action.actionName === context.primaryAbilityKey) {
      // Resolve the source entity index from the primary hit (hit 0)
      // For memosprite characters, the source entity is the memosprite (entity 1), not the main char (entity 0)
      const sourceEntityIndex = action.hits?.length ? (action.hits[0].sourceEntityIndex ?? 0) : 0
      const elementDmgBoostKey = ElementToStatKeyDmgBoost[context.element as ElementName]

      // Capture fully resolved stats matching the damage formula:
      //   cr = getValue(CR) + getActionValue(CR_BOOST)   = (action+hit CR) + (action CR_BOOST)
      //   cd = getValue(CD) + getActionValue(CD_BOOST)   = (action+hit CD) + (action CD_BOOST)
      //   dmg = getValue(DMG_BOOST) + getActionValue(elementDmgBoost)
      const hasHits = action.hits?.length ?? 0
      primaryActionStats = {
        DMG_BOOST: hasHits ? x.getValue(StatKey.DMG_BOOST, 0) : 0,
        sourceEntityCR: (hasHits ? x.getValue(StatKey.CR, 0) : 0)
          + x.getActionValueByIndex(StatKey.CR_BOOST, sourceEntityIndex),
        sourceEntityCD: (hasHits ? x.getValue(StatKey.CD, 0) : 0)
          + x.getActionValueByIndex(StatKey.CD_BOOST, sourceEntityIndex),
        sourceEntityElementDmgBoost: x.getActionValueByIndex(elementDmgBoostKey, sourceEntityIndex),
      }
    }

    let sum = 0

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      const hit = action.hits![hitIndex]

      const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
      x.setHitRegisterValue(hit.registerIndex, dmg)

      if (hit.recorded !== false) {
        sum += dmg
      }
    }

    x.setActionRegisterValue(action.registerIndex, sum)
  }

  calculateEhp(x, context)

  x.a[StatKey.COMBO_DMG] = comboDmg

  // Capture action damage for each default action
  const actionDamage: ActionDamage = {}
  for (const action of defaultActions) {
    actionDamage[action.actionName as AbilityKind] = x.getActionRegisterValue(action.registerIndex)
  }

  return { x, primaryActionStats, actionDamage }
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

export function emptyRelicWithSetAndSubstats(): SimulationRelic {
  return {
    set: '',
    condensedStats: [],
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
