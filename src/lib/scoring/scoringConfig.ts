import type { ScoringConfig, ScoringConfigType, ScoringMetadata, ScoringMetadataOverride } from 'types/metadata'

export const CONFIG_FIELD_MAP: Record<ScoringConfigType, 'simulation' | 'supportSimulation' | 'healSimulation' | 'shieldSimulation'> = {
  dps: 'simulation',
  buffer: 'supportSimulation',
  heal: 'healSimulation',
  shield: 'shieldSimulation',
}

export const CONFIG_DISPLAY_ORDER: ScoringConfigType[] = ['dps', 'buffer', 'heal', 'shield']

export function getConfig(metadata: ScoringMetadata, type: ScoringConfigType): ScoringConfig | undefined {
  const field = CONFIG_FIELD_MAP[type]
  const sim = metadata[field]
  if (!sim) return undefined
  return {
    configType: type,
    simulation: sim,
    scoringActionKey: type === 'buffer' ? 'BUFF' : undefined,
  }
}

export function hasConfig(metadata: ScoringMetadata, type: ScoringConfigType): boolean {
  return !!metadata[CONFIG_FIELD_MAP[type]]
}

export function listConfigs(metadata: ScoringMetadata): ScoringConfig[] {
  return CONFIG_DISPLAY_ORDER.map((t) => getConfig(metadata, t)).filter((c): c is ScoringConfig => c != null)
}

export function hasOverrideContent(override: ScoringMetadataOverride | undefined): boolean {
  if (!override) return false
  return !!(
    override.stats
    || override.parts
    || override.traces
    || override.simulation
    || override.supportSimulation
    || override.healSimulation
    || override.shieldSimulation
  )
}

export type NormalizedScore = { score: number, grade: string } | { score: null, grade: 'N/A', reason: 'not-scoreable' }

export function normalizeScore(value: number, baseline: number, perfection: number): NormalizedScore {
  const denominator = perfection - baseline
  if (denominator <= 0) {
    return { score: null, grade: 'N/A', reason: 'not-scoreable' }
  }
  const raw = (value - baseline) / denominator
  return { score: Math.max(0, Math.min(raw, 1)), grade: gradeFromRawScore(raw) }
}

function gradeFromRawScore(raw: number): string {
  if (raw >= 0.95) return 'SSS'
  if (raw >= 0.9) return 'SS'
  if (raw >= 0.8) return 'S'
  if (raw >= 0.7) return 'A'
  if (raw >= 0.6) return 'B'
  if (raw >= 0.5) return 'C'
  if (raw >= 0.4) return 'D'
  return 'F'
}
