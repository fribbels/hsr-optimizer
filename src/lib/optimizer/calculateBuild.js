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
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Utils } from 'lib/utils'

export function calculateBuild(request, relics) {
  request = Utils.clone(request)

  OptimizerTabController.fixForm(request)
  const params = generateParams(request)

  calculateConditionals(request, params)
  calculateTeammates(request, params)

  const { Head, Hands, Body, Feet, PlanarSphere, LinkRope } = extractRelics(relics)

  const setH = RelicSetToIndex[relics.Head.set]
  const setG = RelicSetToIndex[relics.Hands.set]
  const setB = RelicSetToIndex[relics.Body.set]
  const setF = RelicSetToIndex[relics.Feet.set]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set]
  const setL = OrnamentSetToIndex[relics.LinkRope.set]

  // Do we need these for calculateBuild if we don't filter?
  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount

  const c = {}
  const x = Object.assign({}, params.precomputedX)
  c.relicSetIndex = relicSetIndex
  c.ornamentSetIndex = ornamentSetIndex
  c.x = x

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
