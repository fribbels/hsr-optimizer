import type {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'

export function normalizeSimulationMetadata(metadata: SimulationMetadata) {
  return {
    ...metadata,
    teammates: metadata.teammates.map((teammate) => ({ ...teammate, characterEx: teammate.characterEx ?? 0 })),
  }
}

export function normalizeScoringMetadata(metadata: ScoringMetadata) {
  return {
    ...metadata,
    simulation: metadata.simulation && normalizeSimulationMetadata(metadata.simulation),
    supportSimulation: metadata.supportSimulation && normalizeSimulationMetadata(metadata.supportSimulation),
    healSimulation: metadata.healSimulation && normalizeSimulationMetadata(metadata.healSimulation),
    shieldSimulation: metadata.shieldSimulation && normalizeSimulationMetadata(metadata.shieldSimulation),
  }
}
