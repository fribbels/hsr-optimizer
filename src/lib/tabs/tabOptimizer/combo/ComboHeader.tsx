import { Flex } from '@mantine/core'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { abilityGap, abilityWidth } from 'lib/tabs/tabOptimizer/combo/comboDrawerConstants'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { ControlledTurnAbilitySelector } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

function AbilitySelector(props: {
  comboTurnAbilities: TurnAbilityName[]
  index: number
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
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

export function ComboHeader(props: {
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
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
