import { Flex } from 'antd'
import {
  ABILITY_COLORS,
  ACTION_COLORS,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import {
  AbilityKind,
  AbilityMeta,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { RotationStepEntry } from 'lib/simulations/combatBuffsAnalysis'
import React from 'react'
import { useTranslation } from 'react-i18next'

type ActionItem = {
  label: string,
  color: string,
  isActive: boolean,
  onClick: () => void,
  index: number,
}

export function ActionSelector(props: {
  rotationSteps: RotationStepEntry[],
  selectedAction: number | null,
  onActionChange: (action: number | null) => void,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const { t: tCombo } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter.ComboOptions' })

  if (props.rotationSteps.length <= 1) return null

  const defaultItem: ActionItem = {
    label: t('DefaultAction'),
    color: ABILITY_COLORS.ALL,
    isActive: props.selectedAction === null,
    onClick: () => props.onActionChange(null),
    index: -1,
  }

  const stepItems: ActionItem[] = props.rotationSteps.map((step, index) => {
    const meta = AbilityMeta[step.actionType as AbilityKind]
    const label = meta?.label ? tCombo(meta.label) : step.actionType

    return {
      label: `${index + 1}. ${label}`,
      color: ACTION_COLORS[step.actionType as AbilityKind] ?? ABILITY_COLORS.ALL,
      isActive: props.selectedAction === index,
      onClick: () => props.onActionChange(index),
      index,
    }
  })
  const items = [defaultItem, ...stepItems]

  return (
    <Flex align='center' gap={0} wrap='wrap' style={{ borderBottom: '1px solid #ffffff15' }}>
      {items.map((item) => (
        <span
          key={item.index}
          onClick={item.onClick}
          style={{
            padding: '4px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            color: item.isActive ? '#ffffffd9' : '#ffffff59',
            borderBottom: item.isActive ? '2px solid #3f5a96' : '2px solid transparent',
            userSelect: 'none',
            transition: 'color 0.15s, border-color 0.15s',
            marginBottom: -1,
          }}
        >
          {item.label}
        </span>
      ))}
    </Flex>
  )
}
