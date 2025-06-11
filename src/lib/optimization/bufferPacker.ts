import {
  Buff,
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { FixedSizePriorityQueue } from 'lib/optimization/fixedSizePriorityQueue'

const SIZE = 65

export type OptimizerDisplayData = {
  'id': number,

  'HP': number,
  'ATK': number,
  'DEF': number,
  'SPD': number,
  'CRIT Rate': number,
  'CRIT DMG': number,
  'Effect Hit Rate': number,
  'Effect RES': number,
  'Break Effect': number,
  'Energy Regeneration Rate': number,
  'Outgoing Healing Boost': number,

  'ED': number,
  'WEIGHT': number,
  'EHP': number,
  'HEAL': number,
  'SHIELD': number,
  'BASIC': number,
  'SKILL': number,
  'ULT': number,
  'FUA': number,
  'MEMO_SKILL': number,
  'MEMO_TALENT': number,
  'DOT': number,
  'BREAK': number,
  'COMBO': number,
  'xHP': number,
  'xATK': number,
  'xDEF': number,
  'xSPD': number,
  'xCR': number,
  'xCD': number,
  'xEHR': number,
  'xRES': number,
  'xBE': number,
  'xERR': number,
  'xOHB': number,
  'xELEMENTAL_DMG': number,
  'relicSetIndex': number,
  'ornamentSetIndex': number,

  'mHP': number,
  'mATK': number,
  'mDEF': number,
  'mSPD': number,
  'mCR': number,
  'mCD': number,
  'mEHR': number,
  'mRES': number,
  'mBE': number,
  'mERR': number,
  'mOHB': number,
  'mELEMENTAL_DMG': number,
  'mxHP': number,
  'mxATK': number,
  'mxDEF': number,
  'mxSPD': number,
  'mxCR': number,
  'mxCD': number,
  'mxEHR': number,
  'mxRES': number,
  'mxBE': number,
  'mxERR': number,
  'mxOHB': number,
  'mxELEMENTAL_DMG': number,

  'mxEHP': number,

  'xa': Float32Array,
  'ca': Float32Array,

  // Not safe to use unless trace is activated with a new instance
  'tracedX'?: ComputedStatsArray,

  'statSim': { key: string },
}

export type CombatBuffsTracker = {
  buffs: Buff[],
  buffsMemo: Buff[],
}

export type OptimizerDisplayDataStatSim = OptimizerDisplayData & {
  statSim: {
    key: string,
  },
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
      'MEMO_TALENT': arr[offset + 22],
      'DOT': arr[offset + 23],
      'BREAK': arr[offset + 24], // 24
      'COMBO': arr[offset + 25],
      'xHP': arr[offset + 26],
      'xATK': arr[offset + 27],
      'xDEF': arr[offset + 28],
      'xSPD': arr[offset + 29],
      'xCR': arr[offset + 30],
      'xCD': arr[offset + 31],
      'xEHR': arr[offset + 32],
      'xRES': arr[offset + 33],
      'xBE': arr[offset + 34], // 32
      'xERR': arr[offset + 35],
      'xOHB': arr[offset + 36],
      'xELEMENTAL_DMG': arr[offset + 37],
      'relicSetIndex': arr[offset + 38],
      'ornamentSetIndex': arr[offset + 39],
      'mHP': arr[offset + 40],
      'mATK': arr[offset + 41],
      'mDEF': arr[offset + 42],
      'mSPD': arr[offset + 43],
      'mCR': arr[offset + 44],
      'mCD': arr[offset + 45],
      'mEHR': arr[offset + 46],
      'mRES': arr[offset + 47],
      'mBE': arr[offset + 48], // 32
      'mERR': arr[offset + 49],
      'mOHB': arr[offset + 50],
      'mELEMENTAL_DMG': arr[offset + 51],
      'mxHP': arr[offset + 52],
      'mxATK': arr[offset + 53],
      'mxDEF': arr[offset + 54],
      'mxSPD': arr[offset + 55],
      'mxCR': arr[offset + 56],
      'mxCD': arr[offset + 57],
      'mxEHR': arr[offset + 58],
      'mxRES': arr[offset + 59],
      'mxBE': arr[offset + 60], // 32
      'mxERR': arr[offset + 61],
      'mxOHB': arr[offset + 62],
      'mxELEMENTAL_DMG': arr[offset + 63],
      'mxEHP': arr[offset + 64],
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
    arr[offset + 22] = a[Key.MEMO_TALENT_DMG]
    arr[offset + 23] = a[Key.DOT_DMG]
    arr[offset + 24] = a[Key.BREAK_DMG] // 22
    arr[offset + 25] = a[Key.COMBO_DMG]
    arr[offset + 26] = a[Key.HP]
    arr[offset + 27] = a[Key.ATK]
    arr[offset + 28] = a[Key.DEF]
    arr[offset + 29] = a[Key.SPD]
    arr[offset + 30] = a[Key.CR]
    arr[offset + 31] = a[Key.CD]
    arr[offset + 32] = a[Key.EHR]
    arr[offset + 33] = a[Key.RES]
    arr[offset + 34] = a[Key.BE]
    arr[offset + 35] = a[Key.ERR] // 33
    arr[offset + 36] = a[Key.OHB]
    arr[offset + 37] = a[Key.ELEMENTAL_DMG]
    arr[offset + 38] = c.relicSetIndex
    arr[offset + 39] = c.ornamentSetIndex
    if (x.a[Key.MEMOSPRITE]) {
      const ca = x.m.c.a
      arr[offset + 40] = ca[Key.HP]
      arr[offset + 41] = ca[Key.ATK]
      arr[offset + 42] = ca[Key.DEF]
      arr[offset + 43] = ca[Key.SPD]
      arr[offset + 44] = ca[Key.CR]
      arr[offset + 45] = ca[Key.CD]
      arr[offset + 46] = ca[Key.EHR]
      arr[offset + 47] = ca[Key.RES]
      arr[offset + 48] = ca[Key.BE]
      arr[offset + 49] = ca[Key.ERR]
      arr[offset + 50] = ca[Key.OHB]
      arr[offset + 51] = ca[Key.ELEMENTAL_DMG]

      const a = x.m.a
      arr[offset + 52] = a[Key.HP]
      arr[offset + 53] = a[Key.ATK]
      arr[offset + 54] = a[Key.DEF]
      arr[offset + 55] = a[Key.SPD]
      arr[offset + 56] = a[Key.CR]
      arr[offset + 57] = a[Key.CD]
      arr[offset + 58] = a[Key.EHR]
      arr[offset + 59] = a[Key.RES]
      arr[offset + 60] = a[Key.BE]
      arr[offset + 61] = a[Key.ERR]
      arr[offset + 62] = a[Key.OHB]
      arr[offset + 63] = a[Key.ELEMENTAL_DMG]
      arr[offset + 64] = a[Key.EHP]
    }
  },

  cleanFloatBuffer: (buffer: ArrayBuffer) => {
    new Float32Array(buffer).fill(0)
  },

  createFloatBuffer: (length: number) => {
    return new Float32Array(length * SIZE).buffer
  },
}
