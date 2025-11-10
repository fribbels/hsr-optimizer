import {
  Flex,
  theme,
} from 'antd'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { PanelProps } from 'lib/tabs/tabRelics/relicInsightsPanel/RelicInsightsPanel'
import React, {
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

type Bucket = Array<PanelProps['scores'][number]>

type Score = Bucket[number]

type DataPoint = {
  x: number,
  y: number,
  name: Score['name'],
  id: Score['id'],
  bestAdded: Score['score']['meta']['bestAddedStats'],
  bestUpgraded: Score['score']['meta']['bestUpgradedStats'],
}

const { useToken } = theme

const IMG_WIDTH = 26
const IMG_HEIGHT = 39

export const BucketsPanel = React.memo(({ scores }: PanelProps) => {
  const { token } = useToken()
  const [tooltipActive, setTooltipActive] = useState(false)
  const timeout = useRef<NodeJS.Timeout>()
  const buckets = Array.from<Bucket>({ length: 10 })
  for (let i = 0; i < 10; i++) buckets[i] = []

  scores.forEach((score) => {
    const bucketIndex = Math.min(9, Math.max(0, Math.floor(score.score.bestPct / 10)))
    buckets[bucketIndex].push(score)
  })

  const longestBucket = Math.max(...buckets.flatMap((b) => b.length))

  // 1162 is the approximate available width for the icons
  // if we can fit all rows within the 1162 then align left without overlap
  // if not then space evenly (will lead to overlap) and ensure vertical alignment
  let xPos = (idx: number) => {
    return IMG_WIDTH / 1162 * (idx + 0.5)
  }
  if (longestBucket * IMG_WIDTH > 1162) {
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

  const onScatterClick = (data: DataPoint) => {
    window.store.getState().setScoringAlgorithmFocusCharacter(data.id)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <ScatterChart
        width={1222}
        height={278}
        margin={{
          top: 20,
          right: 15,
          bottom: 20,
          left: -5,
        }}
      >
        <XAxis dataKey='x' type='number' domain={[0, 1]} hide />
        <YAxis
          dataKey='y'
          tickFormatter={(val) => `${val * 10}%+`}
          domain={[0, 9]}
          ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
          tick={{ fill: '#cfcfcf', fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <CartesianGrid opacity={0.2} vertical={false} />
        <Tooltip
          cursor={false}
          active={tooltipActive}
          content={<TooltipContent />}
        />
        <Scatter
          onMouseEnter={onMouseEnterScatter}
          onMouseLeave={onMouseLeaveScatter}
          name='scores'
          data={data}
          onClick={onScatterClick}
          shape={<ShapeFunction />}
        />
      </ScatterChart>
    </div>
  )
})

function ShapeFunction(untypedProps: unknown) {
  const props = untypedProps as Bucket[number] & { x: number, y: number }
  return (
    <image
      href={Assets.getCharacterAvatarById(props.id)}
      x={props.x - 8.5}
      y={props.y - 16.5}
      width={IMG_WIDTH}
      height={IMG_HEIGHT}
      style={{ cursor: 'pointer' }}
    />
  )
}

function TooltipContent(props: TooltipProps<ValueType, NameType>) {
  const { payload }: { payload?: Array<{ payload?: DataPoint }> } = props
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicInsights' })
  const { token } = useToken()
  const data = payload?.[0]?.payload
  return (
    <Flex
      vertical
      gap={0}
      style={{
        borderRadius: 8,
        border: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgBase,
        height: 'fit-content',
        padding: 10,
      }}
      justify='space-between'
    >
      <div style={{ marginBottom: 5 }}>
        <u>{data?.name}</u>
      </div>
      <div>
        {data?.bestUpgraded?.length != 0 && (
          <>
            <>{t('UpgradedStats')}</>
            <>{data?.bestUpgraded.join(' / ')}</>
          </>
        )}
      </div>
      <div>
        {data?.bestAdded?.length != 0 && (
          <>
            <>{t('NewStats')}</>
            <>{data?.bestAdded.join(' / ')}</>
          </>
        )}
      </div>
    </Flex>
  )
}
