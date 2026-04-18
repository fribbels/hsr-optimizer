import type {
  ElementName,
  MainStats,
  Parts,
  PathName,
  SetKey,
  Sets,
  ShowcaseColorMode,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import type { statConversion } from 'lib/importer/characterConverter'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import type { SortOptionProperties } from 'lib/optimization/sortOptions'
import type { PresetDefinition } from 'lib/scoring/presetEffects'
import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type ShowcasePreferences = {
  color?: string,
  colorMode?: ShowcaseColorMode,
}

export type ShowcaseTemporaryOptions = {
  spdBenchmark?: number,
}

export type ScoringMetadata = {
  /*      stat score      */ characterId?: CharacterId,
  /*      stat score      */ modified?: boolean,
  /*      stat score      */ parts: Record<Exclude<Parts, typeof Parts.Head | typeof Parts.Hands>, MainStats[]>,
  /* stat score/optimizer */ stats: Record<SubStats, number> & Partial<Record<'minWeightedRolls', number>>,
  /*      optimizer       */ presets: PresetDefinition[],
  /*      optimizer       */ sortOption: SortOptionProperties,
  /*      optimizer       */ hiddenColumns: SortOptionProperties[],
  /*      optimizer       */ addedColumns?: SortOptionProperties[],
  /* optimizer/dps score  */ traces?: { deactivated: string[] },
  /*      dps score       */ simulation?: SimulationMetadata,
}

export type ScoringParts = Exclude<Parts, typeof Parts.Head | typeof Parts.Hands>
export type ScoringMetadataOverride = {
  stats?: Partial<Record<SubStats, number>>,
  parts?: Partial<Record<ScoringParts, MainStats[]>>,
  simulation?: Partial<SimulationMetadata>,
  traces?: { deactivated: string[] },
}

export type SimulationMetadata = {
  parts: {
    [part: string]: MainStats[],
  },
  /**
   * Must contain at least 5 non-SPD stats so the benchmark search space can fill all 24 substat
   * slots on a real 6-piece build. If the character only has 3-4 real damage stats, pad with a
   * flat filler (`Stats.ATK` / `Stats.HP` / `Stats.DEF`) — SPD is implicit and doesn't count.
   */
  substats: SubStats[],
  errRopeEidolon?: number,
  deprioritizeBuffs?: boolean,
  comboTurnAbilities: TurnAbilityName[],
  comboDot?: number,
  relicSets: SetsRelics[][],
  ornamentSets: SetsOrnaments[],
  teammates: {
    characterId: CharacterId,
    lightCone: LightConeId,
    characterEidolon: number,
    lightConeSuperimposition: number,
    teamRelicSet?: string,
    teamOrnamentSet?: string,
  }[],
  breakpoints?: {
    [stat: string]: number,
  },
}

export type ElementalResPenType =
  | 'PHYSICAL_RES_PEN'
  | 'FIRE_RES_PEN'
  | 'ICE_RES_PEN'
  | 'LIGHTNING_RES_PEN'
  | 'WIND_RES_PEN'
  | 'QUANTUM_RES_PEN'
  | 'IMAGINARY_RES_PEN'

export type ElementalDamageType =
  | 'Physical DMG Boost'
  | 'Fire DMG Boost'
  | 'Ice DMG Boost'
  | 'Lightning DMG Boost'
  | 'Wind DMG Boost'
  | 'Quantum DMG Boost'
  | 'Imaginary DMG Boost'

export type ImageCenter = {
  x: number,
  y: number,
  z: number,
}

export type TraceNode = {
  id: string,
  stat: StatsValues,
  value: number,
  pre: string,
  children: TraceNode[],
}

export type DBMetadataCharacter = {
  id: CharacterId,
  rarity: number,
  path: PathName,
  element: ElementName,
  max_sp: number,
  stats: Record<string, number>,
  unreleased: boolean,
  traces: Record<string, number>,
  traceTree: TraceNode[],
  imageCenter: ImageCenter,
  spineCenter: ImageCenter,
  disableSpine: boolean,
  scoringMetadata: ScoringMetadata,
}

export type DBMetadataLightCone = {
  id: LightConeId,
  rarity: 5 | 4 | 3,
  path: PathName,
  stats: Record<string, number>,
  unreleased: boolean,
  superimpositions: Record<number, Record<string, number>>,
  imageOffset: { x: number, y: number, s: number },
}

export type DBMetadataSets = {
  id: SetKey,
  name: Sets,
}

type DBMetadataStatAffixes = {
  [key: string]: {
    id: string,
    affixes: {
      [key: number]: {
        affix_id: string,
        property: keyof typeof statConversion,
        base: number,
        step: number,
        step_num: number,
      },
    },
  },
}

export type DBMetadataRelics = {
  relicMainAffixes: DBMetadataStatAffixes,
  relicSubAffixes: DBMetadataStatAffixes,
  relicSets: Record<string, DBMetadataSets>,
}

export type DBMetadata = {
  characters: Record<CharacterId, DBMetadataCharacter>,
  lightCones: Record<LightConeId, DBMetadataLightCone>,
  relics: DBMetadataRelics,
}
