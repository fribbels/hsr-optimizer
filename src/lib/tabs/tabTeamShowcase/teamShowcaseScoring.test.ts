// @vitest-environment jsdom
import { resolveShowcaseScoringData } from 'lib/characterPreview/showcaseDerivedData'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Luocha } from 'lib/conditionals/character/1200/Luocha'
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
const healer: Character = {
  id: Luocha.id,
  equipped: {},
  form: getDefaultForm({ id: Luocha.id }),
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

  it('finds the Custom DPS team when Substat Score is first in the card display order', () => {
    const expected = installReorderedCustomTeam()

    const result = resolveCustomAutofillTeammateIds(
      character,
      { [ScoringConfigType.DPS]: CUSTOM_TEAM },
    )

    expect(result).toEqual(expected)
  })
})

describe('resolveShowcaseScoringData overrides', () => {
  it('resolves injected fields over slot fields without discarding unrelated slot values', () => {
    const defaultTeammates = getGameMetadata().characters[KafkaB1.id].scoringMetadata.simulation!.teammates
    const slotTeammates = [...defaultTeammates].reverse()
    const injectedTeammates = [defaultTeammates[1], defaultTeammates[2], defaultTeammates[0]]

    const result = resolveShowcaseScoringData({
      character,
      teamSelections: { [ScoringConfigType.DPS]: DEFAULT_TEAM },
      storedScoringType: undefined,
      simulationMetadataOverrides: {
        [ScoringConfigType.DPS]: { teammates: slotTeammates, deprioritizeBuffs: true },
      },
      simulationMetadataOverride: { teammates: injectedTeammates },
      overrideConfigType: ScoringConfigType.DPS,
    })

    expect(result.configMetadata[ScoringConfigType.DPS]?.teammates).toEqual(injectedTeammates)
    expect(result.configMetadata[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(true)
  })

  it('derives an absent injected priority from the injected team', () => {
    const result = resolveShowcaseScoringData({
      character,
      teamSelections: { [ScoringConfigType.DPS]: DEFAULT_TEAM },
      storedScoringType: undefined,
      simulationMetadataOverride: { teammates: [] },
      overrideConfigType: ScoringConfigType.DPS,
    })

    expect(result.configMetadata[ScoringConfigType.DPS]?.deprioritizeBuffs).toBe(false)
  })

  it('preserves healing isolation when a team override replaces the teammates', () => {
    const result = resolveShowcaseScoringData({
      character: healer,
      teamSelections: { [ScoringConfigType.HEAL]: DEFAULT_TEAM },
      storedScoringType: undefined,
      simulationMetadataOverrides: {
        [ScoringConfigType.HEAL]: { teammates: [] },
      },
    })

    expect(result.configMetadata[ScoringConfigType.HEAL]?.deprioritizeBuffs).toBe(true)
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
