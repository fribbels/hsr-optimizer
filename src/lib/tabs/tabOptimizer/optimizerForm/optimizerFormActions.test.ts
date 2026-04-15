// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  getCharacterById,
  useCharacterStore,
} from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import type { Character } from 'types/character'
import type { Form } from 'types/form'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  resetFilters,
  updateCharacter,
} from './optimizerFormActions'

// ---- Mocks ----

vi.mock('lib/tabs/tabOptimizer/optimizerTabController', () => ({
  OptimizerTabController: { setRows: vi.fn(), resetDataSource: vi.fn() },
}))

vi.mock('lib/stores/gridStore', () => ({
  gridStore: { optimizerGridApi: vi.fn(() => null) },
}))

vi.mock('lib/optimization/context/calculateContext', () => ({
  generateContext: vi.fn(),
}))

vi.mock('lib/optimization/optimizer', () => ({
  calculateCurrentlyEquippedRow: vi.fn(),
  Optimizer: {},
}))

// ---- Setup ----

Metadata.initialize()

// ---- Helpers ----

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: {},
    form: {
      characterId: Kafka.id,
      characterEidolon: 0,
      characterLevel: 80,
      lightCone: '21001',
      lightConeLevel: 80,
      lightConeSuperimposition: 1,
      characterConditionals: { existingKey: 1 },
    } as unknown as Character['form'],
    builds: [],
    ...overrides,
  }
}

// ---- Reset ----

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
  useCharacterStore.setState(useCharacterStore.getInitialState())
})

// ---- Tests ----

describe('optimizerFormActions', () => {
  describe('updateCharacter does not mutate store character', () => {
    it('does not mutate the character store\'s form.characterConditionals', () => {
      const char = makeCharacter()
      useCharacterStore.getState().setCharacters([char])

      const condsBefore = { ...getCharacterById(Kafka.id)!.form.characterConditionals }

      updateCharacter(Kafka.id)

      // The character store's conditionals must not have been mutated
      const condsAfter = getCharacterById(Kafka.id)!.form.characterConditionals
      expect(condsAfter).toEqual(condsBefore)
    })
  })

  describe('resetFilters preserves non-filter state', () => {
    it('preserves conditionals, teammates, and combo state while resetting filters', () => {
      // Set up non-filter state
      useOptimizerRequestStore.setState({
        characterId: Kafka.id,
        characterEidolon: 4,
        characterConditionals: { ability1: true },
        lightConeConditionals: { passive1: 3 },
        comboStateJson: '{"rotation":[1,2]}',
        comboType: ComboType.ADVANCED,
      })

      // Set up filter state that should be reset
      useOptimizerRequestStore.setState({
        enhance: 15,
        grade: 4,
        mainBody: ['HP%'],
      })

      resetFilters()

      const s = useOptimizerRequestStore.getState()

      // Non-filter state preserved
      expect(s.characterConditionals).toEqual({ ability1: true })
      expect(s.lightConeConditionals).toEqual({ passive1: 3 })
      expect(s.comboStateJson).toBe('{"rotation":[1,2]}')
      expect(s.comboType).toBe(ComboType.ADVANCED)
      expect(s.characterId).toBe(Kafka.id)
      expect(s.characterEidolon).toBe(4)

      // Filter state reset to defaults
      expect(s.enhance).toBe(9)
      expect(s.grade).toBe(5)
      expect(s.mainBody).toEqual([])
    })
  })
})
