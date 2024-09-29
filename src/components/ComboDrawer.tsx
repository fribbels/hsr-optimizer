import { Drawer, Flex, Switch } from 'antd'
import React, { useEffect, useState } from 'react'
import { Rnd } from 'react-rnd'
import FormCard from 'components/optimizerTab/FormCard'

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const [display, setDisplay] = useState()

  useEffect(() => {
    if (comboDrawerOpen == true) {
      setDisplay(
        <Flex vertical style={{ width: 400 }} gap={5}>
          <DragTest row={0}/>
          <DragTest row={1}/>
          <DragTest row={2}/>
        </Flex>,
      )
    }
  }, [comboDrawerOpen])

  return (
    <Drawer
      title='Advanced COMBO Rotation'
      placement='right'
      onClose={() => setComboDrawerOpen(false)}
      open={comboDrawerOpen}
      width={1000}
      forceRender
    >
      {display}
    </Drawer>
  )
}

function DragTest(props: { row: number }) {
  const className = `parent-drag-test-${props.row}`
  return (
    <Flex style={{ height: 50 }} className={className}>
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: 100,
          height: 50,
        }}
        bounds={'.' + className}
        dragGrid={[100, 1]}
        resizeGrid={[100, 1]}
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <FormCard height={30} style={{ marginLeft: 20 }}>
          <Flex vertical justify='center' style={{ height: 50 }} defaultChecked={true}>
            <Switch style={{ width: 50 }}/>
          </Flex>
        </FormCard>
      </Rnd>
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: 100,
          height: 50,
        }}
        bounds={'.' + className}
        dragGrid={[100, 1]}
        resizeGrid={[100, 1]}
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <FormCard height={30} style={{ marginLeft: 20 }}>
          <Flex vertical justify='center' style={{ height: 50 }} defaultChecked={true}>
            <Switch style={{ width: 50 }}/>
          </Flex>
        </FormCard>
      </Rnd>
      <Rnd
        default={{
          x: 0,
          y: 0,
          width: 100,
          height: 50,
        }}
        bounds={'.' + className}
        dragGrid={[100, 1]}
        resizeGrid={[100, 1]}
        enableResizing={{
          top: false,
          right: true,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <FormCard height={30} style={{ marginLeft: 20 }}>
          <Flex vertical justify='center' style={{ height: 50 }} defaultChecked={true}>
            <Switch style={{ width: 50 }}/>
          </Flex>
        </FormCard>
      </Rnd>
    </Flex>
  )
}
