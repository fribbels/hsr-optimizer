import { normalizeSimulationMetadata } from 'lib/scoring/normalizeScoringMetadata'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { getDefaultScoringMetadata } from 'lib/stores/scoring/scoringStore'
import type { SimulationMetadata } from 'types/metadata'
import {
  expect,
  test,
} from 'vitest'

test('static teammate EX defaults to off without changing the source config', () => {
  const teammate = Object.freeze({ characterId: '1204', lightCone: '20000', characterEidolon: 0, lightConeSuperimposition: 1 } as const)
  const source: SimulationMetadata = {
    parts: {},
    substats: [],
    comboTurnAbilities: [],
    relicSets: [],
    ornamentSets: [],
    teammates: [teammate, { ...teammate, characterEx: 0 }, { ...teammate, characterEx: 3 }],
  }
  Object.freeze(source.teammates)
  Object.freeze(source)
  const normalized = normalizeSimulationMetadata(source)
  expect(normalized.teammates.map((member) => member.characterEx)).toEqual([0, 0, 3])
  expect(teammate).not.toHaveProperty('characterEx')
  expect(normalized.teammates[0]).not.toBe(teammate)
})

test('the metadata read boundary fills EX for every default scoring configuration', () => {
  Metadata.initialize()
  for (const character of Object.values(getGameMetadata().characters)) {
    const metadata = getDefaultScoringMetadata(character.id)
    for (
      const simulation of [
        metadata.simulation,
        metadata.supportSimulation,
        metadata.healSimulation,
        metadata.shieldSimulation,
      ]
    ) {
      for (const teammate of simulation?.teammates ?? []) expect(typeof teammate.characterEx).toBe('number')
    }
  }
})
