import { collectResults, TestInput, TestResultByName } from 'lib/simulations/tests/simTestUtils'
import DB from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
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
      // @ts-ignore
      const message = error.message
      throw new Error(`
${DB.getMetadata().characters[input.character.characterId].displayName} ${key} ${view}
${message}
${JSON.stringify(input, null, 2)}
      `)
    }
  }
}
