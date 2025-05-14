import { Flex } from 'antd'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import { NULL_TURN_ABILITY_NAME, toTurnAbility, TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { toI18NVisual } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { useTranslation } from 'react-i18next'
import { SimulationMetadata } from 'types/metadata'

type ComboRotationSummaryProps = {
  simMetadata: SimulationMetadata
}

export function ComboRotationSummary({ simMetadata }: ComboRotationSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  return (
    <Flex gap={30}>
      <Flex vertical gap={2}>
        {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
          <ScoringAbility
            key={i + 1}
            comboTurnAbilities={simMetadata.comboTurnAbilities}
            index={i + 1}
          />
        ))}
      </Flex>
      <Flex vertical gap={2}>
        <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.DOTS')} number={simMetadata.comboDot}/>
      </Flex>
    </Flex>
  )
}

function ScoringAbility(props: {
  comboTurnAbilities: TurnAbilityName[]
  index: number
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  const abilityName = props.comboTurnAbilities[props.index]
  if (!abilityName || abilityName == NULL_TURN_ABILITY_NAME) return <></>

  const displayValue = toI18NVisual(toTurnAbility(abilityName), t)

  return (
    <Flex align='center' gap={15}>
      <pre style={{ margin: 0 }}>{`#${props.index} - ${displayValue}`}</pre>
    </Flex>
  )
}

function ScoringInteger(props: {
  label: string
  number?: number
  valueWidth?: number
}) {
  const value = props.number ?? 0
  return (
    <Flex gap={9} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre style={{ margin: 0, width: props.valueWidth }}>{value}</pre>
    </Flex>
  )
}
