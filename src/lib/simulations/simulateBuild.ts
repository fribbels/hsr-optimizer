import { OrnamentSetCount, OrnamentSetToIndex, Parts, PartsArray, RelicSetCount, RelicSetToIndex, SetsOrnaments, SetsRelics } from 'lib/constants/constants'
import { BasicStatsArray, BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { calculateBaseMultis, calculateDamage } from 'lib/optimization/calculateDamage'
import {
  calculateBaseStats,
  calculateBasicEffects,
  calculateBasicSetEffects,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
  calculateSetCounts,
} from 'lib/optimization/calculateStats'
import { ComputedStatsArray, ComputedStatsArrayCore, Key } from 'lib/optimization/computedStatsArray'
import { SimulationRelic, SimulationRelicByPart } from 'lib/simulations/statSimulation'
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
  const x = (cachedComputedStatsArrayCore ?? new ComputedStatsArrayCore(false)) as ComputedStatsArray
  const m = x.m

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

  x.setBasic(c)
  if (x.a[Key.MEMOSPRITE]) {
    m.setBasic(c.m)
    c.initMemo()
  }

  let combo = 0
  for (let i = context.actions.length - 1; i >= 0; i--) {
    const action = context.actions[i]
    x.setPrecompute(action.precomputedX.a)
    if (x.a[Key.MEMOSPRITE]) {
      m.setPrecompute(action.precomputedM.a)
    }

    if (x.trace) {
      x.tracePrecompute(action.precomputedX)
      m.tracePrecompute(action.precomputedM)
    }

    const a = x.a

    calculateBasicEffects(x, action, context)
    calculateComputedStats(x, action, context)
    calculateBaseMultis(x, action, context)

    calculateDamage(x, action, context)

    if (action.actionType === 'BASIC') {
      combo += a[Key.BASIC_DMG]
    } else if (action.actionType === 'SKILL') {
      combo += a[Key.SKILL_DMG]
    } else if (action.actionType === 'ULT') {
      combo += a[Key.ULT_DMG]
    } else if (action.actionType === 'FUA') {
      combo += a[Key.FUA_DMG]
    } else if (action.actionType === 'MEMO_SKILL') {
      combo += a[Key.MEMO_SKILL_DMG]
    } else if (action.actionType === 'MEMO_TALENT') {
      combo += a[Key.MEMO_TALENT_DMG]
    }

    if (i === 0) {
      combo += context.comboDot * a[Key.DOT_DMG] + context.comboBreak * a[Key.BREAK_DMG]
      x.COMBO_DMG.set(combo, Source.NONE)
    }
  }

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
