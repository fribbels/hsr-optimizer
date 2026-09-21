import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  loadSavedTeamSlots,
  readSavedTeams,
  writeSavedTeams,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseController'
import { areTeamSlotsEqual } from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { uuid } from 'lib/utils/miscUtils'
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  SavedTeamId,
  TeamShowcaseSavedTeam,
} from 'types/store'

export interface WorkingTeamState {
  slots: TeamSlots
  benchmarkSyncEnabled: boolean
}

export function useSavedTeams(
  slots: TeamSlots,
  benchmarkSyncEnabled: boolean,
  setWorkingTeam: Dispatch<SetStateAction<WorkingTeamState>>,
) {
  const { t } = useTranslation('teamShowcaseTab')
  const savedTeams = useGlobalStore((state) => state.savedSession.teamShowcaseSavedTeams)

  const activeSavedTeamId = useMemo(
    () => savedTeams.find((team) =>
      areTeamSlotsEqual(team.characterIds, slots)
      && Boolean(team.benchmarkSyncEnabled) === benchmarkSyncEnabled
    )?.id ?? null,
    [benchmarkSyncEnabled, savedTeams, slots],
  )

  const saveCurrentTeam = useCallback(() => {
    if (slots.every((id) => id == null)) return

    const teams = readSavedTeams()
    const team: TeamShowcaseSavedTeam = {
      id: uuid(),
      name: t('SavedTeams.DefaultName', { index: teams.length + 1 }),
      characterIds: slots,
      benchmarkSyncEnabled,
    }
    writeSavedTeams([...teams, team])
  }, [benchmarkSyncEnabled, slots, t])

  const loadSavedTeam = useCallback((id: SavedTeamId) => {
    const team = readSavedTeams().find((candidate) => candidate.id === id)
    if (!team) return

    setWorkingTeam({
      slots: loadSavedTeamSlots(team.characterIds),
      benchmarkSyncEnabled: Boolean(team.benchmarkSyncEnabled),
    })
  }, [setWorkingTeam])

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
    const trimmedName = name.trim()
    if (!trimmedName) return

    const teams = readSavedTeams()
    const index = teams.findIndex((team) => team.id === id)
    if (index < 0 || teams[index].name === trimmedName) return

    const next = [...teams]
    next[index] = { ...next[index], name: trimmedName }
    writeSavedTeams(next)
  }, [])

  const markBenchmarksSynced = useCallback(() => {
    setWorkingTeam((current) => ({ ...current, benchmarkSyncEnabled: true }))
    if (!activeSavedTeamId) return

    writeSavedTeams(readSavedTeams().map((team) =>
      team.id === activeSavedTeamId
        ? { ...team, benchmarkSyncEnabled: true }
        : team
    ))
  }, [activeSavedTeamId, setWorkingTeam])

  return {
    savedTeams,
    activeSavedTeamId,
    saveCurrentTeam,
    loadSavedTeam,
    deleteSavedTeam,
    renameSavedTeam,
    moveSavedTeam,
    markBenchmarksSynced,
  }
}

function isSavedTeamIndex(index: number, teams: TeamShowcaseSavedTeam[]): boolean {
  return Number.isInteger(index) && index >= 0 && index < teams.length
}
