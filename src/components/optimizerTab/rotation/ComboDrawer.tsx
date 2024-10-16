import { Button, Divider, Drawer, Flex, Select } from 'antd'
import React, { useEffect, useMemo, useRef } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { ComboBooleanConditional, ComboCharacter, ComboConditionalCategory, ComboConditionals, ComboNumberConditional, ComboSelectConditional, ComboState, ComboSubNumberConditional, ComboTeammate, initializeComboState, locateActivations, updateAbilityRotation, updateActivation, updateAddPartition, updateDeletePartition, updateFormState, updateNumberDefaultSelection, updatePartitionActivation, updateSelectedSets } from 'lib/optimizer/rotation/comboDrawerController'
import { CharacterConditional } from 'types/CharacterConditional'
import { CharacterConditionals } from 'lib/characterConditionals'
import { Assets } from 'lib/assets'
import { LightConeConditional } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ReactElement } from 'types/Components'
import { FormSwitchWithPopover } from 'components/optimizerTab/conditionals/FormSwitch'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { FormSliderWithPopover } from 'components/optimizerTab/conditionals/FormSlider'
import GenerateOrnamentsOptions from 'components/optimizerTab/optimizerForm/OrnamentsOptions'
import { OrnamentSetTagRenderer } from 'components/optimizerTab/optimizerForm/OrnamentSetTagRenderer'
import { GenerateBasicSetsOptions } from 'components/optimizerTab/optimizerForm/SetsOptions'
import { FormSelectWithPopover } from 'components/optimizerTab/conditionals/FormSelect'
import { ConditionalSetMetadata, generateSetConditionalContent } from 'lib/optimizer/rotation/setConditionalContent'
import { ConditionalDataType } from 'lib/constants'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'

const buttonStyle = {
  fontSize: 20,
}

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const formValues = window.store((s) => s.formValues)

  const comboState = window.store((s) => s.comboState)
  const setComboState = window.store((s) => s.setComboState)

  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef(undefined)

  useEffect(() => {
    if (comboDrawerOpen) {
      const form = OptimizerTabController.getForm()
      if (!form?.characterId || !form.characterConditionals) return

      const comboState = initializeComboState(form, true)
      setComboState(comboState)
    } else {
      updateFormState(comboState)
    }
  }, [formValues, comboDrawerOpen])

  return (
    <Drawer
      title={<ComboDrawerTitle/>}
      placement='right'
      onClose={() => setComboDrawerOpen(false)}
      open={comboDrawerOpen}
      width={1125}
      forceRender
      className='.comboDrawer'
      extra={(
        <Flex style={{ width: 716 }} align='center'>
          <ComboHeader comboState={comboState}/>
        </Flex>
      )}
    >
      <div style={{ width: 1050, height: '100%' }}>
        <StateDisplay comboState={comboState}/>
        <Selecto
          className='selecto-selection'
          // The container to add a selection element
          // container={'.comboDrawer'}
          // The area to drag selection element (default: container)
          // dragContainer={window}
          // Targets to select. You can register a queryselector or an Element.
          selectableTargets={['.selectable']}
          // Whether to select by click (default: true)
          selectByClick={true}
          // Whether to select from the target inside (default: true)
          selectFromInside={true}
          // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
          continueSelect={true}
          // Determines which key to continue selecting the next target via keydown and keyup.
          // toggleContinueSelect='shift'
          // The container for keydown and keyup events
          keyContainer={window}
          // The rate at which the target overlaps the drag area to be selected. (default: 100)
          hitRate={0}
          onDrag={(e) => {
            const selectedKey = e.inputEvent.srcElement.getAttribute('data-key') ?? '{}'
            if (selectedKey != lastSelectedKeyState.current) {
              updatePartitionActivation(selectedKey, comboState)
              lastSelectedKeyState.current = selectedKey
            }
          }}
          onDragStart={(e) => {
            const startKey = e.inputEvent.srcElement.getAttribute('data-key') ?? '{}'
            const located = locateActivations(startKey, comboState)

            selectActivationState.current = !(located && located.value)
            lastSelectedKeyState.current = undefined
          }}
          onSelect={(e) => {
            const newState = {
              ...comboState,
            }

            e.added.forEach((el) => {
              updateActivation(elementToDataKey(el), selectActivationState.current, newState)
            })
            e.removed.forEach((el) => {
              updateActivation(elementToDataKey(el), selectActivationState.current, newState)
            })

            const selectedKey = e.inputEvent.srcElement.getAttribute('data-key') ?? '{}'
            if (selectedKey != lastSelectedKeyState.current) {
              updatePartitionActivation(selectedKey, comboState)
              lastSelectedKeyState.current = selectedKey
            }

            setComboState(newState)
          }}
        />
      </div>
    </Drawer>
  )
}

function ComboDrawerTitle() {
  return (
    <div style={{ width: 'fit-content' }}>
      <ColorizedLinkWithIcon
        text='Advanced Rotation User Guide'
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/advanced-rotations.md'
      />
    </div>
  )
}

export const abilitySelectOptions = [
  {
    value: 'BASIC',
    label: 'Basic',
    display: 'Basic',
  },
  {
    value: 'SKILL',
    label: 'Skill',
    display: 'Skill',
  },
  {
    value: 'ULT',
    label: 'Ult',
    display: 'Ult',
  },
  {
    value: 'FUA',
    label: 'Fua',
    display: 'Fua',
  },
]

function AbilitySelector(props: { comboAbilities: string[]; index: number }) {
  if (props.index == 0) return <></>

  return (
    <Select
      dropdownStyle={{ width: 'fit-content' }}
      style={{ width: abilityWidth }}
      listHeight={800}
      optionLabelProp='display'
      options={abilitySelectOptions}
      placement='bottomLeft'
      value={props.comboAbilities[props.index]}
      allowClear={true}
      onSelect={(value: string) => {
        updateAbilityRotation(props.index, value)
      }}
      onDeselect={(value: string) => {

      }}
      onClear={() => {
        // @ts-ignore
        updateAbilityRotation(props.index, null)
      }}
    />
  )
}

const abilityWidth = 70
const abilityGap = 6

function ComboHeader(props: { comboState: ComboState }) {
  const comboAbilities = props.comboState.comboAbilities

  if (!comboAbilities) return <></>

  const length = comboAbilities.length
  const render = Array(Math.min(9, length + 1)).fill(false).map((value, index) => (
    <AbilitySelector comboAbilities={comboAbilities} index={index} key={index}/>
  ))

  return (
    <Flex gap={abilityGap}>
      <div style={{ width: abilityWidth }}/>
      {render}
    </Flex>
  )
}

export function elementToDataKey(element: HTMLElement | SVGElement) {
  return element.getAttribute('data-key') ?? '{}' // Get the data-key attribute
}

function GroupDivider(props: { text: string }) {
  return (
    <Divider plain>
      {props.text}
    </Divider>
  )
}

function SetSelector(props: { selected: string[]; options: { value: string; label: ReactElement }[]; placeholder: string; submit: (arr: string[]) => void }) {
  return (
    <Select
      dropdownStyle={{
        width: 300,
      }}
      listHeight={800}
      mode='multiple'
      allowClear
      style={{ flex: 1 }}
      options={props.options}
      tagRender={OrnamentSetTagRenderer}
      placeholder={props.placeholder}
      maxTagCount='responsive'
      placement='topRight'
      value={props.selected ?? []}
      onSelect={(value: string) => {
        const selected = [...props.selected, value]
        props.submit([...props.selected, value])
      }}
      onDeselect={(value: string) => {
        const selected = props.selected.filter((selected) => selected !== value)
        props.submit(selected)
      }}
      onClear={() => {
        props.submit([])
      }}
    />
  )
}

function SetSelectors(props: { comboOrigin: ComboCharacter }) {
  return (
    <Flex style={{ width: '100%' }} gap={10}>
      <SetSelector
        selected={props.comboOrigin?.displayedRelicSets}
        options={GenerateBasicSetsOptions()}
        placeholder='Relic set conditionals'
        submit={(arr) => {
          updateSelectedSets(arr, false)
        }}
      />
      <SetSelector
        selected={props.comboOrigin?.displayedOrnamentSets}
        options={GenerateOrnamentsOptions()}
        placeholder='Ornament set conditionals'
        submit={(arr) => {
          updateSelectedSets(arr, true)
        }}
      />
    </Flex>
  )
}

function SetDisplays(props: { comboOrigin: ComboCharacter; conditionalType: string; actionCount: number; originKey: string }) {
  const relicSets = props.comboOrigin?.displayedRelicSets || []
  const ornamentSets = props.comboOrigin?.displayedOrnamentSets || []
  const setRender = [...relicSets, ...ornamentSets].map((setName) => {
    return (
      <ComboConditionalsGroupRow key={setName} comboOrigin={props.comboOrigin} conditionalType={setName} actionCount={props.actionCount} originKey={props.originKey}/>
    )
  })

  return (
    <Flex vertical gap={8}>
      {setRender}
    </Flex>
  )
}

function StateDisplay(props: { comboState: ComboState }) {
  const comboCharacter = props.comboState?.comboCharacter
  const comboTeammate0 = props.comboState?.comboTeammate0
  const comboTeammate1 = props.comboState?.comboTeammate1
  const comboTeammate2 = props.comboState?.comboTeammate2
  const actionCount = props.comboState?.comboAbilities?.length || 0

  return (
    <Flex vertical gap={8}>
      <ComboConditionalsGroupRow comboOrigin={comboCharacter} actionCount={actionCount} conditionalType='character' originKey='comboCharacter'/>
      <ComboConditionalsGroupRow comboOrigin={comboCharacter} actionCount={actionCount} conditionalType='lightCone' originKey='comboCharacterLightCone'/>
      <GroupDivider text='Relic / Ornament set conditionals'/>
      <SetSelectors comboOrigin={comboCharacter}/>
      <SetDisplays comboOrigin={comboCharacter} conditionalType='relicSets' actionCount={actionCount} originKey='comboCharacterRelicSets'/>
      <GroupDivider text='Teammate 1 conditionals'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='character' originKey='comboTeammate0'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate0LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate0RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate0OrnamentSet'/>
      <GroupDivider text='Teammate 2 conditionals'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='character' originKey='comboTeammate1'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate1LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate1RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate1OrnamentSet'/>
      <GroupDivider text='Teammate 3 conditionals'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='character' originKey='comboTeammate2'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate2LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate2RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate2OrnamentSet'/>
    </Flex>
  )
}

function ComboConditionalsGroupRow(props: { comboOrigin: ComboTeammate | ComboCharacter | null; conditionalType: string; actionCount: number; originKey: string }) {
  const setContent = useMemo(() => {
    return generateSetConditionalContent()
  }, [])

  const renderData = useMemo(() => {
    if (!props.comboOrigin) {
      return null
    }

    let content: ContentItem[]
    let src: string
    let conditionals: ComboConditionals

    const isTeammate = props.originKey.includes('Teammate')
    const comboCharacter = props.comboOrigin as ComboCharacter
    const comboTeammate = props.comboOrigin as ComboTeammate
    const metadata = comboCharacter.metadata

    if (props.originKey.includes('LightCone')) {
      const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(metadata, true)

      content = isTeammate ? lightConeConditionalMetadata.teammateContent?.() ?? [] : lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
      conditionals = comboCharacter.lightConeConditionals
    } else if (props.originKey.includes('comboCharacterRelicSets')) {
      const setName = props.conditionalType
      const disabled = !ConditionalSetMetadata[setName].modifiable

      const category: ComboConditionalCategory = comboCharacter.setConditionals[setName]
      if (category.type == ConditionalDataType.BOOLEAN) {
        content = [{
          formItem: 'switch',
          disabled: disabled,
          id: setName,
          name: setName,
          text: setName,
          title: setName,
          content: setName,
        }]
      } else if (category.type == ConditionalDataType.NUMBER) {
        content = [{
          formItem: 'slider',
          disabled: disabled,
          id: setName,
          name: setName,
          text: setName,
          title: setName,
          content: setName,
          min: 0,
          max: 10,
        }]
      } else if (category.type == ConditionalDataType.SELECT) {
        content = [{
          formItem: 'select',
          disabled: disabled,
          id: setName,
          name: setName,
          text: setName,
          title: setName,
          content: setName,
          options: setContent[setName],
        }]
      } else {
        return null
      }
      src = Assets.getSetImage(setName, null, true)
      conditionals = comboCharacter.setConditionals
    } else if (props.originKey.includes('RelicSet')) {
      const keys = Object.keys(comboTeammate.relicSetConditionals)
      if (keys.length) {
        const setName = keys[0]
        content = [
          {
            formItem: 'switch',
            id: setName,
            name: setName,
            text: setName,
            title: setName,
            content: setName,
          },
        ]
        src = Assets.getSetImage(setName, null, true)
        conditionals = comboTeammate.relicSetConditionals
      } else {
        return null
      }
    } else if (props.originKey.includes('OrnamentSet')) {
      const keys = Object.keys(comboTeammate.ornamentSetConditionals)
      if (keys.length) {
        const setName = keys[0]
        content = [
          {
            formItem: 'switch',
            id: setName,
            name: setName,
            text: setName,
            title: setName,
            content: setName,
          },
        ]
        src = Assets.getSetImage(setName, null, true)
        conditionals = comboTeammate.ornamentSetConditionals
      } else {
        return null
      }
    } else {
      // Character
      const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(metadata, true)

      content = isTeammate ? characterConditionalMetadata.teammateContent?.() ?? [] : characterConditionalMetadata.content()
      src = Assets.getCharacterAvatarById(metadata.characterId)
      conditionals = comboCharacter.characterConditionals
    }

    return {
      content,
      src,
      conditionals,
    }
  }, [props.comboOrigin])

  if (!renderData) {
    return <></>
  }

  return (
    <Flex gap={10} align='center' style={{ padding: 8, background: '#677dbd1c', borderRadius: 5 }}>
      <img src={renderData.src} style={{ width: 80, height: 80 }}/>
      <ContentRows
        contentItems={renderData.content}
        comboConditionals={renderData.conditionals}
        actionCount={props.actionCount}
        sourceKey={props.originKey}
      />
    </Flex>
  )
}

export function ContentRows(
  props: {
    contentItems: ContentItem[]
    comboConditionals: ComboConditionals
    actionCount: number
    sourceKey: string
  },
) {
  const content = useMemo(() => {
    const content: ReactElement[] = []
    for (const contentItem of props.contentItems) {
      const comboConditional = props.comboConditionals[contentItem.id]
      if (comboConditional == null) continue

      const display = (
        <ConditionalActivationRow key={contentItem.id} contentItem={contentItem} comboConditional={comboConditional} actionCount={props.actionCount} sourceKey={props.sourceKey}/>
      )
      content.push(display)
    }

    return content
  }, [JSON.stringify(props.comboConditionals), props.actionCount])

  return (
    <Flex vertical>
      {content.length == 0 ? <div style={{ marginLeft: 5 }}>No conditional passives</div> : content}
    </Flex>
  )
}

function ConditionalActivationRow(props: { contentItem: ContentItem; comboConditional: ComboConditionalCategory; actionCount: number; sourceKey: string }) {
  if (props.contentItem.formItem == 'switch') {
    return (
      <BooleanConditionalActivationRow contentItem={props.contentItem} activations={(props.comboConditional as ComboBooleanConditional).activations} actionCount={props.actionCount} sourceKey={props.sourceKey}/>
    )
  } else if (props.contentItem.formItem == 'select') {
    return (
      <SelectConditionalActivationRow comboConditional={(props.comboConditional as ComboSelectConditional)} contentItem={props.contentItem} actionCount={props.actionCount} sourceKey={props.sourceKey}/>
    )
  }
  return (
    <NumberConditionalActivationRow comboConditional={(props.comboConditional as ComboNumberConditional)} contentItem={props.contentItem} actionCount={props.actionCount} sourceKey={props.sourceKey}/>
  )
}

function BooleanConditionalActivationRow(props: { contentItem: ContentItem; activations: boolean[]; actionCount: number; sourceKey: string }) {
  const dataKeys: string[] = []

  for (let i = 0; i < props.activations.length; i++) {
    dataKeys.push(JSON.stringify({
      id: props.contentItem.id,
      source: props.sourceKey,
      index: i,
    }))
  }

  return (
    <Flex key={props.contentItem.id} style={{ height: 45 }}>
      <BooleanSwitch contentItem={props.contentItem} sourceKey={props.sourceKey} value={props.activations[0]}/>
      <BoxArray activations={props.activations} actionCount={props.actionCount} dataKeys={dataKeys} partition={false} unselectable={props.contentItem.disabled}/>
    </Flex>
  )
}

function NumberConditionalActivationRow(props: { comboConditional: ComboNumberConditional; contentItem: ContentItem; actionCount: number; sourceKey: string }) {
  const numberComboConditional = props.comboConditional
  const rows = numberComboConditional.partitions.length
  const display: ReactElement[] = []

  for (let i = 0; i < numberComboConditional.partitions.length; i++) {
    const x = numberComboConditional.partitions[i]
    display.push(
      <Partition key={i} partition={x} contentItem={props.contentItem} activations={x.activations} partitionIndex={i} actionCount={props.actionCount} sourceKey={props.sourceKey}/>,
    )
  }

  return (
    <Flex vertical>
      {display}
    </Flex>
  )
}

function SelectConditionalActivationRow(props: { comboConditional: ComboSelectConditional; contentItem: ContentItem; actionCount: number; sourceKey: string }) {
  const selectComboConditional = props.comboConditional
  const rows = selectComboConditional.partitions.length
  const display: ReactElement[] = []

  for (let i = 0; i < selectComboConditional.partitions.length; i++) {
    const x = selectComboConditional.partitions[i]
    display.push(
      <Partition key={i} partition={x} contentItem={props.contentItem} activations={x.activations} partitionIndex={i} actionCount={props.actionCount} sourceKey={props.sourceKey}/>,
    )
  }

  return (
    <Flex vertical>
      {display}
    </Flex>
  )
}

function Partition(props: { partition: ComboSubNumberConditional; contentItem: ContentItem; activations: boolean[]; partitionIndex: number; actionCount: number; sourceKey: string }) {
  const dataKeys: string[] = []

  for (let i = 0; i < props.activations.length; i++) {
    dataKeys.push(JSON.stringify({
      id: props.contentItem.id,
      source: props.sourceKey,
      partitionIndex: props.partitionIndex,
      index: i,
    }))
  }

  const render = props.contentItem.formItem == 'slider'
    ? <NumberSlider contentItem={props.contentItem} value={props.partition.value} sourceKey={props.sourceKey} partitionIndex={props.partitionIndex}/>
    : <NumberSelect contentItem={props.contentItem} value={props.partition.value} sourceKey={props.sourceKey} partitionIndex={props.partitionIndex}/>

  return (
    <Flex key={props.partitionIndex} style={{ height: 45 }}>
      {render}
      <BoxArray activations={props.activations} actionCount={props.actionCount} dataKeys={dataKeys} partition={true}/>
    </Flex>
  )
}

function BooleanSwitch(props: { contentItem: ContentItem; sourceKey: string; value: boolean }) {
  const contentItem = props.contentItem

  // console.debug(props.sourceKey)

  return (
    <Flex style={{ width: 250, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore
          <FormSwitchWithPopover
            {...contentItem}
            name={contentItem.id}
            title={contentItem.title}
            teammateIndex={getTeammateIndex(props.sourceKey)}
            content={ColorizeNumbers(contentItem.content)}
            text={contentItem.text}
            removeForm={false}
            set={props.sourceKey.includes('comboCharacterRelicSets')}
            value={props.value}
            disabled={props.sourceKey.includes('Teammate') && props.sourceKey.includes('Set') || props.contentItem.disabled}
          />
        }
      </Flex>
    </Flex>
  )
}

function getTeammateIndex(sourceKey: string) {
  if (sourceKey.includes('Teammate0')) return 0
  if (sourceKey.includes('Teammate1')) return 1
  if (sourceKey.includes('Teammate2')) return 2
  return undefined
}

function NumberSlider(props: { contentItem: ContentItem; value: number; sourceKey: string; partitionIndex: number }) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 250, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore
          <FormSliderWithPopover
            {...contentItem}
            name={contentItem.id}
            title={contentItem.title}
            content={ColorizeNumbers(contentItem.content)}
            teammateIndex={getTeammateIndex(props.sourceKey)}
            text={contentItem.text}
            onChange={(value) => updateNumberDefaultSelection(props.sourceKey, contentItem.id, props.partitionIndex, value)}
            value={props.value}
            removeForm={props.partitionIndex > 0}
          />
        }
      </Flex>
      <Button
        type='text' shape='circle' icon={props.partitionIndex == 0 ? <PlusCircleOutlined style={buttonStyle}/> : <MinusCircleOutlined style={buttonStyle}/>}
        onClick={() => {
          if (props.partitionIndex == 0) {
            updateAddPartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
          } else {
            updateDeletePartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
          }
        }}
      />
    </Flex>
  )
}

function NumberSelect(props: { contentItem: ContentItem; value: number; sourceKey: string; partitionIndex: number }) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 250, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore
          <FormSelectWithPopover
            {...contentItem}
            name={contentItem.id}
            title={contentItem.title}
            teammateIndex={getTeammateIndex(props.sourceKey)}
            content={ColorizeNumbers(contentItem.content)}
            text={contentItem.text}
            set={props.sourceKey.includes('comboCharacterRelicSets')}
            onChange={(value) => updateNumberDefaultSelection(props.sourceKey, contentItem.id, props.partitionIndex, value)}
            value={props.value}
            removeForm={props.partitionIndex > 0}
          />
        }
      </Flex>
      <Button
        type='text' shape='circle' icon={props.partitionIndex == 0 ? <PlusCircleOutlined style={buttonStyle}/> : <MinusCircleOutlined style={buttonStyle}/>}
        onClick={() => {
          if (props.partitionIndex == 0) {
            updateAddPartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
          } else {
            updateDeletePartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
          }
        }}
      />
    </Flex>
  )
}

function BoxArray(props: { activations: boolean[]; actionCount: number; dataKeys: string[]; partition: boolean; unselectable?: boolean }) {
  return (
    <Flex>
      {
        props.activations.map((value, index) => (
          <BoxComponent
            dataKey={props.dataKeys[index]}
            key={index}
            active={value}
            disabled={index >= props.actionCount}
            index={index}
            partition={props.partition}
            unselectable={props.unselectable}
          />
        ))
      }
    </Flex>
  )
}

const BoxComponent = React.memo(
  function Box(props: { active: boolean; index: number; disabled: boolean; dataKey: string; partition: boolean, unselectable?: boolean }) {
    let classnames: string
    if (props.disabled) {
      classnames = 'disabledSelect'
    } else {
      if (props.unselectable) {
        classnames = props.active ? 'unselectable selected defaultShaded' : 'unselectable defaultShaded'
      } else {
        classnames = props.active ? 'selectable selected' : 'selectable'
      }
      if (props.index == 0) {
        classnames += ' defaultShaded'
      }
      if (props.partition && props.active) {
        classnames += ' partitionShaded'
      }
    }

    // console.log('Box')
    return (
      <div
        className={classnames}
        data-key={props.dataKey}
        style={{ width: 75, marginLeft: -1, marginTop: -1 }}
      >
      </div>
    )
  }, (prevProps, nextProps) => {
    return prevProps.dataKey === nextProps.dataKey
      && prevProps.active === nextProps.active
      && prevProps.disabled === nextProps.disabled
      && prevProps.index === nextProps.index
      && prevProps.partition === nextProps.partition
      && prevProps.unselectable === nextProps.unselectable
  },
)
