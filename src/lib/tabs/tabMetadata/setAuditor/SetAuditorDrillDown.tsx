import { FLAG_COLORS, formatParamCombo } from './setAuditorConstants'
import type { AuditorRunResult } from './setAuditorTypes'

export function SetAuditorDrillDown(props: {
  results: AuditorRunResult[]
}) {
  const sorted = [...props.results].sort((a, b) => b.deltaPct - a.deltaPct)

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '4px 8px', width: 40 }}>Flag</th>
          <th style={{ textAlign: 'left', padding: '4px 8px', width: 100 }}>Delta</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Target</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>Parameters</th>
          <th style={{ textAlign: 'right', padding: '4px 8px' }}>Score</th>
          <th style={{ textAlign: 'right', padding: '4px 8px' }}>Reference</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((result, i) => {
          const bg = result.flag ? FLAG_COLORS[result.flag] : ''
          return (
            <tr key={i} style={{ backgroundColor: bg }}>
              <td style={{ padding: '3px 8px' }}>
                {result.flag === 'red' ? '🔴' : result.flag === 'yellow' ? '🟡' : ''}
              </td>
              <td style={{ padding: '3px 8px', fontFamily: 'monospace', fontWeight: 600 }}>
                {result.error ? '—' : `${result.deltaPct >= 0 ? '+' : ''}${result.deltaPct.toFixed(2)}%`}
              </td>
              <td style={{ padding: '3px 8px', fontSize: 12, opacity: 0.7 }}>
                {result.modeLabel ?? ''}
              </td>
              <td style={{ padding: '3px 8px' }}>
                {formatParamCombo(result.paramCombo.spd, result.paramCombo.subDps, result.paramCombo.errRope)}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 8px', fontFamily: 'monospace' }}>
                {result.error ? 'Error' : Math.round(result.score).toLocaleString()}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 8px', fontFamily: 'monospace' }}>
                {Math.round(result.referenceScore).toLocaleString()}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
