// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { JingYuan } from 'lib/conditionals/character/1200/JingYuan'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/updateTeammate'
import { ExEidolon } from 'types/character'
import {
  beforeEach,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
  useCharacterStore.getState().setCharacters([])
})

test('selection and Sync copy roster EX, including explicit off, without inheriting the previous selection', () => {
  const form = { ...getDefaultForm(JingYuan), characterEx: ExEidolon.EX1 }
  useCharacterStore.getState().setCharacters([{ id: JingYuan.id, form, equipped: {} }])
  updateTeammate({ teammate0: form })
  expect(useOptimizerRequestStore.getState().teammates[0].characterEx).toBe(ExEidolon.EX1)
  useCharacterStore.getState().setCharacter({ id: JingYuan.id, form: { ...form, characterEx: 0 }, equipped: {} })
  updateTeammate({ teammate0: form })
  expect(useOptimizerRequestStore.getState().teammates[0].characterEx).toBe(0)
  useOptimizerRequestStore.getState().setTeammateField(0, 'characterEx', ExEidolon.EX1)
  updateTeammate({ teammate0: getDefaultForm(Kafka) })
  expect(useOptimizerRequestStore.getState().teammates[0].characterEx).toBe(0)
})

test('selection of a supported character absent from the roster clears a previous EX selection', () => {
  useOptimizerRequestStore.getState().setTeammate(0, { characterId: JingYuan.id, characterEx: ExEidolon.EX1 })
  updateTeammate({ teammate0: getDefaultForm(JingYuan) })
  expect(useOptimizerRequestStore.getState().teammates[0].characterEx).toBe(0)
})
