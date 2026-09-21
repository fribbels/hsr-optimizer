// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Metadata } from 'lib/state/metadataInitializer'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import {
  loadTeamSlots,
  writeSavedTeams,
  writeTeamSlots,
} from 'lib/tabs/tabTeamShowcase/teamShowcaseController'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { TeamShowcaseSavedTeam } from 'types/store'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

// Safe test fixture: this deliberately represents a character removed from the owned roster.
const REMOVED_CHARACTER_ID = '9999' as CharacterId
const SAVED_TEAM_ID = 'saved-team-1'

Metadata.initialize()

function makeCharacter(): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: {} as Character['form'],
  }
}

beforeEach(() => {
  useGlobalStore.setState(useGlobalStore.getInitialState())
  useCharacterStore.setState(useCharacterStore.getInitialState())
  useCharacterStore.getState().setCharacters([makeCharacter()])
  vi.spyOn(SaveState, 'delayedSave').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('teamShowcaseController', () => {
  it('restores missing saved-team characters at E0 without a light cone', () => {
    loadTeamSlots([Kafka.id, Jingliu.id, null, null])

    const state = useCharacterStore.getState()
    const restored = state.charactersById[Jingliu.id]
    expect(state.characters.map((character) => character.id)).toEqual([Jingliu.id, Kafka.id])
    expect(restored?.form.characterEidolon).toBe(0)
    expect(restored?.form.lightCone).toBeUndefined()
    expect(restored?.equipped).toEqual({})
    expect(useGlobalStore.getState().savedSession.teamShowcaseCharacterIds).toEqual([
      Kafka.id,
      Jingliu.id,
      null,
      null,
    ])
    expect(SaveState.delayedSave).toHaveBeenCalledTimes(1)
  })

  it('sanitizes live slots without mutating a saved-team snapshot', () => {
    const snapshot: TeamSlots = [Kafka.id, REMOVED_CHARACTER_ID]

    writeTeamSlots(snapshot)

    expect(useGlobalStore.getState().savedSession.teamShowcaseCharacterIds).toEqual([
      Kafka.id,
      null,
      null,
      null,
    ])
    expect(snapshot).toEqual([Kafka.id, REMOVED_CHARACTER_ID])
  })

  it('skips persistence when sanitized slots are unchanged', () => {
    const slots: TeamSlots = [Kafka.id, REMOVED_CHARACTER_ID]

    writeTeamSlots(slots)
    const savedSession = useGlobalStore.getState().savedSession
    writeTeamSlots(slots)

    expect(SaveState.delayedSave).toHaveBeenCalledTimes(1)
    expect(useGlobalStore.getState().savedSession).toBe(savedSession)
  })

  it('skips structurally identical saved-team writes', () => {
    const team: TeamShowcaseSavedTeam = {
      id: SAVED_TEAM_ID,
      name: 'Team 1',
      characterIds: [Kafka.id, null, null, null],
    }

    writeSavedTeams([team])
    const savedSession = useGlobalStore.getState().savedSession
    writeSavedTeams([{ ...team, characterIds: [...team.characterIds] }])

    expect(SaveState.delayedSave).toHaveBeenCalledTimes(1)
    expect(useGlobalStore.getState().savedSession).toBe(savedSession)
  })
})
