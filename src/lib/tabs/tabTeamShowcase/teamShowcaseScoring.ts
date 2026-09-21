import type { TFunction } from 'i18next'
import { handleTeamSelection } from 'lib/characterPreview/characterPreviewController'
import {
  buildShowcaseScoringOptions,
  resolveShowcaseScoringOrder,
  resolveShowcaseScoringType,
  type ShowcaseScoringOption,
} from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import {
  CUSTOM_TEAM,
  type TeamSelection,
} from 'lib/constants/constants'
import {
  CONFIG_DISPLAY_ORDER,
  configTypeForScoringType,
  SCORING_CONFIG_REGISTRY,
  type ScoringType,
} from 'lib/scoring/scoringConfig'
import { ScoringType as ScoringTypeEnum } from 'lib/scoring/scoringTypes'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

/** The scoring algorithms a slot's card can display, and the one it currently shows */
export interface SlotScoring {
  options: ShowcaseScoringOption[]
  value: ScoringType
}

interface ResolvedSlotScoring {
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  resolvedTeamSelections: Record<ScoringConfigType, TeamSelection>
  order: readonly ScoringType[]
  value: ScoringType
}

/**
 * Mirrors the scoring order resolution the card itself performs in resolveShowcaseLayout,
 * so a slot selector offers exactly the algorithms the card can render.
 */
export function resolveSlotScoring(
  character: Character,
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>,
  storedScoringType: ScoringType | undefined,
  t: TFunction<'charactersTab'>,
): SlotScoring {
  const resolved = resolveSlotScoringData(character, teamSelections, storedScoringType)

  return {
    options: buildShowcaseScoringOptions(resolved.order, (scoringType) => resolveScoringLabel(scoringType, t)),
    value: resolved.value,
  }
}

/** Returns an autofill source only when the card's active benchmark explicitly resolves to Custom. */
export function resolveCustomAutofillTeammateIds(
  character: Character,
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>,
): CharacterId[] {
  const resolved = resolveSlotScoringData(character, teamSelections, undefined)
  for (const scoringType of resolved.order) {
    const configType = configTypeForScoringType(scoringType)
    if (!configType || resolved.resolvedTeamSelections[configType] !== CUSTOM_TEAM) continue
    const metadata = resolved.configMetadata[configType]
    if (metadata) return metadata.teammates.map((teammate) => teammate.characterId)
  }
  return []
}

function resolveSlotScoringData(
  character: Character,
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>,
  storedScoringType: ScoringType | undefined,
): ResolvedSlotScoring {
  const configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>> = {}
  const resolvedTeamSelections = {} as Record<ScoringConfigType, TeamSelection>
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const entry = SCORING_CONFIG_REGISTRY[configType]
    const teamSelection = handleTeamSelection(character, teamSelections[configType], entry.metadataField)
    resolvedTeamSelections[configType] = teamSelection
    const meta = resolveSimulationMetadata(character, configType, teamSelection)
    if (meta) configMetadata[configType] = meta
  }

  const order = resolveShowcaseScoringOrder(
    getCharacterConfig(character.id)?.display.showcaseScoringOrder,
    configMetadata,
  )

  return {
    configMetadata,
    resolvedTeamSelections,
    order,
    value: resolveShowcaseScoringType(storedScoringType, order),
  }
}

function resolveScoringLabel(scoringType: ScoringType, t: TFunction<'charactersTab'>): string {
  const configType = configTypeForScoringType(scoringType)
  if (configType != null) {
    return t(`CharacterPreview.AlgorithmSlider.Labels.${SCORING_CONFIG_REGISTRY[configType].configType}`)
  }
  return scoringType === ScoringTypeEnum.SUBSTAT_SCORE
    ? t('CharacterPreview.AlgorithmSlider.Labels.StatScore')
    : t('CharacterPreview.AlgorithmSlider.Labels.NoneScore')
}
