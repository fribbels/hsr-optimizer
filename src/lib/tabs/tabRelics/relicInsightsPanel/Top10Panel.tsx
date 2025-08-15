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
import { TsUtils } from 'lib/utils/TsUtils'
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Cell,
  ErrorBar,
  Legend,
  Scatter,
  ScatterChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { CategoricalChartState } from 'recharts/types/chart/types'
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { CharacterId } from 'types/character'

const { useToken } = theme

const N_Displayed = 10

const LEGEND_WIDTH = 273
const CHART_WIDTH = 320 + LEGEND_WIDTH

type DataPoint = {
  name: string,
  id: CharacterId,
  owned: boolean,
  y: number,
  x: number,
  errX: [number, number],
}

export const Top10Panel = React.memo(({ scores }: PanelProps) => {
  const { token } = useToken()

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
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <ScatterChart
        width={CHART_WIDTH}
        height={278}
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
        <Tooltip content={<TooltipContent />} />
        <Legend align='right' verticalAlign='middle' width={LEGEND_WIDTH} content={<LegendContent scores={sortedScores} />} />
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

function LegendContent({ scores }: PanelProps) {
  return (
    <div
      style={{ marginLeft: 20, marginTop: 3, height: 250 }}
    >
      {scores.map((s, idx) => (
        <Flex
          gap={5}
          key={s.id}
          style={{ height: 25.3 }}
        >
          {idx + '.'}
          <svg height={25} width={10}>
            <rect height={10} width={10} fill={idxToColour(idx)} x={0} y={5} />
          </svg>
          <img
            src={Assets.getCharacterAvatarById(s.id)}
            width={20}
            height={20}
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

function TooltipContent(props: TooltipProps<ValueType, NameType>) {
  const { payload }: { payload?: Array<{ payload?: DataPoint }> } = props
  const { token } = useToken()
  const { t } = useTranslation('relicsTab', { keyPrefix: 'RelicInsights' })
  const data = payload?.[0]?.payload
  if (!data) return <></>
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
      <u>{data.name}</u>
      <div>
        <>
          <>{t('AvgPotential')}{TsUtils.precisionRound(data.x, 1)}%</>
        </>
      </div>
    </Flex>
  )
}

function onClick(id: CharacterId) {
  return () => {
    window.store.getState().setScoringAlgorithmFocusCharacter(id)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }
}

function idxToColour(idx: number) {
  return `hsl(${idx * 360 / (1 + N_Displayed)}, 50%, 50%)`
}
