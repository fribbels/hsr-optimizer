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
import {
  CharacterConditionalsController,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'

function ConditionalActivationRow({
  contentItem,
  comboConditional,
  actionCount,
  sourceKey,
  comboState,
  onComboStateChange,
}: {
  contentItem: ContentItem
  comboConditional: ComboConditionalCategory
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  if (contentItem.formItem == 'switch') {
    return (
      <BooleanConditionalActivationRow
        contentItem={contentItem}
        activations={(comboConditional as ComboBooleanConditional).activations}
        actionCount={actionCount}
        sourceKey={sourceKey}
      />
    )
  } else if (contentItem.formItem == 'select') {
    return (
      <SelectConditionalActivationRow
        comboConditional={comboConditional as ComboSelectConditional}
        contentItem={contentItem}
        actionCount={actionCount}
        sourceKey={sourceKey}
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
    )
  }
  return (
    <NumberConditionalActivationRow
      comboConditional={comboConditional as ComboNumberConditional}
      contentItem={contentItem}
      actionCount={actionCount}
      sourceKey={sourceKey}
      comboState={comboState}
      onComboStateChange={onComboStateChange}
    />
  )
}

function ContentRows({
  contentItems,
  comboConditionals,
  actionCount,
  sourceKey,
  comboState,
  onComboStateChange,
}: {
  contentItems: ContentItem[]
  comboConditionals: ComboConditionals
  actionCount: number
  sourceKey: string
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  const content = useMemo(() => {
    return contentItems
      .filter((item) => comboConditionals[item.id] != null)
      .map((item) => (
        <ConditionalActivationRow
          key={item.id}
          contentItem={item}
          comboConditional={comboConditionals[item.id]}
          actionCount={actionCount}
          sourceKey={sourceKey}
          comboState={comboState}
          onComboStateChange={onComboStateChange}
        />
      ))
  }, [comboConditionals, contentItems, actionCount, sourceKey, comboState, onComboStateChange, i18n.resolvedLanguage])

  return (
    <Flex direction="column">
      {content.length == 0
        ? <div style={{ marginLeft: 5 }}>{t('NoConditionals') /* No conditional passives */}</div>
        : content}
    </Flex>
  )
}

export function ComboConditionalsGroupRow({
  comboOrigin,
  conditionalType,
  actionCount,
  originKey,
  comboState,
  onComboStateChange,
}: {
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
    if (!comboOrigin) {
      return null
    }

    let content: ContentItem[]
    let src: string
    let conditionals: ComboConditionals

    const isTeammate = originKey.includes('Teammate')
    const comboCharacter = comboOrigin as ComboCharacter
    const comboTeammate = comboOrigin as ComboTeammate
    const metadata = comboCharacter.metadata

    if (originKey.includes('LightCone')) {
      const lightConeConditionalMetadata: LightConeConditionalsController = LightConeConditionalsResolver.get(metadata, true)

      content = isTeammate
        ? lightConeConditionalMetadata.teammateContent?.() ?? []
        : lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
      conditionals = comboCharacter.lightConeConditionals
    } else if (originKey.includes('comboCharacterRelicSets')) {
      const setName = conditionalType as Sets
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
    } else if (originKey.includes('RelicSet')) {
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
    } else if (originKey.includes('OrnamentSet')) {
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
  }, [comboOrigin, i18n.resolvedLanguage])

  if (!renderData) {
    return null
  }

  return (
    <Flex gap={10} align='center' style={{ padding: 8, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 5 }}>
      <img src={renderData.src} style={{ width: 80, height: 80 }} />
      <ContentRows
        contentItems={renderData.content}
        comboConditionals={renderData.conditionals}
        actionCount={actionCount}
        sourceKey={originKey}
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
    </Flex>
  )
}
