import { defaultGap } from 'lib/constants/constantsUi'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import type { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'
import classes from './AbilityDamageSummary.module.css'

type AbilityDamageSummaryProps = {
  simResult: RunStatSimulationsResult
}

export function AbilityDamageSummary({ simResult }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortDMGTypes' })

  const actionDamage = simResult.actionDamage ?? {}

  return (
    <div style={{ display: 'flex', gap: defaultGap, justifyContent: 'space-around' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 230 }}>
        <ScoringNumber label={`${t('Basic')}:`} number={actionDamage[AbilityKind.BASIC]} precision={1} />
        <ScoringNumber label={`${t('Skill')}:`} number={actionDamage[AbilityKind.SKILL]} precision={1} />
        <ScoringNumber label={`${t('Ult')}:`} number={actionDamage[AbilityKind.ULT]} precision={1} />
        <ScoringNumber label={`${t('Fua')}:`} number={actionDamage[AbilityKind.FUA]} precision={1} />
        <ScoringNumber label={`${t('Memo_Skill')}:`} number={actionDamage[AbilityKind.MEMO_SKILL]} precision={1} />
        <ScoringNumber label={`${t('Memo_Talent')}:`} number={actionDamage[AbilityKind.MEMO_TALENT]} precision={1} />
        <ScoringNumber label={`${t('Elation_Skill')}:`} number={actionDamage[AbilityKind.ELATION_SKILL]} precision={1} />
        <ScoringNumber label={`${t('Unique')}:`} number={actionDamage[AbilityKind.UNIQUE]} precision={1} />
        <ScoringNumber label={`${t('Dot')}:`} number={actionDamage[AbilityKind.DOT]} precision={1} />
        <ScoringNumber label={`${t('Break')}:`} number={actionDamage[AbilityKind.BREAK]} precision={1} />
      </div>
    </div>
  )
}

function ScoringNumber({ label, number, precision = 1, useGrouping }: {
  label: string
  number?: number
  precision?: number
  useGrouping?: boolean
}) {
  const value = number ?? 0

  if (value === 0) return null

  return (
    <div style={{ display: 'flex', gap: 15, justifyContent: 'space-between' }}>
      <pre className={classes.preText}>{label}</pre>
      <pre className={classes.preTextRight}>{numberToLocaleString(value, precision, useGrouping)}</pre>
    </div>
  )
}
