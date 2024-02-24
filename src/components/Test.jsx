import { Flex, Typography } from 'antd'
import { generateParams } from 'lib/optimizer/computeParams'
import { calculateTeammates } from 'lib/optimizer/computeTeammates'
import { Constants } from 'lib/constants.ts'
import DB from 'lib/db'
import { generateConditionals } from 'lib/optimizer/computeConditionals'

function calculate(selectedCharacter) {
  console.log('!!!', selectedCharacter)
  if (!selectedCharacter) return ''

  const relics = getRelics(selectedCharacter)
  const request = selectedCharacter.form
  const params = generateParams(request)

  generateConditionals(request, params)
  calculateTeammates(request, params)

  // const head = relics.Head[h]
  // const hands = relics.Hands[g]
  // const body = relics.Body[b]
  // const feet = relics.Feet[f]
  // const planarSphere = relics.PlanarSphere[p]
  // const linkRope = relics.LinkRope[l]

  return JSON.stringify(params, null, 2)
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
  return {
    set: -1,
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
