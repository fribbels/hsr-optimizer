// import { AxisBottom, AxisLeft } from '@visx/axis'
// import { Group } from '@visx/group'
// import { LegendOrdinal } from '@visx/legend'
// import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale'
// import { BarStackHorizontal } from '@visx/shape'
// import { SeriesPoint } from '@visx/shape/lib/types'
// import { defaultStyles, Tooltip, withTooltip } from '@visx/tooltip'
// import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
// import chroma from 'chroma-js'
// import { DamageBreakdown, DefaultActionDamageValues } from 'lib/optimization/computedStatsArray'
// import React from 'react'
//
// type DamageBreakdownKeys = Exclude<keyof DamageBreakdown, 'name'>
//
// const keys: DamageBreakdownKeys[] = [
//   'abilityDmg',
//   'dotDmg',
//   'superBreakDmg',
//   'jointDmg',
//   'memoDmg',
//   'additionalDmg',
//   'breakDmg',
//   'trueDmg',
// ]
//
// type TooltipData = {
//   bar: SeriesPoint<DamageBreakdown>
//   key: DamageBreakdownKeys
//   index: number
//   height: number
//   width: number
//   x: number
//   y: number
//   color: string
// }
//
// export type BarStackHorizontalProps = {
//   width: number
//   height: number
//   data: DamageBreakdown[]
//   margin?: { top: number; right: number; bottom: number; left: number }
//   events?: boolean
// }
//
// const darkBackground = '#243356'
// const darkAxisColor = '#CCCCCC'
// const darkTooltipBackground = 'rgb(69,93,154)'
// const barColors = chroma.scale('Paired').colors(9).map((color) => chroma(color).desaturate(0.5).hex())
//
// const defaultMargin = { top: 70, left: 70, right: 70, bottom: 70 }
// const tooltipStyles = {
//   ...defaultStyles,
//   minWidth: 60,
//   backgroundColor: darkTooltipBackground,
//   color: '#fff',
// }
//
// const getAbilityName = (d: DamageBreakdown) => d.name
//
// let tooltipTimeout: number
//
// export default withTooltip<BarStackHorizontalProps, TooltipData>(
//   ({
//     width,
//     height,
//     data,
//     events = false,
//     margin = defaultMargin,
//     tooltipOpen,
//     tooltipLeft,
//     tooltipTop,
//     tooltipData,
//     hideTooltip,
//     showTooltip,
//   }: BarStackHorizontalProps & WithTooltipProvidedProps<TooltipData>) => {
//     const xMax = width - margin.left - margin.right
//     const yMax = height - margin.top - margin.bottom
//
//     const filteredData = data.filter((row) =>
//       keys.some((key) => row[key] !== 0), // Keep only rows with non-zero values
//     )
//
//     let maxValue = 0
//     filteredData.sort((a, b) => {
//       const sumA = Object.values(a)
//         .filter((value): value is number => typeof value === 'number')
//         .reduce((n, store) => n + store, 0)
//
//       const sumB = Object.values(b)
//         .filter((value): value is number => typeof value === 'number')
//         .reduce((n, store) => n + store, 0)
//
//       if (sumA > maxValue) maxValue = sumA
//       if (sumB > maxValue) maxValue = sumB
//
//       return sumB - sumA
//     })
//
//     // Uncomment to hide unused dmg values
//     // const activeKeys = keys.filter((key) => filteredData.some((row) => row[key] !== 0))
//     const activeKeys = keys
//
//     const colorScale = scaleOrdinal({
//       domain: activeKeys,
//       range: barColors.slice(0, activeKeys.length),
//     })
//
//     const abilityScale = scaleBand<string>({
//       domain: filteredData.map(getAbilityName),
//       range: [0, 250],
//       padding: 0.3,
//     })
//
//     const damageScale = scaleLinear<number>({
//       domain: [0, maxValue],
//       nice: true,
//     })
//
//     damageScale.rangeRound([0, xMax])
//
//     const tickValues = damageScale.ticks(5)
//
//     return (
//       <div>
//         <svg width={width} height={height}>
//           <rect width={width} height={height} fill={darkBackground} rx={8}/>
//           <Group top={margin.top} left={margin.left}>
//             <BarStackHorizontal<DamageBreakdown, DamageBreakdownKeys>
//               data={filteredData}
//               keys={activeKeys}
//               height={yMax}
//               y={getAbilityName}
//               xScale={damageScale}
//               yScale={abilityScale}
//               color={colorScale}
//             >
//               {(barStacks) =>
//                 barStacks.map((barStack) =>
//                   barStack.bars.map((bar) => (
//                     <rect
//                       key={`barstack-horizontal-${barStack.index}-${bar.index}`}
//                       x={bar.x}
//                       y={bar.y}
//                       width={bar.width}
//                       height={bar.height}
//                       fill={bar.color}
//                       onMouseLeave={() => {
//                         tooltipTimeout = window.setTimeout(() => {
//                           hideTooltip()
//                         }, 300)
//                       }}
//                       onMouseMove={() => {
//                         if (tooltipTimeout) clearTimeout(tooltipTimeout)
//                         const top = bar.y + margin.top
//                         const left = bar.x + bar.width + margin.left
//                         showTooltip({
//                           tooltipData: bar,
//                           tooltipTop: top,
//                           tooltipLeft: left,
//                         })
//                       }}
//                     />
//                   )),
//                 )}
//             </BarStackHorizontal>
//             <AxisLeft
//               hideAxisLine
//               hideTicks
//               scale={abilityScale}
//               tickFormat={(key) => dataKeyToDisplay[key as keyof DefaultActionDamageValues]}
//               stroke={darkAxisColor}
//               tickStroke={darkAxisColor}
//               tickLabelProps={{
//                 fill: darkAxisColor,
//                 fontSize: 11,
//                 textAnchor: 'end',
//                 dy: '0.33em',
//               }}
//             />
//             <AxisBottom
//               top={yMax}
//               scale={damageScale}
//               tickFormat={(n) => `${Number(n) / 1000}K`}
//               tickValues={tickValues}
//               stroke={darkAxisColor}
//               tickStroke={darkAxisColor}
//               tickLabelProps={{
//                 fill: darkAxisColor,
//                 fontSize: 11,
//                 textAnchor: 'middle',
//               }}
//             />
//           </Group>
//         </svg>
//         <div
//           style={{
//             position: 'absolute',
//             top: margin.top / 2 - 5,
//             display: 'flex',
//             width: '100%',
//             justifyContent: 'center',
//             fontSize: '12px',
//             color: darkAxisColor,
//             paddingLeft: 30,
//             paddingRight: 30,
//           }}
//         >
//           <LegendOrdinal
//             scale={colorScale}
//             direction='row'
//             labelFlex={1}
//             labelMargin='0 15px 0 0'
//             labelFormat={(key) => tooltipDataKeyToDisplay[key]}
//           />
//         </div>
//
//         {tooltipOpen && tooltipData && (
//           <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
//             <strong>{tooltipDataKeyToDisplay[tooltipData.key] + ' DMG'}</strong>
//             <div>{tooltipData.bar.data[tooltipData.key].toFixed(0)}</div>
//           </Tooltip>
//         )}
//       </div>
//     )
//   },
// )
//
// const tooltipDataKeyToDisplay: Record<DamageBreakdownKeys, string> = {
//   abilityDmg: 'Ability',
//   breakDmg: 'Break',
//   superBreakDmg: 'Super Break',
//   additionalDmg: 'Additional',
//   trueDmg: 'True',
//   jointDmg: 'Joint',
//   dotDmg: 'Dot',
//   memoDmg: 'Memo',
// }
//
// const dataKeyToDisplay = {
//   BASIC_DMG: 'Basic',
//   SKILL_DMG: 'Skill',
//   ULT_DMG: 'Ult',
//   FUA_DMG: 'Fua',
//   DOT_DMG: 'Dot',
//   BREAK_DMG: 'Break',
//   MEMO_SKILL_DMG: 'Skillᴹ',
// }
