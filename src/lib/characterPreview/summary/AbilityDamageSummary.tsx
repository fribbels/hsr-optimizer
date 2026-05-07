import { usePromise } from 'hooks/usePromise'
import {
  AbilityKind,
  toTurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { formatSimScore } from 'lib/scoring/simScoringUtils'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

interface SynchronousAbilityDamageSummaryProps {
  rotationDamage: RotationDamageStep[]
}
interface AsynchronousAbilityDamageSummaryProps {
  promise: Promise<SimulationScore | null>
  mode: 'Benchmark' | 'Perfect'
  header?: React.ReactNode
  wrapperClassName?: string
}


export const AbilityDamageSummary = memo(function AbilityDamageSummary({
  rotationDamage,
}: SynchronousAbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  const displayableSteps = rotationDamage.filter((step) => step.actionType !== AbilityKind.NULL)
  if (displayableSteps.length === 0) return null

  return (
    <div className={classes.zebraContainer}>
      {displayableSteps.map((step, idx) => {
        const label = toI18NVisual(toTurnAbility(step.actionName), t)
        return (
          <div key={idx} className={classes.row}>
            <span className={classes.label}>{idx + 1}. {label}</span>
            <span className={classes.label}>
              {step.damage && formatSimScore(step.damage, step.buffStat, 1, step.buffStat == null)}
            </span>
          </div>
        )
      })}
    </div>
  )
})

export const AsyncAbilityDamageSummary = memo(function AsyncAbilityDamageSummary({ promise, mode, header, wrapperClassName }: AsynchronousAbilityDamageSummaryProps) {
  const output = usePromise(promise)
  const rotationDamage = output?.[mode === 'Benchmark' ? 'benchmarkSim' : 'maximumSim']?.result?.rotationDamage
  if (!rotationDamage?.some((step) => step.actionType !== AbilityKind.NULL)) return null

  if (header) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={wrapperClassName}>
        {header}
        <AbilityDamageSummary rotationDamage={rotationDamage} />
      </div>
    )
  }

  return <AbilityDamageSummary rotationDamage={rotationDamage} />
})
