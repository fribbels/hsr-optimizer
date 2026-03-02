import gameData from 'data/game_data.json' with { type: 'json' }
import relicMainAffixes from 'data/relic_main_affixes.json' with { type: 'json' }
import relicSubAffixes from 'data/relic_sub_affixes.json' with { type: 'json' }
import { getAllCharacterConfigs } from 'lib/conditionals/resolver/characterConfigRegistry'
import {
  Parts,
  PartsMainStats,
  Stats,
  StatsValues,
} from 'lib/constants/constants'
import DB from 'lib/state/db'
import {
  DBMetadata,
  DBMetadataCharacter,
  DBMetadataLightCone,
  DBMetadataSets,
} from 'types/metadata'

const characters: Record<string, DBMetadataCharacter> = gameData.characters as unknown as Record<string, DBMetadataCharacter>
const lightCones: Record<string, DBMetadataLightCone> = gameData.lightCones as unknown as Record<string, DBMetadataLightCone>

const ALL_ELEMENT_DMG_STATS = [
  Stats.Physical_DMG,
  Stats.Fire_DMG,
  Stats.Ice_DMG,
  Stats.Lightning_DMG,
  Stats.Wind_DMG,
  Stats.Quantum_DMG,
  Stats.Imaginary_DMG,
]

// Raw stat property names from game_data.json LC superimposition config.
// When new stat keys appear in game data, add them here.
export const LcConfigStatProperty = {
  HPAddedRatio: 'HPAddedRatio',
  AttackAddedRatio: 'AttackAddedRatio',
  DefenceAddedRatio: 'DefenceAddedRatio',
  CriticalDamageBase: 'CriticalDamageBase',
  CriticalChanceBase: 'CriticalChanceBase',
  StatusProbabilityBase: 'StatusProbabilityBase',
  StatusResistanceBase: 'StatusResistanceBase',
  BreakDamageAddedRatioBase: 'BreakDamageAddedRatioBase',
  SPRatioBase: 'SPRatioBase',
  HealRatioBase: 'HealRatioBase',
  SpeedAddedRatio: 'SpeedAddedRatio',
  BaseSpeed: 'BaseSpeed',
  ElationDamageAddedRatioBase: 'ElationDamageAddedRatioBase',
  AllDamageTypeAddedRatio: 'AllDamageTypeAddedRatio',
  HealTakenRatio: 'HealTakenRatio',
} as const

type LcConfigStatPropertyValue = typeof LcConfigStatProperty[keyof typeof LcConfigStatProperty]

// Stats that have a 1-to-1 mapping to StatsValues (excludes special cases)
type LcConfigConvertibleStat = Exclude<
  LcConfigStatPropertyValue,
  | typeof LcConfigStatProperty.AllDamageTypeAddedRatio
  | typeof LcConfigStatProperty.HealTakenRatio
>

// LC-only stat conversion, independent from the relic statConversion in characterConverter.
// Kept separate to avoid collisions when relicRollFixer flips the relic map for reverse lookups.
const lcConfigStatConversion: Record<LcConfigConvertibleStat, StatsValues> = {
  HPAddedRatio: Stats.HP_P,
  AttackAddedRatio: Stats.ATK_P,
  DefenceAddedRatio: Stats.DEF_P,
  SpeedAddedRatio: Stats.SPD_P,
  BaseSpeed: Stats.SPD,
  CriticalDamageBase: Stats.CD,
  CriticalChanceBase: Stats.CR,
  StatusProbabilityBase: Stats.EHR,
  StatusResistanceBase: Stats.RES,
  BreakDamageAddedRatioBase: Stats.BE,
  SPRatioBase: Stats.ERR,
  HealRatioBase: Stats.OHB,
  ElationDamageAddedRatioBase: Stats.Elation,
}

export const Metadata = {
  initialize: () => {
    const dbMetadataCharacters: Record<string, DBMetadataCharacter> = characters

    for (const lightCone of Object.values(lightCones)) {
      const converted: DBMetadataSuperimpositions = {}
      for (const [level, stats] of Object.entries(lightCone.superimpositions)) {
        const convertedStats: Partial<Record<StatsValues, number>> = {}
        for (const [stat, value] of Object.entries(stats)) {
          if (stat === LcConfigStatProperty.AllDamageTypeAddedRatio) {
            for (const elemStat of ALL_ELEMENT_DMG_STATS) {
              convertedStats[elemStat] = value
            }
          } else if (stat in lcConfigStatConversion) {
            convertedStats[lcConfigStatConversion[stat as LcConfigConvertibleStat]] = value
          } else {
            convertedStats[stat as StatsValues] = value
          }
        }
        converted[Number(level)] = convertedStats
      }
      lightCone.superimpositions = converted
      lightCone.displayName = lightCone.name
    }

    const characterConfigs = getAllCharacterConfigs()

    for (const [id, dbMetadataCharacter] of Object.entries(characters)) {
      if (!characters[id]) {
        // Unreleased
        continue
      }

      const cfg = characterConfigs.get(id as Parameters<typeof characterConfigs.get>[0])
      const imageCenter = cfg?.display.imageCenter ?? { x: 1024, y: 1024, z: 1 }
      const displayName = cfg?.info.displayName ?? characters[id].name
      const metadata = cfg?.scoring

      characters[id].traces = dbMetadataCharacter.traces
      characters[id].traceTree = dbMetadataCharacter.traceTree
      characters[id].imageCenter = imageCenter
      characters[id].displayName = displayName
      if (metadata) {
        for (const part of [Parts.Body, Parts.Feet, Parts.PlanarSphere, Parts.LinkRope]) {
          if (metadata.parts[part].length === 0) {
            metadata.parts[part] = PartsMainStats[part]
          }
        }
        characters[id].scoringMetadata = metadata
      }
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

export type DBMetadataSuperimpositions = Record<number, Partial<Record<StatsValues, number>>>
