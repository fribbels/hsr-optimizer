// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearBuilds, deleteBuild, loadBuildInOptimizer, saveBuild } from './buildService'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Metadata } from 'lib/state/metadataInitializer'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { createDefaultFormState } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { Character } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { Teammate } from 'types/form'
import {
  BuildSource,
  type CharacterSavedBuild,
  type OptimizerSavedBuild,
  type SavedBuild,
} from 'types/savedBuild'

// ---- Mocks ----

vi.mock('lib/state/saveState', () => ({
  SaveState: { delayedSave: vi.fn() },
}))

// ---- Setup ----

Metadata.initialize()

// ---- Constants ----

const BUILD_NAME_1 = 'DPS Build'
const BUILD_NAME_2 = 'Speed Build'

// ---- Helpers ----

function makeCharacterBuild(overrides: Partial<CharacterSavedBuild> = {}): CharacterSavedBuild {
  return {
    source: BuildSource.Character,
    characterId: Kafka.id,
    characterEidolon: 0,
    lightCone: '21001' as LightConeId,
    lightConeSuperimposition: 1,
    name: BUILD_NAME_1,
    equipped: {},
    team: [null, null, null],
    ...overrides,
  }
}

function makeOptimizerBuild(overrides: Partial<OptimizerSavedBuild> = {}): OptimizerSavedBuild {
  return {
    source: BuildSource.Optimizer,
    characterId: Kafka.id,
    characterEidolon: 0,
    lightCone: '21001' as LightConeId,
    lightConeSuperimposition: 1,
    name: BUILD_NAME_1,
    equipped: {},
    team: [null, null, null],
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: createDefaultFormState().setConditionals,
    comboType: ComboType.SIMPLE,
    comboStateJson: '{}',
    comboPreprocessor: true,
    comboTurnAbilities: [],
    deprioritizeBuffs: false,
    ...overrides,
  }
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: {
      ...createDefaultFormState(),
      characterId: Kafka.id,
      lightCone: '21001' as LightConeId,
      resultMinFilter: 0,
      ornamentSets: [],
      relicSets: [],
      teammate0: {} as Teammate,
      teammate1: {} as Teammate,
      teammate2: {} as Teammate,
    } as unknown as Character['form'],
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
    it('does not mutate the character\'s existing builds array reference', () => {
      const existingBuild = makeCharacterBuild({ name: BUILD_NAME_1 })
      seedCharacter({ builds: [existingBuild] })

      const originalBuilds = getCharacterById(Kafka.id)!.builds!

      saveBuild(BUILD_NAME_2, Kafka.id, BuildSource.Character, false)

      expect(originalBuilds).toHaveLength(1)
    })

    it('adds a new build to the character\'s builds list', () => {
      seedCharacter()

      saveBuild(BUILD_NAME_1, Kafka.id, BuildSource.Character, false)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_1)
    })

    it('with overwrite replaces the matching build by name', () => {
      const existingBuild = makeCharacterBuild({ name: BUILD_NAME_1 })
      seedCharacter({ builds: [existingBuild] })

      saveBuild(BUILD_NAME_1, Kafka.id, BuildSource.Character, true)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_1)
    })

    it('with overwrite returns error when no matching build name exists', () => {
      seedCharacter({ builds: [makeCharacterBuild({ name: BUILD_NAME_1 })] })

      const result = saveBuild('Nonexistent', Kafka.id, BuildSource.Character, true)

      expect(result).toBeDefined()
      expect(getCharacterById(Kafka.id)!.builds).toHaveLength(1)
    })

    it('without overwrite returns error when build name already exists', () => {
      seedCharacter({ builds: [makeCharacterBuild({ name: BUILD_NAME_1 })] })

      const result = saveBuild(BUILD_NAME_1, Kafka.id, BuildSource.Character, false)

      expect(result).toBeDefined()
      expect(getCharacterById(Kafka.id)!.builds).toHaveLength(1)
    })

    it('from optimizer: empty teammate slots become null in team tuple', () => {
      seedCharacter()

      useOptimizerRequestStore.setState({
        characterId: Kafka.id,
        characterEidolon: 0,
        lightCone: '21001' as any,
        lightConeSuperimposition: 1,
        teammates: [
          { characterId: Jingliu.id, characterEidolon: 0, lightCone: '21001' as any, lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} } as any,
          { characterId: undefined, characterEidolon: 0, lightCone: undefined, lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} } as any,
          { characterId: undefined, characterEidolon: 0, lightCone: undefined, lightConeSuperimposition: 1, characterConditionals: {}, lightConeConditionals: {} } as any,
        ],
      })

      saveBuild(BUILD_NAME_1, Kafka.id, BuildSource.Optimizer, false)

      const build = getCharacterById(Kafka.id)!.builds![0]
      expect(build.team[0]).not.toBeNull()
      expect(build.team[0]!.characterId).toBe(Jingliu.id)
      expect(build.team[1]).toBeNull()
      expect(build.team[2]).toBeNull()
    })
  })

  describe('loadBuildInOptimizer', () => {
    it('resets form fields before applying build patch', () => {
      seedCharacter()

      useOptimizerRequestStore.setState({ enemyLevel: 999 })

      const build = makeOptimizerBuild()

      loadBuildInOptimizer(build)

      const state = useOptimizerRequestStore.getState()
      expect(state.enemyLevel).not.toBe(999)
    })

    it('loads SIMPLE comboType when comboType is SIMPLE', () => {
      seedCharacter()

      const build = makeOptimizerBuild({ comboType: ComboType.SIMPLE })

      loadBuildInOptimizer(build)

      expect(useOptimizerRequestStore.getState().comboType).toBe(ComboType.SIMPLE)
    })

    it('character build: only applies LC and eidolon overrides', () => {
      seedCharacter()

      const build = makeCharacterBuild({
        characterEidolon: 4,
        lightCone: '21002' as LightConeId,
        lightConeSuperimposition: 3,
      })

      loadBuildInOptimizer(build)

      const state = useOptimizerRequestStore.getState()
      expect(state.characterEidolon).toBe(4)
      expect(state.lightCone).toBe('21002')
      expect(state.lightConeSuperimposition).toBe(3)
    })
  })

  describe('deleteBuild', () => {
    it('removes the build with the matching name', () => {
      seedCharacter({ builds: [makeCharacterBuild({ name: BUILD_NAME_1 }), makeCharacterBuild({ name: BUILD_NAME_2 })] })

      deleteBuild(Kafka.id, BUILD_NAME_1)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toHaveLength(1)
      expect(character.builds![0].name).toBe(BUILD_NAME_2)
    })
  })

  describe('clearBuilds', () => {
    it('removes all builds from the character', () => {
      seedCharacter({ builds: [makeCharacterBuild({ name: BUILD_NAME_1 }), makeCharacterBuild({ name: BUILD_NAME_2 })] })

      clearBuilds(Kafka.id)

      const character = getCharacterById(Kafka.id)!
      expect(character.builds).toEqual([])
    })
  })
})
