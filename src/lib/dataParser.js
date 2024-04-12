import characters from 'data/characters.json'
import characterPromotions from 'data/character_promotions.json'
import lightCones from 'data/light_cones.json'
import lightConePromotions from 'data/light_cone_promotions.json'
import lightConeRanks from 'data/en/light_cone_ranks.json'
import relicMainAffixes from 'data/relic_main_affixes.json'
import relicSubAffixes from 'data/relic_sub_affixes.json'
import relicSets from 'data/relic_sets.json'
import { Constants } from 'lib/constants.ts'
import DB from 'lib/db'
import { PresetEffects } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton.tsx'
import { SortOption } from 'lib/optimizer/sortOptions'

export const DataParser = {
  parse: (officialOnly) => {
    if (officialOnly) {
      for (const [key, value] of Object.entries(characters)) {
        if (value.unreleased) {
          delete characters[key]
        }
      }

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

      let imageCenter = { x: 1024, y: 1024 }
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
      [Constants.Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Constants.Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Constants.Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
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
      [Constants.Stats.HP]: statScaling['hp'].base + statScaling['hp'].step * (i - 1),
      [Constants.Stats.ATK]: statScaling['atk'].base + statScaling['atk'].step * (i - 1),
      [Constants.Stats.CR]: statScaling['crit_rate'].base + statScaling['crit_rate'].step * (i - 1),
      [Constants.Stats.CD]: statScaling['crit_dmg'].base + statScaling['crit_dmg'].step * (i - 1),
      [Constants.Stats.DEF]: statScaling['def'].base + statScaling['def'].step * (i - 1),
      [Constants.Stats.SPD]: statScaling['spd'].base + statScaling['spd'].step * (i - 1),
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
      1: { [Constants.Stats.DEF_P]: 0.16 },
      2: { [Constants.Stats.DEF_P]: 0.20 },
      3: { [Constants.Stats.DEF_P]: 0.24 },
      4: { [Constants.Stats.DEF_P]: 0.28 },
      5: { [Constants.Stats.DEF_P]: 0.32 },
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
      1: { [Constants.Stats.ERR]: 0.08 },
      2: { [Constants.Stats.ERR]: 0.10 },
      3: { [Constants.Stats.ERR]: 0.12 },
      4: { [Constants.Stats.ERR]: 0.14 },
      5: { [Constants.Stats.ERR]: 0.16 },
    },
    21001: {},
    21002: {
      1: { [Constants.Stats.DEF_P]: 0.16 },
      2: { [Constants.Stats.DEF_P]: 0.18 },
      3: { [Constants.Stats.DEF_P]: 0.20 },
      4: { [Constants.Stats.DEF_P]: 0.22 },
      5: { [Constants.Stats.DEF_P]: 0.24 },
    },
    21003: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    21004: {
      1: { [Constants.Stats.BE]: 0.28 },
      2: { [Constants.Stats.BE]: 0.35 },
      3: { [Constants.Stats.BE]: 0.42 },
      4: { [Constants.Stats.BE]: 0.49 },
      5: { [Constants.Stats.BE]: 0.56 },
    },
    21005: {},
    21006: {},
    21007: {},
    21008: {
      1: { [Constants.Stats.EHR]: 0.20 },
      2: { [Constants.Stats.EHR]: 0.25 },
      3: { [Constants.Stats.EHR]: 0.30 },
      4: { [Constants.Stats.EHR]: 0.35 },
      5: { [Constants.Stats.EHR]: 0.40 },
    },
    21009: {},
    21010: {},
    21011: {},
    21012: {},
    21013: {},
    21014: {
      1: { [Constants.Stats.RES]: 0.16 },
      2: { [Constants.Stats.RES]: 0.20 },
      3: { [Constants.Stats.RES]: 0.24 },
      4: { [Constants.Stats.RES]: 0.28 },
      5: { [Constants.Stats.RES]: 0.32 },
    },
    21015: {},
    21016: {
      1: { [Constants.Stats.DEF_P]: 0.16 },
      2: { [Constants.Stats.DEF_P]: 0.20 },
      3: { [Constants.Stats.DEF_P]: 0.24 },
      4: { [Constants.Stats.DEF_P]: 0.28 },
      5: { [Constants.Stats.DEF_P]: 0.32 },
    },
    21017: {},
    21018: {},
    21019: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    21020: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    21021: {},
    21022: {
      1: { [Constants.Stats.BE]: 0.16 },
      2: { [Constants.Stats.BE]: 0.20 },
      3: { [Constants.Stats.BE]: 0.24 },
      4: { [Constants.Stats.BE]: 0.28 },
      5: { [Constants.Stats.BE]: 0.32 },
    },
    21023: {},
    21024: {},
    21025: {},
    21026: {
      1: { [Constants.Stats.ATK_P]: 0.10 },
      2: { [Constants.Stats.ATK_P]: 0.125 },
      3: { [Constants.Stats.ATK_P]: 0.15 },
      4: { [Constants.Stats.ATK_P]: 0.175 },
      5: { [Constants.Stats.ATK_P]: 0.20 },
    },
    21027: {},
    21028: {
      1: { [Constants.Stats.HP_P]: 0.16 },
      2: { [Constants.Stats.HP_P]: 0.20 },
      3: { [Constants.Stats.HP_P]: 0.24 },
      4: { [Constants.Stats.HP_P]: 0.28 },
      5: { [Constants.Stats.HP_P]: 0.32 },
    },
    21029: {},
    21030: {
      1: { [Constants.Stats.DEF_P]: 0.16 },
      2: { [Constants.Stats.DEF_P]: 0.20 },
      3: { [Constants.Stats.DEF_P]: 0.24 },
      4: { [Constants.Stats.DEF_P]: 0.28 },
      5: { [Constants.Stats.DEF_P]: 0.32 },
    },
    21031: {
      1: { [Constants.Stats.CR]: 0.12 },
      2: { [Constants.Stats.CR]: 0.15 },
      3: { [Constants.Stats.CR]: 0.18 },
      4: { [Constants.Stats.CR]: 0.21 },
      5: { [Constants.Stats.CR]: 0.24 },
    },
    21032: {},
    21033: {
      1: { [Constants.Stats.ATK_P]: 0.24 },
      2: { [Constants.Stats.ATK_P]: 0.30 },
      3: { [Constants.Stats.ATK_P]: 0.36 },
      4: { [Constants.Stats.ATK_P]: 0.42 },
      5: { [Constants.Stats.ATK_P]: 0.48 },
    },
    21034: {},
    21035: {
      1: { [Constants.Stats.BE]: 0.24 },
      2: { [Constants.Stats.BE]: 0.30 },
      3: { [Constants.Stats.BE]: 0.36 },
      4: { [Constants.Stats.BE]: 0.42 },
      5: { [Constants.Stats.BE]: 0.48 },
    },
    21036: {},
    21037: {
      1: { [Constants.Stats.ATK_P]: 0.12 },
      2: { [Constants.Stats.ATK_P]: 0.14 },
      3: { [Constants.Stats.ATK_P]: 0.16 },
      4: { [Constants.Stats.ATK_P]: 0.18 },
      5: { [Constants.Stats.ATK_P]: 0.20 },
    },
    21038: {},
    21039: {
      1: { [Constants.Stats.RES]: 0.12 },
      2: { [Constants.Stats.RES]: 0.14 },
      3: { [Constants.Stats.RES]: 0.16 },
      4: { [Constants.Stats.RES]: 0.18 },
      5: { [Constants.Stats.RES]: 0.20 },
    },
    21040: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.18 },
      3: { [Constants.Stats.ATK_P]: 0.20 },
      4: { [Constants.Stats.ATK_P]: 0.22 },
      5: { [Constants.Stats.ATK_P]: 0.24 },
    },
    21041: {},
    21042: {
      1: { [Constants.Stats.BE]: 0.28 },
      2: { [Constants.Stats.BE]: 0.35 },
      3: { [Constants.Stats.BE]: 0.42 },
      4: { [Constants.Stats.BE]: 0.49 },
      5: { [Constants.Stats.BE]: 0.56 },
    },
    21043: {
      1: { [Constants.Stats.DEF_P]: 0.16 },
      2: { [Constants.Stats.DEF_P]: 0.20 },
      3: { [Constants.Stats.DEF_P]: 0.24 },
      4: { [Constants.Stats.DEF_P]: 0.28 },
      5: { [Constants.Stats.DEF_P]: 0.32 },
    },
    21044: {
      1: { [Constants.Stats.CR]: 0.08 },
      2: { [Constants.Stats.CR]: 0.10 },
      3: { [Constants.Stats.CR]: 0.12 },
      4: { [Constants.Stats.CR]: 0.14 },
      5: { [Constants.Stats.CR]: 0.16 },
    },
    22000: {
      1: { [Constants.Stats.EHR]: 0.20 },
      2: { [Constants.Stats.EHR]: 0.25 },
      3: { [Constants.Stats.EHR]: 0.30 },
      4: { [Constants.Stats.EHR]: 0.35 },
      5: { [Constants.Stats.EHR]: 0.40 },
    },
    22001: {
      1: { [Constants.Stats.HP_P]: 0.08 },
      2: { [Constants.Stats.HP_P]: 0.09 },
      3: { [Constants.Stats.HP_P]: 0.10 },
      4: { [Constants.Stats.HP_P]: 0.11 },
      5: { [Constants.Stats.HP_P]: 0.12 },
    },
    22002: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    23000: {},
    23001: {
      1: { [Constants.Stats.CR]: 0.18 },
      2: { [Constants.Stats.CR]: 0.21 },
      3: { [Constants.Stats.CR]: 0.24 },
      4: { [Constants.Stats.CR]: 0.27 },
      5: { [Constants.Stats.CR]: 0.30 },
    },
    23002: {
      1: { [Constants.Stats.ATK_P]: 0.24 },
      2: { [Constants.Stats.ATK_P]: 0.28 },
      3: { [Constants.Stats.ATK_P]: 0.32 },
      4: { [Constants.Stats.ATK_P]: 0.36 },
      5: { [Constants.Stats.ATK_P]: 0.40 },
    },
    23003: {},
    23004: {},
    23005: {
      1: { [Constants.Stats.DEF_P]: 0.24, [Constants.Stats.EHR]: 0.24 },
      2: { [Constants.Stats.DEF_P]: 0.28, [Constants.Stats.EHR]: 0.28 },
      3: { [Constants.Stats.DEF_P]: 0.32, [Constants.Stats.EHR]: 0.32 },
      4: { [Constants.Stats.DEF_P]: 0.36, [Constants.Stats.EHR]: 0.36 },
      5: { [Constants.Stats.DEF_P]: 0.40, [Constants.Stats.EHR]: 0.40 },
    },
    23006: {},
    23007: {
      1: { [Constants.Stats.EHR]: 0.24 },
      2: { [Constants.Stats.EHR]: 0.28 },
      3: { [Constants.Stats.EHR]: 0.32 },
      4: { [Constants.Stats.EHR]: 0.36 },
      5: { [Constants.Stats.EHR]: 0.40 },
    },
    23008: {
      1: { [Constants.Stats.ATK_P]: 0.24 },
      2: { [Constants.Stats.ATK_P]: 0.28 },
      3: { [Constants.Stats.ATK_P]: 0.32 },
      4: { [Constants.Stats.ATK_P]: 0.36 },
      5: { [Constants.Stats.ATK_P]: 0.40 },
    },
    23009: {
      1: { [Constants.Stats.CR]: 0.18, [Constants.Stats.HP_P]: 0.18 },
      2: { [Constants.Stats.CR]: 0.21, [Constants.Stats.HP_P]: 0.21 },
      3: { [Constants.Stats.CR]: 0.24, [Constants.Stats.HP_P]: 0.24 },
      4: { [Constants.Stats.CR]: 0.27, [Constants.Stats.HP_P]: 0.27 },
      5: { [Constants.Stats.CR]: 0.30, [Constants.Stats.HP_P]: 0.30 },
    },
    23010: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.42 },
      3: { [Constants.Stats.CD]: 0.48 },
      4: { [Constants.Stats.CD]: 0.54 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23011: {
      1: { [Constants.Stats.HP_P]: 0.24, [Constants.Stats.ERR]: 0.12 },
      2: { [Constants.Stats.HP_P]: 0.28, [Constants.Stats.ERR]: 0.14 },
      3: { [Constants.Stats.HP_P]: 0.32, [Constants.Stats.ERR]: 0.16 },
      4: { [Constants.Stats.HP_P]: 0.36, [Constants.Stats.ERR]: 0.18 },
      5: { [Constants.Stats.HP_P]: 0.40, [Constants.Stats.ERR]: 0.20 },
    },
    23012: {
      1: { [Constants.Stats.CD]: 0.30 },
      2: { [Constants.Stats.CD]: 0.35 },
      3: { [Constants.Stats.CD]: 0.40 },
      4: { [Constants.Stats.CD]: 0.45 },
      5: { [Constants.Stats.CD]: 0.50 },
    },
    23013: {
      1: { [Constants.Stats.HP_P]: 0.18, [Constants.Stats.OHB]: 0.12 },
      2: { [Constants.Stats.HP_P]: 0.21, [Constants.Stats.OHB]: 0.14 },
      3: { [Constants.Stats.HP_P]: 0.24, [Constants.Stats.OHB]: 0.16 },
      4: { [Constants.Stats.HP_P]: 0.27, [Constants.Stats.OHB]: 0.18 },
      5: { [Constants.Stats.HP_P]: 0.30, [Constants.Stats.OHB]: 0.20 },
    },
    23014: {
      1: { [Constants.Stats.CD]: 0.20 },
      2: { [Constants.Stats.CD]: 0.23 },
      3: { [Constants.Stats.CD]: 0.26 },
      4: { [Constants.Stats.CD]: 0.29 },
      5: { [Constants.Stats.CD]: 0.32 },
    },
    23015: {
      1: { [Constants.Stats.CR]: 0.18 },
      2: { [Constants.Stats.CR]: 0.21 },
      3: { [Constants.Stats.CR]: 0.24 },
      4: { [Constants.Stats.CR]: 0.27 },
      5: { [Constants.Stats.CR]: 0.30 },
    },
    23016: {
      1: { [Constants.Stats.CR]: 0.18 },
      2: { [Constants.Stats.CR]: 0.21 },
      3: { [Constants.Stats.CR]: 0.24 },
      4: { [Constants.Stats.CR]: 0.27 },
      5: { [Constants.Stats.CR]: 0.30 },
    },
    23017: {
      1: { [Constants.Stats.ERR]: 0.12 },
      2: { [Constants.Stats.ERR]: 0.14 },
      3: { [Constants.Stats.ERR]: 0.16 },
      4: { [Constants.Stats.ERR]: 0.18 },
      5: { [Constants.Stats.ERR]: 0.20 },
    },
    23018: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.42 },
      3: { [Constants.Stats.CD]: 0.48 },
      4: { [Constants.Stats.CD]: 0.54 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23019: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    23020: {
      1: { [Constants.Stats.CD]: 0.20 },
      2: { [Constants.Stats.CD]: 0.23 },
      3: { [Constants.Stats.CD]: 0.26 },
      4: { [Constants.Stats.CD]: 0.29 },
      5: { [Constants.Stats.CD]: 0.32 },
    },
    23021: { // Earthly Escapade
      1: { [Constants.Stats.CD]: 0.32 },
      2: { [Constants.Stats.CD]: 0.39 },
      3: { [Constants.Stats.CD]: 0.46 },
      4: { [Constants.Stats.CD]: 0.53 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23022: { // Reforged Remembrance
      1: { [Constants.Stats.EHR]: 0.40 },
      2: { [Constants.Stats.EHR]: 0.45 },
      3: { [Constants.Stats.EHR]: 0.50 },
      4: { [Constants.Stats.EHR]: 0.55 },
      5: { [Constants.Stats.EHR]: 0.60 },
    },
    23023: {
      1: { [Constants.Stats.DEF_P]: 0.40 },
      2: { [Constants.Stats.DEF_P]: 0.46 },
      3: { [Constants.Stats.DEF_P]: 0.52 },
      4: { [Constants.Stats.DEF_P]: 0.58 },
      5: { [Constants.Stats.DEF_P]: 0.64 },
    },
    23024: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.42 },
      3: { [Constants.Stats.CD]: 0.48 },
      4: { [Constants.Stats.CD]: 0.54 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23026: {},
    23027: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    24000: {},
    24001: {
      1: { [Constants.Stats.CR]: 0.08 },
      2: { [Constants.Stats.CR]: 0.10 },
      3: { [Constants.Stats.CR]: 0.12 },
      4: { [Constants.Stats.CR]: 0.14 },
      5: { [Constants.Stats.CR]: 0.16 },
    },
    24002: {
      1: { [Constants.Stats.RES]: 0.08 },
      2: { [Constants.Stats.RES]: 0.10 },
      3: { [Constants.Stats.RES]: 0.12 },
      4: { [Constants.Stats.RES]: 0.14 },
      5: { [Constants.Stats.RES]: 0.16 },
    },
    24003: {
      1: { [Constants.Stats.BE]: 0.20 },
      2: { [Constants.Stats.BE]: 0.25 },
      3: { [Constants.Stats.BE]: 0.30 },
      4: { [Constants.Stats.BE]: 0.35 },
      5: { [Constants.Stats.BE]: 0.40 },
    },
  }
}

function getOverrideTraces() {
  return {
    1001: { // March 7th
      [Constants.Stats.Ice_DMG]: 0.224,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.RES]: 0.1,
    },
    1002: { // Dan Heng
      [Constants.Stats.Wind_DMG]: 0.224,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1003: { // Himeko
      [Constants.Stats.Fire_DMG]: 0.224,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.RES]: 0.1,
    },
    1004: { // Welt
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Imaginary_DMG]: 0.144,
      [Constants.Stats.RES]: 0.1,
    },
    1005: { // Kafka
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.EHR]: 0.18,
      [Constants.Stats.HP_P]: 0.1,
    },
    1006: { // Silver Wolf
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.EHR]: 0.18,
      [Constants.Stats.Quantum_DMG]: 0.08,
    },
    1008: { // Arlan
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.RES]: 0.12,
      [Constants.Stats.HP_P]: 0.1,
    },
    1009: { // Asta
      [Constants.Stats.Fire_DMG]: 0.224,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.CR]: 0.067,
    },
    1013: { // Herta
      [Constants.Stats.Ice_DMG]: 0.224,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.CR]: 0.067,
    },
    1101: { // Bronya
      [Constants.Stats.Wind_DMG]: 0.224,
      [Constants.Stats.CD]: 0.24,
      [Constants.Stats.RES]: 0.10,
    },
    1102: { // Seele
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.CD]: 0.24,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1103: { // Serval
      [Constants.Stats.CR]: 0.187,
      [Constants.Stats.EHR]: 0.18,
      [Constants.Stats.RES]: 0.1,
    },
    1104: { // Gepard
      [Constants.Stats.Ice_DMG]: 0.224,
      [Constants.Stats.RES]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1105: { // Natasha
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.DEF_P]: 0.125,
      [Constants.Stats.RES]: 0.18,
    },
    1106: { // Pela
      [Constants.Stats.Ice_DMG]: 0.224,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.EHR]: 0.1,
    },
    1107: { // Clara
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Physical_DMG]: 0.144,
      [Constants.Stats.HP_P]: 0.1,
    },
    1108: { // Sampo
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.EHR]: 0.18,
      [Constants.Stats.RES]: 0.1,
    },
    1109: { // Hook
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.CD]: 0.133,
    },
    1110: { // Lynx
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.RES]: 0.1,
    },
    1111: { // Luka
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.EHR]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1112: { // Topaz and Numby
      [Constants.Stats.Fire_DMG]: 0.224,
      [Constants.Stats.CR]: 0.12,
      [Constants.Stats.HP_P]: 0.1,
    },
    1201: { // Qingque
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Quantum_DMG]: 0.144,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1202: { // Tingyun
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.Lightning_DMG]: 0.08,
    },
    1203: { // Luocha
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1204: { // Jing Yuan
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.DEF_P]: 0.125,
      [Constants.Stats.CR]: 0.12,
    },
    1205: { // Blade
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.CR]: 0.12,
      [Constants.Stats.RES]: 0.1,
    },
    1206: { // Sushang
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1207: { // Yukong
      [Constants.Stats.Imaginary_DMG]: 0.224,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.ATK_P]: 0.1,
    },
    1208: { // Fu Xuan
      [Constants.Stats.CR]: 0.187,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.RES]: 0.1,
    },
    1209: { // Yanqing
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Ice_DMG]: 0.144,
      [Constants.Stats.HP_P]: 0.1,
    },
    1210: { // Guinaifen
      [Constants.Stats.Fire_DMG]: 0.224,
      [Constants.Stats.EHR]: 0.1,
      [Constants.Stats.BE]: 0.24,
    },
    1211: { // Bailu
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.RES]: 0.1,
    },
    1212: { // Jingliu
      [Constants.Stats.HP_P]: 0.10,
      [Constants.Stats.SPD]: 9,
      [Constants.Stats.CD]: 0.373,
    },
    1213: { // Dan Heng • Imbibitor Lunae
      [Constants.Stats.Imaginary_DMG]: 0.224,
      [Constants.Stats.CR]: 0.12,
      [Constants.Stats.HP_P]: 0.1,
    },
    1214: { // Xueyi
      [Constants.Stats.Quantum_DMG]: 0.08,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.BE]: 0.373,
    },
    1215: { // Hanya
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.1,
      [Constants.Stats.SPD]: 9,
    },
    1217: { // Huohuo
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.RES]: 0.18,
      [Constants.Stats.SPD]: 5,
    },
    1301: { // Gallagher
      [Constants.Stats.BE]: 0.133,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.RES]: 0.28,
    },
    1302: { // Argenti
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Physical_DMG]: 0.144,
      [Constants.Stats.HP_P]: 0.1,
    },
    1303: { // Ruan Mei
      [Constants.Stats.BE]: 0.373,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.SPD]: 5,
    },
    1304: { // Aventurine
      [Constants.Stats.DEF_P]: 0.35,
      [Constants.Stats.Imaginary_DMG]: 0.144,
      [Constants.Stats.RES]: 0.10,
    },
    1305: { // Dr Ratio
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.CR]: 0.12,
      [Constants.Stats.DEF_P]: 0.125,
    },
    1306: { // Sparkle
      [Constants.Stats.HP_P]: 0.28,
      [Constants.Stats.CD]: 0.24,
      [Constants.Stats.RES]: 0.10,
    },
    1307: { // Black Swan
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Wind_DMG]: 0.144,
      [Constants.Stats.EHR]: 0.10,
    },
    1308: { // Acheron
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.Lightning_DMG]: 0.08,
      [Constants.Stats.CD]: 0.24,
    },
    1309: { // Robin
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.SPD]: 5,
    },
    1312: { // Misha
      [Constants.Stats.Ice_DMG]: 0.224,
      [Constants.Stats.DEF_P]: 0.225,
      [Constants.Stats.CR]: 0.067,
    },
    1315: { // Boothill
      [Constants.Stats.BE]: 0.373,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.HP_P]: 0.10,
    },
    8001: { // Physical Trailblazer
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    8002: { // Physical Trailblazer
      [Constants.Stats.ATK_P]: 0.28,
      [Constants.Stats.HP_P]: 0.18,
      [Constants.Stats.DEF_P]: 0.125,
    },
    8003: { // Fire Trailblazer
      [Constants.Stats.DEF_P]: 0.35,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.HP_P]: 0.1,
    },
    8004: { // Fire Trailblazer
      [Constants.Stats.DEF_P]: 0.35,
      [Constants.Stats.ATK_P]: 0.18,
      [Constants.Stats.HP_P]: 0.1,
    },
    8005: { // Imaginary Trailblazer
      [Constants.Stats.BE]: 0.373,
      [Constants.Stats.Imaginary_DMG]: 0.144,
      [Constants.Stats.RES]: 0.10,
    },
    8006: { // Imaginary Trailblazer
      [Constants.Stats.BE]: 0.373,
      [Constants.Stats.Imaginary_DMG]: 0.144,
      [Constants.Stats.RES]: 0.10,
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
    1312: { // Misha
      x: 1050,
      y: 1075,
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
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.GuardOfWutheringSnow,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BelobogOfTheArchitects,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.DEF,
    },
    1002: { // Dan Heng
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
        [Constants.Stats.Wind_DMG]: 1,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Wind_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.EagleOfTwilightLine,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
    },
    1003: { // Himeko
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
        [Constants.Stats.BE]: 0.5,
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
        ],
      },
      relicSets: [
        Constants.Sets.TheAshblazingGrandDuke,
        Constants.Sets.FiresmithOfLavaForging,
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.FirmamentFrontlineGlamoth,
        Constants.Sets.InertSalsotto,
        Constants.Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(4),
      ],
      sortOption: SortOption.FUA,
    },
    1004: { // Welt
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
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CD,
          Constants.Stats.CR,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.ATK_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.WastelanderOfBanditryDesert,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.PanCosmicCommercialEnterprise,
        Constants.Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
    },
    1005: { // Kafka
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
        [Constants.Stats.EHR]: 0.5,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0.75,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 1,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Lightning_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.PrisonerInDeepConfinement,
        Constants.Sets.BandOfSizzlingThunder,
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FirmamentFrontlineGlamoth,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
        PresetEffects.fnAshblazingSet(6),
      ],
      sortOption: SortOption.DOT,
    },
    1006: { // Silver Wolf
      stats: {
        [Constants.Stats.ATK]: 0.5,
        [Constants.Stats.ATK_P]: 0.5,
        [Constants.Stats.DEF]: 0.25,
        [Constants.Stats.DEF_P]: 0.25,
        [Constants.Stats.HP]: 0.25,
        [Constants.Stats.HP_P]: 0.25,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0.75,
        [Constants.Stats.CD]: 0.75,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0.75,
        [Constants.Stats.ERR]: 1,
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
          Constants.Stats.CD,
          Constants.Stats.CR,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.Quantum_DMG,
          Constants.Stats.ATK_P,
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.EagleOfTwilightLine,
        Constants.Sets.ThiefOfShootingMeteor,
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.BrokenKeel,
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.InertSalsotto,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
    },
    1008: { // Arlan
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
        [Constants.Stats.Lightning_DMG]: 1,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Lightning_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.BandOfSizzlingThunder,
        Constants.Sets.LongevousDisciple,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    1009: { // Asta
      stats: {
        [Constants.Stats.ATK]: 0.75,
        [Constants.Stats.ATK_P]: 0.75,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0.5,
        [Constants.Stats.ERR]: 1,
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
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
          Constants.Stats.Fire_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.ThiefOfShootingMeteor,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
      ],
      sortOption: SortOption.SPD,
    },
    1013: { // Herta
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
        [Constants.Stats.Ice_DMG]: 1,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Ice_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.HunterOfGlacialForest,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(4),
      ],
      sortOption: SortOption.SPD,
    },
    1101: { // Bronya
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 1,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 1,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CD,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
          Constants.Stats.Wind_DMG,
          Constants.Stats.Physical_DMG,
          Constants.Stats.Fire_DMG,
          Constants.Stats.Ice_DMG,
          Constants.Stats.Lightning_DMG,
          Constants.Stats.Quantum_DMG,
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.EagleOfTwilightLine,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
      ],
      sortOption: SortOption.CD,
    },
    1102: { // Seele
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
      relicSets: [
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    1103: { // Serval
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
        [Constants.Stats.Lightning_DMG]: 1,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CD,
          Constants.Stats.CR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Lightning_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.BandOfSizzlingThunder,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.ThiefOfShootingMeteor,
      ],
      ornamentSets: [
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.ULT,
    },
    1104: { // Gepard
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0.75,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.GuardOfWutheringSnow,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BelobogOfTheArchitects,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.DEF,
    },
    1105: { // Natasha
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.OHB,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.HP_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.LongevousDisciple,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.EHP,
    },
    1106: { // Pela
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 1,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.EHR,
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.Ice_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.EagleOfTwilightLine,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.PanCosmicCommercialEnterprise,
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
      ],
      sortOption: SortOption.SPD,
    },
    1107: { // Clara
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
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.ChampionOfStreetwiseBoxing,
        Constants.Sets.TheAshblazingGrandDuke,
        Constants.Sets.LongevousDisciple,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(2),
      ],
      sortOption: SortOption.FUA,
    },
    1108: { // Sampo
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 1,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Wind_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.ThiefOfShootingMeteor,
        Constants.Sets.PrisonerInDeepConfinement,
        Constants.Sets.EagleOfTwilightLine,
      ],
      ornamentSets: [
        Constants.Sets.PanCosmicCommercialEnterprise,
        Constants.Sets.FirmamentFrontlineGlamoth,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
    },
    1109: { // Hook
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
        [Constants.Stats.Fire_DMG]: 1,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Fire_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.FiresmithOfLavaForging,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
    },
    1110: { // Lynx
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.OHB,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.HP_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.LongevousDisciple,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.EHP,
    },
    1111: { // Luka
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0.75,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.ThiefOfShootingMeteor,
        Constants.Sets.PrisonerInDeepConfinement,
      ],
      ornamentSets: [
        Constants.Sets.PanCosmicCommercialEnterprise,
        Constants.Sets.FirmamentFrontlineGlamoth,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.TaliaKingdomOfBanditry,
      ],
      presets: [
      ],
      sortOption: SortOption.DOT,
    },
    1112: { // Topaz and Numby
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
        [Constants.Stats.Fire_DMG]: 1,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Fire_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.TheAshblazingGrandDuke,
        Constants.Sets.FiresmithOfLavaForging,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(0),
      ],
      sortOption: SortOption.FUA,
    },
    1201: { // Qingque
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
      relicSets: [
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.BASIC,
    },
    1202: { // Tingyun
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
      ],
      sortOption: SortOption.SPD,
    },
    1203: { // Luocha
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.OHB,
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.SpaceSealingStation,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.SPD,
    },
    1204: { // Jing Yuan
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
        [Constants.Stats.Lightning_DMG]: 1,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Lightning_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.TheAshblazingGrandDuke,
        Constants.Sets.BandOfSizzlingThunder,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.fnAshblazingSet(8),
      ],
      sortOption: SortOption.FUA,
    },
    1205: { // Blade
      stats: {
        [Constants.Stats.ATK]: 0.25,
        [Constants.Stats.ATK_P]: 0.25,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
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
        [Constants.Stats.Wind_DMG]: 1,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CD,
          Constants.Stats.CR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.Wind_DMG,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
        ],
      },
      relicSets: [
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.EagleOfTwilightLine,
        Constants.Sets.LongevousDisciple,
      ],
      ornamentSets: [
        Constants.Sets.InertSalsotto,
        Constants.Sets.RutilantArena,
      ],
      presets: [
      ],
      sortOption: SortOption.BASIC,
    },
    1206: { // Sushang
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
        [Constants.Stats.BE]: 0.5,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.ChampionOfStreetwiseBoxing,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    1207: { // Yukong
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
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.WastelanderOfBanditryDesert,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.InertSalsotto,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.ULT,
    },
    1208: { // Fu Xuan
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.LongevousDisciple,
        Constants.Sets.GuardOfWutheringSnow,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.EHP,
    },
    1209: { // Yanqing
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
        [Constants.Stats.Ice_DMG]: 1,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Ice_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.HunterOfGlacialForest,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.ULT,
    },
    1210: { // Guinaifen
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0.75,
        [Constants.Stats.ERR]: 1,
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
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Fire_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.PrisonerInDeepConfinement,
        Constants.Sets.FiresmithOfLavaForging,
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.FirmamentFrontlineGlamoth,
        Constants.Sets.PanCosmicCommercialEnterprise,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FleetOfTheAgeless,
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
    },
    1211: { // Bailu
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.OHB,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.LongevousDisciple,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
      ],
      presets: [
      ],
      sortOption: SortOption.EHP,
    },
    1212: { // Jingliu
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
        [Constants.Stats.Ice_DMG]: 1,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Ice_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.GeniusOfBrilliantStars,
        Constants.Sets.HunterOfGlacialForest,
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    1213: { // Dan Heng • Imbibitor Lunae
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
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 1,
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
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
        Constants.Sets.WastelanderOfBanditryDesert,
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.InertSalsotto,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.BASIC,
    },
    1214: { // Xueyi
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
        [Constants.Stats.BE]: 1,
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
          Constants.Stats.Quantum_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
        PresetEffects.fnAshblazingSet(3),
      ],
      sortOption: SortOption.SKILL,
    },
    1215: { // Hanya
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.SPD,
    },
    1217: { // Huohuo
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.OHB,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.HP_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.LongevousDisciple,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.PenaconyLandOfTheDreams,
      ],
      presets: [
      ],
      sortOption: SortOption.EHP,
    },
    1301: { // Gallagher
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 1,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.OHB,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.MusketeerOfWildWheat,
        Constants.Sets.PasserbyOfWanderingCloud,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BrokenKeel,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.SpaceSealingStation,
      ],
      presets: [
      ],
      sortOption: SortOption.BE,
    },
    1302: { // Argenti
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
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Physical_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.ULT,
    },
    1303: { // Ruan Mei
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.SPD,
    },
    1304: { // Aventurine
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 1,
        [Constants.Stats.CD]: 1,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
          Constants.Stats.CR,
          Constants.Stats.CD,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.Imaginary_DMG,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
        PresetEffects.fnAshblazingSet(7),
      ],
      sortOption: SortOption.FUA,
    },
    1305: { // Dr Ratio
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
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 1,
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
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
        PresetEffects.fnAshblazingSet(1),
        PresetEffects.fnPioneerSet(4),
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.FUA,
    },
    1306: { // Sparkle
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 1,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CD,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
          Constants.Stats.ATK_P,
          Constants.Stats.Wind_DMG,
          Constants.Stats.Physical_DMG,
          Constants.Stats.Fire_DMG,
          Constants.Stats.Ice_DMG,
          Constants.Stats.Lightning_DMG,
          Constants.Stats.Quantum_DMG,
          Constants.Stats.Imaginary_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.CD,
    },
    1307: { // Black Swan
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0.5,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 1,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.Wind_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
    },
    1308: { // Acheron
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
        [Constants.Stats.Lightning_DMG]: 1,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Lightning_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
    },
    1309: { // Robin
      stats: {
        [Constants.Stats.ATK]: 1,
        [Constants.Stats.ATK_P]: 1,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.ATK_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.ULT,
    },
    1312: { // Misha
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
        [Constants.Stats.Ice_DMG]: 1,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Ice_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.ULT,
    },
    1315: { // Boothill
      stats: {
        [Constants.Stats.ATK]: 0.5,
        [Constants.Stats.ATK_P]: 0.5,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0.75,
        [Constants.Stats.CD]: 0.75,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.ATK_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.Physical_DMG,
          Constants.Stats.ATK_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.BE,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.BASIC,
    },
    8001: { // Physical Trailblazer M
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
        [Constants.Stats.BE]: 0.5,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.ChampionOfStreetwiseBoxing,
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    8002: { // Physical Trailblazer F
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
        [Constants.Stats.BE]: 0.5,
        [Constants.Stats.ERR]: 0,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 1,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
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
          Constants.Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.BE,
        ],
      },
      relicSets: [
        Constants.Sets.ChampionOfStreetwiseBoxing,
        Constants.Sets.MessengerTraversingHackerspace,
        Constants.Sets.MusketeerOfWildWheat,
      ],
      ornamentSets: [
        Constants.Sets.RutilantArena,
        Constants.Sets.SpaceSealingStation,
        Constants.Sets.FirmamentFrontlineGlamoth,
      ],
      presets: [
      ],
      sortOption: SortOption.SKILL,
    },
    8003: { // Fire Trailblazer M
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0.75,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.GuardOfWutheringSnow,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BelobogOfTheArchitects,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.DEF,
    },
    8004: { // Fire Trailblazer F
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 1,
        [Constants.Stats.DEF_P]: 1,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0.75,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 0,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.DEF_P,
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.DEF_P,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
        Constants.Sets.KnightOfPurityPalace,
        Constants.Sets.GuardOfWutheringSnow,
        Constants.Sets.MessengerTraversingHackerspace,
      ],
      ornamentSets: [
        Constants.Sets.FleetOfTheAgeless,
        Constants.Sets.BelobogOfTheArchitects,
        Constants.Sets.SprightlyVonwacq,
        Constants.Sets.BrokenKeel,
      ],
      presets: [
      ],
      sortOption: SortOption.DEF,
    },
    8005: { // Imaginary Trailblazer M
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.BE,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.BE,
    },
    8006: { // Imaginary Trailblazer F
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0.75,
        [Constants.Stats.DEF_P]: 0.75,
        [Constants.Stats.HP]: 0.75,
        [Constants.Stats.HP_P]: 0.75,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 1,
        [Constants.Stats.ERR]: 1,
        [Constants.Stats.OHB]: 0,
        [Constants.Stats.Physical_DMG]: 0,
        [Constants.Stats.Fire_DMG]: 0,
        [Constants.Stats.Ice_DMG]: 0,
        [Constants.Stats.Lightning_DMG]: 0,
        [Constants.Stats.Wind_DMG]: 0,
        [Constants.Stats.Quantum_DMG]: 0,
        [Constants.Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
          Constants.Stats.DEF_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.BE,
          Constants.Stats.ERR,
        ],
      },
      relicSets: [
      ],
      ornamentSets: [
      ],
      presets: [
      ],
      sortOption: SortOption.BE,
    },
  }
}

const getLightConeRanks = () => {
  return lightConeRanks
}
