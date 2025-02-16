import { Flex } from 'antd'
import DamageSplitsChart from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
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

  console.debug(splits)

  const data = Object.values(splits)

  return (
    <Flex vertical align='center' gap={8}>
      <div
        style={{
          width: 520,
          height: 400,
        }}
      >
        <DamageSplitsChart width={520} height={400} data={data}/>
      </div>
    </Flex>
  )
}
