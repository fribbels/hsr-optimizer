import gameData from 'data/game_data.json' with { type: 'json' }
import relicMainAffixes from 'data/relic_main_affixes.json' with { type: 'json' }
import relicSubAffixes from 'data/relic_sub_affixes.json' with { type: 'json' }
import {
  Constants,
  Parts,
  PartsMainStats,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  DEFAULT_BASIC,
  DEFAULT_BREAK,
  DEFAULT_DOT,
  DEFAULT_FUA,
  DEFAULT_MEMO_SKILL,
  DEFAULT_MEMO_TALENT,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  END_BASIC,
  END_BREAK,
  END_DOT,
  END_FUA,
  END_SKILL,
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_BASIC,
  START_SKILL,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  A_GROUNDED_ASCENT,
  ACHERON,
  ALONG_THE_PASSING_SHORE,
  AVENTURINE,
  BLACK_SWAN,
  BRONYA,
  BUT_THE_BATTLE_ISNT_OVER,
  CASTORICE,
  CIPHER,
  DANCE_DANCE_DANCE,
  EARTHLY_ESCAPADE,
  FEIXIAO,
  FIREFLY,
  FLOWING_NIGHTGLOW,
  FUGUE,
  HUOHUO,
  HYACINE,
  I_VENTURE_FORTH_TO_HUNT,
  IF_TIME_WERE_A_FLOWER,
  INHERENTLY_UNJUST_DESTINY,
  INTO_THE_UNREACHABLE_VEIL,
  JADE,
  JIAOQIU,
  KAFKA_B1,
  LIES_DANCE_ON_THE_BREEZE,
  LINGSHA,
  LONG_MAY_RAINBOWS_ADORN_THE_SKY,
  LONG_ROAD_LEADS_HOME,
  LUOCHA,
  MAKE_FAREWELLS_MORE_BEAUTIFUL,
  MEMORIES_OF_THE_PAST,
  MEMORYS_CURTAIN_NEVER_FALLS,
  MULTIPLICATION,
  NIGHT_OF_FRIGHT,
  PAST_SELF_IN_MIRROR,
  PATIENCE_IS_ALL_YOU_NEED,
  QUID_PRO_QUO,
  REFORGED_REMEMBRANCE,
  ROBIN,
  RUAN_MEI,
  SCENT_ALONE_STAYS_TRUE,
  SPARKLE,
  STELLE_REMEMBRANCE,
  SUNDAY,
  THE_HERTA,
  THOSE_MANY_SPRINGS,
  TINGYUN,
  TOPAZ_NUMBY,
  TRIBBIE,
  WHEREABOUTS_SHOULD_DREAMS_REST,
  WORRISOME_BLISSFUL,
  YET_HOPE_IS_PRICELESS,
} from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { PresetEffects } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import {
  DBMetadata,
  DBMetadataCharacter,
  DBMetadataLightCone,
  DBMetadataSets,
  ScoringMetadata,
} from 'types/metadata'

const characters: Record<string, DBMetadataCharacter> = gameData.characters as unknown as Record<string, DBMetadataCharacter>
const lightCones: Record<string, DBMetadataLightCone> = gameData.lightCones as unknown as Record<string, DBMetadataLightCone>

const MATCH_2P_WEIGHT = 0.75
const T2_WEIGHT = 0.9

function weights<K extends string>(sets: K[], weight: number = 1) {
  return sets.reduce((acc, set) => {
    acc[set] = weight
    return acc
  }, {} as Record<K, number>)
}

const RELICS_2P_BREAK_EFFECT_SPEED = [
  Sets.MessengerTraversingHackerspace,
  Sets.SacerdosRelivedOrdeal,
  Sets.ThiefOfShootingMeteor,
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.IronCavalryAgainstTheScourge,
  Sets.WarriorGoddessOfSunAndThunder,
]

const RELICS_2P_SPEED = [
  Sets.MessengerTraversingHackerspace,
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
]

const RELICS_2P_ATK = [
  Sets.MusketeerOfWildWheat,
  Sets.PrisonerInDeepConfinement,
  Sets.TheWindSoaringValorous,
  Sets.HeroOfTriumphantSong,
]

const SPREAD_RELICS_2P_SPEED_WEIGHTS = {
  [Sets.WarriorGoddessOfSunAndThunder]: MATCH_2P_WEIGHT,
  [Sets.MessengerTraversingHackerspace]: MATCH_2P_WEIGHT,
  [Sets.SacerdosRelivedOrdeal]: MATCH_2P_WEIGHT,
}

const SPREAD_RELICS_2P_BREAK_WEIGHTS = {
  [Sets.ThiefOfShootingMeteor]: MATCH_2P_WEIGHT,
  [Sets.WatchmakerMasterOfDreamMachinations]: MATCH_2P_WEIGHT,
  [Sets.IronCavalryAgainstTheScourge]: MATCH_2P_WEIGHT,
}

const SPREAD_RELICS_2P_ATK_WEIGHTS = {
  [Sets.MusketeerOfWildWheat]: MATCH_2P_WEIGHT,
  [Sets.PrisonerInDeepConfinement]: MATCH_2P_WEIGHT,
  [Sets.TheWindSoaringValorous]: MATCH_2P_WEIGHT,
  [Sets.HeroOfTriumphantSong]: MATCH_2P_WEIGHT,
}

const SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS = {
  ...SPREAD_RELICS_2P_ATK_WEIGHTS,
  [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
  [Sets.WorldRemakingDeliverer]: MATCH_2P_WEIGHT,
}

const SPREAD_RELICS_4P_GENERAL_CONDITIONALS = [
  [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
  [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
  [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
  [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
]

const SPREAD_ORNAMENTS_2P_FUA = [
  Sets.DuranDynastyOfRunningWolves,
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.InertSalsotto,
]

const SPREAD_ORNAMENTS_2P_FUA_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_FUA)

const SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS = [
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.ArcadiaOfWovenDreams,
]

const SPREAD_ORNAMENTS_2P_ENERGY_REGEN = [
  Sets.SprightlyVonwacq,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
]

const SPREAD_ORNAMENTS_2P_ENERGY_REGEN_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_ENERGY_REGEN)

const SPREAD_ORNAMENTS_2P_SUPPORT = [
  Sets.SprightlyVonwacq,
  Sets.BrokenKeel,
  Sets.PenaconyLandOfTheDreams,
  Sets.FleetOfTheAgeless,
  Sets.LushakaTheSunkenSeas,
  Sets.ForgeOfTheKalpagniLantern,
  Sets.GiantTreeOfRaptBrooding,
]

const SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_SUPPORT)

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
      acc[obj.id] = obj as DBMetadataSets
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
    22004: {
      1: { [Stats.ATK_P]: 0.08 },
      2: { [Stats.ATK_P]: 0.10 },
      3: { [Stats.ATK_P]: 0.12 },
      4: { [Stats.ATK_P]: 0.14 },
      5: { [Stats.ATK_P]: 0.16 },
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
    23040: {
      1: { [Constants.Stats.HP_P]: 0.30 },
      2: { [Constants.Stats.HP_P]: 0.375 },
      3: { [Constants.Stats.HP_P]: 0.45 },
      4: { [Constants.Stats.HP_P]: 0.525 },
      5: { [Constants.Stats.HP_P]: 0.60 },
    },
    23042: {
      1: { [Constants.Stats.SPD_P]: 0.18 },
      2: { [Constants.Stats.SPD_P]: 0.21 },
      3: { [Constants.Stats.SPD_P]: 0.24 },
      4: { [Constants.Stats.SPD_P]: 0.27 },
      5: { [Constants.Stats.SPD_P]: 0.30 },
    },
    23043: {
      1: { [Constants.Stats.SPD_P]: 0.18 },
      2: { [Constants.Stats.SPD_P]: 0.21 },
      3: { [Constants.Stats.SPD_P]: 0.24 },
      4: { [Constants.Stats.SPD_P]: 0.27 },
      5: { [Constants.Stats.SPD_P]: 0.30 },
    },
    23049: {
      1: { [Constants.Stats.HP_P]: 0.30 },
      2: { [Constants.Stats.HP_P]: 0.375 },
      3: { [Constants.Stats.HP_P]: 0.45 },
      4: { [Constants.Stats.HP_P]: 0.525 },
      5: { [Constants.Stats.HP_P]: 0.60 },
    },
    23051: {
      1: { [Constants.Stats.ATK_P]: 0.64 },
      2: { [Constants.Stats.ATK_P]: 0.80 },
      3: { [Constants.Stats.ATK_P]: 0.96 },
      4: { [Constants.Stats.ATK_P]: 1.12 },
      5: { [Constants.Stats.ATK_P]: 1.28 },
    },
    23041: {},
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
    21053: {},
    21054: {
      1: { [Constants.Stats.HP_P]: 0.16 },
      2: { [Constants.Stats.HP_P]: 0.20 },
      3: { [Constants.Stats.HP_P]: 0.24 },
      4: { [Constants.Stats.HP_P]: 0.28 },
      5: { [Constants.Stats.HP_P]: 0.32 },
    },
    21055: {
      1: { [Constants.Stats.OHB]: 0.12 },
      2: { [Constants.Stats.OHB]: 0.15 },
      3: { [Constants.Stats.OHB]: 0.18 },
      4: { [Constants.Stats.OHB]: 0.21 },
      5: { [Constants.Stats.OHB]: 0.24 },
    },
    21056: {},
    21057: {
      1: { [Constants.Stats.CD]: 0.24 },
      2: { [Constants.Stats.CD]: 0.28 },
      3: { [Constants.Stats.CD]: 0.32 },
      4: { [Constants.Stats.CD]: 0.36 },
      5: { [Constants.Stats.CD]: 0.40 },
    },
    21058: {
      1: { [Constants.Stats.CR]: 0.12 },
      2: { [Constants.Stats.CR]: 0.14 },
      3: { [Constants.Stats.CR]: 0.16 },
      4: { [Constants.Stats.CR]: 0.18 },
      5: { [Constants.Stats.CR]: 0.20 },
    },
    21060: {
      1: { [Constants.Stats.CR]: 0.12 },
      2: { [Constants.Stats.CR]: 0.14 },
      3: { [Constants.Stats.CR]: 0.16 },
      4: { [Constants.Stats.CR]: 0.18 },
      5: { [Constants.Stats.CR]: 0.20 },
    },
    21061: {},
    21062: {
      1: { [Constants.Stats.CD]: 0.24 },
      2: { [Constants.Stats.CD]: 0.28 },
      3: { [Constants.Stats.CD]: 0.32 },
      4: { [Constants.Stats.CD]: 0.36 },
      5: { [Constants.Stats.CD]: 0.40 },
    },
    23044: {
      1: { [Constants.Stats.SPD]: 12 },
      2: { [Constants.Stats.SPD]: 14 },
      3: { [Constants.Stats.SPD]: 16 },
      4: { [Constants.Stats.SPD]: 18 },
      5: { [Constants.Stats.SPD]: 20 },
    },
    23045: {
      1: { [Constants.Stats.CD]: 0.36 },
      2: { [Constants.Stats.CD]: 0.45 },
      3: { [Constants.Stats.CD]: 0.54 },
      4: { [Constants.Stats.CD]: 0.63 },
      5: { [Constants.Stats.CD]: 0.72 },
    },
    23046: {
      1: { [Constants.Stats.CR]: 0.16 },
      2: { [Constants.Stats.CR]: 0.20 },
      3: { [Constants.Stats.CR]: 0.24 },
      4: { [Constants.Stats.CR]: 0.28 },
      5: { [Constants.Stats.CR]: 0.32 },
    },
    23047: {
      1: { [Constants.Stats.EHR]: 0.40 },
      2: { [Constants.Stats.EHR]: 0.45 },
      3: { [Constants.Stats.EHR]: 0.50 },
      4: { [Constants.Stats.EHR]: 0.55 },
      5: { [Constants.Stats.EHR]: 0.60 },
    },
    23048: {
      1: { [Constants.Stats.ATK_P]: 0.64 },
      2: { [Constants.Stats.ATK_P]: 0.80 },
      3: { [Constants.Stats.ATK_P]: 0.96 },
      4: { [Constants.Stats.ATK_P]: 1.12 },
      5: { [Constants.Stats.ATK_P]: 1.28 },
    },
    22005: {
      1: { [Constants.Stats.ATK_P]: 0.16 },
      2: { [Constants.Stats.ATK_P]: 0.20 },
      3: { [Constants.Stats.ATK_P]: 0.24 },
      4: { [Constants.Stats.ATK_P]: 0.28 },
      5: { [Constants.Stats.ATK_P]: 0.32 },
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
    23034: 175,
    23035: 175,
    24000: 170,
    24001: 270,
    24002: 170,
    24003: 250,
    24004: 270,

    23037: 150,
    23036: 180,
    21052: 200,
    21051: 180,
    21050: 260,
    20022: 305,
    20021: 320,

    23038: 210,
    23039: 165,
    24005: 300,

    23043: 370,

    23044: 210,
    23045: 180,
    23046: 200,

    // TODO
    23047: 155,
    23048: 215,
    22005: 190,

    21053: 220,
    21054: 170,
    21055: 230,
    21056: 220,
    21057: 330,
    21058: 170,
    21060: 200,
    21061: 180,
    21062: 165,

    23049: 320,
    23051: 150,
  }
}

function getOverrideImageCenter(): Record<string, {
  x: number,
  y: number,
  z: number,
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
    '1005b1': { // KafkaB1
      x: 1000,
      y: 950,
      z: 1.1,
    },
    1006: { // Silver Wolf
      x: 1050,
      y: 950,
      z: 1,
    },
    '1006b1': { // Silver WolfB1
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
    '1205b1': { // BladeB1
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
    '1212b1': { // JingliuB1
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
    1405: { // Anaxa
      x: 1235,
      y: 1025,
      z: 0.90,
    },
    1407: { // Castorice
      x: 875,
      y: 950,
      z: 1.00,
    },
    1406: { // Cipher
      x: 1050,
      y: 900,
      z: 1,
    },
    1409: { // Hyacine
      x: 1215,
      y: 1025,
      z: 1.05,
    },
    1408: { // Phainon
      x: 935,
      y: 975,
      z: 1.05,
    },
    1014: { // Saber
      x: 900,
      y: 950,
      z: 1.05,
    },
    1015: { // Archer
      x: 1100,
      y: 1050,
      z: 1,
    },
    1410: { // Hysilens
      x: 765,
      y: 900,
      z: 1.20,
    },
    1412: { // Cerydra
      x: 1050,
      y: 950,
      z: 1.05,
    },
    1413: { // Evernight
      x: 985,
      y: 985,
      z: 1.075,
    },
    1414: { // Dan Heng • Permansor Terrae
      x: 975,
      y: 1024,
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
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.KnightOfPurityPalace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.BelobogOfTheArchitects]: 1,
      },
      presets: [
        PresetEffects.VALOROUS_SET,
        PresetEffects.WARRIOR_SET,
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
      },
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
          Stats.Wind_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.EagleOfTwilightLine]: MATCH_2P_WEIGHT,

        [Sets.ScholarLostInErudition]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          END_ULT,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.TheAshblazingGrandDuke]: 1,
        [Sets.FiresmithOfLavaForging]: T2_WEIGHT,

        [Sets.SigoniaTheUnclaimedDesolation]: 1,
        [Sets.DuranDynastyOfRunningWolves]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_FUA,
          END_SKILL,
          DEFAULT_FUA,
          START_SKILL,
          END_BREAK,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.WastelanderOfBanditryDesert]: 1,

        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.PanCosmicCommercialEnterprise]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: ACHERON,
            lightCone: ALONG_THE_PASSING_SHORE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: JIAOQIU,
            lightCone: THOSE_MANY_SPRINGS,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.PrisonerInDeepConfinement]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

        [Sets.RevelryByTheSea]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_DOT,
          DEFAULT_SKILL,
          END_DOT,
          DEFAULT_FUA,
          START_SKILL,
          END_DOT,
          DEFAULT_FUA,
          START_SKILL,
          END_DOT,
          DEFAULT_FUA,
        ],
        comboDot: 16,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.FirmamentFrontlineGlamoth,
          Sets.RevelryByTheSea,
        ],
        teammates: [
          {
            characterId: BLACK_SWAN,
            lightCone: REFORGED_REMEMBRANCE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.PanCosmicCommercialEnterprise]: 1,
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
      },
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
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,
        [Sets.LongevousDisciple]: T2_WEIGHT,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1009: { // Asta
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0.5,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        [Sets.EagleOfTwilightLine]: 1,
        [Sets.WatchmakerMasterOfDreamMachinations]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.TheAshblazingGrandDuke]: 1,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.HunterOfGlacialForest]: T2_WEIGHT,

        [Sets.SigoniaTheUnclaimedDesolation]: 1,
        [Sets.DuranDynastyOfRunningWolves]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.RutilantArena]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_FUA,
          END_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
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
            characterId: THE_HERTA,
            lightCone: INTO_THE_UNREACHABLE_VEIL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
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
          Stats.Quantum_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.ScholarLostInErudition]: 1,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          DEFAULT_SKILL,
          END_SKILL,
        ],
        comboDot: 0,
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
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: SPARKLE,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LUOCHA,
            lightCone: QUID_PRO_QUO,
            characterEidolon: 0,
            lightConeSuperimposition: 5,
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.CR,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: THE_HERTA,
            lightCone: INTO_THE_UNREACHABLE_VEIL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.KnightOfPurityPalace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.BelobogOfTheArchitects]: 1,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.LongevousDisciple]: MATCH_2P_WEIGHT,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.PasserbyOfWanderingCloud]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.GiantTreeOfRaptBrooding]: 1,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1106: { // Pela
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
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
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.TheAshblazingGrandDuke]: MATCH_2P_WEIGHT,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: 1,
        [Sets.LongevousDisciple]: T2_WEIGHT,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          DEFAULT_FUA,
          DEFAULT_FUA,
          WHOLE_SKILL,
          DEFAULT_FUA,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
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
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.EagleOfTwilightLine]: MATCH_2P_WEIGHT,
        [Sets.PrisonerInDeepConfinement]: 1,

        [Sets.RevelryByTheSea]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.PanCosmicCommercialEnterprise]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          DEFAULT_DOT,
          WHOLE_SKILL,
          DEFAULT_DOT,
          WHOLE_SKILL,
          DEFAULT_DOT,
        ],
        comboDot: 60,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RevelryByTheSea,
          Sets.FirmamentFrontlineGlamoth,
        ],
        teammates: [
          {
            characterId: KAFKA_B1,
            lightCone: PATIENCE_IS_ALL_YOU_NEED,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
      },
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
          Stats.Fire_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.FiresmithOfLavaForging]: T2_WEIGHT,

        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: SPARKLE,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.PasserbyOfWanderingCloud]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
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
        [Stats.BE]: 1,
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
      sets: {
        [Sets.PrisonerInDeepConfinement]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: 1,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,

        [Sets.RevelryByTheSea]: 1,
        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.PanCosmicCommercialEnterprise]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_BREAK,
          DEFAULT_DOT,
          START_BASIC,
          END_DOT,
          DEFAULT_DOT,
          START_BASIC,
          END_DOT,
          DEFAULT_DOT,
        ],
        comboDot: 5,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
          RELICS_2P_BREAK_EFFECT_SPEED,
        ],
        ornamentSets: [
          Sets.TaliaKingdomOfBanditry,
          Sets.FirmamentFrontlineGlamoth,
          Sets.RevelryByTheSea,
        ],
        teammates: [
          {
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
      },
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
          Stats.Fire_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.FiresmithOfLavaForging]: MATCH_2P_WEIGHT,

        [Sets.TheAshblazingGrandDuke]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.DuranDynastyOfRunningWolves]: 1,
        [Sets.TheWondrousBananAmusementPark]: 1,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_BASIC,
          DEFAULT_FUA,
          DEFAULT_FUA,
          WHOLE_SKILL,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: FEIXIAO,
            lightCone: I_VENTURE_FORTH_TO_HUNT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
      },
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
          Stats.Quantum_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.ScholarLostInErudition]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          DEFAULT_ULT,
          END_BASIC,
          DEFAULT_FUA,
          START_SKILL,
          END_BASIC,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: SPARKLE,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.ATK_P,
          Stats.HP_P,
          Stats.DEF_P,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.MusketeerOfWildWheat]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1203: { // Luocha
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.OHB,
          Stats.HP_P,
          Stats.DEF_P,
          Stats.ATK_P,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PasserbyOfWanderingCloud]: 1,
        [Sets.MusketeerOfWildWheat]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.WASTELANDER_SET,
        PresetEffects.WARRIOR_SET,
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
      },
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
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.TheAshblazingGrandDuke]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

        [Sets.TheWondrousBananAmusementPark]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
          START_ULT,
          END_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
          WHOLE_SKILL,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
      sets: {
        [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
        [Sets.EagleOfTwilightLine]: MATCH_2P_WEIGHT,
        [Sets.LongevousDisciple]: 1,
        [Sets.MusketeerOfWildWheat]: T2_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          DEFAULT_ULT,
          END_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          WHOLE_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.LongevousDisciple, Sets.LongevousDisciple],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          Sets.RutilantArena,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: CASTORICE,
            lightCone: MAKE_FAREWELLS_MORE_BEAUTIFUL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
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
      },
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
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.WatchmakerMasterOfDreamMachinations]: MATCH_2P_WEIGHT,
        [Sets.ChampionOfStreetwiseBoxing]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          DEFAULT_ULT,
          END_BREAK,
          WHOLE_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.EHR,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
        [Stats.DEF]: 0.75,
        [Stats.DEF_P]: 0.75,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.5,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.LongevousDisciple]: 1,
        [Sets.GuardOfWutheringSnow]: MATCH_2P_WEIGHT,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.HunterOfGlacialForest]: 1,

        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_FUA,
          START_SKILL,
          END_FUA,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1210: { // Guinaifen
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 1,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.FiresmithOfLavaForging]: MATCH_2P_WEIGHT,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.PrisonerInDeepConfinement]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.FleetOfTheAgeless]: 1,
      },
      presets: [
        PresetEffects.PRISONER_SET,
      ],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.FUA],
    },
    1211: { // Bailu
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        [Sets.LongevousDisciple]: MATCH_2P_WEIGHT,
        [Sets.SacerdosRelivedOrdeal]: MATCH_2P_WEIGHT,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.PasserbyOfWanderingCloud]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.GiantTreeOfRaptBrooding]: 1,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.HunterOfGlacialForest]: T2_WEIGHT,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          DEFAULT_ULT,
          WHOLE_SKILL,
          WHOLE_SKILL,
          START_SKILL,
          END_ULT,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
      },
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.WastelanderOfBanditryDesert]: 1,
        [Sets.MusketeerOfWildWheat]: 1,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_BASIC,
          WHOLE_BASIC,
          WHOLE_BASIC,
        ],
        comboDot: 0,
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
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LUOCHA,
            lightCone: QUID_PRO_QUO,
            characterEidolon: 0,
            lightConeSuperimposition: 5,
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
      },
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
          Stats.Quantum_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.WatchmakerMasterOfDreamMachinations]: MATCH_2P_WEIGHT,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.ThiefOfShootingMeteor]: T2_WEIGHT,

        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_BREAK,
          DEFAULT_FUA,
          END_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1215: { // Hanya
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [],
      sortOption: SortOption.SPD,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1217: { // Huohuo
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.PasserbyOfWanderingCloud]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    1218: { // Jiaoqiu
      stats: {
        [Constants.Stats.ATK]: 0.5,
        [Constants.Stats.ATK_P]: 0.5,
        [Constants.Stats.DEF]: 0.25,
        [Constants.Stats.DEF_P]: 0.25,
        [Constants.Stats.HP]: 0.25,
        [Constants.Stats.HP_P]: 0.25,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 1,
        [Constants.Stats.RES]: 0.25,
        [Constants.Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.FiresmithOfLavaForging]: MATCH_2P_WEIGHT,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.EagleOfTwilightLine]: MATCH_2P_WEIGHT,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.TheWindSoaringValorous]: 1,
        [Sets.TheAshblazingGrandDuke]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_FUA,
          DEFAULT_FUA,
          START_ULT,
          DEFAULT_SKILL,
          END_FUA,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: CIPHER,
            lightCone: LIES_DANCE_ON_THE_BREEZE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Stats.EHR,
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
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.ChampionOfStreetwiseBoxing]: MATCH_2P_WEIGHT,
        [Sets.TheWindSoaringValorous]: 1,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.TheAshblazingGrandDuke]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          DEFAULT_FUA,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TINGYUN,
            lightCone: MEMORIES_OF_THE_PAST,
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1222: { // Lingsha
      stats: {
        [Constants.Stats.ATK]: 1.00,
        [Constants.Stats.ATK_P]: 1.00,
        [Constants.Stats.DEF]: 0.25,
        [Constants.Stats.DEF_P]: 0.25,
        [Constants.Stats.HP]: 0.25,
        [Constants.Stats.HP_P]: 0.25,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.50,
        [Constants.Stats.BE]: 1,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Constants.Stats.OHB,
          Constants.Stats.DEF_P,
          Constants.Stats.HP_P,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.PasserbyOfWanderingCloud]: MATCH_2P_WEIGHT,
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.GiantTreeOfRaptBrooding]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
        [Sets.TaliaKingdomOfBanditry]: 1,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.fnAshblazingSet(6),
        PresetEffects.VALOROUS_SET,
        PresetEffects.WARRIOR_SET,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Stats.EHR,
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
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.TheAshblazingGrandDuke]: 1,

        [Sets.DuranDynastyOfRunningWolves]: 1,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.InertSalsotto]: T2_WEIGHT,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          WHOLE_SKILL,
          DEFAULT_ULT,
          DEFAULT_FUA,
          DEFAULT_FUA,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
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
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: FEIXIAO,
            lightCone: I_VENTURE_FORTH_TO_HUNT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.MusketeerOfWildWheat]: 1,
        [Sets.WastelanderOfBanditryDesert]: 1,

        [Sets.RutilantArena]: 1,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_BREAK,
          END_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
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
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: FEIXIAO,
            lightCone: I_VENTURE_FORTH_TO_HUNT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        [Sets.ForgeOfTheKalpagniLantern]: 1,
        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.SprightlyVonwacq]: 1,
        [Sets.LushakaTheSunkenSeas]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_BASIC,
          END_BREAK,
          START_BASIC,
          END_BREAK,
          START_BASIC,
          END_BREAK,
        ],
        comboDot: 0,
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
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: FIREFLY,
            lightCone: WHEREABOUTS_SHOULD_DREAMS_REST,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.50,
        [Stats.BE]: 1,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.GiantTreeOfRaptBrooding]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
        [Sets.TaliaKingdomOfBanditry]: 1,
      },
      presets: [
        PresetEffects.WARRIOR_SET,
      ],
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
      },
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
          Stats.Physical_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        [Sets.ScholarLostInErudition]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: T2_WEIGHT,

        [Sets.InertSalsotto]: 1,
        [Sets.SigoniaTheUnclaimedDesolation]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          START_ULT,
          DEFAULT_ULT,
          END_SKILL,
          START_ULT,
          END_SKILL,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
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
            characterId: THE_HERTA,
            lightCone: INTO_THE_UNREACHABLE_VEIL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 1,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.WatchmakerMasterOfDreamMachinations]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
        [Sets.WastelanderOfBanditryDesert]: MATCH_2P_WEIGHT,
        [Sets.KnightOfPurityPalace]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.DuranDynastyOfRunningWolves]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_FUA,
          END_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
        ],
        comboDot: 0,
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
            characterId: TOPAZ_NUMBY,
            lightCone: WORRISOME_BLISSFUL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: FEIXIAO,
            lightCone: I_VENTURE_FORTH_TO_HUNT,
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
      },
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.WastelanderOfBanditryDesert]: 1,
        [Sets.TheAshblazingGrandDuke]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.FirmamentFrontlineGlamoth]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_FUA,
          DEFAULT_FUA,
          START_SKILL,
          END_FUA,
          DEFAULT_FUA,
          START_SKILL,
          END_FUA,
        ],
        comboDot: 0,
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
            characterId: TOPAZ_NUMBY,
            lightCone: WORRISOME_BLISSFUL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      sets: {
        [Sets.PrisonerInDeepConfinement]: 1,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.MusketeerOfWildWheat]: MATCH_2P_WEIGHT,
        [Sets.EagleOfTwilightLine]: MATCH_2P_WEIGHT,

        [Sets.RevelryByTheSea]: 1,
        [Sets.PanCosmicCommercialEnterprise]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          DEFAULT_DOT,
          WHOLE_BASIC,
          DEFAULT_DOT,
          WHOLE_SKILL,
          DEFAULT_DOT,
          WHOLE_BASIC,
          DEFAULT_DOT,
        ],
        comboDot: 8,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RevelryByTheSea,
          Sets.FirmamentFrontlineGlamoth,
          Sets.PanCosmicCommercialEnterprise,
        ],
        teammates: [
          {
            characterId: KAFKA_B1,
            lightCone: PATIENCE_IS_ALL_YOU_NEED,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.SpaceSealingStation]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
      },
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
      simulation: {
        parts: {
          [Parts.Body]: [
            Stats.ATK_P,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: JIAOQIU,
            lightCone: THOSE_MANY_SPRINGS,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: CIPHER,
            lightCone: LIES_DANCE_ON_THE_BREEZE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1309: { // Robin
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
      },
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
          Stats.Physical_DMG,
        ],
        [Constants.Parts.LinkRope]: [
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.MusketeerOfWildWheat]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.ATK_P,
          Stats.EHR,
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
      sets: {
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: T2_WEIGHT,

        [Sets.ForgeOfTheKalpagniLantern]: 1,
        [Sets.TaliaKingdomOfBanditry]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_BREAK,
          WHOLE_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.ForgeOfTheKalpagniLantern,
        ],
        teammates: [
          {
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.HunterOfGlacialForest]: T2_WEIGHT,

        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: SPARKLE,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.TheAshblazingGrandDuke]: 1,
        [Sets.TheWindSoaringValorous]: 1,
        [Sets.ScholarLostInErudition]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          WHOLE_SKILL,
          DEFAULT_ULT,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
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
            characterId: THE_HERTA,
            lightCone: INTO_THE_UNREACHABLE_VEIL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          DEFAULT_ULT,
          DEFAULT_BASIC,
          END_BREAK,
          WHOLE_BASIC,
          START_BASIC,
          END_BREAK,
        ],
        comboDot: 0,
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
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
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
      sets: {
        [Sets.IronCavalryAgainstTheScourge]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_BASIC,
          WHOLE_BASIC,
          START_BASIC,
          END_BREAK,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: FUGUE,
            lightCone: LONG_ROAD_LEADS_HOME,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
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
      },
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
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: T2_WEIGHT,
        [Sets.PioneerDiverOfDeadWaters]: T2_WEIGHT,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
      },
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
          Stats.Physical_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.BE,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: T2_WEIGHT,
        [Sets.PioneerDiverOfDeadWaters]: T2_WEIGHT,

        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.SpaceSealingStation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.5,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.GuardOfWutheringSnow]: MATCH_2P_WEIGHT,
        [Sets.KnightOfPurityPalace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0.75,
        [Stats.RES]: 0.50,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.GuardOfWutheringSnow]: MATCH_2P_WEIGHT,
        [Sets.KnightOfPurityPalace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
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
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 1,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.WatchmakerMasterOfDreamMachinations]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
      },
      presets: [],
      sortOption: SortOption.BE,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    8006: { // Imaginary Trailblazer F
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 1,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
        [Sets.WatchmakerMasterOfDreamMachinations]: 1,
        [Sets.ThiefOfShootingMeteor]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.TaliaKingdomOfBanditry]: 1,
        [Sets.ForgeOfTheKalpagniLantern]: 1,
      },
      presets: [],
      sortOption: SortOption.BE,
      hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
    },
    8007: { // Remembrance Trailblazer M
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.OHB,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.HeroOfTriumphantSong]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.CD,
      hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
      addedColumns: [SortOption.MEMO_SKILL],
    },
    8008: { // Remembrance Trailblazer F
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.OHB,
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
      sets: {
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.HeroOfTriumphantSong]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.WARRIOR_SET,
      ],
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.HunterOfGlacialForest]: T2_WEIGHT,

        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SigoniaTheUnclaimedDesolation]: 1,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          END_ULT,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
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
            characterId: JADE,
            lightCone: YET_HOPE_IS_PRICELESS,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LINGSHA,
            lightCone: SCENT_ALONE_STAYS_TRUE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1402: { // Aglaea
      stats: {
        [Stats.ATK]: 0.5,
        [Stats.ATK_P]: 0.5,
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
      },
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
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.BandOfSizzlingThunder]: MATCH_2P_WEIGHT,
        [Sets.HeroOfTriumphantSong]: 1,
        [Sets.ScholarLostInErudition]: 1,

        [Sets.TheWondrousBananAmusementPark]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.BASIC,
      hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
      addedColumns: [SortOption.MEMO_SKILL, SortOption.MEMO_TALENT],
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_BASIC,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          WHOLE_BASIC,
          WHOLE_BASIC,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          WHOLE_BASIC,
        ],
        comboDot: 0,
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
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
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
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 1,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.GeniusOfBrilliantStars]: MATCH_2P_WEIGHT,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.LongevousDisciple]: 1,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.EagleOfTwilightLine]: 1,

        ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.BoneCollectionsSereneDemesne]: 1,
      },
      presets: [
        PresetEffects.VALOROUS_SET,
      ],
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
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          END_ULT,
          DEFAULT_FUA,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          DEFAULT_ULT,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.LongevousDisciple, Sets.LongevousDisciple],
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
            characterId: CASTORICE,
            lightCone: MAKE_FAREWELLS_MORE_BEAUTIFUL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: STELLE_REMEMBRANCE,
            lightCone: MEMORYS_CURTAIN_NEVER_FALLS,
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
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
      sets: {
        [Sets.ScholarLostInErudition]: 1,
        [Sets.LongevousDisciple]: T2_WEIGHT,
        [Sets.WastelanderOfBanditryDesert]: MATCH_2P_WEIGHT,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.RutilantArena]: 1,
      },
      presets: [
        PresetEffects.WASTELANDER_SET,
      ],
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
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1405: { // Anaxa
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
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
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.EagleOfTwilightLine]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.ScholarLostInErudition]: 1,

        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.RutilantArena]: 1,
      },
      presets: [
        PresetEffects.fnPioneerSet(4),
        PresetEffects.GENIUS_SET,
      ],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          END_SKILL,
          START_SKILL,
          END_SKILL,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
        deprioritizeBuffs: false,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          Sets.FirmamentFrontlineGlamoth,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          Sets.SpaceSealingStation,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1407: { // Castorice
      stats: {
        [Stats.ATK]: 0,
        [Stats.ATK_P]: 0,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 1,
        [Stats.HP_P]: 1,
        [Stats.SPD]: 0,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.HP_P,
        ],
        [Parts.Feet]: [
          Stats.HP_P,
        ],
        [Parts.PlanarSphere]: [
          Stats.HP_P,
          Stats.Quantum_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
        ],
      },
      sets: {
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.ScholarLostInErudition]: T2_WEIGHT,
        [Sets.LongevousDisciple]: MATCH_2P_WEIGHT,
        [Sets.GeniusOfBrilliantStars]: MATCH_2P_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.TheWondrousBananAmusementPark]: T2_WEIGHT,
        [Sets.FleetOfTheAgeless]: T2_WEIGHT,
        [Sets.RutilantArena]: T2_WEIGHT,
        [Sets.InertSalsotto]: T2_WEIGHT,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.MEMO_SKILL,
      addedColumns: [SortOption.MEMO_SKILL, SortOption.MEMO_TALENT],
      hiddenColumns: [SortOption.FUA, SortOption.DOT, SortOption.ULT],
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
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          WHOLE_SKILL,
          WHOLE_SKILL,
          DEFAULT_ULT,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_TALENT,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: STELLE_REMEMBRANCE,
            lightCone: MEMORYS_CURTAIN_NEVER_FALLS,
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1409: { // Hyacine
      stats: {
        [Constants.Stats.ATK]: 0,
        [Constants.Stats.ATK_P]: 0,
        [Constants.Stats.DEF]: 0,
        [Constants.Stats.DEF_P]: 0,
        [Constants.Stats.HP]: 1,
        [Constants.Stats.HP_P]: 1,
        [Constants.Stats.SPD]: 1,
        [Constants.Stats.CR]: 0,
        [Constants.Stats.CD]: 0.50,
        [Constants.Stats.EHR]: 0,
        [Constants.Stats.RES]: 0.50,
        [Constants.Stats.BE]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.OHB,
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.Feet]: [
          Constants.Stats.SPD,
        ],
        [Constants.Parts.PlanarSphere]: [
          Constants.Stats.HP_P,
        ],
        [Constants.Parts.LinkRope]: [
          Constants.Stats.ERR,
          Constants.Stats.HP_P,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        [Sets.WarriorGoddessOfSunAndThunder]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.PasserbyOfWanderingCloud]: T2_WEIGHT,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        [Sets.TheWondrousBananAmusementPark]: 1,
        [Sets.GiantTreeOfRaptBrooding]: 1,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.WARRIOR_SET,
      ],
      sortOption: SortOption.HEAL,
      addedColumns: [SortOption.OHB, SortOption.HEAL],
      hiddenColumns: [SortOption.DOT],
    },
    1406: { // Cipher
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
        [Constants.Stats.EHR]: 0.50,
        [Constants.Stats.RES]: 0,
        [Constants.Stats.BE]: 0,
      },
      parts: {
        [Constants.Parts.Body]: [
          Constants.Stats.CR,
          Constants.Stats.CD,
          Constants.Stats.EHR,
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
          Constants.Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.fnAshblazingSet(4),
        PresetEffects.fnPioneerSet(4),
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
            Stats.Quantum_DMG,
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
          Stats.EHR,
        ],
        breakpoints: {
          [Stats.EHR]: 0.19,
        },
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          DEFAULT_ULT,
          WHOLE_SKILL,
          DEFAULT_FUA,
          WHOLE_SKILL,
          DEFAULT_FUA,
          WHOLE_BASIC,
          DEFAULT_FUA,
        ],
        deprioritizeBuffs: true,
        comboDot: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.InertSalsotto,
          Sets.DuranDynastyOfRunningWolves,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_FUA,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
        ],
        teammates: [
          {
            characterId: FEIXIAO,
            lightCone: I_VENTURE_FORTH_TO_HUNT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1408: { // Phainon
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
          Stats.EHR,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.WavestriderCaptain]: 1,
        [Sets.ScholarLostInErudition]: T2_WEIGHT,

        [Sets.ArcadiaOfWovenDreams]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.FirmamentFrontlineGlamoth]: T2_WEIGHT,
        [Sets.SpaceSealingStation]: T2_WEIGHT,
      },
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.DOT],
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          DEFAULT_BASIC,
          DEFAULT_SKILL,
          DEFAULT_BASIC,
          DEFAULT_BASIC,
          DEFAULT_SKILL,
          DEFAULT_BASIC,
          END_ULT,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: ROBIN,
            lightCone: FLOWING_NIGHTGLOW,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1014: { // Saber
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
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
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
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.WavestriderCaptain]: 1,
        [Sets.ScholarLostInErudition]: 1,

        [Sets.InertSalsotto]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.SpaceSealingStation]: T2_WEIGHT,
      },
      presets: [],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.DOT],
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_BASIC,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.InertSalsotto,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: TINGYUN,
            lightCone: DANCE_DANCE_DANCE,
            characterEidolon: 6,
            lightConeSuperimposition: 5,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1015: { // Archer
      stats: {
        [Stats.ATK]: 0.75,
        [Stats.ATK_P]: 0.75,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.HP]: 0,
        [Stats.HP_P]: 0,
        [Stats.SPD]: 0,
        [Stats.CR]: 1,
        [Stats.CD]: 1,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CR,
          Stats.CD,
          Stats.ATK_P,
          Stats.EHR,
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
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.ScholarLostInErudition]: 1,

        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: 1,
        [Sets.SpaceSealingStation]: T2_WEIGHT,
      },
      presets: [
        PresetEffects.fnPioneerSet(4),
      ],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.DOT],
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
          ],
        },
        substats: [
          Stats.CD,
          Stats.CR,
          Stats.ATK_P,
          Stats.ATK,
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_SKILL,
          DEFAULT_SKILL,
          END_SKILL,
          DEFAULT_FUA,
          START_SKILL,
          DEFAULT_SKILL,
          END_SKILL,
          DEFAULT_FUA,
        ],
        comboDot: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: SPARKLE,
            lightCone: EARTHLY_ESCAPADE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: CIPHER,
            lightCone: LIES_DANCE_ON_THE_BREEZE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: LUOCHA,
            lightCone: MULTIPLICATION,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    '1005b1': { // KafkaB1
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
          Stats.Lightning_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PrisonerInDeepConfinement]: 1,
        [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

        [Sets.RevelryByTheSea]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
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
            Stats.EHR,
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
          [Stats.EHR]: 0.75,
        },
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_DOT,
          DEFAULT_SKILL,
          END_DOT,
          DEFAULT_FUA,
          START_SKILL,
          END_DOT,
          DEFAULT_FUA,
          START_SKILL,
          END_DOT,
          DEFAULT_FUA,
        ],
        comboDot: 16,
        errRopeEidolon: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          RELICS_2P_SPEED,
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RevelryByTheSea,
          Sets.FirmamentFrontlineGlamoth,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
          ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
        ],
        teammates: [
          {
            characterId: BLACK_SWAN,
            lightCone: REFORGED_REMEMBRANCE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    '1006b1': { // Silver Wolf
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
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
      sets: {
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.PioneerDiverOfDeadWaters]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
        ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN_WEIGHTS,
        [Sets.InertSalsotto]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.PanCosmicCommercialEnterprise]: T2_WEIGHT,
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
            Stats.ATK_P,
            Stats.EHR,
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
          Stats.ATK_P,
          Stats.CR,
          Stats.CD,
          Stats.ATK,
          Stats.EHR,
        ],
        breakpoints: {
          [Stats.EHR]: 0.50,
        },
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          WHOLE_BASIC,
        ],
        deprioritizeBuffs: true,
        comboDot: 0,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          RELICS_2P_SPEED,
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.InertSalsotto,
          Sets.FirmamentFrontlineGlamoth,
          Sets.IzumoGenseiAndTakamaDivineRealm,
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
          ...SPREAD_ORNAMENTS_2P_SUPPORT,
          ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
        ],
        teammates: [
          {
            characterId: ACHERON,
            lightCone: ALONG_THE_PASSING_SHORE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: CIPHER,
            lightCone: LIES_DANCE_ON_THE_BREEZE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: AVENTURINE,
            lightCone: INHERENTLY_UNJUST_DESTINY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    '1205b1': { // BladeB1
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
          Stats.Wind_DMG,
          Stats.HP_P,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
        ],
      },
      sets: {
        [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
        [Sets.LongevousDisciple]: 1,
        [Sets.EagleOfTwilightLine]: 1,
        [Sets.MusketeerOfWildWheat]: T2_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: 1,
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
            Stats.HP_P,
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
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_SKILL,
          DEFAULT_ULT,
          END_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
          WHOLE_BASIC,
          DEFAULT_FUA,
          WHOLE_BASIC,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.LongevousDisciple, Sets.LongevousDisciple],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          Sets.InertSalsotto,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: SUNDAY,
            lightCone: A_GROUNDED_ASCENT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    '1212b1': { // JingliuB1
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
        [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
        [Sets.ScholarLostInErudition]: 1,
        [Sets.GeniusOfBrilliantStars]: 1,
        [Sets.HunterOfGlacialForest]: T2_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.RutilantArena]: 1,
        [Sets.InertSalsotto]: T2_WEIGHT,
      },
      presets: [],
      sortOption: SortOption.SKILL,
      hiddenColumns: [SortOption.FUA, SortOption.DOT],
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
            Stats.Ice_DMG,
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
        ],
        errRopeEidolon: 0,
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          DEFAULT_ULT,
          WHOLE_SKILL,
          WHOLE_SKILL,
          START_SKILL,
          END_ULT,
          WHOLE_SKILL,
          WHOLE_SKILL,
        ],
        comboDot: 0,
        relicSets: [
          [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
          [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          Sets.RutilantArena,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: BRONYA,
            lightCone: BUT_THE_BATTLE_ISNT_OVER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: RUAN_MEI,
            lightCone: PAST_SELF_IN_MIRROR,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1410: { // Hysilens
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
          Stats.Physical_DMG,
          Stats.ATK_P,
        ],
        [Parts.LinkRope]: [
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.PrisonerInDeepConfinement]: 1,
        [Sets.ChampionOfStreetwiseBoxing]: T2_WEIGHT, // TODO is this real?

        [Sets.RevelryByTheSea]: 1,
        [Sets.FirmamentFrontlineGlamoth]: 1,
        [Sets.SpaceSealingStation]: 1,
      },
      presets: [
        PresetEffects.PRISONER_SET,
        PresetEffects.fnPioneerSet(4),
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
            Stats.Physical_DMG,
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
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          DEFAULT_DOT,
          END_SKILL,
          DEFAULT_DOT,
          WHOLE_SKILL,
          DEFAULT_DOT,
          WHOLE_BASIC,
          DEFAULT_DOT,
        ],
        comboDot: 5,
        errRopeEidolon: 0,
        relicSets: [
          [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.RevelryByTheSea,
          Sets.PanCosmicCommercialEnterprise,
        ],
        teammates: [
          {
            characterId: KAFKA_B1,
            lightCone: PATIENCE_IS_ALL_YOU_NEED,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: BLACK_SWAN,
            lightCone: REFORGED_REMEMBRANCE,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HUOHUO,
            lightCone: NIGHT_OF_FRIGHT,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1412: { // Cerydra
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0.75,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
      },
      parts: {
        [Parts.Body]: [
          Stats.CD,
          Stats.ATK_P,
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
          Stats.ATK_P,
          Stats.ERR,
        ],
      },
      sets: {
        ...weights([...RELICS_2P_SPEED, ...RELICS_2P_ATK], 1),
        [Sets.SacerdosRelivedOrdeal]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [],
      sortOption: SortOption.ULT,
      hiddenColumns: [SortOption.DOT],
    },
    1413: { // Evernight
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
      },
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
          Stats.Ice_DMG,
        ],
        [Parts.LinkRope]: [
          Stats.HP_P,
        ],
      },
      sets: {
        [Sets.WorldRemakingDeliverer]: 1,
        [Sets.PoetOfMourningCollapse]: 1,
        [Sets.ScholarLostInErudition]: T2_WEIGHT,
        [Sets.LongevousDisciple]: MATCH_2P_WEIGHT,
        [Sets.GeniusOfBrilliantStars]: MATCH_2P_WEIGHT,

        [Sets.BoneCollectionsSereneDemesne]: 1,
        [Sets.ArcadiaOfWovenDreams]: 1,
        [Sets.TheWondrousBananAmusementPark]: T2_WEIGHT,
        [Sets.RutilantArena]: T2_WEIGHT,
        [Sets.InertSalsotto]: T2_WEIGHT,
      },
      presets: [
        PresetEffects.BANANA_SET,
      ],
      sortOption: SortOption.MEMO_SKILL,
      addedColumns: [SortOption.MEMO_SKILL, SortOption.MEMO_TALENT],
      hiddenColumns: [SortOption.FUA, SortOption.DOT, SortOption.SKILL, SortOption.MEMO_TALENT],
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
            Stats.Ice_DMG,
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
        ],
        comboTurnAbilities: [
          NULL_TURN_ABILITY_NAME,
          START_ULT,
          END_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
          WHOLE_SKILL,
          DEFAULT_MEMO_SKILL,
          DEFAULT_MEMO_SKILL,
        ],
        comboDot: 0,
        deprioritizeBuffs: true,
        relicSets: [
          [Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer],
          [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
          ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
        ],
        ornamentSets: [
          Sets.BoneCollectionsSereneDemesne,
          Sets.ArcadiaOfWovenDreams,
          ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
        ],
        teammates: [
          {
            characterId: TRIBBIE,
            lightCone: IF_TIME_WERE_A_FLOWER,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: CASTORICE,
            lightCone: MAKE_FAREWELLS_MORE_BEAUTIFUL,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
          {
            characterId: HYACINE,
            lightCone: LONG_MAY_RAINBOWS_ADORN_THE_SKY,
            characterEidolon: 0,
            lightConeSuperimposition: 1,
          },
        ],
      },
    },
    1414: { // Dan Heng • Permansor Terrae
      stats: {
        [Stats.ATK]: 1,
        [Stats.ATK_P]: 1,
        [Stats.DEF]: 0.25,
        [Stats.DEF_P]: 0.25,
        [Stats.HP]: 0.25,
        [Stats.HP_P]: 0.25,
        [Stats.SPD]: 1,
        [Stats.CR]: 0,
        [Stats.CD]: 0,
        [Stats.EHR]: 0,
        [Stats.RES]: 0.25,
        [Stats.BE]: 0,
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
        ],
        [Parts.LinkRope]: [
          Stats.ERR,
          Stats.ATK_P,
        ],
      },
      sets: {
        [Sets.SelfEnshroudedRecluse]: 1,
        ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
        ...SPREAD_RELICS_2P_ATK_WEIGHTS,
        [Sets.SacerdosRelivedOrdeal]: 1,
        [Sets.MessengerTraversingHackerspace]: 1,
        [Sets.MusketeerOfWildWheat]: 1,

        ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
      },
      presets: [
        PresetEffects.BANANA_SET,
        PresetEffects.fnAshblazingSet(8),
        PresetEffects.VALOROUS_SET,
      ],
      sortOption: SortOption.ATK,
      addedColumns: [SortOption.SHIELD],
      hiddenColumns: [SortOption.DOT, SortOption.SKILL],
    },
  }
}
