import { Drawer, Flex } from 'antd'
import React from 'react'
import Selecto from 'react-selecto'

enum SELECT_STATE {
  WAITING,
  ADD,
  REMOVE,
}

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)

  return (
    <Drawer
      title='Advanced COMBO Rotation'
      placement='right'
      onClose={() => setComboDrawerOpen(false)}
      open={comboDrawerOpen}
      width={1000}
      forceRender
    >
      <div style={{ width: 800, height: '100%' }}>
        <Flex style={{ width: '100%' }} wrap={true}>
          {new Array(40).fill(0).map((_, index) => (
            <div
              className='selectable'
              data-key={index}
              key={index}
              style={{ width: 100 }}
            >
            </div>
          ))}
        </Flex>
        <Selecto
          className='selecto-selection'
          // The container to add a selection element
          container={document.body}
          // The area to drag selection element (default: container)
          dragContainer={window}
          // Targets to select. You can register a queryselector or an Element.
          selectableTargets={['.selectable']}
          // Whether to select by click (default: true)
          selectByClick={true}
          // Whether to select from the target inside (default: true)
          selectFromInside={true}
          // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
          continueSelect={true}
          // Determines which key to continue selecting the next target via keydown and keyup.
          toggleContinueSelect='shift'
          // The container for keydown and keyup events
          keyContainer={window}
          // The rate at which the target overlaps the drag area to be selected. (default: 100)
          hitRate={0}
          onSelect={(e) => {
            console.log('added', e.added)
            console.log('removed', e.removed)
            console.log(e)
            e.added.forEach((el) => {
              el.classList.add('selected')
            })
            e.removed.forEach((el) => {
              el.classList.remove('selected')
            })
          }}
        />
      </div>
    </Drawer>
  )
}
