import { Flex } from 'antd'
import { useMemo } from 'react'
import { defaultGap } from 'lib/constants/constantsUi'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

type AbilityDamageSummaryProps = {
  simResult: RunStatSimulationsResult,
}

export function AbilityDamageSummary({ simResult }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortDMGTypes' })

  // Extract damage values from the Container using formatOptimizerDisplayData
  // which reads action register values based on the current context's defaultActions
  const displayData = useMemo(() => formatOptimizerDisplayData(simResult.x), [simResult.x])

  return (
    <Flex gap={defaultGap} justify='space-around'>
      <Flex vertical gap={4} style={{ width: 230 }}>
        <ScoringNumber label={String(t('Basic')) + ':'} number={displayData.BASIC} precision={1} />
        <ScoringNumber label={String(t('Skill')) + ':'} number={displayData.SKILL} precision={1} />
        <ScoringNumber label={String(t('Ult')) + ':'} number={displayData.ULT} precision={1} />
        <ScoringNumber label={String(t('Fua')) + ':'} number={displayData.FUA} precision={1} />
        <ScoringNumber label={String(t('Memo_Skill')) + ':'} number={displayData.MEMO_SKILL} precision={1} />
        <ScoringNumber label={String(t('Memo_Talent')) + ':'} number={displayData.MEMO_TALENT} precision={1} />
        <ScoringNumber label={String(t('Dot')) + ':'} number={displayData.DOT} precision={1} />
        <ScoringNumber label={String(t('Break')) + ':'} number={displayData.BREAK} precision={1} />
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
