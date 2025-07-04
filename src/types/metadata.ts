import {
  ElementName,
  MainStats,
  Parts,
  PathName,
  Sets,
  ShowcaseColorMode,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import { statConversion } from 'lib/importer/characterConverter'
import { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOptionProperties } from 'lib/optimization/sortOptions'
import { PresetDefinition } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { CharacterId } from 'types/character'
import { LightCone } from 'types/lightCone'

export type ShowcasePreferences = {
  color?: string,
  colorMode?: ShowcaseColorMode,
}

export type ShowcaseTemporaryOptions = {
  spdBenchmark?: number,
}

export type ScoringMetadata = {
  stats: Record<SubStats, number> & Partial<Record<'headHands' | 'bodyFeet' | 'sphereRope', number>>,
  parts: Record<Exclude<Parts, typeof Parts.Head | typeof Parts.Hands>, MainStats[]>,
  presets: PresetDefinition[],
  sortOption: SortOptionProperties,
  hiddenColumns: SortOptionProperties[],
  addedColumns?: SortOptionProperties[],
  simulation?: SimulationMetadata,
  traces?: {
    deactivated: string[],
  },
  modified?: boolean,
}

export type SimulationMetadata = {
  parts: {
    [part: string]: string[],
  },
  substats: string[],
  errRopeEidolon?: number,
  deprioritizeBuffs?: boolean,
  comboTurnAbilities: TurnAbilityName[],
  comboDot: number,
  relicSets: string[][],
  ornamentSets: string[],
  teammates: {
    characterId: CharacterId,
    lightCone: LightCone['id'],
    characterEidolon: number,
    lightConeSuperimposition: number,
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
  name: string,
  rarity: number,
  path: PathName,
  element: ElementName,
  max_sp: number,
  stats: Record<string, number>,
  unreleased: boolean,
  traces: Record<string, number>,
  traceTree: TraceNode[],
  imageCenter: ImageCenter,
  displayName: string,
  scoringMetadata: ScoringMetadata,
}

export type DBMetadataLightCone = {
  id: LightCone['id'],
  name: string,
  rarity: 5 | 4 | 3,
  path: PathName,
  stats: Record<string, number>,
  unreleased: boolean,
  superimpositions: Record<number, Record<string, number>>,
  displayName: string,
  imageCenter: number,
}

export type DBMetadataSets = {
  id: keyof typeof Sets,
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
  lightCones: Record<LightCone['id'], DBMetadataLightCone>,
  relics: DBMetadataRelics,
}
