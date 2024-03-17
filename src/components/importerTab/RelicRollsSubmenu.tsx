import { useState } from 'react'
import { Message } from '../../lib/message.js'
import { Button, Flex, Typography } from 'antd'
import DB from '../../lib/db.js'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from './importerTabUiConstants.ts'

const { Text } = Typography

export function RelicRollsSubmenu() {
  const [loading, setLoading] = useState(false)

  function gradeCurrentRelicRolls() {
    console.log('Grade relic rolls')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // DB.resetStore()
      DB.addGradesToRelics()

      Message.success('Cleared data')
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>Grade your relic substat rolls.</Text>
      <Button
        type="primary"
        loading={loading}
        onClick={gradeCurrentRelicRolls}
        style={{ width: importerTabButtonWidth }}
      >
        Grade relic substats
      </Button>
    </Flex>
  )
}
