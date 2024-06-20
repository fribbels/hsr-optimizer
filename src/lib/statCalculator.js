import { Constants, SubStatValues } from './constants.ts'
import DB from './db'
import { CharacterStats } from './characterStats'
import { Utils } from './utils'

const maxedMainStats = {
  [Constants.Stats.SPD]: [7.613, 11.419, 16.426, 25.032],
  [Constants.Stats.HP]: [139.991, 281.111, 469.647, 705.600],
  [Constants.Stats.ATK]: [69.996, 140.556, 234.824, 352.800],
  [Constants.Stats.HP_P]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.ATK_P]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.DEF_P]: [10.714, 21.514, 35.942, 54.000],
  [Constants.Stats.CR]: [6.428, 12.908, 21.565, 32.400],
  [Constants.Stats.CD]: [12.856, 25.817, 43.130, 64.800],
  [Constants.Stats.OHB]: [6.856, 13.769, 23.003, 34.561],
  [Constants.Stats.EHR]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.BE]: [12.856, 25.817, 43.130, 64.800],
  [Constants.Stats.ERR]: [3.857, 7.745, 12.939, 19.439],
  [Constants.Stats.Physical_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Fire_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Ice_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Lightning_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Wind_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Quantum_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Imaginary_DMG]: [7.714, 15.490, 25.878, 38.880],
}

export const StatCalculator = {
  getMaxedSubstatValue: (stat, quality = 1) => {
    if (quality == 0.8) {
      return Utils.precisionRound(SubStatValues[stat][5].low)
    }
    if (quality == 0.9) {
      return Utils.precisionRound(SubStatValues[stat][5].mid)
    }
    return Utils.precisionRound(SubStatValues[stat][5].high)
  },
  getMaxedStatValue: (stat) => {
    if (stat === 'NONE') { // Fake stat for relic scoring
      return 0
    }
    const scaling = Utils.isFlat(stat) ? 1 : 100
    return Utils.precisionRound(maxedMainStats[stat][3] / scaling)
  },

  getMaxedMainStat: (relic) => {
    return maxedMainStats[relic.main.stat][relic.grade - 2]
  },

  calculateCharacterWithRelics(character, relics) {
    if (!character) return console.log('No character selected')

    const form = character.form
    const characterMetadata = DB.getMetadata().characters[character.id]

    let lightConeMetadata
    let lightConeLevel
    let lightConeSuperimposition
    let lightConeStats
    let superimpositionStats

    if (form.lightCone && form.lightCone != '0') {
      lightConeMetadata = DB.getMetadata().lightCones[form.lightCone]
      lightConeLevel = 80
      lightConeSuperimposition = form.lightConeSuperimposition
      lightConeStats = lightConeMetadata.stats
      superimpositionStats = lightConeMetadata.superimpositions[lightConeSuperimposition]
    } else {
      console.log('No light cone selected')
      lightConeLevel = 0
      lightConeSuperimposition = 0
      lightConeStats = {}
      superimpositionStats = {}
    }

    const traceStats = characterMetadata.traces
    const characterStats = characterMetadata.stats

    const element = characterMetadata.element
    const elementalMultipliers = [
      element == 'Physical' ? 1 : 0,
      element == 'Fire' ? 1 : 0,
      element == 'Ice' ? 1 : 0,
      element == 'Thunder' ? 1 : 0,
      element == 'Wind' ? 1 : 0,
      element == 'Quantum' ? 1 : 0,
      element == 'Imaginary' ? 1 : 0,
    ]

    const baseStats = {
      base: {
        ...CharacterStats.getZeroes(),
        ...characterStats,
      },
      traces: {
        ...CharacterStats.getZeroes(),
        ...traceStats,
      },
      lightCone: {
        ...CharacterStats.getZeroes(),
        ...lightConeStats,
        ...superimpositionStats,
      },
    }

    const lc = baseStats.lightCone
    const base = baseStats.base
    const trace = baseStats.traces

    const { relicSets, ornamentSets } = Utils.relicsToSetArrays(relics)

    /*
     * console.log(characterMetadata, lightConeMetadata)
     * console.log(baseStats)
     * console.log(relics)
     */

    function sum(relics, stat) {
      let total = 0
      for (const relic of relics) {
        if (!relic) continue
        total += relic.augmentedStats[stat] || 0

        if (stat == relic.augmentedStats.mainStat) {
          total += relic.augmentedStats.mainValue
        }
      }

      return total
    }

    const crSum = sum(relics, Constants.Stats.CR)
    const cdSum = sum(relics, Constants.Stats.CD)

    const hero = {
      [Constants.Stats.HP]: (base[Constants.Stats.HP] + lc[Constants.Stats.HP]) * (1 + 0.12 * Math.min(1, ornamentSets[1] >> 1) + 0.12 * Math.min(1, relicSets[12] >> 1) + sum(relics, Constants.Stats.HP_P) + trace[Constants.Stats.HP_P] + lc[Constants.Stats.HP_P]) + sum(relics, Constants.Stats.HP),
      [Constants.Stats.ATK]: (base[Constants.Stats.ATK] + lc[Constants.Stats.ATK]) * (1 + 0.12 * Math.min(1, relicSets[19] >> 1) + 0.12 * Math.min(1, ornamentSets[0] >> 1) + 0.12 * Math.min(1, ornamentSets[10] >> 1) + 0.12 * Math.min(1, ornamentSets[13] >> 1) + 0.12 * Math.min(1, relicSets[1] >> 1) + 0.12 * Math.min(1, relicSets[14] >> 1) + sum(relics, Constants.Stats.ATK_P) + trace[Constants.Stats.ATK_P] + lc[Constants.Stats.ATK_P]) + sum(relics, Constants.Stats.ATK),
      [Constants.Stats.DEF]: (base[Constants.Stats.DEF] + lc[Constants.Stats.DEF]) * (1 + 0.15 * Math.min(1, ornamentSets[3] >> 1) + 0.15 * Math.min(1, relicSets[2] >> 1) + sum(relics, Constants.Stats.DEF_P) + trace[Constants.Stats.DEF_P] + lc[Constants.Stats.DEF_P]) + sum(relics, Constants.Stats.DEF),
      [Constants.Stats.SPD]: (base[Constants.Stats.SPD] + lc[Constants.Stats.SPD]) * (1 + 0.06 * Math.min(1, ornamentSets[15] >> 1) + 0.06 * Math.min(1, relicSets[13] >> 1) + 0.06 * (relicSets[1] >> 2) + sum(relics, Constants.Stats.SPD_P) + trace[Constants.Stats.SPD_P]) + sum(relics, Constants.Stats.SPD) + trace[Constants.Stats.SPD],
      [Constants.Stats.CR]: 0.06 * Math.min(1, relicSets[19] >> 2) + 0.04 * Math.min(1, relicSets[16] >> 2) + 0.08 * Math.min(1, ornamentSets[5] >> 1) + 0.04 * Math.min(1, ornamentSets[12] >> 1) + 0.08 * Math.min(1, ornamentSets[8] >> 1) + (base[Constants.Stats.CR] + lc[Constants.Stats.CR] + crSum + trace[Constants.Stats.CR]),
      [Constants.Stats.CD]: 0.16 * Math.min(1, ornamentSets[4] >> 1) + (base[Constants.Stats.CD] + lc[Constants.Stats.CD] + cdSum + trace[Constants.Stats.CD]),
      [Constants.Stats.EHR]: 0.1 * Math.min(1, ornamentSets[2] >> 1) + (base[Constants.Stats.EHR] + lc[Constants.Stats.EHR] + sum(relics, Constants.Stats.EHR) + trace[Constants.Stats.EHR]),
      [Constants.Stats.RES]: 0.1 * Math.min(1, ornamentSets[9] >> 1) + (base[Constants.Stats.RES] + lc[Constants.Stats.RES] + sum(relics, Constants.Stats.RES) + trace[Constants.Stats.RES]),
      [Constants.Stats.BE]: 0.16 * Math.min(1, relicSets[18] >> 1) + 0.16 * Math.min(1, relicSets[17] >> 1) + 0.16 * Math.min(1, ornamentSets[6] >> 1) + 0.16 * Math.min(1, relicSets[10] >> 1) + 0.16 * (relicSets[10] >> 2) + (base[Constants.Stats.BE] + lc[Constants.Stats.BE] + sum(relics, Constants.Stats.BE) + trace[Constants.Stats.BE]),
      [Constants.Stats.ERR]: 0.05 * Math.min(1, ornamentSets[7] >> 1) + 0.05 * Math.min(1, ornamentSets[11] >> 1) + (base[Constants.Stats.ERR] + lc[Constants.Stats.ERR] + sum(relics, Constants.Stats.ERR) + trace[Constants.Stats.ERR]),
      [Constants.Stats.OHB]: 0.1 * Math.min(1, relicSets[0] >> 1) + (base[Constants.Stats.OHB] + lc[Constants.Stats.OHB] + sum(relics, Constants.Stats.OHB) + trace[Constants.Stats.OHB]),
      [Constants.Stats.Physical_DMG]: 0.1 * Math.min(1, relicSets[4] >> 1) + (base[Constants.Stats.Physical_DMG] + lc[Constants.Stats.Physical_DMG] + sum(relics, Constants.Stats.Physical_DMG) + trace[Constants.Stats.Physical_DMG]),
      [Constants.Stats.Fire_DMG]: 0.1 * Math.min(1, relicSets[6] >> 1) + (base[Constants.Stats.Fire_DMG] + lc[Constants.Stats.Fire_DMG] + sum(relics, Constants.Stats.Fire_DMG) + trace[Constants.Stats.Fire_DMG]),
      [Constants.Stats.Ice_DMG]: 0.1 * Math.min(1, relicSets[3] >> 1) + (base[Constants.Stats.Ice_DMG] + lc[Constants.Stats.Ice_DMG] + sum(relics, Constants.Stats.Ice_DMG) + trace[Constants.Stats.Ice_DMG]),
      [Constants.Stats.Lightning_DMG]: 0.1 * Math.min(1, relicSets[8] >> 1) + (base[Constants.Stats.Lightning_DMG] + lc[Constants.Stats.Lightning_DMG] + sum(relics, Constants.Stats.Lightning_DMG) + trace[Constants.Stats.Lightning_DMG]),
      [Constants.Stats.Wind_DMG]: 0.1 * Math.min(1, relicSets[9] >> 1) + (base[Constants.Stats.Wind_DMG] + lc[Constants.Stats.Wind_DMG] + sum(relics, Constants.Stats.Wind_DMG) + trace[Constants.Stats.Wind_DMG]),
      [Constants.Stats.Quantum_DMG]: 0.1 * Math.min(1, relicSets[7] >> 1) + (base[Constants.Stats.Quantum_DMG] + lc[Constants.Stats.Quantum_DMG] + sum(relics, Constants.Stats.Quantum_DMG) + trace[Constants.Stats.Quantum_DMG]),
      [Constants.Stats.Imaginary_DMG]: 0.1 * Math.min(1, relicSets[11] >> 1) + (base[Constants.Stats.Imaginary_DMG] + lc[Constants.Stats.Imaginary_DMG] + sum(relics, Constants.Stats.Imaginary_DMG) + trace[Constants.Stats.Imaginary_DMG]),
    }

    let elementalDmg = 0
    if (elementalMultipliers[0]) elementalDmg = 0.1 * Math.min(1, relicSets[4] >> 1) + (base[Constants.Stats.Physical_DMG] + lc[Constants.Stats.Physical_DMG] + sum(relics, Constants.Stats.Physical_DMG) + trace[Constants.Stats.Physical_DMG])
    if (elementalMultipliers[1]) elementalDmg = 0.1 * Math.min(1, relicSets[6] >> 1) + (base[Constants.Stats.Fire_DMG] + lc[Constants.Stats.Fire_DMG] + sum(relics, Constants.Stats.Fire_DMG) + trace[Constants.Stats.Fire_DMG])
    if (elementalMultipliers[2]) elementalDmg = 0.1 * Math.min(1, relicSets[3] >> 1) + (base[Constants.Stats.Ice_DMG] + lc[Constants.Stats.Ice_DMG] + sum(relics, Constants.Stats.Ice_DMG) + trace[Constants.Stats.Ice_DMG])
    if (elementalMultipliers[3]) elementalDmg = 0.1 * Math.min(1, relicSets[8] >> 1) + (base[Constants.Stats.Lightning_DMG] + lc[Constants.Stats.Lightning_DMG] + sum(relics, Constants.Stats.Lightning_DMG) + trace[Constants.Stats.Lightning_DMG])
    if (elementalMultipliers[4]) elementalDmg = 0.1 * Math.min(1, relicSets[9] >> 1) + (base[Constants.Stats.Wind_DMG] + lc[Constants.Stats.Wind_DMG] + sum(relics, Constants.Stats.Wind_DMG) + trace[Constants.Stats.Wind_DMG])
    if (elementalMultipliers[5]) elementalDmg = 0.1 * Math.min(1, relicSets[7] >> 1) + (base[Constants.Stats.Quantum_DMG] + lc[Constants.Stats.Quantum_DMG] + sum(relics, Constants.Stats.Quantum_DMG) + trace[Constants.Stats.Quantum_DMG])
    if (elementalMultipliers[6]) elementalDmg = 0.1 * Math.min(1, relicSets[11] >> 1) + (base[Constants.Stats.Imaginary_DMG] + lc[Constants.Stats.Imaginary_DMG] + sum(relics, Constants.Stats.Imaginary_DMG) + trace[Constants.Stats.Imaginary_DMG])

    // let cappedCrit = Math.min(hero[Constants.Stats.CR] + form.buffCr, 1)
    const ehp = hero[Constants.Stats.HP] / (1 - hero[Constants.Stats.DEF] / (hero[Constants.Stats.DEF] + 200 + 10 * 80))
    const cv = 100 * (crSum * 2 + cdSum)

    hero.ED = elementalDmg
    hero.CV = cv
    hero.EHP = ehp

    hero.WEIGHT = 0
    hero.BASIC = 0
    hero.SKILL = 0
    hero.ULT = 0
    hero.FUA = 0
    hero.DOT = 0
    hero.BREAK = 0
    hero.COMBO = 0
    hero.xATK = 0
    hero.xDEF = 0
    hero.xHP = 0
    hero.xSPD = 0
    hero.xCR = 0
    hero.xCD = 0
    hero.xEHR = 0
    hero.xRES = 0
    hero.xBE = 0
    hero.xERR = 0
    hero.xOHB = 0
    hero.xELEMENTAL_DMG = 0

    return hero
  },

  calculate(character) {
    if (!character) return console.log('No character selected')

    const relicsById = window.store.getState().relicsById
    const relics = Object.values(character.equipped).map((x) => relicsById[x])

    return StatCalculator.calculateCharacterWithRelics(character, relics)
  },
}
