import { Flex } from 'antd'
import { middleColumnWidth } from 'lib/constantsUi.ts'
import StatRow from 'components/characterPreview/StatRow.tsx'
import { Constants } from 'lib/constants.ts'
import React from 'react'

export const StatSummary = (props: { finalStats: any; elementalDmgValue: string }) => {
  return (
    <Flex vertical style={{ width: middleColumnWidth, paddingLeft: 8, paddingRight: 12 }} gap={4}>
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.HP} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.ATK} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.DEF} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.SPD} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CR} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.CD} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.EHR} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.RES} />
      <StatRow finalStats={props.finalStats} stat={Constants.Stats.BE} />
      <StatRow finalStats={props.finalStats} stat={props.elementalDmgValue} />
      <StatRow finalStats={props.finalStats} stat="CV" />
    </Flex>
  )
}
