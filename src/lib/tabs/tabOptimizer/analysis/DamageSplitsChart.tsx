import { Flex } from 'antd'
import i18next from 'i18next'
import {
  DamageSplitEntry,
  getDamageTypeColor,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const DAMAGE_SPLITS_CHART_WIDTH = 730
const BAR_HEIGHT = 65
const CHART_PADDING = 80

const chartColor = '#DDD'

type FlattenedBar = {
  key: string
  damageType: number
  label: string
  color: string
  isLast: boolean
}

type FlatRow = Record<string, number | string> & {
  name: string
  total: number
}

function flattenData(data: DamageSplitEntry[]): { rows: FlatRow[]; bars: FlattenedBar[] } {
  const bars: FlattenedBar[] = []
  const rows: FlatRow[] = []

  for (let entryIdx = 0; entryIdx < data.length; entryIdx++) {
    const entry = data[entryIdx]
    const row: FlatRow = { name: entry.name, total: entry.total }

    for (let segIdx = 0; segIdx < entry.segments.length; segIdx++) {
      const seg = entry.segments[segIdx]
      const key = `${entryIdx}_${segIdx}`
      row[key] = seg.damage

      bars.push({
        key,
        damageType: seg.damageType,
        label: seg.label,
        color: getDamageTypeColor(seg.damageType),
        isLast: segIdx === entry.segments.length - 1,
      })
    }

    rows.push(row)
  }

  const seen = new Set<string>()
  const uniqueBars = bars.filter((b) => {
    if (seen.has(b.key)) return false
    seen.add(b.key)
    return true
  })

  return { rows, bars: uniqueBars }
}

const SEGMENT_GAP = 3

function GapBar(color: string) {
  return (props: { x: number; y: number; width: number; height: number }) => (
    <rect
      x={props.x + SEGMENT_GAP}
      y={props.y}
      width={Math.max(0, props.width - SEGMENT_GAP)}
      height={props.height}
      fill={color}
    />
  )
}

export function DamageSplitsChart(props: { data: DamageSplitEntry[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageSplits' })
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  const { rows, bars } = useMemo(() => flattenData(props.data), [props.data])

  if (rows.length === 0) {
    return null
  }

  const chartHeight = Math.max(200, rows.length * BAR_HEIGHT + CHART_PADDING)

  return (
    <Flex justify='center' className='pre-font'>
      <span style={{ position: 'absolute', marginTop: 20, fontSize: 14 }}>
        {t('Title')}
      </span>
      <BarChart
        layout='vertical'
        data={rows}
        margin={{ top: 50, right: 60, bottom: 20, left: 70 }}
        barCategoryGap='25%'
        width={DAMAGE_SPLITS_CHART_WIDTH}
        height={chartHeight}
      >
        <XAxis
          type='number'
          tick={{ fill: chartColor }}
          tickFormatter={renderThousandsK}
          width={100}
        />
        <YAxis
          dataKey='name'
          type='category'
          axisLine={false}
          tickLine={false}
          tick={{ fill: chartColor }}
          tickMargin={10}
          width={20}
        />
        <Tooltip
          cursor={false}
          isAnimationActive={false}
          content={<CustomTooltip hoveredBar={hoveredBar} bars={bars} />}
        />

        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            stackId='a'
            fill={bar.color}
            // @ts-ignore recharts shape typing
            shape={GapBar(bar.color)}
            activeBar={false}
            isAnimationActive={false}
            onMouseEnter={() => setHoveredBar(bar.key)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {bar.isLast && (
              <LabelList dataKey='total' position='right' formatter={renderThousandsK} />
            )}
          </Bar>
        ))}
      </BarChart>
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
