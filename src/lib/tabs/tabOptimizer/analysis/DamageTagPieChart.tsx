import { Flex } from 'antd'
import {
  chartColor,
  DamageTagSlice,
  extractDamageByTag,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React, { useMemo } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
} from 'recharts'

const PIE_SIZE = 260

function CustomTooltip(props: {
  active?: boolean
  payload?: { payload: DamageTagSlice }[]
}) {
  const { active, payload } = props
  if (!active || !payload?.[0]) return null

  const slice = payload[0].payload
  return (
    <Flex
      vertical
      className='pre-font'
      style={{ background: 'rgb(69,93,154)', padding: 8, borderRadius: 3 }}
    >
      <span style={{ fontSize: 14, fontWeight: 'bold' }}>{slice.label}</span>
      <span>{localeNumberComma(Math.floor(slice.value))}</span>
      <span>{`${(slice.percent * 100).toFixed(1)}%`}</span>
    </Flex>
  )
}

export function DamageTagPieChart(props: {
  analysis: OptimizerResultAnalysis
}) {
  const { newX, context } = props.analysis
  const actions = context.rotationActions.length > 0 ? context.rotationActions : context.defaultActions

  const slices = useMemo(
    () => extractDamageByTag(newX, actions),
    [newX, actions],
  )

  if (slices.length === 0) return null

  const grandTotal = slices.reduce((s, sl) => s + sl.value, 0)

  return (
    <Flex
      vertical
      align='center'
      className='pre-font'
      style={{
        flex: 1,
        background: '#243356',
        border: '1px solid #354b7d',
        boxShadow: cardShadowNonInset,
        borderRadius: 5,
        padding: '12px 16px',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 14, color: chartColor, borderBottom: '1px solid #354b7d', paddingBottom: 4 }}>
        Combo Distribution
      </span>

      <PieChart width={PIE_SIZE} height={PIE_SIZE}>
        <Pie
          data={slices}
          dataKey='value'
          nameKey='label'
          cx='50%'
          cy='50%'
          outerRadius={110}
          innerRadius={45}
          cornerRadius={3}
          stroke='#243356'
          strokeWidth={2}
          isAnimationActive={false}
          style={{ cursor: 'default' }}
        >
          {slices.map((slice) => (
            <Cell key={slice.damageType} fill={slice.color} style={{ cursor: 'default' }} />
          ))}
        </Pie>
        <Tooltip
          isAnimationActive={false}
          content={<CustomTooltip />}
        />
      </PieChart>

      <table style={{
        alignSelf: 'stretch',
        borderCollapse: 'collapse',
        marginTop: -4,
      }}>
        <thead>
          <tr>
            <th style={{ paddingBottom: 6 }} />
            <th style={{ textAlign: 'right', fontWeight: 400, fontSize: 12, color: '#6b7d99', paddingBottom: 6 }}>
              #
            </th>
            <th style={{ textAlign: 'right', fontWeight: 400, fontSize: 12, color: '#6b7d99', paddingBottom: 6, paddingLeft: 12 }}>
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.damageType}>
              <td style={{ paddingTop: 4, paddingBottom: 4 }}>
                <Flex align='center' gap={8}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: slice.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: chartColor }}>{slice.label}</span>
                </Flex>
              </td>
              <td style={{ textAlign: 'right', fontSize: 13, color: chartColor, paddingTop: 4, paddingBottom: 4 }}>
                {localeNumberComma(Math.floor(slice.value))}
              </td>
              <td style={{ textAlign: 'right', fontSize: 13, color: '#8899aa', paddingTop: 4, paddingBottom: 4, paddingLeft: 12 }}>
                {(slice.percent * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ paddingTop: 6, borderTop: '1px solid #354b7d' }}>
              <span style={{ fontSize: 13, color: '#8899aa', paddingLeft: 18 }}>Total</span>
            </td>
            <td style={{ textAlign: 'right', fontSize: 13, color: chartColor, paddingTop: 6, borderTop: '1px solid #354b7d' }}>
              {localeNumberComma(Math.floor(grandTotal))}
            </td>
            <td style={{ textAlign: 'right', fontSize: 13, color: '#8899aa', paddingTop: 6, borderTop: '1px solid #354b7d', paddingLeft: 12 }}>
              100.0%
            </td>
          </tr>
        </tfoot>
      </table>
    </Flex>
  )
}
