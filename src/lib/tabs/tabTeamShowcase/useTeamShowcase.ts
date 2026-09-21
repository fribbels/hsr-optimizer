import { editShowcasePreferences } from 'lib/characterPreview/customization/showcaseCustomizationController'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { Message } from 'lib/interactions/message'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  GRID_ELEMENT_ID,
  GRID_SIZE,
  TEAM_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import {
  loadSavedTeamSlots,
  readSavedTeams,
  writeSavedTeams,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseController'
import {
  areTeamSlotsEqual,
  autofillTeamSlots,
  buildTeamBenchmarkOverrides,
  isSavedTeamIndex,
  normalizeTeamSlots,
  sanitizeTeamSlots,
  TeamBenchmarkOverrideStatus,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import {
  resolveCustomAutofillTeammateIds,
  resolveSlotScoring,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type {
  TeamShowcaseState,
  TeamSlots,
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
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'
import { useShallow } from 'zustand/react/shallow'

const EMPTY_TEAM_SELECTIONS = {}
const EMPTY_BENCHMARK_OVERRIDES: TeamShowcaseState['simulationMetadataOverrides'] = Array.from({ length: TEAM_SIZE })

interface WorkingTeamState {
  slots: TeamSlots
  benchmarkSyncEnabled: boolean
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

  const savedTeams = useGlobalStore((s) => s.savedSession.teamShowcaseSavedTeams)
  const [workingTeam, setWorkingTeam] = useState<WorkingTeamState>(() => ({
    slots: normalizeTeamSlots([]),
    benchmarkSyncEnabled: false,
  }))
  const charactersById = useCharacterStore((s) => s.charactersById)
  const relicsById = useRelicStore((s) => s.relicsById)
  const ownedCharacterIds = useCharacterStore(useShallow((s) => s.characters.map((character) => character.id)))
  const slots = useMemo(() => sanitizeTeamSlots(workingTeam.slots, charactersById), [workingTeam.slots, charactersById])
  const selectedCharacters = useMemo<(Character | null)[]>(
    () => slots.map((id) => id ? charactersById[id] ?? null : null),
    [slots, charactersById],
  )

  useEffect(() => {
    setWorkingTeam((current) => {
      const sanitized = sanitizeTeamSlots(current.slots, charactersById)
      if (areTeamSlotsEqual(current.slots, sanitized)) return current
      return { slots: sanitized, benchmarkSyncEnabled: false }
    })
  }, [charactersById])

  const characters = useMemo(
    () => activated ? selectedCharacters : selectedCharacters.map(() => null),
    [activated, selectedCharacters],
  )

  const ownedIds = useMemo(
    () => new Set(ownedCharacterIds),
    [ownedCharacterIds],
  )

  const optionFilter = useCallback(
    (option: CharacterOptions[CharacterId]) => ownedIds.has(option.id),
    [ownedIds],
  )

  const { teamPreferences, showcasePreferences } = useShowcaseTabStore(useShallow((s) => ({
    teamPreferences: s.showcaseTeamPreferenceByConfig,
    showcasePreferences: s.showcasePreferences,
  })))

  const setSlot = useCallback((index: number, id: CharacterId | null) => {
    const shouldAutofill = id != null && slots.every((existing) => existing == null)
    const selectedCharacter = shouldAutofill ? charactersById[id] : undefined
    const customTeammateIds = selectedCharacter
      ? resolveCustomAutofillTeammateIds(
        selectedCharacter,
        teamPreferences[selectedCharacter.id] ?? EMPTY_TEAM_SELECTIONS,
      )
      : []

    setWorkingTeam((current) => {
      const currentSlots = sanitizeTeamSlots(current.slots, charactersById)
      const next = currentSlots.map((existing, i) => {
        if (i === index) return id
        // The same character can't fill two slots
        return existing === id ? null : existing
      })
      const wasEmpty = currentSlots.every((existing) => existing == null)
      const filled = id && wasEmpty
        ? autofillTeamSlots(next, id, ownedIds, customTeammateIds)
        : next
      if (areTeamSlotsEqual(currentSlots, filled)) return current
      return { slots: filled, benchmarkSyncEnabled: false }
    })
  }, [charactersById, ownedIds, showcasePreferences, slots, teamPreferences])

  /**
   * Writes every position at once. setSlot cannot express a rearrangement: it clears any other slot
   * holding the same character, so moving characters one at a time would empty the ones it passes over.
   */
  const reorderSlots = useCallback((order: number[]) => {
    setWorkingTeam((current) => {
      const next = normalizeTeamSlots(order.map((source) => current.slots[source] ?? null))
      if (areTeamSlotsEqual(current.slots, next)) return current
      return { ...current, slots: next }
    })
  }, [])

  const clearTeam = useCallback(() => {
    setWorkingTeam((current) => {
      const emptySlots = normalizeTeamSlots([])
      if (!current.benchmarkSyncEnabled && areTeamSlotsEqual(current.slots, emptySlots)) return current
      return { slots: emptySlots, benchmarkSyncEnabled: false }
    })
  }, [])

  // ----- Per-slot scoring -----
  const slotScoring = useMemo(
    () =>
      slots.map((id, index) => {
        const character = id ? selectedCharacters[index] : null
        if (!character) return null
        return resolveSlotScoring(
          character,
          teamPreferences[character.id] ?? EMPTY_TEAM_SELECTIONS,
          showcasePreferences[character.id]?.scoringType,
          tCharacters,
        )
      }),
    [slots, selectedCharacters, teamPreferences, showcasePreferences, tCharacters],
  )

  const setSlotScoringType = useCallback((index: number, scoringType: ScoringType) => {
    const id = slots[index]
    if (!id) return
    editShowcasePreferences(id, { scoringType })
  }, [slots])

  // ----- Team-local benchmark overrides -----
  const simulationMetadataOverrides = useMemo(
    () =>
      workingTeam.benchmarkSyncEnabled
        ? buildTeamBenchmarkOverrides(selectedCharacters, relicsById).overridesBySlot
        : EMPTY_BENCHMARK_OVERRIDES,
    [selectedCharacters, relicsById, workingTeam.benchmarkSyncEnabled],
  )
  const canSyncBenchmarks = selectedCharacters.every((character) => character != null)

  // ----- Saved teams -----
  const activeSavedTeamId = useMemo(
    () =>
      savedTeams.find((team) =>
        areTeamSlotsEqual(team.characterIds, slots)
        && Boolean(team.benchmarkSyncEnabled) === workingTeam.benchmarkSyncEnabled
      )?.id ?? null,
    [savedTeams, slots, workingTeam.benchmarkSyncEnabled],
  )

  const saveCurrentTeam = useCallback(() => {
    if (slots.every((id) => id == null)) return
    const teams = readSavedTeams()
    const team: TeamShowcaseSavedTeam = {
      id: uuid(),
      name: t('SavedTeams.DefaultName', { index: teams.length + 1 }),
      characterIds: slots,
      benchmarkSyncEnabled: workingTeam.benchmarkSyncEnabled,
    }
    writeSavedTeams([...teams, team])
  }, [slots, t, workingTeam.benchmarkSyncEnabled])

  const loadSavedTeam = useCallback((id: SavedTeamId) => {
    const team = readSavedTeams().find((candidate) => candidate.id === id)
    if (!team) return
    setWorkingTeam({
      slots: loadSavedTeamSlots(team.characterIds),
      benchmarkSyncEnabled: Boolean(team.benchmarkSyncEnabled),
    })
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
    const teams = readSavedTeams()
    const index = teams.findIndex((team) => team.id === id)
    if (index < 0 || teams[index].name === trimmed) return

    const next = [...teams]
    next[index] = { ...next[index], name: trimmed }
    writeSavedTeams(next)
  }, [])

  const syncBenchmarkTeams = useCallback(() => {
    const validation = buildTeamBenchmarkOverrides(
      selectedCharacters,
      relicsById,
    )
    if (validation.status === TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE) {
      Message.error(tCharacters('Messages.NoSelectedLightCone'))
      return
    }
    if (validation.status !== TeamBenchmarkOverrideStatus.READY) return

    setWorkingTeam((current) => ({ ...current, benchmarkSyncEnabled: true }))
    if (!activeSavedTeamId) return
    writeSavedTeams(
      readSavedTeams().map((team) =>
        team.id === activeSavedTeamId
          ? { ...team, benchmarkSyncEnabled: true }
          : team
      ),
    )
  }, [activeSavedTeamId, relicsById, selectedCharacters, tCharacters])

  // ----- Screenshot -----
  const { activeAction: activeScreenshotAction, trigger } = useScreenshotAction(GRID_ELEMENT_ID, GRID_SIZE)
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
    simulationMetadataOverrides,
    setSlotScoringType,
    canSyncBenchmarks,
    syncBenchmarkTeams,
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
    activeScreenshotAction,
    screenshot,
  }
}
