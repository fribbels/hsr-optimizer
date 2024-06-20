import { Constants, Stats } from './constants.ts'

const SIZE = 36

export const BufferPacker = {
  extractCharacter: (arr, offset) => { // Float32Array
    offset = offset * SIZE
    return {
      id: arr[offset], // 0
      [Constants.Stats.HP]: arr[offset + 1],
      [Constants.Stats.ATK]: arr[offset + 2],
      [Constants.Stats.DEF]: arr[offset + 3],
      [Constants.Stats.SPD]: arr[offset + 4],
      [Constants.Stats.CD]: arr[offset + 5],
      [Constants.Stats.CR]: arr[offset + 6],
      [Constants.Stats.EHR]: arr[offset + 7],
      [Constants.Stats.RES]: arr[offset + 8],
      [Constants.Stats.BE]: arr[offset + 9],
      [Constants.Stats.ERR]: arr[offset + 10], // 10
      [Constants.Stats.OHB]: arr[offset + 11],
      ED: arr[offset + 12],
      WEIGHT: arr[offset + 13], // DELETE
      EHP: arr[offset + 14],
      BASIC: arr[offset + 15],
      SKILL: arr[offset + 16],
      ULT: arr[offset + 17],
      FUA: arr[offset + 18],
      DOT: arr[offset + 19],
      BREAK: arr[offset + 20], // 20
      COMBO: arr[offset + 21],
      xHP: arr[offset + 22],
      xATK: arr[offset + 23],
      xDEF: arr[offset + 24],
      xSPD: arr[offset + 25],
      xCR: arr[offset + 26],
      xCD: arr[offset + 27],
      xEHR: arr[offset + 28],
      xRES: arr[offset + 29],
      xBE: arr[offset + 30], // 30
      xERR: arr[offset + 31],
      xOHB: arr[offset + 32],
      xELEMENTAL_DMG: arr[offset + 33],
      relicSetIndex: arr[offset + 34],
      ornamentSetIndex: arr[offset + 35],
    }
  },

  extractArrayToResults: (arr, length, results, queueResults) => {
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

  packCharacter: (arr, offset, character) => {
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
    arr[offset + 13] = character.x.WEIGHT
    arr[offset + 14] = character.x.EHP
    arr[offset + 15] = character.x.BASIC_DMG
    arr[offset + 16] = character.x.SKILL_DMG
    arr[offset + 17] = character.x.ULT_DMG
    arr[offset + 18] = character.x.FUA_DMG
    arr[offset + 19] = character.x.DOT_DMG
    arr[offset + 20] = character.x.BREAK_DMG // 20
    arr[offset + 21] = character.x.COMBO_DMG
    arr[offset + 22] = character.x[Stats.HP]
    arr[offset + 23] = character.x[Stats.ATK]
    arr[offset + 24] = character.x[Stats.DEF]
    arr[offset + 25] = character.x[Stats.SPD]
    arr[offset + 26] = character.x[Stats.CR]
    arr[offset + 27] = character.x[Stats.CD]
    arr[offset + 28] = character.x[Stats.EHR]
    arr[offset + 29] = character.x[Stats.RES]
    arr[offset + 30] = character.x[Stats.BE]
    arr[offset + 31] = character.x[Stats.ERR] // 30
    arr[offset + 32] = character.x[Stats.OHB]
    arr[offset + 33] = character.x.ELEMENTAL_DMG
    arr[offset + 34] = character.relicSetIndex
    arr[offset + 35] = character.ornamentSetIndex
  },

  cleanFloatBuffer: (buffer) => {
    new Float64Array(buffer).fill(0)
  },

  createFloatBuffer: (length) => {
    return new Float64Array(length * SIZE).buffer
  },
}
