import type { TFunction } from 'i18next'
import { handleTeamSelection } from 'lib/characterPreview/characterPreviewController'
import {
  buildShowcaseScoringOptions,
  resolveShowcaseScoringOrder,
  resolveShowcaseScoringType,
  type ShowcaseScoringOption,
} from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import type { TeamSelection } from 'lib/constants/constants'
import {
  CONFIG_DISPLAY_ORDER,
  configTypeForScoringType,
  SCORING_CONFIG_REGISTRY,
  type ScoringType,
} from 'lib/scoring/scoringConfig'
import { ScoringType as ScoringTypeEnum } from 'lib/scoring/scoringTypes'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import type { Character } from 'types/character'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

/** The scoring algorithms a slot's card can display, and the one it currently shows */
export interface SlotScoring {
  options: ShowcaseScoringOption[]
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
  const configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>> = {}
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const entry = SCORING_CONFIG_REGISTRY[configType]
    const teamSelection = handleTeamSelection(character, teamSelections[configType], entry.metadataField)
    const meta = resolveSimulationMetadata(character, configType, teamSelection)
    if (meta) configMetadata[configType] = meta
  }

  const order = resolveShowcaseScoringOrder(
    getCharacterConfig(character.id)?.display.showcaseScoringOrder,
    configMetadata,
  )

  return {
    options: buildShowcaseScoringOptions(order, (scoringType) => resolveScoringLabel(scoringType, t)),
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
