import { CellClassParams } from 'ag-grid-community'
import type { GlobalToken } from 'antd/es/theme/interface'
import { SubStats } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { ScoredRelic } from 'lib/relics/scoreRelics'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import tinygradient from 'tinygradient'

export type GridAggregations = {
  min: Record<string, number>,
  max: Record<string, number>,
}

const optimizerGridGradient = tinygradient([
  { color: '#5A1A06', pos: 0 }, // red
  { color: '#343127', pos: 0.35 },
  { color: '#38821F', pos: 1 }, // green
])

// this default is overwritten on page load, Gradient.setToken() in App.tsx
let relicGridGradient = tinygradient('#343127', '#38821F')

const relicColumnRanges = {
  'augmentedStats.HP': 169.35,
  'augmentedStats.ATK': 84.675,
  'augmentedStats.DEF': 84.675,
  'augmentedStats.SPD': 10,
  'augmentedStats.ATK%': 0.1728,
  'augmentedStats.HP%': 0.1728,
  'augmentedStats.DEF%': 0.216,
  'augmentedStats.CRIT Rate': 0.1296,
  'augmentedStats.CRIT DMG': 0.2592,
  'augmentedStats.Effect Hit Rate': 0.1728,
  'augmentedStats.Effect RES': 0.1728,
  'augmentedStats.Break Effect': 0.2592,
  'cv': 0.40,
  'weights.current': 64.8,
  'weights.potentialSelected.averagePct': 100,
  'weights.potentialSelected.bestPct': 100,
  'weights.potentialAllAll': 100,
  'weights.rerollAvgSelectedDelta': 40,
} as const

export const Gradient = {
  getColor: (decimal: number, gradient: tinygradient.Instance) => {
    return gradient.rgbAt(decimal).toHexString()
  },

  getOptimizerColumnGradient: (params: CellClassParams<OptimizerDisplayDataStatSim, number>) => {
    const aggregations = OptimizerTabController.getAggregations()

    try {
      const colId = params.column.getColId()

      const columnsToAggregate = OptimizerTabController.getColumnsToAggregateMap() as Record<string, boolean>
      if (params.data && aggregations && columnsToAggregate[colId]) {
        const min = aggregations.min[colId]
        const max = aggregations.max[colId]
        const value = params.value!

        let range = (value - min) / (max - min)
        if (max == min) {
          range = 0.5
        }

        const color = Gradient.getColor(Math.min(Math.max(range, 0), 1), optimizerGridGradient)
        return {
          backgroundColor: color,
        }
      }
    } catch (e) {
      console.error(e)
    }
  },

  setTheme(colorTheme: ColorThemeOverrides) {
    relicGridGradient = tinygradient(colorTheme.colorBgBase, colorTheme.colorPrimary)
  },

  setToken(token: GlobalToken) {
    relicGridGradient = tinygradient(token.colorBgElevated, token.colorPrimaryHover)
  },

  getRelicGradient(params: CellClassParams<ScoredRelic>) {
    const col = params.column.getColId()
    const value = params.value

    if (isNaN(value) || value == 0) {
      return
    }

    let range: number
    if (col == 'weights.rerollAvgSelectedDelta') {
      range = value / 40
    } else if (col.startsWith('weights.potential') || col.startsWith('weights.reroll')) {
      range = value / 100
    } else if (col.startsWith('weights.')) {
      range = value / (6.48 * 9)
    } else {
      range = value / relicColumnRanges[col as `augmentedStats.${SubStats}` | 'cv']
    }

    const color = Gradient.getColor(Math.min(Math.max(range, 0), 1), relicGridGradient)

    return {
      backgroundColor: color,
    }
  },
}
