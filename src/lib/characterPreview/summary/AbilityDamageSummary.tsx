import { ComboOptionsLabelMapping } from 'lib/optimization/rotation/turnAbilityConfig'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

type AbilityDamageSummaryProps = {
  rotationDamage: RotationDamageStep[]
}

export function AbilityDamageSummary({ rotationDamage }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  return (
    <div className={classes.zebraContainer}>
      {rotationDamage.map((step, i) => {
        const label = t(`ComboOptions.${ComboOptionsLabelMapping[step.actionType]}`)
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
