import { useState } from 'react'
import { Message } from '../../lib/message'
import { Button, Flex, Popconfirm, Typography } from 'antd'
import DB from '../../lib/db'
import { importerTabButtonWidth, importerTabSpinnerMs } from './importerTabUiConstants.ts'
import { DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

export function ClearDataSubmenu() {
  const [loading, setLoading] = useState(false)

  function clearDataClicked() {
    console.log('Clear data')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      DB.resetStore()

      Message.success('Cleared data')
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        Clear all optimizer data.
      </Text>
      <Popconfirm
        title="Erase all data"
        description="Are you sure you want to clear all relics and characters?"
        onConfirm={clearDataClicked}
        placement="bottom"
        okText="Yes"
        cancelText="Cancel"
      >
        <Button type="primary" icon={<DeleteOutlined/>} loading={loading} style={{ width: importerTabButtonWidth }}>
          Clear data
        </Button>
      </Popconfirm>
    </Flex>
  )
}
