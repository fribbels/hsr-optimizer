import { Drawer, Flex } from 'antd'
import React, { useEffect, useState } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { initializeComboState } from 'lib/optimizer/rotation/rotationGenerator'

export function SelectableBox(props: { active: boolean, index: number }) {
  const classnames = props.active ? 'selectable selected' : 'selectable'
  return (
    <div
      className={classnames}
      data-key={props.index}
      style={{ width: 75, marginLeft: -1, marginTop: -1 }}
    >
    </div>
  )
}

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const [state, setState] = useState({
    display: <></>,

  })

  useEffect(() => {
    if (comboDrawerOpen) {
      const newState = {
        ...state,
      }

      const form = OptimizerTabController.getForm()
      console.debug('form', form)
      console.debug('combo', form.combo)

      const comboState = initializeComboState(form)
      newState.display = comboState.display

      setState(newState)
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
      <div style={{ width: 930, height: '100%' }}>
        <Flex style={{ marginBottom: 10 }}>
          <div style={{ width: 365 }}/>
          <Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Ult</Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 75 }} justify='space-around'>Skill</Flex>
          </Flex>
        </Flex>
        {state.display}
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
