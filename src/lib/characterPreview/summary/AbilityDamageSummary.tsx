import { Flex } from 'antd'
import { t } from 'i18next'
import { defaultGap } from 'lib/constants/constantsUi'
import { Key } from 'lib/optimization/computedStatsArray'
import { RunStatSimulationsResult } from 'lib/simulations/statSimulationTypes'
import { numberToLocaleString } from 'lib/utils/i18nUtils'

type AbilityDamageSummaryProps = {
  simResult: RunStatSimulationsResult
}

export function AbilityDamageSummary({ simResult }: AbilityDamageSummaryProps) {
  return (
    <Flex gap={defaultGap} justify='space-around'>
      <Flex vertical gap={4} style={{ width: 230 }}>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Basic')) + ':'} number={simResult.xa[Key.BASIC_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Skill')) + ':'} number={simResult.xa[Key.SKILL_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Ult')) + ':'} number={simResult.xa[Key.ULT_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Fua')) + ':'} number={simResult.xa[Key.FUA_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Memo_Skill')) + ':'} number={simResult.xa[Key.MEMO_SKILL_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Memo_Talent')) + ':'} number={simResult.xa[Key.MEMO_TALENT_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Dot')) + ':'} number={simResult.xa[Key.DOT_DMG]} precision={1}/>
        <ScoringNumber label={String(t('common:ShortDMGTypes.Break')) + ':'} number={simResult.xa[Key.BREAK_DMG]} precision={1}/>
      </Flex>
    </Flex>
  )
}

function ScoringNumber(props: {
  label: string
  number?: number
  precision?: number
  useGrouping?: boolean
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
