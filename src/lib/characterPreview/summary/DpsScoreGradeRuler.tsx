import { Utils } from 'lib/utils/utils'
import React from 'react'
import { Bar, BarChart, Label, ReferenceLine, XAxis, YAxis } from 'recharts'

const DpsScoreGradeRuler = (props: {
  score: number
  percent: number
  maximum: number
  benchmark: number
  minimum: number
}) => {
  const { percent, maximum, benchmark, minimum } = props
  const score = Math.max(props.score, minimum)

  console.log('---')
  console.log(score)
  console.log(props.benchmark)
  console.log(props.maximum)

  const SimScoreGrades = {
    'AEON': 150, // Verified only
    'WTF+': 140, // +10
    'WTF': 130, // +9
    'SSS+': 121, // +8
    'SSS': 113, // +7
    'SS+': 106, // +6
    'SS': 100, // Benchmark
    'S+': 95,
    'S': 90,
    'A+': 85,
    'A': 80,
    'B+': 75,
    'B': 70,
    'C+': 65,
    'C': 60,
    'D+': 55,
    'D': 50,
    'F+': 45,
    'F': 40,
  }

  const liftPixels = 36
  const liftedGrades: Record<string, number> = {
    'WTF+': 140, // +10
    'SSS+': 121, // +8
    'SS+': 106, // +6
    'S+': 95,
    'A+': 85,
    'B+': 75,
    'C+': 65,
    'D+': 55,
    'F+': 45,
  }

  // Sort grades by score value (highest to lowest)
  const sortedGrades = Object.entries(SimScoreGrades)
    .sort((a, b) => b[1] - a[1])

  // Calculate the position of each grade on the new scale
  const calculateScaledPosition = (gradeValue: number) => {
    // Calculate as percentage relative to benchmark (100%)
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

  // Create a single data point to match user's score
  const data = [{
    name: 'Score',
    value: score,
  }]

  // Find user's grade
  let userGrade = 'N/A'
  for (let i = 0; i < sortedGrades.length; i++) {
    const currentGrade = sortedGrades[i][0]
    const currentGradeScore = sortedGrades[i][1]
    const nextGradeScore = i < sortedGrades.length - 1 ? sortedGrades[i + 1][1] : 0

    if (score >= calculateScaledPosition(nextGradeScore) && score <= calculateScaledPosition(currentGradeScore)) {
      userGrade = currentGrade
      break
    }
  }

  const CHART_WIDTH = 1060
  const CHART_HEIGHT = 170

  return (
    <div style={{ width: 1060, color: 'white' }}>
      <BarChart
        layout='vertical'
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={data}
        margin={{
          top: 60,
          right: 20,
          left: 20,
          bottom: 60,
        }}
        barSize={20}
      >
        <XAxis
          type='number'
          domain={[minimum, maximum]}
          // domain={[0, maximum]}
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
          <linearGradient id='colorGradient' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='rgb(255, 0, 0)'/>
            <stop offset='50%' stopColor='rgb(255, 255, 0)'/>
            <stop offset='100%' stopColor='rgb(0, 255, 0)'/>
          </linearGradient>
        </defs>
        <Bar
          dataKey='value'
          minPointSize={5}
          isAnimationActive={false}
          fill='url(#colorGradient)'
        />
        <ReferenceLine x={score} stroke='#fff' strokeWidth={4}>
          <Label value='Score' position='top' fontSize={12} offset={10 + 20}/>
          <Label value={`${Utils.truncate10ths(percent * 100)}%`} position='top' fontSize={12} offset={10}/>
        </ReferenceLine>
        <ReferenceLine x={maximum} stroke='#777' strokeWidth={1}>
          <Label value='200%' position='bottom' fontSize={12} offset={10}/>
        </ReferenceLine>
        <ReferenceLine x={minimum} stroke='#777' strokeWidth={1}>
          <Label value='0%' position='bottom' fontSize={12} offset={10}/>
        </ReferenceLine>
        {sortedGrades.map(([grade, gradeScore]) => {
          const scaledPosition = calculateScaledPosition(gradeScore)
          return (
            <ReferenceLine
              key={grade}
              x={scaledPosition}
              stroke='#777'
              strokeWidth={1}
            >
              {
                liftedGrades[grade]
                  ? (
                    <>
                      <Label
                        value={grade}
                        position='bottom'
                        fontSize={12}
                        offset={10 + liftPixels}
                      />
                      <Label
                        value={`${gradeScore}%`}
                        position='bottom'
                        fontSize={11}
                        offset={26 + liftPixels}
                      />
                    </>
                  )
                  : (
                    <>
                      <Label
                        value={grade}
                        position='bottom'
                        fontSize={12}
                        offset={10}
                      />
                      <Label
                        value={`${gradeScore}%`}
                        position='bottom'
                        fontSize={11}
                        offset={26}
                      />
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

export default DpsScoreGradeRuler
