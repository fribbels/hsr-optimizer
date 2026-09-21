// @vitest-environment jsdom
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
} from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { resolveCustomAutofillTeammateIds } from 'lib/tabs/tabTeamShowcase/teamShowcaseScoring'
import type { Character } from 'types/character'
import { ScoringConfigType } from 'types/metadata'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

Metadata.initialize()

const character: Character = {
  id: KafkaB1.id,
  equipped: {},
  form: getDefaultForm({ id: KafkaB1.id }),
}

beforeEach(() => {
  useScoringStore.setState(useScoringStore.getInitialState())
})

describe('resolveCustomAutofillTeammateIds', () => {
  it('returns no autofill source when the active benchmark is Default', () => {
    installReorderedCustomTeam()

    const result = resolveCustomAutofillTeammateIds(
      character,
      { [ScoringConfigType.DPS]: DEFAULT_TEAM },
    )

    expect(result).toEqual([])
  })

  it('returns the active Custom benchmark teammates in benchmark order', () => {
    const expected = installReorderedCustomTeam()

    const result = resolveCustomAutofillTeammateIds(
      character,
      { [ScoringConfigType.DPS]: CUSTOM_TEAM },
    )

    expect(result).toEqual(expected)
  })

  it('finds the Custom DPS team when Substat Score is first in the card display order', () => {
    const expected = installReorderedCustomTeam()

    const result = resolveCustomAutofillTeammateIds(
      character,
      { [ScoringConfigType.DPS]: CUSTOM_TEAM },
    )

    expect(result).toEqual(expected)
  })
})

function installReorderedCustomTeam() {
  const defaultTeammates = getGameMetadata().characters[KafkaB1.id].scoringMetadata.simulation!.teammates
  const customTeammates = [...defaultTeammates].reverse()
  useScoringStore.getState().updateScoringConfigOverride(KafkaB1.id, ScoringConfigType.DPS, {
    teammates: customTeammates,
  })
  return customTeammates.map((teammate) => teammate.characterId)
}
