import { Flex } from 'antd'
import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  diminishingReturnsFormula,
  spdDiminishingReturnsFormula,
} from 'lib/scoring/simScoringUtils'
import { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { VerticalDivider } from 'lib/ui/Dividers'
import { numberToLocaleString } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

type SubstatRollsSummaryProps = {
  simRequest: SimulationRequest,
  precision: number,
  diminish: boolean,
  columns?: 1 | 2,
}

export function SubstatRollsSummary({ simRequest, precision, diminish, columns = 2 }: SubstatRollsSummaryProps) {
  const { t } = useTranslation(['charactersTab', 'common'])

  const stats = simRequest.stats
  const diminishingReturns: Record<string, number> = {}
  if (diminish) {
    for (const [stat, rolls] of Object.entries(simRequest.stats)) {
      const mainsCount = [
        simRequest.simBody,
        simRequest.simFeet,
        simRequest.simPlanarSphere,
        simRequest.simLinkRope,
        Stats.ATK,
        Stats.HP,
      ].filter((x) => x == stat).length
      if (stat == Stats.SPD) {
        diminishingReturns[stat] = rolls - spdDiminishingReturnsFormula(mainsCount, rolls)
      } else {
        diminishingReturns[stat] = rolls - diminishingReturnsFormula(mainsCount, rolls)
      }
    }
  }

  // Helper function to create a ScoringNumberParens component for a given stat
  const renderStatRow = (stat: SubStats, usePrecision: number = precision) => (
    <ScoringNumberParens
      label={t(`common:ShortStats.${stat}`) + ':'}
      number={stats[stat]}
      parens={diminishingReturns[stat]}
      precision={usePrecision}
    />
  )

  return (
    <Flex vertical gap={defaultGap}>
      {columns === 2
        ? (
          <Flex justify='space-between'>
            <Flex vertical gap={defaultGap} style={{ width: 125, paddingLeft: 5 }}>
              {renderStatRow(Stats.ATK_P)}
              {renderStatRow(Stats.ATK)}
              {renderStatRow(Stats.HP_P)}
              {renderStatRow(Stats.HP)}
              {renderStatRow(Stats.DEF_P)}
              {renderStatRow(Stats.DEF)}
            </Flex>
            <VerticalDivider />
            <Flex vertical gap={defaultGap} style={{ width: 125, paddingRight: 5 }}>
              {renderStatRow(Stats.SPD, 2)}
              {renderStatRow(Stats.CR)}
              {renderStatRow(Stats.CD)}
              {renderStatRow(Stats.EHR)}
              {renderStatRow(Stats.RES)}
              {renderStatRow(Stats.BE)}
            </Flex>
          </Flex>
        )
        : (
          <Flex vertical gap={defaultGap} style={{ width: 150 }}>
            {renderStatRow(Stats.ATK_P)}
            {renderStatRow(Stats.ATK)}
            {renderStatRow(Stats.HP_P)}
            {renderStatRow(Stats.HP)}
            {renderStatRow(Stats.DEF_P)}
            {renderStatRow(Stats.DEF)}
            {renderStatRow(Stats.SPD, 2)}
            {renderStatRow(Stats.CR)}
            {renderStatRow(Stats.CD)}
            {renderStatRow(Stats.EHR)}
            {renderStatRow(Stats.RES)}
            {renderStatRow(Stats.BE)}
          </Flex>
        )}
    </Flex>
  )
}

function ScoringNumberParens(props: {
  label: string,
  number?: number,
  parens?: number,
  precision?: number,
}) {
  const precision = props.precision ?? 1
  const value = TsUtils.precisionRound(props.number ?? 0)
  const parens = TsUtils.precisionRound(props.parens ?? 0)
  const show = value != 0
  const showParens = parens > 0

  return (
    <Flex gap={5} justify='space-between'>
      <pre style={{ margin: 0 }}>{props.label}</pre>
      <pre style={{ margin: 0, textAlign: 'right' }}>
        {show && numberToLocaleString(value, precision)}
        {showParens && <span style={{ margin: 3 }}>-</span>}
        {showParens && numberToLocaleString(parens, 1)}
      </pre>
    </Flex>
  )
}
