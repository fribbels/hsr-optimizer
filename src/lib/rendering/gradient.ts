import { type CellClassParams } from 'ag-grid-community'
import { type SubStats } from 'lib/constants/constants'
import { type OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { type ScoredRelic } from 'lib/relics/scoreRelics'
import { type ColorThemeOverrides } from 'lib/ui/theme'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import chroma from 'chroma-js'

export type GridAggregations = {
  min: Record<string, number>,
  max: Record<string, number>,
}

const optimizerGridGradient = chroma.scale(['#5A1A06', '#343127', '#38821F']).domain([0, 0.35, 1])

// this default is overwritten on page load, Gradient.setTheme() in App.tsx
let relicGridGradient = chroma.scale(['#343127', '#38821F'])
let relicGradientCache = new Map<number, { '--cell-bg': string }>()

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
  getColor: (decimal: number, gradient: chroma.Scale) => {
    return gradient(decimal).hex()
  },

  getOptimizerColumnGradient: (params: CellClassParams<OptimizerDisplayDataStatSim, number>) => {
    const aggregations = OptimizerTabController.getAggregations()

    try {
      const colId = params.column.getColId()

      const columnsToAggregate = OptimizerTabController.getColumnsToAggregateMap()
      if (!columnsToAggregate[colId]) return

      if (params.data && aggregations) {
        const min = aggregations.min[colId]
        const max = aggregations.max[colId]
        const value = params.value!

        let range = (value - min) / (max - min)
        if (max === min) {
          range = 0.5
        }

        const color = Gradient.getColor(Math.min(Math.max(range, 0), 1), optimizerGridGradient)
        return {
          '--cell-bg': color,
        }
      }

      // No aggregations yet — return neutral color to prevent black flash
      if (params.data) {
        return { '--cell-bg': Gradient.getColor(0.5, optimizerGridGradient) }
      }
    } catch (e) {
      console.error(e)
    }
  },

  setTheme(colorTheme: ColorThemeOverrides) {
    relicGridGradient = chroma.scale([chroma(colorTheme.colorPrimary).darken(3).desaturate(2).hex(), colorTheme.colorPrimary])
    relicGradientCache = new Map()
  },

  getRelicGradient(params: CellClassParams<ScoredRelic>) {
    const col = params.column.getColId()
    const value = params.value

    if (isNaN(value) || value === 0) {
      return
    }

    let range: number
    if (col === 'weights.rerollAvgSelectedDelta') {
      range = value / 40
    } else if (col.startsWith('weights.potential') || col.startsWith('weights.reroll')) {
      range = value / 100
    } else if (col.startsWith('weights.')) {
      range = value / (6.48 * 9)
    } else {
      range = value / relicColumnRanges[col as `augmentedStats.${SubStats}` | 'cv']
    }

    const clamped = Math.min(Math.max(range, 0), 1)
    // Quantize to ~200 buckets to maximize cache hits
    const key = Math.round(clamped * 200)
    const cached = relicGradientCache.get(key)
    if (cached) return cached

    const color = Gradient.getColor(clamped, relicGridGradient)
    const style = { '--cell-bg': color }
    relicGradientCache.set(key, style)
    return style
  },
}
