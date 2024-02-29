import { Flex, Typography } from 'antd'
import { calculateBuildByCharacterEquippedIds } from 'lib/optimizer/calculateBuild'

export function CharacterTabDebugPanel({ selectedCharacter }) {
  const display = JSON.stringify(calculateBuildByCharacterEquippedIds(selectedCharacter), null, 2)
  return (
    <Flex>
      <Typography.Text style={{ whiteSpace: 'pre' }}>
        {display}
      </Typography.Text>
    </Flex>
  )
}
