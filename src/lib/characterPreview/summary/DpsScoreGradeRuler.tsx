import { SimScoreGrades } from 'lib/scoring/characterScorer'
import { renderThousandsK } from 'lib/tabs/tabOptimizer/analysis/DamageSplitsChart'
import React from 'react'
import { Bar, BarChart, Label, ReferenceLine, XAxis, YAxis } from 'recharts'

const liftedGrades: Record<string, boolean> = {
  'WTF+': true,
  'SSS+': true,
  'SS+': true,
  'S+': true,
  'A+': true,
  'B+': true,
  'C+': true,
  'D+': true,
  'F+': true,
}

export function DpsScoreGradeRuler(props: {
  score: number
  maximum: number
  benchmark: number
  minimum: number
}) {
  const { maximum, benchmark, minimum } = props
  const score = Math.min(maximum, Math.max(props.score, minimum))
  const id = Math.random()

  const sortedGrades = Object.entries(SimScoreGrades)
    .sort((a, b) => b[1] - a[1])

  const calculateScaledPosition = (gradeValue: number) => {
    const percentOfBenchmark = gradeValue / 100

    if (gradeValue <= 100) {
      // Scale between minimum (0%) and benchmark (100%)
      return minimum + (benchmark - minimum) * (percentOfBenchmark)
    } else {
      // Scale between benchmark (100%) and maximum (200%)
      const percentAboveBenchmark = (gradeValue - 100) / 100
      return benchmark + (maximum - benchmark) * percentAboveBenchmark
    }
  }

  const data = [{
    name: 'Score',
    value: score,
  }]

  const strokeColor = '#666'
  const labelColor = '#999'

  const CHART_WIDTH = 1060
  const CHART_HEIGHT = 150

  const margin = {
    top: 45,
    right: 20,
    left: 20,
    bottom: 55,
  }

  const low = 10
  const high = 28
  const lift = 36

  const chartAreaWidth = CHART_WIDTH - margin.left - margin.right

  const gradient0 = '#FF6355dd'
  const gradient50 = '#faf742dd'
  const gradient75 = '#b0fa42dd'
  const gradient100 = '#75ec46dd'
  const gradient125 = '#17D553dd'
  const gradient150 = '#23BBFFdd'
  const gradient175 = '#9F50FFdd'
  const gradient200 = '#BC38FFdD'

  const offset0 = '0%'
  const offset50 = `${(benchmark - minimum) / 2 / (maximum - minimum) * 100}%`
  const offset75 = `${(benchmark - minimum) * (3 / 4) / (maximum - minimum) * 100}%`
  const offset100 = `${(benchmark - minimum) / (maximum - minimum) * 100}%`
  const offset125 = `${((maximum - benchmark) / 4 + (benchmark - minimum)) / (maximum - minimum) * 100}%`
  const offset150 = `${((maximum - benchmark) / 2 + (benchmark - minimum)) / (maximum - minimum) * 100}%`
  const offset175 = `${((maximum - benchmark) * (3 / 4) + (benchmark - minimum)) / (maximum - minimum) * 100}%`
  const offset200 = '100%'

  return (
    <div style={{ width: 1060 }}>
      <BarChart
        layout='vertical'
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={data}
        margin={margin}
        barSize={20}
      >
        <XAxis
          type='number'
          domain={[minimum, maximum]}
          tick={false}
          tickLine={false}
          axisLine={{ stroke: '#777', strokeWidth: 1 }}
        />
        <YAxis
          type='category'
          tick={false}
          axisLine={false}
          width={0}
          height={10}
        />
        <defs>
          <linearGradient id={`gradient${id}`} x1='0%' y1='0%' x2='100%' y2='0%' gradientUnits='userSpaceOnUse'>
            <stop offset={offset0} stopColor={gradient0}/>
            <stop offset={offset50} stopColor={gradient50}/>
            <stop offset={offset75} stopColor={gradient75}/>
            <stop offset={offset100} stopColor={gradient100}/>
            <stop offset={offset125} stopColor={gradient125}/>
            <stop offset={offset150} stopColor={gradient150}/>
            <stop offset={offset175} stopColor={gradient175}/>
            <stop offset={offset200} stopColor={gradient200}/>
          </linearGradient>
        </defs>

        <rect
          x={margin.left}
          y={margin.top}
          width={chartAreaWidth}
          height={20}
          fill={`url(#gradient${id})`}
          opacity={0.15}
        />

        <Bar
          dataKey='value'
          minPointSize={5}
          isAnimationActive={false}
          fill={`url(#gradient${id})`}
        />
        <ReferenceLine x={score} stroke='#fff' strokeWidth={4}/>
        <ReferenceLine x={maximum} stroke={strokeColor} strokeWidth={1}>
          <Label value='200%' position='bottom' fontSize={12} offset={low} fill={labelColor}/>
          <Label value={`${renderThousandsK(maximum)}`} position='top' fontSize={12} offset={high} fill={labelColor}/>
          <Label value='DMG' position='top' fontSize={12} offset={low} fill={labelColor}/>
        </ReferenceLine>
        <ReferenceLine x={benchmark} stroke={strokeColor} strokeWidth={1}>
          <Label value={`${renderThousandsK(benchmark)}`} position='top' fontSize={12} offset={high} fill={labelColor}/>
          <Label value='DMG' position='top' fontSize={12} offset={low} fill={labelColor}/>
        </ReferenceLine>
        <ReferenceLine x={minimum} stroke={strokeColor} strokeWidth={1}>
          <Label value='0%' position='bottom' fontSize={12} offset={low} fill={labelColor}/>
          <Label value={`${renderThousandsK(minimum)}`} position='top' fontSize={12} offset={high} fill={labelColor}/>
          <Label value='DMG' position='top' fontSize={12} offset={low} fill={labelColor}/>
        </ReferenceLine>
        {sortedGrades.map(([grade, gradeScore]) => {
          const scaledPosition = calculateScaledPosition(gradeScore)
          return (
            <ReferenceLine key={grade} x={scaledPosition} stroke={strokeColor} strokeWidth={1}>
              {
                liftedGrades[grade]
                  ? (
                    <>
                      <Label value={grade} position='bottom' fontSize={12} offset={lift + low} fill={labelColor}/>
                      <Label value={`${gradeScore}%`} position='bottom' fontSize={11} offset={lift + high} fill={labelColor}/>
                    </>
                  )
                  : (
                    <>
                      <Label value={grade} position='bottom' fontSize={12} offset={low} fill={labelColor}/>
                      <Label value={`${gradeScore}%`} position='bottom' fontSize={11} offset={high} fill={labelColor}/>
                    </>
                  )
              }
            </ReferenceLine>
          )
        })}
      </BarChart>
    </div>
  )
}
