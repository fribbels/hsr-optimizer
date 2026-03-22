// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearBuilds, deleteBuild, saveBuild } from './buildService'
import { useCharacterStore, getCharacterById } from 'lib/stores/characterStore'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Metadata } from 'lib/state/metadataInitializer'
import { AppPages, SavedBuildSource } from 'lib/constants/appPages'
import type { Character, SavedBuild } from 'types/character'

// ---- Setup ----

Metadata.initialize()

// ---- Constants ----

const BUILD_NAME_1 = 'DPS Build'
const BUILD_NAME_2 = 'Speed Build'

// ---- Helpers ----

function makeBuild(overrides: Partial<SavedBuild> = {}): SavedBuild {
  return {
    characterId: Kafka.id,
    eidolon: 0,
    lightConeId: '21001' as SavedBuild['lightConeId'],
    superimposition: 1,
    characterConditionals: undefined,
    lightConeConditionals: undefined,
    name: BUILD_NAME_1,
    equipped: {},
    optimizerMetadata: null,
    team: [],
    deprioritizeBuffs: false,
    ...overrides,
  }
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: {
      characterId: Kafka.id,
      characterEidolon: 0,
      characterLevel: 80,
      lightCone: '21001' as Character['form']['lightCone'],
      lightConeLevel: 80,
      lightConeSuperimposition: 1,
    } as Character['form'],
    ...overrides,
  }
}

function seedCharacter(overrides: Partial<Character> = {}) {
  const char = makeCharacter(overrides)
  useCharacterStore.getState().setCharacters([char])
  return char
}

// ---- Reset ----

beforeEach(() => {
  useCharacterStore.setState(useCharacterStore.getInitialState())
})

// ---- Tests ----

describe('buildService', () => {
  describe('saveBuild', () => {
    // CHAR-3: saveBuild does `const builds = character.builds ?? []` — when character.builds
    // exists, builds IS the same array. Then builds.push(build) or builds[idx] = build mutates
    // the store-owned array before setCharacter is called.
    it('saveBuild does not mutate the character\'s existing builds array reference (CHAR-3)', () => {
      const existingBuild = makeBuild({ name: BUILD_NAME_1 })
      seedCharacter({ builds: [existingBuild] })

      // Capture the live builds array reference from the store
      const originalBuilds = getCharacterById(Kafka.id)!.builds!

      // Save a second build (not overwrite) — this should NOT mutate originalBuilds
      saveBuild(BUILD_NAME_2, Kafka.id, SavedBuildSource.SHOWCASE, false)

      // The original array should still have length 1 if it wasn't mutated
      expect(originalBuilds).toHaveLength(1)
    })

    it('saveBuild adds a new build to the character\'s builds list', () => {
      seedCharacter()

      saveBuild(BUILD_NAME_1, Kafka.id, SavedBuildSource.SHOWCASE, false)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_1)
    })

    it('saveBuild with overwriteExisting replaces the matching build by name', () => {
      const existingBuild = makeBuild({ name: BUILD_NAME_1 })
      seedCharacter({ builds: [existingBuild] })

      saveBuild(BUILD_NAME_1, Kafka.id, SavedBuildSource.SHOWCASE, true)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_1)
    })

    it('saveBuild with overwrite returns early when no matching build name exists', () => {
      seedCharacter({ builds: [makeBuild({ name: BUILD_NAME_1 })] })

      const result = saveBuild('Nonexistent', Kafka.id, SavedBuildSource.SHOWCASE, true)

      // Function returns { error } — builds remain unchanged
      expect(result).toBeDefined()
      expect(getCharacterById(Kafka.id)!.builds).toHaveLength(1)
    })

    it('saveBuild without overwrite returns early when build name already exists', () => {
      seedCharacter({ builds: [makeBuild({ name: BUILD_NAME_1 })] })

      const result = saveBuild(BUILD_NAME_1, Kafka.id, SavedBuildSource.SHOWCASE, false)

      // Function returns { error } — builds remain unchanged
      expect(result).toBeDefined()
      expect(getCharacterById(Kafka.id)!.builds).toHaveLength(1)
    })
  })

  describe('deleteBuild', () => {
    it('deleteBuild removes the build with the matching name', () => {
      seedCharacter({ builds: [makeBuild({ name: BUILD_NAME_1 }), makeBuild({ name: BUILD_NAME_2 })] })

      deleteBuild(Kafka.id, BUILD_NAME_1)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_2)
    })
  })

  describe('clearBuilds', () => {
    it('clearBuilds removes all builds from the character', () => {
      seedCharacter({ builds: [makeBuild({ name: BUILD_NAME_1 }), makeBuild({ name: BUILD_NAME_2 })] })

      clearBuilds(Kafka.id)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toEqual([])
    })
  })
})
