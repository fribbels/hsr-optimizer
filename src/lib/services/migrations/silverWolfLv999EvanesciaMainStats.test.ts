import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import type { MainStats } from 'lib/constants/constants'
import type {
  ScoringMetadata,
  ScoringMetadataOverride,
} from 'types/metadata'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { migrateSilverWolfLv999EvanesciaMainStats } from './silverWolfLv999EvanesciaMainStats'

const SW999_ID = '1506'
const EVA_ID = '1505'
const UNRELATED_ID = '1005' // Kafka

function metadata(parts: Partial<Record<(typeof Parts)[keyof typeof Parts], MainStats[]>>): ScoringMetadata {
  return {
    stats: {} as ScoringMetadata['stats'],
    parts: {
      [Parts.Body]: [],
      [Parts.Feet]: [],
      [Parts.PlanarSphere]: [],
      [Parts.LinkRope]: [],
      ...parts,
    } as ScoringMetadata['parts'],
    presets: [],
    sortOption: {} as ScoringMetadata['sortOption'],
    hiddenColumns: [],
  }
}

const SW999_DEFAULTS = metadata({
  [Parts.Body]: [Stats.CR, Stats.CD],
  [Parts.Feet]: [Stats.SPD],
})

const EVA_DEFAULTS = metadata({
  [Parts.Body]: [Stats.CR, Stats.CD],
  [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
})

function getDefaults(id: string): ScoringMetadata | undefined {
  if (id === SW999_ID) return SW999_DEFAULTS
  if (id === EVA_ID) return EVA_DEFAULTS
  return undefined
}

describe('migrateSilverWolfLv999EvanesciaMainStats', () => {
  it('no-ops when no targeted override exists', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [UNRELATED_ID]: { parts: { [Parts.Body]: [Stats.ATK_P] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result).toEqual(input)
  })

  it('skips targeted override with no parts field', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { stats: { [Stats.ATK_P]: 0.5 } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result).toEqual(input)
  })

  it('unions stale narrowed default into new broader default', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { parts: { [Parts.Body]: [Stats.CR] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[SW999_ID]!.parts![Parts.Body]).toEqual([Stats.CR, Stats.CD])
  })

  it('preserves user customizations alongside merged defaults', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [EVA_ID]: { parts: { [Parts.LinkRope]: [Stats.ATK_P] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[EVA_ID]!.parts![Parts.LinkRope]).toEqual([Stats.ATK_P, Stats.ERR])
  })

  it('preserves stats not in defaults', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { parts: { [Parts.Body]: [Stats.CR, Stats.ATK_P] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[SW999_ID]!.parts![Parts.Body]).toEqual([Stats.CR, Stats.CD, Stats.ATK_P])
  })

  it('treats saved [] (user chose allow-all) as absorbing', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [EVA_ID]: { parts: { [Parts.Body]: [] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[EVA_ID]!.parts![Parts.Body]).toEqual([])
  })

  it('treats current default [] (allow-all) as absorbing, releasing stale narrow list', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { parts: { [Parts.PlanarSphere]: [Stats.Physical_DMG] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[SW999_ID]!.parts![Parts.PlanarSphere]).toEqual([])
  })

  it('leaves non-targeted character overrides untouched', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [UNRELATED_ID]: { parts: { [Parts.Body]: [Stats.CR] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[UNRELATED_ID]!.parts![Parts.Body]).toEqual([Stats.CR])
  })

  it('does not mutate the input overrides map', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { parts: { [Parts.Body]: [Stats.CR] } },
    }
    const originalBody = input[SW999_ID]!.parts![Parts.Body]
    migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(input[SW999_ID]!.parts![Parts.Body]).toBe(originalBody)
    expect(input[SW999_ID]!.parts![Parts.Body]).toEqual([Stats.CR])
  })

  it('does not touch parts keys that are undefined in the override', () => {
    const input: Record<string, ScoringMetadataOverride> = {
      [EVA_ID]: { parts: { [Parts.Body]: [Stats.CR] } },
    }
    const result = migrateSilverWolfLv999EvanesciaMainStats(input, getDefaults)
    expect(result[EVA_ID]!.parts![Parts.LinkRope]).toBeUndefined()
  })

  it('logs and skips a character whose defaults lookup throws, still migrates the other', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const input: Record<string, ScoringMetadataOverride> = {
      [SW999_ID]: { parts: { [Parts.Body]: [Stats.CR] } },
      [EVA_ID]: { parts: { [Parts.LinkRope]: [Stats.ATK_P] } },
    }
    const throwingGetDefaults = (id: string) => {
      if (id === EVA_ID) throw new Error('boom')
      return getDefaults(id)
    }

    const result = migrateSilverWolfLv999EvanesciaMainStats(input, throwingGetDefaults)

    expect(result[SW999_ID]!.parts![Parts.Body]).toEqual([Stats.CR, Stats.CD])
    expect(result[EVA_ID]).toBe(input[EVA_ID])
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(EVA_ID),
      expect.any(Error),
    )

    consoleError.mockRestore()
  })
})
