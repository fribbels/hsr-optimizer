import type { Character, CharacterId } from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { Form, Teammate } from 'types/form'
import type { DBMetadataCharacter } from 'types/metadata'
import type { Relic } from 'types/relic'
import type { SavedBuild, SavedTeammate, TeamTuple } from 'types/savedBuild'
import type { HsrOptimizerSaveFormat } from 'types/store'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { migrateNovaflare } from './novaflare'

vi.mock('lib/optimization/defaultForm', () => ({
  getDefaultForm: vi.fn(({ id }: { id: string }) => ({
    characterId: id,
    teammate0: { characterId: '' },
    teammate1: { characterId: '' },
    teammate2: { characterId: '' },
  }) as unknown as Form),
}))

function makeCharacter(id: string, overrides: Partial<Character> = {}): Character {
  return {
    id: id as CharacterId,
    form: {
      characterId: id as CharacterId,
      teammate0: { characterId: '' as CharacterId } as Teammate,
      teammate1: { characterId: '' as CharacterId } as Teammate,
      teammate2: { characterId: '' as CharacterId } as Teammate,
      ...overrides.form as Partial<Form>,
    } as Form,
    equipped: {},
    builds: overrides.builds ?? [],
    portrait: overrides.portrait,
  }
}

function makeRelic(id: string, equippedBy?: string): Relic {
  return {
    id,
    equippedBy: equippedBy as CharacterId | undefined,
    set: 'test',
    part: 'Head',
    enhance: 15,
    grade: 5,
    main: { stat: 'HP', value: 1 },
    substats: [],
  } as unknown as Relic
}

function makeDbCharacters(...ids: string[]): Record<CharacterId, DBMetadataCharacter> {
  const result: Record<string, DBMetadataCharacter> = {}
  for (const id of ids) {
    result[id] = { id, unreleased: false, scoringMetadata: {} } as unknown as DBMetadataCharacter
  }
  return result as Record<CharacterId, DBMetadataCharacter>
}

function makeSaveData(overrides: Partial<HsrOptimizerSaveFormat> = {}): HsrOptimizerSaveFormat {
  return {
    relics: [],
    characters: [],
    ...overrides,
  }
}

function makeBuild(characterId: string, team: (SavedTeammate | null)[] = [null, null, null]): SavedBuild {
  return {
    source: 'Character' as never,
    name: 'test',
    characterId: characterId as CharacterId,
    equipped: {},
    characterEidolon: 0,
    lightCone: '' as never,
    lightConeSuperimposition: 1,
    team: team as TeamTuple<SavedTeammate>,
  }
}

function makeTeammate(characterId: string): SavedTeammate {
  return {
    characterId: characterId as CharacterId,
    characterEidolon: 0,
    lightCone: '' as never,
    lightConeSuperimposition: 1,
    teamRelicSet: undefined,
    teamOrnamentSet: undefined,
  }
}

describe('migrateNovaflare', () => {
  const db = makeDbCharacters('1212', '1212b1', '1004', '1004b1', '1310', '1310b1', '1001')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Case 1: only old exists — creates new, transfers relics, deletes old', () => {
    const saveData = makeSaveData({
      characters: [makeCharacter('1212', { portrait: { url: 'test.png' } as unknown as CustomImageConfig })],
      relics: [
        makeRelic('r1', '1212'),
        makeRelic('r2', '1212'),
        makeRelic('r3', '1001'),
      ],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters).toHaveLength(1)
    expect(saveData.characters[0].id).toBe('1212b1')
    expect(saveData.characters[0].form.characterId).toBe('1212b1')
    expect(saveData.characters[0].portrait).toEqual({ url: 'test.png' })
    expect(saveData.characters[0].builds).toEqual([])

    expect(saveData.relics[0].equippedBy).toBe('1212b1')
    expect(saveData.relics[1].equippedBy).toBe('1212b1')
    expect(saveData.relics[2].equippedBy).toBe('1001')

    expect(saveData.completedMigrations!['novaflare1212']).toBe(1)
  })

  it('Case 2: both exist — keeps both, does not touch relics', () => {
    const saveData = makeSaveData({
      characters: [
        makeCharacter('1212'),
        makeCharacter('1212b1'),
      ],
      relics: [
        makeRelic('r1', '1212'),
        makeRelic('r2', '1212b1'),
      ],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters).toHaveLength(2)
    expect(saveData.characters.find((c) => c.id === '1212')).toBeTruthy()
    expect(saveData.characters.find((c) => c.id === '1212b1')).toBeTruthy()

    expect(saveData.relics[0].equippedBy).toBe('1212')
    expect(saveData.relics[1].equippedBy).toBe('1212b1')

    expect(saveData.completedMigrations!['novaflare1212']).toBe(1)
  })

  it('Case 3: only new exists — no-op', () => {
    const saveData = makeSaveData({
      characters: [makeCharacter('1212b1')],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters).toHaveLength(1)
    expect(saveData.characters[0].id).toBe('1212b1')
    expect(saveData.completedMigrations!['novaflare1212']).toBe(1)
  })

  it('neither exists — no-op', () => {
    const saveData = makeSaveData({
      characters: [],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters).toHaveLength(0)
    expect(saveData.completedMigrations!['novaflare1212']).toBe(1)
  })

  it('already migrated — skips entirely, no mutations', () => {
    const saveData = makeSaveData({
      characters: [makeCharacter('1212')],
      completedMigrations: { novaflare1212: 1 },
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters).toHaveLength(1)
    expect(saveData.characters[0].id).toBe('1212')
  })

  it('sweeps teammate references across all characters', () => {
    const otherChar = makeCharacter('1001', {
      form: {
        characterId: '1001' as CharacterId,
        teammate0: { characterId: '1212' as CharacterId } as Teammate,
        teammate1: { characterId: '1004' as CharacterId } as Teammate,
        teammate2: { characterId: '' as CharacterId } as Teammate,
      } as unknown as Form,
    })

    const saveData = makeSaveData({
      characters: [
        makeCharacter('1212'),
        makeCharacter('1004'),
        otherChar,
      ],
    })

    migrateNovaflare(saveData, db)

    const other = saveData.characters.find((c) => c.id === ('1001' as CharacterId))!
    expect(other.form.teammate0.characterId).toBe('1212b1')
    expect(other.form.teammate1.characterId).toBe('1004b1')
  })

  it('sweeps saved build teammates', () => {
    const build = makeBuild('1001', [
      makeTeammate('1212'),
      null,
      makeTeammate('1310'),
    ])
    const saveData = makeSaveData({
      characters: [makeCharacter('1001', { builds: [build] })],
    })

    migrateNovaflare(saveData, db)

    const builds = saveData.characters[0].builds!
    expect(builds[0].team[0]!.characterId).toBe('1212b1')
    expect(builds[0].team[1]).toBeNull()
    expect(builds[0].team[2]!.characterId).toBe('1310b1')
  })

  it('sweeps scoring metadata override teammates', () => {
    const saveData = makeSaveData({
      characters: [],
      scoringMetadataOverrides: {
        someChar: {
          simulation: {
            teammates: [
              { characterId: '1212' as CharacterId, lightCone: '' as never, characterEidolon: 0, lightConeSuperimposition: 1 },
              { characterId: '1001' as CharacterId, lightCone: '' as never, characterEidolon: 0, lightConeSuperimposition: 1 },
            ],
          },
        } as never,
      },
    })

    migrateNovaflare(saveData, db)

    const teammates = (saveData.scoringMetadataOverrides!.someChar as any).simulation.teammates
    expect(teammates[0].characterId).toBe('1212b1')
    expect(teammates[1].characterId).toBe('1001')
  })

  it('skips unreleased novaflare characters', () => {
    const dbUnreleased: Record<CharacterId, DBMetadataCharacter> = {
      ...makeDbCharacters('1212'),
      ['1212b1' as CharacterId]: { id: '1212b1', unreleased: true, scoringMetadata: {} } as unknown as DBMetadataCharacter,
    }
    const saveData = makeSaveData({
      characters: [makeCharacter('1212')],
    })

    migrateNovaflare(saveData, dbUnreleased)

    expect(saveData.characters[0].id).toBe('1212')
    expect(saveData.completedMigrations!['novaflare1212']).toBeUndefined()
  })

  it('processes multiple pairs in one pass', () => {
    const saveData = makeSaveData({
      characters: [
        makeCharacter('1212'),
        makeCharacter('1004'),
        makeCharacter('1310'),
      ],
      relics: [
        makeRelic('r1', '1212'),
        makeRelic('r2', '1004'),
        makeRelic('r3', '1310'),
      ],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.characters.map((c) => c.id).sort()).toEqual(['1004b1', '1212b1', '1310b1'])
    expect(saveData.relics[0].equippedBy).toBe('1212b1')
    expect(saveData.relics[1].equippedBy).toBe('1004b1')
    expect(saveData.relics[2].equippedBy).toBe('1310b1')
    expect(saveData.completedMigrations!['novaflare1212']).toBe(1)
    expect(saveData.completedMigrations!['novaflare1004']).toBe(1)
    expect(saveData.completedMigrations!['novaflare1310']).toBe(1)
  })

  it('handles null team slots without crashing', () => {
    const build = makeBuild('1001', [null, null, null])
    const saveData = makeSaveData({
      characters: [makeCharacter('1001', { builds: [build] })],
    })

    expect(() => migrateNovaflare(saveData, db)).not.toThrow()
  })

  it('continues other pairs when getDefaultForm throws for one', async () => {
    const mod = await import('lib/optimization/defaultForm')
    const getDefaultForm = vi.mocked(mod.getDefaultForm)
    getDefaultForm.mockImplementationOnce(() => {
      throw new Error('boom')
    })

    // Assert one pair succeeds and one fails regardless of iteration order
    const dbTwo = makeDbCharacters('1212', '1212b1', '1004', '1004b1')
    const saveData = makeSaveData({
      characters: [
        makeCharacter('1212'),
        makeCharacter('1004'),
      ],
    })

    migrateNovaflare(saveData, dbTwo)

    // One pair fails, the other succeeds
    const flags = saveData.completedMigrations!
    const set = Object.keys(flags).filter((k) => flags[k] === 1)
    const unset = ['novaflare1212', 'novaflare1004'].filter((k) => !flags[k])
    expect(set).toHaveLength(1)
    expect(unset).toHaveLength(1)
  })

  it('swaps optimizerCharacterId in session state', () => {
    const saveData = makeSaveData({
      characters: [makeCharacter('1212')],
      savedSession: {
        global: { optimizerCharacterId: '1212' as CharacterId } as never,
        showcaseTab: {} as never,
      },
    })

    migrateNovaflare(saveData, db)

    expect(saveData.savedSession!.global.optimizerCharacterId).toBe('1212b1')
  })

  it('unrelated characters relics are not affected in Case 1', () => {
    const saveData = makeSaveData({
      characters: [
        makeCharacter('1212'),
        makeCharacter('1001'),
      ],
      relics: [
        makeRelic('r1', '1212'),
        makeRelic('r2', '1001'),
        makeRelic('r3'),
      ],
    })

    migrateNovaflare(saveData, db)

    expect(saveData.relics[1].equippedBy).toBe('1001')
    expect(saveData.relics[2].equippedBy).toBeUndefined()
  })
})
