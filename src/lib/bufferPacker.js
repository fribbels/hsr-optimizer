import {Stats} from "./constants";

const SIZE = 43

export const BufferPacker = {
  extractCharacter: (arr, offset) => { // Float32Array
    let i = 0
    offset = offset * SIZE
    return {
      id: arr[offset + i++], // 0
      [Constants.Stats.HP]:    arr[offset + i++],
      [Constants.Stats.ATK]:   arr[offset + i++],
      [Constants.Stats.DEF]:   arr[offset + i++],
      [Constants.Stats.SPD]:   arr[offset + i++],
      [Constants.Stats.CD]:    arr[offset + i++],
      [Constants.Stats.CR]:    arr[offset + i++],
      [Constants.Stats.EHR]:   arr[offset + i++],
      [Constants.Stats.RES]:   arr[offset + i++],
      [Constants.Stats.BE]:    arr[offset + i++],
      [Constants.Stats.ERR]:   arr[offset + i++], // 10
      [Constants.Stats.OHB]:   arr[offset + i++],
      ED:    arr[offset + i++],
      CV:    arr[offset + i++],
      DMG:   arr[offset + i++],
      MCD:   arr[offset + i++],
      EHP:   arr[offset + i++],
      BASIC: arr[offset + i++],
      SKILL: arr[offset + i++],
      ULT:   arr[offset + i++],
      FUA:   arr[offset + i++], // 20
      DOT:   arr[offset + i++],
      xHP:  arr[offset + i++],
      xATK: arr[offset + i++],
      xDEF: arr[offset + i++],
      xSPD: arr[offset + i++],
      xCR:  arr[offset + i++],
      xCD:  arr[offset + i++],
      xEHR: arr[offset + i++],
      xRES: arr[offset + i++],
      xBE:  arr[offset + i++], // 30
      xERR: arr[offset + i++],
      xOHB: arr[offset + i++],
      xELEMENTAL_DMG:  arr[offset + i++],
      xBASIC_BOOST:    arr[offset + i++],
      xSKILL_BOOST:    arr[offset + i++],
      xULT_BOOST:      arr[offset + i++],
      xFUA_BOOST:      arr[offset + i++],
      xDOT_BOOST:      arr[offset + i++],
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
    let i = 0
    arr[offset * SIZE + i++] = character.id
    arr[offset * SIZE + i++] = character[Stats.HP]
    arr[offset * SIZE + i++] = character[Stats.ATK]
    arr[offset * SIZE + i++] = character[Stats.DEF]
    arr[offset * SIZE + i++] = character[Stats.SPD]
    arr[offset * SIZE + i++] = character[Stats.CD]
    arr[offset * SIZE + i++] = character[Stats.CR]
    arr[offset * SIZE + i++] = character[Stats.EHR]
    arr[offset * SIZE + i++] = character[Stats.RES]
    arr[offset * SIZE + i++] = character[Stats.BE]
    arr[offset * SIZE + i++] = character[Stats.ERR]
    arr[offset * SIZE + i++] = character[Stats.OHB]
    arr[offset * SIZE + i++] = character.ELEMENTAL_DMG
    arr[offset * SIZE + i++] = character.CV
    arr[offset * SIZE + i++] = character.DMG
    arr[offset * SIZE + i++] = character.MCD
    arr[offset * SIZE + i++] = character.EHP
    arr[offset * SIZE + i++] = character.x.BASIC_DMG
    arr[offset * SIZE + i++] = character.x.SKILL_DMG
    arr[offset * SIZE + i++] = character.x.ULT_DMG
    arr[offset * SIZE + i++] = character.x.FUA_DMG
    arr[offset * SIZE + i++] = character.x.DOT_DMG
    arr[offset * SIZE + i++] = character.x[Stats.HP]
    arr[offset * SIZE + i++] = character.x[Stats.ATK]
    arr[offset * SIZE + i++] = character.x[Stats.DEF]
    arr[offset * SIZE + i++] = character.x[Stats.SPD]
    arr[offset * SIZE + i++] = character.x[Stats.CR]
    arr[offset * SIZE + i++] = character.x[Stats.CD]
    arr[offset * SIZE + i++] = character.x[Stats.EHR]
    arr[offset * SIZE + i++] = character.x[Stats.RES]
    arr[offset * SIZE + i++] = character.x[Stats.BE]
    arr[offset * SIZE + i++] = character.x[Stats.ERR]
    arr[offset * SIZE + i++] = character.x[Stats.OHB]
    arr[offset * SIZE + i++] = character.x.ELEMENTAL_DMG
    arr[offset * SIZE + i++] = character.x.BASIC_BOOST
    arr[offset * SIZE + i++] = character.x.SKILL_BOOST
    arr[offset * SIZE + i++] = character.x.ULT_BOOST
    arr[offset * SIZE + i++] = character.x.FUA_BOOST
    arr[offset * SIZE + i++] = character.x.DOT_BOOST
  },

  cleanFloatBuffer: (buffer) => {
    new Float32Array(buffer).fill(0);
  },

  createFloatBuffer: (length) => {
    return new Float32Array(length * SIZE).buffer
  }
}