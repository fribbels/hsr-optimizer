import {
  Parts,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import type { MainStats } from 'lib/constants/constants'
import type {
  ScoringMetadata,
  ScoringMetadataOverride,
  ScoringParts,
} from 'types/metadata'
import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  extractPartsDelta,
  extractStatsDelta,
  mergeAndPruneOverride,
  mergeDeltaWithDefaults,
  pruneOverridesOnLoad,
} from './scoringDelta'

// Helper to create a full stats record with all zeros except specified
function makeStats(overrides: Partial<Record<SubStats, number>> = {}): Record<SubStats, number> {
  const stats = {} as Record<SubStats, number>
  for (const stat of SubStats) {
    stats[stat] = 0
  }
  return { ...stats, ...overrides }
}

// Helper to create minimal ScoringMetadata for testing
function makeDefaults(overrides: Partial<ScoringMetadata> = {}): ScoringMetadata {
  return {
    stats: makeStats(overrides.stats),
    parts: {
      Body: [Stats.HP_P],
      Feet: [Stats.SPD],
      PlanarSphere: [Stats.HP_P],
      LinkRope: [Stats.ERR],
      ...overrides.parts,
    },
    presets: [],
    sortOption: {} as ScoringMetadata['sortOption'],
    hiddenColumns: [],
    ...overrides,
  }
}

describe('extractStatsDelta', () => {
  it('keeps stats differing from defaults', () => {
    const stats = { [Stats.SPD]: 1, [Stats.ATK_P]: 0.5 }
    const defaults = makeStats({ [Stats.SPD]: 0.75, [Stats.ATK_P]: 1 })

    const delta = extractStatsDelta(stats, defaults)

    expect(delta).toEqual({ [Stats.SPD]: 1, [Stats.ATK_P]: 0.5 })
  })

  it('prunes stats matching defaults', () => {
    const stats = { [Stats.SPD]: 1, [Stats.ATK_P]: 1 }
    const defaults = makeStats({ [Stats.SPD]: 0.75, [Stats.ATK_P]: 1 }) // ATK_P matches

    const delta = extractStatsDelta(stats, defaults)

    expect(delta).toEqual({ [Stats.SPD]: 1 }) // ATK_P pruned
  })

  it('returns undefined when all match', () => {
    const stats = { [Stats.SPD]: 0.75, [Stats.ATK_P]: 1 }
    const defaults = makeStats({ [Stats.SPD]: 0.75, [Stats.ATK_P]: 1 })

    const delta = extractStatsDelta(stats, defaults)

    expect(delta).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    const defaults = makeStats()
    expect(extractStatsDelta(undefined, defaults)).toBeUndefined()
  })
})

// Helper to create parts defaults
function makeParts(): Record<ScoringParts, MainStats[]> {
  return {
    [Parts.Body]: [Stats.HP_P],
    [Parts.Feet]: [Stats.SPD],
    [Parts.PlanarSphere]: [Stats.HP_P],
    [Parts.LinkRope]: [Stats.ERR],
  }
}

describe('extractPartsDelta', () => {
  it('keeps parts differing from defaults', () => {
    const parts: Partial<Record<ScoringParts, MainStats[]>> = {
      [Parts.Body]: [Stats.DEF_P],
      [Parts.Feet]: [Stats.SPD],
    }
    const defaults = makeParts()

    const delta = extractPartsDelta(parts, defaults)

    expect(delta).toEqual({ [Parts.Body]: [Stats.DEF_P] })
  })

  it('prunes parts matching defaults', () => {
    const parts: Partial<Record<ScoringParts, MainStats[]>> = {
      [Parts.Body]: [Stats.HP_P],
      [Parts.Feet]: [Stats.SPD],
    }
    const defaults = makeParts()

    const delta = extractPartsDelta(parts, defaults)

    expect(delta).toBeUndefined()
  })

  it('empty array is valid override', () => {
    const parts: Partial<Record<ScoringParts, MainStats[]>> = {
      [Parts.Body]: [],
    }
    const defaults = makeParts()

    const delta = extractPartsDelta(parts, defaults)

    expect(delta).toEqual({ [Parts.Body]: [] })
  })
})

describe('mergeDeltaWithDefaults', () => {
  it('overlays delta onto defaults', () => {
    const override: ScoringMetadataOverride = {
      stats: { [Stats.SPD]: 1 },
    }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.SPD]: 0.75, [Stats.ATK_P]: 1 }) })

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.stats[Stats.SPD]).toBe(1)
    expect(result.stats[Stats.ATK_P]).toBe(1)
  })

  it('non-overridden stats use defaults', () => {
    const override: ScoringMetadataOverride = { stats: { [Stats.SPD]: 1 } }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.CR]: 0.5, [Stats.CD]: 1 }) })

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.stats[Stats.CR]).toBe(0.5)
    expect(result.stats[Stats.CD]).toBe(1)
  })

  it('sets modified=true when has stats override', () => {
    const override: ScoringMetadataOverride = { stats: { [Stats.SPD]: 1 } }
    const defaults = makeDefaults()

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.modified).toBe(true)
  })

  it('sets modified=false when no stats override', () => {
    const override: ScoringMetadataOverride = { traces: { deactivated: ['A2'] } }
    const defaults = makeDefaults()

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.modified).toBe(false)
  })

  it('returns defaults when no override', () => {
    const defaults = makeDefaults({ stats: makeStats({ [Stats.SPD]: 0.75 }) })

    const result = mergeDeltaWithDefaults(undefined, defaults)

    expect(result.stats[Stats.SPD]).toBe(0.75)
    expect(result.modified).toBe(false)
  })
})

describe('mergeAndPruneOverride', () => {
  it('merges new stats with existing', () => {
    const existing: ScoringMetadataOverride = { stats: { [Stats.SPD]: 1 } }
    const update: Partial<ScoringMetadataOverride> = { stats: { [Stats.ATK_P]: 0.5 } }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.ATK_P]: 1 }) })

    const result = mergeAndPruneOverride(existing, update, defaults)

    expect(result?.stats).toEqual({ [Stats.SPD]: 1, [Stats.ATK_P]: 0.5 })
  })

  it('setting to default removes from delta', () => {
    const existing: ScoringMetadataOverride = { stats: { [Stats.SPD]: 1, [Stats.ATK_P]: 0.5 } }
    const update: Partial<ScoringMetadataOverride> = { stats: { [Stats.ATK_P]: 1 } } // matches default
    const defaults = makeDefaults({ stats: makeStats({ [Stats.ATK_P]: 1 }) })

    const result = mergeAndPruneOverride(existing, update, defaults)

    expect(result?.stats).toEqual({ [Stats.SPD]: 1 }) // ATK_P removed
  })

  it('returns undefined when no content', () => {
    const existing: ScoringMetadataOverride = { stats: { [Stats.SPD]: 0.75 } }
    const update: Partial<ScoringMetadataOverride> = { stats: { [Stats.SPD]: 0.75 } } // matches default
    const defaults = makeDefaults({ stats: makeStats({ [Stats.SPD]: 0.75 }) })

    const result = mergeAndPruneOverride(existing, update, defaults)

    expect(result).toBeUndefined()
  })

  it('preserves simulation when stats change', () => {
    const existing: ScoringMetadataOverride = {
      stats: { [Stats.SPD]: 1 },
      simulation: { deprioritizeBuffs: true },
    }
    const update: Partial<ScoringMetadataOverride> = { stats: { [Stats.ATK_P]: 0.5 } }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.ATK_P]: 1 }) })

    const result = mergeAndPruneOverride(existing, update, defaults)

    expect(result?.simulation).toEqual({ deprioritizeBuffs: true })
  })
})

describe('pruneOverridesOnLoad', () => {
  it('converts full-snapshot to delta', () => {
    // User has a full snapshot with many values matching defaults
    const overrides: Record<string, ScoringMetadataOverride> = {
      char1: {
        stats: {
          [Stats.ATK_P]: 1,
          [Stats.SPD]: 1,
          [Stats.EHR]: 0,
          [Stats.CR]: 1,
        },
      },
    }
    const defaults = makeDefaults({
      stats: makeStats({
        [Stats.ATK_P]: 1, // matches
        [Stats.SPD]: 0.75, // differs
        [Stats.EHR]: 1, // differs
        [Stats.CR]: 1, // matches
      }),
    })

    const { result, changed } = pruneOverridesOnLoad(overrides, () => defaults)

    expect(changed).toBe(true)
    expect(result.char1.stats).toEqual({
      [Stats.SPD]: 1, // kept (differs)
      [Stats.EHR]: 0, // kept (differs)
    })
  })

  it('preserves simulation and traces', () => {
    const overrides: Record<string, ScoringMetadataOverride> = {
      char1: {
        stats: { [Stats.SPD]: 1 },
        simulation: { deprioritizeBuffs: true },
        traces: { deactivated: ['A2'] },
      },
    }
    const defaults = makeDefaults()

    const { result } = pruneOverridesOnLoad(overrides, () => defaults)

    expect(result.char1.simulation).toEqual({ deprioritizeBuffs: true })
    expect(result.char1.traces).toEqual({ deactivated: ['A2'] })
  })

  it('returns changed=true when pruned', () => {
    const overrides: Record<string, ScoringMetadataOverride> = {
      char1: { stats: { [Stats.SPD]: 0.75 } }, // matches default
    }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.SPD]: 0.75 }) })

    const { result, changed } = pruneOverridesOnLoad(overrides, () => defaults)

    expect(changed).toBe(true)
    expect(result.char1).toBeUndefined() // entire override removed
  })

  it('skips characters with no defaults', () => {
    const overrides: Record<string, ScoringMetadataOverride> = {
      orphaned: { stats: { [Stats.SPD]: 1 } },
      valid: { stats: { [Stats.SPD]: 1 } },
    }
    const defaults = makeDefaults()

    const { result } = pruneOverridesOnLoad(overrides, (id) => id === 'valid' ? defaults : undefined)

    expect(result.orphaned).toBeUndefined()
    expect(result.valid).toBeDefined()
  })

  it('returns changed=false when nothing actually changes', () => {
    const overrides: Record<string, ScoringMetadataOverride> = {
      char1: { stats: { [Stats.SPD]: 1 } }, // differs from default
    }
    const defaults = makeDefaults({ stats: makeStats({ [Stats.SPD]: 0.75 }) })

    const { result, changed } = pruneOverridesOnLoad(overrides, () => defaults)

    expect(changed).toBe(false)
    expect(result.char1.stats).toEqual({ [Stats.SPD]: 1 })
  })

  it('keeps original override when getDefaults throws an error', () => {
    const overrides: Record<string, ScoringMetadataOverride> = {
      error: { stats: { [Stats.SPD]: 1 } },
      valid: { stats: { [Stats.SPD]: 1 } },
    }
    const defaults = makeDefaults()

    const { result } = pruneOverridesOnLoad(overrides, (id) => {
      if (id === 'error') throw new Error('Test error')
      return defaults
    })

    // Error character keeps original
    expect(result.error).toEqual({ stats: { [Stats.SPD]: 1 } })
    // Valid character still processed
    expect(result.valid).toBeDefined()
  })
})

describe('extractStatsDelta edge cases', () => {
  it('ignores unknown keys not in SubStats', () => {
    // Create stats object with a garbage key
    const stats = {
      [Stats.SPD]: 1,
      garbage: 999,
    } as unknown as Partial<Record<SubStats, number>>
    const defaults = makeStats()

    const delta = extractStatsDelta(stats, defaults)

    // Should only contain SPD, not the garbage key
    expect(delta).toEqual({ [Stats.SPD]: 1 })
    expect(delta).not.toHaveProperty('garbage')
  })

  it('ignores empty strings from form display', () => {
    // Form displays 0 as '', which should be ignored during extraction
    const stats = {
      [Stats.SPD]: 1,
      [Stats.ATK_P]: '' as unknown as number,
      [Stats.CR]: '' as unknown as number,
    }
    const defaults = makeStats({ [Stats.ATK_P]: 0.5 })

    const delta = extractStatsDelta(stats, defaults)

    // Only SPD should be in delta, empty strings skipped
    expect(delta).toEqual({ [Stats.SPD]: 1 })
    expect(delta).not.toHaveProperty(Stats.ATK_P)
    expect(delta).not.toHaveProperty(Stats.CR)
  })
})

describe('mergeDeltaWithDefaults edge cases', () => {
  it('ignores empty strings in stored override stats', () => {
    // Old saves may have empty strings from form display bug
    const override = {
      stats: {
        [Stats.SPD]: 1,
        [Stats.ATK_P]: '' as unknown as number,
      },
    } as ScoringMetadataOverride
    const defaults = makeDefaults({ stats: makeStats({ [Stats.ATK_P]: 0.5, [Stats.CR]: 0.8 }) })

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.stats[Stats.SPD]).toBe(1) // from override
    expect(result.stats[Stats.ATK_P]).toBe(0.5) // from defaults (empty string ignored)
    expect(result.stats[Stats.CR]).toBe(0.8) // from defaults
  })

  it('coerces non-numeric stats to 0', () => {
    // Ensure final result has all numeric values
    const override: ScoringMetadataOverride = {}
    const defaults = makeDefaults()
    // Simulate corrupt defaults with empty string
    defaults.stats[Stats.EHR] = '' as unknown as number

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(typeof result.stats[Stats.EHR]).toBe('number')
    expect(result.stats[Stats.EHR]).toBe(0)
  })

  it('clones simulation to avoid shared reference mutation', () => {
    const override: ScoringMetadataOverride = {
      simulation: { deprioritizeBuffs: true },
    }
    const defaults = makeDefaults()

    const result = mergeDeltaWithDefaults(override, defaults)

    // Mutate the result
    if (result.simulation) {
      result.simulation.deprioritizeBuffs = false
    }

    // Original override should be unchanged
    expect(override.simulation?.deprioritizeBuffs).toBe(true)
  })

  it('overlays parts from delta onto defaults', () => {
    const override: ScoringMetadataOverride = {
      parts: { [Parts.Body]: [Stats.DEF_P] },
    }
    const defaults = makeDefaults()

    const result = mergeDeltaWithDefaults(override, defaults)

    expect(result.parts[Parts.Body]).toEqual([Stats.DEF_P])
    expect(result.parts[Parts.Feet]).toEqual([Stats.SPD]) // default preserved
  })
})

describe('mergeAndPruneOverride edge cases', () => {
  it('merges parts from update with existing override', () => {
    const existing: ScoringMetadataOverride = {
      parts: { [Parts.Body]: [Stats.DEF_P] },
    }
    const update: Partial<ScoringMetadataOverride> = {
      parts: { [Parts.Feet]: [Stats.ATK_P] },
    }
    const defaults = makeDefaults()

    const result = mergeAndPruneOverride(existing, update, defaults)

    expect(result?.parts?.[Parts.Body]).toEqual([Stats.DEF_P])
    expect(result?.parts?.[Parts.Feet]).toEqual([Stats.ATK_P])
  })
})
