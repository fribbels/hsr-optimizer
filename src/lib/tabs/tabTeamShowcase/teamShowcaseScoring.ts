import type { TFunction } from 'i18next'
import { resolveShowcaseScoringData } from 'lib/characterPreview/showcaseDerivedData'
import {
  buildShowcaseScoringOptions,
  type ShowcaseScoringOption,
} from 'lib/characterPreview/scoring/showcaseScoringOrder'
import {
  CUSTOM_TEAM,
  type TeamSelection,
} from 'lib/constants/constants'
import {
  configTypeForScoringType,
  SCORING_CONFIG_REGISTRY,
  type ScoringType,
} from 'lib/scoring/scoringConfig'
import { ScoringType as ScoringTypeEnum } from 'lib/scoring/scoringTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { ScoringConfigType } from 'types/metadata'

/** The scoring algorithms a slot's card can display, and the one it currently shows */
export interface SlotScoring {
  options: ShowcaseScoringOption[]
  value: ScoringType
}

export function resolveSlotScoring(
  character: Character,
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>,
  storedScoringType: ScoringType | undefined,
  t: TFunction<'charactersTab'>,
): SlotScoring {
  const resolved = resolveShowcaseScoringData({ character, teamSelections, storedScoringType })

  return {
    options: buildShowcaseScoringOptions(
      resolved.showcaseScoringOrder,
      (scoringType) => resolveScoringLabel(scoringType, t),
    ),
    value: resolved.scoringType,
  }
}

/** Uses the first Custom benchmark in the card's display order as its autofill source. */
export function resolveCustomAutofillTeammateIds(
  character: Character,
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>,
): CharacterId[] {
  const resolved = resolveShowcaseScoringData({ character, teamSelections, storedScoringType: undefined })

  for (const scoringType of resolved.showcaseScoringOrder) {
    const configType = configTypeForScoringType(scoringType)
    if (!configType || resolved.resolvedTeamSelections[configType] !== CUSTOM_TEAM) continue
    const metadata = resolved.configMetadata[configType]
    if (metadata) return metadata.teammates.map((teammate) => teammate.characterId)
  }
  return []
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
