import { Flex } from 'antd'
import { chartColor, extractDamageSplits } from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import React, { useMemo, useState } from 'react'

type SplitMode = 'default' | 'rotation'

function ModeToggle(props: {
  mode: SplitMode
  onModeChange: (mode: SplitMode) => void
}) {
  const { mode, onModeChange } = props
  const modes: { key: SplitMode; label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'rotation', label: 'Rotation' },
  ]

  return (
    <Flex gap={6} align='center' style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {modes.map((m) => (
        <span
          key={m.key}
          onClick={() => onModeChange(m.key)}
          style={{
            fontSize: 12,
            color: mode === m.key ? '#DDD' : '#8899aa',
            cursor: 'pointer',
            fontWeight: 400,
            background: mode === m.key ? '#354b7d' : 'transparent',
            padding: '3px 16px',
            borderRadius: 12,
            transition: 'all 0.15s',
            minWidth: 70,
            textAlign: 'center',
          }}
        >
          {m.label}
        </span>
      ))}
    </Flex>
  )
}

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

  return (
    <Flex
      vertical
      align='center'
      className='pre-font'
      gap={8}
      style={{
        background: '#243356',
        border: '1px solid #354b7d',
        boxShadow: cardShadowNonInset,
        borderRadius: 5,
        padding: '10px 0',
      }}
    >
      <span style={{ fontSize: 15, color: chartColor, borderBottom: '1px solid #354b7d', paddingBottom: 4 }}>
        Combo Breakdown
      </span>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <DamageSplitsChart data={data} />
    </Flex>
  )
}
