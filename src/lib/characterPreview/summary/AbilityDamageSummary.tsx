import { Flex } from 'antd'
import { defaultGap } from 'lib/constants/constantsUi'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

type AbilityDamageSummaryProps = {
  simResult: RunStatSimulationsResult,
}

export function AbilityDamageSummary({ simResult }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortDMGTypes' })

  const actionDamage = simResult.actionDamage ?? {}

  return (
    <Flex gap={defaultGap} justify='space-around'>
      <Flex vertical gap={4} style={{ width: 230 }}>
        <ScoringNumber label={String(t('Basic')) + ':'} number={actionDamage[AbilityKind.BASIC]} precision={1} />
        <ScoringNumber label={String(t('Skill')) + ':'} number={actionDamage[AbilityKind.SKILL]} precision={1} />
        <ScoringNumber label={String(t('Ult')) + ':'} number={actionDamage[AbilityKind.ULT]} precision={1} />
        <ScoringNumber label={String(t('Fua')) + ':'} number={actionDamage[AbilityKind.FUA]} precision={1} />
        <ScoringNumber label={String(t('Memo_Skill')) + ':'} number={actionDamage[AbilityKind.MEMO_SKILL]} precision={1} />
        <ScoringNumber label={String(t('Memo_Talent')) + ':'} number={actionDamage[AbilityKind.MEMO_TALENT]} precision={1} />
        <ScoringNumber label={String(t('Dot')) + ':'} number={actionDamage[AbilityKind.DOT]} precision={1} />
        <ScoringNumber label={String(t('Break')) + ':'} number={actionDamage[AbilityKind.BREAK]} precision={1} />
      </Flex>
    </Flex>
  )
}

function ScoringNumber(props: {
  label: string,
  number?: number,
  precision?: number,
  useGrouping?: boolean,
}) {
  const precision = props.precision ?? 1
  const value = props.number ?? 0

  if (value == 0) return <></>

  return (
    <Flex gap={15} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre style={{ margin: 0, textAlign: 'right' }}>{numberToLocaleString(value, precision, props.useGrouping)}</pre>
    </Flex>
  )
}
