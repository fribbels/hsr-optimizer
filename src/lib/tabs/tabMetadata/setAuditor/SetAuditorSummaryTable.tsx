import { Flex } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { useState } from 'react'
import { FLAG_COLORS, formatParamCombo } from './setAuditorConstants'
import { SetAuditorDrillDown } from './SetAuditorDrillDown'
import type { AuditorSetSummary, AuditorSetType } from './setAuditorTypes'

const MATCHED_COLOR = 'rgba(80, 200, 80, 0.1)'

const TYPE_LABELS: Record<AuditorSetType, string> = {
  relic4p: 'Relic 4p',
  relic2p2p: 'Relic 2p+2p',
  ornament: 'Ornament',
}

function SetIcons(props: { summary: AuditorSetSummary }) {
  const { setCombo } = props.summary
  if (setCombo.type === 'ornament') {
    return <img src={Assets.getSetImage(setCombo.ornamentSet)} style={{ width: 32 }} />
  }
  if (setCombo.type === 'relic4p') {
    return <img src={Assets.getSetImage(setCombo.relicSet1)} style={{ width: 32 }} />
  }
  return (
    <Flex gap={2}>
      <img src={Assets.getSetImage(setCombo.relicSet1)} style={{ width: 32 }} />
      <img src={Assets.getSetImage(setCombo.relicSet2)} style={{ width: 32 }} />
    </Flex>
  )
}

export function SetAuditorSummaryTable(props: {
  summaries: AuditorSetSummary[]
  relicReferenceLabel: string
  ornamentReferenceLabel: string
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const relicSummaries = props.summaries.filter((s) => s.setCombo.type !== 'ornament')
  const ornamentSummaries = props.summaries.filter((s) => s.setCombo.type === 'ornament')

  return (
    <Flex direction='column' gap={20}>
      {relicSummaries.length > 0 && (
        <SummarySection
          title='Relic Sets'
          referenceLabel={props.relicReferenceLabel}
          summaries={relicSummaries}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          indexOffset={0}
        />
      )}
      {ornamentSummaries.length > 0 && (
        <SummarySection
          title='Ornament Sets'
          referenceLabel={props.ornamentReferenceLabel}
          summaries={ornamentSummaries}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          indexOffset={relicSummaries.length}
        />
      )}
    </Flex>
  )
}

function SummarySection(props: {
  title: string
  referenceLabel: string
  summaries: AuditorSetSummary[]
  expandedIndex: number | null
  setExpandedIndex: (i: number | null) => void
  indexOffset: number
}) {
  const { title, referenceLabel, summaries, expandedIndex, setExpandedIndex, indexOffset } = props

  const flaggedCount = summaries.filter((s) => s.flag).length

  return (
    <Flex direction='column'>
      <Flex gap={12} align='baseline'>
        <h3 style={{ marginBottom: 4 }}>
          {title}
          {flaggedCount > 0 && <span style={{ color: '#ff6b6b', marginLeft: 8 }}>({flaggedCount} flagged)</span>}
        </h3>
        <span style={{ fontSize: 13, opacity: 0.6 }}>
          Compared to: <strong>{referenceLabel}</strong>
        </span>
      </Flex>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #464d6bc4' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', width: 40 }}>Flag</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', width: 100 }}>Best Δ%</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', width: 80 }}>Set</th>
            <th style={{ textAlign: 'left', padding: '6px 8px' }}>Label</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', width: 80 }}>Type</th>
            <th style={{ textAlign: 'left', padding: '6px 8px' }}>At Params</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary, i) => {
            const globalIndex = i + indexOffset
            const isExpanded = expandedIndex === globalIndex
            const bg = summary.flag ? FLAG_COLORS[summary.flag] : summary.matched ? MATCHED_COLOR : ''
            return (
              <SummaryRow
                key={globalIndex}
                summary={summary}
                isExpanded={isExpanded}
                onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                backgroundColor={bg}
              />
            )
          })}
        </tbody>
      </table>
    </Flex>
  )
}

function SummaryRow(props: {
  summary: AuditorSetSummary
  isExpanded: boolean
  onClick: () => void
  backgroundColor: string
}) {
  const { summary, isExpanded, onClick, backgroundColor } = props

  return (
    <>
      <tr
        className='custom-grid'
        style={{
          backgroundColor,
          cursor: 'pointer',
          borderBottom: '1px solid #464d6bc4',
        }}
        onClick={onClick}
      >
        <td style={{ padding: '4px 8px' }}>
          {summary.flag === 'red' ? '🔴' : summary.flag === 'yellow' ? '🟡' : ''}
        </td>
        <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontWeight: 600 }}>
          {summary.bestDelta === -Infinity
            ? '—'
            : `${summary.bestDelta >= 0 ? '+' : ''}${summary.bestDelta.toFixed(2)}%`}
        </td>
        <td style={{ padding: '4px 8px' }}>
          <SetIcons summary={summary} />
        </td>
        <td style={{ padding: '4px 8px', fontSize: 13 }}>
          {summary.setCombo.label}
        </td>
        <td style={{ padding: '4px 8px', fontSize: 12, opacity: 0.7 }}>
          {TYPE_LABELS[summary.setCombo.type]}
        </td>
        <td style={{ padding: '4px 8px', fontSize: 12, opacity: 0.7 }}>
          {formatParamCombo(summary.bestDeltaParams.spd, summary.bestDeltaParams.subDps, summary.bestDeltaParams.errRope)}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} style={{ padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <SetAuditorDrillDown results={summary.results} />
          </td>
        </tr>
      )}
    </>
  )
}
