import { Flex } from '@mantine/core'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import {
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
  TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { toI18NVisual } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { useTranslation } from 'react-i18next'
import { SimulationMetadata } from 'types/metadata'
import classes from './ComboRotationSummary.module.css'

type ComboRotationSummaryProps = {
  simMetadata: SimulationMetadata
}

export function ComboRotationSummary({ simMetadata }: ComboRotationSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  return (
    <Flex gap={30}>
      <Flex direction='column' gap={2}>
        {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
          <ScoringAbility
            key={i + 1}
            comboTurnAbilities={simMetadata.comboTurnAbilities}
            index={i + 1}
          />
        ))}
      </Flex>
      <Flex direction='column' gap={2}>
        <ScoringInteger label={t('CharacterPreview.BuildAnalysis.Rotation.DOTS')} number={simMetadata.comboDot} />
      </Flex>
    </Flex>
  )
}

function ScoringAbility({ comboTurnAbilities, index }: {
  comboTurnAbilities: TurnAbilityName[]
  index: number
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  const abilityName = comboTurnAbilities[index]
  if (!abilityName || abilityName === NULL_TURN_ABILITY_NAME) return null

  const displayValue = toI18NVisual(toTurnAbility(abilityName), t)

  return (
    <Flex align='center' gap={15}>
      <pre className={classes.preText}>{`#${index} - ${displayValue}`}</pre>
    </Flex>
  )
}

function ScoringInteger({ label, number, valueWidth }: {
  label: string
  number?: number
  valueWidth?: number
}) {
  const value = number ?? 0
  return (
    <Flex gap={9} justify='space-between'>
      <pre className={classes.preText}>{label}</pre>
      <pre className={classes.preText} style={{ width: valueWidth }}>{value}</pre>
    </Flex>
  )
}
