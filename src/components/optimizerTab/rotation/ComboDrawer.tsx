import { Button, Drawer, Flex, Select } from 'antd'
import React, { useEffect, useMemo, useRef } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { ComboBooleanConditional, ComboCharacter, ComboConditionalCategory, ComboConditionals, ComboDisplayState, ComboNumberConditional, ComboSubNumberConditional, ComboTeammate, ConditionalType, initializeComboState, locateActivations, updateActivation, updateAddPartition, updateDeletePartition, updatePartitionActivation, updateSelectedSets } from 'lib/optimizer/rotation/rotationGenerator'
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

export function SelectableBox(props: { active: boolean; dataKey: string }) {
  const classnames = props.active ? 'selectable selected' : 'selectable'
  console.log('SelectableBox')
  return (
    <div
      className={classnames}
      data-key={props.dataKey}
      style={{ width: 75, marginLeft: -1, marginTop: -1 }}
    >
    </div>
  )
}

export function ComboDrawer() {
  const comboDrawerOpen = window.store((s) => s.comboDrawerOpen)
  const setComboDrawerOpen = window.store((s) => s.setComboDrawerOpen)
  const formValues = window.store((s) => s.formValues)
  const setFormValues = window.store((s) => s.setFormValues)

  const comboState = window.store((s) => s.comboState)
  const setComboState = window.store((s) => s.setComboState)

  const selectActivationState = useRef(true);
  const lastSelectedKeyState = useRef(undefined);

  useEffect(() => {
    if (comboDrawerOpen) {
      if (!formValues?.characterId || !formValues.characterConditionals) return
      const form = OptimizerTabController.getForm()
      console.debug('form', form)
      console.debug('combo', formValues.combo)

      const comboState = initializeComboState(formValues)
      setComboState(comboState)
    }
  }, [formValues, comboDrawerOpen])

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
        <StateDisplay displayState={comboState.displayState}/>
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

            console.log(located)

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

export function elementToDataKey(element: HTMLElement | SVGElement) {
  return element.getAttribute('data-key') ?? '{}' // Get the data-key attribute
}

function GroupDivider() {
  return (
    <div style={{ width: '100%', height: 10 }}>

    </div>
  )
}

function SetSelector(props: { selected: string[], options: { value: string; label: ReactElement }[], placeholder: string, submit: (arr: string[]) => void }) {
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
      placement='bottomRight'
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

function SetDisplays(props: { comboOrigin: ComboCharacter, conditionalType: string, originKey: string }) {
  const relicSets = props.comboOrigin?.displayedRelicSets || []
  const setRender = relicSets.map(setName => {
    return (
      <ComboConditionalsGroupRow key={setName} comboOrigin={props.comboOrigin} conditionalType={setName} originKey={props.originKey}/>
    )
  })

  return (
    <Flex vertical gap={8}>
      {setRender}
    </Flex>
  )
}

function StateDisplay(props: { displayState: ComboDisplayState }) {
  return (
    <Flex vertical gap={8}>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboCharacter} conditionalType='character' originKey='comboCharacter'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboCharacter} conditionalType='lightCone' originKey='comboCharacterLightCone'/>
      <SetDisplays comboOrigin={props.displayState?.comboCharacter} conditionalType='relicSets' originKey='comboCharacterRelicSets'/>
      {/*<ComboConditionalsGroupRow comboOrigin={props.displayState?.comboCharacter} conditionalType='relicSets' originKey='comboCharacterRelicSets'/>*/}
      <GroupDivider/>
      <SetSelectors comboOrigin={props.displayState?.comboCharacter}/>
      <GroupDivider/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='character' originKey='comboTeammate0'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='lightCone' originKey='comboTeammate0LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='lightCone' originKey='comboTeammate0RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='lightCone' originKey='comboTeammate0OrnamentSet'/>
      <GroupDivider/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='character' originKey='comboTeammate1'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='lightCone' originKey='comboTeammate1LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='lightCone' originKey='comboTeammate1RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='lightCone' originKey='comboTeammate1OrnamentSet'/>
      <GroupDivider/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='character' originKey='comboTeammate2'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='lightCone' originKey='comboTeammate2LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='lightCone' originKey='comboTeammate2RelicSet'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='lightCone' originKey='comboTeammate2OrnamentSet'/>
    </Flex>
  )
}

function ComboConditionalsGroupRow(props: { comboOrigin: ComboTeammate | ComboCharacter, conditionalType: string, originKey: string }) {
  let renderData = useMemo(() => {
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
      const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(metadata)

      content = isTeammate ? lightConeConditionalMetadata.teammateContent?.() ?? [] : lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
      conditionals = comboCharacter.lightConeConditionals
    } else if (props.originKey.includes('comboCharacterRelicSets')) {
      const setName = props.conditionalType
      // const displayedKeys = comboCharacter.displayedRelicSets
      // const keys = Object.keys(comboCharacter.setConditionals).filter(x => displayedKeys.includes(x))

      const category: ComboConditionalCategory = comboCharacter.setConditionals[setName]
      if (category.type == ConditionalType.BOOLEAN) {
        content = [{
          formItem: 'switch',
          id: setName,
          name: setName,
          text: setName,
          title: setName,
          content: setName,
        }]
      } else if (category.type == ConditionalType.NUMBER) {
        content = [{
          formItem: 'slider',
          id: setName,
          name: setName,
          text: setName,
          title: setName,
          content: setName,
          min: 0,
          max: 10
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
          }
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
          }
        ]
        src = Assets.getSetImage(setName, null, true)
        conditionals = comboTeammate.ornamentSetConditionals
      } else {
        return null
      }
    } else {
      // Character
      const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(metadata)

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
        actionCount={6}
        sourceKey={props.originKey}
      />
    </Flex>
  )
}

export function ContentRows(
  props: {
    contentItems: ContentItem[],
    comboConditionals: ComboConditionals,
    actionCount: number,
    sourceKey: string,
  }
) {
  const content = useMemo(() => {
    const content: ReactElement[] = []
    for (const contentItem of props.contentItems) {
      const comboConditional = props.comboConditionals[contentItem.id]
      if (comboConditional == null) continue

      const display = (
        <ConditionalActivationRow key={contentItem.id} contentItem={contentItem} comboConditional={comboConditional} sourceKey={props.sourceKey}/>
      )
      content.push(display)
    }

    return content
  }, [JSON.stringify(props.comboConditionals)])

  return (
    <Flex vertical>
      {content}
    </Flex>
  )
}

function ConditionalActivationRow(props: { contentItem: ContentItem, comboConditional: ComboConditionalCategory, sourceKey: string }) {
  if (props.contentItem.formItem == 'switch') {
    return (
      <BooleanConditionalActivationRow contentItem={props.contentItem} activations={(props.comboConditional as ComboBooleanConditional).activations} sourceKey={props.sourceKey}/>
    )
  }
  return (
    <NumberConditionalActivationRow comboConditional={(props.comboConditional as ComboNumberConditional)} contentItem={props.contentItem} sourceKey={props.sourceKey}/>
  )
}

function BooleanConditionalActivationRow(props: { contentItem: ContentItem, activations: boolean[], sourceKey: string }) {
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
      <BooleanSwitch contentItem={props.contentItem} value={props.activations[0]}/>
      <BoxArray activations={props.activations} dataKeys={dataKeys}/>
    </Flex>
  )
}

function NumberConditionalActivationRow(props: { comboConditional: ComboNumberConditional, contentItem: ContentItem, sourceKey: string }) {
  const numberComboConditional = props.comboConditional
  const rows = numberComboConditional.partitions.length
  const display: ReactElement[] = []

  for (let i = 0; i < numberComboConditional.partitions.length; i++) {
    const x = numberComboConditional.partitions[i]
    display.push(
      <Partition key={i} partition={x} contentItem={props.contentItem} activations={x.activations} partitionIndex={i} sourceKey={props.sourceKey}/>
    )
  }

  return (
    <Flex vertical>
      {display}
    </Flex>
  )
}

function Partition(props: { partition: ComboSubNumberConditional, contentItem: ContentItem, activations: boolean[], partitionIndex: number, sourceKey: string }) {
  const dataKeys: string[] = []

  for (let i = 0; i < props.activations.length; i++) {
    dataKeys.push(JSON.stringify({
      id: props.contentItem.id,
      source: props.sourceKey,
      partitionIndex: props.partitionIndex,
      index: i,
    }))
  }


  return (
    <Flex key={props.partitionIndex} style={{ height: 45 }}>
      <NumberSlider contentItem={props.contentItem} value={props.partition.value} sourceKey={props.sourceKey} partitionIndex={props.partitionIndex}/>
      <BoxArray activations={props.activations} dataKeys={dataKeys}/>
    </Flex>
  )
}

function BooleanSwitch(props: { contentItem: ContentItem, value: boolean }) {
  const contentItem = props.contentItem
  return (
    <Flex style={{ width: 250, marginRight: 10 }} align='center' gap={0}>
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
            value={props.value}
          />
        }
      </Flex>
      {/*<Button type='text' shape='circle' icon={<PlusCircleOutlined/>} style={{ visibility: 'hidden' }}/>*/}
    </Flex>
  )
}

function NumberSlider(props: { contentItem: ContentItem, value: number, sourceKey: string, partitionIndex: number }) {
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
            text={contentItem.text}
            onChange={(x) => console.log(x)}
            value={props.value}
            removeForm={true}
          />
        }
      </Flex>
      <Button type='text' shape='circle' icon={props.partitionIndex == 0 ? <PlusCircleOutlined/> : <MinusCircleOutlined/>} onClick={() => {
        if (props.partitionIndex == 0) {
          updateAddPartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
        } else {
          updateDeletePartition(props.sourceKey, props.contentItem.id, props.partitionIndex)
        }
      }}/>
    </Flex>
  )
}

function BoxArray(props: { activations: boolean[], dataKeys: string[] }) {
  return (
    <Flex>
      {
        props.activations.map((value, index) => (
          <BoxComponent
            dataKey={props.dataKeys[index]}
            key={index}
            active={value}
          />
        ))
      }
    </Flex>
  )
}

const BoxComponent = React.memo(function Box(props: { active: boolean, dataKey: string }) {
  const classnames = props.active ? 'selectable selected' : 'selectable'
  console.log('Box')
  return (
    <div
      className={classnames}
      data-key={props.dataKey}
      style={{ width: 75, marginLeft: -1, marginTop: -1 }}
    >
    </div>
  )
}, (prevProps, nextProps) => {
  // Prevent re-render if both `dataKey` and `active` props are unchanged
  return prevProps.dataKey === nextProps.dataKey && prevProps.active === nextProps.active;
});

