import tinygradient from 'tinygradient'
import { Constants } from './constants.ts'
import { OptimizerTabController } from './optimizerTabController'
import { theme } from 'antd'

const { getDesignToken } = theme

const optimizerGridGradient = tinygradient([
  { color: '#5A1A06', pos: 0 }, // red
  { color: '#343127', pos: 0.35 },
  { color: '#38821F', pos: 1 }, // green
])
let relicGridGradient = tinygradient('#343127', '#38821F')
let relicColumnRanges

export const Gradient = {
  getColor: (decimal, gradient) => {
    return gradient.rgbAt(decimal).toHexString()
  },

  getOptimizerColumnGradient: (params) => {
    const aggs = OptimizerTabController.getAggs()

    try {
      const colId = params.column.colId

      if (params.data && aggs && OptimizerTabController.getColumnsToAggregate(true)[colId]) {
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
    } catch (e) { console.error(e) }
  },

  setTheme(colorTheme) {
    relicGridGradient = tinygradient(colorTheme.colorBgBase, colorTheme.colorPrimary)
  },

  setToken(token) {
    relicGridGradient = tinygradient(token.colorBgElevated, token.colorPrimaryHover)
  },

  getRelicGradient(params) {
    const col = params.column.colId
    const value = params.value
    if (!relicColumnRanges) {
      // Not maxes, just for visual representation of gradient. Calculated by low roll x 5
      relicColumnRanges = {
        [`augmentedStats.${Constants.Stats.HP}`]: 169.35,
        [`augmentedStats.${Constants.Stats.ATK}`]: 84.675,
        [`augmentedStats.${Constants.Stats.DEF}`]: 84.675,
        [`augmentedStats.${Constants.Stats.SPD}`]: 10,
        [`augmentedStats.${Constants.Stats.ATK_P}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.HP_P}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.DEF_P}`]: 0.216,
        [`augmentedStats.${Constants.Stats.CR}`]: 0.1296,
        [`augmentedStats.${Constants.Stats.CD}`]: 0.2592,
        [`augmentedStats.${Constants.Stats.EHR}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.RES}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.BE}`]: 0.2592,
        [`cv`]: 0.40,
        'weights.current': 64.8,
        'weights.potentialSelected.averagePct': 100,
        'weights.potentialSelected.bestPct': 100,
        'weights.potentialAllAll': 100,
      }
    }

    if (isNaN(value) || value == 0) {
      return {}
    }

    let range
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
