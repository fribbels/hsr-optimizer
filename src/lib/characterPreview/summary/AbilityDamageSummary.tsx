import { toTurnAbility, type TurnAbilityName, NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

type AbilityDamageSummaryProps = {
  rotationDamage: RotationDamageStep[]
  comboTurnAbilities: TurnAbilityName[]
}

export function AbilityDamageSummary({ rotationDamage, comboTurnAbilities }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  return (
    <div className={classes.zebraContainer}>
      {rotationDamage.map((step, i) => {
        const abilityName = comboTurnAbilities[i + 1]
        if (!abilityName || abilityName === NULL_TURN_ABILITY_NAME) return null
        const label = toI18NVisual(toTurnAbility(abilityName), t)
        return (
          <div key={i} className={classes.row}>
            <span className={classes.label}>{i + 1}. {label}</span>
            <span className={classes.value}>
              {step.damage !== 0 && numberToLocaleString(step.damage, 1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
