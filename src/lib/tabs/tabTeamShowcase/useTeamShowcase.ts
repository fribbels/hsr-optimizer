import { editShowcasePreferences } from 'lib/characterPreview/customization/showcaseCustomizationController'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  GRID_ELEMENT_ID,
  GRID_SIZE,
  TEAM_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import {
  resolveSlotScoring,
  type SlotScoring,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type { CharacterOptions } from 'lib/ui/selectors/optionGenerator'
import { uuid } from 'lib/utils/miscUtils'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { TeamShowcaseSavedTeam } from 'types/store'
import { useShallow } from 'zustand/react/shallow'

export type TeamSlots = (CharacterId | null)[]

export type ScreenshotAction = 'clipboard' | 'download'

export interface TeamShowcaseState {
  /** Selected character id per slot, sanitized to characters the user owns */
  slots: TeamSlots
  /** Character per slot, null while empty or before the tab has been shown */
  characters: (Character | null)[]
  /** Filter for CharacterSelect restricting options to the roster */
  optionFilter: (option: CharacterOptions[CharacterId]) => boolean
  hasTeam: boolean
  setSlot: (index: number, id: CharacterId | null) => void
  clearTeam: () => void

  /** Scoring algorithm options and current value per slot, null for empty slots */
  slotScoring: (SlotScoring | null)[]
  /** Changes the scoring algorithm the slot's card displays (stored per character, shared with the Characters tab) */
  setSlotScoringType: (index: number, scoringType: ScoringType) => void

  savedTeams: TeamShowcaseSavedTeam[]
  /** Id of the saved team whose members match the current slots exactly, if any */
  activeSavedTeamId: string | null
  /** Saves the current slots as a new team; returns the new id, or null when the team is empty */
  saveCurrentTeam: (name?: string) => string | null
  loadSavedTeam: (id: string) => void
  deleteSavedTeam: (id: string) => void
  renameSavedTeam: (id: string, name: string) => void

  screenshotLoading: boolean
  screenshot: (action: ScreenshotAction) => void
}

const EMPTY_TEAM_SELECTIONS = {}

function normalizeSlots(ids: TeamSlots): TeamSlots {
  return Array.from({ length: TEAM_SIZE }, (_, i) => ids[i] ?? null)
}

/** Saved picks the user no longer owns read as empty, so what is written always matches what is rendered. */
function sanitizeSlots(ids: TeamSlots, charactersById: Partial<Record<CharacterId, Character>>): TeamSlots {
  return normalizeSlots(ids).map((id) => (id && charactersById[id] ? id : null))
}

function readSlots(): TeamSlots {
  const { savedSession } = useGlobalStore.getState()
  return sanitizeSlots(savedSession.teamShowcaseCharacterIds, useCharacterStore.getState().charactersById)
}

function saveSlots(slots: TeamSlots) {
  useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.teamShowcaseCharacterIds, slots)
  SaveState.delayedSave()
}

function readSavedTeams(): TeamShowcaseSavedTeam[] {
  return useGlobalStore.getState().savedSession.teamShowcaseSavedTeams
}

function saveTeams(teams: TeamShowcaseSavedTeam[]) {
  useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.teamShowcaseSavedTeams, teams)
  SaveState.delayedSave()
}

function sameMembers(a: TeamSlots, b: TeamSlots): boolean {
  return normalizeSlots(a).every((id, index) => id === normalizeSlots(b)[index])
}

/**
 * When the first character is picked into an otherwise empty team, fill the remaining
 * slots with that character's scoring teammates that the user owns.
 */
function autofillTeammates(slots: TeamSlots, leaderId: CharacterId, ownedIds: Set<CharacterId>): TeamSlots {
  const teammates = getScoringMetadata(leaderId).simulation?.teammates ?? []
  const candidates = teammates
    .map((teammate) => teammate.characterId)
    .filter((id) => id !== leaderId && ownedIds.has(id))

  const filled = [...slots]
  for (let i = 0; i < filled.length; i++) {
    if (filled[i] != null) continue
    const next = candidates.find((id) => !filled.includes(id))
    if (!next) break
    filled[i] = next
  }
  return filled
}

/** Cards mount only once the tab has been shown, so background tabs don't run scoring. */
function useHasActivated(): boolean {
  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)
  const [activated, setActivated] = useState(() => isActiveRef.current)

  useEffect(() => {
    if (isActiveRef.current) setActivated(true)
    return addActivationListener(() => setActivated(true))
  }, [addActivationListener, isActiveRef])

  return activated
}

export function useTeamShowcase(): TeamShowcaseState {
  const { t } = useTranslation('teamShowcaseTab')
  const { t: tCharacters } = useTranslation('charactersTab')
  const activated = useHasActivated()

  const savedSlots = useGlobalStore((s) => s.savedSession.teamShowcaseCharacterIds)
  const savedTeams = useGlobalStore((s) => s.savedSession.teamShowcaseSavedTeams)
  const charactersById = useCharacterStore((s) => s.charactersById)

  const slots = useMemo(() => sanitizeSlots(savedSlots, charactersById), [savedSlots, charactersById])

  const characters = useMemo(
    () => slots.map((id) => (activated && id ? charactersById[id] ?? null : null)),
    [slots, charactersById, activated],
  )

  const ownedIds = useMemo(
    () => new Set(Object.keys(charactersById) as CharacterId[]),
    [charactersById],
  )

  const optionFilter = useCallback(
    (option: CharacterOptions[CharacterId]) => ownedIds.has(option.id),
    [ownedIds],
  )

  const setSlot = useCallback((index: number, id: CharacterId | null) => {
    const current = readSlots()
    const next = current.map((existing, i) => {
      if (i === index) return id
      // The same character can't fill two slots
      return existing === id ? null : existing
    })

    const wasEmpty = current.every((existing) => existing == null)
    saveSlots(id && wasEmpty ? autofillTeammates(next, id, ownedIds) : next)
  }, [ownedIds])

  const clearTeam = useCallback(() => saveSlots(normalizeSlots([])), [])

  // ----- Per-slot scoring -----
  const { teamPreferences, showcasePreferences } = useShowcaseTabStore(useShallow((s) => ({
    teamPreferences: s.showcaseTeamPreferenceByConfig,
    showcasePreferences: s.showcasePreferences,
  })))

  const slotScoring = useMemo(
    () => slots.map((id) => {
      const character = id ? charactersById[id] : undefined
      if (!character) return null
      return resolveSlotScoring(
        character,
        teamPreferences[character.id] ?? EMPTY_TEAM_SELECTIONS,
        showcasePreferences[character.id]?.scoringType,
        tCharacters,
      )
    }),
    [slots, charactersById, teamPreferences, showcasePreferences, tCharacters],
  )

  const setSlotScoringType = useCallback((index: number, scoringType: ScoringType) => {
    const id = readSlots()[index]
    if (!id) return
    editShowcasePreferences(id, { scoringType })
  }, [])

  // ----- Saved teams -----
  const activeSavedTeamId = useMemo(
    () => savedTeams.find((team) => sameMembers(team.characterIds, slots))?.id ?? null,
    [savedTeams, slots],
  )

  const saveCurrentTeam = useCallback((name?: string) => {
    const current = readSlots()
    if (current.every((id) => id == null)) return null
    const teams = readSavedTeams()
    const team: TeamShowcaseSavedTeam = {
      id: uuid(),
      name: name?.trim() || t('SavedTeams.DefaultName', { index: teams.length + 1 }),
      characterIds: current,
    }
    saveTeams([...teams, team])
    return team.id
  }, [t])

  const loadSavedTeam = useCallback((id: string) => {
    const team = readSavedTeams().find((candidate) => candidate.id === id)
    if (team) saveSlots(normalizeSlots(team.characterIds))
  }, [])

  const deleteSavedTeam = useCallback((id: string) => {
    saveTeams(readSavedTeams().filter((team) => team.id !== id))
  }, [])

  const renameSavedTeam = useCallback((id: string, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    saveTeams(readSavedTeams().map((team) => (team.id === id ? { ...team, name: trimmed } : team)))
  }, [])

  // ----- Screenshot -----
  const { loading: screenshotLoading, trigger } = useScreenshotAction(GRID_ELEMENT_ID, GRID_SIZE)
  const screenshot = useCallback(
    (action: ScreenshotAction) => trigger(action, t('ScreenshotName')),
    [trigger, t],
  )

  const hasTeam = slots.some((id) => id != null)

  return {
    slots,
    characters,
    optionFilter,
    hasTeam,
    setSlot,
    clearTeam,
    slotScoring,
    setSlotScoringType,
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    screenshotLoading,
    screenshot,
  }
}
