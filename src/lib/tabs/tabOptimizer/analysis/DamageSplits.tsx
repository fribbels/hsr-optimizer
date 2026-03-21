import { Flex } from '@mantine/core'
import { chartColor, extractDamageSplits } from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { useMemo, useState } from 'react'

type SplitMode = 'default' | 'rotation'

function ModeToggle({ mode, onModeChange }: {
  mode: SplitMode
  onModeChange: (mode: SplitMode) => void
}) {
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
            background: mode === m.key ? 'var(--border-color)' : 'transparent',
            padding: '3px 16px',
            borderRadius: 6,
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

export function DamageSplits({ analysis }: {
  analysis: OptimizerResultAnalysis
}) {
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
      direction='column'
      align='center'
      className='pre-font'
      gap={8}
      style={{
        background: 'var(--panel-bg)',
        border: 'var(--panel-border)',
        boxShadow: 'var(--card-shadow-flat)',
        borderRadius: 6,
        padding: '10px 0',
      }}
    >
      <span style={{ fontSize: 15, color: chartColor, borderBottom: '1px solid var(--border-color)', paddingBottom: 4 }}>
        Combo Breakdown
      </span>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <DamageSplitsChart data={data} />
    </Flex>
  )
}
