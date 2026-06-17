import i18next from 'i18next'
import { labelToString } from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  type AKeyValue,
  getAKeyName,
  GlobalRegister,
} from 'lib/optimization/engine/config/keys'
import { newStatsConfig } from 'lib/optimization/engine/config/statsConfig'
import {
  SortOption,
  type SortOptionKey,
} from 'lib/optimization/sortOptions'
import { getSimScoreGrade } from 'lib/scoring/dpsScore'
import { currentLocale } from 'lib/utils/i18nUtils'
import {
  type ScoringConfig,
  ScoringConfigType,
  type ScoringMetadata,
  type ScoringMetadataOverride,
} from 'types/metadata'

export type MetadataFieldKey = 'simulation' | 'supportSimulation' | 'healSimulation' | 'shieldSimulation'

type combatStatsSuffixKey = 'Support' | 'Heal' | 'Shield'

export interface ScoringConfigEntry {
  configType: ScoringConfigType
  scoringType: ScoringType
  metadataField: MetadataFieldKey
  thousands: boolean
  rulerLabel: string
  comboLabel: string
  comboRegister: number
  requiresDefaultActions: boolean
  capFlatSubstats: boolean
  applyResEqualization: boolean
  supportsUpgrades: boolean
  supportsDeprioritizeBuffs: boolean
  combatStatsSuffix?: combatStatsSuffixKey
  resultSortKey?: SortOptionKey
}

export enum ScoringType {
  DPS_SCORE = 0,
  SUBSTAT_SCORE = 1,
  NONE = 2,
  BUFFER_SCORE = 3,
  HEAL_SCORE = 4,
  SHIELD_SCORE = 5,
}

export function isSimScoreMode(scoringType: ScoringType | null | undefined): boolean {
  return scoringType === ScoringType.DPS_SCORE
    || scoringType === ScoringType.BUFFER_SCORE
    || scoringType === ScoringType.HEAL_SCORE
    || scoringType === ScoringType.SHIELD_SCORE
}

export function calculateScorePercent(
  score: number,
  baseline: number,
  benchmark: number,
  perfection: number,
): number {
  const clampedPerfection = Math.max(perfection, benchmark)
  if (score >= benchmark) {
    const range = clampedPerfection - benchmark
    return range > 0 ? 1 + (score - benchmark) / range : 1
  }
  const range = benchmark - baseline
  return range > 0 ? (score - baseline) / range : 0
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
    rulerLabel: 'DMG',
    comboLabel: 'Combo DMG',

    comboRegister: GlobalRegister.COMBO_DMG,
    requiresDefaultActions: false,
    capFlatSubstats: true,
    applyResEqualization: false,
    supportsUpgrades: true,
    supportsDeprioritizeBuffs: true,
  },
  [ScoringConfigType.BUFFER]: {
    configType: ScoringConfigType.BUFFER,
    scoringType: ScoringType.BUFFER_SCORE,
    metadataField: 'supportSimulation',
    thousands: false,
    rulerLabel: 'Buff',
    comboLabel: 'Buff',

    comboRegister: GlobalRegister.COMBO_BUFF,
    requiresDefaultActions: true,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
    combatStatsSuffix: 'Support',
    resultSortKey: SortOption.COMBO_BUFF.key,
  },
  [ScoringConfigType.HEAL]: {
    configType: ScoringConfigType.HEAL,
    scoringType: ScoringType.HEAL_SCORE,
    metadataField: 'healSimulation',
    thousands: false,
    rulerLabel: 'Heal',
    comboLabel: 'Combo Heal',

    comboRegister: GlobalRegister.COMBO_HEAL,
    requiresDefaultActions: false,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
    combatStatsSuffix: 'Heal',
    resultSortKey: SortOption.COMBO_HEAL.key,
  },
  [ScoringConfigType.SHIELD]: {
    configType: ScoringConfigType.SHIELD,
    scoringType: ScoringType.SHIELD_SCORE,
    metadataField: 'shieldSimulation',
    thousands: false,
    rulerLabel: 'Shield',
    comboLabel: 'Combo Shield',

    comboRegister: GlobalRegister.COMBO_SHIELD,
    requiresDefaultActions: false,
    capFlatSubstats: false,
    applyResEqualization: true,
    supportsUpgrades: false,
    supportsDeprioritizeBuffs: false,
    combatStatsSuffix: 'Shield',
    resultSortKey: SortOption.COMBO_SHIELD.key,
  },
}

export function getBuffStatShortLabel(buffStat: AKeyValue): string {
  const name = getAKeyName(buffStat)
  const label = newStatsConfig[name].label
  return labelToString(label)
}

export function resolveRulerLabel(entry: ScoringConfigEntry, buffStat?: AKeyValue): string {
  if (buffStat != null) {
    const stat = getBuffStatShortLabel(buffStat).toLocaleUpperCase(currentLocale())
    return i18next.t('charactersTab:CharacterPreview.RulerLabel.buffer', { stat })
  }
  return i18next.t(`charactersTab:CharacterPreview.RulerLabel.${entry.configType}`)
}

export function resolveComboLabel(entry: ScoringConfigEntry, buffStat?: AKeyValue): string {
  if (buffStat != null) {
    const stat = getBuffStatShortLabel(buffStat).toLocaleUpperCase(currentLocale())
    return i18next.t('charactersTab:CharacterPreview.ComboLabel.buffer', { stat })
  }
  return i18next.t(`charactersTab:CharacterPreview.ComboLabel.${entry.configType}`)
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
  if (override.stats || override.parts || override.traces) return true
  return CONFIG_DISPLAY_ORDER.some((ct) => override[SCORING_CONFIG_REGISTRY[ct].metadataField])
}

export type NormalizedScore = { score: number, grade: string } | { score: null, grade: 'N/A', reason: 'not-scoreable' }

export function normalizeScore(value: number, baseline: number, benchmark: number, perfection: number): NormalizedScore {
  if (benchmark <= baseline) {
    return { score: null, grade: 'N/A', reason: 'not-scoreable' }
  }
  const percent = calculateScorePercent(value, baseline, benchmark, perfection)
  return { score: percent, grade: getSimScoreGrade(percent, false, 6) }
}
