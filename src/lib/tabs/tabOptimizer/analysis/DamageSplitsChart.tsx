import {
  chartColor,
  decodeDamageTypeLabel,
  getDamageTypeColor,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import type { DamageSplitEntry } from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { localeNumberComma, renderThousandsK } from 'lib/utils/i18nUtils'
import type { ReactNode } from 'react'
import { useMemo, type CSSProperties } from 'react'
import type { LabelProps } from 'recharts'
import {
  Bar,
  BarChart,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type TooltipPayloadEntry = {
  dataKey?: string | number
  value?: number
  name?: string
  color?: string
}

const TOOLTIP_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--layer-3)',
  border: '1px solid var(--border-default)',
  padding: 8,
  borderRadius: 'var(--radius-sm)',
}

const DAMAGE_SPLITS_CHART_WIDTH = 730
const BAR_HEIGHT = 48
const CHART_PADDING = 80
const CHART_LEFT_MARGIN = 105  // 25 margin + 80 YAxis width
const CHART_RIGHT_MARGIN = 60
const PLOT_WIDTH = DAMAGE_SPLITS_CHART_WIDTH - CHART_LEFT_MARGIN - CHART_RIGHT_MARGIN

type FlattenedBar = {
  key: string
  damageType: number
  label: string
  color: string
  shape: (props: { x: number; y: number; width: number; height: number }) => ReactNode
}

type LegendItem = {
  damageType: number
  color: string
  label: string
}

type FlatRow = Record<string, number | string> & {
  name: string
  total: number
}

function flattenData(data: DamageSplitEntry[]): { rows: FlatRow[]; bars: FlattenedBar[]; legendItems: LegendItem[] } {
  const bars: FlattenedBar[] = []
  const rows: FlatRow[] = []
  const seenDamageTypes = new Set<number>()
  const legendItems: LegendItem[] = []

  for (let entryIdx = 0; entryIdx < data.length; entryIdx++) {
    const entry = data[entryIdx]
    const row: FlatRow = { name: entry.name, total: entry.total }

    for (let segIdx = 0; segIdx < entry.segments.length; segIdx++) {
      const seg = entry.segments[segIdx]
      const key = `${entryIdx}_${segIdx}`
      row[key] = seg.damage

      const isFirst = segIdx === 0
      const color = getDamageTypeColor(seg.damageType)
      bars.push({
        key,
        damageType: seg.damageType,
        label: seg.label,
        color,
        shape: GapBar(color, isFirst),
      })

      if (!seenDamageTypes.has(seg.damageType)) {
        seenDamageTypes.add(seg.damageType)
        legendItems.push({
          damageType: seg.damageType,
          color,
          label: decodeDamageTypeLabel(seg.damageType),
        })
      }
    }

    rows.push(row)
  }

  // Fill missing bar keys with 0 so recharts stacking accumulates positions correctly
  const allKeys = bars.map((b) => b.key)
  for (const row of rows) {
    for (const key of allKeys) {
      if (row[key] === undefined) {
        row[key] = 0
      }
    }
  }

  return { rows, bars, legendItems }
}

const SEGMENT_GAP = 2

function createBarLabelRenderer(maxTotal: number) {
  return function renderBarLabel(props: LabelProps) {
    const y = Number(props.y ?? 0)
    const height = Number(props.height ?? 0)
    const value = Number(props.value ?? 0)
    if (!value) return null
    // Calculate x position based on value and chart scale, not individual bar width
    const x = CHART_LEFT_MARGIN + (value / maxTotal) * PLOT_WIDTH
    return (
      <text
        x={x + 8}
        y={y + height / 2}
        fill={chartColor}
        dominantBaseline='central'
        textRendering='geometricPrecision'
        fontWeight={300}
        fontSize={14}
      >
        {renderThousandsK(value)}
      </text>
    )
  }
}

function GapBar(color: string, isFirst: boolean) {
  return (props: { x: number; y: number; width: number; height: number }) => {
    if (props.width <= 0) return null
    if (isFirst) {
      return (
        <rect
          x={props.x}
          y={props.y}
          width={props.width}
          height={props.height}
          fill={color}
          stroke='none'
          shapeRendering='crispEdges'
        />
      )
    }
    return (
      <g>
        <rect
          x={props.x}
          y={props.y}
          width={SEGMENT_GAP}
          height={props.height}
          fill='rgba(128, 128, 128, 0.4)'
          stroke='none'
          shapeRendering='crispEdges'
        />
        <rect
          x={props.x + SEGMENT_GAP}
          y={props.y}
          width={Math.max(0, props.width - SEGMENT_GAP)}
          height={props.height}
          fill={color}
          stroke='none'
          shapeRendering='crispEdges'
        />
      </g>
    )
  }
}

function parseLabel(name: string): { num: string; label: string } {
  const match = name.match(/^(\d+)\.\s*(.+)$/)
  if (match) return { num: match[1], label: match[2] }
  return { num: '', label: name }
}

function dimNumberLeftTick(props: { x: string | number; y: string | number; payload: { value: string } }) {
  const { x, y, payload } = props
  const tx = Number(x) - 70
  const { num, label } = parseLabel(payload.value)
  const words = label.split(' ')
  const multiline = words.length > 1
  const lineHeight = 14
  const startDy = multiline ? -((words.length - 1) * lineHeight) / 2 : 0

  if (!num) {
    return (
      <text x={tx} y={y} textAnchor='start' fontSize={13} fontWeight={300} dominantBaseline='central'>
        <tspan fill='transparent'>0. </tspan>
        {words.map((word, i) => (
          <tspan key={i} x={tx + 23} dy={i === 0 ? startDy : lineHeight} fill={chartColor}>{word}</tspan>
        ))}
      </text>
    )
  }

  return (
    <text x={tx} y={y} textAnchor='start' fontSize={13} fontWeight={300} dominantBaseline='central'>
      <tspan fill='#667'>{num}. </tspan>
      {words.map((word, i) => (
        <tspan key={i} x={tx + 23} dy={i === 0 ? startDy : lineHeight} fill={chartColor}>{word}</tspan>
      ))}
    </text>
  )
}

function CustomTooltip({ active, payload, bars }: { active?: boolean; payload?: TooltipPayloadEntry[]; bars: FlattenedBar[] }) {
  if (!active || !payload || payload.length === 0) return null

  // Find the first non-zero payload entry
  const entry = payload.find((p) => typeof p.value === 'number' && p.value > 0)
  if (!entry) return null

  const barDef = bars.find((b) => b.key === entry.dataKey)
  if (!barDef) return null

  return (
    <div className='pre-font' style={TOOLTIP_STYLE}>
      <span style={{ fontSize: 14, fontWeight: 'bold' }}>{barDef.label}</span>
      <span>{localeNumberComma(Math.floor(entry.value as number))}</span>
    </div>
  )
}

export function DamageSplitsChart({ data }: { data: DamageSplitEntry[] }) {
  const { rows, bars, legendItems } = useMemo(() => flattenData(data), [data])

  if (rows.length === 0) {
    return null
  }

  const chartHeight = Math.max(200, rows.length * BAR_HEIGHT + CHART_PADDING)
  const maxTotal = useMemo(() => Math.max(...rows.map((r) => r.total)), [rows])
  const renderBarLabel = useMemo(() => createBarLabelRenderer(maxTotal), [maxTotal])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className='pre-font'>
      <BarChart
        layout='vertical'
        data={rows}
        margin={{ top: 15, right: 60, bottom: 20, left: 25 }}
        barCategoryGap='10%'
        width={DAMAGE_SPLITS_CHART_WIDTH}
        height={chartHeight}
      >
        <XAxis
          type='number'
          tick={{ fill: chartColor, textRendering: 'geometricPrecision', fontWeight: 300, fontSize: 13 }}
          tickFormatter={renderThousandsK}
          width={100}
        />
        <YAxis
          dataKey='name'
          type='category'
          axisLine={false}
          tickLine={false}
          tick={dimNumberLeftTick}
          tickMargin={15}
          width={80}
        />
        {/* Only animate opacity (not position) to prevent fly-in from corner on first render */}
        <Tooltip
          content={<CustomTooltip bars={bars} />}
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          isAnimationActive={false}
          wrapperStyle={{ transition: 'opacity 0.15s ease-out', pointerEvents: 'none' }}
        />

        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            stackId='a'
            fill={bar.color}
            // @ts-expect-error recharts shape typing doesn't support custom shape functions
            shape={bar.shape}
            activeBar={false}
            isAnimationActive={false}
          >
            {/* Attach labels to last bar; position calculated from total value, not bar width */}
            {i === bars.length - 1 && (
              <LabelList dataKey='total' position='right' content={renderBarLabel} />
            )}
          </Bar>
        ))}
      </BarChart>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: -10, paddingBlock: 8 }}>
        {legendItems.map((item) => (
          <div key={item.damageType} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: item.color,
            }} />
            <span style={{ fontSize: 13, color: chartColor }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

