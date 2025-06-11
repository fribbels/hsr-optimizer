import { Flex } from 'antd'
import { defaultGap } from 'lib/constants/constantsUi'
import { Key } from 'lib/optimization/computedStatsArray'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { useTranslation } from 'react-i18next'

type AbilityDamageSummaryProps = {
  simResult: RunStatSimulationsResult,
}

export function AbilityDamageSummary({ simResult }: AbilityDamageSummaryProps) {
  const { t } = useTranslation('common', { keyPrefix: 'ShortDMGTypes' })
  return (
    <Flex gap={defaultGap} justify='space-around'>
      <Flex vertical gap={4} style={{ width: 230 }}>
        <ScoringNumber label={String(t('Basic')) + ':'} number={simResult.xa[Key.BASIC_DMG]} precision={1} />
        <ScoringNumber label={String(t('Skill')) + ':'} number={simResult.xa[Key.SKILL_DMG]} precision={1} />
        <ScoringNumber label={String(t('Ult')) + ':'} number={simResult.xa[Key.ULT_DMG]} precision={1} />
        <ScoringNumber label={String(t('Fua')) + ':'} number={simResult.xa[Key.FUA_DMG]} precision={1} />
        <ScoringNumber label={String(t('Memo_Skill')) + ':'} number={simResult.xa[Key.MEMO_SKILL_DMG]} precision={1} />
        <ScoringNumber label={String(t('Memo_Talent')) + ':'} number={simResult.xa[Key.MEMO_TALENT_DMG]} precision={1} />
        <ScoringNumber label={String(t('Dot')) + ':'} number={simResult.xa[Key.DOT_DMG]} precision={1} />
        <ScoringNumber label={String(t('Break')) + ':'} number={simResult.xa[Key.BREAK_DMG]} precision={1} />
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
