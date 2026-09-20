import { editShowcasePreferences } from 'lib/characterPreview/customization/showcaseCustomizationController'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  GRID_ELEMENT_ID,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import {
  readSavedTeams,
  readTeamSlots,
  writeSavedTeams,
  writeTeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseController'
import {
  areTeamSlotsEqual,
  autofillTeamSlots,
  isSavedTeamIndex,
  normalizeTeamSlots,
  sanitizeTeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import {
  resolveSlotScoring,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type {
  TeamShowcaseState,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type { CharacterOptions } from 'lib/ui/selectors/optionGenerator'
import { uuid } from 'lib/utils/miscUtils'
import type { ScreenshotAction } from 'lib/utils/screenshotUtils'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'
import { useShallow } from 'zustand/react/shallow'

const EMPTY_TEAM_SELECTIONS = {}

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

  const slots = useMemo(() => sanitizeTeamSlots(savedSlots, charactersById), [savedSlots, charactersById])

  const characters = useMemo(
    () => slots.map((id) => (activated && id ? charactersById[id] ?? null : null)),
    [slots, charactersById, activated],
  )

  const ownedIds = useMemo(
    // Safe cast: the index is keyed by CharacterId, so its keys are CharacterId
    () => new Set(Object.keys(charactersById) as CharacterId[]),
    [charactersById],
  )

  const optionFilter = useCallback(
    (option: CharacterOptions[CharacterId]) => ownedIds.has(option.id),
    [ownedIds],
  )

  const setSlot = useCallback((index: number, id: CharacterId | null) => {
    const current = readTeamSlots()
    const next = current.map((existing, i) => {
      if (i === index) return id
      // The same character can't fill two slots
      return existing === id ? null : existing
    })

    const wasEmpty = current.every((existing) => existing == null)
    writeTeamSlots(id && wasEmpty ? autofillTeamSlots(next, id, ownedIds) : next)
  }, [ownedIds])

  /**
   * Writes every position at once. setSlot cannot express a rearrangement: it clears any other slot
   * holding the same character, so moving characters one at a time would empty the ones it passes over.
   */
  const reorderSlots = useCallback((order: number[]) => {
    const current = readTeamSlots()
    const next = normalizeTeamSlots(order.map((source) => current[source] ?? null))
    if (next.every((id, index) => id === current[index])) return
    writeTeamSlots(next)
  }, [])

  const clearTeam = useCallback(() => writeTeamSlots(normalizeTeamSlots([])), [])

  // ----- Per-slot scoring -----
  const { teamPreferences, showcasePreferences } = useShowcaseTabStore(useShallow((s) => ({
    teamPreferences: s.showcaseTeamPreferenceByConfig,
    showcasePreferences: s.showcasePreferences,
  })))

  const slotScoring = useMemo(
    () =>
      slots.map((id) => {
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
    const id = readTeamSlots()[index]
    if (!id) return
    editShowcasePreferences(id, { scoringType })
  }, [])

  // ----- Saved teams -----
  const activeSavedTeamId = useMemo(
    () => savedTeams.find((team) => areTeamSlotsEqual(team.characterIds, slots))?.id ?? null,
    [savedTeams, slots],
  )

  const saveCurrentTeam = useCallback(() => {
    const current = readTeamSlots()
    if (current.every((id) => id == null)) return
    const teams = readSavedTeams()
    const team: TeamShowcaseSavedTeam = {
      id: uuid(),
      name: t('SavedTeams.DefaultName', { index: teams.length + 1 }),
      characterIds: current,
    }
    writeSavedTeams([...teams, team])
  }, [t])

  const loadSavedTeam = useCallback((id: SavedTeamId) => {
    const team = readSavedTeams().find((candidate) => candidate.id === id)
    if (team) writeTeamSlots(normalizeTeamSlots(team.characterIds))
  }, [])

  const deleteSavedTeam = useCallback((id: SavedTeamId) => {
    writeSavedTeams(readSavedTeams().filter((team) => team.id !== id))
  }, [])

  const moveSavedTeam = useCallback((from: number, to: number) => {
    const teams = readSavedTeams()
    if (from === to || !isSavedTeamIndex(from, teams) || !isSavedTeamIndex(to, teams)) return
    const next = [...teams]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    writeSavedTeams(next)
  }, [])

  const renameSavedTeam = useCallback((id: SavedTeamId, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    writeSavedTeams(readSavedTeams().map((team) => (team.id === id ? { ...team, name: trimmed } : team)))
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
    reorderSlots,
    clearTeam,
    slotScoring,
    setSlotScoringType,
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
    screenshotLoading,
    screenshot,
  }
}
