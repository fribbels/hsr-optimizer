import gameData from 'data/game_data.json' with { type: 'json' }
import relicMainAffixes from 'data/relic_main_affixes.json' with { type: 'json' }
import relicSubAffixes from 'data/relic_sub_affixes.json' with { type: 'json' }
import { Constants, Parts, PartsMainStats, Sets, Stats } from 'lib/constants/constants'
import { SortOption } from 'lib/optimization/sortOptions'
import DB from 'lib/state/db'
import { PresetEffects } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { DBMetadata, DBMetadataCharacter, DBMetadataLightCone, DBMetadataSets, ScoringMetadata } from 'types/metadata'

const NULL = null as unknown as string
const BASIC = 'BASIC'
const SKILL = 'SKILL'
const ULT = 'ULT'
const FUA = 'FUA'
const MEMO_SKILL = 'MEMO_SKILL'

const characters: Record<string, DBMetadataCharacter> = gameData.characters as unknown as Record<string, DBMetadataCharacter>
const lightCones: Record<string, DBMetadataLightCone> = gameData.lightCones as unknown as Record<string, DBMetadataLightCone>

const RELICS_2P_BREAK_EFFECT_SPEED = [
  Sets.MessengerTraversingHackerspace,
  Sets.SacerdosRelivedOrdeal,
  Sets.ThiefOfShootingMeteor,
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.IronCavalryAgainstTheScourge,
]

const SPREAD_RELICS_4P_GENERAL_CONDITIONALS = [
  [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
  [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
  [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
]

const SPREAD_ORNAMENTS_2P_FUA = [
  Sets.DuranDynastyOfRunningWolves,
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.InertSalsotto,
]

const SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS = [
  Sets.SigoniaTheUnclaimedDesolation,
]

const SPREAD_ORNAMENTS_2P_ENERGY_REGEN = [
  Sets.SprightlyVonwacq,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
]

const SPREAD_ORNAMENTS_2P_SUPPORT = [
  Sets.SprightlyVonwacq,
  Sets.BrokenKeel,
  Sets.PenaconyLandOfTheDreams,
  Sets.FleetOfTheAgeless,
  Sets.LushakaTheSunkenSeas,
]

export const Metadata = {
  initialize: () => {
    const lightConeSuperimpositions = getSuperimpositions()
    const lightConeCenters = getLightConeOverrideCenter()

    const dbMetadataCharacters: Record<string, DBMetadataCharacter> = characters

    for (const lightCone of Object.values(lightCones)) {
      const id = lightCone.id
      if (lightConeSuperimpositions[id]) {
        lightCone.superimpositions = lightConeSuperimpositions[id]
      } else {
        lightCone.superimpositions = {}
      }

      let imageCenter = 200
      if (lightConeCenters[id] != undefined && lightConeCenters[id]) {
        imageCenter = lightConeCenters[id]
      }

      lightCone.displayName = lightCone.name
      lightCone.imageCenter = imageCenter
    }

    const imageCenters = getOverrideImageCenter()
    const scoringMetadata = getScoringMetadata()

    const scoringMetadataValues = Object.values(scoringMetadata)
    for (const metadata of scoringMetadataValues) {
      for (const part of [Parts.Body, Parts.Feet, Parts.PlanarSphere, Parts.LinkRope]) {
        if (metadata.parts[part].length === 0) {
          metadata.parts[part] = PartsMainStats[part]
        }
      }
    }

    for (const [id, dbMetadataCharacter] of Object.entries(characters)) {
      if (!characters[id]) {
        // Unreleased
        continue
      }

      let imageCenter = { x: 1024, y: 1024, z: 1 }
      if (imageCenters[id] != undefined) {
        imageCenter = imageCenters[id]
      }

      characters[id].traces = dbMetadataCharacter.traces
      characters[id].traceTree = dbMetadataCharacter.traceTree
      characters[id].imageCenter = imageCenter
      characters[id].displayName = getDisplayName(characters[id])
      characters[id].scoringMetadata = scoringMetadata[id]
    }

    const relicSets = gameData.relics.reduce<Record<string, DBMetadataSets>>((acc, obj) => {
      acc[obj.id] = obj
      return acc
    }, {})

    const relics = {
      relicMainAffixes,
      relicSubAffixes,
      relicSets,
    }

    const augmentedDbMetadata = {
      characters: dbMetadataCharacters,
      lightCones: lightCones,
      relics: relics,
    } as unknown as DBMetadata
    DB.setMetadata(augmentedDbMetadata)

    return augmentedDbMetadata
  },
}

const displayNameMapping: Record<string, string> = {
  8001: 'Caelus (Destruction)',
  8002: 'Stelle (Destruction)',
  8003: 'Caelus (Preservation)',
  8004: 'Stelle (Preservation)',
  8005: 'Caelus (Harmony)',
  8006: 'Stelle (Harmony)',
  8007: 'Caelus (Remembrance)',
  8008: 'Stelle (Remembrance)',
  1213: 'Imbibitor Lunae',
  1224: 'March 7th (Hunt)',
} as const

function getDisplayName(character: DBMetadataCharacter) {
  if (character.id in displayNameMapping) {
    return displayNameMapping[character.id]
  }
  return character.name
}

export type DBMetadataSuperimpositions = Record<number, Record<string, number>>

function getSuperimpositions(): Record<string, DBMetadataSuperimpositions> {
  return {
    20000: {}, // Arrows
    20001: {},
    20002: {},
    20003: {
      1: { [Stats.DEF_P]: 0.16 },
      2: { [Stats.DEF_P]: 0.20 },
      3: { [Stats.DEF_P]: 0.24 },
      4: { [Stats.DEF_P]: 0.28 },
      5: { [Stats.DEF_P]: 0.32 },
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
    20021: {},
    20022: {},
    21000: {
      1: { [Stats.ERR]: 0.08 },
      2: { [Stats.ERR]: 0.10 },
      3: { [Stats.ERR]: 0.12 },
      4: { [Stats.ERR]: 0.14 },
      5: { [Stats.ERR]: 0.16 },
    },
    21001: {},
    21002: {
      1: { [Stats.DEF_P]: 0.16 },
      2: { [Stats.DEF_P]: 0.18 },
      3: { [Stats.DEF_P]: 0.20 },
      4: { [Stats.DEF_P]: 0.22 },
      5: { [Stats.DEF_P]: 0.24 },
    },
    21003: {
      1: { [Stats.ATK_P]: 0.16 },
      2: { [Stats.ATK_P]: 0.20 },
      3: { [Stats.ATK_P]: 0.24 },
      4: { [Stats.ATK_P]: 0.28 },
      5: { [Stats.ATK_P]: 0.32 },
    },
    21004: {
      1: { [Stats.BE]: 0.28 },
      2: { [Stats.BE]: 0.35 },
      3: { [Stats.BE]: 0.42 },
      4: { [Stats.BE]: 0.49 },
      5: { [Stats.BE]: 0.56 },
    },
    21005: {},
    21006: {},
    21007: {
      1: { [Stats.OHB]: 0.10 },
      2: { [Stats.OHB]: 0.125 },
      3: { [Stats.OHB]: 0.15 },
      4: { [Stats.OHB]: 0.175 },
      5: { [Stats.OHB]: 0.20 },
    },
    21008: {
      1: { [Stats.EHR]: 0.20 },
      2: { [Stats.EHR]: 0.25 },
      3: { [Stats.EHR]: 0.30 },
      4: { [Stats.EHR]: 0.35 },
      5: { [Stats.EHR]: 0.40 },
    },
    21009: {},
    21010: {},
    21011: {},
    21012: {},
    21013: {},
    21014: {
      1: { [Stats.RES]: 0.16 },
      2: { [Stats.RES]: 0.20 },
      3: { [Stats.RES]: 0.24 },
      4: { [Stats.RES]: 0.28 },
      5: { [Stats.RES]: 0.32 },
    },
    21015: {},
    21016: {
      1: { [Stats.DEF_P]: 0.16 },
      2: { [Stats.DEF_P]: 0.20 },
      3: { [Stats.DEF_P]: 0.24 },
      4: { [Stats.DEF_P]: 0.28 },
      5: { [Stats.DEF_P]: 0.32 },
    },
    21017: {},
    21018: {},
    21019: {
      1: { [Stats.ATK_P]: 0.16 },
      2: { [Stats.ATK_P]: 0.20 },
      3: { [Stats.ATK_P]: 0.24 },
      4: { [Stats.ATK_P]: 0.28 },
      5: { [Stats.ATK_P]: 0.32 },
    },
    21020: {
      1: { [Stats.ATK_P]: 0.16 },
      2: { [Stats.ATK_P]: 0.20 },
      3: { [Stats.ATK_P]: 0.24 },
      4: { [Stats.ATK_P]: 0.28 },
      5: { [Stats.ATK_P]: 0.32 },
    },
    21021: {},
    21022: {
      1: { [Stats.BE]: 0.16 },
      2: { [Stats.BE]: 0.20 },
      3: { [Stats.BE]: 0.24 },
      4: { [Stats.BE]: 0.28 },
      5: { [Stats.BE]: 0.32 },
    },
    21023: {},
    21024: {},
    21025: {},
    21026: {
      1: { [Stats.ATK_P]: 0.10 },
      2: { [Stats.ATK_P]: 0.125 },
      3: { [Stats.ATK_P]: 0.15 },
      4: { [Stats.ATK_P]: 0.175 },
      5: { [Stats.ATK_P]: 0.20 },
    },
    21027: {},
    21028: {
      1: { [Stats.HP_P]: 0.16 },
      2: { [Stats.HP_P]: 0.20 },
      3: { [Stats.HP_P]: 0.24 },
      4: { [Stats.HP_P]: 0.28 },
      5: { [Stats.HP_P]: 0.32 },
    },
    21029: {},
    21030: {
      1: { [Stats.DEF_P]: 0.16 },
      2: { [Stats.DEF_P]: 0.20 },
      3: { [Stats.DEF_P]: 0.24 },
      4: { [Stats.DEF_P]: 0.28 },
      5: { [Stats.DEF_P]: 0.32 },
    },
    21031: {
      1: { [Stats.CR]: 0.12 },
      2: { [Stats.CR]: 0.15 },
      3: { [Stats.CR]: 0.18 },
      4: { [Stats.CR]: 0.21 },
      5: { [Stats.CR]: 0.24 },
    },
    21032: {},
    21033: {
      1: { [Stats.ATK_P]: 0.24 },
      2: { [Stats.ATK_P]: 0.30 },
      3: { [Stats.ATK_P]: 0.36 },
      4: { [Stats.ATK_P]: 0.42 },
      5: { [Stats.ATK_P]: 0.48 },
    },
    21034: {},
    21035: {
      1: { [Stats.BE]: 0.24 },
      2: { [Stats.BE]: 0.30 },
      3: { [Stats.BE]: 0.36 },
      4: { [Stats.BE]: 0.42 },
      5: { [Stats.BE]: 0.48 },
    },
    21036: {},
    21037: {
      1: { [Stats.ATK_P]: 0.12 },
      2: { [Stats.ATK_P]: 0.14 },
      3: { [Stats.ATK_P]: 0.16 },
      4: { [Stats.ATK_P]: 0.18 },
      5: { [Stats.ATK_P]: 0.20 },
    },
    21038: {},
    21039: {
      1: { [Stats.RES]: 0.12 },
      2: { [Stats.RES]: 0.14 },
      3: { [Stats.RES]: 0.16 },
      4: { [Stats.RES]: 0.18 },
      5: { [Stats.RES]: 0.20 },
    },
    21040: {
      1: { [Stats.ATK_P]: 0.16 },
      2: { [Stats.ATK_P]: 0.18 },
      3: { [Stats.ATK_P]: 0.20 },
      4: { [Stats.ATK_P]: 0.22 },
      5: { [Stats.ATK_P]: 0.24 },
    },
    21041: {},
    21042: {
      1: { [Stats.BE]: 0.28 },
      2: { [Stats.BE]: 0.35 },
      3: { [Stats.BE]: 0.42 },
      4: { [Stats.BE]: 0.49 },
      5: { [Stats.BE]: 0.56 },
    },
    21043: {
      1: { [Stats.DEF_P]: 0.16 },
      2: { [Stats.DEF_P]: 0.20 },
      3: { [Stats.DEF_P]: 0.24 },
      4: { [Stats.DEF_P]: 0.28 },
      5: { [Stats.DEF_P]: 0.32 },
    },
    21044: {
      1: { [Stats.CR]: 0.08 },
      2: { [Stats.CR]: 0.10 },
      3: { [Stats.CR]: 0.12 },
      4: { [Stats.CR]: 0.14 },
      5: { [Stats.CR]: 0.16 },
    },
    21045: {
      1: { [Constants.Stats.BE]: 0.28 },
      2: { [Constants.Stats.BE]: 0.35 },
      3: { [Constants.Stats.BE]: 0.42 },
      4: { [Constants.Stats.BE]: 0.49 },
      5: { [Constants.Stats.BE]: 0.56 },
    },
    21046: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    21047: {
      1: { [Constants.Stats.BE]: 0.28 },
      2: { [Constants.Stats.BE]: 0.35 },
      3: { [Constants.Stats.BE]: 0.42 },
      4: { [Constants.Stats.BE]: 0.49 },
      5: { [Constants.Stats.BE]: 0.56 },
    },
    21048: {
      1: { [Constants.Stats.SPD_P]: 0.08 },
      2: { [Constants.Stats.SPD_P]: 0.09 },
      3: { [Constants.Stats.SPD_P]: 0.10 },
      4: { [Constants.Stats.SPD_P]: 0.11 },
      5: { [Constants.Stats.SPD_P]: 0.12 },
    },
    21050: {
      1: { [Constants.Stats.CD]: 0.12 },
      2: { [Constants.Stats.CD]: 0.15 },
      3: { [Constants.Stats.CD]: 0.18 },
      4: { [Constants.Stats.CD]: 0.21 },
      5: { [Constants.Stats.CD]: 0.24 },
    },
    21051: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
    },
    21052: {
      1: { [Stats.CR]: 0.12 },
      2: { [Stats.CR]: 0.14 },
      3: { [Stats.CR]: 0.16 },
      4: { [Stats.CR]: 0.18 },
      5: { [Stats.CR]: 0.20 },
    },
    22000: {
      1: { [Stats.EHR]: 0.20 },
      2: { [Stats.EHR]: 0.25 },
      3: { [Stats.EHR]: 0.30 },
      4: { [Stats.EHR]: 0.35 },
      5: { [Stats.EHR]: 0.40 },
    },
    22001: {
      1: { [Stats.HP_P]: 0.08 },
      2: { [Stats.HP_P]: 0.09 },
      3: { [Stats.HP_P]: 0.10 },
      4: { [Stats.HP_P]: 0.11 },
      5: { [Stats.HP_P]: 0.12 },
    },
    22002: {
      1: { [Stats.ATK_P]: 0.16 },
      2: { [Stats.ATK_P]: 0.20 },
      3: { [Stats.ATK_P]: 0.24 },
      4: { [Stats.ATK_P]: 0.28 },
      5: { [Stats.ATK_P]: 0.32 },
    },
    22003: {
      1: { [Stats.HP_P]: 0.12 },
      2: { [Stats.HP_P]: 0.15 },
      3: { [Stats.HP_P]: 0.18 },
      4: { [Stats.HP_P]: 0.21 },
      5: { [Stats.HP_P]: 0.24 },
    },
    23000: {},
    23001: {
      1: { [Stats.CR]: 0.18 },
      2: { [Stats.CR]: 0.21 },
      3: { [Stats.CR]: 0.24 },
      4: { [Stats.CR]: 0.27 },
      5: { [Stats.CR]: 0.30 },
    },
    23002: {
      1: { [Stats.ATK_P]: 0.24 },
      2: { [Stats.ATK_P]: 0.28 },
      3: { [Stats.ATK_P]: 0.32 },
      4: { [Stats.ATK_P]: 0.36 },
      5: { [Stats.ATK_P]: 0.40 },
    },
    23003: {
      1: { [Stats.ERR]: 0.10 },
      2: { [Stats.ERR]: 0.12 },
      3: { [Stats.ERR]: 0.14 },
      4: { [Stats.ERR]: 0.16 },
      5: { [Stats.ERR]: 0.18 },
    },
    23004: {},
    23005: {
      1: { [Stats.DEF_P]: 0.24, [Stats.EHR]: 0.24 },
      2: { [Stats.DEF_P]: 0.28, [Stats.EHR]: 0.28 },
      3: { [Stats.DEF_P]: 0.32, [Stats.EHR]: 0.32 },
      4: { [Stats.DEF_P]: 0.36, [Stats.EHR]: 0.36 },
      5: { [Stats.DEF_P]: 0.40, [Stats.EHR]: 0.40 },
    },
    23006: {},
    23007: {
      1: { [Stats.EHR]: 0.24 },
      2: { [Stats.EHR]: 0.28 },
      3: { [Stats.EHR]: 0.32 },
      4: { [Stats.EHR]: 0.36 },
      5: { [Stats.EHR]: 0.40 },
    },
    23008: {
      1: { [Stats.ATK_P]: 0.24 },
      2: { [Stats.ATK_P]: 0.28 },
      3: { [Stats.ATK_P]: 0.32 },
      4: { [Stats.ATK_P]: 0.36 },
      5: { [Stats.ATK_P]: 0.40 },
    },
    23009: {
      1: { [Stats.CR]: 0.18, [Stats.HP_P]: 0.18 },
      2: { [Stats.CR]: 0.21, [Stats.HP_P]: 0.21 },
      3: { [Stats.CR]: 0.24, [Stats.HP_P]: 0.24 },
      4: { [Stats.CR]: 0.27, [Stats.HP_P]: 0.27 },
      5: { [Stats.CR]: 0.30, [Stats.HP_P]: 0.30 },
    },
    23010: {
      1: { [Stats.CD]: 0.36 },
      2: { [Stats.CD]: 0.42 },
      3: { [Stats.CD]: 0.48 },
      4: { [Stats.CD]: 0.54 },
      5: { [Stats.CD]: 0.60 },
    },
    23011: {
      1: { [Stats.HP_P]: 0.24, [Stats.ERR]: 0.12 },
      2: { [Stats.HP_P]: 0.28, [Stats.ERR]: 0.14 },
      3: { [Stats.HP_P]: 0.32, [Stats.ERR]: 0.16 },
      4: { [Stats.HP_P]: 0.36, [Stats.ERR]: 0.18 },
      5: { [Stats.HP_P]: 0.40, [Stats.ERR]: 0.20 },
    },
    23012: {
      1: { [Stats.CD]: 0.30 },
      2: { [Stats.CD]: 0.35 },
      3: { [Stats.CD]: 0.40 },
      4: { [Stats.CD]: 0.45 },
      5: { [Stats.CD]: 0.50 },
    },
    23013: {
      1: { [Stats.HP_P]: 0.18, [Stats.OHB]: 0.12 },
      2: { [Stats.HP_P]: 0.21, [Stats.OHB]: 0.14 },
      3: { [Stats.HP_P]: 0.24, [Stats.OHB]: 0.16 },
      4: { [Stats.HP_P]: 0.27, [Stats.OHB]: 0.18 },
      5: { [Stats.HP_P]: 0.30, [Stats.OHB]: 0.20 },
    },
    23014: {
      1: { [Stats.CD]: 0.20 },
      2: { [Stats.CD]: 0.23 },
      3: { [Stats.CD]: 0.26 },
      4: { [Stats.CD]: 0.29 },
      5: { [Stats.CD]: 0.32 },
    },
    23015: {
      1: { [Stats.CR]: 0.18 },
      2: { [Stats.CR]: 0.21 },
      3: { [Stats.CR]: 0.24 },
      4: { [Stats.CR]: 0.27 },
      5: { [Stats.CR]: 0.30 },
    },
    23016: {
      1: { [Stats.CR]: 0.18 },
      2: { [Stats.CR]: 0.21 },
      3: { [Stats.CR]: 0.24 },
      4: { [Stats.CR]: 0.27 },
      5: { [Stats.CR]: 0.30 },
    },
    23017: {
      1: { [Stats.ERR]: 0.12 },
      2: { [Stats.ERR]: 0.14 },
      3: { [Stats.ERR]: 0.16 },
      4: { [Stats.ERR]: 0.18 },
      5: { [Stats.ERR]: 0.20 },
    },
    23018: {
      1: { [Stats.CD]: 0.36 },
      2: { [Stats.CD]: 0.42 },
      3: { [Stats.CD]: 0.48 },
      4: { [Stats.CD]: 0.54 },
      5: { [Stats.CD]: 0.60 },
    },
    23019: {
      1: { [Stats.BE]: 0.60 },
      2: { [Stats.BE]: 0.70 },
      3: { [Stats.BE]: 0.80 },
      4: { [Stats.BE]: 0.90 },
      5: { [Stats.BE]: 1.00 },
    },
    23020: {
      1: { [Stats.CD]: 0.20 },
      2: { [Stats.CD]: 0.23 },
      3: { [Stats.CD]: 0.26 },
      4: { [Stats.CD]: 0.29 },
      5: { [Stats.CD]: 0.32 },
    },
    23021: { // Earthly Escapade
      1: { [Stats.CD]: 0.32 },
      2: { [Stats.CD]: 0.39 },
      3: { [Stats.CD]: 0.46 },
      4: { [Stats.CD]: 0.53 },
      5: { [Stats.CD]: 0.60 },
    },
    23022: { // Reforged Remembrance
      1: { [Stats.EHR]: 0.40 },
      2: { [Stats.EHR]: 0.45 },
      3: { [Stats.EHR]: 0.50 },
      4: { [Stats.EHR]: 0.55 },
      5: { [Stats.EHR]: 0.60 },
    },
    23023: {
      1: { [Stats.DEF_P]: 0.40 },
      2: { [Stats.DEF_P]: 0.46 },
      3: { [Stats.DEF_P]: 0.52 },
      4: { [Stats.DEF_P]: 0.58 },
      5: { [Stats.DEF_P]: 0.64 },
    },
    23024: {
      1: { [Stats.CD]: 0.36 },
      2: { [Stats.CD]: 0.42 },
      3: { [Stats.CD]: 0.48 },
      4: { [Stats.CD]: 0.54 },
      5: { [Stats.CD]: 0.60 },
    },
    23025: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    23026: {},
    23027: {
      1: { [Stats.BE]: 0.60 },
      2: { [Stats.BE]: 0.70 },
      3: { [Stats.BE]: 0.80 },
      4: { [Stats.BE]: 0.90 },
      5: { [Stats.BE]: 1.00 },
    },
    23028: {
      1: { [Constants.Stats.CR]: 0.16 },
      2: { [Constants.Stats.CR]: 0.19 },
      3: { [Constants.Stats.CR]: 0.22 },
      4: { [Constants.Stats.CR]: 0.25 },
      5: { [Constants.Stats.CR]: 0.28 },
    },
    23029: {
      1: { [Constants.Stats.EHR]: 0.60 },
      2: { [Constants.Stats.EHR]: 0.70 },
      3: { [Constants.Stats.EHR]: 0.80 },
      4: { [Constants.Stats.EHR]: 0.90 },
      5: { [Constants.Stats.EHR]: 1.00 },
    },
    23030: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.42 },
      3: { [Constants.Stats.CD]: 0.48 },
      4: { [Constants.Stats.CD]: 0.54 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23031: {
      1: { [Constants.Stats.CR]: 0.15 },
      2: { [Constants.Stats.CR]: 0.175 },
      3: { [Constants.Stats.CR]: 0.20 },
      4: { [Constants.Stats.CR]: 0.225 },
      5: { [Constants.Stats.CR]: 0.25 },
    },
    23032: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    23033: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    23034: {},
    23035: {
      1: { [Constants.Stats.BE]: 0.60 },
      2: { [Constants.Stats.BE]: 0.70 },
      3: { [Constants.Stats.BE]: 0.80 },
      4: { [Constants.Stats.BE]: 0.90 },
      5: { [Constants.Stats.BE]: 1.00 },
    },
    23036: {
      1: { [Constants.Stats.SPD]: 12 },
      2: { [Constants.Stats.SPD]: 14 },
      3: { [Constants.Stats.SPD]: 16 },
      4: { [Constants.Stats.SPD]: 18 },
      5: { [Constants.Stats.SPD]: 20 },
    },
    23037: {
      1: { [Constants.Stats.CR]: 0.12 },
      2: { [Constants.Stats.CR]: 0.14 },
      3: { [Constants.Stats.CR]: 0.16 },
      4: { [Constants.Stats.CR]: 0.18 },
      5: { [Constants.Stats.CR]: 0.20 },
    },
    23038: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.42 },
      3: { [Constants.Stats.CD]: 0.48 },
      4: { [Constants.Stats.CD]: 0.54 },
      5: { [Constants.Stats.CD]: 0.60 },
    },
    23039: {
      1: { [Constants.Stats.HP_P]: 0.18 },
      2: { [Constants.Stats.HP_P]: 0.21 },
      3: { [Constants.Stats.HP_P]: 0.24 },
      4: { [Constants.Stats.HP_P]: 0.27 },
      5: { [Constants.Stats.HP_P]: 0.30 },
    },
    24000: {},
    24001: {
      1: { [Stats.CR]: 0.08 },
      2: { [Stats.CR]: 0.10 },
      3: { [Stats.CR]: 0.12 },
      4: { [Stats.CR]: 0.14 },
      5: { [Stats.CR]: 0.16 },
    },
    24002: {
      1: { [Stats.RES]: 0.08 },
      2: { [Stats.RES]: 0.10 },
      3: { [Stats.RES]: 0.12 },
      4: { [Stats.RES]: 0.14 },
      5: { [Stats.RES]: 0.16 },
    },
    24003: {
      1: { [Stats.BE]: 0.20 },
      2: { [Stats.BE]: 0.25 },
      3: { [Stats.BE]: 0.30 },
      4: { [Stats.BE]: 0.35 },
      5: { [Stats.BE]: 0.40 },
    },
    24004: {
      1: { [Constants.Stats.ATK_P]: 0.08 },
      2: { [Constants.Stats.ATK_P]: 0.09 },
      3: { [Constants.Stats.ATK_P]: 0.10 },
      4: { [Constants.Stats.ATK_P]: 0.11 },
      5: { [Constants.Stats.ATK_P]: 0.12 },
    },
    24005: {
      1: { [Constants.Stats.SPD_P]: 0.06 },
      2: { [Constants.Stats.SPD_P]: 0.075 },
      3: { [Constants.Stats.SPD_P]: 0.09 },
      4: { [Constants.Stats.SPD_P]: 0.105 },
      5: { [Constants.Stats.SPD_P]: 0.12 },
    },
  }
}

// Standardized to 450 width
function getLightConeOverrideCenter(): Record<string, number> {
  return {
    20000: 270,
    20001: 220,
    20002: 160,
    20003: 310,
    20004: 180,
    20005: 210,
    20006: 390,
    20007: 180,
    20008: 220,
    20009: 230,
    20010: 250,
    20011: 390,
    20012: 300,
    20013: 220,
    20014: 210,
    20015: 270,
    20016: 270,
    20017: 410,
    20018: 190,
    20019: 230,
    20020: 250,
    21000: 150,
    21001: 290,
    21002: 160,
    21003: 195,
    21004: 150,
    21005: 250,
    21006: 170,
    21007: 240,
    21008: 140,
    21009: 140,
    21010: 160,
    21011: 115,
    21012: 160,
    21013: 200,
    21014: 140,
    21015: 125,
    21016: 180,
    21017: 140,
    21018: 210,
    21019: 180,
    21020: 230,
    21021: 180,
    21022: 300,
    21023: 240,
    21024: 140,
    21025: 125,
    21026: 160,
    21027: 200,
    21028: 250,
    21029: 160,
    21030: 305,
    21031: 190,
    21032: 245,
    21033: 140,
    21034: 220,
    21035: 300,
    21036: 220,
    21037: 210,
    21038: 130,
    21039: 220,
    21040: 150,
    21041: 160,
    21042: 200,
    21043: 220,
    21044: 150,
    21045: 160,
    21046: 145,
    21047: 145,
    21048: 250,
    22000: 275,
    22001: 220,
    22002: 160,
    22003: 185,
    23000: 140,
    23001: 150,
    23002: 160,
    23003: 250,
    23004: 140,
    23005: 150,
    23006: 200,
    23007: 210,
    23008: 160,
    23009: 130,
    23010: 180,
    23011: 180,
    23012: 300,
    23013: 180,
    23014: 120,
    23015: 190,
    23016: 130,
    23017: 190,
    23018: 170,
    23019: 270,
    23020: 220,
    23021: 150,
    23022: 190,
    23023: 140,
    23024: 80,
    23025: 125,
    23026: 180,
    23027: 140,
    23028: 150,
    23029: 140,
    23031: 145,
    23032: 180,
    23033: 175,
    23034: 175, // TODO
    23035: 175, // TODO
    24000: 170,
    24001: 270,
    24002: 170,
    24003: 250,
    24004: 270,

    // TODO

    23037: 150,
    23036: 180,
    21052: 270,
    21051: 180,
    21050: 170,
    20022: 305,
    20021: 320,

    23038: 210,
    23039: 165,
    24005: 300,
  }
}

function getOverrideImageCenter(): Record<string, {
  x: number
  y: number
  z: number
}> {
  return {
    1001: { // March 7th
      x: 985,
      y: 1075,
      z: 1.05,
    },
    1002: { // Dan Heng
      x: 1024,
      y: 1000,
      z: 1,
    },
    1003: { // Himeko
      x: 1015,
      y: 1215,
      z: 1.05,
    },
    1004: { // Welt
      x: 885,
      y: 950,
      z: 1,
    },
    1005: { // Kafka
      x: 1000,
      y: 950,
      z: 1.1,
    },
    1006: { // Silver Wolf
      x: 1050,
      y: 950,
      z: 1,
    },
    1008: { // Arlan
      x: 1240,
      y: 1000,
      z: 1,
    },
    1009: { // Asta
      x: 1024,
      y: 975,
      z: 1,
    },
    1013: { // Herta
      x: 970,
      y: 910,
      z: 1.1,
    },
    1101: { // Bronya
      x: 950,
      y: 1200,
      z: 1.1,
    },
    1102: { // Seele
      x: 820,
      y: 1075,
      z: 1.1,
    },
    1103: { // Serval
      x: 1060,
      y: 1030,
      z: 1.3,
    },
    1104: { // Gepard
      x: 1150,
      y: 1110,
      z: 1,
    },
    1105: { // Natasha
      x: 1040,
      y: 1024,
      z: 1,
    },
    1106: { // Pela
      x: 780,
      y: 1100,
      z: 1,
    },
    1107: { // Clara
      x: 880,
      y: 900,
      z: 1.15,
    },
    1108: { // Sampo
      x: 1000,
      y: 950,
      z: 1,
    },
    1109: { // Hook
      x: 975,
      y: 1025,
      z: 1.1,
    },
    1110: { // Lynx
      x: 1180,
      y: 1050,
      z: 1.05,
    },
    1111: { // Luka
      x: 930,
      y: 1000,
      z: 1,
    },
    1112: { // Topaz and Numby
      x: 1120,
      y: 875,
      z: 1,
    },
    1201: { // Qingque
      x: 1000,
      y: 1024,
      z: 1,
    },
    1202: { // Tingyun
      x: 1024,
      y: 950,
      z: 1,
    },
    1203: { // Luocha
      x: 1024,
      y: 975,
      z: 1.05,
    },
    1204: { // Jing Yuan
      x: 1024,
      y: 1024,
      z: 1.1,
    },
    1205: { // Blade
      x: 990,
      y: 800,
      z: 1,
    },
    1206: { // Sushang
      x: 1075,
      y: 1015,
      z: 1.2,
    },
    1207: { // Yukong
      x: 900,
      y: 1055,
      z: 1.1,
    },
    1208: { // Fu Xuan
      x: 920,
      y: 950,
      z: 1,
    },
    1209: { // Yanqing
      x: 1000,
      y: 1000,
      z: 1,
    },
    1210: { // Guinaifen
      x: 1000,
      y: 1024,
      z: 1,
    },
    1211: { // Bailu
      x: 1050,
      y: 950,
      z: 1.05,
    },
    1212: { // Jingliu
      x: 1024,
      y: 930,
      z: 1,
    },
    1213: { // Dan Heng • Imbibitor Lunae
      x: 1050,
      y: 1000,
      z: 1.05,
    },
    1214: { // Xueyi
      x: 1000,
      y: 900,
      z: 1,
    },
    1215: { // Hanya
      x: 1000,
      y: 1024,
      z: 1.1,
    },
    1217: { // Huohuo
      x: 950,
      y: 975,
      z: 1.075,
    },
    1218: { // Jiaoqiu
      x: 950,
      y: 900,
      z: 1.1,
    },
    1220: { // Feixiao
      x: 1024,
      y: 1050,
      z: 1,
    },
    1221: { // Yunli
      x: 1024,
      y: 1075,
      z: 1.1,
    },
    1222: { // Lingsha
      x: 1110,
      y: 1000,
      z: 1.1,
    },
    1223: { // Moze
      x: 960,
      y: 1024,
      z: 1.05,
    },
    1224: { // March 8th
      x: 825,
      y: 950,
      z: 1.1,
    },
    1301: { // Gallagher
      x: 1200,
      y: 975,
      z: 1,
    },
    1302: { // Argenti
      x: 680,
      y: 1000,
      z: 1.15,
    },
    1303: { // Ruan Mei
      x: 1060,
      y: 1050,
      z: 1,
    },
    1304: { // Aventurine
      x: 1150,
      y: 1000,
      z: 1.05,
    },
    1305: { // Dr Ratio
      x: 965,
      y: 840,
      z: 1.15,
    },
    1306: { // Sparkle
      x: 1050,
      y: 1050,
      z: 1,
    },
    1307: { // Black Swan
      x: 950,
      y: 925,
      z: 1.25,
    },
    1308: { // Acheron
      x: 1000,
      y: 900,
      z: 1,
    },
    1309: { // Robin
      x: 1024,
      y: 925,
      z: 1,
    },
    1310: { // Firefly
      x: 930,
      y: 1075,
      z: 1.25,
    },
    1312: { // Misha
      x: 1050,
      y: 1075,
      z: 1,
    },
    1314: { // Jade
      x: 1024,
      y: 850,
      z: 1.15,
    },
    1315: { // Boothill
      x: 1000,
      y: 1100,
      z: 1,
    },
    1317: { // Rappa
      x: 1125,
      y: 1175,
      z: 1,
    },
    8001: { // Physical Trailblazer M
      x: 1024,
      y: 1100,
      z: 1,
    },
    8002: { // Physical Trailblazer F
      x: 1024,
      y: 1024,
      z: 1,
    },
    8003: { // Fire Trailblazer M
      x: 980,
      y: 1024,
      z: 1.05,
    },
    8004: { // Fire Trailblazer F
      x: 1050,
      y: 1024,
      z: 1.05,
    },
    8005: { // Imaginary Trailblazer M
      x: 1040,
      y: 1000,
      z: 1.1,
    },
    8006: { // Imaginary Trailblazer F
      x: 1040,
      y: 1000,
      z: 1.1,
    },
    8007: { // Imaginary Trailblazer M
      x: 955,
      y: 975,
      z: 0.95,
    },
    8008: { // Imaginary Trailblazer F
      x: 955,
      y: 975,
      z: 0.95,
    },
    1225: { // Fugue
      x: 875,
      y: 1125,
      z: 1.15,
    },
    1313: { // Sunday
      x: 1000,
      y: 950,
      z: 1.075,
    },
    1401: { // The Herta
      x: 1000,
      y: 1085,
      z: 1.275,
    },
    1402: { // Aglaea
      x: 1200,
      y: 750,
      z: 1.10,
    },
    1403: { // Tribbie
      x: 875,
      y: 1000,
      z: 1.075,
    },
    1404: { // Mydei
      x: 925,
      y: 1050,
      z: 1.05,
    },
  }
}

function getScoringMetadata(): Record<string, ScoringMetadata> {
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
      presets: [
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.SHIELD,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.fnAshblazingSet(8),
        PresetEffects.fnPioneerSet(4),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [],
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
        ],
        comboAbilities: [NULL, ULT, FUA, SKILL, FUA, SKILL, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.WASTELANDER_SET,
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.5,
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
      presets: [
        PresetEffects.PRISONER_SET,
        PresetEffects.fnAshblazingSet(6),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.DOT,
      hiddenColumns: [],
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
          Stats.CR,
          Stats.CD,
        ],
        breakpoints: {
          [Stats.EHR]: 0.282,
        },
        comboAbilities: [NULL, ULT, SKILL, FUA, SKILL, FUA],
        comboDot: 16,
        comboBreak: 0,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
        ],
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
          },
        ],
      },
    },
    1006: { // Silver Wolf
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.5,
        [Stats.BE]: 0,
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1009: { // Asta
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.ULT, SortOption.FUA],
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
      presets: [
        PresetEffects.fnAshblazingSet(8),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, FUA, SKILL, FUA, SKILL, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.HunterOfGlacialForest, Sets.HunterOfGlacialForest],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1101: { // Bronya
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
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
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
          Stats.ERR,
        ],
      },
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        errRopeEidolon: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.BandOfSizzlingThunder, Sets.BandOfSizzlingThunder],
          [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
          Sets.RutilantArena,
          Sets.SprightlyVonwacq,
          ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.SHIELD,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
        [Stats.RES]: 0.5,
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.fnAshblazingSet(2),
        PresetEffects.fnSacerdosSet(1),
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.ULT, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, FUA, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      hiddenColumns: [SortOption.FUA],
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
          Stats.CR,
          Stats.CD,
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 60,
        comboBreak: 0,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      hiddenColumns: [SortOption.FUA],
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
          Stats.CR,
        ],
        comboAbilities: [NULL, ULT, SKILL, BASIC, BASIC],
        comboDot: 5,
        comboBreak: 1,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
          RELICS_2P_BREAK_EFFECT_SPEED,
        ],
        ornamentSets: [
          Sets.TaliaKingdomOfBanditry,
          Sets.FirmamentFrontlineGlamoth,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.fnAshblazingSet(0),
        PresetEffects.BANANA_SET,
        PresetEffects.fnPioneerSet(4),
        PresetEffects.fnSacerdosSet(1),
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.ULT, SortOption.DOT],
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
        ],
        errRopeEidolon: 6,
        comboAbilities: [NULL, ULT, SKILL, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          Sets.TheWondrousBananAmusementPark,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnSacerdosSet(2),
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, BASIC, FUA, BASIC, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1202: { // Tingyun
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
        [Stats.RES]: 0.5,
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
      presets: [],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.SPD,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.fnAshblazingSet(8),
        PresetEffects.VALOROUS_SET,
        PresetEffects.BANANA_SET,
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.TheWondrousBananAmusementPark,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnSacerdosSet(1),
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
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
          Stats.HP,
          Stats.ATK_P,
        ],
        comboAbilities: [NULL, ULT, BASIC, FUA, BASIC],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.LongevousDisciple, Sets.LongevousDisciple],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
          Stats.BE,
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.ChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing],
          [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
          Sets.TaliaKingdomOfBanditry,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          Sets.RutilantArena,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.WASTELANDER_SET,
        PresetEffects.fnSacerdosSet(1),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
    },
    1208: { // Fu Xuan
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
      presets: [],
      sortOption: SortOption.EHP,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnAshblazingSet(2),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.DOT],
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
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, SKILL, FUA, SKILL, FUA, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.HunterOfGlacialForest, Sets.HunterOfGlacialForest],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1210: { // Guinaifen
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.5,
        [Stats.BE]: 0,
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
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      hiddenColumns: [SortOption.FUA],
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
      presets: [],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
        ],
        errRopeEidolon: 0,
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.HunterOfGlacialForest, Sets.HunterOfGlacialForest],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, BASIC, BASIC],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat],
          [Sets.WastelanderOfBanditryDesert, Sets.WastelanderOfBanditryDesert],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.fnAshblazingSet(3),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.DOT],
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
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, FUA, SKILL, FUA, SKILL, FUA],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.TaliaKingdomOfBanditry,
          Sets.InertSalsotto,
          Sets.SpaceSealingStation,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
        [Stats.RES]: 0.5,
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
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1218: { // Jiaoqiu
      stats: {
        [Constants.Stats.ATK]: 0.5,
        [Constants.Stats.ATK_P]: 0.5,
        [Constants.Stats.DEF]: 0.5,
        [Constants.Stats.DEF_P]: 0.5,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0.5,
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
          Constants.Stats.EHR,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ATK_P,
          Constants.Stats.ERR,
        ],
      },
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.EHR,
      hiddenColumns: [SortOption.FUA],
    },
    1220: { // Feixiao
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
      presets: [
        PresetEffects.fnAshblazingSet(1),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.DOT],
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
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, SKILL, FUA, FUA, ULT, SKILL, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.TheWindSoaringValorous, Sets.TheWindSoaringValorous],
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1221: { // Yunli
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnPioneerSet(4),
        PresetEffects.fnAshblazingSet(8),
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.ULT, SortOption.DOT],
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
        ],
        errRopeEidolon: 0,
        comboAbilities: [NULL, ULT, SKILL, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.TheWindSoaringValorous, Sets.TheWindSoaringValorous],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: '1309', // Robin
            lightCone: '23026', // Nightglow
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
          },
        ],
      },
    },
    1222: { // Lingsha
      stats: {
        [Constants.Stats.ATK]: 0.75,
        [Constants.Stats.ATK_P]: 0.75,
        [Constants.Stats.DEF]: 0.5,
        [Constants.Stats.DEF_P]: 0.5,
        [Constants.Stats.HP]: 0.5,
        [Constants.Stats.HP_P]: 0.5,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.75,
        [Constants.Stats.BE]: 1,
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
          Constants.Stats.OHB,
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.ATK_P,
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
          Constants.Stats.Fire_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.BE,
          Constants.Stats.ERR,
          Constants.Stats.ATK_P,
        ],
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.fnAshblazingSet(6),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.BE,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.DOT],
    },
    1223: { // Moze
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
      presets: [
        PresetEffects.fnPioneerSet(4),
        PresetEffects.fnAshblazingSet(6),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.DOT],
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
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.ATK,
        ],
        comboAbilities: [NULL, SKILL, ULT, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1224: { // March 8th
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
      presets: [
        PresetEffects.fnAshblazingSet(2),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
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
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, BASIC, FUA],
        comboDot: 0,
        comboBreak: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat],
          [Sets.WastelanderOfBanditryDesert, Sets.WastelanderOfBanditryDesert],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1225: { // Fugue
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
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
        [Stats.Fire_DMG]: 1,
        [Stats.Ice_DMG]: 0,
        [Stats.Lightning_DMG]: 0,
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 0,
      },
      parts: {
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.BE,
        ],
      },
      presets: [],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.ATK_P,
            Stats.EHR,
          ],
          [Parts.Feet]: [
            Stats.SPD,
            Stats.ATK_P,
          ],
          [Parts.PlanarSphere]: [
            Stats.ATK_P,
            Stats.Fire_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.EHR,
        ],
        errRopeEidolon: 0,
        breakpoints: {
          [Stats.EHR]: 0.67,
        },
        comboAbilities: [NULL, ULT, BASIC, BASIC, BASIC],
        comboDot: 0,
        comboBreak: 3,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.ThiefOfShootingMeteor, Sets.ThiefOfShootingMeteor],
          [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
          RELICS_2P_BREAK_EFFECT_SPEED,
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.ForgeOfTheKalpagniLantern,
          Sets.TaliaKingdomOfBanditry,
          ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
        ],
        teammates: [
          {
            characterId: '1310', // Firefly
            lightCone: '23025', // Whereabouts
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
            characterId: '1222', // Lingsha
            lightCone: '23032', // Scent
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
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
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.BE,
        ],
      },
      presets: [],
      sortOption: SortOption.BE,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.ChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          Sets.FirmamentFrontlineGlamoth,
        ],
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
          },
        ],
      },
    },
    1303: { // Ruan Mei
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
        [Parts.Body]: [],
        [Parts.Feet]: [],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.BE,
        ],
      },
      presets: [],
      sortOption: SortOption.BE,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1304: { // Aventurine
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 1,
        [Stats.DEF_P]: 1,
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.FUA,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.DEF_P,
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
          Stats.DEF,
        ],
        breakpoints: {
          [Stats.DEF]: 4000,
        },
        comboAbilities: [NULL, ULT, BASIC, FUA, BASIC, FUA],
        comboDot: 0,
        comboBreak: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.KnightOfPurityPalace, Sets.KnightOfPurityPalace],
          [Sets.TheAshblazingGrandDuke, Sets.KnightOfPurityPalace, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
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
        ],
      },
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
      presets: [
        PresetEffects.fnAshblazingSet(1),
        PresetEffects.fnPioneerSet(4),
        PresetEffects.VALOROUS_SET,
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, FUA, FUA, SKILL, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1306: { // Sparkle
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.DOT,
      hiddenColumns: [SortOption.FUA],
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
          Stats.CR,
          Stats.CD,
        ],
        breakpoints: {
          [Stats.EHR]: 1.20,
        },
        comboAbilities: [NULL, SKILL, ULT, BASIC, BASIC],
        comboDot: 16,
        comboBreak: 0,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
          Sets.PanCosmicCommercialEnterprise,
        ],
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
          },
        ],
      },
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
          Stats.ATK_P,
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1309: { // Robin
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
      presets: [],
      sortOption: SortOption.ATK,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
    },
    1310: { // Firefly
      stats: {
        [Constants.Stats.ATK]: 0.5,
        [Constants.Stats.ATK_P]: 0.5,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 0,
        [Constants.Stats.HP_P]: 0,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
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
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.BE,
        ],
      },
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
          ],
          [Parts.LinkRope]: [
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.ATK,
          Stats.CR,
          Stats.CD,
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.ForgeOfTheKalpagniLantern,
        ],
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
          },
        ],
      },
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
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1313: { // Sunday
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
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
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
        ],
        [Parts.Feet]: [],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
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
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.fnAshblazingSet(8),
      ],
      sortOption: SortOption.FUA,
      hiddenColumns: [SortOption.SKILL, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, FUA, BASIC, FUA, BASIC],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.DuranDynastyOfRunningWolves,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
    },
    1315: { // Boothill
      stats: {
        [Stats.ATK]: 0.25,
        [Stats.ATK_P]: 0.25,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.25,
        [Stats.CD]: 0.25,
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
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.BE,
        ],
      },
      presets: [],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
          ],
          [Parts.Feet]: [
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
        substats: [
          Stats.BE,
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, BASIC, BASIC, BASIC],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.ThiefOfShootingMeteor, Sets.WatchmakerMasterOfDreamMachinations],
          [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
          RELICS_2P_BREAK_EFFECT_SPEED,
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.TaliaKingdomOfBanditry,
        ],
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
          },
        ],
      },
    },
    1317: { // Rappa
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
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
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.BE,
        ],
      },
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.ATK_P,
          ],
          [Parts.Feet]: [
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.Imaginary_DMG,
            Stats.ATK_P,
          ],
          [Parts.LinkRope]: [
            Stats.BE,
          ],
        },
        substats: [
          Stats.BE,
          Stats.ATK_P,
          Stats.ATK,
          Stats.CD,
          Stats.CR,
        ],
        breakpoints: {
          [Stats.ATK]: 3200,
        },
        comboAbilities: [NULL, ULT, BASIC, BASIC, BASIC, SKILL],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
          [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.TaliaKingdomOfBanditry,
        ],
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
            characterId: '1222', // Lingsha
            lightCone: '23032', // Scent
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
          Stats.ATK,
        ],
        comboAbilities: [NULL, ULT, SKILL, SKILL, SKILL],
        comboDot: 0,
        comboBreak: 1,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
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
          },
        ],
      },
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
      presets: [],
      sortOption: SortOption.SHIELD,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
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
      presets: [],
      sortOption: SortOption.SHIELD,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
    },
    8005: { // Imaginary Trailblazer M
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.BE,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.BE,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    8006: { // Imaginary Trailblazer F
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.5,
        [Stats.DEF_P]: 0.5,
        [Stats.HP]: 0.5,
        [Stats.HP_P]: 0.5,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
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
        [Parts.Body]: [],
        [Parts.Feet]: [
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.BE,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.BE,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    8007: { // Remembrance Trailblazer M
      stats: {
        [Stats.ATK]: 0.25,
        [Stats.ATK_P]: 0.25,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.25,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
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
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
      addedColumns: [SortOption.MEMO_SKILL],
    },
    8008: { // Remembrance Trailblazer F
      stats: {
        [Stats.ATK]: 0.25,
        [Stats.ATK_P]: 0.25,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 1,
        [Stats.CR]: 0.25,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
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
          Stats.CD,
        ],
        [Parts.Feet]: [
          Stats.ATK_P,
          Stats.SPD,
        ],
        [Parts.PlanarSphere]: [],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
      addedColumns: [SortOption.MEMO_SKILL],
    },
    1401: { // The Herta
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
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        ],
        comboAbilities: [NULL, ULT, SKILL],
        comboDot: 0,
        comboBreak: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.IzumoGenseiAndTakamaDivineRealm,
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: '1314', // Jade
            lightCone: '23028', // Yet hope
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
            characterId: '1222', // Lingsha
            lightCone: '23032', // Scent
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1402: { // Aglaea
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
          Stats.ERR,
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
      addedColumns: [SortOption.MEMO_SKILL],
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
        ],
        comboAbilities: [NULL, ULT, BASIC, MEMO_SKILL, MEMO_SKILL, BASIC, MEMO_SKILL],
        comboDot: 0,
        comboBreak: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.HeroOfTriumphantSong, Sets.HeroOfTriumphantSong],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.TheWondrousBananAmusementPark,
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: '1313', // Sunday
            lightCone: '23034', // Grounded
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
            characterId: '1217', // Huohuo
            lightCone: '23017', // Night of Fright
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1403: { // Tribbie
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0.75,
        [Stats.HP_P]: 0.75,
        [Stats.SPD]: 0,
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
          Stats.CD,
          Stats.CR,
          Stats.HP_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.Quantum_DMG,
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      presets: [],
      sortOption: SortOption.FUA,
      hiddenColumns: [],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CR,
            Stats.CD,
            Stats.HP_P,
          ],
          [Parts.Feet]: [
            Stats.HP_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.HP_P,
            Stats.Quantum_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.HP_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.HP_P,
          Stats.HP,
          Stats.ATK_P,
        ],
        comboAbilities: [NULL, ULT, FUA, FUA, BASIC, FUA, FUA],
        comboDot: 0,
        comboBreak: 0,
        errRopeEidolon: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: '1401', // The Herta
            lightCone: '23037', // Veil
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1103', // Serval
            lightCone: '20013', // Passkey
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: '1222', // Lingsha
            lightCone: '23032', // Scent
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1404: { // Mydei
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
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
        [Stats.Wind_DMG]: 0,
        [Stats.Quantum_DMG]: 0,
        [Stats.Imaginary_DMG]: 1,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
          Stats.HP_P,
        ],
        [Parts.Feet]: [
          Stats.SPD,
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.Imaginary_DMG,
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
        ],
      },
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.CD,
            Stats.HP_P,
          ],
          [Parts.Feet]: [
            Stats.HP_P,
            Stats.SPD,
          ],
          [Parts.PlanarSphere]: [
            Stats.HP_P,
            Stats.Imaginary_DMG,
          ],
          [Parts.LinkRope]: [
            Stats.HP_P,
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.HP_P,
          Stats.HP,
          Stats.ATK_P,
        ],
        comboAbilities: [NULL, SKILL, ULT, SKILL],
        comboDot: 0,
        comboBreak: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.BoneCollectionsSereneDemesne,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: '1313', // Sunday
            lightCone: '23034', // Grounded
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1403', // Tribbie
            lightCone: '23038', // Flower
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: '1203', // Luocha
            lightCone: '23008', // Coffin
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
  }
}
