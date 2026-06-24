// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  getDefaultScoringMetadata,
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import type { CharacterId } from 'types/character'
import {
  ScoringConfigType,
  type ScoringMetadata,
  type ScoringMetadataOverride,
  type SimulationMetadata,
} from 'types/metadata'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

// ---- Setup ----

Metadata.initialize()

const INVALID_CHARACTER_ID = '9999' as CharacterId

function state() {
  return useScoringStore.getState()
}

function kafkaDefaults(): ScoringMetadata {
  return getGameMetadata().characters[Kafka.id].scoringMetadata
}

function kafkaB1Defaults(): ScoringMetadata {
  return getGameMetadata().characters[KafkaB1.id].scoringMetadata
}

function statsOverride(stats: Partial<Record<string, number>>): Partial<ScoringMetadataOverride> {
  return { stats: stats as ScoringMetadataOverride['stats'] }
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
    // getScoringMetadata must not mutate the stored override in-place via mergeUndefinedValues
    it('getScoringMetadata does not add default keys to the stored override after being called', () => {
      const override = statsOverride({ [Stats.ATK_P]: 1 })
      state().setScoringMetadataOverrides({ [Kafka.id]: override as ScoringMetadataOverride })

      const keysBefore = Object.keys(state().scoringMetadataOverrides[Kafka.id] ?? {})

      getScoringMetadata(Kafka.id)

      const keysAfter = Object.keys(state().scoringMetadataOverrides[Kafka.id] ?? {})
      expect(keysAfter.length).toBe(keysBefore.length)
    })

    it('getScoringMetadata returns a numeric weight for every SubStat when no override exists', () => {
      const result = getScoringMetadata(Kafka.id)
      for (const stat of SubStats) {
        expect(typeof result.stats[stat]).toBe('number')
      }
    })

    it('getScoringMetadata merges override stat weights over defaults where they exist', () => {
      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.ATK_P]: 0.75 }) as ScoringMetadataOverride })

      const result = getScoringMetadata(Kafka.id)
      expect(result.stats[Stats.ATK_P]).toBe(0.75)
    })

    it('getDefaultScoringMetadata ignores override stat weights', () => {
      const defaultAtkWeight = kafkaDefaults().stats[Stats.ATK_P]
      const overrideAtkWeight = defaultAtkWeight === 0.75 ? 0.5 : 0.75
      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.ATK_P]: overrideAtkWeight }) as ScoringMetadataOverride })

      const result = getDefaultScoringMetadata(Kafka.id)

      expect(result.stats[Stats.ATK_P]).toBe(defaultAtkWeight)
    })

    it('getDefaultScoringMetadata returns a numeric weight for every SubStat on every character', () => {
      const invalidWeights: string[] = []

      for (const [id, characterMeta] of Object.entries(getGameMetadata().characters)) {
        if (!characterMeta.scoringMetadata) continue

        const result = getDefaultScoringMetadata(id as CharacterId)
        for (const stat of SubStats) {
          if (typeof result.stats[stat] !== 'number') {
            invalidWeights.push(`${id}:${stat}`)
          }
        }
      }

      expect(invalidWeights).toEqual([])
    })

    // getScoringMetadata must handle invalid character IDs gracefully
    it('getScoringMetadata returns safely for an invalid character ID', () => {
      const result = getScoringMetadata(INVALID_CHARACTER_ID)
      expect(result).toBeDefined()
      expect(result.stats).toBeDefined()
    })
  })

  describe('return value isolation', () => {
    // getScoringMetadata fills missing keys from the game metadata singleton via
    // mergeUndefinedValues. When no override exists for a nested field (e.g. simulation),
    // the returned object holds a direct reference to the singleton. Mutating it would
    // corrupt game metadata for ALL future callers.
    it('mutating getScoringMetadata simulation does not corrupt game metadata', () => {
      const defaults = kafkaB1Defaults()
      expect(defaults.simulation).toBeDefined()
      const originalCount = defaults.simulation!.teammates.length

      const result = getScoringMetadata(KafkaB1.id)
      expect(result.simulation).toBeDefined()
      result.simulation!.teammates.push({} as never)

      expect(kafkaB1Defaults().simulation!.teammates).toHaveLength(originalCount)
    })

    it('mutating getScoringMetadata simulation does not corrupt game metadata when a partial simulation override exists', () => {
      state().updateScoringConfigOverride(KafkaB1.id, ScoringConfigType.DPS, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)

      const defaults = kafkaB1Defaults()
      expect(defaults.simulation).toBeDefined()
      const originalCount = defaults.simulation!.teammates.length

      const result = getScoringMetadata(KafkaB1.id)
      expect(result.simulation).toBeDefined()
      result.simulation!.teammates.push({} as never)

      expect(kafkaB1Defaults().simulation!.teammates).toHaveLength(originalCount)
    })

    it('mutating getScoringMetadata stats does not corrupt the stored override', () => {
      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.ATK_P]: 0.5 }) as ScoringMetadataOverride })

      const result = getScoringMetadata(Kafka.id)
      result.stats[Stats.ATK_P] = 999

      expect(state().scoringMetadataOverrides[Kafka.id]?.stats?.[Stats.ATK_P]).toBe(0.5)
    })
  })

  describe('override management', () => {
    // updateCharacterOverrides must not crash when no prior override exists
    it('updateCharacterOverrides with traces-only and no prior override does not crash', () => {
      expect(() => {
        state().updateCharacterOverrides(Kafka.id, { traces: { deactivated: [] } })
      }).not.toThrow()
    })

    it('updateCharacterOverrides merges new stat weights into an existing override', () => {
      // Use values that differ from Kafka's defaults (ATK_P=1, SPD=1) to avoid delta pruning
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.SPD]: 0.75 }))

      const override = state().scoringMetadataOverrides[Kafka.id]
      expect(override?.stats?.[Stats.ATK_P]).toBe(0.5)
      expect(override?.stats?.[Stats.SPD]).toBe(0.75)
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

      state().setScoringMetadataOverrides({ [Kafka.id]: statsOverride({ [Stats.HP_P]: 1 }) as ScoringMetadataOverride })

      expect(state().scoringMetadataOverrides[Kafka.id]?.stats?.[Stats.HP_P]).toBe(1)
      expect(state().scoringMetadataOverrides[Jingliu.id]).toBeUndefined()
      expect(state().scoringVersion).toBe(3)
    })
  })

  describe('simulation overrides', () => {
    it('updateScoringConfigOverride merges new fields into an existing simulation override', () => {
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { substats: [Stats.ATK_P] } as Partial<SimulationMetadata>)

      const sim = state().scoringMetadataOverrides[Kafka.id]?.simulation
      expect(sim?.deprioritizeBuffs).toBe(true)
      expect(sim?.substats).toEqual([Stats.ATK_P])
    })

    it('updateScoringConfigOverride increments scoringVersion', () => {
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { deprioritizeBuffs: false } as Partial<SimulationMetadata>)
      expect(state().scoringVersion).toBe(1)
    })

    it('clearScoringConfigOverride removes simulation while preserving stat overrides', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)

      expect(state().scoringMetadataOverrides[Kafka.id]?.simulation).toBeDefined()

      state().clearScoringConfigOverride(Kafka.id, ScoringConfigType.DPS)

      expect(state().scoringMetadataOverrides[Kafka.id]?.simulation).toBeUndefined()
      expect(state().scoringMetadataOverrides[Kafka.id]?.stats?.[Stats.ATK_P]).toBe(0.5)
    })

    it('clearScoringConfigOverride removes entire override when only simulation existed', () => {
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)

      expect(state().scoringMetadataOverrides[Kafka.id]?.simulation).toBeDefined()

      state().clearScoringConfigOverride(Kafka.id, ScoringConfigType.DPS)

      expect(state().scoringMetadataOverrides[Kafka.id]).toBeUndefined()
    })
  })

  describe('clearCharacterOverrides', () => {
    it('removes all overrides for a character', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      state().updateScoringConfigOverride(Kafka.id, ScoringConfigType.DPS, { deprioritizeBuffs: true } as Partial<SimulationMetadata>)

      expect(state().scoringMetadataOverrides[Kafka.id]).toBeDefined()

      state().clearCharacterOverrides(Kafka.id)

      expect(state().scoringMetadataOverrides[Kafka.id]).toBeUndefined()
    })

    it('increments scoringVersion', () => {
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      const versionBefore = state().scoringVersion

      state().clearCharacterOverrides(Kafka.id)

      expect(state().scoringVersion).toBe(versionBefore + 1)
    })

    it('is idempotent when no override exists', () => {
      expect(state().scoringMetadataOverrides[Kafka.id]).toBeUndefined()

      state().clearCharacterOverrides(Kafka.id)

      expect(state().scoringMetadataOverrides[Kafka.id]).toBeUndefined()
    })
  })

  describe('delta pruning behavior', () => {
    it('updateCharacterOverrides removes override when all values match defaults', () => {
      const defaults = kafkaDefaults()
      // Set an override different from defaults
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: 0.5 }))
      expect(state().scoringMetadataOverrides[Kafka.id]).toBeDefined()

      // Now set it back to the default value
      state().updateCharacterOverrides(Kafka.id, statsOverride({ [Stats.ATK_P]: defaults.stats[Stats.ATK_P] }))

      // The override should be completely removed
      expect(state().scoringMetadataOverrides[Kafka.id]).toBeUndefined()
    })
  })
})
