import { Flex, Radio, RadioChangeEvent } from 'antd'
import { extractDamageSplits } from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import React, { useMemo, useState } from 'react'

type SplitMode = 'default' | 'rotation'

export function DamageSplits(props: {
  analysis: OptimizerResultAnalysis,
}) {
  const { analysis } = props
  const { newX, context } = analysis
  const hasRotation = context.rotationActions.length > 0
  const [mode, setMode] = useState<SplitMode>(hasRotation ? 'rotation' : 'default')

  const actions = mode === 'default' ? context.defaultActions : context.rotationActions

  const data = useMemo(
    () => extractDamageSplits(newX, actions, mode),
    [newX, actions, mode],
  )

  const handleModeChange = (e: RadioChangeEvent) => {
    setMode(e.target.value as SplitMode)
  }

  return (
    <Flex vertical align='center' gap={8}>
      <Radio.Group
        value={mode}
        onChange={handleModeChange}
        optionType='button'
        buttonStyle='solid'
        size='small'
        options={[
          { label: 'Default', value: 'default' },
          { label: 'Rotation', value: 'rotation' },
        ]}
      />
      <DamageSplitsChart data={data} />
    </Flex>
  )
}
