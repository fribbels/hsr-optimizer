import {Stats} from "./constants";

const SIZE = 39

// When adding new rows, use:
// let i = 0
// offset + i++

export const BufferPacker = {
  extractCharacter: (arr, offset) => { // Float32Array
    offset = offset * SIZE
    return {
      id: arr[offset], // 0
      [Constants.Stats.HP]:    arr[offset + 1],
      [Constants.Stats.ATK]:   arr[offset + 2],
      [Constants.Stats.DEF]:   arr[offset + 3],
      [Constants.Stats.SPD]:   arr[offset + 4],
      [Constants.Stats.CD]:    arr[offset + 5],
      [Constants.Stats.CR]:    arr[offset + 6],
      [Constants.Stats.EHR]:   arr[offset + 7],
      [Constants.Stats.RES]:   arr[offset + 8],
      [Constants.Stats.BE]:    arr[offset + 9],
      [Constants.Stats.ERR]:   arr[offset + 10], // 10
      [Constants.Stats.OHB]:   arr[offset + 11],
      ED:    arr[offset + 12],
      CV:    arr[offset + 13],
      DMG:   arr[offset + 14],
      MCD:   arr[offset + 15],
      EHP:   arr[offset + 16],
      BASIC: arr[offset + 17],
      SKILL: arr[offset + 18],
      ULT:   arr[offset + 19],
      FUA:   arr[offset + 20], // 20
      DOT:   arr[offset + 21],
      xHP:   arr[offset + 22],
      xATK:  arr[offset + 23],
      xDEF:  arr[offset + 24],
      xSPD:  arr[offset + 25],
      xCR:   arr[offset + 26],
      xCD:   arr[offset + 27],
      xEHR:  arr[offset + 28],
      xRES:  arr[offset + 29],
      xBE:   arr[offset + 30], // 30
      xERR:  arr[offset + 31],
      xOHB:  arr[offset + 32],
      xELEMENTAL_DMG:  arr[offset + 33],
      xBASIC_BOOST:    arr[offset + 34],
      xSKILL_BOOST:    arr[offset + 35],
      xULT_BOOST:      arr[offset + 36],
      xFUA_BOOST:      arr[offset + 37],
      xDOT_BOOST:      arr[offset + 38],
    }
  },

  extractArrayToResults: (arr, length, results) => {
    for (let i = 0; i < length; i++) {
      if (arr[i * SIZE + 1]) {
        results.push(BufferPacker.extractCharacter(arr, i))
      }
    }
  },

  packCharacter: (arr, offset, character) => {
    offset = offset * SIZE

    // When adding new rows, use:
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
    arr[offset + 13] = character.CV
    arr[offset + 14] = character.DMG
    arr[offset + 15] = character.MCD
    arr[offset + 16] = character.EHP
    arr[offset + 17] = character.x.BASIC_DMG
    arr[offset + 18] = character.x.SKILL_DMG
    arr[offset + 19] = character.x.ULT_DMG
    arr[offset + 20] = character.x.FUA_DMG // 20
    arr[offset + 21] = character.x.DOT_DMG
    arr[offset + 22] = character.x[Stats.HP]
    arr[offset + 23] = character.x[Stats.ATK]
    arr[offset + 24] = character.x[Stats.DEF]
    arr[offset + 25] = character.x[Stats.SPD]
    arr[offset + 26] = character.x[Stats.CR]
    arr[offset + 27] = character.x[Stats.CD]
    arr[offset + 28] = character.x[Stats.EHR]
    arr[offset + 29] = character.x[Stats.RES]
    arr[offset + 30] = character.x[Stats.BE] // 30
    arr[offset + 31] = character.x[Stats.ERR]
    arr[offset + 32] = character.x[Stats.OHB]
    arr[offset + 33] = character.x.ELEMENTAL_DMG
    arr[offset + 34] = character.x.BASIC_BOOST
    arr[offset + 35] = character.x.SKILL_BOOST
    arr[offset + 36] = character.x.ULT_BOOST
    arr[offset + 37] = character.x.FUA_BOOST
    arr[offset + 38] = character.x.DOT_BOOST
  },

  cleanFloatBuffer: (buffer) => {
    new Float32Array(buffer).fill(0);
  },

  createFloatBuffer: (length) => {
    return new Float32Array(length * SIZE).buffer
  }
}