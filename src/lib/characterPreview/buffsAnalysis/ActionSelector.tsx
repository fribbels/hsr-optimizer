import { Flex } from '@mantine/core'
import {
  ABILITY_COLORS,
  ACTION_COLORS,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { TEXT_DIM, TEXT_PRIMARY } from 'lib/characterPreview/buffsAnalysis/designContext'
import {
  AbilityKind,
  AbilityMeta,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { RotationStepEntry } from 'lib/simulations/combatBuffsAnalysis'
import { useTranslation } from 'react-i18next'
import classes from './ActionSelector.module.css'

type ActionItem = {
  label: string
  color: string
  isActive: boolean
  onClick: () => void
  index: number
}

export function ActionSelector({ rotationSteps, selectedAction, onActionChange }: {
  rotationSteps: RotationStepEntry[]
  selectedAction: number | null
  onActionChange: (action: number | null) => void
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const { t: tCombo } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter.ComboOptions' })

  if (rotationSteps.length <= 1) return null

  const defaultItem: ActionItem = {
    label: t('DefaultAction'),
    color: ABILITY_COLORS.ALL,
    isActive: selectedAction === null,
    onClick: () => onActionChange(null),
    index: -1,
  }

  const stepItems: ActionItem[] = rotationSteps.map((step, index) => {
    const meta = AbilityMeta[step.actionType as AbilityKind]
    const label = meta?.label ? tCombo(meta.label) : step.actionType

    return {
      label: `${index + 1}. ${label}`,
      color: ACTION_COLORS[step.actionType as AbilityKind] ?? ABILITY_COLORS.ALL,
      isActive: selectedAction === index,
      onClick: () => onActionChange(index),
      index,
    }
  })
  const items = [defaultItem, ...stepItems]

  return (
    <Flex justify='center' align='center' gap={0} wrap='wrap' className={classes.selectorBar}>
      {items.map((item) => (
        <span
          key={item.index}
          onClick={item.onClick}
          className={`${classes.actionItem} ${item.isActive ? classes.actionItemActive : ''}`}
          style={{ color: item.isActive ? TEXT_PRIMARY : TEXT_DIM }}
        >
          {item.label}
        </span>
      ))}
    </Flex>
  )
}
