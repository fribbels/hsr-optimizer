import { Flex, Typography } from 'antd'
import { Constants } from 'lib/constants.ts'
import DB from 'lib/db'
import { calculateBuild } from 'lib/optimizer/calculateBuild'

function calculate(selectedCharacter) {
  console.log('!!!', selectedCharacter)
  if (!selectedCharacter) return ''

  const relics = getRelics(selectedCharacter)
  const request = selectedCharacter.form

  const c = calculateBuild(request, relics)
  return JSON.stringify(c, null, 2)
}

function getRelics(selectedCharacter) {
  const relics = {}
  const equippedPartIds = selectedCharacter.equipped || {}
  for (let part of Object.values(Constants.Parts)) {
    relics[part] = DB.getRelicById(equippedPartIds[part])
  }

  return relics
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
