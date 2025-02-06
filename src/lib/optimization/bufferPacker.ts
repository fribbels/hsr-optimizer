import { Buff, ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'

const SIZE = 66

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
  'MEMO_SKILL': number
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

  'mHP': number
  'mATK': number
  'mDEF': number
  'mSPD': number
  'mCR': number
  'mCD': number
  'mEHR': number
  'mRES': number
  'mBE': number
  'mERR': number
  'mOHB': number
  'mELEMENTAL_DMG': number
  'mxHP': number
  'mxATK': number
  'mxDEF': number
  'mxSPD': number
  'mxCR': number
  'mxCD': number
  'mxEHR': number
  'mxRES': number
  'mxBE': number
  'mxERR': number
  'mxOHB': number
  'mxELEMENTAL_DMG': number

  'mxEHP': number

  'xa': Float32Array
  'ca': Float32Array

  // Not safe to use unless trace is activated with a new instance
  'tracedX'?: ComputedStatsArray

  'statSim': { key: string }
}

export type CombatBuffsTracker = {
  buffs: Buff[]
  buffsMemo: Buff[]
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
      'MEMO_SKILL': arr[offset + 21],
      'DOT': arr[offset + 22],
      'BREAK': arr[offset + 23], // 22
      'COMBO': arr[offset + 24],
      'xHP': arr[offset + 25],
      'xATK': arr[offset + 26],
      'xDEF': arr[offset + 27],
      'xSPD': arr[offset + 28],
      'xCR': arr[offset + 29],
      'xCD': arr[offset + 30],
      'xEHR': arr[offset + 31],
      'xRES': arr[offset + 32],
      'xBE': arr[offset + 33], // 32
      'xERR': arr[offset + 34],
      'xOHB': arr[offset + 35],
      'xELEMENTAL_DMG': arr[offset + 36],
      'relicSetIndex': arr[offset + 37],
      'ornamentSetIndex': arr[offset + 38],
      'mHP': arr[offset + 39],
      'mATK': arr[offset + 40],
      'mDEF': arr[offset + 41],
      'mSPD': arr[offset + 42],
      'mCR': arr[offset + 43],
      'mCD': arr[offset + 44],
      'mEHR': arr[offset + 45],
      'mRES': arr[offset + 46],
      'mBE': arr[offset + 47], // 32
      'mERR': arr[offset + 48],
      'mOHB': arr[offset + 49],
      'mELEMENTAL_DMG': arr[offset + 50],
      'mxHP': arr[offset + 51],
      'mxATK': arr[offset + 52],
      'mxDEF': arr[offset + 53],
      'mxSPD': arr[offset + 54],
      'mxCR': arr[offset + 55],
      'mxCD': arr[offset + 56],
      'mxEHR': arr[offset + 57],
      'mxRES': arr[offset + 58],
      'mxBE': arr[offset + 59], // 32
      'mxERR': arr[offset + 60],
      'mxOHB': arr[offset + 61],
      'mxELEMENTAL_DMG': arr[offset + 62],
      'mxEHP': arr[offset + 63],
    } as OptimizerDisplayData
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
    const ca = c.a

    arr[offset] = c.id // 0
    arr[offset + 1] = ca[Key.HP]
    arr[offset + 2] = ca[Key.ATK]
    arr[offset + 3] = ca[Key.DEF]
    arr[offset + 4] = ca[Key.SPD]
    arr[offset + 5] = ca[Key.CR]
    arr[offset + 6] = ca[Key.CD]
    arr[offset + 7] = ca[Key.EHR]
    arr[offset + 8] = ca[Key.RES]
    arr[offset + 9] = ca[Key.BE]
    arr[offset + 10] = ca[Key.ERR] // 10
    arr[offset + 11] = ca[Key.OHB]
    arr[offset + 12] = ca[Key.ELEMENTAL_DMG]
    arr[offset + 13] = c.weight
    arr[offset + 14] = a[Key.EHP]
    arr[offset + 15] = a[Key.HEAL_VALUE]
    arr[offset + 16] = a[Key.SHIELD_VALUE]
    arr[offset + 17] = a[Key.BASIC_DMG]
    arr[offset + 18] = a[Key.SKILL_DMG]
    arr[offset + 19] = a[Key.ULT_DMG]
    arr[offset + 20] = a[Key.FUA_DMG]
    arr[offset + 21] = a[Key.MEMO_SKILL_DMG]
    arr[offset + 22] = a[Key.DOT_DMG]
    arr[offset + 23] = a[Key.BREAK_DMG] // 22
    arr[offset + 24] = a[Key.COMBO_DMG]
    arr[offset + 25] = a[Key.HP]
    arr[offset + 26] = a[Key.ATK]
    arr[offset + 27] = a[Key.DEF]
    arr[offset + 28] = a[Key.SPD]
    arr[offset + 29] = a[Key.CR]
    arr[offset + 30] = a[Key.CD]
    arr[offset + 31] = a[Key.EHR]
    arr[offset + 32] = a[Key.RES]
    arr[offset + 33] = a[Key.BE]
    arr[offset + 34] = a[Key.ERR] // 33
    arr[offset + 35] = a[Key.OHB]
    arr[offset + 36] = a[Key.ELEMENTAL_DMG]
    arr[offset + 37] = c.relicSetIndex
    arr[offset + 38] = c.ornamentSetIndex
    if (x.m) {
      const ca = x.m.c.a
      arr[offset + 39] = ca[Key.HP]
      arr[offset + 40] = ca[Key.ATK]
      arr[offset + 41] = ca[Key.DEF]
      arr[offset + 42] = ca[Key.SPD]
      arr[offset + 43] = ca[Key.CR]
      arr[offset + 44] = ca[Key.CD]
      arr[offset + 45] = ca[Key.EHR]
      arr[offset + 46] = ca[Key.RES]
      arr[offset + 47] = ca[Key.BE]
      arr[offset + 48] = ca[Key.ERR]
      arr[offset + 49] = ca[Key.OHB]
      arr[offset + 50] = ca[Key.ELEMENTAL_DMG]

      const a = x.m.a
      arr[offset + 51] = a[Key.HP]
      arr[offset + 52] = a[Key.ATK]
      arr[offset + 53] = a[Key.DEF]
      arr[offset + 54] = a[Key.SPD]
      arr[offset + 55] = a[Key.CR]
      arr[offset + 56] = a[Key.CD]
      arr[offset + 57] = a[Key.EHR]
      arr[offset + 58] = a[Key.RES]
      arr[offset + 59] = a[Key.BE]
      arr[offset + 60] = a[Key.ERR]
      arr[offset + 61] = a[Key.OHB]
      arr[offset + 62] = a[Key.ELEMENTAL_DMG]
      arr[offset + 63] = a[Key.EHP]
    }
  },

  cleanFloatBuffer: (buffer: ArrayBuffer) => {
    new Float32Array(buffer).fill(0)
  },

  createFloatBuffer: (length: number) => {
    return new Float32Array(length * SIZE).buffer
  },
}
