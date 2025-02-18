import { Flex } from 'antd'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
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
        boxShadow: cardShadow,
        borderRadius: 5,
        overflow: 'hidden',
        padding: 8,
        background: '#243356',
      }}
    >
      <DamageSplitsChart data={data}/>
    </Flex>
  )
}
