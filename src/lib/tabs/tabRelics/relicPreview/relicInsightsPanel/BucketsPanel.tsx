import {
  Button,
  Flex,
  theme,
} from 'antd'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { PanelProps } from 'lib/tabs/tabRelics/relicPreview/relicInsightsPanel/RelicInsightsPanel'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  DefaultTooltipContentProps,
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

export function BucketsPanel({ scores }: PanelProps) {
  const { token } = useToken()
  const [tooltipActive, setTooltipActive] = useState(false)
  let timeout: NodeJS.Timeout
  const buckets = Array<Bucket>(10)
  scores.filter((x) => {
    return true
  })
    .forEach((score) => {
      const bucketIndex = Math.min(9, Math.max(0, Math.floor(score.score.bestPct / 10)))
      let bucket = buckets[bucketIndex]
      if (!bucket) {
        buckets[bucketIndex] = []
        bucket = buckets[bucketIndex]
      }
      bucket.push(score)
    })

  const longestBucket = Math.max(...buckets.flatMap((b) => b.length))

  const data: Array<DataPoint> = buckets.flatMap((bucket, bucketIdx) =>
    bucket.map((score, scoreIdx) => ({
      x: (scoreIdx + 0.5) / longestBucket,
      y: bucketIdx,
      name: score.name,
      id: score.id,
      bestAdded: score.score.meta.bestAddedStats,
      bestUpgraded: score.score.meta.bestUpgradedStats,
    }))
  )

  const onMouseEnterScatter = () => {
    clearTimeout(timeout)
    setTooltipActive(true)
  }

  const onMouseLeaveScatter = () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => setTooltipActive(false), 100)
  }

  const onScatterClick = (data: DataPoint) => {
    window.store.getState().setScoringAlgorithmFocusCharacter(data.id)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  return (
    <>
      <Flex
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
            right: 5,
            bottom: 20,
            left: -10,
          }}
        >
          <XAxis dataKey='x' type='number' hide />
          <YAxis
            dataKey='y'
            tickFormatter={(val) => `${val * 10}%+`}
            domain={[0, 9]}
            tickCount={10}
            tick={{ fill: '#cfcfcf' }} // pure white felt blinding lol
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
      </Flex>
    </>
  )
}

function ShapeFunction(untypedProps: unknown) {
  const props = untypedProps as Bucket[number] & { x: number, y: number }
  return (
    <image
      href={Assets.getCharacterAvatarById(props.id)}
      x={props.x - 8.5}
      y={props.y - 16.5}
      width={26}
      height={39}
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
      <u>{data?.name}</u>
      <div>
        {data?.bestUpgraded?.length != 0 && (
          <>
            <>{t('UpgradedStats')}</>
            <>{data?.bestUpgraded.join('/')}</>
          </>
        )}
      </div>
      <div>
        {data?.bestAdded?.length != 0 && (
          <>
            <>{t('NewStats')}</>
            <>{data?.bestAdded.join('/')}</>
          </>
        )}
      </div>
    </Flex>
  )
}
