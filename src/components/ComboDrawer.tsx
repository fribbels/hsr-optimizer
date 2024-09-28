import { Drawer, Flex } from 'antd'
import React from 'react'

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)

  return (
    <Drawer
      title='Conditional set effects'
      placement='right'
      onClose={() => setComboDrawerOpen(false)}
      open={comboDrawerOpen}
      width={1000}
      forceRender
    >
      <Flex justify='center'>
        a
      </Flex>
    </Drawer>
  )
}
