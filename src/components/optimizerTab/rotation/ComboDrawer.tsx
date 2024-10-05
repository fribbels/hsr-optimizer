import { Button, Drawer, Flex } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import Selecto from 'react-selecto'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { ComboBooleanConditional, ComboCharacter, ComboConditionalCategory, ComboConditionals, ComboDisplayState, ComboNumberConditional, ComboState, ComboSubNumberConditional, ComboTeammate, initializeComboState, updateActivation } from 'lib/optimizer/rotation/rotationGenerator'
import { CharacterConditional } from 'types/CharacterConditional'
import { CharacterConditionals } from 'lib/characterConditionals'
import { Assets } from 'lib/assets'
import { LightConeConditional } from 'types/LightConeConditionals'
import { LightConeConditionals } from 'lib/lightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ReactElement } from 'types/Components'
import { FormSwitchWithPopover } from 'components/optimizerTab/conditionals/FormSwitch'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { MinusCircleOutlined } from '@ant-design/icons'
import { FormSliderWithPopover } from 'components/optimizerTab/conditionals/FormSlider'

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
  const [state, setState] = useState<ComboState>({
    display: <></>,
    displayState: {} as ComboDisplayState,
  })

  useEffect(() => {
    if (comboDrawerOpen) {
      if (!formValues?.characterId || !formValues.characterConditionals) return
      const form = OptimizerTabController.getForm()
      console.debug('form', form)
      console.debug('combo', formValues.combo)

      const comboState = initializeComboState(formValues)
      setState(comboState)
    }
  }, [formValues])

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
        <StateDisplay displayState={state.displayState}/>
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
          onDrag={() => {
            // console.log('onDrag')
          }}
          onSelect={(e) => {
            // console.log('onSelect')
            // if (e.added.length) console.log('added', e.added)
            // if (e.removed.length) console.log('removed', e.removed)

            // console.log(e)
            // e.added.forEach((el) => {
            //   el.classList.add('selected')
            // })
            // e.removed.forEach((el) => {
            //   el.classList.remove('selected')
            // })

            const newState = {
              ...state,
            }

            e.added.forEach((el) => {
              const dataKey = el.getAttribute('data-key') ?? '{}' // Get the data-key attribute
              // console.log('Added Element Data Key:', dataKey)
              updateActivation(dataKey, true, newState)
            })
            e.removed.forEach((el) => {
              const dataKey = el.getAttribute('data-key') ?? '{}' // Get the data-key attribute
              // console.log('Removed Element Data Key:', dataKey)
              updateActivation(dataKey, false, newState)
            })

            // Debug
            // for (let i = 0; i < 4; i++) {
            //   state.displayState.comboCharacter.characterConditionals['e1CdBuff'].activations[i] = Math.random() > 0.5 ? true : false
            // }
            // newState.display = convertDisplayStateToDisplay(newState.displayState, 6)

            setState(newState)
          }}
        />
      </div>
    </Drawer>
  )
}

function StateDisplay(props: { displayState: ComboDisplayState }) {
  return (
    <Flex vertical gap={8}>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboCharacter} conditionalType='character' originKey='comboCharacter'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboCharacter} conditionalType='lightCone' originKey='comboCharacterLightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='character' originKey='comboTeammate0'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate0} conditionalType='lightCone' originKey='comboTeammate0LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='character' originKey='comboTeammate1'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate1} conditionalType='lightCone' originKey='comboTeammate1LightCone'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='character' originKey='comboTeammate2'/>
      <ComboConditionalsGroupRow comboOrigin={props.displayState?.comboTeammate2} conditionalType='lightCone' originKey='comboTeammate2LightCone'/>
    </Flex>
  )
}

function ComboConditionalsGroupRow(props: { comboOrigin: ComboTeammate | ComboCharacter, conditionalType: string, originKey: string }) {
  let renderData = useMemo(() => {
    if (!props.comboOrigin) {
      return null
    }

    let content
    let src
    let conditionals

    if (props.originKey.includes('LightCone')) {
      const comboCharacter = props.comboOrigin as ComboCharacter
      const metadata = comboCharacter.metadata
      const lightConeConditionalMetadata: LightConeConditional = LightConeConditionals.get(metadata)

      content = lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
      conditionals = comboCharacter.lightConeConditionals
    } else {
      const comboCharacter = props.comboOrigin as ComboCharacter
      const metadata = comboCharacter.metadata
      const characterConditionalMetadata: CharacterConditional = CharacterConditionals.get(metadata)

      content = characterConditionalMetadata.content()
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
    <Flex>
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
      <NumberSlider contentItem={props.contentItem} value={props.partition.value}/>
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
      <Button type='text' shape='circle' icon={<MinusCircleOutlined/>} style={{ visibility: 'hidden' }}/>
    </Flex>
  )
}

function NumberSlider(props: { contentItem: ContentItem, value: number }) {
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
      <Button type='text' shape='circle' icon={<MinusCircleOutlined/>}/>
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

