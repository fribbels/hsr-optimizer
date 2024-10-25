import { Constants, OrnamentSetCount, OrnamentSetToIndex, RelicSetCount, RelicSetToIndex } from 'lib/constants'
import { baseCharacterStats, calculateBaseStats, calculateComputedStats, calculateElementalStats, calculateRelicStats, calculateSetCounts } from 'lib/optimizer/calculateStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/calculateDamage'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { Utils } from 'lib/utils'
import { RelicFilters } from 'lib/relicFilters'
import { generateContext } from 'lib/optimizer/context/calculateContext'
import { transformComboState } from 'lib/optimizer/rotation/comboStateTransform'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Form } from 'types/Form'
import { OptimizerContext } from 'types/Optimizer'
import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'

function generateUnusedSets(relics: SingleRelicByPart) {
  const usedSets = new Set([
    RelicSetToIndex[relics.Head.set],
    RelicSetToIndex[relics.Hands.set],
    RelicSetToIndex[relics.Body.set],
    RelicSetToIndex[relics.Feet.set],
    OrnamentSetToIndex[relics.PlanarSphere.set],
    OrnamentSetToIndex[relics.LinkRope.set],
  ])
  return [0, 1, 2, 3, 4, 5].filter((x) => !usedSets.has(x))
}

export function calculateBuild(
  request: Form,
  relics: SingleRelicByPart,
  cachedContext: OptimizerContext | null,
  reuseRequest: boolean = false,
  reuseComboState: boolean = false) {
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

  const setH = RelicSetToIndex[relics.Head.set] ?? unusedSets[unusedSetCounter++]
  const setG = RelicSetToIndex[relics.Hands.set] ?? unusedSets[unusedSetCounter++]
  const setB = RelicSetToIndex[relics.Body.set] ?? unusedSets[unusedSetCounter++]
  const setF = RelicSetToIndex[relics.Feet.set] ?? unusedSets[unusedSetCounter++]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set] ?? unusedSets[unusedSetCounter++]
  const setL = OrnamentSetToIndex[relics.LinkRope.set] ?? unusedSets[unusedSetCounter++]

  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount

  const x = {}
  const c = {
    ...baseCharacterStats,
    x: x,
    relicSetIndex: relicSetIndex,
    ornamentSetIndex: ornamentSetIndex,
  } as BasicStatsObject

  calculateRelicStats(c, Head, Hands, Body, Feet, PlanarSphere, LinkRope)
  calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
  calculateBaseStats(c, context)
  calculateElementalStats(c, context)

  let combo = 0
  for (let i = context.actions.length - 1; i >= 0; i--) {
    const action = context.actions[i]
    const ax = {
      ...action.precomputedX,
    }
    ax.sets = c.x.sets

    calculateComputedStats(c, ax, action, context)
    calculateBaseMultis(ax, action, context)
    calculateDamage(ax, action, context)

    if (action.actionType === 'BASIC') {
      combo += ax.BASIC_DMG
    } else if (action.actionType === 'SKILL') {
      combo += ax.SKILL_DMG
    } else if (action.actionType === 'ULT') {
      combo += ax.ULT_DMG
    } else if (action.actionType === 'FUA') {
      combo += ax.FUA_DMG
    }

    if (i === 0) {
      combo += context.comboDot * ax.DOT_DMG + context.comboBreak * ax.BREAK_DMG
      c.x = ax
    }
  }

  c.x.COMBO_DMG = combo
  return c
}

function extractRelics(relics: SingleRelicByPart) {
  for (const part of Object.keys(Constants.Parts)) {
    relics[part] = relics[part] || emptyRelic()
  }
  return relics
}
