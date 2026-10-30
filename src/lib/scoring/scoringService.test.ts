// @vitest-environment jsdom
import type { PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { CUSTOM_TEAM } from 'lib/constants/constants'
import { CONFIG_FIELD_MAP } from 'lib/scoring/scoringConfig'
import { computeScoringCacheKey } from 'lib/scoring/scoringService'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { resolveSimulationMetadata } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import {
  createDefaultFormState,
  createDefaultTeammate,
} from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import type { Character } from 'types/character'
import type { Teammate } from 'types/form'
import {
  ScoringConfigType,
  type SimulationMetadata,
} from 'types/metadata'
import {
  describe,
  expect,
  it,
} from 'vitest'

const characterId = '1308' as const
const relics: PreviewRelics = { Head: null, Hands: null, Body: null, Feet: null, PlanarSphere: null, LinkRope: null }
const teammate: Teammate = {
  characterId: '1204',
  characterEidolon: 0,
  characterEx: 0,
  lightCone: '20000',
  lightConeSuperimposition: 1,
}
const metadata: SimulationMetadata = {
  parts: {},
  substats: [],
  comboTurnAbilities: [],
  relicSets: [],
  ornamentSets: [],
  teammates: [teammate],
}

function makeCharacter(): Character {
  const form = displayToInternal({
    ...createDefaultFormState(),
    characterId,
    lightCone: '20000',
    teammates: [createDefaultTeammate(), createDefaultTeammate(), createDefaultTeammate()],
  })
  return { id: characterId, equipped: {}, form: { ...form, teammate0: teammate, teammate1: teammate, teammate2: teammate } }
}

describe('scoring cache EX inputs', () => {
  it.each(Object.values(ScoringConfigType))('normalizes optional override EX before hashing or computing %s', (configType) => {
    Metadata.initialize()
    const field = CONFIG_FIELD_MAP[configType]
    const characterMetadata = Object.values(getGameMetadata().characters).find((entry) => entry.scoringMetadata[field])
    if (!characterMetadata) throw new Error(`No default ${configType} scoring configuration`)
    const base = makeCharacter()
    const character: Character = { ...base, id: characterMetadata.id, form: { ...base.form, characterId: characterMetadata.id } }
    const source = Object.freeze({
      characterId: teammate.characterId,
      characterEidolon: teammate.characterEidolon,
      lightCone: teammate.lightCone,
      lightConeSuperimposition: teammate.lightConeSuperimposition,
    })
    const previous = useScoringStore.getState()
    const resolveKey = (characterEx?: number) => {
      useScoringStore.getState().updateScoringConfigOverride(character.id, configType, {
        teammates: [characterEx == null ? source : { ...source, characterEx }],
      })
      const resolved = resolveSimulationMetadata(character, configType, CUSTOM_TEAM)
      if (!resolved) throw new Error(`Failed to resolve ${configType} scoring configuration`)
      expect(resolved.teammates[0].characterEx).toBe(characterEx ?? 0)
      const key = computeScoringCacheKey(character, configType, resolved, relics, {})
      expect(key).not.toBeNull()
      const orchestrator = new BenchmarkSimulationOrchestrator(resolved)
      expect(orchestrator.metadata.teammates[0].characterEx).toBe(characterEx ?? 0)
      return key
    }
    try {
      const omitted = resolveKey()
      expect(resolveKey(0)).toBe(omitted)
      const ex1 = resolveKey(1)
      expect(ex1).not.toBe(omitted)
      const combined = resolveKey(3)
      expect(combined).not.toBe(omitted)
      expect(combined).not.toBe(ex1)
      expect(source).not.toHaveProperty('characterEx')
    } finally {
      useScoringStore.setState(previous)
    }
  })

  it('accepts optional EX at the direct orchestrator boundary without changing its source', () => {
    const { characterEx: _ex, ...source } = teammate
    const input: SimulationMetadata = { ...metadata, teammates: [Object.freeze(source)] }
    Object.freeze(input.teammates)
    Object.freeze(input)
    const orchestrator = new BenchmarkSimulationOrchestrator(input)
    expect(orchestrator.metadata.teammates[0].characterEx).toBe(0)
    expect(input.teammates[0]).not.toHaveProperty('characterEx')
  })

  it.each(Object.values(ScoringConfigType))('separates main and teammate EX settings for %s', (configType) => {
    const character = makeCharacter()
    const key = (input: Character = character, simulation: SimulationMetadata = metadata) => computeScoringCacheKey(input, configType, simulation, relics, {})
    const legacyKey = key()
    expect(legacyKey).not.toBeNull()
    expect(key({ ...character, form: { ...character.form, characterEx: 0 } })).toBe(legacyKey)
    expect(key({ ...character, form: { ...character.form, characterEx: 1 } })).not.toBe(legacyKey)
    for (const field of ['teammate0', 'teammate1', 'teammate2'] as const) {
      expect(key({ ...character, form: { ...character.form, [field]: { ...teammate, characterEx: 0 } } })).toBe(legacyKey)
      expect(key({ ...character, form: { ...character.form, [field]: { ...teammate, characterEx: 1 } } })).not.toBe(legacyKey)
    }
    expect(key(character, { ...metadata, teammates: [{ ...teammate, characterEx: 0 }] })).toBe(legacyKey)
    expect(key(character, { ...metadata, teammates: [{ ...teammate, characterEx: 1 }] })).not.toBe(legacyKey)
  })

  it('leaves caller-owned objects unchanged', () => {
    const character = makeCharacter()
    Object.freeze(teammate)
    Object.freeze(metadata.teammates)
    Object.freeze(metadata)
    Object.freeze(character.form)
    Object.freeze(character)
    expect(() => computeScoringCacheKey(character, ScoringConfigType.DPS, metadata, relics, {})).not.toThrow()
    expect(character.form.characterEx).toBe(0)
    expect(teammate.characterEx).toBe(0)
    expect(metadata.teammates[0]).toBe(teammate)
    expect(character.form.teammate0).toBe(teammate)
  })
})
