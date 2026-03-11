import {
  IconCircleMinus,
  IconCirclePlus,
} from '@tabler/icons-react'
import { Button, Divider, Drawer, Flex, MultiSelect } from '@mantine/core'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ABILITY_LIMIT,
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
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
import { useScrollLock } from 'lib/rendering/scrollController'
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
import { setToConditionalKey } from 'lib/sets/setConfigRegistry'
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
  useState,
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

  const [comboState, setComboState] = useState<ComboState>({} as ComboState)
  const comboStateRef = useRef<ComboState>({} as ComboState)
  comboStateRef.current = comboState

  const selectActivationState = useRef(true)
  const lastSelectedKeyState = useRef<string | undefined>(undefined)

  useScrollLock(isOpenComboDrawer)

  useEffect(() => {
    if (isOpenComboDrawer) {
      const form = OptimizerTabController.getForm()
      if (!form?.characterId || !form.characterConditionals) return

      const newComboState = initializeComboState(form, true)
      newComboState.comboTurnAbilities = preprocessTurnAbilityNames(newComboState.comboTurnAbilities)
      setComboState(newComboState)
    } else {
      const current = comboStateRef.current
      if (!current || !current.comboTurnAbilities) return
      current.comboTurnAbilities = preprocessTurnAbilityNames(current.comboTurnAbilities)
      updateFormState(current)
    }
  }, [isOpenComboDrawer])

  return (
    <Drawer
      title={<ComboDrawerTitle />}
      position='right'
      onClose={() => closeComboDrawer()}
      opened={isOpenComboDrawer}
      size={1625}
      className='comboDrawer'
    >
      <div style={{ width: 1560, height: '100%' }}>
        <StateDisplay comboState={comboState} onComboStateChange={setComboState} />
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
              const partitionResult = updatePartitionActivation(selectedKey, comboState)
              if (partitionResult) setComboState(partitionResult)
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
            let newState = {
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
              const partitionResult = updatePartitionActivation(selectedKey, newState)
              if (partitionResult) newState = partitionResult
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
}) {
  if (props.index == 0) return <></>

  return (
    <ControlledTurnAbilitySelector
      index={props.index}
      value={props.comboTurnAbilities[props.index]}
      style={{ width: abilityWidth }}
      comboState={props.comboState}
      onComboStateChange={props.onComboStateChange}
    />
  )
}

const abilityGap = 5
const abilityWidth = 90 - abilityGap

function ComboHeader(props: {
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
      .map((value, index) => (
        <AbilitySelector
          comboTurnAbilities={comboTurnAbilities}
          index={index}
          key={index}
          comboState={props.comboState}
          onComboStateChange={props.onComboStateChange}
        />
      )),
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
    <Divider label={props.text} labelPosition='center' />
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
  const stringOptions = props.options.map((opt) => ({
    value: opt.value,
    label: typeof opt.label === 'string' ? opt.label : opt.value,
  }))

  return (
    <MultiSelect
      comboboxProps={{ styles: { dropdown: { width: 300 } } }}
      maxDropdownHeight={800}
      clearable
      style={{ flex: 1 }}
      data={stringOptions}
      placeholder={props.placeholder}
      value={props.selected ?? []}
      onChange={(val) => {
        props.submit(val)
      }}
    />
  )
}

function SetSelectors(props: {
  comboOrigin: ComboCharacter,
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
          const newState = updateSelectedSets(props.comboState, arr, false)
          if (newState) props.onComboStateChange(newState)
        }}
      />
      <SetSelector
        selected={props.comboOrigin?.displayedOrnamentSets}
        options={ornamentOptions}
        placeholder={t('Ornaments')} // 'Ornament set conditionals'
        submit={(arr) => {
          const newState = updateSelectedSets(props.comboState, arr, true)
          if (newState) props.onComboStateChange(newState)
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )
  })

  return (
    <Flex direction="column" gap={8}>
      {setRender}
    </Flex>
  )
}

function StateDisplay(props: {
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
}) {
  const comboCharacter = props.comboState?.comboCharacter
  const comboTeammate0 = props.comboState?.comboTeammate0
  const comboTeammate1 = props.comboState?.comboTeammate1
  const comboTeammate2 = props.comboState?.comboTeammate2
  const actionCount = props.comboState?.comboTurnAbilities?.length || 0
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  return (
    <Flex direction="column" gap={8}>
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
        <ComboHeader comboState={props.comboState} onComboStateChange={props.onComboStateChange} />
      </Flex>

      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboCharacter'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboCharacterLightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Sets') /* 'Relic / Ornament set conditionals' */} />
      <SetSelectors comboOrigin={comboCharacter} comboState={props.comboState} onComboStateChange={props.onComboStateChange} />
      <SetDisplays
        comboOrigin={comboCharacter}
        conditionalType='relicSets'
        actionCount={actionCount}
        originKey='comboCharacterRelicSets'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate1') /* 'Teammate 1 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate0'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate2') /* 'Teammate 2 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate1'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate3') /* 'Teammate 3 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate2'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2LightCone'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2RelicSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2OrnamentSet'
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    </Flex>
  )
}

function ComboConditionalsGroupRow(props: {
  comboOrigin: ComboTeammate | ComboCharacter | null,
  conditionalType: string,
  actionCount: number,
  originKey: string,
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
}) {
  const { t, i18n } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  const { t: setSelectOptionTFunction } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })
  const { t: setConditionalsTFunction } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })

  const setContent = useMemo(() => {
    return generateSetConditionalContent(setSelectOptionTFunction)
  }, [setSelectOptionTFunction])

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
          content: setConditionalsTFunction(setToConditionalKey(setName)),
        }]
      } else if (category.type == ConditionalDataType.NUMBER) {
        content = [{
          formItem: 'slider',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: setConditionalsTFunction(setToConditionalKey(setName)),
          min: 0,
          max: 10,
        }]
      } else if (category.type == ConditionalDataType.SELECT) {
        content = [{
          formItem: 'select',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: setConditionalsTFunction(setToConditionalKey(setName)),
          options: setContent[setName],
        }]
      } else {
        return null
      }
      src = Assets.getSetImage(setName, undefined, true)
      conditionals = comboCharacter.setConditionals
    } else if (props.originKey.includes('RelicSet')) {
      const keys = Object.keys(comboTeammate.relicSetConditionals) as SetsRelics[]
      if (keys.length) {
        const setName = keys[0]
        content = [
          {
            formItem: 'switch',
            id: setName,
            text: t(`${setToId[setName]}.Name`),
            content: setConditionalsTFunction(setToConditionalKey(setName)),
          },
        ]
        src = Assets.getSetImage(setName, undefined, true)
        conditionals = comboTeammate.relicSetConditionals
      } else {
        return null
      }
    } else if (props.originKey.includes('OrnamentSet')) {
      const keys = Object.keys(comboTeammate.ornamentSetConditionals) as SetsOrnaments[]
      if (keys.length) {
        const setName = keys[0]
        content = [
          {
            formItem: 'switch',
            id: setName,
            text: t(`${setToId[setName]}.Name`),
            content: setConditionalsTFunction(setToConditionalKey(setName)),
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
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
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
    comboState: ComboState,
    onComboStateChange: (newState: ComboState) => void,
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
          comboState={props.comboState}
          onComboStateChange={props.onComboStateChange}
        />
      )
      content.push(display)
    }

    return content
  }, [JSON.stringify(props.comboConditionals), props.actionCount, i18n.resolvedLanguage])

  return (
    <Flex direction="column">
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )
  }
  return (
    <NumberConditionalActivationRow
      comboConditional={props.comboConditional as ComboNumberConditional}
      contentItem={props.contentItem}
      actionCount={props.actionCount}
      sourceKey={props.sourceKey}
      comboState={props.comboState}
      onComboStateChange={props.onComboStateChange}
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
          comboState={props.comboState}
          onComboStateChange={props.onComboStateChange}
        />
      ),
    })
  }

  const sortedDisplays = displaySortWrappers
    .sort((a, b) => a.value - b.value)
    .map((x) => x.display)

  return (
    <Flex
      direction="column"
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />,
    )
  }

  return (
    <Flex
      direction="column"
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
      />
    )
    : (
      <NumberSelect
        contentItem={props.contentItem}
        value={props.partition.value}
        sourceKey={props.sourceKey}
        partitionIndex={props.partitionIndex}
        comboState={props.comboState}
        onComboStateChange={props.onComboStateChange}
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
              onChange={(value) => {
                const newState = updateNumberDefaultSelection(props.comboState, props.sourceKey, contentItem.id, props.partitionIndex, value)
                if (newState) props.onComboStateChange(newState)
              }}
              value={props.value}
              removeForm={props.partitionIndex > 0}
            />

        }
      </Flex>
      <Button
        variant='transparent'
        leftSection={props.partitionIndex == 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          if (props.partitionIndex == 0) {
            const newState = updateAddPartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
          } else {
            const newState = updateDeletePartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
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
  comboState: ComboState,
  onComboStateChange: (newState: ComboState) => void,
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
        onChange={(value) => {
          const newState = updateNumberDefaultSelection(props.comboState, props.sourceKey, contentItem.id, props.partitionIndex, value)
          if (newState) props.onComboStateChange(newState)
        }}
        value={props.value}
        removeForm={props.partitionIndex > 0}
        fullWidth={!props.sourceKey.includes('comboCharacterRelicSets')}
      />
      <Button
        variant='transparent'
        leftSection={props.partitionIndex == 0
          ? <IconCirclePlus style={buttonStyle} />
          : <IconCircleMinus style={buttonStyle} />}
        onClick={() => {
          if (props.partitionIndex == 0) {
            const newState = updateAddPartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
          } else {
            const newState = updateDeletePartition(props.comboState, props.sourceKey, props.contentItem.id, props.partitionIndex)
            if (newState) props.onComboStateChange(newState)
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
