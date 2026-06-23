import { type TFunction } from 'i18next'
import {
  getArtistName,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  handleTeamSelection,
  resolveScoringType,
} from 'lib/characterPreview/characterPreviewController'
import type {
  ShowcaseDisplayDimensions,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import {
  DEFAULT_TEAM,
  type TeamSelection,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  CONFIG_DISPLAY_ORDER,
  configTypeForScoringType,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import {
  isSimScoreMode,
  ScoringType,
} from 'lib/scoring/scoringConfig'
import { Aventurine } from 'lib/conditionals/character/1300/Aventurine'
import { Jade } from 'lib/conditionals/character/1300/Jade'
import { TheDahlia } from 'lib/conditionals/character/1300/TheDahlia'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Fugue } from 'lib/conditionals/character/1200/Fugue'
import { SilverWolfB1 } from 'lib/conditionals/character/1000/SilverWolfB1'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/character/characterStore'
import {
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import type {
  Character,
  CharacterId,
  SavedBuild,
} from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type {
  ScoringConfigType,
  SimulationMetadata,
} from 'types/metadata'

// ===== Layout Resolution (character-dependent, no color) =====

interface ShowcaseLayoutParams {
  character: Character
  teamSelections: Partial<Record<ScoringConfigType, TeamSelection>>
  storedScoringType: ScoringType | undefined
  savedBuildOverride?: SavedBuild | null
  t: TFunction<'gameData'>
}

export interface ShowcaseLayout {
  showcaseMetadata: ShowcaseMetadata
  activeConfigType: ScoringConfigType | undefined
  activeSimulationMetadata: SimulationMetadata | null
  activeTeamSelection: TeamSelection
  configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>>
  hasSimulation: boolean
  scoringType: ScoringType
  portraitToUse: CustomImageConfig | undefined
  portraitUrl: string
  defaultPortraitUrl: string
  displayDimensions: ShowcaseDisplayDimensions
  artistName: string | undefined
}

export function resolveShowcaseLayout(params: ShowcaseLayoutParams): ShowcaseLayout {
  const { character, teamSelections, storedScoringType, savedBuildOverride, t } = params

  const showcaseMetadata = getShowcaseMetadata(character, t)
  const scoringMetadata = getScoringMetadata(character.id)

  const resolvedTeamSelections: Record<ScoringConfigType, TeamSelection> = {} as Record<ScoringConfigType, TeamSelection>
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const entry = SCORING_CONFIG_REGISTRY[configType]
    resolvedTeamSelections[configType] = handleTeamSelection(character, teamSelections[configType], entry.metadataField)
  }

  const configMetadata: Partial<Record<ScoringConfigType, SimulationMetadata>> = {}
  for (const configType of CONFIG_DISPLAY_ORDER) {
    const meta = resolveSimulationMetadata(character, configType, resolvedTeamSelections[configType], savedBuildOverride)
    if (meta) {
      meta.deprioritizeBuffs = resolveEffectiveDeprioritizeBuffs(character.id, meta)
      configMetadata[configType] = meta
    }
  }

  const hasSimulation = CONFIG_DISPLAY_ORDER.some((configType) => configMetadata[configType] != null)

  let scoringType = resolveScoringType(storedScoringType, scoringMetadata)
  if (isSimScoreMode(scoringType) && !configMetadata[configTypeForScoringType(scoringType)!]) {
    scoringType = ScoringType.SUBSTAT_SCORE
  }

  const portraitToUse = getCharacterById(character.id)?.portrait
  const defaultPortraitUrl = Assets.getCharacterPortraitById(character.id)
  const portraitUrl = portraitToUse?.imageUrl ?? defaultPortraitUrl

  const displayDimensions = getShowcaseDisplayDimensions(character)
  const artistName = getArtistName(character)

  const activeConfigType = configTypeForScoringType(scoringType)
  const activeSimulationMetadata = activeConfigType ? configMetadata[activeConfigType] ?? null : null
  const activeTeamSelection = activeConfigType ? resolvedTeamSelections[activeConfigType] : DEFAULT_TEAM

  return {
    showcaseMetadata,
    activeConfigType,
    activeSimulationMetadata,
    activeTeamSelection,
    configMetadata,
    hasSimulation,
    scoringType,
    portraitToUse,
    portraitUrl,
    defaultPortraitUrl,
    displayDimensions,
    artistName,
  }
}

// Characters whose DPS simulation is secondary to their support/heal/shield role.
// When these are teammates, they don't count as a "real DPS" for the purpose of
// keeping another sub DPS in sub mode.
const SUB_SUB_DPS_CHARACTERS: Set<CharacterId> = new Set([
  Aventurine.id,
  Hyacine.id,
  TheDahlia.id,
  Tribbie.id,
  KafkaB1.id,
  Fugue.id,
  Yaoguang.id,
  Jade.id,
  Cipher.id,
  SilverWolfB1.id,
])

/**
 * Sub DPS characters default to main DPS when no teammate has a DPS simulation,
 * since the showcased character is the sole damage source. If the user has
 * explicitly overridden deprioritizeBuffs, their choice takes precedence.
 */
export function resolveEffectiveDeprioritizeBuffs(
  characterId: CharacterId,
  simulation: SimulationMetadata,
): boolean {
  const rawOverride = useScoringStore.getState().scoringMetadataOverrides[characterId]
  if (rawOverride?.simulation != null && 'deprioritizeBuffs' in rawOverride.simulation) {
    return simulation.deprioritizeBuffs ?? false
  }

  if (simulation.deprioritizeBuffs) {
    const characters = getGameMetadata().characters
    const hasTeammateDpsSim = simulation.teammates.some((teammate) => {
      if (!characters[teammate.characterId]?.scoringMetadata?.simulation) return false
      return !SUB_SUB_DPS_CHARACTERS.has(teammate.characterId)
    })
    if (!hasTeammateDpsSim) {
      return false
    }
  }

  return simulation.deprioritizeBuffs ?? false
}
