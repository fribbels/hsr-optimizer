import {
  type CharacterRefreshHistory,
  mergePublicCharacterRefresh,
  readCharacterRefreshHistory,
  selectOldestCharacter,
  writeCharacterRefreshHistory,
} from 'leaderboard/pipeline/characterRefresh'
import {
  joinPath,
  removeDirectory,
  tmpDir,
} from 'leaderboard/shared/nodeFacade'
import type { CharacterId } from 'types/character'
import {
  describe,
  expect,
  test,
} from 'vitest'

const ARCHER = '1000' as CharacterId
const SEELE = '1102' as CharacterId
const JINGLIU = '1212' as CharacterId

describe('character refresh rotation', () => {
  test('preserves untouched compressed public data and team order exactly', () => {
    const previous = { generatedAt: 'before', characters: { [ARCHER]: 'old-archer', [SEELE]: 'original-team-order' } }
    const refreshed = { generatedAt: 'after', characters: { [ARCHER]: 'new-archer', [SEELE]: 'different-team-order' } }
    expect(mergePublicCharacterRefresh(previous, refreshed, ARCHER)).toEqual({
      generatedAt: 'after',
      characters: { [ARCHER]: 'new-archer', [SEELE]: 'original-team-order' },
    })
    expect(previous.characters[ARCHER]).toBe('old-archer')
  })
  test('prioritizes never refreshed characters, then oldest successful completion', () => {
    const now = new Date(2026, 8, 7, 4)
    const history: CharacterRefreshHistory = {
      [ARCHER]: { completedAt: new Date(2026, 8, 6, 8).toISOString(), cacheVersion: 'archer' },
      [SEELE]: { completedAt: new Date(2026, 8, 5, 8).toISOString(), cacheVersion: 'seele' },
    }
    expect(selectOldestCharacter([ARCHER, SEELE, JINGLIU], history, now)).toBe(JINGLIU)
    expect(selectOldestCharacter([ARCHER, SEELE], history, now)).toBe(SEELE)
    // A character no longer eligible must not be selected from history alone.
    expect(selectOldestCharacter([ARCHER], history, now)).toBe(ARCHER)
  })

  test('does not refresh a completed character again on the same local day', () => {
    const now = new Date(2026, 8, 7, 8)
    const history: CharacterRefreshHistory = {
      [ARCHER]: { completedAt: new Date(2026, 8, 7, 5).toISOString(), cacheVersion: 'completed' },
    }
    expect(selectOldestCharacter([ARCHER], history, now)).toBeUndefined()
    expect(selectOldestCharacter([ARCHER], history, new Date(2026, 8, 8, 4))).toBe(ARCHER)
  })

  test('only saved successful refreshes activate replacement cache versions', () => {
    const dir = joinPath(tmpDir(), `leaderboard-refresh-${Date.now()}-${Math.random()}`)
    const dbPath = joinPath(dir, 'scores.sqlite')
    try {
      expect(readCharacterRefreshHistory(dbPath)).toEqual({})
      const history: CharacterRefreshHistory = {
        [ARCHER]: { completedAt: '2026-09-06T12:00:00Z', cacheVersion: 'completed' },
      }
      writeCharacterRefreshHistory(dbPath, history)
      const inProgress = readCharacterRefreshHistory(dbPath)
      inProgress[ARCHER] = { completedAt: '2026-09-07T12:00:00Z', cacheVersion: 'interrupted' }
      expect(readCharacterRefreshHistory(dbPath)).toEqual(history)
      writeCharacterRefreshHistory(dbPath, inProgress)
      expect(readCharacterRefreshHistory(dbPath)).toEqual(inProgress)
    } finally {
      removeDirectory(dir)
    }
  })
})
