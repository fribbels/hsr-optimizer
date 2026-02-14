import {
  MinusCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
import {
  Button,
  Divider,
  Drawer,
  Flex,
  Select,
} from 'antd'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ABILITY_LIMIT,
  ConditionalDataType,
  Sets,
  setToId,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  ConditionalSetMetadata,
  generateSetConditionalContent,
} from 'lib/optimization/rotation/setConditionalContent'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilityNames } from 'lib/optimization/rotation/turnPreprocessor'
import { Assets } from 'lib/rendering/assets'
import {
  lockScroll,
  unlockScroll,
} from 'lib/rendering/scrollController'
import {
  ComboBooleanConditional,
  ComboCharacter,
  ComboConditionalCategory,
  ComboConditionals,
  ComboNumberConditional,
  ComboSelectConditional,
  ComboState,
  ComboSubNumberConditional,
  ComboTeammate,
  initializeComboState,
  locateActivations,
  updateActivation,
  updateAddPartition,
  updateDeletePartition,
  updateFormState,
  updateNumberDefaultSelection,
  updatePartitionActivation,
  updateSelectedSets,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { FormSliderWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { FormSwitchWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { OrnamentSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentSetTagRenderer'
import GenerateOrnamentsOptions from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { ControlledTurnAbilitySelector } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import React, {
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import Selecto from 'react-selecto'
import { ReactElement } from 'types/components'
import {
  CharacterConditionalsController,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'

const buttonStyle = {
  fontSize: 20,
}

export function ComboDrawer() {
  const { close: closeComboDrawer, isOpen: isOpenComboDrawer } = useOpenClose(OpenCloseIDs.COMBO_DRAWER)

  const formValues = window.store((s) => s.formValues)

  const comboState = window.store((s) => s.comboState)
  const setComboState = window.store((s) => s.setComboState)

  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!comboState || !comboState.comboTurnAbilities) return

    if (isOpenComboDrawer) {
      lockScroll()

      const form = OptimizerTabController.getForm()
      if (!form?.characterId || !form.characterConditionals) return

      const comboState = initializeComboState(form, true)
      comboState.comboTurnAbilities = preprocessTurnAbilityNames(comboState.comboTurnAbilities)
      setComboState(comboState)
    } else {
      unlockScroll()

      comboState.comboTurnAbilities = preprocessTurnAbilityNames(comboState.comboTurnAbilities)
      updateFormState(comboState)
    }
  }, [formValues, isOpenComboDrawer])

  return (
    <Drawer
      title={<ComboDrawerTitle />}
      placement='right'
      onClose={() => closeComboDrawer()}
      open={isOpenComboDrawer}
      width={1625}
      className='comboDrawer'
    >
      <div style={{ width: 1560, height: '100%' }}>
        <StateDisplay comboState={comboState} />
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const selectedKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
            if (selectedKey != lastSelectedKeyState.current) {
              updatePartitionActivation(selectedKey, comboState)
              lastSelectedKeyState.current = selectedKey
            }
          }}
          onDragStart={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const startKey: string = e.inputEvent.target.getAttribute('data-key') ?? '{}'
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

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            const selectedKey: string = e.inputEvent.srcElement.getAttribute('data-key') ?? '{}'
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
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })
  return (
    <div style={{ width: 'fit-content' }}>
      <ColorizedLinkWithIcon
        text={t('Title')}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/advanced-rotations.md'
        linkIcon={true}
      />
    </div>
  )
}

function AbilitySelector(props: {
  comboTurnAbilities: TurnAbilityName[],
  index: number,
}) {
  if (props.index == 0) return <></>

  return (
    <ControlledTurnAbilitySelector
      index={props.index}
      value={props.comboTurnAbilities[props.index]}
      style={{ width: abilityWidth }}
    />
  )
}

const abilityGap = 5
const abilityWidth = 90 - abilityGap

function ComboHeader(props: {
  comboState: ComboState,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter.ComboOptions' })
  const { t: tCommon } = useTranslation('common')
  const comboTurnAbilities = props.comboState.comboTurnAbilities

  if (!comboTurnAbilities) return <></>

  const length = comboTurnAbilities.length
  const render: ReactElement[] = [
    <div key='controls' style={{ width: 380 }}>
    </div>,
    <div key='base' style={{ width: abilityWidth }} />,
    ...Array(Math.min(ABILITY_LIMIT + 1, length + 1))
      .fill(false)
      .map((value, index) => <AbilitySelector comboTurnAbilities={comboTurnAbilities} index={index} key={index} />),
  ]

  return (
    <Flex gap={abilityGap} align='center'>
      {render}
    </Flex>
  )
}

export function elementToDataKey(element: HTMLElement | SVGElement) {
  return element.getAttribute('data-key') ?? '{}' // Get the data-key attribute
}

function GroupDivider(props: {
  text: string,
}) {
  return (
    <Divider plain>
      {props.text}
    </Divider>
  )
}

function SetSelector(props: {
  selected: string[],
  options: {
    value: string,
    label: ReactElement,
  }[],
  placeholder: string,
  submit: (arr: string[]) => void,
}) {
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

function SetSelectors(props: {
  comboOrigin: ComboCharacter,
}) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer.Placeholders' })
  const ornamentOptions = useMemo(() => GenerateOrnamentsOptions(), [i18n.resolvedLanguage])
  const relicSetOptions = useMemo(() => GenerateBasicSetsOptions(), [i18n.resolvedLanguage])
  return (
    <Flex style={{ width: '100%' }} gap={10}>
      <SetSelector
        selected={props.comboOrigin?.displayedRelicSets}
        options={relicSetOptions}
        placeholder={t('Sets')} // 'Relic set conditionals'
        submit={(arr) => {
          updateSelectedSets(arr, false)
        }}
      />
      <SetSelector
        selected={props.comboOrigin?.displayedOrnamentSets}
        options={ornamentOptions}
        placeholder={t('Ornaments')} // 'Ornament set conditionals'
        submit={(arr) => {
          updateSelectedSets(arr, true)
        }}
      />
    </Flex>
  )
}

function SetDisplays(props: {
  comboOrigin: ComboCharacter,
  conditionalType: string,
  actionCount: number,
  originKey: string,
}) {
  const relicSets = props.comboOrigin?.displayedRelicSets || []
  const ornamentSets = props.comboOrigin?.displayedOrnamentSets || []
  const setRender = [...relicSets, ...ornamentSets].map((setName) => {
    return (
      <ComboConditionalsGroupRow
        key={setName}
        comboOrigin={props.comboOrigin}
        conditionalType={setName}
        actionCount={props.actionCount}
        originKey={props.originKey}
      />
    )
  })

  return (
    <Flex vertical gap={8}>
      {setRender}
    </Flex>
  )
}

function StateDisplay(props: {
  comboState: ComboState,
}) {
  const comboCharacter = props.comboState?.comboCharacter
  const comboTeammate0 = props.comboState?.comboTeammate0
  const comboTeammate1 = props.comboState?.comboTeammate1
  const comboTeammate2 = props.comboState?.comboTeammate2
  const actionCount = props.comboState?.comboTurnAbilities?.length || 0
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  return (
    <Flex vertical gap={8}>
      <Flex
        style={{
          position: 'sticky',
          backgroundColor: '#2A3C64',
          top: 0,
          zIndex: 10,
          paddingTop: 6,
          paddingBottom: 6,
        }}
        align='center'
      >
        <ComboHeader comboState={props.comboState} />
      </Flex>

      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboCharacter'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboCharacterLightCone'
      />
      <GroupDivider text={t('GroupHeaders.Sets') /* 'Relic / Ornament set conditionals' */} />
      <SetSelectors comboOrigin={comboCharacter} />
      <SetDisplays
        comboOrigin={comboCharacter}
        conditionalType='relicSets'
        actionCount={actionCount}
        originKey='comboCharacterRelicSets'
      />
      <GroupDivider text={t('GroupHeaders.Teammate1') /* 'Teammate 1 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate0'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0LightCone'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0RelicSet'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0OrnamentSet'
      />
      <GroupDivider text={t('GroupHeaders.Teammate2') /* 'Teammate 2 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate1'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1LightCone'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1RelicSet'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1OrnamentSet'
      />
      <GroupDivider text={t('GroupHeaders.Teammate3') /* 'Teammate 3 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate2'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2LightCone'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2RelicSet'
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2OrnamentSet'
      />
    </Flex>
  )
}

function ComboConditionalsGroupRow(props: {
  comboOrigin: ComboTeammate | ComboCharacter | null,
  conditionalType: string,
  actionCount: number,
  originKey: string,
}) {
  const { t, i18n } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  const { t: SetConditionalTFunction } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })

  const setContent = useMemo(() => {
    return generateSetConditionalContent(SetConditionalTFunction)
  }, [SetConditionalTFunction])

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
      const lightConeConditionalMetadata: LightConeConditionalsController = LightConeConditionalsResolver.get(metadata, true)

      content = isTeammate
        ? lightConeConditionalMetadata.teammateContent?.() ?? []
        : lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
      conditionals = comboCharacter.lightConeConditionals
    } else if (props.originKey.includes('comboCharacterRelicSets')) {
      const setName = props.conditionalType as Sets
      const disabled = !ConditionalSetMetadata[setName].modifiable

      const category: ComboConditionalCategory = comboCharacter.setConditionals[setName]
      if (category.type == ConditionalDataType.BOOLEAN) {
        content = [{
          formItem: 'switch',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: t(`${setToId[setName]}.Name`),
        }]
      } else if (category.type == ConditionalDataType.NUMBER) {
        content = [{
          formItem: 'slider',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: t(`${setToId[setName]}.Name`),
          min: 0,
          max: 10,
        }]
      } else if (category.type == ConditionalDataType.SELECT) {
        content = [{
          formItem: 'select',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: t(`${setToId[setName]}.Name`),
          options: setContent[setName],
        }]
      } else {
        return null
      }
      src = Assets.getSetImage(setName, undefined, true)
      conditionals = comboCharacter.setConditionals
    } else if (props.originKey.includes('RelicSet')) {
      const keys = Object.keys(comboTeammate.relicSetConditionals)
      if (keys.length) {
        const setName = keys[0]
        content = [
          {
            formItem: 'switch',
            id: setName,
            text: setName,
            content: setName,
          },
        ]
        src = Assets.getSetImage(setName, undefined, true)
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
            text: setName,
            content: setName,
          },
        ]
        src = Assets.getSetImage(setName, undefined, true)
        conditionals = comboTeammate.ornamentSetConditionals
      } else {
        return null
      }
    } else {
      // Character
      const characterConditionalMetadata: CharacterConditionalsController = CharacterConditionalsResolver.get(metadata, true)

      content = isTeammate
        ? characterConditionalMetadata.teammateContent?.() ?? []
        : characterConditionalMetadata.content()
      src = Assets.getCharacterAvatarById(metadata.characterId)
      conditionals = comboCharacter.characterConditionals
    }

    return {
      content,
      src,
      conditionals,
    }
  }, [props.comboOrigin, i18n.resolvedLanguage])

  if (!renderData) {
    return <></>
  }

  return (
    <Flex gap={10} align='center' style={{ padding: 8, background: '#677dbd1c', borderRadius: 5 }}>
      <img src={renderData.src} style={{ width: 80, height: 80 }} />
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
    contentItems: ContentItem[],
    comboConditionals: ComboConditionals,
    actionCount: number,
    sourceKey: string,
  },
) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })
  const content = useMemo(() => {
    const content: ReactElement[] = []
    for (const contentItem of props.contentItems) {
      const comboConditional = props.comboConditionals[contentItem.id]
      if (comboConditional == null) continue

      const display = (
        <ConditionalActivationRow
          key={contentItem.id}
          contentItem={contentItem}
          comboConditional={comboConditional}
          actionCount={props.actionCount}
          sourceKey={props.sourceKey}
        />
      )
      content.push(display)
    }

    return content
  }, [JSON.stringify(props.comboConditionals), props.actionCount, i18n.resolvedLanguage])

  return (
    <Flex vertical>
      {content.length == 0
        ? <div style={{ marginLeft: 5 }}>{t('NoConditionals') /* No conditional passives */}</div>
        : content}
    </Flex>
  )
}

function ConditionalActivationRow(props: {
  contentItem: ContentItem,
  comboConditional: ComboConditionalCategory,
  actionCount: number,
  sourceKey: string,
}) {
  if (props.contentItem.formItem == 'switch') {
    return (
      <BooleanConditionalActivationRow
        contentItem={props.contentItem}
        activations={(props.comboConditional as ComboBooleanConditional).activations}
        actionCount={props.actionCount}
        sourceKey={props.sourceKey}
      />
    )
  } else if (props.contentItem.formItem == 'select') {
    return (
      <SelectConditionalActivationRow
        comboConditional={props.comboConditional as ComboSelectConditional}
        contentItem={props.contentItem}
        actionCount={props.actionCount}
        sourceKey={props.sourceKey}
      />
    )
  }
  return (
    <NumberConditionalActivationRow
      comboConditional={props.comboConditional as ComboNumberConditional}
      contentItem={props.contentItem}
      actionCount={props.actionCount}
      sourceKey={props.sourceKey}
    />
  )
}

function BooleanConditionalActivationRow(props: {
  contentItem: ContentItem,
  activations: boolean[],
  actionCount: number,
  sourceKey: string,
}) {
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
      <BooleanSwitch contentItem={props.contentItem} sourceKey={props.sourceKey} value={props.activations[0]} />
      <BoxArray
        activations={props.activations}
        actionCount={props.actionCount}
        dataKeys={dataKeys}
        partition={false}
        unselectable={props.contentItem.disabled}
      />
    </Flex>
  )
}

function NumberConditionalActivationRow(props: {
  comboConditional: ComboNumberConditional,
  contentItem: ContentItem,
  actionCount: number,
  sourceKey: string,
}) {
  const numberComboConditional = props.comboConditional
  const displaySortWrappers: {
    display: ReactElement,
    value: number,
  }[] = []

  for (let i = 0; i < numberComboConditional.partitions.length; i++) {
    const x = numberComboConditional.partitions[i]

    displaySortWrappers.push({
      value: x.value,
      display: (
        <Partition
          key={i}
          partition={x}
          contentItem={props.contentItem}
          activations={x.activations}
          partitionIndex={i}
          actionCount={props.actionCount}
          sourceKey={props.sourceKey}
        />
      ),
    })
  }

  const sortedDisplays = displaySortWrappers
    .sort((a, b) => a.value - b.value)
    .map((x) => x.display)

  return (
    <Flex
      vertical
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {sortedDisplays}
      <PartitionDivider bottom />
    </Flex>
  )
}

function PartitionDivider(props: { bottom?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: props.bottom ? undefined : -1,
        bottom: props.bottom ? 0 : undefined,
        left: 0,
        right: 0,
        borderTop: '1px solid #7999c8',
        pointerEvents: 'none',
      }}
    />
  )
}

function SelectConditionalActivationRow(props: {
  comboConditional: ComboSelectConditional,
  contentItem: ContentItem,
  actionCount: number,
  sourceKey: string,
}) {
  const selectComboConditional = props.comboConditional
  const display: ReactElement[] = []

  for (let i = 0; i < selectComboConditional.partitions.length; i++) {
    const x = selectComboConditional.partitions[i]
    display.push(
      <Partition
        key={i}
        partition={x}
        contentItem={props.contentItem}
        activations={x.activations}
        partitionIndex={i}
        actionCount={props.actionCount}
        sourceKey={props.sourceKey}
      />,
    )
  }

  return (
    <Flex
      vertical
      style={{ position: 'relative' }}
    >
      <PartitionDivider />
      {display}
      <PartitionDivider bottom />
    </Flex>
  )
}

function Partition(props: {
  partition: ComboSubNumberConditional,
  contentItem: ContentItem,
  activations: boolean[],
  partitionIndex: number,
  actionCount: number,
  sourceKey: string,
}) {
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
    ? (
      <NumberSlider
        contentItem={props.contentItem}
        value={props.partition.value}
        sourceKey={props.sourceKey}
        partitionIndex={props.partitionIndex}
      />
    )
    : (
      <NumberSelect
        contentItem={props.contentItem}
        value={props.partition.value}
        sourceKey={props.sourceKey}
        partitionIndex={props.partitionIndex}
      />
    )

  return (
    <Flex key={props.partitionIndex} style={{ height: 45 }}>
      {render}
      <BoxArray
        activations={props.activations}
        actionCount={props.actionCount}
        dataKeys={dataKeys}
        partition={true}
      />
    </Flex>
  )
}

function BooleanSwitch(props: {
  contentItem: ContentItem,
  sourceKey: string,
  value: boolean,
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore


            <FormSwitchWithPopover
              {...contentItem}
              title={contentItem.text}
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

function NumberSlider(props: {
  contentItem: ContentItem,
  value: number,
  sourceKey: string,
  partitionIndex: number,
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={0}>
      <Flex style={{ width: 210 }} align='center'>
        {
          // @ts-ignore


            <FormSliderWithPopover
              key={props.value + props.partitionIndex}
              {...contentItem}
              title={contentItem.text}
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
        type='text'
        shape='circle'
        icon={props.partitionIndex == 0
          ? <PlusCircleOutlined style={buttonStyle} />
          : <MinusCircleOutlined style={buttonStyle} />}
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

function NumberSelect(props: {
  contentItem: ContentItem,
  value: number,
  sourceKey: string,
  partitionIndex: number,
}) {
  const contentItem = props.contentItem

  return (
    <Flex style={{ width: 275, marginRight: 10 }} align='center' gap={5}>
      <FormSelectWithPopover
        {...contentItem}
        title={contentItem.text}
        teammateIndex={getTeammateIndex(props.sourceKey)}
        content={ColorizeNumbers(contentItem.content)}
        text={contentItem.text}
        set={props.sourceKey.includes('comboCharacterRelicSets')}
        onChange={(value) => updateNumberDefaultSelection(props.sourceKey, contentItem.id, props.partitionIndex, value)}
        value={props.value}
        removeForm={props.partitionIndex > 0}
        fullWidth={!props.sourceKey.includes('comboCharacterRelicSets')}
      />
      <Button
        type='text'
        shape='circle'
        icon={props.partitionIndex == 0
          ? <PlusCircleOutlined style={buttonStyle} />
          : <MinusCircleOutlined style={buttonStyle} />}
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

function BoxArray(props: {
  activations: boolean[],
  actionCount: number,
  dataKeys: string[],
  partition: boolean,
  unselectable?: boolean,
}) {
  return (
    <Flex>
      {props.activations.map((value, index) => (
        <BoxComponent
          dataKey={props.dataKeys[index]}
          key={index}
          active={value}
          disabled={index >= props.actionCount}
          index={index}
          partition={props.partition}
          unselectable={props.unselectable}
        />
      ))}
    </Flex>
  )
}

const BoxComponent = React.memo(
  function Box(props: {
    active: boolean,
    index: number,
    disabled: boolean,
    dataKey: string,
    partition: boolean,
    unselectable?: boolean,
  }) {
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
        style={{ width: 90 - 1, marginLeft: -1, marginTop: -1 }}
      >
      </div>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.dataKey === nextProps.dataKey
      && prevProps.active === nextProps.active
      && prevProps.disabled === nextProps.disabled
      && prevProps.index === nextProps.index
      && prevProps.partition === nextProps.partition
      && prevProps.unselectable === nextProps.unselectable
  },
)
