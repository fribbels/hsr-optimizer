import { DamageSplitsChart } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import {
  chartColor,
  extractDamageSplits,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import {
  useMemo,
  useState,
} from 'react'

type SplitMode = 'default' | 'rotation'

function ModeToggle({ mode, onModeChange }: {
  mode: SplitMode,
  onModeChange: (mode: SplitMode) => void,
}) {
  const modes: { key: SplitMode, label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'rotation', label: 'Rotation' },
  ]

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {modes.map((m) => (
        <span
          key={m.key}
          onClick={() => onModeChange(m.key)}
          style={{
            fontSize: 12,
            color: mode === m.key ? '#DDD' : '#8899aa',
            cursor: 'pointer',
            fontWeight: 400,
            background: mode === m.key ? 'var(--border-default)' : 'transparent',
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
    </div>
  )
}

export function DamageSplits({ analysis }: {
  analysis: OptimizerResultAnalysis,
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
    <div
      className='pre-font'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        background: 'var(--layer-2)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card-flat)',
        borderRadius: 6,
        padding: '10px 0',
      }}
    >
      <span style={{ fontSize: 15, color: chartColor, borderBottom: '1px solid var(--border-default)', paddingBottom: 4 }}>
        Combo Breakdown
      </span>
      <ModeToggle mode={mode} onModeChange={setMode} />
      <DamageSplitsChart data={data} />
    </div>
  )
}
