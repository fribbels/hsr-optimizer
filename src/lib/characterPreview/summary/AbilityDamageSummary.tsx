import { usePromise } from 'hooks/usePromise'
import {
  AbilityKind,
  toTurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ScoringColumnKind } from 'lib/characterPreview/buildAnalysis/ScoringColumns'
import { SCORING_CONFIG_REGISTRY } from 'lib/scoring/scoringConfig'
import { formatSimScore } from 'lib/scoring/simScoringUtils'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { ScoringConfigType } from 'types/metadata'
import classes from './AbilityDamageSummary.module.css'

interface SynchronousAbilityDamageSummaryProps {
  rotationDamage: RotationDamageStep[]
  configType: ScoringConfigType
}
interface AsynchronousAbilityDamageSummaryProps {
  promise: Promise<SimulationScore | null>
  mode: ScoringColumnKind.BENCHMARK | ScoringColumnKind.PERFECT
  configType: ScoringConfigType
  header?: React.ReactNode
  wrapperClassName?: string
}


export function SummaryRows({ entries }: { entries: [string, string][] }) {
  return (
    <div className={classes.zebraContainer}>
      {entries.map(([label, value], idx) => (
        <div key={idx} className={classes.row}>
          <span className={classes.label}>{label}</span>
          <span className={classes.label}>{value}</span>
        </div>
      ))}
    </div>
  )
}

export const AbilityDamageSummary = memo(function AbilityDamageSummary({
  rotationDamage,
  configType,
}: SynchronousAbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const thousands = SCORING_CONFIG_REGISTRY[configType].thousands

  const displayableSteps = rotationDamage.filter((step) => step.actionType !== AbilityKind.NULL)
  if (displayableSteps.length === 0) return null

  const entries: [string, string][] = displayableSteps.map((step, idx) => [
    `${idx + 1}. ${toI18NVisual(toTurnAbility(step.actionName), t)}`,
    step.damage ? formatSimScore(step.damage, step.buffStat, 1, thousands) : '',
  ])

  return <SummaryRows entries={entries} />
})

export const AsyncAbilityDamageSummary = memo(function AsyncAbilityDamageSummary({ promise, mode, configType, header, wrapperClassName }: AsynchronousAbilityDamageSummaryProps) {
  const output = usePromise(promise)
  const rotationDamage = output?.[mode === ScoringColumnKind.BENCHMARK ? 'benchmarkSim' : 'maximumSim']?.result?.rotationDamage
  if (!rotationDamage?.some((step) => step.actionType !== AbilityKind.NULL)) return null

  if (header) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className={wrapperClassName}>
        {header}
        <AbilityDamageSummary rotationDamage={rotationDamage} configType={configType} />
      </div>
    )
  }

  return <AbilityDamageSummary rotationDamage={rotationDamage} configType={configType} />
})
