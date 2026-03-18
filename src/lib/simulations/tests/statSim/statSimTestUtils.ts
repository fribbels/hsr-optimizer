import i18next from 'i18next'
import {
  collectResults,
  type TestInput,
  type TestResultByName,
} from 'lib/simulations/tests/simTestUtils'
import { Metadata } from 'lib/state/metadataInitializer'
import { expect } from 'vitest'

Metadata.initialize()

export function expectSimResultsToMatch(
  input: TestInput,
  expectedComboBasic: TestResultByName,
  expectedComboCombat: TestResultByName,
) {
  const results = collectResults(input)
  expectSingleResultsToMatch(results.outputBasic, expectedComboBasic, input, 'BASIC')
  expectSingleResultsToMatch(results.outputCombat, expectedComboCombat, input, 'COMBAT')
}

function expectSingleResultsToMatch(actual: TestResultByName, expected: TestResultByName, input: TestInput, view: string) {
  for (const [key, value] of Object.entries(expected)) {
    try {
      expect(actual[key]).toBeCloseTo(value)
    } catch (error: unknown) {
      // @ts-expect-error - Error type narrowing in test assertion
      const message = error.message
      throw new Error(`
${i18next.t(`gameData:Characters.${input.character.characterId}.LongName`)} ${key} ${view}
${message}
${JSON.stringify(input, null, 2)}
      `)
    }
  }
}
