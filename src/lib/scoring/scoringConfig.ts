import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import type { SortOptionKey } from 'lib/optimization/sortOptions'
import {
  ScoringConfigType,
  type ScoringConfig,
  type ScoringMetadata,
  type ScoringMetadataOverride,
} from 'types/metadata'

export type MetadataFieldKey = 'simulation' | 'supportSimulation' | 'healSimulation' | 'shieldSimulation'

export interface ScoringConfigEntry {
  configType: ScoringConfigType
  scoringType: ScoringType
  metadataField: MetadataFieldKey
  scoringActionKey?: string
  thousands: boolean
  label: string
  headerTitle: string
  headerScoreLabel: string
  rulerLabel: string
  mainsFreeCount: number
  comboRegister: number
  capFlatSubstats: boolean
  applyResEqualization: boolean
  supportsUpgrades: boolean
  supportsDeprioritizeBuffs: boolean
  resultSortKey?: SortOptionKey
}

export const CONFIG_DISPLAY_ORDER: ScoringConfigType[] = [
  ScoringConfigType.DPS,
  ScoringConfigType.BUFFER,
  ScoringConfigType.HEAL,
  ScoringConfigType.SHIELD,
]

export const SCORING_CONFIG_REGISTRY: Record<ScoringConfigType, ScoringConfigEntry> = {
  [ScoringConfigType.DPS]: {
    configType: ScoringConfigType.DPS,
    scoringType: ScoringType.DPS_SCORE,
    metadataField: 'simulation',
    thousands: true,
    label: 'DPS Score',
    headerTitle: '',
    headerScoreLabel: '',
    rulerLabel: 'Damage',
    mainsFreeCount: 0,
    comboRegister: GlobalRegister.COMBO_DMG,
    capFlatSubstats: true,
    applyResEqualization: false,
    supportsUpgrades: true,
    supportsDeprioritizeBuffs: true,
  },
  [ScoringConfigType.BUFFER]: {
    configType: ScoringConfigType.BUFFER,
    scoringType: ScoringType.BUFFER_SCORE,
    metadataField: 'supportSimulation',
    scoringActionKey: 'BUFF',
    thousands: false,
    label: 'Support Score',
    headerTitle: 'Support Sim',
    headerScoreLabel: 'Support Score',
    rulerLabel: 'Buff',
    mainsFreeCount: 2,
    comboRegister: GlobalRegister.COMBO_DMG,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
  },
  [ScoringConfigType.HEAL]: {
    configType: ScoringConfigType.HEAL,
    scoringType: ScoringType.HEAL_SCORE,
    metadataField: 'healSimulation',
    thousands: false,
    label: 'Heal Score',
    headerTitle: 'Heal Sim',
    headerScoreLabel: 'Heal Score',
    rulerLabel: 'Healing',
    mainsFreeCount: 2,
    comboRegister: GlobalRegister.COMBO_HEAL,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
    resultSortKey: 'COMBO_HEAL',
  },
  [ScoringConfigType.SHIELD]: {
    configType: ScoringConfigType.SHIELD,
    scoringType: ScoringType.SHIELD_SCORE,
    metadataField: 'shieldSimulation',
    thousands: false,
    label: 'Shield Score',
    headerTitle: 'Shield Sim',
    headerScoreLabel: 'Shield Score',
    rulerLabel: 'Shield',
    mainsFreeCount: 2,
    comboRegister: GlobalRegister.COMBO_SHIELD,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
    resultSortKey: 'COMBO_SHIELD',
  },
}

export const CONFIG_FIELD_MAP: Record<ScoringConfigType, MetadataFieldKey> = Object.fromEntries(
  CONFIG_DISPLAY_ORDER.map((ct) => [ct, SCORING_CONFIG_REGISTRY[ct].metadataField]),
) as Record<ScoringConfigType, MetadataFieldKey>

export function configTypeForScoringType(scoringType: ScoringType): ScoringConfigType | undefined {
  return CONFIG_DISPLAY_ORDER.find((ct) => SCORING_CONFIG_REGISTRY[ct].scoringType === scoringType)
}

export function getConfig(metadata: ScoringMetadata, type: ScoringConfigType): ScoringConfig | undefined {
  const entry = SCORING_CONFIG_REGISTRY[type]
  const sim = metadata[entry.metadataField]
  if (!sim) return undefined
  return {
    configType: type,
    simulation: sim,
    scoringActionKey: entry.scoringActionKey,
  }
}

export function hasConfig(metadata: ScoringMetadata, type: ScoringConfigType): boolean {
  return !!metadata[SCORING_CONFIG_REGISTRY[type].metadataField]
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
