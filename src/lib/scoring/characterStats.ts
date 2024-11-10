import { Stats } from 'lib/constants/constants'

export const CharacterStats = {
  getZeroes: function () {
    return {
      [Stats.ATK]: 0,
      [Stats.DEF]: 0,
      [Stats.HP]: 0,
      [Stats.ATK_P]: 0,
      [Stats.DEF_P]: 0,
      [Stats.HP_P]: 0,
      [Stats.SPD]: 0,
      [Stats.SPD_P]: 0,
      [Stats.CR]: 0,
      [Stats.CD]: 0,
      [Stats.EHR]: 0,
      [Stats.RES]: 0,
      [Stats.BE]: 0,
      [Stats.ERR]: 0,
      [Stats.OHB]: 0,
      [Stats.Physical_DMG]: 0,
      [Stats.Fire_DMG]: 0,
      [Stats.Ice_DMG]: 0,
      [Stats.Lightning_DMG]: 0,
      [Stats.Wind_DMG]: 0,
      [Stats.Quantum_DMG]: 0,
      [Stats.Imaginary_DMG]: 0,
    }
  },
}
