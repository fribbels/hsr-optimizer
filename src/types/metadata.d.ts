import { ElementName, PathName, ShowcaseColorMode, StatsValues } from 'lib/constants/constants'
import { SortOptionProperties } from 'lib/optimization/sortOptions'
import { PresetDefinition } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'

export type ShowcasePreferences = {
  color?: string
  colorMode?: ShowcaseColorMode
}

export type ShowcaseTemporaryOptions = {
  spdBenchmark?: number
}

export type ScoringMetadata = {
  stats: {
    [stat: string]: number
  }
  parts: {
    [part: string]: string[]
  }
  presets: PresetDefinition[]
  sortOption: SortOptionProperties
  hiddenColumns: SortOptionProperties[]
  addedColumns?: SortOptionProperties[]
  simulation?: SimulationMetadata
  traces?: {
    deactivated: string[]
  }
  modified?: boolean
}

export type SimulationMetadata = {
  parts: {
    [part: string]: string[]
  }
  substats: string[]
  errRopeEidolon?: number
  deprioritizeBuffs?: boolean
  comboAbilities: string[]
  comboDot: number
  comboBreak: number
  relicSets: string[][]
  ornamentSets: string[]
  teammates: {
    characterId: string
    lightCone: string
    characterEidolon: number
    lightConeSuperimposition: number
  }[]
  maxBonusRolls?: {
    [stat: string]: number
  }
  breakpoints?: {
    [stat: string]: number
  }
}

export type ElementalResPenType =
  'PHYSICAL_RES_PEN'
  | 'FIRE_RES_PEN'
  | 'ICE_RES_PEN'
  | 'LIGHTNING_RES_PEN'
  | 'WIND_RES_PEN'
  | 'QUANTUM_RES_PEN'
  | 'IMAGINARY_RES_PEN'

export type ElementalDamageType =
  'Physical DMG Boost'
  | 'Fire DMG Boost'
  | 'Ice DMG Boost'
  | 'Lightning DMG Boost'
  | 'Wind DMG Boost'
  | 'Quantum DMG Boost'
  | 'Imaginary DMG Boost'

export type ImageCenter = {
  x: number
  y: number
  z: number
}

type TraceNode = {
  id: string
  stat: StatsValues
  value: number
  pre: string
  children: TraceNode[]
}

export type DBMetadataCharacter = {
  id: string
  name: string
  rarity: number
  path: PathName
  element: ElementName
  max_sp: number
  stats: Record<string, number>
  unreleased: boolean
  traces: Record<string, number>
  traceTree: TraceNode[]
  imageCenter: ImageCenter
  displayName: string
  scoringMetadata: ScoringMetadata
}

export type DBMetadataLightCone = {
  id: string
  name: string
  rarity: number
  path: PathName
  stats: Record<string, number>
  unreleased: boolean
  superimpositions: Record<number, Record<string, number>>
  displayName: string
  imageCenter: number
}

export type DBMetadataSets = {
  id: string
  name: string
}

type DBMetadataStatAffixes = {
  [key: string]: {
    id: string
    affixes: {
      [key: number]: {
        affix_id: string
        property: string
        base: number
        step: number
        step_num: number
      }
    }
  }
}

export type DBMetadataRelics = {
  relicMainAffixes: DBMetadataStatAffixes
  relicSubAffixes: DBMetadataStatAffixes
  relicSets: Record<string, DBMetadataSets>
}

export type DBMetadata = {
  characters: Record<string, DBMetadataCharacter>
  lightCones: Record<string, DBMetadataLightCone>
  relics: DBMetadataRelics
}
