import type { SimulationMetadataOverrides } from 'lib/characterPreview/characterPreviewTypes'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import type { SlotScoring } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type { CharacterOptions } from 'lib/ui/selectors/optionGenerator'
import type { ScreenshotAction } from 'lib/utils/screenshotUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

export type TeamSlots = (CharacterId | null)[]

export interface TeamShowcaseState {
  slots: TeamSlots
  characters: (Character | null)[]
  optionFilter: (option: CharacterOptions[CharacterId]) => boolean
  hasTeam: boolean
  setSlot: (index: number, id: CharacterId | null) => void
  reorderSlots: (order: number[]) => void
  clearTeam: () => void

  slotScoring: (SlotScoring | null)[]
  simulationMetadataOverrides: (SimulationMetadataOverrides | undefined)[]
  setSlotScoringType: (index: number, scoringType: ScoringType) => void
  canSyncBenchmarks: boolean
  hasSyncedBenchmarks: boolean
  syncBenchmarkTeams: () => void

  savedTeams: TeamShowcaseSavedTeam[]
  activeSavedTeamId: SavedTeamId | null
  saveCurrentTeam: () => void
  loadSavedTeam: (id: SavedTeamId) => void
  deleteSavedTeam: (id: SavedTeamId) => void
  renameSavedTeam: (id: SavedTeamId, name: string) => void
  moveSavedTeam: (from: number, to: number) => void

  activeScreenshotAction: ScreenshotAction | null
  screenshot: (action: ScreenshotAction) => void
}
