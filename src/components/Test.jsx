import { Flex, Typography } from 'antd'
import { generateParams } from 'lib/optimizer/computeParams'
import { calculateTeammates } from 'lib/optimizer/computeTeammates'
import { Constants, OrnamentSetToIndex, RelicSetToIndex, SetsOrnaments, SetsRelics } from 'lib/constants.ts'
import DB from 'lib/db'
import { generateConditionals } from 'lib/optimizer/computeConditionals'
import {
  calculateBaseStats,
  calculateComputedStats,
  calculateElementalStats,
  calculateSetCounts,
  sumRelicStats,
} from 'lib/optimizer/computeStats'
import { calculateBaseMultis, calculateDamage } from 'lib/optimizer/computeDamage'

const relicSetCount = Object.values(SetsRelics).length
const ornamentSetCount = Object.values(SetsOrnaments).length

function calculate(selectedCharacter) {
  console.log('!!!', selectedCharacter)
  if (!selectedCharacter) return ''

  const relics = getRelics(selectedCharacter)
  const request = selectedCharacter.form
  const params = generateParams(request)

  generateConditionals(request, params)
  calculateTeammates(request, params)

  const head = relics.Head
  const hands = relics.Hands
  const body = relics.Body
  const feet = relics.Feet
  const planarSphere = relics.PlanarSphere
  const linkRope = relics.LinkRope

  const setH = RelicSetToIndex[relics.Head.set]
  const setG = RelicSetToIndex[relics.Hands.set]
  const setB = RelicSetToIndex[relics.Body.set]
  const setF = RelicSetToIndex[relics.Feet.set]
  const setP = OrnamentSetToIndex[relics.PlanarSphere.set]
  const setL = OrnamentSetToIndex[relics.LinkRope.set]

  const relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
  const ornamentSetIndex = setP + setL * ornamentSetCount

  const c = sumRelicStats(head, hands, body, feet, planarSphere, linkRope)
  c.relicSetIndex = relicSetIndex
  c.ornamentSetIndex = ornamentSetIndex

  calculateSetCounts(c, setH, setG, setB, setF, setP, setL)
  calculateBaseStats(c, request, params)
  calculateElementalStats(c, request, params)

  const x = calculateComputedStats(c, params, request)
  calculateBaseMultis(c, params, request)
  calculateDamage(c, x, params, request)

  return JSON.stringify(c, null, 2)
}

function getRelics(selectedCharacter) {
  const relics = {}
  const equippedPartIds = selectedCharacter.equipped || {}
  for (let part of Object.values(Constants.Parts)) {
    relics[part] = DB.getRelicById(equippedPartIds[part]) || emptyRelic()
  }

  return relics
}

function emptyRelic() {
  const augmentedStats = {
    mainStat: Constants.Stats.HP,
    mainValue: 0,
  }
  for (let stat of Object.values(Constants.Stats)) {
    augmentedStats[stat] = 0
  }
  return {
    set: -1,
    augmentedStats: augmentedStats,
  }
}

export function Test({ selectedCharacter }) {
  const display = calculate(selectedCharacter)
  return (
    <Flex>
      <Typography.Text style={{ whiteSpace: 'pre' }}>
        {display}
      </Typography.Text>
    </Flex>
  )
}
