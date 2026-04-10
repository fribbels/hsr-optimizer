import {
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
  type TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { RotationDamageStep } from 'lib/simulations/statSimulationTypes'
import { SuspenseNode } from 'lib/ui/SuspenseNode'
import { toI18NVisual } from 'lib/utils/displayUtils'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

type AbilityDamageSummaryProps = SynchronousAbilityDamageSummaryProps | AsynchronousAbilityDamageSummaryProps

interface SynchronousAbilityDamageSummaryProps {
  rotationDamage: RotationDamageStep[]
  comboTurnAbilities: TurnAbilityName[]
  promise?: never
  mode?: never
}
interface AsynchronousAbilityDamageSummaryProps {
  comboTurnAbilities: TurnAbilityName[]
  rotationDamage?: never
  promise: Promise<SimulationScore | null>
  mode: 'Benchmark' | 'Perfect'
}

export const AbilityDamageSummary = memo(function AbilityDamageSummary({
  rotationDamage,
  comboTurnAbilities,
  mode,
  promise,
}: AbilityDamageSummaryProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })

  return (
    <div className={classes.zebraContainer}>
      {comboTurnAbilities.map((abilityName, idx) => {
        if (idx === 0 || !abilityName || abilityName === NULL_TURN_ABILITY_NAME) return null
        const label = toI18NVisual(toTurnAbility(abilityName), t)
        return (
          <div key={idx} className={classes.row}>
            <span className={classes.label}>{idx}. {label}</span>
            <span className={classes.label}>
              {promise
                ? (
                  <SuspenseNode
                    promise={promise}
                    selector={(result: SimulationScore | null) => {
                      if (result === null) return null
                      const sim = mode === 'Benchmark' ? result.benchmarkSim : result.maximumSim
                      const rotationDamage = sim.result?.rotationDamage
                      if (!rotationDamage) return null
                      if (rotationDamage[idx - 1].damage === 0) return null
                      return numberToLocaleString(rotationDamage[idx - 1].damage, 1)
                    }}
                  />
                )
                : rotationDamage[idx - 1].damage !== 0 && numberToLocaleString(rotationDamage[idx - 1].damage, 1)}
            </span>
          </div>
        )
      })}
    </div>
  )
})
