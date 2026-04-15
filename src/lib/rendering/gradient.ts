import { type CellClassParams } from 'ag-grid-community'
import chroma from 'chroma-js'
import { type SubStats } from 'lib/constants/constants'
import { type OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { type ScoredRelic } from 'lib/relics/scoreRelics'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'

export type GridAggregations = {
  min: Record<string, number>,
  max: Record<string, number>,
}

const optimizerGridGradient = chroma.scale(['#5A1A06', '#343127', '#38821F']).domain([0, 0.35, 1])
const NEUTRAL_OPTIMIZER_STYLE = { '--cell-bg': optimizerGridGradient(0.5).hex() } as const
const GRADIENT_BUCKETS = 201 // 0-200 inclusive
let optimizerGradientCache: Array<{ '--cell-bg': string } | undefined> = Array.from({ length: GRADIENT_BUCKETS })

// this default is overwritten on page load, Gradient.setTheme() in App.tsx
let relicGridGradient = chroma.scale(['#343127', '#38821F'])
let relicGradientCache: Array<{ '--cell-bg': string } | undefined> = Array.from({ length: GRADIENT_BUCKETS })

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

  clearOptimizerGradientCache() {
    optimizerGradientCache = Array.from({ length: GRADIENT_BUCKETS })
  },

  getOptimizerColumnGradient: (params: CellClassParams<OptimizerDisplayDataStatSim, number>) => {
    if (!params.data) return
    if (params.value == null) return

    const aggregations = OptimizerTabController.getAggregations()
    if (!aggregations) return NEUTRAL_OPTIMIZER_STYLE

    const colId = params.column.getColId()
    const min = aggregations.min[colId]
    const max = aggregations.max[colId]
    if (min == null) return

    const value = params.value

    const range = max === min ? 0.5 : (value - min) / (max - min)
    const clamped = Math.min(Math.max(range, 0), 1)
    // Quantize to ~200 buckets to maximize cache hits
    const key = Math.round(clamped * 200)
    const cached = optimizerGradientCache[key]
    if (cached) return cached

    const color = Gradient.getColor(clamped, optimizerGridGradient)
    const style = { '--cell-bg': color }
    optimizerGradientCache[key] = style
    return style
  },

  setTheme(darkBg: string, primaryLight: string) {
    relicGridGradient = chroma.scale([darkBg, primaryLight])
    relicGradientCache = Array.from({ length: GRADIENT_BUCKETS })
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
    const cached = relicGradientCache[key]
    if (cached) return cached

    const color = Gradient.getColor(clamped, relicGridGradient)
    const style = { '--cell-bg': color }
    relicGradientCache[key] = style
    return style
  },
}
