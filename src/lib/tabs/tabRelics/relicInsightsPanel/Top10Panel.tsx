import { Flex } from '@mantine/core'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { type PanelProps } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Cell,
  ErrorBar,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  type NameType,
  type ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import type { CharacterId } from 'types/character'
import { useGlobalStore } from 'lib/stores/appStore'
import { precisionRound } from 'lib/utils/mathUtils'

const N_Displayed = 10

const DEFAULT_LEGEND_WIDTH = 273
const DEFAULT_CHART_WIDTH = 320 + DEFAULT_LEGEND_WIDTH
const DEFAULT_HEIGHT = 278

type DataPoint = {
  name: string,
  id: CharacterId,
  owned: boolean,
  y: number,
  x: number,
  errX: [number, number],
}

export const Top10Panel = memo(({ scores, width: propWidth, height: propHeight }: PanelProps) => {
  const chartWidth = propWidth ?? DEFAULT_CHART_WIDTH
  const chartHeight = propHeight ?? DEFAULT_HEIGHT
  const compact = chartHeight < 250
  const legendWidth = compact ? 240 : DEFAULT_LEGEND_WIDTH

  const { sortedScores, data } = useMemo(() => {
    const sortedScores = scores
      .slice(0, N_Displayed)
      .sort((a, b) => b.score.averagePct - a.score.averagePct)
    const data: DataPoint[] = sortedScores.map((s, idx) => ({
      name: s.name,
      id: s.id,
      owned: s.owned,
      y: N_Displayed - idx,
      x: s.score.averagePct,
      errX: [s.score.averagePct - s.score.worstPct, s.score.bestPct - s.score.averagePct],
    }))
    return { sortedScores, data }
  }, [scores])

  return (
    <div
      style={{
        borderRadius: 6,
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--mantine-color-dark-7)',
      }}
    >
      <ScatterChart
        width={chartWidth}
        height={chartHeight}
        margin={{
          top: 0,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid opacity={0.2} />
        <XAxis
          dataKey='x'
          type='number'
          domain={[0, 100]}
          tickCount={11}
          mirror
          axisLine={false} // Hides the axis line
          tickLine={false} // Hides the small tick marks
        />
        <YAxis
          dataKey='y'
          type='number'
          domain={[0, 11]}
          ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          // this is needed because error bars seem to initially populate y-axis data despite being set to be horizontal
          // allowing data overflow is why we need to set the domain to 11 instead of 10, setting to 10 will lead to clipping
          allowDataOverflow
          hide
        />
        <Tooltip content={TooltipContent} />
        <Legend align='right' verticalAlign='middle' width={legendWidth} content={<LegendContent scores={sortedScores} compact={compact} />} />
        <Scatter data={data}>
          {data.map((point, idx) => {
            return (
              <Cell
                key={point.id}
                fill={idxToColour(idx)}
                style={{ cursor: 'pointer' }}
                onClick={onClick(point.id)}
              />
            )
          })}
          <ErrorBar dataKey='errX' direction='x' stroke='#7d94b0' />
        </Scatter>
      </ScatterChart>
    </div>
  )
})

function LegendContent({ scores, compact }: { scores: PanelProps['scores']; compact?: boolean }) {
  const entryHeight = compact ? 18 : 25.3
  const avatarSize = compact ? 16 : 20
  const legendHeight = compact ? entryHeight * N_Displayed : 250

  return (
    <div
      style={{ marginLeft: compact ? 12 : 20, marginTop: 3, height: legendHeight }}
    >
      {scores.map((s, idx) => (
        <Flex
          gap={compact ? 3 : 5}
          key={s.id}
          h={entryHeight}
          style={compact ? { fontSize: 12 } : undefined}
          align="center"
        >
          {idx + '.'}
          <svg height={compact ? 18 : 25} width={10}>
            <rect height={10} width={10} fill={idxToColour(idx)} x={0} y={compact ? 4 : 5} />
          </svg>
          <img
            src={Assets.getCharacterAvatarById(s.id)}
            width={avatarSize}
            height={avatarSize}
            style={{ cursor: 'pointer' }}
            onClick={onClick(s.id)}
          />
          <div style={{ fontWeight: s.owned ? 'bold' : undefined }}>
            {`${s.name}: ${Math.floor(s.score.worstPct)}% - ${Math.floor(s.score.bestPct)}%`}
          </div>
        </Flex>
      ))}
    </div>
  )
}

function TooltipContent(props: TooltipContentProps<ValueType, NameType>) {
  const { payload } = props

  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicInsights' })
  const data = payload?.[0]?.payload
  if (!data) return <></>
  return (
    <Flex
      direction="column"
      style={{
        borderRadius: 6,
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-app)',
        height: 'fit-content',
        padding: 10,
      }}
      justify='space-between'
    >
      <u>{data.name}</u>
      <div>
        <>
          <>{t('AvgPotential')}{precisionRound(data.x, 1)}%</>
        </>
      </div>
    </Flex>
  )
}

function onClick(id: CharacterId) {
  return () => {
    useGlobalStore.getState().setScoringAlgorithmFocusCharacter(id)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }
}

function idxToColour(idx: number) {
  return `hsl(${idx * 360 / (1 + N_Displayed)}, 50%, 50%)`
}
