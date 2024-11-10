import type { GlobalToken } from 'antd/es/theme/interface'
import { ColorThemeOverrides } from 'lib/rendering/theme'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import tinygradient from 'tinygradient'

// FIXME MED

const optimizerGridGradient = tinygradient([
  { color: '#5A1A06', pos: 0 }, // red
  { color: '#343127', pos: 0.35 },
  { color: '#38821F', pos: 1 }, // green
])
let relicGridGradient = tinygradient('#343127', '#38821F')
let relicColumnRanges: {
  'augmentedStats.HP': number
  'augmentedStats.ATK': number
  'augmentedStats.DEF': number
  'augmentedStats.SPD': number
  'augmentedStats.ATK%': number
  'augmentedStats.HP%': number
  'augmentedStats.DEF%': number
  'augmentedStats.CRIT Rate': number
  'augmentedStats.CRIT DMG': number
  'augmentedStats.Effect Hit Rate': number
  'augmentedStats.Effect RES': number
  'augmentedStats.Break Effect': number
  'cv': number
  'weights.current': number
  'weights.potentialSelected.averagePct': number
  'weights.potentialSelected.bestPct': number
  'weights.potentialAllAll': number
}

type GridParams = {
  value: number
  data: object
  column: {
    colId: string
  }
}

export type GridAggregations = {
  minAgg: Record<string, number>
  maxAgg: Record<string, number>
}

export const Gradient = {
  getColor: (decimal: number, gradient: tinygradient.Instance) => {
    return gradient.rgbAt(decimal).toHexString()
  },

  getOptimizerColumnGradient: (params: GridParams) => {
    const aggs = OptimizerTabController.getAggs()

    try {
      const colId = params.column.colId

      const columnsToAggregate = OptimizerTabController.getColumnsToAggregateMap() as Record<string, boolean>
      if (params.data && aggs && columnsToAggregate[colId]) {
        const min = aggs.minAgg[colId]
        const max = aggs.maxAgg[colId]
        const value = params.value

        let range = (value - min) / (max - min)
        if (max == min) {
          range = 0.5
        }
        // console.log(min, max, value, range);

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

  getRelicGradient(params: GridParams) {
    const col = params.column.colId
    const value = params.value
    if (!relicColumnRanges) {
      // Not maxes, just for visual representation of gradient. Calculated by low roll x 5
      relicColumnRanges = {
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
      }
    }

    if (isNaN(value) || value == 0) {
      return {}
    }

    let range: number
    if (col.startsWith('weights.potential')) {
      range = value / 100
    } else if (col.startsWith('weights.')) {
      range = value / (6.48 * 9)
    } else {
      range = value / relicColumnRanges[col]
    }

    const color = Gradient.getColor(Math.min(Math.max(range, 0), 1), relicGridGradient)

    return {
      backgroundColor: color,
    }
  },
}
