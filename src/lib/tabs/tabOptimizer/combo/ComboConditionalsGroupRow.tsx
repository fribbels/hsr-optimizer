import { Flex } from '@mantine/core'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
  setToConditionalKey,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  ConditionalSetMetadata,
  generateSetConditionalContent,
} from 'lib/optimization/rotation/setConditionalContent'
import { Assets } from 'lib/rendering/assets'
import {
  BooleanConditionalActivationRow,
} from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/BooleanConditionalActivationRow'
import {
  NumberConditionalActivationRow,
} from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/NumberConditionalActivationRow'
import {
  SelectConditionalActivationRow,
} from 'lib/tabs/tabOptimizer/combo/ConditionalActivationRows/SelectConditionalActivationRow'
import {
  ComboBooleanConditional,
  ComboCharacter,
  ComboConditionalCategory,
  ComboConditionals,
  ComboNumberConditional,
  ComboSelectConditional,
  ComboState,
  ComboTeammate,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'
import {
  CharacterConditionalsController,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'

function ConditionalActivationRow(props: {
  contentItem: ContentItem
  comboConditional: ComboConditionalCategory
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
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

export function ContentRows(
  props: {
    contentItems: ContentItem[]
    comboConditionals: ComboConditionals
    actionCount: number
    sourceKey: string
    comboState: ComboState
    onComboStateChange: (newState: ComboState) => void
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
  }, [props.comboConditionals, props.contentItems, props.actionCount, props.sourceKey, props.comboState, props.onComboStateChange, i18n.resolvedLanguage])

  return (
    <Flex direction="column">
      {content.length == 0
        ? <div style={{ marginLeft: 5 }}>{t('NoConditionals') /* No conditional passives */}</div>
        : content}
    </Flex>
  )
}

export function ComboConditionalsGroupRow(props: {
  comboOrigin: ComboTeammate | ComboCharacter | null
  conditionalType: string
  actionCount: number
  originKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
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
