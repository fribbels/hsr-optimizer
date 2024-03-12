import { generateParams } from 'lib/optimizer/calculateParams'
import { calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { calculateTeammates } from 'lib/optimizer/calculateTeammates'
import { OrnamentSetCount, OrnamentSetToIndex, RelicSetCount, RelicSetToIndex } from 'lib/constants'
import {
  calculateBaseStats,
  calculateComputedStats,
  calculateElementalStats,
  calculateRelicStats,
  calculateSetCounts,
} from 'lib/optimizer/calculateStats'
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

  return calculateBuild(request, relics)
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

  const setH = RelicSetToIndex[relics.Head.set]
  const setG = RelicSetToIndex[relics.Hands.set]
  const setB = RelicSetToIndex[relics.Body.set]
  const setF = RelicSetToIndex[relics.Feet.set]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set]
  const setL = OrnamentSetToIndex[relics.LinkRope.set]

  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount

  const c = {
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
  for (let part of Object.keys(Constants.Parts)) {
    relics[part] = relics[part] || emptyRelic()
  }
  return relics
}

function getEquippedRelicsById(selectedCharacter) {
  const relics = {}
  const equippedPartIds = selectedCharacter.equipped || {}
  for (let part of Object.values(Constants.Parts)) {
    relics[part] = DB.getRelicById(equippedPartIds[part])
  }

  return relics
}
