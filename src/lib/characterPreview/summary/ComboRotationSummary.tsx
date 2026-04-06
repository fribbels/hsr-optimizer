import { ABILITY_LIMIT } from 'lib/constants/constants'
import {
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { useTranslation } from 'react-i18next'
import type { SimulationMetadata } from 'types/metadata'
import classes from './ComboRotationSummary.module.css'

type ComboRotationSummaryProps = {
  simMetadata: SimulationMetadata
}

export function ComboRotationSummary({ simMetadata }: ComboRotationSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
          <ScoringAbility
            key={i + 1}
            comboTurnAbilities={simMetadata.comboTurnAbilities}
            index={i + 1}
          />
        ))}
      </div>
    </div>
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
    <div>
      <span className={classes.rotationStep}>{`#${index} - ${displayValue}`}</span>
    </div>
  )
}
