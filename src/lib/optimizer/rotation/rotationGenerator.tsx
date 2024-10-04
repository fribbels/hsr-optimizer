import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { ConditionalMap, ContentItem } from 'types/Conditionals'
import { Form, Teammate } from 'types/Form'
import { CharacterConditionals } from 'lib/characterConditionals'
import { ConditionalLightConeMap, LightConeConditional } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import React from 'react'
import { defaultSetConditionals } from 'lib/defaultForm'
import { ReactElement } from 'types/Components'
import { Button, Flex } from 'antd'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { SelectableBox } from 'components/optimizerTab/rotation/ComboDrawer'
import { Assets } from 'lib/assets'
import { MinusCircleOutlined } from '@ant-design/icons'
import { FormSwitchWithPopover } from 'components/optimizerTab/conditionals/FormSwitch'
import { FormSliderWithPopover } from 'components/optimizerTab/conditionals/FormSlider'

export enum ConditionalType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  SELECT = 'select',
}

export type ComboState = {
  display: React.JSX.Element,
  displayState: ComboDisplayState
  // formState: ComboFormState
}

export type ComboConditionals = {
  [key: string]: ComboConditionalCategory
}

export type ComboConditionalCategory = ComboBooleanConditional | ComboNumberConditional | ComboSelectConditional

export type ComboBooleanConditional = {
  type: ConditionalType.BOOLEAN,
  activations: boolean[]
}

export type ComboNumberConditional = {
  type: ConditionalType.NUMBER,
  partitions: ComboSubNumberConditional[]
}

export type ComboSubNumberConditional = {
  value: number
  activations: boolean[]
}

export type ComboSelectConditional = {
  type: ConditionalType.SELECT,
  partitions: ComboSubSelectConditional[]
}

export type ComboSubSelectConditional = {
  value: number
  activations: boolean[]
}

export type ComboCharacterMetadata = {
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number
}

export type ComboCharacter = {
  metadata: ComboCharacterMetadata
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
  setConditionals: ComboConditionals
}

export type ComboTeammate = {
  metadata: ComboCharacterMetadata
  characterConditionals: ComboConditionals
  lightConeConditionals: ComboConditionals
  relicSetConditionals: ComboConditionals
  ornamentSetConditionals: ComboConditionals
}

export type ComboDisplayState = {
  comboCharacter: ComboCharacter
  comboTeammate0: ComboTeammate
  comboTeammate1: ComboTeammate
  comboTeammate2: ComboTeammate
}

export type SetConditionals = typeof defaultSetConditionals

function generateComboConditionals(
  conditionals: CharacterConditionalMap,
  contents: ContentItem[],
  defaults: ConditionalMap,
  actionCount: number
) {
  const output: ComboConditionals = {}

  for (const content of contents) {
    if (content.disabled) continue

    if (content.formItem == 'switch') {
      const value: boolean = conditionals[content.id] ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(value)
      output[content.id] = {
        type: ConditionalType.BOOLEAN,
        activations: activations
      }
    } else if (content.formItem == 'slider') {
      const value: number = conditionals[content.id] ? conditionals[content.id] : defaults[content.id]
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubNumberConditional = {
        value: value,
        activations: activations
      }
      output[content.id] = {
        type: ConditionalType.NUMBER,
        partitions: [valuePartitions]
      }
    } else {
      // No other types for now
    }
  }

  return output
}

function generateSetComboConditionals(
  setConditionals: SetConditionals,
  actionCount: number
) {
  const output: ComboConditionals = {}

  for (const [setName, setConditionalValue] of Object.entries(setConditionals)) {
    const p4Value = setConditionalValue[1]
    if (typeof p4Value === 'boolean') {
      const activations: boolean[] = Array(actionCount).fill(p4Value)
      output[setName] = {
        type: ConditionalType.BOOLEAN,
        activations: activations
      }
    } else if (typeof p4Value === 'number') {
      const value: number = p4Value
      const activations: boolean[] = Array(actionCount).fill(true)
      const valuePartitions: ComboSubNumberConditional = {
        value: value,
        activations: activations
      }
      output[setName] = {
        type: ConditionalType.NUMBER,
        partitions: [valuePartitions]
      }
    } else {
      // No other types for now
    }
  }

  return output
}

function generateComboTeammate(teammate: Teammate, actionCount: number) {
  const characterConditionals = teammate.characterConditionals || {} as CharacterConditionalMap
  const lightConeConditionals = teammate.lightConeConditionals || {} as ConditionalLightConeMap

  const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(teammate)
  const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(teammate)

  const relicSetConditionals: ComboConditionals = {}
  const ornamentSetConditionals: ComboConditionals = {}
  if (teammate.teamRelicSet) {
    relicSetConditionals[teammate.teamRelicSet] = {
      type: ConditionalType.BOOLEAN,
      activations: Array(actionCount).fill(true)
    }
  }
  if (teammate.teamOrnamentSet) {
    ornamentSetConditionals[teammate.teamOrnamentSet] = {
      type: ConditionalType.BOOLEAN,
      activations: Array(actionCount).fill(true)
    }
  }

  const comboTeammate: ComboTeammate = {
    metadata: {
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
      lightCone: teammate.lightCone,
      lightConeSuperimposition: teammate.lightConeSuperimposition,
    },
    characterConditionals: generateComboConditionals(
      characterConditionals,
      characterConditionalMetadata.teammateContent!(),
      characterConditionalMetadata.teammateDefaults!(),
      actionCount
    ),
    lightConeConditionals: generateComboConditionals(
      lightConeConditionals,
      lightConeConditionalMetadata.teammateContent!(),
      lightConeConditionalMetadata.teammateDefaults!(),
      actionCount
    ),
    relicSetConditionals: relicSetConditionals,
    ornamentSetConditionals: ornamentSetConditionals,
  }

  return comboTeammate
}

export function initializeComboState(request: Form) {
  const comboDisplayState: ComboDisplayState = {} as ComboDisplayState
  const comboState: ComboState = {
    display: <></>,
    displayState: comboDisplayState as ComboDisplayState,
  } as ComboState

  const actionCount = 4

  const requestCharacterConditionals = request.characterConditionals
  const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(request)

  const requestLightConeConditionals = request.lightConeConditionals
  const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(request)

  const requestSetConditionals = request.setConditionals

  comboDisplayState.comboCharacter = {
    metadata: {
      characterId: request.characterId,
      characterEidolon: request.characterEidolon,
      lightCone: request.lightCone,
      lightConeSuperimposition: request.lightConeSuperimposition,
    },
    characterConditionals: generateComboConditionals(
      requestCharacterConditionals,
      characterConditionalMetadata.content(),
      characterConditionalMetadata.defaults(),
      actionCount
    ),
    lightConeConditionals: generateComboConditionals(
      requestLightConeConditionals,
      lightConeConditionalMetadata.content(),
      lightConeConditionalMetadata.defaults(),
      actionCount
    ),
    setConditionals: generateSetComboConditionals(
      requestSetConditionals,
      actionCount
    ),
  }

  comboDisplayState.comboTeammate0 = generateComboTeammate(request.teammate0, actionCount)
  comboDisplayState.comboTeammate1 = generateComboTeammate(request.teammate1, actionCount)
  comboDisplayState.comboTeammate2 = generateComboTeammate(request.teammate2, actionCount)

  comboState.display = convertDisplayStateToDisplay(comboDisplayState, actionCount)

  console.debug('aa', comboDisplayState)

  return comboState
}

function convertComboConditionalToDisplay(comboConditional: ComboConditionalCategory, contentItem: ContentItem, key: number, actionCount: number) {
  let result: ReactElement

  if (contentItem.formItem == 'switch') {
    const booleanComboConditional = comboConditional as ComboBooleanConditional

    result = (
      <Flex key={key} style={{ height: 45 }}>
        <Flex style={{width: 250, marginRight: 10}} align='center' gap={0}>
          <Flex style={{ width: 210 }} align='center'>
            {
              // @ts-ignore
              <FormSwitchWithPopover
                {...contentItem}
                name={contentItem.id}
                title={contentItem.title}
                content={ColorizeNumbers(contentItem.content)}
                text={contentItem.text}
                removeForm={true}
                onChange={(x) => console.log(x)}
                value={booleanComboConditional.activations[0]}
              />
            }
          </Flex>
          <Button type="text" shape="circle" icon={<MinusCircleOutlined />} style={{visibility: 'hidden'}}/>
        </Flex>
        <Flex>
          {
            booleanComboConditional.activations.map((value, index) => (
              <SelectableBox index={index} key={index} active={value}/>
            ))
          }
        </Flex>
      </Flex>
    )
  } else if (contentItem.formItem == 'slider') {
    const numberComboConditional = comboConditional as ComboNumberConditional
    const rows = numberComboConditional.partitions.length

    const partitionData: ReactElement[] = []

    for (let partitionIndex = 0; partitionIndex < rows; partitionIndex++) {
      const partition = numberComboConditional.partitions[partitionIndex]
      partitionData.push(
        <Flex key={partitionIndex} style={{ height: 45 }}>
          <Flex style={{width: 250, marginRight: 10}} align='center' gap={0}>
            <Flex style={{ width: 210 }} align='center'>
              {
                // @ts-ignore
                <FormSliderWithPopover
                  {...contentItem}
                  name={contentItem.id}
                  title={contentItem.title}
                  content={ColorizeNumbers(contentItem.content)}
                  text={contentItem.text}
                  onChange={(x) => console.log(x)}
                  value={partition.value}
                  removeForm={true}
                />
              }
            </Flex>
            <Button type="text" shape="circle" icon={<MinusCircleOutlined />}/>
          </Flex>
          <Flex>
            {
              partition.activations.map((active, index) => (
                <SelectableBox active={active} index={index} key={index}/>
              ))
            }
          </Flex>
        </Flex>
      )
    }

    result = (
      <Flex key={key} vertical>
        {partitionData}
      </Flex>
    )
  } else {
    // No other types
    result = <></>
  }

  return result
}

function ComboGroupRow(props: {src: string, content: ReactElement[]}) {
  return (
    <Flex gap={10} align='center' style={{ padding: 8, background: '#677dbd1c', borderRadius: 5 }}>
      <img src={props.src} style={{ width: 80, height: 80 }}/>
      <Flex vertical>
        {props.content}
      </Flex>
    </Flex>
  )
}

function renderContent(
  contentItems: ContentItem[],
  comboConditionals: ComboConditionals,
  actionCount: number
) {
  let key = 0
  const content: ReactElement[] = []
  for (const contentItem of contentItems) {
    const comboConditional = comboConditionals[contentItem.id]
    if (comboConditional == null) continue

    const display = convertComboConditionalToDisplay(comboConditional, contentItem, key++, actionCount)
    content.push(display)
  }

  return content
}


export function convertDisplayStateToDisplay(displayState: ComboDisplayState, actionCount: number): ReactElement {
  const uiRows: ReactElement[] = []
  let key = 0

  if (displayState.comboCharacter) {
    const comboCharacter = displayState.comboCharacter
    const comboCharacterConditionals: ComboConditionals = comboCharacter.characterConditionals
    const comboLightConeConditionals: ComboConditionals = comboCharacter.lightConeConditionals
    const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(comboCharacter.metadata)
    const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(comboCharacter.metadata)


    uiRows.push((
      <ComboGroupRow
        key={key++}
        src={Assets.getCharacterAvatarById(comboCharacter.metadata.characterId)}
        content={renderContent(characterConditionalMetadata.content(), comboCharacterConditionals, actionCount)}
      />
    ))
    uiRows.push((
      <ComboGroupRow
        key={key++}
        src={Assets.getLightConeIconById(comboCharacter.metadata.lightCone)}
        content={renderContent(lightConeConditionalMetadata.content(), comboLightConeConditionals, actionCount)}
      />
    ))
  }

  function renderTeammate(teammate: ComboTeammate) {
    if (!teammate) return

    const comboCharacterConditionals: ComboConditionals = teammate.characterConditionals
    const comboLightConeConditionals: ComboConditionals = teammate.lightConeConditionals
    const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(teammate.metadata)
    const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(teammate.metadata)

    uiRows.push((
      <ComboGroupRow
        key={key++}
        src={Assets.getCharacterAvatarById(teammate.metadata.characterId)}
        content={renderContent(characterConditionalMetadata.teammateContent!(), comboCharacterConditionals, actionCount)}
      />
    ))
    uiRows.push((
      <ComboGroupRow
        key={key++}
        src={Assets.getLightConeIconById(teammate.metadata.lightCone)}
        content={renderContent(lightConeConditionalMetadata.teammateContent!(), comboLightConeConditionals, actionCount)}
      />
    ))
  }

  renderTeammate(displayState.comboTeammate0)
  renderTeammate(displayState.comboTeammate1)
  renderTeammate(displayState.comboTeammate2)

  return (
    <Flex vertical gap={8}>
      {uiRows}
    </Flex>
  )
}

function updateStateSelection(events, comboState: ComboState) {

  return comboState
}