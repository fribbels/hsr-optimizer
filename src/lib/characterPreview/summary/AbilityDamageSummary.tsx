import { usePromise } from 'hooks/usePromise'
import {
  AbilityKind,
  toTurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

interface SynchronousAbilityDamageSummaryProps {
  rotationDamage: RotationDamageStep[]
}
interface AsynchronousAbilityDamageSummaryProps {
  promise: Promise<SimulationScore | null>
  mode: 'Benchmark' | 'Perfect'
}

export const AbilityDamageSummary = memo(function AbilityDamageSummary({
  rotationDamage,
}: SynchronousAbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  return (
    <div className={classes.zebraContainer}>
      {rotationDamage.map((step, idx) => {
        if (step.actionType === AbilityKind.NULL) return null
        const label = toI18NVisual(toTurnAbility(step.actionName), t)
        return (
          <div key={idx} className={classes.row}>
            <span className={classes.label}>{idx + 1}. {label}</span>
            <span className={classes.label}>
              {step.damage && numberToLocaleString(step.damage, 1)}
            </span>
          </div>
        )
      })}
    </div>
  )
})

export const AsyncAbilityDamageSummary = memo(function AsyncAbilityDamageSummary({ promise, mode }: AsynchronousAbilityDamageSummaryProps) {
  const output = usePromise(promise)
  const rotationDamage = output?.[mode === 'Benchmark' ? 'benchmarkSim' : 'maximumSim']?.result?.rotationDamage
  if (!rotationDamage) return null
  return <AbilityDamageSummary rotationDamage={rotationDamage} />
})
