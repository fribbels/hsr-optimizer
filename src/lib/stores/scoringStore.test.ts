// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { SubStats, Stats } from 'lib/constants/constants'
import { Metadata } from 'lib/state/metadataInitializer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { ScoringMetadata, SimulationMetadata } from 'types/metadata'
import type { CharacterId } from 'types/character'

// ---- Setup ----

Metadata.initialize()

const INVALID_CHARACTER_ID = '9999' as CharacterId

function state() {
  return useScoringStore.getState()
}

function kafkaDefaults(): ScoringMetadata {
  return getGameMetadata().characters[Kafka.id].scoringMetadata
}

function statsOverride(stats: Partial<Record<string, number>>): Partial<ScoringMetadata> {
  return { stats: stats as ScoringMetadata['stats'] }
}

// ---- Reset ----

beforeEach(() => {
  useScoringStore.setState(useScoringStore.getInitialState())
})

// ---- Tests ----

describe('useScoringStore', () => {
  describe('initial state', () => {
    it('store initializes with empty scoringMetadataOverrides and scoringVersion 0', () => {
      expect(state().scoringMetadataOverrides).toEqual({})
      expect(state().scoringVersion).toBe(0)
    })
  })

  describe('scoring metadata resolution', () => {
    // SCORING-1 (CRITICAL): getScoringMetadata mutates the stored override in-place
    // via mergeUndefinedValues. After the call, the override gains all default keys.
    it('getScoringMetadata does not add default keys to the stored override after being called', () => {
      const override = statsOverride({ [Stats.ATK_P]: 1 })
      state().setScoringMetadataOverrides({ [Kafka.id]: override as ScoringMetadata })

      const keysBefore = Object.keys(state().scoringMetadataOverrides[Kafka.id] ?? {})

      getScoringMetadata(Kafka.id)

      const keysAfter = Object.keys(state().scoringMetadataOverrides[Kafka.id] ?? {})
      expect(keysAfter.length).toBe(keysBefore.length)
    })

    // SCORING-1 (CRITICAL): getScoringMetadata deletes presets from the stored override
    it('getScoringMetadata does not delete presets from the stored override', () => {
      const defaults = kafkaDefaults()
      const override = {
        ...statsOverride({ [Stats.ATK_P]: 1 }),
        presets: defaults.presets,
      }
      state().setScoringMetadataOverrides({ [Kafka.id]: override as ScoringMetadata })

      getScoringMetadata(Kafka.id)

      expect(state().scoringMetadataOverrides[Kafka.id]?.presets).toBeDefined()
    })

    it('getScoringMetadata returns a numeric weight for every SubStat when no override exists', () => {
      const result = getScoringMetadata(Kafka.id)
      for (const stat of SubStats) {
        expect(typeof result.stats[stat]).toBe('number')
      }
    })

    it('getScoringMetadata merges override stat weights over defaults where they exist', () => {
      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.ATK_P]: 0.75 }) as ScoringMetadata })

      const result = getScoringMetadata(Kafka.id)
      expect(result.stats[Stats.ATK_P]).toBe(0.75)
    })

    // SCORING-6: getScoringMetadata crashes on invalid character ID
    it('getScoringMetadata returns safely for an invalid character ID', () => {
      const result = getScoringMetadata(INVALID_CHARACTER_ID)
      expect(result).toBeDefined()
      expect(result.stats).toBeDefined()
    })
  })

  describe('override management', () => {
    // SCORING-2: updateCharacterOverrides crashes when no prior override and no stats field
    it('updateCharacterOverrides with traces-only and no prior override does not crash', () => {
      expect(() => {
        state().updateCharacterOverrides(Kafka.id, { traces: { deactivated: [] } })
      }).not.toThrow()
    })

    it('updateCharacterOverrides merges new stat weights into an existing override', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.SPD]: 1 }))

      const override = state().scoringMetadataOverrides[Kafka.id]
      expect(override?.stats[Stats.SPD]).toBe(1)
    })

    it('updateCharacterOverrides increments scoringVersion on each call', () => {
      expect(state().scoringVersion).toBe(0)
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      expect(state().scoringVersion).toBe(1)
      state().updateCharacterOverrides(Jingliu.id, statsOverride({ [Stats.ATK_P]: 0.8 }))
      expect(state().scoringVersion).toBe(2)
    })

    it('setScoringMetadataOverrides replaces all overrides and increments scoringVersion', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateCharacterOverrides(Jingliu.id, statsOverride({ [Stats.ATK_P]: 0.8 }))

      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.HP_P]: 1 }) as ScoringMetadata })

      expect(state().scoringMetadataOverrides[Kafka.id]?.stats[Stats.HP_P]).toBe(1)
      expect(state().scoringMetadataOverrides[Jingliu.id]).toBeUndefined()
      expect(state().scoringVersion).toBe(3)
    })
  })

  describe('simulation overrides', () => {
    it('updateSimulationOverrides merges new fields into an existing simulation override', () => {
      state().updateSimulationOverrides(Kafka.id, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)
      state().updateSimulationOverrides(Kafka.id, { substats: [Stats.ATK_P] } as Partial<SimulationMetadata>)

      const sim = state().scoringMetadataOverrides[Kafka.id]?.simulation
      expect(sim?.deprioritizeBuffs).toBe(true)
      expect(sim?.substats).toEqual([Stats.ATK_P])
    })

    it('updateSimulationOverrides increments scoringVersion', () => {
      state().updateSimulationOverrides(Kafka.id, { deprioritizeBuffs: false } as Partial<SimulationMetadata>)
      expect(state().scoringVersion).toBe(1)
    })

    it('clearSimulationOverrides removes simulation while preserving stat overrides', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateSimulationOverrides(Kafka.id, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)

      expect(state().scoringMetadataOverrides[Kafka.id]?.simulation).toBeDefined()

      state().clearSimulationOverrides(Kafka.id)

      expect(state().scoringMetadataOverrides[Kafka.id]?.simulation).toBeUndefined()
      expect(state().scoringMetadataOverrides[Kafka.id]?.stats[Stats.ATK_P]).toBe(0.5)
    })
  })
})
