import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  ConditionalDataType,
  type Sets,
} from 'lib/constants/constants'
import {
  type SetsOrnaments,
  type SetsRelics,
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
import type {
  ComboBooleanConditional,
  ComboConditionalCategory,
  ComboConditionals,
  ComboNumberConditional,
  ComboSelectConditional,
} from 'lib/optimization/combo/comboTypes'
import { resolveSourceKeyRoute } from 'lib/tabs/tabOptimizer/combo/comboDrawerUtils'
import { resolveConditionals, resolveMetadata, useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CharacterConditionalsController,
  ContentItem,
  LightConeConditionalsController,
} from 'types/conditionals'


const columnStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column' }
const groupRowStyle: React.CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', padding: 8, background: 'var(--layer-3)', borderRadius: 6 }

const ConditionalActivationRow = memo(function ConditionalActivationRow({
  contentItem,
  comboConditional,
  actionCount,
  sourceKey,
}: {
  contentItem: ContentItem
  comboConditional: ComboConditionalCategory
  actionCount: number
  sourceKey: string
}) {
  if (contentItem.formItem === 'switch') {
    return (
      <BooleanConditionalActivationRow
        contentItem={contentItem}
        activations={(comboConditional as ComboBooleanConditional).activations}
        actionCount={actionCount}
        sourceKey={sourceKey}
      />
    )
  } else if (contentItem.formItem === 'select') {
    return (
      <SelectConditionalActivationRow
        comboConditional={comboConditional as ComboSelectConditional}
        contentItem={contentItem}
        actionCount={actionCount}
        sourceKey={sourceKey}
      />
    )
  }
  return (
    <NumberConditionalActivationRow
      comboConditional={comboConditional as ComboNumberConditional}
      contentItem={contentItem}
      actionCount={actionCount}
      sourceKey={sourceKey}
    />
  )
})

export function ContentRows({
  contentItems,
  comboConditionals,
  actionCount,
  sourceKey,
}: {
  contentItems: ContentItem[]
  comboConditionals: ComboConditionals
  actionCount: number
  sourceKey: string
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

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
        />
      ))
  }, [comboConditionals, contentItems, actionCount, sourceKey])

  return (
    <div style={columnStyle}>
      {content.length === 0
        ? <div style={{ marginLeft: 5 }}>{t('NoConditionals') /* No conditional passives */}</div>
        : content}
    </div>
  )
}

export const ComboConditionalsGroupRow = memo(function ComboConditionalsGroupRow({
  conditionalType,
  actionCount,
  originKey,
}: {
  conditionalType: string
  actionCount: number
  originKey: string
}) {
  const { t, i18n } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  const { t: setSelectOptionTFunction } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })
  const { t: setConditionalsTFunction } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })

  const metadata = useComboDrawerStore((s) => resolveMetadata(s, originKey))
  const comboConditionals = useComboDrawerStore((s) => resolveConditionals(s, originKey))

  const setContent = useMemo(
    () => generateSetConditionalContent(setSelectOptionTFunction),
    [setSelectOptionTFunction],
  )

  const resolverData = useMemo(() => {
    const route = resolveSourceKeyRoute(originKey)
    if (!route || !metadata) return null

    const isTeammate = route.isTeammate

    let content: ContentItem[]
    let src: string

    if (route.conditionalsKey === 'lightConeConditionals') {
      const lightConeConditionalMetadata: LightConeConditionalsController = LightConeConditionalsResolver.get(metadata, true)

      content = isTeammate
        ? lightConeConditionalMetadata.teammateContent?.() ?? []
        : lightConeConditionalMetadata.content()
      src = Assets.getLightConeIconById(metadata.lightCone)
    } else if (route.conditionalsKey === 'setConditionals') {
      const setName = conditionalType as Sets
      const disabled = !ConditionalSetMetadata[setName].modifiable

      // comboConditionals IS setConditionals for this branch — use it to check category type
      const category: ComboConditionalCategory | undefined = comboConditionals?.[setName]
      if (!category) return null

      if (category.type === ConditionalDataType.BOOLEAN) {
        content = [{
          formItem: 'switch',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: setConditionalsTFunction(setToConditionalKey(setName)),
        }]
      } else if (category.type === ConditionalDataType.NUMBER) {
        content = [{
          formItem: 'slider',
          disabled: disabled,
          id: setName,
          text: t(`${setToId[setName]}.Name`),
          content: setConditionalsTFunction(setToConditionalKey(setName)),
          min: 0,
          max: 10,
        }]
      } else if (category.type === ConditionalDataType.SELECT) {
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
    } else if (route.conditionalsKey === 'relicSetConditionals') {
      const keys = comboConditionals ? Object.keys(comboConditionals) as SetsRelics[] : []
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
      } else {
        return null
      }
    } else if (route.conditionalsKey === 'ornamentSetConditionals') {
      const keys = comboConditionals ? Object.keys(comboConditionals) as SetsOrnaments[] : []
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
      } else {
        return null
      }
    } else {
      // Character conditionals
      const characterConditionalMetadata: CharacterConditionalsController = CharacterConditionalsResolver.get(metadata, true)

      content = isTeammate
        ? characterConditionalMetadata.teammateContent?.() ?? []
        : characterConditionalMetadata.content()
      src = Assets.getCharacterAvatarById(metadata.characterId)
    }

    return {
      content,
      src,
    }
  }, [metadata, originKey, conditionalType, i18n.resolvedLanguage])

  if (!resolverData || !comboConditionals) {
    return null
  }

  return (
    <div style={groupRowStyle}>
      <img src={resolverData.src} style={{ width: 80, height: 80 }} />
      <ContentRows
        contentItems={resolverData.content}
        comboConditionals={comboConditionals}
        actionCount={actionCount}
        sourceKey={originKey}
      />
    </div>
  )
})
