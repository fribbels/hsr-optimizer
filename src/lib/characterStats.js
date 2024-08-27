import { Constants } from './constants.ts'

export const CharacterStats = {
  getZeroes: function () {
    return {
      [Constants.Stats.ATK]: 0,
      [Constants.Stats.DEF]: 0,
      [Constants.Stats.HP]: 0,
      [Constants.Stats.ATK_P]: 0,
      [Constants.Stats.DEF_P]: 0,
      [Constants.Stats.HP_P]: 0,
      [Constants.Stats.SPD]: 0,
      [Constants.Stats.SPD_P]: 0,
      [Constants.Stats.CR]: 0,
      [Constants.Stats.CD]: 0,
      [Constants.Stats.EHR]: 0,
      [Constants.Stats.RES]: 0,
      [Constants.Stats.BE]: 0,
      [Constants.Stats.ERR]: 0,
      [Constants.Stats.OHB]: 0,
      [Constants.Stats.Physical_DMG]: 0,
      [Constants.Stats.Fire_DMG]: 0,
      [Constants.Stats.Ice_DMG]: 0,
      [Constants.Stats.Lightning_DMG]: 0,
      [Constants.Stats.Wind_DMG]: 0,
      [Constants.Stats.Quantum_DMG]: 0,
      [Constants.Stats.Imaginary_DMG]: 0,
    }
  },
}

/*
 * HP_P: 'HP%',
 * ATK_P: 'ATK%',
 * DEF_P: 'DEF%',
 * HP: 'HP',
 * ATK: 'ATK',
 * DEF: 'DEF',
 * SPD: 'SPD',
 * CD: 'CRIT DMG',
 * CR: 'CRIT Rate',
 * EHR: 'Effect Hit Rate',
 * RES: 'Effect RES',
 * BE: 'Break Effect',
 * ERR: 'Energy Regeneration Rate',
 * OHB: 'Outgoing Healing Boost',
 * Physical_DMG: 'Physical DMG Boost',
 * Fire_DMG: 'Fire DMG Boost',
 * Ice_DMG: 'Ice DMG Boost',
 * Lightning_DMG: 'Lightning DMG Boost',
 * Wind_DMG: 'Wind DMG Boost',
 * Quantum_DMG: 'Quantum DMG Boost',
 * Imaginary_DMG: 'Imaginary DMG Boost'
 */
