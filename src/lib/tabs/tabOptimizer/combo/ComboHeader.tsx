import { Flex } from '@mantine/core'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  abilityGap,
  abilityWidth,
} from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { ControlledTurnAbilitySelector } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'types/components'

const abilitySelectorStyle = { width: abilityWidth }

function AbilitySelector({ index, value }: {
  index: number,
  value: TurnAbilityName,
}) {
  if (index === 0) return null
  return <ControlledTurnAbilitySelector index={index} value={value} style={abilitySelectorStyle} />
}

export function ComboDrawerTitle() {
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

export const ComboHeader = memo(function ComboHeader() {
  const comboTurnAbilities = useComboDrawerStore((s) => s.comboTurnAbilities)

  if (!comboTurnAbilities?.length) return null

  const length = comboTurnAbilities.length
  const render: ReactElement[] = [
    <div key='controls' style={{ width: 380 }}>
      <ComboDrawerTitle />
    </div>,
    <div key='base' style={{ width: abilityWidth }} />,
    ...Array(Math.min(ABILITY_LIMIT + 1, length + 1))
      .fill(false)
      .map((_, index) => <AbilitySelector key={index} index={index} value={comboTurnAbilities[index]} />),
  ]

  return (
    <Flex gap={abilityGap} align='center'>
      {render}
    </Flex>
  )
})
