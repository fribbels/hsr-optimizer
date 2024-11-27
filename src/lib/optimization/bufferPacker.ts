import { Stats } from 'lib/constants/constants'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'

const SIZE = 40

export type OptimizerDisplayData = {
  'id': number

  'HP': number
  'ATK': number
  'DEF': number
  'SPD': number
  'CRIT Rate': number
  'CRIT DMG': number
  'Effect Hit Rate': number
  'Effect RES': number
  'Break Effect': number
  'Energy Regeneration Rate': number
  'Outgoing Healing Boost': number

  'ED': number
  'WEIGHT': number
  'EHP': number
  'HEAL': number
  'SHIELD': number
  'BASIC': number
  'SKILL': number
  'ULT': number
  'FUA': number
  'DOT': number
  'BREAK': number
  'COMBO': number
  'xHP': number
  'xATK': number
  'xDEF': number
  'xSPD': number
  'xCR': number
  'xCD': number
  'xEHR': number
  'xRES': number
  'xBE': number
  'xERR': number
  'xOHB': number
  'xELEMENTAL_DMG': number
  'relicSetIndex': number
  'ornamentSetIndex': number
  'low': number
  'high': number
}

export type OptimizerDisplayDataStatSim = OptimizerDisplayData & {
  statSim: {
    key: string
  }
}

export const BufferPacker = {
  extractCharacter: (arr: Float32Array, offset: number, skip: number): OptimizerDisplayData => { // Float32Array
    offset = offset * SIZE
    return {
      'id': arr[offset] + skip, // 0
      'HP': arr[offset + 1],
      'ATK': arr[offset + 2],
      'DEF': arr[offset + 3],
      'SPD': arr[offset + 4],
      'CRIT Rate': arr[offset + 5],
      'CRIT DMG': arr[offset + 6],
      'Effect Hit Rate': arr[offset + 7],
      'Effect RES': arr[offset + 8],
      'Break Effect': arr[offset + 9],
      'Energy Regeneration Rate': arr[offset + 10], // 10
      'Outgoing Healing Boost': arr[offset + 11],
      'ED': arr[offset + 12],
      'WEIGHT': arr[offset + 13], // DELETE
      'EHP': arr[offset + 14],
      'HEAL': arr[offset + 15],
      'SHIELD': arr[offset + 16],
      'BASIC': arr[offset + 17],
      'SKILL': arr[offset + 18],
      'ULT': arr[offset + 19],
      'FUA': arr[offset + 20],
      'DOT': arr[offset + 21],
      'BREAK': arr[offset + 22], // 22
      'COMBO': arr[offset + 23],
      'xHP': arr[offset + 24],
      'xATK': arr[offset + 25],
      'xDEF': arr[offset + 26],
      'xSPD': arr[offset + 27],
      'xCR': arr[offset + 28],
      'xCD': arr[offset + 29],
      'xEHR': arr[offset + 30],
      'xRES': arr[offset + 31],
      'xBE': arr[offset + 32], // 32
      'xERR': arr[offset + 33],
      'xOHB': arr[offset + 34],
      'xELEMENTAL_DMG': arr[offset + 35],
      'relicSetIndex': arr[offset + 36],
      'ornamentSetIndex': arr[offset + 37],
      'low': arr[offset + 38],
      'high': arr[offset + 39],
    }
  },

  extractArrayToResults: (arr: Float32Array, length: number, queueResults: FixedSizePriorityQueue<OptimizerDisplayData>, skip: number) => {
    for (let i = 0; i < length; i++) {
      if (arr[i * SIZE + 1]) { // Check HP > 0
        const character = BufferPacker.extractCharacter(arr, i, skip)
        queueResults.fixedSizePush(character)
      } else {
        // Results are packed linearly and the rest are 0s, we can exit after hitting a 0
        break
      }
    }
  },

  packCharacter: (arr: Float32Array, offset: number, x: ComputedStatsArray) => {
    offset = offset * SIZE
    const c = x.c
    const a = x.a

    arr[offset] = c.id // 0
    arr[offset + 1] = c[Stats.HP]
    arr[offset + 2] = c[Stats.ATK]
    arr[offset + 3] = c[Stats.DEF]
    arr[offset + 4] = c[Stats.SPD]
    arr[offset + 5] = c[Stats.CR]
    arr[offset + 6] = c[Stats.CD]
    arr[offset + 7] = c[Stats.EHR]
    arr[offset + 8] = c[Stats.RES]
    arr[offset + 9] = c[Stats.BE]
    arr[offset + 10] = c[Stats.ERR] // 10
    arr[offset + 11] = c[Stats.OHB]
    arr[offset + 12] = c.ELEMENTAL_DMG
    arr[offset + 13] = c.WEIGHT
    arr[offset + 14] = a[Key.EHP]
    arr[offset + 15] = a[Key.HEAL_VALUE]
    arr[offset + 16] = a[Key.SHIELD_VALUE]
    arr[offset + 17] = a[Key.BASIC_DMG]
    arr[offset + 18] = a[Key.SKILL_DMG]
    arr[offset + 19] = a[Key.ULT_DMG]
    arr[offset + 20] = a[Key.FUA_DMG]
    arr[offset + 21] = a[Key.DOT_DMG]
    arr[offset + 22] = a[Key.BREAK_DMG] // 22
    arr[offset + 23] = a[Key.COMBO_DMG]
    arr[offset + 24] = a[Key.HP]
    arr[offset + 25] = a[Key.ATK]
    arr[offset + 26] = a[Key.DEF]
    arr[offset + 27] = a[Key.SPD]
    arr[offset + 28] = a[Key.CR]
    arr[offset + 29] = a[Key.CD]
    arr[offset + 30] = a[Key.EHR]
    arr[offset + 31] = a[Key.RES]
    arr[offset + 32] = a[Key.BE]
    arr[offset + 33] = a[Key.ERR] // 33
    arr[offset + 34] = a[Key.OHB]
    arr[offset + 35] = a[Key.ELEMENTAL_DMG]
    arr[offset + 36] = c.relicSetIndex
    arr[offset + 37] = c.ornamentSetIndex
    arr[offset + 38] = c.low
    arr[offset + 39] = c.high
  },

  cleanFloatBuffer: (buffer: ArrayBuffer) => {
    new Float32Array(buffer).fill(0)
  },

  createFloatBuffer: (length: number) => {
    return new Float32Array(length * SIZE).buffer
  },
}
