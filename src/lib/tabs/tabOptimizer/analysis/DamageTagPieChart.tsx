import { ChartTooltipContainer, ChartTooltipContent, useChartTooltip } from 'lib/tabs/tabOptimizer/analysis/ChartTooltip'
import {
  chartColor,
  extractDamageByTag,
} from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import type { DamageTagSlice } from 'lib/tabs/tabOptimizer/analysis/damageSplitsExtractor'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import { useMemo, useState } from 'react'

import {
  Pie,
  PieChart,
} from 'recharts'

const PIE_SIZE = 260

export function DamageTagPieChart({ analysis }: {
  analysis: OptimizerResultAnalysis
}) {
  const { newX, context } = analysis
  const actions = context.rotationActions.length > 0 ? context.rotationActions : context.defaultActions

  const [hoveredSlice, setHoveredSlice] = useState<DamageTagSlice | null>(null)
  const { containerRef, tooltipRef, handleMouseMove } = useChartTooltip()

  const slices = useMemo(
    () => extractDamageByTag(newX, actions),
    [newX, actions],
  )

  if (slices.length === 0) return null

  const grandTotal = slices.reduce((s, sl) => s + sl.value, 0)

  return (
    <div
      className='pre-font'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        background: 'var(--layer-2)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-card-flat)',
        borderRadius: 6,
        padding: '12px 16px',
        overflow: 'hidden',
      }}
    >
      <span style={{ fontSize: 15, color: chartColor, borderBottom: '1px solid var(--border-default)', paddingBottom: 4 }}>
        Combo Distribution
      </span>

      <div ref={containerRef} style={{ position: 'relative' }} onMouseMove={handleMouseMove}>
        <PieChart width={PIE_SIZE} height={PIE_SIZE}>
          <Pie
            data={slices}
            dataKey='value'
            nameKey='label'
            cx='50%'
            cy='50%'
            outerRadius={110}
            innerRadius={45}
            cornerRadius={2}
            startAngle={90}
            endAngle={-270}
            stroke='var(--layer-2)'
            strokeWidth={2}
            isAnimationActive={false}
            style={{ cursor: 'default' }}
            onMouseEnter={(_, index) => setHoveredSlice(slices[index])}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        </PieChart>

        <ChartTooltipContainer tooltipRef={tooltipRef} visible={!!hoveredSlice}>
          {hoveredSlice && (
            <ChartTooltipContent>
              <span style={{ fontSize: 14, fontWeight: 'bold' }}>{hoveredSlice.label}</span>
              <span>{localeNumberComma(Math.floor(hoveredSlice.value))}</span>
              <span>{`${(hoveredSlice.percent * 100).toFixed(1)}%`}</span>
            </ChartTooltipContent>
          )}
        </ChartTooltipContainer>
      </div>

      <table style={{
        alignSelf: 'stretch',
        borderCollapse: 'collapse',
        marginTop: -4,
      }}>
        <thead>
          <tr>
            <th style={{ paddingBottom: 6, width: '100%' }} />
            <th style={{ textAlign: 'right', fontWeight: 400, fontSize: 12, color: '#6b7d99', paddingBottom: 6, width: '1%', whiteSpace: 'nowrap' }}>
              #
            </th>
            <th style={{ textAlign: 'right', fontWeight: 400, fontSize: 12, color: '#6b7d99', paddingBottom: 6, paddingLeft: 20, width: '1%', whiteSpace: 'nowrap' }}>
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.damageType}>
              <td style={{ paddingTop: 4, paddingBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: slice.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: chartColor }}>{slice.label}</span>
                </div>
              </td>
              <td style={{ textAlign: 'right', fontSize: 13, color: chartColor, paddingTop: 4, paddingBottom: 4 }}>
                {localeNumberComma(Math.floor(slice.value))}
              </td>
              <td style={{ textAlign: 'right', fontSize: 13, color: '#8899aa', paddingTop: 4, paddingBottom: 4, paddingLeft: 20 }}>
                {(slice.percent * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td style={{ paddingTop: 6, borderTop: '1px solid var(--border-default)' }}>
              <span style={{ fontSize: 13, color: '#8899aa', paddingLeft: 18 }}>Total</span>
            </td>
            <td style={{ textAlign: 'right', fontSize: 13, color: chartColor, paddingTop: 6, borderTop: '1px solid var(--border-default)' }}>
              {localeNumberComma(Math.floor(grandTotal))}
            </td>
            <td style={{ textAlign: 'right', fontSize: 13, color: '#8899aa', paddingTop: 6, borderTop: '1px solid var(--border-default)', paddingLeft: 20 }}>
              100.0%
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
