import { Drawer, Flex } from 'antd'
import React, { useEffect, useState } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Assets } from 'lib/assets'

enum SELECT_STATE {
  WAITING,
  ADD,
  REMOVE,
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

      const cols = 4

      const characters = [
        form,
        form.teammate0,
        form.teammate1,
        form.teammate2,
      ].filter((x) => !!x)

      console.debug('characters', characters)

      let key = 0
      const uiRows: JSX.Element[] = []
      for (const character of characters) {
        uiRows.push((
          <Flex key={key++}>
            <img src={Assets.getCharacterAvatarById(character.characterId)}/>
          </Flex>
        ))
      }

      newState.display = (
        <Flex vertical>
          {uiRows}
        </Flex>
      )

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
      <div style={{ width: 850, height: '100%' }}>
        <Flex style={{ width: '100%' }} wrap={true}>
          {new Array(40).fill(0).map((_, index) => (
            <div
              className='selectable'
              data-key={index}
              key={index}
              style={{ width: 100, marginLeft: -1, marginTop: -1 }}
            >
            </div>
          ))}
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
