import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { type PanelProps } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import {
  memo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  type ScatterPointItem,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts'
import { useGlobalStore } from 'lib/stores/app/appStore'

type Bucket = Array<PanelProps['scores'][number]>

type Score = Bucket[number]

type DataPoint = {
  x: number
  y: number
  name: Score['name']
  id: Score['id']
  bestAdded: Score['score']['meta']['bestAddedStats']
  bestUpgraded: Score['score']['meta']['bestUpgradedStats']
  imgWidth: number
  imgHeight: number
}

const DEFAULT_WIDTH = 1222
const DEFAULT_HEIGHT = 288

const IMG_WIDTH_NORMAL = 26
const IMG_HEIGHT_NORMAL = 39
const IMG_WIDTH_COMPACT = 20
const IMG_HEIGHT_COMPACT = 30

export const BucketsPanel = memo(({ scores, width: propWidth, height: propHeight }: PanelProps) => {
  const chartWidth = propWidth ?? DEFAULT_WIDTH
  const chartHeight = propHeight ?? DEFAULT_HEIGHT
  const compact = chartHeight < 250

  const imgWidth = compact ? IMG_WIDTH_COMPACT : IMG_WIDTH_NORMAL
  const imgHeight = compact ? IMG_HEIGHT_COMPACT : IMG_HEIGHT_NORMAL

  const [tooltipActive, setTooltipActive] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const buckets = Array.from<Bucket>({ length: 10 })
  for (let i = 0; i < 10; i++) buckets[i] = []

  scores.forEach((score) => {
    const bucketIndex = Math.min(9, Math.max(0, Math.floor(score.score.bestPct / 10)))
    buckets[bucketIndex].push(score)
  })

  const longestBucket = Math.max(...buckets.flatMap((b) => b.length))

  // Approximate available width for icons after margins
  const iconAreaWidth = chartWidth - 60
  // if we can fit all rows within the available width then align left without overlap
  // if not then space evenly (will lead to overlap) and ensure vertical alignment
  let xPos = (idx: number) => {
    return imgWidth / iconAreaWidth * (idx + 0.5)
  }
  if (longestBucket * imgWidth > iconAreaWidth) {
    xPos = (idx) => (idx + 0.5) / longestBucket
  }

  const data: Array<DataPoint> = buckets.flatMap((bucket, bucketIdx) =>
    bucket.map((score, scoreIdx) => ({
      x: xPos(scoreIdx),
      y: bucketIdx,
      name: score.name,
      id: score.id,
      bestAdded: score.score.meta.bestAddedStats,
      bestUpgraded: score.score.meta.bestUpgradedStats,
      imgWidth,
      imgHeight,
    }))
  )

  const onMouseEnterScatter = () => {
    clearTimeout(timeout.current)
    setTooltipActive(true)
  }

  const onMouseLeaveScatter = () => {
    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => setTooltipActive(false), 100)
  }

  const onScatterClick = (data: ScatterPointItem) => {
    const point = data.payload as DataPoint
    useGlobalStore.getState().setScoringAlgorithmFocusCharacter(point.id)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  return (
    <div
      style={{
        borderRadius: 6,
        boxShadow: 'inset 0 0 0 1px var(--border-default)',
        backgroundColor: 'var(--layer-1)',
      }}
    >
      <ScatterChart
        width={chartWidth}
        height={chartHeight}
        margin={{
          top: compact ? 14 : 20,
          right: compact ? 10 : 15,
          bottom: compact ? 14 : 20,
          left: -5,
        }}
      >
        <XAxis dataKey='x' type='number' domain={[0, 1]} hide />
        <YAxis
          dataKey='y'
          tickFormatter={(val) => `${val * 10}%+`}
          domain={[0, 9]}
          ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
          tick={{ fill: '#cfcfcf', fontSize: compact ? 10 : 13 }}
          axisLine={false}
          tickLine={false}
        />
        <CartesianGrid opacity={0.2} vertical={false} />
        <Tooltip
          cursor={false}
          active={tooltipActive}
          content={TooltipContent}
        />
        <Scatter
          onMouseEnter={onMouseEnterScatter}
          onMouseLeave={onMouseLeaveScatter}
          name='scores'
          data={data}
          onClick={onScatterClick}
          shape={<ShapeFunction />}
          isAnimationActive={false}
        />
      </ScatterChart>
    </div>
  )
})

function ShapeFunction(untypedProps: unknown) {
  const props = untypedProps as DataPoint & { x: number; y: number }
  const w = props.imgWidth
  const h = props.imgHeight
  return (
    <image
      href={Assets.getCharacterAvatarById(props.id)}
      x={props.x - w / 2}
      y={props.y - h / 2}
      width={w}
      height={h}
      style={{ cursor: 'pointer' }}
    />
  )
}

function TooltipContent(props: TooltipContentProps) {
  const { payload } = props
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicInsights' })

  const data = payload?.[0]?.payload
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 6,
        border: '1px solid var(--border-default)',
        backgroundColor: 'var(--layer-0)',
        height: 'fit-content',
        padding: 10,
      }}
    >
      <div style={{ marginBottom: 5 }}>
        <u>{data?.name}</u>
      </div>
      <div>
        {data?.bestUpgraded?.length !== 0 && (
          <>
            <>{t('UpgradedStats')}</>
            <>{data?.bestUpgraded?.join(' / ')}</>
          </>
        )}
      </div>
      <div>
        {data?.bestAdded?.length !== 0 && (
          <>
            <>{t('NewStats')}</>
            <>{data?.bestAdded?.join(' / ')}</>
          </>
        )}
      </div>
    </div>
  )
}
