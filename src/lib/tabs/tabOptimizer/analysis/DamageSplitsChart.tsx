import { Flex } from 'antd'
import i18next from 'i18next'
import {
  chartColor,
  DamageSplitEntry,
  decodeDamageTypeLabel,
  getDamageTypeColor,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React, { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  LabelList,
  LabelProps,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const DAMAGE_SPLITS_CHART_WIDTH = 730
const BAR_HEIGHT = 48
const CHART_PADDING = 80

type FlattenedBar = {
  key: string
  damageType: number
  label: string
  color: string
  shape: (props: { x: number; y: number; width: number; height: number }) => React.ReactNode
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

  return { rows, bars, legendItems }
}

const SEGMENT_GAP = 2

function renderBarLabel(props: LabelProps) {
  const x = Number(props.x ?? 0)
  const y = Number(props.y ?? 0)
  const width = Number(props.width ?? 0)
  const height = Number(props.height ?? 0)
  const value = Number(props.value ?? 0)
  if (!value) return null
  return (
    <text
      x={x + width + 8}
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

function dimNumberLeftTick(props: { x: number; y: number; payload: { value: string } }) {
  const { x, y, payload } = props
  const tx = x - 70
  const { num, label } = parseLabel(payload.value)

  if (!num) {
    return (
      <text x={tx} y={y} textAnchor='start' fill={chartColor} fontSize={13} fontWeight={300} dominantBaseline='central'>
        {payload.value}
      </text>
    )
  }

  return (
    <text x={tx} y={y} textAnchor='start' fontSize={13} fontWeight={300} dominantBaseline='central'>
      <tspan fill='#667'>{num}. </tspan>
      <tspan fill={chartColor}>{label}</tspan>
    </text>
  )
}

export function DamageSplitsChart(props: { data: DamageSplitEntry[] }) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  const { rows, bars, legendItems } = useMemo(() => flattenData(props.data), [props.data])

  if (rows.length === 0) {
    return null
  }

  const chartHeight = Math.max(200, rows.length * BAR_HEIGHT + CHART_PADDING)

  return (
    <Flex vertical align='center' className='pre-font'>
      <BarChart
        layout='vertical'
        data={rows}
        margin={{ top: 15, right: 60, bottom: 20, left: 30 }}
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
          tickMargin={10}
          width={80}
        />
        <Tooltip
          cursor={false}
          isAnimationActive={false}
          content={<CustomTooltip hoveredBar={hoveredBar} bars={bars} />}
        />

        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            stackId='a'
            fill={bar.color}
            // @ts-ignore recharts shape typing
            shape={bar.shape}
            activeBar={false}
            isAnimationActive={false}
            onMouseEnter={() => setHoveredBar(bar.key)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {i === bars.length - 1 && (
              <LabelList dataKey='total' position='right' content={renderBarLabel} />
            )}
          </Bar>
        ))}
      </BarChart>
      <Flex wrap='wrap' justify='center' gap={16} style={{ marginTop: -10 }}>
        {legendItems.map((item) => (
          <Flex key={item.damageType} align='center' gap={6}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: item.color,
            }} />
            <span style={{ fontSize: 13, color: chartColor }}>{item.label}</span>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

type TooltipPayloadItem = {
  dataKey: string
  value: number
}

function CustomTooltip(props: {
  active?: boolean
  payload?: TooltipPayloadItem[]
  hoveredBar: string | null
  bars: FlattenedBar[]
}) {
  const { active, payload, hoveredBar, bars } = props
  if (!active || !payload || !hoveredBar) return null

  const barDef = bars.find((b) => b.key === hoveredBar)
  const dataItem = payload.find((p) => p.dataKey === hoveredBar)
  if (!barDef || !dataItem) return null

  return (
    <Flex
      vertical
      className='pre-font'
      style={{ background: 'rgb(69,93,154)', padding: 8, borderRadius: 3 }}
    >
      <span style={{ fontSize: 14, fontWeight: 'bold' }}>{barDef.label}</span>
      <span>{localeNumberComma(Math.floor(dataItem.value))}</span>
    </Flex>
  )
}

export function renderThousandsK(n: number) {
  return `${Math.floor(Number(n) / 1000)}${i18next.t('common:ThousandsSuffix')}`
}
