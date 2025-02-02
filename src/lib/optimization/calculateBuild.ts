import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { Constants, OrnamentSetCount, OrnamentSetToIndex, Parts, RelicSetCount, RelicSetToIndex, SetsOrnaments, SetsRelics, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { calculateBaseMultis, calculateDamage } from 'lib/optimization/calculateDamage'
import {
  baseCharacterStats,
  calculateBaseStats,
  calculateBasicEffects,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
  calculateSetCounts,
} from 'lib/optimization/calculateStats'
import { ComputedStatsArray, ComputedStatsArrayCore, Key, Source } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { emptyRelic } from 'lib/optimization/optimizerUtils'
import { transformComboState } from 'lib/optimization/rotation/comboStateTransform'
import { RelicFilters } from 'lib/relics/relicFilters'
import { Utils } from 'lib/utils/utils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

function generateUnusedSets(relics: SingleRelicByPart) {
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

export function calculateBuild(
  request: Form,
  relics: SingleRelicByPart,
  cachedContext: OptimizerContext | null,
  cachedComputedStatsArrayCore: ComputedStatsArrayCore | null,
  reuseRequest: boolean = false,
  reuseComboState: boolean = false,
  internal: boolean = false,
  forcedBasicSpd: number = 0) {
  if (!reuseRequest) {
    request = Utils.clone(request)
  }

  const context = cachedContext ?? generateContext(request)
  if (reuseComboState) {
    // Clean combo state
    for (const action of context.actions) {
      action.conditionalState = {}
    }
  } else {
    transformComboState(request, context)
  }

  // Compute
  const { Head, Hands, Body, Feet, PlanarSphere, LinkRope } = extractRelics(relics)
  RelicFilters.calculateWeightScore(request, [Head, Hands, Body, Feet, PlanarSphere, LinkRope])

  // When the relic is empty / has no set, we have to use an unused set index to simulate a broken set
  const unusedSets = generateUnusedSets(relics)
  let unusedSetCounter = 0

  const setH = RelicSetToIndex[relics.Head.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setG = RelicSetToIndex[relics.Hands.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setB = RelicSetToIndex[relics.Body.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setF = RelicSetToIndex[relics.Feet.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]
  const setL = OrnamentSetToIndex[relics.LinkRope.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]

  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount

  const c = {
    ...baseCharacterStats,
    relicSetIndex: relicSetIndex,
    ornamentSetIndex: ornamentSetIndex,
  } as BasicStatsObject

  const x = (cachedComputedStatsArrayCore ?? new ComputedStatsArrayCore(false)) as ComputedStatsArray
  const m = x.m

  calculateRelicStats(c, Head, Hands, Body, Feet, PlanarSphere, LinkRope)
  calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
  calculateBaseStats(c, context)
  calculateElementalStats(c, context)

  if (forcedBasicSpd) {
    // Special scoring use case where basic spd stat needs to be enforced
    c[Stats.SPD] = forcedBasicSpd
  }

  x.setBasic(c)
  if (x.m) {
    m.setBasic({ ...c })
  }

  let combo = 0
  for (let i = context.actions.length - 1; i >= 0; i--) {
    const action = context.actions[i]
    const a = x.a
    x.setPrecompute(action.precomputedX.a)
    m.setPrecompute(action.precomputedM.a)

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
    }

    if (i === 0) {
      combo += context.comboDot * a[Key.DOT_DMG] + context.comboBreak * a[Key.BREAK_DMG]
      x.COMBO_DMG.set(combo, Source.NONE)
    }
  }

  c.x = x.toComputedStatsObject(internal)

  return {
    c: c,
    computedStatsArray: x,
    computedStatsObject: c.x,
  }
}

function extractRelics(relics: SingleRelicByPart) {
  for (const part of Object.keys(Constants.Parts)) {
    relics[part as Parts] = relics[part as Parts] || emptyRelic()
  }
  return relics
}
