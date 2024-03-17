import { useState } from 'react'
import { Message } from '../../lib/message.js'
import { Button, Flex, Typography } from 'antd'
import DB from '../../lib/db.js'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from './importerTabUiConstants.ts'
import { SaveState } from 'lib/saveState.js'

const { Text } = Typography

export function RelicRollsSubmenu() {
  const [loading, setLoading] = useState(false)

  function gradeCurrentRelicRolls() {
    console.log('Grade relic rolls')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // DB.resetStore()
      DB.gradeRelicRolls(DB.getRelics())
      SaveState.save()

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
