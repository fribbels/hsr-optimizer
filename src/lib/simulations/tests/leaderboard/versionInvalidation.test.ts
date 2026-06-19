import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import type { CharacterId } from 'types/character'
import {
  describe,
  expect,
  test,
} from 'vitest'
import type { LeaderboardVersionFile } from '../../../../../scripts/leaderboard/shared/types'
import {
  collectAffectedCharacterIds,
  collectBumpedIds,
} from '../../../../../scripts/leaderboard/shared/versioning'

Metadata.initialize()

function versions(overrides?: Partial<LeaderboardVersionFile>): LeaderboardVersionFile {
  return {
    global: 0,
    characters: {},
    lightCones: {},
    ...overrides,
  }
}

describe('collectBumpedIds', () => {
  test('returns empty sets when no previous versions exist', () => {
    const result = collectBumpedIds(undefined, versions({ characters: { '1405': 1 } }))
    expect(result.characterIds.size).toBe(0)
    expect(result.lightConeIds.size).toBe(0)
  })

  test('returns empty sets when versions are identical', () => {
    const v = versions({ characters: { '1405': 1 }, lightCones: { '23022': 1 } })
    const result = collectBumpedIds(v, v)
    expect(result.characterIds.size).toBe(0)
    expect(result.lightConeIds.size).toBe(0)
  })

  test('detects bumped character version', () => {
    const prev = versions({ characters: { '1405': 1 } })
    const curr = versions({ characters: { '1405': 2 } })
    const result = collectBumpedIds(prev, curr)
    expect(result.characterIds).toEqual(new Set(['1405']))
    expect(result.lightConeIds.size).toBe(0)
  })

  test('detects bumped light cone version', () => {
    const prev = versions({ lightCones: { '23022': 0 } })
    const curr = versions({ lightCones: { '23022': 1 } })
    const result = collectBumpedIds(prev, curr)
    expect(result.characterIds.size).toBe(0)
    expect(result.lightConeIds).toEqual(new Set(['23022']))
  })

  test('detects new character version not in previous', () => {
    const prev = versions()
    const curr = versions({ characters: { '1405': 1 } })
    const result = collectBumpedIds(prev, curr)
    expect(result.characterIds).toEqual(new Set(['1405']))
  })

  test('detects multiple bumps across characters and light cones', () => {
    const prev = versions({ characters: { '1405': 1, '1308': 1 }, lightCones: { '23022': 1 } })
    const curr = versions({ characters: { '1405': 2, '1308': 1 }, lightCones: { '23022': 2 } })
    const result = collectBumpedIds(prev, curr)
    expect(result.characterIds).toEqual(new Set(['1405']))
    expect(result.lightConeIds).toEqual(new Set(['23022']))
  })

  test('ignores unchanged versions', () => {
    const prev = versions({ characters: { '1405': 1, '1308': 1 } })
    const curr = versions({ characters: { '1405': 1, '1308': 1 } })
    const result = collectBumpedIds(prev, curr)
    expect(result.characterIds.size).toBe(0)
  })
})

describe('collectAffectedCharacterIds', () => {
  test('returns empty set when no bumps', () => {
    const result = collectAffectedCharacterIds(new Set(), new Set())
    expect(result.size).toBe(0)
  })

  test('includes directly bumped character', () => {
    const result = collectAffectedCharacterIds(new Set(['1405']), new Set())
    expect(result.has('1405')).toBe(true)
  })

  test('includes characters that use a bumped character as teammate', () => {
    const characters = getGameMetadata().characters
    const sundayId = '1313'

    const useSundayAsTeammate = Object.entries(characters).filter(([, meta]) => {
      const scoring = meta?.scoringMetadata
      if (!scoring) return false
      const sims = [scoring.simulation, scoring.supportSimulation, scoring.healSimulation, scoring.shieldSimulation]
      return sims.some((sim) =>
        sim?.teammates.some((t) => t.characterId === sundayId)
        || sim?.leaderboardTeams?.some((team) => team.teammates.some((t) => t.characterId === sundayId as CharacterId))
      )
    }).map(([id]) => id)

    expect(useSundayAsTeammate.length).toBeGreaterThan(0)

    const result = collectAffectedCharacterIds(new Set([sundayId]), new Set())

    expect(result.has(sundayId)).toBe(true)
    for (const charId of useSundayAsTeammate) {
      expect(result.has(charId)).toBe(true)
    }
  })

  test('includes characters that use a bumped light cone as teammate equipment', () => {
    const characters = getGameMetadata().characters

    let targetLcId: string | null = null
    let expectedCharId: string | null = null

    for (const [charId, meta] of Object.entries(characters)) {
      const scoring = meta?.scoringMetadata
      if (!scoring) continue
      const sims = [scoring.simulation, scoring.supportSimulation, scoring.healSimulation, scoring.shieldSimulation]
      for (const sim of sims) {
        if (!sim) continue
        for (const teammate of sim.teammates) {
          if (teammate.lightCone) {
            targetLcId = teammate.lightCone
            expectedCharId = charId
            break
          }
        }
        if (targetLcId) break
      }
      if (targetLcId) break
    }

    expect(targetLcId).not.toBeNull()
    expect(expectedCharId).not.toBeNull()

    const result = collectAffectedCharacterIds(new Set(), new Set([targetLcId!]))
    expect(result.has(expectedCharId!)).toBe(true)
  })

  test('does not include characters with no scoring metadata', () => {
    const result = collectAffectedCharacterIds(new Set(['9999']), new Set())
    expect(result.has('9999')).toBe(true)

    const characters = getGameMetadata().characters
    const noScoringChar = Object.entries(characters).find(([, meta]) => !meta?.scoringMetadata)
    if (noScoringChar) {
      expect(result.has(noScoringChar[0])).toBe(false)
    }
  })

  test('does not include unrelated characters', () => {
    const characters = getGameMetadata().characters
    const sundayId = '1313'

    const result = collectAffectedCharacterIds(new Set([sundayId]), new Set())

    const unrelated = Object.entries(characters).filter(([charId, meta]) => {
      if (charId === sundayId) return false
      const scoring = meta?.scoringMetadata
      if (!scoring) return false
      const sims = [scoring.simulation, scoring.supportSimulation, scoring.healSimulation, scoring.shieldSimulation]
      return !sims.some((sim) =>
        sim?.teammates.some((t) => t.characterId === sundayId)
        || sim?.leaderboardTeams?.some((team) => team.teammates.some((t) => t.characterId === sundayId as CharacterId))
      )
    }).map(([id]) => id)

    for (const charId of unrelated) {
      expect(result.has(charId)).toBe(false)
    }
  })
})
