import { generateParams } from 'lib/optimizer/calculateParams'
import { calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { calculateTeammates } from 'lib/optimizer/calculateTeammates'
import { OrnamentSetCount, OrnamentSetToIndex, RelicSetCount, RelicSetToIndex } from 'lib/constants'
import { baseCharacterStats, calculateBaseStats, calculateComputedStats, calculateElementalStats, calculateRelicStats, calculateSetCounts } from 'lib/optimizer/calculateStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/calculateDamage'
import { emptyRelic } from 'lib/optimizer/optimizerUtils'
import { Constants } from 'lib/constants.ts'
import { Utils } from 'lib/utils'
import { RelicFilters } from 'lib/relicFilters'
import DB from 'lib/db'

export function calculateBuildByCharacterEquippedIds(character) {
  console.log('character', character)
  if (!character) return ''

  const relics = getEquippedRelicsById(character)
  const request = character.form
  RelicFilters.condenseRelicSubstatsForOptimizer(relics)

  return calculateBuild(request, relics)
}

function generateUnusedSets(relics) {
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
export function calculateBuild(request, relics) {
  request = Utils.clone(request)

  const params = generateParams(request)

  // Precompute
  calculateConditionals(request, params)
  calculateTeammates(request, params)

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

  const c = {
    ...baseCharacterStats,
    x: Object.assign({}, params.precomputedX),
    relicSetIndex: relicSetIndex,
    ornamentSetIndex: ornamentSetIndex,
  }

  calculateRelicStats(c, Head, Hands, Body, Feet, PlanarSphere, LinkRope)
  calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
  calculateBaseStats(c, request, params)
  calculateElementalStats(c, request, params)
  calculateComputedStats(c, request, params)
  calculateBaseMultis(c, request, params)
  calculateDamage(c, request, params)

  return c
}

function extractRelics(relics) {
  for (const part of Object.keys(Constants.Parts)) {
    relics[part] = relics[part] || emptyRelic()
  }
  return relics
}

export function getEquippedRelicsById(selectedCharacter) {
  const relics = {}
  const equippedPartIds = selectedCharacter.equipped || {}
  for (const part of Object.values(Constants.Parts)) {
    relics[part] = DB.getRelicById(equippedPartIds[part])
  }

  return relics
}
