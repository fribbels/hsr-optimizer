import {
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
import { logRegisters } from 'lib/simulations/registerLogger'
import {
  PrimaryActionStats,
  SimulationRelic,
  SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import { OptimizerContext } from 'types/optimizer'

// To use after combo state and context has been initialized
export function simulateBuild(
  relics: SimulationRelicByPart,
  context: OptimizerContext,
  cachedBasicStatsArrayCore: BasicStatsArrayCore | null,
  cachedComputedStatsArrayCore: ComputedStatsArrayCore | null,
  forcedBasicSpd: number = 0,
) {
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

  // Enable tracing if requested (for buff display)
  if (cachedComputedStatsArrayCore?.trace) {
    x.enableTracing()
  }

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

    let sum = 0

    for (let hitIndex = 0; hitIndex < action.hits!.length; hitIndex++) {
      const hit = action.hits![hitIndex]

      const dmg = getDamageFunction(hit.damageFunctionType).apply(x, action, hitIndex, context)
      x.setHitRegisterValue(hit.registerIndex, dmg)

      // Only accumulate recorded damage hits to sum and comboDmg (not heals/shields)
      if (hit.outputTag == OutputTag.DAMAGE && hit.recorded !== false) {
        sum += dmg
        comboDmg += dmg
      }
    }

    x.setActionRegisterValue(action.registerIndex, sum)
  }

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

      // Only accumulate recorded damage hits to sum (not heals/shields)
      if (hit.outputTag == OutputTag.DAMAGE && hit.recorded !== false) {
        sum += dmg
      }
    }

    x.setActionRegisterValue(action.registerIndex, sum)
  }

  calculateEhp(x, context)

  x.a[StatKey.COMBO_DMG] = comboDmg

  // x.set(ActionKey.COMBO_DMG, dmgTracker, Source.NONE)

  return x
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
