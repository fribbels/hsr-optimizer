import { Flex } from '@mantine/core'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { abilityGap, abilityWidth } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import type { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ControlledTurnAbilitySelector } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { useTranslation } from 'react-i18next'
import type { ReactElement } from 'types/components'

function AbilitySelector({ comboTurnAbilities, index, comboState, onComboStateChange }: {
  comboTurnAbilities: TurnAbilityName[]
  index: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  if (index === 0) return null

  return (
    <ControlledTurnAbilitySelector
      index={index}
      value={comboTurnAbilities[index]}
      style={{ width: abilityWidth }}
      comboState={comboState}
      onComboStateChange={onComboStateChange}
    />
  )
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

export function ComboHeader({ comboState, onComboStateChange }: {
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const comboTurnAbilities = comboState.comboTurnAbilities

  if (!comboTurnAbilities) return null

  const length = comboTurnAbilities.length
  const render: ReactElement[] = [
    <div key='controls' style={{ width: 380 }} />,
    <div key='base' style={{ width: abilityWidth }} />,
    ...Array(Math.min(ABILITY_LIMIT + 1, length + 1))
      .fill(false)
      .map((value, index) => (
        <AbilitySelector
          comboTurnAbilities={comboTurnAbilities}
          index={index}
          key={index}
          comboState={comboState}
          onComboStateChange={onComboStateChange}
        />
      )),
  ]

  return (
    <Flex gap={abilityGap} align='center'>
      {render}
    </Flex>
  )
}
