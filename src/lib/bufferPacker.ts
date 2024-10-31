import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { FixedSizePriorityQueue } from 'lib/fixedSizePriorityQueue'

const SIZE = 38

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

  'statSim'?: {
    key: string
  }
}

export const BufferPacker = {
  extractCharacter: (arr: number[], offset: number): OptimizerDisplayData => { // Float32Array
    offset = offset * SIZE
    return {
      'id': arr[offset], // 0
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
    }
  },

  extractArrayToResults: (arr: number[], length: number, results, queueResults: FixedSizePriorityQueue<OptimizerDisplayData>) => {
    for (let i = 0; i < length; i++) {
      if (arr[i * SIZE + 1]) { // Check HP > 0
        const character = BufferPacker.extractCharacter(arr, i)
        queueResults.fixedSizePush(character)
      } else {
        // Results are packed linearly and the rest are 0s, we can exit after hitting a 0
        break
      }
    }
  },

  packCharacter: (arr: number[], offset: number, character: BasicStatsObject) => {
    offset = offset * SIZE

    arr[offset] = character.id // 0
    arr[offset + 1] = character[Stats.HP]
    arr[offset + 2] = character[Stats.ATK]
    arr[offset + 3] = character[Stats.DEF]
    arr[offset + 4] = character[Stats.SPD]
    arr[offset + 5] = character[Stats.CD]
    arr[offset + 6] = character[Stats.CR]
    arr[offset + 7] = character[Stats.EHR]
    arr[offset + 8] = character[Stats.RES]
    arr[offset + 9] = character[Stats.BE]
    arr[offset + 10] = character[Stats.ERR] // 10
    arr[offset + 11] = character[Stats.OHB]
    arr[offset + 12] = character.ELEMENTAL_DMG
    arr[offset + 13] = character.WEIGHT
    arr[offset + 14] = character.x.EHP
    arr[offset + 15] = character.x.HEAL_VALUE
    arr[offset + 16] = character.x.SHIELD_VALUE
    arr[offset + 17] = character.x.BASIC_DMG
    arr[offset + 18] = character.x.SKILL_DMG
    arr[offset + 19] = character.x.ULT_DMG
    arr[offset + 20] = character.x.FUA_DMG
    arr[offset + 21] = character.x.DOT_DMG
    arr[offset + 22] = character.x.BREAK_DMG // 22
    arr[offset + 23] = character.x.COMBO_DMG
    arr[offset + 24] = character.x[Stats.HP]
    arr[offset + 25] = character.x[Stats.ATK]
    arr[offset + 26] = character.x[Stats.DEF]
    arr[offset + 27] = character.x[Stats.SPD]
    arr[offset + 28] = character.x[Stats.CR]
    arr[offset + 29] = character.x[Stats.CD]
    arr[offset + 30] = character.x[Stats.EHR]
    arr[offset + 31] = character.x[Stats.RES]
    arr[offset + 32] = character.x[Stats.BE]
    arr[offset + 33] = character.x[Stats.ERR] // 33
    arr[offset + 34] = character.x[Stats.OHB]
    arr[offset + 35] = character.x.ELEMENTAL_DMG
    arr[offset + 36] = character.relicSetIndex
    arr[offset + 37] = character.ornamentSetIndex
  },

  cleanFloatBuffer: (buffer: ArrayBuffer) => {
    new Float64Array(buffer).fill(0)
  },

  createFloatBuffer: (length: number) => {
    return new Float64Array(length * SIZE).buffer
  },
}
