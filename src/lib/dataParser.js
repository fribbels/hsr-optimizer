import characters from 'data/characters.json'
import characterPromotions from 'data/character_promotions.json'
import lightCones from 'data/light_cones.json'
import lightConePromotions from 'data/light_cone_promotions.json'
import lightConeRanks from 'data/en/light_cone_ranks.json'
import relicMainAffixes from 'data/relic_main_affixes.json'
import relicSubAffixes from 'data/relic_sub_affixes.json'
import relicSets from 'data/relic_sets.json'
import { Parts, Sets, Stats } from 'lib/constants.ts'
import DB from 'lib/db'
import { PresetEffects } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton.tsx'
import { SortOption } from 'lib/optimizer/sortOptions'

export const UnreleasedSets = {}

export const DataParser = {
  parse: (officialOnly) => {
    if (officialOnly) {
      UnreleasedSets[Constants.SetsRelics.TheWindSoaringValorous] = true
      UnreleasedSets[Constants.SetsRelics.IronCavalryAgainstScourge] = true
      UnreleasedSets[Constants.SetsOrnaments.ForgeOfTheKalpagniLantern] = true
      UnreleasedSets[Constants.SetsOrnaments.DuranDynastyOfRunningWolves] = true

      // Delete unreleased sets
      // delete Constants.SetsRelics.TheWindSoaringValorous
      // delete Constants.SetsRelics.IronCavalryAgainstScourge
      // delete Constants.SetsOrnaments.ForgeOfTheKalpagniLantern
      // delete Constants.SetsOrnaments.DuranDynastyOfRunningWolves
      //
      // delete Constants.SetsRelicsNames.TheWindSoaringValorous
      // delete Constants.SetsRelicsNames.IronCavalryAgainstScourge
      // delete Constants.SetsOrnamentsNames.ForgeOfTheKalpagniLantern
      // delete Constants.SetsOrnamentsNames.DuranDynastyOfRunningWolves

      // Delete unreleased characters
      for (const [key, value] of Object.entries(characters)) {
        if (value.unreleased) {
          delete characters[key]
        }
      }

      // Delete unreleased light cones
      for (const [key, value] of Object.entries(lightCones)) {
        if (value.unreleased) {
          delete lightCones[key]
        }
      }
    }

    for (const [id, characterData] of Object.entries(characters)) {
      characterData.promotions = parseBaseStatsByLevel(characterPromotions[id])

      delete characterData.ranks
      delete characterData.skills
      delete characterData.skill_trees
    }

    const lightConeSuperimpositions = getSuperimpositions()
    const lightConeRanks = getLightConeRanks()
    for (const [id, lcData] of Object.entries(lightCones)) {
      if (lightConeSuperimpositions[id]) {
        lcData.superimpositions = lightConeSuperimpositions[id]
      } else {
        lcData.superimpositions = {}
      }
      lcData.promotions = parseBaseLightConeStatsByLevel(lightConePromotions[id])
      lcData.ranks = lightConeRanks[id]
      lcData.displayName = lcData.name
    }

    const characterTraces = getOverrideTraces()
    const imageCenters = getOverrideImageCenter()
    const scoringMetadata = getScoringMetadata()

    for (const [id, traceData] of Object.entries(characterTraces)) {
      if (!characters[id]) {
        // Unreleased
        continue
      }

      let imageCenter = {x: 1024, y: 1024}
      if (imageCenters[id] != undefined) {
        imageCenter = imageCenters[id]
      }

      characters[id].traces = traceData
      characters[id].imageCenter = imageCenter
      characters[id].displayName = getDisplayName(characters[id])
      characters[id].scoringMetadata = scoringMetadata[id]
      characters[id].scoringMetadata.characterId = id
    }

    const relics = {
      relicMainAffixes,
      relicSubAffixes,
      relicSets,
    }

    const data = {
      characters: characters,
      characterPromotions: characterPromotions,
      nicknames: characterPromotions,
      lightCones: lightCones,
      relics: relics,
    }
    DB.setMetadata(data)

    return data
  },
}

const displayNameMapping = {
  8001: 'Caelus (Destruction)',
  8002: 'Stelle (Destruction)',
  8003: 'Caelus (Preservation)',
  8004: 'Stelle (Preservation)',
  8005: 'Caelus (Harmony)',
  8006: 'Stelle (Harmony)',
  1213: 'Imbibitor Lunae',
}

function getDisplayName(character) {
  if (character.id in displayNameMapping) {
    return displayNameMapping[character.id]
  }
  return character.name
}

function parseBaseLightConeStatsByLevel(promotions) {
  const base = {}
  for (let i = 1; i <= 80; i++) {
    let valueIndex = (Math.floor((i - 1) / 10) - 1)
    if (i <= 20) valueIndex = 0
    if (i > 79) valueIndex = 6

    const statScaling = promotions.values[valueIndex]

    base[i] = {
      [Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
    }
  }

  return base
}

function parseBaseStatsByLevel(promotions) {
  const base = {}
  for (let i = 1; i <= 80; i++) {
    let valueIndex = (Math.floor((i - 1) / 10) - 1)
    if (i <= 20) valueIndex = 0
    if (i > 79) valueIndex = 6

    const statScaling = promotions.values[valueIndex]

    base[i] = {
      [Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Stats.CR]: statScaling['crit_rate'].base + statScaling['crit_rate'].step * (i - 1),
      [Stats.CD]: statScaling['crit_dmg'].base + statScaling['crit_dmg'].step * (i - 1),
      [Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
      [Stats.SPD]: statScaling['spd'].base + statScaling['spd'].step * (i - 1),
    }
  }

  return base
}

function getSuperimpositions() {
  return {
    20000: {}, // Arrows
    20001: {},
    20002: {},
    20003: {
      1: {[Stats.DEF_P]: 0.16},
      2: {[Stats.DEF_P]: 0.20},
      3: {[Stats.DEF_P]: 0.24},
      4: {[Stats.DEF_P]: 0.28},
      5: {[Stats.DEF_P]: 0.32},
    },
    20004: {},
    20005: {},
    20006: {},
    20007: {},
    20008: {},
    20009: {},
    20010: {},
    20011: {},
    20012: {},
    20013: {},
    20014: {},
    20015: {},
    20016: {},
    20017: {},
    20018: {},
    20019: {},
    20020: {},
    21000: {
      1: {[Stats.ERR]: 0.08},
      2: {[Stats.ERR]: 0.10},
      3: {[Stats.ERR]: 0.12},
      4: {[Stats.ERR]: 0.14},
      5: {[Stats.ERR]: 0.16},
    },
    21001: {},
    21002: {
      1: {[Stats.DEF_P]: 0.16},
      2: {[Stats.DEF_P]: 0.18},
      3: {[Stats.DEF_P]: 0.20},
      4: {[Stats.DEF_P]: 0.22},
      5: {[Stats.DEF_P]: 0.24},
    },
    21003: {
      1: {[Stats.ATK_P]: 0.16},
      2: {[Stats.ATK_P]: 0.20},
      3: {[Stats.ATK_P]: 0.24},
      4: {[Stats.ATK_P]: 0.28},
      5: {[Stats.ATK_P]: 0.32},
    },
    21004: {
      1: {[Stats.BE]: 0.28},
      2: {[Stats.BE]: 0.35},
      3: {[Stats.BE]: 0.42},
      4: {[Stats.BE]: 0.49},
      5: {[Stats.BE]: 0.56},
    },
    21005: {},
    21006: {},
    21007: {},
    21008: {
      1: {[Stats.EHR]: 0.20},
      2: {[Stats.EHR]: 0.25},
      3: {[Stats.EHR]: 0.30},
      4: {[Stats.EHR]: 0.35},
      5: {[Stats.EHR]: 0.40},
    },
    21009: {},
    21010: {},
    21011: {},
    21012: {},
    21013: {},
    21014: {
      1: {[Stats.RES]: 0.16},
      2: {[Stats.RES]: 0.20},
      3: {[Stats.RES]: 0.24},
      4: {[Stats.RES]: 0.28},
      5: {[Stats.RES]: 0.32},
    },
    21015: {},
    21016: {
      1: {[Stats.DEF_P]: 0.16},
      2: {[Stats.DEF_P]: 0.20},
      3: {[Stats.DEF_P]: 0.24},
      4: {[Stats.DEF_P]: 0.28},
      5: {[Stats.DEF_P]: 0.32},
    },
    21017: {},
    21018: {},
    21019: {
      1: {[Stats.ATK_P]: 0.16},
      2: {[Stats.ATK_P]: 0.20},
      3: {[Stats.ATK_P]: 0.24},
      4: {[Stats.ATK_P]: 0.28},
      5: {[Stats.ATK_P]: 0.32},
    },
    21020: {
      1: {[Stats.ATK_P]: 0.16},
      2: {[Stats.ATK_P]: 0.20},
      3: {[Stats.ATK_P]: 0.24},
      4: {[Stats.ATK_P]: 0.28},
      5: {[Stats.ATK_P]: 0.32},
    },
    21021: {},
    21022: {
      1: {[Stats.BE]: 0.16},
      2: {[Stats.BE]: 0.20},
      3: {[Stats.BE]: 0.24},
      4: {[Stats.BE]: 0.28},
      5: {[Stats.BE]: 0.32},
    },
    21023: {},
    21024: {},
    21025: {},
    21026: {
      1: {[Stats.ATK_P]: 0.10},
      2: {[Stats.ATK_P]: 0.125},
      3: {[Stats.ATK_P]: 0.15},
      4: {[Stats.ATK_P]: 0.175},
      5: {[Stats.ATK_P]: 0.20},
    },
    21027: {},
    21028: {
      1: {[Stats.HP_P]: 0.16},
      2: {[Stats.HP_P]: 0.20},
      3: {[Stats.HP_P]: 0.24},
      4: {[Stats.HP_P]: 0.28},
      5: {[Stats.HP_P]: 0.32},
    },
    21029: {},
    21030: {
      1: {[Stats.DEF_P]: 0.16},
      2: {[Stats.DEF_P]: 0.20},
      3: {[Stats.DEF_P]: 0.24},
      4: {[Stats.DEF_P]: 0.28},
      5: {[Stats.DEF_P]: 0.32},
    },
    21031: {
      1: {[Stats.CR]: 0.12},
      2: {[Stats.CR]: 0.15},
      3: {[Stats.CR]: 0.18},
      4: {[Stats.CR]: 0.21},
      5: {[Stats.CR]: 0.24},
    },
    21032: {},
    21033: {
      1: {[Stats.ATK_P]: 0.24},
      2: {[Stats.ATK_P]: 0.30},
      3: {[Stats.ATK_P]: 0.36},
      4: {[Stats.ATK_P]: 0.42},
      5: {[Stats.ATK_P]: 0.48},
    },
    21034: {},
    21035: {
      1: {[Stats.BE]: 0.24},
      2: {[Stats.BE]: 0.30},
      3: {[Stats.BE]: 0.36},
      4: {[Stats.BE]: 0.42},
      5: {[Stats.BE]: 0.48},
    },
    21036: {},
    21037: {
      1: {[Stats.ATK_P]: 0.12},
      2: {[Stats.ATK_P]: 0.14},
      3: {[Stats.ATK_P]: 0.16},
      4: {[Stats.ATK_P]: 0.18},
      5: {[Stats.ATK_P]: 0.20},
    },
    21038: {},
    21039: {
      1: {[Stats.RES]: 0.12},
      2: {[Stats.RES]: 0.14},
      3: {[Stats.RES]: 0.16},
      4: {[Stats.RES]: 0.18},
      5: {[Stats.RES]: 0.20},
    },
    21040: {
      1: {[Stats.ATK_P]: 0.16},
      2: {[Stats.ATK_P]: 0.18},
      3: {[Stats.ATK_P]: 0.20},
      4: {[Stats.ATK_P]: 0.22},
      5: {[Stats.ATK_P]: 0.24},
    },
    21041: {},
    21042: {
      1: {[Stats.BE]: 0.28},
      2: {[Stats.BE]: 0.35},
      3: {[Stats.BE]: 0.42},
      4: {[Stats.BE]: 0.49},
      5: {[Stats.BE]: 0.56},
    },
    21043: {
      1: {[Stats.DEF_P]: 0.16},
      2: {[Stats.DEF_P]: 0.20},
      3: {[Stats.DEF_P]: 0.24},
      4: {[Stats.DEF_P]: 0.28},
      5: {[Stats.DEF_P]: 0.32},
    },
    21044: {
      1: {[Stats.CR]: 0.08},
      2: {[Stats.CR]: 0.10},
      3: {[Stats.CR]: 0.12},
      4: {[Stats.CR]: 0.14},
      5: {[Stats.CR]: 0.16},
    },
    21045: {
      1: {[Constants.Stats.BE]: 0.28},
      2: {[Constants.Stats.BE]: 0.35},
      3: {[Constants.Stats.BE]: 0.42},
      4: {[Constants.Stats.BE]: 0.49},
      5: {[Constants.Stats.BE]: 0.56},
    },
    22000: {
      1: {[Stats.EHR]: 0.20},
      2: {[Stats.EHR]: 0.25},
      3: {[Stats.EHR]: 0.30},
      4: {[Stats.EHR]: 0.35},
      5: {[Stats.EHR]: 0.40},
    },
    22001: {
      1: {[Stats.HP_P]: 0.08},
      2: {[Stats.HP_P]: 0.09},
      3: {[Stats.HP_P]: 0.10},
      4: {[Stats.HP_P]: 0.11},
      5: {[Stats.HP_P]: 0.12},
    },
    22002: {
      1: {[Stats.ATK_P]: 0.16},
      2: {[Stats.ATK_P]: 0.20},
      3: {[Stats.ATK_P]: 0.24},
      4: {[Stats.ATK_P]: 0.28},
      5: {[Stats.ATK_P]: 0.32},
    },
    23000: {},
    23001: {
      1: {[Stats.CR]: 0.18},
      2: {[Stats.CR]: 0.21},
      3: {[Stats.CR]: 0.24},
      4: {[Stats.CR]: 0.27},
      5: {[Stats.CR]: 0.30},
    },
    23002: {
      1: {[Stats.ATK_P]: 0.24},
      2: {[Stats.ATK_P]: 0.28},
      3: {[Stats.ATK_P]: 0.32},
      4: {[Stats.ATK_P]: 0.36},
      5: {[Stats.ATK_P]: 0.40},
    },
    23003: {},
    23004: {},
    23005: {
      1: {[Stats.DEF_P]: 0.24, [Stats.EHR]: 0.24},
      2: {[Stats.DEF_P]: 0.28, [Stats.EHR]: 0.28},
      3: {[Stats.DEF_P]: 0.32, [Stats.EHR]: 0.32},
      4: {[Stats.DEF_P]: 0.36, [Stats.EHR]: 0.36},
      5: {[Stats.DEF_P]: 0.40, [Stats.EHR]: 0.40},
    },
    23006: {},
    23007: {
      1: {[Stats.EHR]: 0.24},
      2: {[Stats.EHR]: 0.28},
      3: {[Stats.EHR]: 0.32},
      4: {[Stats.EHR]: 0.36},
      5: {[Stats.EHR]: 0.40},
    },
    23008: {
      1: {[Stats.ATK_P]: 0.24},
      2: {[Stats.ATK_P]: 0.28},
      3: {[Stats.ATK_P]: 0.32},
      4: {[Stats.ATK_P]: 0.36},
      5: {[Stats.ATK_P]: 0.40},
    },
    23009: {
      1: {[Stats.CR]: 0.18, [Stats.HP_P]: 0.18},
      2: {[Stats.CR]: 0.21, [Stats.HP_P]: 0.21},
      3: {[Stats.CR]: 0.24, [Stats.HP_P]: 0.24},
      4: {[Stats.CR]: 0.27, [Stats.HP_P]: 0.27},
      5: {[Stats.CR]: 0.30, [Stats.HP_P]: 0.30},
    },
    23010: {
      1: {[Stats.CD]: 0.36},
      2: {[Stats.CD]: 0.42},
      3: {[Stats.CD]: 0.48},
      4: {[Stats.CD]: 0.54},
      5: {[Stats.CD]: 0.60},
    },
    23011: {
      1: {[Stats.HP_P]: 0.24, [Stats.ERR]: 0.12},
      2: {[Stats.HP_P]: 0.28, [Stats.ERR]: 0.14},
      3: {[Stats.HP_P]: 0.32, [Stats.ERR]: 0.16},
      4: {[Stats.HP_P]: 0.36, [Stats.ERR]: 0.18},
      5: {[Stats.HP_P]: 0.40, [Stats.ERR]: 0.20},
    },
    23012: {
      1: {[Stats.CD]: 0.30},
      2: {[Stats.CD]: 0.35},
      3: {[Stats.CD]: 0.40},
      4: {[Stats.CD]: 0.45},
      5: {[Stats.CD]: 0.50},
    },
    23013: {
      1: {[Stats.HP_P]: 0.18, [Stats.OHB]: 0.12},
      2: {[Stats.HP_P]: 0.21, [Stats.OHB]: 0.14},
      3: {[Stats.HP_P]: 0.24, [Stats.OHB]: 0.16},
      4: {[Stats.HP_P]: 0.27, [Stats.OHB]: 0.18},
      5: {[Stats.HP_P]: 0.30, [Stats.OHB]: 0.20},
    },
    23014: {
      1: {[Stats.CD]: 0.20},
      2: {[Stats.CD]: 0.23},
      3: {[Stats.CD]: 0.26},
      4: {[Stats.CD]: 0.29},
      5: {[Stats.CD]: 0.32},
    },
    23015: {
      1: {[Stats.CR]: 0.18},
      2: {[Stats.CR]: 0.21},
      3: {[Stats.CR]: 0.24},
      4: {[Stats.CR]: 0.27},
      5: {[Stats.CR]: 0.30},
    },
    23016: {
      1: {[Stats.CR]: 0.18},
      2: {[Stats.CR]: 0.21},
      3: {[Stats.CR]: 0.24},
      4: {[Stats.CR]: 0.27},
      5: {[Stats.CR]: 0.30},
    },
    23017: {
      1: {[Stats.ERR]: 0.12},
      2: {[Stats.ERR]: 0.14},
      3: {[Stats.ERR]: 0.16},
      4: {[Stats.ERR]: 0.18},
      5: {[Stats.ERR]: 0.20},
    },
    23018: {
      1: {[Stats.CD]: 0.36},
      2: {[Stats.CD]: 0.42},
      3: {[Stats.CD]: 0.48},
      4: {[Stats.CD]: 0.54},
      5: {[Stats.CD]: 0.60},
    },
    23019: {
      1: {[Stats.BE]: 0.60},
      2: {[Stats.BE]: 0.70},
      3: {[Stats.BE]: 0.80},
      4: {[Stats.BE]: 0.90},
      5: {[Stats.BE]: 1.00},
    },
    23020: {
      1: {[Stats.CD]: 0.20},
      2: {[Stats.CD]: 0.23},
      3: {[Stats.CD]: 0.26},
      4: {[Stats.CD]: 0.29},
      5: {[Stats.CD]: 0.32},
    },
    23021: { // Earthly Escapade
      1: {[Stats.CD]: 0.32},
      2: {[Stats.CD]: 0.39},
      3: {[Stats.CD]: 0.46},
      4: {[Stats.CD]: 0.53},
      5: {[Stats.CD]: 0.60},
    },
    23022: { // Reforged Remembrance
      1: {[Stats.EHR]: 0.40},
      2: {[Stats.EHR]: 0.45},
      3: {[Stats.EHR]: 0.50},
      4: {[Stats.EHR]: 0.55},
      5: {[Stats.EHR]: 0.60},
    },
    23023: {
      1: {[Stats.DEF_P]: 0.40},
      2: {[Stats.DEF_P]: 0.46},
      3: {[Stats.DEF_P]: 0.52},
      4: {[Stats.DEF_P]: 0.58},
      5: {[Stats.DEF_P]: 0.64},
    },
    23024: {
      1: {[Stats.CD]: 0.36},
      2: {[Stats.CD]: 0.42},
      3: {[Stats.CD]: 0.48},
      4: {[Stats.CD]: 0.54},
      5: {[Stats.CD]: 0.60},
    },
    23025: {
      1: {[Constants.Stats.BE]: 0.60},
      2: {[Constants.Stats.BE]: 0.70},
      3: {[Constants.Stats.BE]: 0.80},
      4: {[Constants.Stats.BE]: 0.90},
      5: {[Constants.Stats.BE]: 1.00},
    },
    23026: {},
    23027: {
      1: {[Stats.BE]: 0.60},
      2: {[Stats.BE]: 0.70},
      3: {[Stats.BE]: 0.80},
      4: {[Stats.BE]: 0.90},
      5: {[Stats.BE]: 1.00},
    },
    23028: {
      1: {[Constants.Stats.CR]: 0.16},
      2: {[Constants.Stats.CR]: 0.19},
      3: {[Constants.Stats.CR]: 0.22},
      4: {[Constants.Stats.CR]: 0.25},
      5: {[Constants.Stats.CR]: 0.28},
    },
    24000: {},
    24001: {
      1: {[Stats.CR]: 0.08},
      2: {[Stats.CR]: 0.10},
      3: {[Stats.CR]: 0.12},
      4: {[Stats.CR]: 0.14},
      5: {[Stats.CR]: 0.16},
    },
    24002: {
      1: {[Stats.RES]: 0.08},
      2: {[Stats.RES]: 0.10},
      3: {[Stats.RES]: 0.12},
      4: {[Stats.RES]: 0.14},
      5: {[Stats.RES]: 0.16},
    },
    24003: {
      1: {[Stats.BE]: 0.20},
      2: {[Stats.BE]: 0.25},
      3: {[Stats.BE]: 0.30},
      4: {[Stats.BE]: 0.35},
      5: {[Stats.BE]: 0.40},
    },
    24004: {
      1: {[Constants.Stats.ATK_P]: 0.08},
      2: {[Constants.Stats.ATK_P]: 0.09},
      3: {[Constants.Stats.ATK_P]: 0.10},
      4: {[Constants.Stats.ATK_P]: 0.11},
      5: {[Constants.Stats.ATK_P]: 0.12},
    },
  }
}

function getOverrideTraces() {
  return {
    1001: { // March 7th
      [Stats.Ice_DMG]: 0.224,
      [Stats.DEF_P]: 0.225,
      [Stats.RES]: 0.1,
    },
    1002: { // Dan Heng
      [Stats.Wind_DMG]: 0.224,
      [Stats.ATK_P]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    1003: { // Himeko
      [Stats.Fire_DMG]: 0.224,
      [Stats.ATK_P]: 0.18,
      [Stats.RES]: 0.1,
    },
    1004: { // Welt
      [Stats.ATK_P]: 0.28,
      [Stats.Imaginary_DMG]: 0.144,
      [Stats.RES]: 0.1,
    },
    1005: { // Kafka
      [Stats.ATK_P]: 0.28,
      [Stats.EHR]: 0.18,
      [Stats.HP_P]: 0.1,
    },
    1006: { // Silver Wolf
      [Stats.ATK_P]: 0.28,
      [Stats.EHR]: 0.18,
      [Stats.Quantum_DMG]: 0.08,
    },
    1008: { // Arlan
      [Stats.ATK_P]: 0.28,
      [Stats.RES]: 0.12,
      [Stats.HP_P]: 0.1,
    },
    1009: { // Asta
      [Stats.Fire_DMG]: 0.224,
      [Stats.DEF_P]: 0.225,
      [Stats.CR]: 0.067,
    },
    1013: { // Herta
      [Stats.Ice_DMG]: 0.224,
      [Stats.DEF_P]: 0.225,
      [Stats.CR]: 0.067,
    },
    1101: { // Bronya
      [Stats.Wind_DMG]: 0.224,
      [Stats.CD]: 0.24,
      [Stats.RES]: 0.10,
    },
    1102: { // Seele
      [Stats.ATK_P]: 0.28,
      [Stats.CD]: 0.24,
      [Stats.DEF_P]: 0.125,
    },
    1103: { // Serval
      [Stats.CR]: 0.187,
      [Stats.EHR]: 0.18,
      [Stats.RES]: 0.1,
    },
    1104: { // Gepard
      [Stats.Ice_DMG]: 0.224,
      [Stats.RES]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    1105: { // Natasha
      [Stats.HP_P]: 0.28,
      [Stats.DEF_P]: 0.125,
      [Stats.RES]: 0.18,
    },
    1106: { // Pela
      [Stats.Ice_DMG]: 0.224,
      [Stats.ATK_P]: 0.18,
      [Stats.EHR]: 0.1,
    },
    1107: { // Clara
      [Stats.ATK_P]: 0.28,
      [Stats.Physical_DMG]: 0.144,
      [Stats.HP_P]: 0.1,
    },
    1108: { // Sampo
      [Stats.ATK_P]: 0.28,
      [Stats.EHR]: 0.18,
      [Stats.RES]: 0.1,
    },
    1109: { // Hook
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.CD]: 0.133,
    },
    1110: { // Lynx
      [Stats.HP_P]: 0.28,
      [Stats.DEF_P]: 0.225,
      [Stats.RES]: 0.1,
    },
    1111: { // Luka
      [Stats.ATK_P]: 0.28,
      [Stats.EHR]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    1112: { // Topaz and Numby
      [Stats.Fire_DMG]: 0.224,
      [Stats.CR]: 0.12,
      [Stats.HP_P]: 0.1,
    },
    1201: { // Qingque
      [Stats.ATK_P]: 0.28,
      [Stats.Quantum_DMG]: 0.144,
      [Stats.DEF_P]: 0.125,
    },
    1202: { // Tingyun
      [Stats.ATK_P]: 0.28,
      [Stats.DEF_P]: 0.225,
      [Stats.Lightning_DMG]: 0.08,
    },
    1203: { // Luocha
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    1204: { // Jing Yuan
      [Stats.ATK_P]: 0.28,
      [Stats.DEF_P]: 0.125,
      [Stats.CR]: 0.12,
    },
    1205: { // Blade
      [Stats.HP_P]: 0.28,
      [Stats.CR]: 0.12,
      [Stats.RES]: 0.1,
    },
    1206: { // Sushang
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    1207: { // Yukong
      [Stats.Imaginary_DMG]: 0.224,
      [Stats.HP_P]: 0.18,
      [Stats.ATK_P]: 0.1,
    },
    1208: { // Fu Xuan
      [Stats.CR]: 0.187,
      [Stats.HP_P]: 0.18,
      [Stats.RES]: 0.1,
    },
    1209: { // Yanqing
      [Stats.ATK_P]: 0.28,
      [Stats.Ice_DMG]: 0.144,
      [Stats.HP_P]: 0.1,
    },
    1210: { // Guinaifen
      [Stats.Fire_DMG]: 0.224,
      [Stats.EHR]: 0.1,
      [Stats.BE]: 0.24,
    },
    1211: { // Bailu
      [Stats.HP_P]: 0.28,
      [Stats.DEF_P]: 0.225,
      [Stats.RES]: 0.1,
    },
    1212: { // Jingliu
      [Stats.HP_P]: 0.10,
      [Stats.SPD]: 9,
      [Stats.CD]: 0.373,
    },
    1213: { // Dan Heng • Imbibitor Lunae
      [Stats.Imaginary_DMG]: 0.224,
      [Stats.CR]: 0.12,
      [Stats.HP_P]: 0.1,
    },
    1214: { // Xueyi
      [Stats.Quantum_DMG]: 0.08,
      [Stats.HP_P]: 0.18,
      [Stats.BE]: 0.373,
    },
    1215: { // Hanya
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.1,
      [Stats.SPD]: 9,
    },
    1217: { // Huohuo
      [Stats.HP_P]: 0.28,
      [Stats.RES]: 0.18,
      [Stats.SPD]: 5,
    },
    1301: { // Gallagher
      [Stats.BE]: 0.133,
      [Stats.HP_P]: 0.18,
      [Stats.RES]: 0.28,
    },
    1302: { // Argenti
      [Stats.ATK_P]: 0.28,
      [Stats.Physical_DMG]: 0.144,
      [Stats.HP_P]: 0.1,
    },
    1303: { // Ruan Mei
      [Stats.BE]: 0.373,
      [Stats.DEF_P]: 0.225,
      [Stats.SPD]: 5,
    },
    1304: { // Aventurine
      [Stats.DEF_P]: 0.35,
      [Stats.Imaginary_DMG]: 0.144,
      [Stats.RES]: 0.10,
    },
    1305: { // Dr Ratio
      [Stats.ATK_P]: 0.28,
      [Stats.CR]: 0.12,
      [Stats.DEF_P]: 0.125,
    },
    1306: { // Sparkle
      [Stats.HP_P]: 0.28,
      [Stats.CD]: 0.24,
      [Stats.RES]: 0.10,
    },
    1307: { // Black Swan
      [Stats.ATK_P]: 0.28,
      [Stats.Wind_DMG]: 0.144,
      [Stats.EHR]: 0.10,
    },
    1308: { // Acheron
      [Stats.ATK_P]: 0.28,
      [Stats.Lightning_DMG]: 0.08,
      [Stats.CD]: 0.24,
    },
    1309: { // Robin
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.SPD]: 5,
    },
    1310: { // Firefly
      [Constants.Stats.BE]: 0.373,
      [Constants.Stats.RES]: 0.18,
      [Constants.Stats.SPD]: 5,
    },
    1312: { // Misha
      [Stats.Ice_DMG]: 0.224,
      [Stats.DEF_P]: 0.225,
      [Stats.CR]: 0.067,
    },
    1314: { // Jade
      [Constants.Stats.Quantum_DMG]: 0.224,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.RES]: 0.10,
    },
    1315: { // Boothill
      [Stats.BE]: 0.373,
      [Stats.ATK_P]: 0.18,
      [Stats.HP_P]: 0.10,
    },
    8001: { // Physical Trailblazer
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    8002: { // Physical Trailblazer
      [Stats.ATK_P]: 0.28,
      [Stats.HP_P]: 0.18,
      [Stats.DEF_P]: 0.125,
    },
    8003: { // Fire Trailblazer
      [Stats.DEF_P]: 0.35,
      [Stats.ATK_P]: 0.18,
      [Stats.HP_P]: 0.1,
    },
    8004: { // Fire Trailblazer
      [Stats.DEF_P]: 0.35,
      [Stats.ATK_P]: 0.18,
      [Stats.HP_P]: 0.1,
    },
    8005: { // Imaginary Trailblazer
      [Stats.BE]: 0.373,
      [Stats.Imaginary_DMG]: 0.144,
      [Stats.RES]: 0.10,
    },
    8006: { // Imaginary Trailblazer
      [Stats.BE]: 0.373,
      [Stats.Imaginary_DMG]: 0.144,
      [Stats.RES]: 0.10,
    },
  }
}

function getOverrideImageCenter() {
  return {
    1001: { // March 7th
      x: 1024,
      y: 1100,
    },
    1002: { // Dan Heng
      x: 1024,
      y: 1000,
    },
    1003: { // Himeko
      x: 1024,
      y: 1120,
    },
    1004: { // Welt
      x: 885,
      y: 1000,
    },
    1005: { // Kafka
      x: 980,
      y: 1024,
    },
    1006: { // Silver Wolf
      x: 1010,
      y: 1024,
    },
    1008: { // Arlan
      x: 1240,
      y: 1024,
    },
    1009: { // Asta
      x: 1024,
      y: 1000,
    },
    1013: { // Herta
      x: 970,
      y: 1010,
    },
    1101: { // Bronya
      x: 950,
      y: 1180,
    },
    1102: { // Seele
      x: 820,
      y: 1060,
    },
    1103: { // Serval
      x: 1050,
      y: 1024,
    },
    1104: { // Gepard
      x: 1150,
      y: 1110,
    },
    1105: { // Natasha
      x: 1040,
      y: 1024,
    },
    1106: { // Pela
      x: 780,
      y: 1100,
    },
    1107: { // Clara
      x: 880,
      y: 980,
    },
    1108: { // Sampo
      x: 1024,
      y: 1024,
    },
    1109: { // Hook
      x: 930,
      y: 1024,
    },
    1110: { // Lynx
      x: 1180,
      y: 1000,
    },
    1111: { // Luka
      x: 930,
      y: 1024,
    },
    1112: { // Topaz and Numby
      x: 1120,
      y: 930,
    },
    1201: { // Qingque
      x: 1000,
      y: 1024,
    },
    1202: { // Tingyun
      x: 1024,
      y: 950,
    },
    1203: { // Luocha
      x: 1024,
      y: 1024,
    },
    1204: { // Jing Yuan
      x: 1060,
      y: 1024,
    },
    1205: { // Blade
      x: 990,
      y: 900,
    },
    1206: { // Sushang
      x: 1100,
      y: 1024,
    },
    1207: { // Yukong
      x: 900,
      y: 1050,
    },
    1208: { // Fu Xuan
      x: 920,
      y: 950,
    },
    1209: { // Yanqing
      x: 1024,
      y: 1024,
    },
    1210: { // Guinaifen
      x: 1024,
      y: 1024,
    },
    1211: { // Bailu
      x: 1000,
      y: 950,
    },
    1212: { // Jingliu
      x: 1024,
      y: 940,
    },
    1213: { // Dan Heng • Imbibitor Lunae
      x: 1050,
      y: 1024,
    },
    1214: { // Xueyi
      x: 1000,
      y: 1024,
    },
    1215: { // Hanya
      x: 1000,
      y: 1024,
    },
    1217: { // Huohuo
      x: 950,
      y: 950,
    },
    1301: { // Gallagher
      x: 1150,
      y: 1024,
    },
    1302: { // Argenti
      x: 680,
      y: 1000,
    },
    1303: { // Ruan Mei
      x: 1060,
      y: 1050,
    },
    1304: { // Aventurine
      x: 1150,
      y: 1024,
    },
    1305: { // Dr Ratio
      x: 900,
      y: 850,
    },
    1306: { // Sparkle
      x: 1050,
      y: 1050,
    },
    1307: { // Black Swan
      x: 920,
      y: 950,
    },
    1308: { // Acheron
      x: 1000,
      y: 960,
    },
    1309: { // Robin
      x: 1024,
      y: 900,
    },
    1310: { // Firefly
      x: 900,
      y: 1150,
    },
    1312: { // Misha
      x: 1050,
      y: 1075,
    },
    1314: { // Jade
      x: 1024,
      y: 950,
    },
    1315: { // Boothill
      x: 1000,
      y: 1100,
    },
    8001: { // Physical Trailblazer M
      x: 1024,
      y: 1100,
    },
    8002: { // Physical Trailblazer F
      x: 1024,
      y: 1024,
    },
    8003: { // Fire Trailblazer M
      x: 980,
      y: 1024,
    },
    8004: { // Fire Trailblazer F
      x: 1050,
      y: 1024,
    },
    8005: { // Imaginary Trailblazer M
      x: 1050,
      y: 1000,
    },
    8006: { // Imaginary Trailblazer F
      x: 1050,
      y: 1000,
    },
  }
}

function getScoringMetadata() {
  return {
    1001: { // March 7th
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.KnightOfPurityPalace,
        Sets.GuardOfWutheringSnow,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BelobogOfTheArchitects,
        Sets.SprightlyVonwacq,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.DEF,
    },
    1002: { // Dan Heng
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 1,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Wind_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.EagleOfTwilightLine,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Wind_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PioneerDiverOfDeadWaters,
        relicSet2: Sets.PioneerDiverOfDeadWaters,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1003: { // Himeko
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.TheAshblazingGrandDuke,
        Sets.FiresmithOfLavaForging,
        Sets.GeniusOfBrilliantStars,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.FirmamentFrontlineGlamoth,
        Sets.InertSalsotto,
        Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(4),
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Fire_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 3,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.TheAshblazingGrandDuke,
        relicSet2: Sets.TheAshblazingGrandDuke,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1112', // Topaz
            lightCone: '23016', // Worrisome
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '23023', // Unjust destiny
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1004: { // Welt
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.WastelanderOfBanditryDesert,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.PanCosmicCommercialEnterprise,
        Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.EHR,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Imaginary_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.EHR,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.WastelanderOfBanditryDesert,
        relicSet2: Sets.WastelanderOfBanditryDesert,
        ornamentSet: Sets.PanCosmicCommercialEnterprise,
        teammates: [
          {
            characterId: '1308', // Acheron
            lightCone: '23024', // Shore
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1106', // Pela
            lightCone: '21015', // Pearls
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1005: { // Kafka
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.5,
        [Stats.CD]: 0.5,
        [Stats.EHR]: 0.5,
        [Stats.RES]: 0,
        [Stats.BE]: 0.75,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 1,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.ATK_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.PrisonerInDeepConfinement,
        Sets.BandOfSizzlingThunder,
        Sets.GeniusOfBrilliantStars,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FirmamentFrontlineGlamoth,
        Sets.SpaceSealingStation,
        Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
        PresetEffects.fnAshblazingSet(6),
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.DOT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.ATK_P,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Lightning_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.ATK_P,
          Stats.ATK,
          Stats.EHR,
          Stats.SPD,
          Stats.CR,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 2,
          DOT: 6,
          BREAK: 0,
        },
        relicSet1: Sets.PrisonerInDeepConfinement,
        relicSet2: Sets.PrisonerInDeepConfinement,
        ornamentSet: Sets.FirmamentFrontlineGlamoth,
        teammates: [
          {
            characterId: '1307', // Swan
            lightCone: '23022', // Reforged
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1006: { // Silver Wolf
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.75,
        [Stats.CD]: 0.75,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 0.75,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 1,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Quantum_DMG,
          Stats.ATK_P,
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.EagleOfTwilightLine,
        Sets.ThiefOfShootingMeteor,
        Sets.GeniusOfBrilliantStars,
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.BrokenKeel,
        Sets.FleetOfTheAgeless,
        Sets.InertSalsotto,
        Sets.SpaceSealingStation,
        Sets.SprightlyVonwacq,
        Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
    },
    1008: { // Arlan
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 1,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.BandOfSizzlingThunder,
        Sets.LongevousDisciple,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Lightning_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.BandOfSizzlingThunder,
        relicSet2: Sets.BandOfSizzlingThunder,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1009: { // Asta
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.ThiefOfShootingMeteor,
        Sets.MusketeerOfWildWheat,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [],
      sortOption: SortOption.SPD,
    },
    1013: { // Herta
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 1,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.HunterOfGlacialForest,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(4),
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Ice_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 3,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.TheAshblazingGrandDuke,
        relicSet2: Sets.TheAshblazingGrandDuke,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1003', // Himeko
            lightCone: '23000', // Milky way
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1101: { // Bronya
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 1,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.Wind_DMG,
          Stats.Physical_DMG,
          Stats.Fire_DMG,
          Stats.Ice_DMG,
          Stats.Lightning_DMG,
          Stats.Quantum_DMG,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.EagleOfTwilightLine,
        Sets.MusketeerOfWildWheat,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [],
      sortOption: SortOption.CD,
    },
    1102: { // Seele
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
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
        [Stats.Quantum_DMG]: 1,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Quantum_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.GeniusOfBrilliantStars,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Quantum_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.GeniusOfBrilliantStars,
        relicSet2: Sets.GeniusOfBrilliantStars,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1006', // SW
            lightCone: '23007', // Rain
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1306', // Sparkle
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1103: { // Serval
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 1,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.ATK_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.BandOfSizzlingThunder,
        Sets.MusketeerOfWildWheat,
        Sets.ThiefOfShootingMeteor,
      ],
      ornamentSets: [
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Lightning_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.BandOfSizzlingThunder,
        relicSet2: Sets.BandOfSizzlingThunder,
        ornamentSet: Sets.FirmamentFrontlineGlamoth,
        teammates: [
          {
            characterId: '1005', // Kafka
            lightCone: '23006', // Patience
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1104: { // Gepard
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.KnightOfPurityPalace,
        Sets.GuardOfWutheringSnow,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BelobogOfTheArchitects,
        Sets.SprightlyVonwacq,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.DEF,
    },
    1105: { // Natasha
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.OHB,
        ],
        [Parts.Feet]: [
          Stats.HP_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.LongevousDisciple,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.EHP,
    },
    1106: { // Pela
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 1,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.EHR,
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.EagleOfTwilightLine,
        Sets.MusketeerOfWildWheat,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.PanCosmicCommercialEnterprise,
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [],
      sortOption: SortOption.SPD,
    },
    1107: { // Clara
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.ChampionOfStreetwiseBoxing,
        Sets.TheAshblazingGrandDuke,
        Sets.LongevousDisciple,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(2),
        PresetEffects.fnWindSoaringSet(2),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 1,
          ULT: 0,
          FUA: 3,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.ChampionOfStreetwiseBoxing,
        relicSet2: Sets.ChampionOfStreetwiseBoxing,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1112', // Topaz
            lightCone: '23016', // Worrisome
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '21016', // Trend
            characterEidolon: 0,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1108: { // Sampo
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 1,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 1,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.ATK_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Wind_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
        Sets.ThiefOfShootingMeteor,
        Sets.PrisonerInDeepConfinement,
        Sets.EagleOfTwilightLine,
      ],
      ornamentSets: [
        Sets.PanCosmicCommercialEnterprise,
        Sets.FirmamentFrontlineGlamoth,
        Sets.SpaceSealingStation,
        Sets.FleetOfTheAgeless,
        Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.ATK_P,
            Stats.EHR,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Wind_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.ATK_P,
          Stats.EHR,
          Stats.ATK,
          Stats.SPD,
          Stats.CR
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 30,
          BREAK: 0,
        },
        relicSet1: Sets.PrisonerInDeepConfinement,
        relicSet2: Sets.PrisonerInDeepConfinement,
        ornamentSet: Sets.FirmamentFrontlineGlamoth,
        teammates: [
          {
            characterId: '1005', // Kafka
            lightCone: '23006', // Patience
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1109: { // Hook
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.MusketeerOfWildWheat,
        Sets.FiresmithOfLavaForging,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Fire_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PioneerDiverOfDeadWaters,
        relicSet2: Sets.PioneerDiverOfDeadWaters,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1110: { // Lynx
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.OHB,
        ],
        [Parts.Feet]: [
          Stats.HP_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.LongevousDisciple,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.EHP,
    },
    1111: { // Luka
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 0.75,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.ATK_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
        Sets.ThiefOfShootingMeteor,
        Sets.PrisonerInDeepConfinement,
      ],
      ornamentSets: [
        Sets.PanCosmicCommercialEnterprise,
        Sets.FirmamentFrontlineGlamoth,
        Sets.SpaceSealingStation,
        Sets.FleetOfTheAgeless,
        Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.EHR,
            Stats.ATK_P,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.ATK,
          Stats.EHR,
          Stats.SPD,
        ],
        formula: {
          BASIC: 2,
          SKILL: 1,
          ULT: 1,
          FUA: 0,
          DOT: 2,
          BREAK: 1,
        },
        relicSet1: Sets.PrisonerInDeepConfinement,
        relicSet2: Sets.PrisonerInDeepConfinement,
        ornamentSet: Sets.TaliaKingdomOfBanditry,
        teammates: [
          {
            characterId: '1005', // Kafka
            lightCone: '23006', // Patience
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1112: { // Topaz and Numby
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Fire_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.TheAshblazingGrandDuke,
        Sets.FiresmithOfLavaForging,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(0),
        PresetEffects.fnWindSoaringSet(2),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Fire_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 1,
          ULT: 0,
          FUA: 2,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.TheAshblazingGrandDuke,
        relicSet2: Sets.TheAshblazingGrandDuke,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1305', // Ratio
            lightCone: '23020', // Baptism
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1309', // Robin
            lightCone: '23026', // Nightglow
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '23023', // Unjust destiny
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1201: { // Qingque
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
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
        [Stats.Quantum_DMG]: 1,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Quantum_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.GeniusOfBrilliantStars,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.BASIC,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Quantum_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 2,
          SKILL: 0,
          ULT: 1,
          FUA: 2,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.GeniusOfBrilliantStars,
        relicSet2: Sets.GeniusOfBrilliantStars,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1006', // SW
            lightCone: '23007', // Rain
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1306', // Sparkle
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1202: { // Tingyun
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.MusketeerOfWildWheat,
        Sets.KnightOfPurityPalace,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [],
      sortOption: SortOption.SPD,
    },
    1203: { // Luocha
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.OHB,
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.MusketeerOfWildWheat,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
        Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.SPD,
    },
    1204: { // Jing Yuan
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 1,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.TheAshblazingGrandDuke,
        Sets.BandOfSizzlingThunder,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(8),
        PresetEffects.fnWindSoaringSet(2),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Lightning_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 1,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.TheAshblazingGrandDuke,
        relicSet2: Sets.TheAshblazingGrandDuke,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1306', // Sparkle
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1205: { // Blade
      stats: {
        [Stats.ATK]: 0.25,
        [Stats.ATK_P]: 0.25,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 1,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.Wind_DMG,
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
        ],
      },
      relicSets: [
        Sets.MessengerTraversingHackerspace,
        Sets.EagleOfTwilightLine,
        Sets.LongevousDisciple,
      ],
      ornamentSets: [
        Sets.InertSalsotto,
        Sets.RutilantArena,
      ],
      presets: [
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.BASIC,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.HP_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.HP_P,
            Stats.Wind_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.HP_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.HP_P,
          Stats.ATK_P,
          Stats.SPD,
        ],
        formula: {
          BASIC: 2,
          SKILL: 0,
          ULT: 1,
          FUA: 1,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.LongevousDisciple,
        relicSet2: Sets.LongevousDisciple,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1212', // Jingliu
            lightCone: '23014', // I shall
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1203', // Luocha
            lightCone: '20015', // Multi
            characterEidolon: 0,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1206: { // Sushang
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.ChampionOfStreetwiseBoxing,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.CR,
          Stats.ATK_P,
          Stats.CD,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 1,
        },
        relicSet1: Sets.IronCavalryAgainstScourge,
        relicSet2: Sets.IronCavalryAgainstScourge,
        ornamentSet: Sets.FirmamentFrontlineGlamoth,
        teammates: [
          {
            characterId: '8006', // Stelle
            lightCone: '21004', // Memories
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1301', // Gallagher
            lightCone: '20015', // Multi
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1207: { // Yukong
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.MusketeerOfWildWheat,
        Sets.WastelanderOfBanditryDesert,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.InertSalsotto,
        Sets.SpaceSealingStation,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.ULT,
    },
    1208: { // Fu Xuan
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.KnightOfPurityPalace,
        Sets.LongevousDisciple,
        Sets.GuardOfWutheringSnow,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.EHP,
    },
    1209: { // Yanqing
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 1,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.HunterOfGlacialForest,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Ice_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.ATK_P,
          Stats.ATK,
          Stats.BE,
          Stats.CR,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 2,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.HunterOfGlacialForest,
        relicSet2: Sets.HunterOfGlacialForest,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1106', // Pela
            lightCone: '21015', // Pearls
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1210: { // Guinaifen
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 0.75,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.PrisonerInDeepConfinement,
        Sets.FiresmithOfLavaForging,
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.FirmamentFrontlineGlamoth,
        Sets.PanCosmicCommercialEnterprise,
        Sets.SpaceSealingStation,
        Sets.FleetOfTheAgeless,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
    },
    1211: { // Bailu
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.OHB,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.LongevousDisciple,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
      ],
      presets: [],
      sortOption: SortOption.EHP,
    },
    1212: { // Jingliu
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 1,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.GeniusOfBrilliantStars,
        Sets.HunterOfGlacialForest,
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Ice_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.HunterOfGlacialForest,
        relicSet2: Sets.HunterOfGlacialForest,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1213: { // Dan Heng • Imbibitor Lunae
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
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
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [
        Sets.WastelanderOfBanditryDesert,
        Sets.MusketeerOfWildWheat,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.InertSalsotto,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.BASIC,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Imaginary_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 2,
          SKILL: 0,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PrisonerInDeepConfinement,
        relicSet2: Sets.MusketeerOfWildWheat,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1306', // Sparkle
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1202', // Tingyun
            lightCone: '21018', // Dance
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1214: { // Xueyi
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 1,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 1,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Quantum_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.fnAshblazingSet(3),
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.ATK_P,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Quantum_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 3,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.GeniusOfBrilliantStars,
        relicSet2: Sets.GeniusOfBrilliantStars,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '8006', // Stelle
            lightCone: '21004', // Memories
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1301', // Gallagher
            lightCone: '20015', // Multi
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1215: { // Hanya
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
          Stats.HP_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.DEF_P,
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.SPD,
    },
    1217: { // Huohuo
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.OHB,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.LongevousDisciple,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
        Sets.PenaconyLandOfTheDreams,
      ],
      presets: [],
      sortOption: SortOption.EHP,
    },
    1301: { // Gallagher
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 1,
        [Stats.ERR]: 1,
        [Stats.OHB]: 1,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.OHB,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.MusketeerOfWildWheat,
        Sets.PasserbyOfWanderingCloud,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BrokenKeel,
        Sets.SprightlyVonwacq,
        Sets.SpaceSealingStation,
      ],
      presets: [],
      sortOption: SortOption.BE,
    },
    1302: { // Argenti
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Physical_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.ChampionOfStreetwiseBoxing,
        relicSet2: Sets.ChampionOfStreetwiseBoxing,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1202', // Tingyun
            lightCone: '21018', // Dance
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1303: { // Ruan Mei
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 1,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
          Stats.HP_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.BE,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.SPD,
    },
    1304: { // Aventurine
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Imaginary_DMG,
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.fnAshblazingSet(7),
        PresetEffects.fnWindSoaringSet(1),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.DEF_P
          ],
          [Parts.Feet]: [
            Stats.DEF_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.DEF_P,
            Stats.Imaginary_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.DEF_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.DEF_P,
          Stats.SPD,
          Stats.DEF
        ],
        formula: {
          BASIC: 2,
          SKILL: 0,
          ULT: 1,
          FUA: 2,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PioneerDiverOfDeadWaters,
        relicSet2: Sets.PioneerDiverOfDeadWaters,
        ornamentSet: Sets.BrokenKeel,
        teammates: [
          {
            characterId: '1112', // Topaz
            lightCone: '23016', // Worrisome
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1309', // Robin
            lightCone: '23026', // Nightglow
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1305', // Ratio
            lightCone: '23020', // Baptism
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ]
      }
    },
    1305: { // Dr Ratio
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
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
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.fnAshblazingSet(1),
        PresetEffects.fnWindSoaringSet(1),
        PresetEffects.fnPioneerSet(4),
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Imaginary_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 4,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PioneerDiverOfDeadWaters,
        relicSet2: Sets.PioneerDiverOfDeadWaters,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1112', // Topaz
            lightCone: '23016', // Worrisome
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1309', // Robin
            lightCone: '23026', // Nightglow
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '23023', // Unjust destiny
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1306: { // Sparkle
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.Wind_DMG,
          Stats.Physical_DMG,
          Stats.Fire_DMG,
          Stats.Ice_DMG,
          Stats.Lightning_DMG,
          Stats.Quantum_DMG,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.CD,
    },
    1307: { // Black Swan
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 1,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.EHR,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.ATK_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.Wind_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.ATK_P,
            Stats.EHR,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Wind_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.ATK_P,
          Stats.EHR,
          Stats.ATK,
          Stats.SPD,
          Stats.CR
        ],
        formula: {
          BASIC: 2,
          SKILL: 1,
          ULT: 1,
          FUA: 0,
          DOT: 6,
          BREAK: 0,
        },
        relicSet1: Sets.PrisonerInDeepConfinement,
        relicSet2: Sets.PrisonerInDeepConfinement,
        ornamentSet: Sets.PanCosmicCommercialEnterprise,
        teammates: [
          {
            characterId: '1005', // Kafka
            lightCone: '23006', // Patience
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1308: { // Acheron
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 1,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Lightning_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Lightning_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 2,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.PioneerDiverOfDeadWaters,
        relicSet2: Sets.PioneerDiverOfDeadWaters,
        ornamentSet: Sets.IzumoGenseiAndTakamaDivineRealm,
        teammates: [
          {
            characterId: '1106', // Pela
            lightCone: '21015', // Pearls
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1006', // SW
            lightCone: '23007', // Rain
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '21016', // Trend
            characterEidolon: 0,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1309: { // Robin
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.ULT,
    },
    1310: { // Firefly
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0.5,
        [Constants.Stats.CD]: 0.5,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 1,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.CD,
          Constants.Stats.CR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.ATK_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Fire_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.ATK_P,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Fire_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 0,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.IronCavalryAgainstScourge,
        relicSet2: Sets.IronCavalryAgainstScourge,
        ornamentSet: Sets.ForgeOfTheKalpagniLantern,
        teammates: [
          {
            characterId: '8006', // Stelle
            lightCone: '21004', // Memories
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1301', // Gallagher
            lightCone: '20015', // Multi
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    1312: { // Misha
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 1,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.ULT,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Ice_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.HunterOfGlacialForest,
        relicSet2: Sets.HunterOfGlacialForest,
        ornamentSet: Sets.InertSalsotto,
        teammates: [
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1106', // Pela
            lightCone: '21015', // Pearls
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1314: { // Jade
      stats: {
        [Constants.Stats.ATK]: 0.75,
        [Constants.Stats.ATK_P]: 0.75,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 1,
        [Constants.Stats.CD]: 1,
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
        [Constants.Stats.Quantum_DMG]: 1,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.ATK_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Quantum_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [
        PresetEffects.fnWindSoaringSet(2),
      ],
      sortOption: SortOption.FUA,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Quantum_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
          Stats.SPD,
        ],
        formula: {
          BASIC: 2,
          SKILL: 0,
          ULT: 1,
          FUA: 2,
          DOT: 0,
          BREAK: 0,
        },
        relicSet1: Sets.TheWindSoaringValorous,
        relicSet2: Sets.TheWindSoaringValorous,
        ornamentSet: Sets.DuranDynastyOfRunningWolves,
        teammates: [
          {
            characterId: '1112', // Topaz
            lightCone: '23016', // Worrisome
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1309', // Robin
            lightCone: '23026', // Nightglow
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1304', // Aventurine
            lightCone: '23023', // Unjust destiny
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    1315: { // Boothill
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.75,
        [Stats.CD]: 0.75,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 1,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.Physical_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.BE,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.BASIC,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.SPD,
        ],
        formula: {
          BASIC: 3,
          SKILL: 0,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 1,
        },
        relicSet1: Sets.IronCavalryAgainstScourge,
        relicSet2: Sets.IronCavalryAgainstScourge,
        ornamentSet: Sets.ForgeOfTheKalpagniLantern,
        teammates: [
          {
            characterId: '8006', // Stelle
            lightCone: '21004', // Memories
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1301', // Gallagher
            lightCone: '20015', // Multi
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          }
        ]
      }
    },
    8001: { // Physical Trailblazer M
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.ChampionOfStreetwiseBoxing,
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.BE,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 1,
        },
        relicSet1: Sets.ChampionOfStreetwiseBoxing,
        relicSet2: Sets.ChampionOfStreetwiseBoxing,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    8002: { // Physical Trailblazer F
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0.5,
        [Stats.ERR]: 0,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 1,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.ATK_P,
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      relicSets: [
        Sets.ChampionOfStreetwiseBoxing,
        Sets.MessengerTraversingHackerspace,
        Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Sets.RutilantArena,
        Sets.SpaceSealingStation,
        Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [],
      sortOption: SortOption.SKILL,
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
            Stats.ATK_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Physical_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.ATK_P,
            Stats.BE,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.BE,
          Stats.SPD,
        ],
        formula: {
          BASIC: 0,
          SKILL: 3,
          ULT: 1,
          FUA: 0,
          DOT: 0,
          BREAK: 1,
        },
        relicSet1: Sets.ChampionOfStreetwiseBoxing,
        relicSet2: Sets.ChampionOfStreetwiseBoxing,
        ornamentSet: Sets.RutilantArena,
        teammates: [
          {
            characterId: '1101', // Bronya
            lightCone: '23003', // But the battle
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1303', // Ruan Mei
            lightCone: '23019', // Past self
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          }
        ]
      }
    },
    8003: { // Fire Trailblazer M
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.KnightOfPurityPalace,
        Sets.GuardOfWutheringSnow,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BelobogOfTheArchitects,
        Sets.SprightlyVonwacq,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.DEF,
    },
    8004: { // Fire Trailblazer F
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.75,
        [Stats.BE]: 0,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.DEF_P,
        ],
        [Parts.Feet]: [
          Stats.DEF_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.DEF_P,
        ],
        [Parts.LinkRope]: [
          Stats.DEF_P,
          Stats.ERR,
        ],
      },
      relicSets: [
        Sets.KnightOfPurityPalace,
        Sets.GuardOfWutheringSnow,
        Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Sets.FleetOfTheAgeless,
        Sets.BelobogOfTheArchitects,
        Sets.SprightlyVonwacq,
        Sets.BrokenKeel,
      ],
      presets: [],
      sortOption: SortOption.DEF,
    },
    8005: { // Imaginary Trailblazer M
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 1,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.Wind_DMG,
          Stats.Physical_DMG,
          Stats.Fire_DMG,
          Stats.Ice_DMG,
          Stats.Lightning_DMG,
          Stats.Quantum_DMG,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.BE,
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.BE,
    },
    8006: { // Imaginary Trailblazer F
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.75,
        [Stats.BE]: 1,
        [Stats.ERR]: 1,
        [Stats.OHB]: 0,
        [Stats.Physical_DMG]: 0,
        [Stats.Fire_DMG]: 0,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.Wind_DMG,
          Stats.Physical_DMG,
          Stats.Fire_DMG,
          Stats.Ice_DMG,
          Stats.Lightning_DMG,
          Stats.Quantum_DMG,
          Stats.Imaginary_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.BE,
          Stats.ERR,
        ],
      },
      relicSets: [],
      ornamentSets: [],
      presets: [],
      sortOption: SortOption.BE,
    },
  }
}

const getLightConeRanks = () => {
  return lightConeRanks
}