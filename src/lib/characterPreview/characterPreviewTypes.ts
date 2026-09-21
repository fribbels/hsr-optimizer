import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

export type InjectedScoreData = {
  percent: number,
  baselineSimScore: number,
  benchmarkSimScore: number,
  maximumSimScore: number,
}

export type SimulationMetadataOverride = {
  teammates?: SimulationMetadata['teammates'],
  deprioritizeBuffs?: boolean,
}

export type SimulationMetadataOverrides = Partial<Record<ScoringConfigType, SimulationMetadataOverride>>

export type InjectedScoringInput = {
  configType: ScoringConfigType,
  score: InjectedScoreData,
  simulationMetadataOverride?: SimulationMetadataOverride,
}
