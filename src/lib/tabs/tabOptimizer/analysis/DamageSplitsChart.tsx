import { AxisBottom, AxisLeft } from '@visx/axis'
import { Group } from '@visx/group'
import { LegendOrdinal } from '@visx/legend'
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale'
import { BarStackHorizontal } from '@visx/shape'
import { SeriesPoint } from '@visx/shape/lib/types'
import { defaultStyles, Tooltip, withTooltip } from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import chroma from 'chroma-js'
import { DamageBreakdown, DefaultActionDamageValues } from 'lib/optimization/computedStatsArray'
import { number } from 'prop-types'
import React from 'react'

type DamageBreakdownKeys =
  'abilityDmg' |
  'breakDmg' |
  'superBreakDmg' |
  'additionalDmg' |
  'trueDmg' |
  'jointDmg'

const keys: DamageBreakdownKeys[] = [
  'abilityDmg',
  'additionalDmg',
  'superBreakDmg',
  'jointDmg',
  'trueDmg',
  'breakDmg',
]

type TooltipData = {
  bar: SeriesPoint<DamageBreakdown>
  key: DamageBreakdownKeys
  index: number
  height: number
  width: number
  x: number
  y: number
  color: string
}

export type BarStackHorizontalProps = {
  width: number
  height: number
  data: DamageBreakdown[]
  margin?: { top: number; right: number; bottom: number; left: number }
  events?: boolean
}

const darkBackground = '#243356'
const darkAxisColor = '#CCCCCC'
const darkTooltipBackground = 'rgba(255, 255, 255, 0.9)'
const barColors = chroma.scale('Paired').colors(6)
const defaultMargin = { top: 50, left: 50, right: 40, bottom: 50 }
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: darkTooltipBackground,
  color: '#000',
}

const getAbilityName = (d: DamageBreakdown) => d.name

const colorScale = scaleOrdinal<DamageBreakdownKeys, string>({
  domain: keys,
  range: barColors,
})

let tooltipTimeout: number

export default withTooltip<BarStackHorizontalProps, TooltipData>(
  ({
    width,
    height,
    data,
    events = false,
    margin = defaultMargin,
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  }: BarStackHorizontalProps & WithTooltipProvidedProps<TooltipData>) => {
    const xMax = width - margin.left - margin.right
    const yMax = height - margin.top - margin.bottom

    let maxValue = 0
    data.sort((a, b) => {
      const sumA = Object.values(a)
        .filter((value): value is number => typeof value === 'number')
        .reduce((n, store) => n + store, 0)

      const sumB = Object.values(b)
        .filter((value): value is number => typeof value === 'number')
        .reduce((n, store) => n + store, 0)

      if (sumA > maxValue) maxValue = sumA
      if (sumB > maxValue) maxValue = sumB

      return sumB - sumA
    })

    const abilityScale = scaleBand<string>({
      domain: data.map(getAbilityName),
      range: [0, 250],
    })

    const damageScale = scaleLinear<number>({
      domain: [0, maxValue],
      nice: true,
    })

    damageScale.rangeRound([0, xMax])

    const tickValues = damageScale.ticks(5)

    return (
      <div>
        <svg width={width} height={height}>
          <rect width={width} height={height} fill={darkBackground} rx={8}/>
          <Group top={margin.top} left={margin.left}>
            <BarStackHorizontal<DamageBreakdown, DamageBreakdownKeys>
              data={data}
              keys={keys}
              height={yMax}
              y={getAbilityName}
              xScale={damageScale}
              yScale={abilityScale}
              color={colorScale}
            >
              {(barStacks) =>
                barStacks.map((barStack) =>
                  barStack.bars.map((bar) => (
                    <rect
                      key={`barstack-horizontal-${barStack.index}-${bar.index}`}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={bar.height}
                      fill={bar.color}
                      onMouseLeave={() => {
                        tooltipTimeout = window.setTimeout(() => {
                          hideTooltip()
                        }, 300)
                      }}
                      onMouseMove={() => {
                        if (tooltipTimeout) clearTimeout(tooltipTimeout)
                        const top = bar.y + margin.top
                        const left = bar.x + bar.width + margin.left
                        showTooltip({
                          tooltipData: bar,
                          tooltipTop: top,
                          tooltipLeft: left,
                        })
                      }}
                    />
                  )),
                )}
            </BarStackHorizontal>
            <AxisLeft
              hideAxisLine
              hideTicks
              scale={abilityScale}
              tickFormat={(key) => dataKeyToDisplay[key as keyof DefaultActionDamageValues]}
              stroke={darkAxisColor}
              tickStroke={darkAxisColor}
              tickLabelProps={{
                fill: darkAxisColor,
                fontSize: 11,
                textAnchor: 'end',
                dy: '0.33em',
              }}
            />
            <AxisBottom
              top={yMax}
              scale={damageScale}
              tickValues={tickValues}
              stroke={darkAxisColor}
              tickStroke={darkAxisColor}
              tickLabelProps={{
                fill: darkAxisColor,
                fontSize: 11,
                textAnchor: 'middle',
              }}
            />
          </Group>
        </svg>
        <div
          style={{
            position: 'absolute',
            top: margin.top / 2 - 10,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontSize: '14px',
            color: darkAxisColor,
          }}
        >
          <LegendOrdinal
            scale={colorScale}
            direction='row'
            labelFlex={1}
            labelMargin='0 15px 0 0'
            labelFormat={(key) => tooltipDataKeyToDisplay[key]}
          />
        </div>

        {tooltipOpen && tooltipData && (
          <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
            <div style={{ color: colorScale(tooltipData.key) }}>
              <strong>{tooltipDataKeyToDisplay[tooltipData.key] + ' DMG'}</strong>
            </div>
            <div>{tooltipData.bar.data[tooltipData.key].toFixed(0)}</div>
          </Tooltip>
        )}
      </div>
    )
  },
)

const tooltipDataKeyToDisplay = {
  abilityDmg: 'Ability',
  breakDmg: 'Break',
  superBreakDmg: 'Super Break',
  additionalDmg: 'Additional',
  trueDmg: 'True',
  jointDmg: 'Joint',
}

const dataKeyToDisplay = {
  BASIC_DMG: 'Basic',
  SKILL_DMG: 'Skill',
  ULT_DMG: 'Ult',
  FUA_DMG: 'Fua',
  DOT_DMG: 'Dot',
  BREAK_DMG: 'Break',
}
