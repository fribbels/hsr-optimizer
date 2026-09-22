import { editShowcasePreferences } from 'lib/characterPreview/customization/showcaseCustomizationController'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { Message } from 'lib/interactions/message'
import type { ScoringType } from 'lib/scoring/scoringConfig'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  GRID_ELEMENT_ID,
  GRID_SIZE,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseConstants'
import {
  areTeamSlotsEqual,
  autofillTeamSlots,
  buildTeamBenchmarkOverrideVariants,
  captureTeamBenchmarkSnapshot,
  normalizeTeamSlots,
  resolveTeamBenchmarkOverrides,
  sanitizeTeamSlots,
  TeamBenchmarkOverrideStatus,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import {
  resolveCustomAutofillTeammateIds,
  resolveSlotScoring,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import {
  type WorkingTeamState,
  useSavedTeams,
} from 'lib/tabs/tabTeamShowcase/savedTeams/useSavedTeams'
import type {
  TeamShowcaseState,
  TeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type { CharacterOptions } from 'lib/ui/selectors/optionGenerator'
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
import { useShallow } from 'zustand/react/shallow'

const EMPTY_TEAM_SELECTIONS = {}

function selectSlotCharacters(
  slots: TeamSlots,
  charactersById: Partial<Record<CharacterId, Character>>,
): Partial<Record<CharacterId, Character>> {
  const selected: Partial<Record<CharacterId, Character>> = {}
  for (const id of slots) {
    if (!id) continue
    const character = charactersById[id]
    if (character) selected[id] = character
  }
  return selected
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

  const [workingTeam, setWorkingTeam] = useState<WorkingTeamState>(() => ({
    slots: normalizeTeamSlots([]),
  }))
  const selectedCharactersById = useCharacterStore(useShallow((state) =>
    selectSlotCharacters(workingTeam.slots, state.charactersById)
  ))
  const ownedCharacterIds = useCharacterStore(useShallow((s) => s.characters.map((character) => character.id)))
  const slots = useMemo(
    () => sanitizeTeamSlots(workingTeam.slots, selectedCharactersById),
    [workingTeam.slots, selectedCharactersById],
  )
  const selectedCharacters = useMemo<(Character | null)[]>(
    () => slots.map((id) => id ? selectedCharactersById[id] ?? null : null),
    [slots, selectedCharactersById],
  )

  useEffect(() => {
    setWorkingTeam((current) => {
      const sanitized = sanitizeTeamSlots(current.slots, selectedCharactersById)
      if (areTeamSlotsEqual(current.slots, sanitized)) return current
      return { slots: sanitized }
    })
  }, [selectedCharactersById])

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
    const charactersById = useCharacterStore.getState().charactersById
    const selectedCharacter = id ? charactersById[id] : undefined
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
      const filled = id && wasEmpty && index === 0
        ? autofillTeamSlots(next, id, ownedIds, customTeammateIds)
        : next
      if (areTeamSlotsEqual(currentSlots, filled)) return current
      return { slots: filled }
    })
  }, [ownedIds, teamPreferences])

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
      if (!current.benchmarkSnapshot && areTeamSlotsEqual(current.slots, emptySlots)) return current
      return { slots: emptySlots }
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
  const benchmarkOverrideVariants = useMemo(
    () => buildTeamBenchmarkOverrideVariants(workingTeam.benchmarkSnapshot),
    [workingTeam.benchmarkSnapshot],
  )
  const simulationMetadataOverrides = useMemo(
    () => resolveTeamBenchmarkOverrides(slots, benchmarkOverrideVariants),
    [slots, benchmarkOverrideVariants],
  )
  const canSyncBenchmarks = selectedCharacters.every((character) => character != null)
  const hasSyncedBenchmarks = workingTeam.benchmarkSnapshot != null

  const {
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
    applyBenchmarkSnapshot,
  } = useSavedTeams(slots, workingTeam.benchmarkSnapshot, setWorkingTeam)

  const syncBenchmarkTeams = useCallback(() => {
    const result = captureTeamBenchmarkSnapshot(
      selectedCharacters,
      useRelicStore.getState().relicsById,
    )
    if (result.status === TeamBenchmarkOverrideStatus.MISSING_LIGHT_CONE) {
      Message.error(tCharacters('Messages.NoSelectedLightCone'))
      return
    }
    if (result.status !== TeamBenchmarkOverrideStatus.READY || !result.snapshot) return

    applyBenchmarkSnapshot(result.snapshot)
  }, [applyBenchmarkSnapshot, selectedCharacters, tCharacters])

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
    hasSyncedBenchmarks,
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
