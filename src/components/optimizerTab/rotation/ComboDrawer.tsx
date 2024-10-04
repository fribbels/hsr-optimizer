import { Drawer, Flex } from 'antd'
import React, { useEffect, useState } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Assets } from 'lib/assets'
import { CharacterConditional } from 'types/CharacterConditional'
import { CharacterConditionals } from 'lib/characterConditionals'
import { LightConeConditional } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { FormItemComponentMap } from 'components/optimizerTab/conditionals/DisplayFormControl'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { Form } from 'types/Form'

function ContentDisplay(props: { content: ContentItem, cols: number }) {
  let key = 0
  const content = props.content
  const FormItemComponent = FormItemComponentMap[content.formItem]

  return (
    <Flex key={key++} style={{ height: 40 }}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore
          <FormItemComponent
            {...content}
            name={content.id}
            title={content.title}
            content={ColorizeNumbers(content.content)}
            text={content.text}
          />
        }
      </Flex>
      <Flex>
        {
          new Array(props.cols).fill(0).map((_, index) => (
            <SelectableBox index={index}/>
          ))
        }
      </Flex>
    </Flex>
  )
}

function SelectableBox(props: { index: number }) {
  return (
    <div
      className='selectable'
      data-key={props.index}
      key={props.index}
      style={{ width: 75, marginLeft: -1, marginTop: -1 }}
    >
    </div>
  )
}

export type ComboState = {
  display: React.JSX.Element,
  displayState: ComboDisplayState
  // formState: ComboFormState
}

export type ComboConditionals = {
  [key: string]: ComboBooleanConditional | ComboNumberConditional | ComboSelectConditional
}

export type ComboBooleanConditional = {
  values: number[]
}

export type ComboSelectConditional = {
  valuePartitions: ComboSubSelectConditional[]
}

export type ComboSubSelectConditional = {
  index: number
  values: boolean[]
}

export type ComboNumberConditional = {
  valuePartitions: ComboSubNumberConditional[]
}

export type ComboSubNumberConditional = {
  index: number
  values: boolean[]
}

export type ComboCharacter = {
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
  setConditionals: ComboConditionals
}

export type ComboTeammate = {
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
}

export type ComboDisplayState = {
  comboCharacter: ComboCharacter
  comboTeammate0: ComboTeammate
  comboTeammate1: ComboTeammate
  comboTeammate2: ComboTeammate
}

function buildComboState(request: Form) {
  const comboDisplayState: Partial<ComboDisplayState> = {}
  const comboState: Partial<ComboState> = {
    display: <></>,
    displayState: comboDisplayState as ComboDisplayState,
  }

  if (request.characterConditionals) {
    comboDisplayState.comboCharacter = {
      characterConditionals: request.characterConditionals,
      lightConeConditionals: request.lightConeConditionals,
      setConditionals: request.setConditionals,
    }
  }
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

      const cols = 6

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
        if (!character.characterId) continue

        const originalCharacter = key == 0
        const characterConditionals: CharacterConditional = CharacterConditionals.get(character)
        const lightConeConditionals: LightConeConditional = LightConeConditionals.get(character)


        console.log(characterConditionals)
        console.log(lightConeConditionals)

        const characterContent: JSX.Element[] = []
        const lightConeContent: JSX.Element[] = []

        for (const content of originalCharacter ? characterConditionals.content() : (characterConditionals?.teammateContent ? characterConditionals.teammateContent() : [])) {
          if (content.formItem == 'switch' && !content.disabled) {
            characterContent.push(
              <ContentDisplay key={key++} content={content} cols={cols}/>
            )
          }
        }

        for (const content of originalCharacter ? lightConeConditionals.content() : (lightConeConditionals?.teammateContent ? lightConeConditionals.teammateContent() : [])) {
          if (content.formItem == 'switch' && !content.disabled) {
            lightConeContent.push(
              <ContentDisplay key={key++} content={content} cols={cols}/>
            )
          }
        }

        uiRows.push((
          <Flex key={key++} gap={10} align='center' style={{ padding: 8, background: '#677dbd1c', borderRadius: 5 }}>
            <img src={Assets.getCharacterAvatarById(character.characterId)} style={{ width: 80, height: 80 }}/>
            <Flex vertical>
              {characterContent}
            </Flex>
          </Flex>
        ))
        uiRows.push((
          <Flex key={key++} gap={10} align='center' style={{ padding: 8, background: '#677dbd1c', borderRadius: 5 }}>
            <img src={Assets.getLightConeIconById(character.lightCone)} style={{ width: 80, height: 80 }}/>
            <Flex>
              {lightConeContent}
            </Flex>
          </Flex>
        ))
      }

      newState.display = (
        <Flex vertical gap={8}>
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
      <div style={{ width: 930, height: '100%' }}>
        <Flex style={{ marginBottom: 10 }}>
          <div style={{ width: 305 }}/>
          <Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Ult</Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Skill</Flex>
            <Flex style={{ width: 77 }} justify='space-around'>Skill</Flex>
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
