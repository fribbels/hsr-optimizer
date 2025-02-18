import { Flex } from 'antd'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import React from 'react'

export function DamageSplits(props: {
  analysis: OptimizerResultAnalysis
}) {
  const splits = props.analysis.newX.dmgSplits

  if (!splits) {
    return (
      <div/>
    )
  }

  splits.MEMO_SKILL_DMG = props.analysis.newX.m.dmgSplits.MEMO_SKILL_DMG

  const data = Object.values(splits)

  return (
    <Flex
      vertical align='center' gap={8}
      style={{
        width: 730,
        height: 400,
        border: '1px solid rgb(53, 75, 125)',
        borderRadius: 10,
        overflow: 'hidden',
        padding: 8,
        background: '#243356',
      }}
    >
      <DamageSplitsChart data={data}/>
    </Flex>
  )
}
