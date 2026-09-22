import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  loadSavedTeamSlots,
  readSavedTeams,
  writeSavedTeams,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseController'
import {
  areBenchmarkSnapshotsEqual,
  areTeamSlotsEqual,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseModel'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { uuid } from 'lib/utils/miscUtils'
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  SavedTeamId,
  TeamShowcaseBenchmarkSnapshot,
  TeamShowcaseSavedTeam,
} from 'types/store'

export interface WorkingTeamState {
  slots: TeamSlots
  benchmarkSnapshot?: TeamShowcaseBenchmarkSnapshot
}

export function useSavedTeams(
  slots: TeamSlots,
  benchmarkSnapshot: TeamShowcaseBenchmarkSnapshot | undefined,
  setWorkingTeam: Dispatch<SetStateAction<WorkingTeamState>>,
) {
  const { t } = useTranslation('teamShowcaseTab')
  const savedTeams = useGlobalStore((state) => state.savedSession.teamShowcaseSavedTeams)
  const [selectedSavedTeamId, setSelectedSavedTeamId] = useState<SavedTeamId | null>(null)

  const matchingSavedTeams = useMemo(
    () => savedTeams.filter((team) =>
      areTeamSlotsEqual(team.characterIds, slots)
      && areBenchmarkSnapshotsEqual(team.benchmarkSnapshot, benchmarkSnapshot)
    ),
    [benchmarkSnapshot, savedTeams, slots],
  )
  const activeSavedTeamId = useMemo(() => {
    const selectedTeam = matchingSavedTeams.find((team) => team.id === selectedSavedTeamId)
    if (selectedTeam) return selectedTeam.id
    return matchingSavedTeams.length === 1 ? matchingSavedTeams[0].id : null
  }, [matchingSavedTeams, selectedSavedTeamId])

  const saveCurrentTeam = useCallback(() => {
    if (slots.every((id) => id == null)) return

    const teams = readSavedTeams()
    const team: TeamShowcaseSavedTeam = {
      id: uuid(),
      name: t('SavedTeams.DefaultName', { index: teams.length + 1 }),
      characterIds: slots,
      benchmarkSnapshot,
    }
    writeSavedTeams([...teams, team])
    setSelectedSavedTeamId(team.id)
  }, [benchmarkSnapshot, slots, t])

  const loadSavedTeam = useCallback((id: SavedTeamId) => {
    const team = readSavedTeams().find((candidate) => candidate.id === id)
    if (!team) return

    const loadedSlots = loadSavedTeamSlots(team.characterIds)
    setSelectedSavedTeamId(team.id)
    setWorkingTeam({
      slots: loadedSlots,
      benchmarkSnapshot: areTeamSlotsEqual(loadedSlots, team.characterIds)
        ? team.benchmarkSnapshot
        : undefined,
    })
  }, [setWorkingTeam])

  const deleteSavedTeam = useCallback((id: SavedTeamId) => {
    writeSavedTeams(readSavedTeams().filter((team) => team.id !== id))
    setSelectedSavedTeamId((selectedId) => selectedId === id ? null : selectedId)
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

  const applyBenchmarkSnapshot = useCallback((snapshot: TeamShowcaseBenchmarkSnapshot) => {
    setWorkingTeam((current) =>
      areBenchmarkSnapshotsEqual(current.benchmarkSnapshot, snapshot)
        ? current
        : { ...current, benchmarkSnapshot: snapshot }
    )
    if (!activeSavedTeamId) return

    writeSavedTeams(readSavedTeams().map((team) =>
      team.id === activeSavedTeamId
        ? { ...team, benchmarkSnapshot: snapshot }
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
    applyBenchmarkSnapshot,
  }
}

function isSavedTeamIndex(index: number, teams: TeamShowcaseSavedTeam[]): boolean {
  return Number.isInteger(index) && index >= 0 && index < teams.length
}
