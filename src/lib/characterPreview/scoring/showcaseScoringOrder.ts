import {
  CONFIG_DISPLAY_ORDER,
  SCORING_CONFIG_REGISTRY,
  ScoringType,
} from 'lib/scoring/scoringConfig'
import type { ScoringConfigType } from 'types/metadata'

type AvailableSimulationConfigs = Readonly<Partial<Record<ScoringConfigType, unknown>>>

interface RequestedShowcaseScoringTypeParams {
  forceDebug: boolean | undefined
  injectedScoringType: ScoringType | undefined
  buildScoringType: ScoringType | undefined
  storedScoringType: ScoringType | undefined
}

export interface ShowcaseScoringOption {
  label: string
  value: string
}

export function resolveRequestedShowcaseScoringType({
  forceDebug,
  injectedScoringType,
  buildScoringType,
  storedScoringType,
}: RequestedShowcaseScoringTypeParams): ScoringType | undefined {
  if (forceDebug) return ScoringType.SUBSTAT_SCORE
  return injectedScoringType ?? buildScoringType ?? storedScoringType
}

export function resolveShowcaseScoringOrder(
  configuredOrder: readonly unknown[] | undefined,
  availableSimulationConfigs: AvailableSimulationConfigs,
): readonly ScoringType[] {
  const availableSimulationTypes: ScoringType[] = []
  for (const configType of CONFIG_DISPLAY_ORDER) {
    if (availableSimulationConfigs[configType] != null) {
      availableSimulationTypes.push(SCORING_CONFIG_REGISTRY[configType].scoringType)
    }
  }

  const resolvedOrder: ScoringType[] = []
  const includedTypes = new Set<ScoringType>()
  const appendIfAvailable = (value: unknown) => {
    if (!isAvailableScoringType(value, availableSimulationTypes) || includedTypes.has(value)) {
      return
    }
    includedTypes.add(value)
    resolvedOrder.push(value)
  }

  for (const scoringType of configuredOrder ?? []) {
    appendIfAvailable(scoringType)
  }
  for (const configType of CONFIG_DISPLAY_ORDER) {
    appendIfAvailable(SCORING_CONFIG_REGISTRY[configType].scoringType)
  }
  appendIfAvailable(ScoringType.SUBSTAT_SCORE)
  appendIfAvailable(ScoringType.NONE)

  return resolvedOrder
}

function isAvailableScoringType(
  value: unknown,
  availableSimulationTypes: readonly ScoringType[],
): value is ScoringType {
  return value === ScoringType.SUBSTAT_SCORE
    || value === ScoringType.NONE
    || availableSimulationTypes.some((scoringType) => scoringType === value)
}

export function resolveShowcaseScoringType(
  requestedScoringType: unknown,
  scoringOrder: readonly ScoringType[],
): ScoringType {
  return scoringOrder.find((scoringType) => scoringType === requestedScoringType)
    ?? scoringOrder[0]
    ?? ScoringType.SUBSTAT_SCORE
}

export function buildShowcaseScoringOptions(
  scoringOrder: readonly ScoringType[],
  resolveLabel: (scoringType: ScoringType) => string,
): ShowcaseScoringOption[] {
  return scoringOrder.map((scoringType) => ({
    label: resolveLabel(scoringType),
    value: String(scoringType),
  }))
}
