import { SortOptionProperties } from 'lib/optimization/sortOptions'
import { PresetDefinition } from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'

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
  simulation?: SimulationMetadata
  modified?: boolean
}

export type SimulationMetadata = {
  parts: {
    [part: string]: string[]
  }
  substats: string[]
  errRopeEidolon?: number
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

export type DBMetadataCharacter = {
  id: string
  name: string
  rarity: number
  path: string
  element: string
  max_sp: number
  stats: Record<string, number>
  unreleased: boolean
  traces: Record<string, number>
  imageCenter: {
    x: number
    y: number
    z: number
  }
  displayName: string
  scoringMetadata: ScoringMetadata
}

export type DBMetadataLightCone = {
  id: string
  name: string
  rarity: number
  path: string
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
