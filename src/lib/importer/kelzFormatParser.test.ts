// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Metadata } from 'lib/state/metadataInitializer'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { KelzFormatParser, type V4ParserRelic } from './kelzFormatParser'

// ---- Mocks ----

vi.mock('lib/interactions/message', () => ({
  Message: { warning: vi.fn(), error: vi.fn(), success: vi.fn() },
}))

vi.mock('i18next', () => ({
  default: {
    getFixedT: () => (key: string) => key,
  },
}))

// ---- Setup ----

Metadata.initialize()

// ---- Constants ----

const VALID_SET_ID = '101' // Passerby of Wandering Cloud
const UNKNOWN_SET_ID = '99999'
const UUID_UID = 'cd85c14c-a662-4413-a149-a379e6d538d3'

// ---- Helpers ----

function makeParserRelic(overrides: Partial<V4ParserRelic> = {}): V4ParserRelic {
  return {
    set_id: VALID_SET_ID,
    name: 'Test Relic',
    slot: 'Head',
    rarity: 5,
    level: 15,
    mainstat: 'HP',
    substats: [
      { key: 'ATK', value: 38.1 },
      { key: 'DEF', value: 38.1 },
      { key: 'HP_', value: 4.3 },
      { key: 'ATK_', value: 4.3 },
    ],
    location: '',
    lock: false,
    discard: false,
    _uid: UUID_UID,
    ...overrides,
  }
}

function makeParser() {
  return new KelzFormatParser(ReliquaryArchiverConfig)
}

// ---- Tests ----

describe('kelzFormatParser', () => {
  describe('ageIndex from UUID', () => {
    it('parseRelic derives ageIndex from parseInt(_uid)', () => {
      const parser = makeParser()
      const relic = parser.parseRelic(makeParserRelic({ _uid: UUID_UID }), {})

      expect(relic).not.toBeNull()
      // UUID strings produce NaN from parseInt — that's expected
      expect(relic!.ageIndex).toBeNaN()
    })
  })

  describe('parser robustness', () => {
    it('parseRelic returns null for unknown set_id instead of crashing', () => {
      const parser = makeParser()

      expect(() => parser.parseRelic(makeParserRelic({ set_id: UNKNOWN_SET_ID }), {})).not.toThrow()
      const result = parser.parseRelic(makeParserRelic({ set_id: UNKNOWN_SET_ID }), {})
      expect(result).toBeNull()
    })

    it('parse skips bad relics without killing entire import', () => {
      const parser = makeParser()
      const goodRelic = makeParserRelic({ _uid: 'good-relic-uid' })
      const badRelic = makeParserRelic({ _uid: 'bad-relic-uid', set_id: UNKNOWN_SET_ID })

      const json = {
        source: ReliquaryArchiverConfig.sourceString,
        build: ReliquaryArchiverConfig.latestBuildVersion,
        version: ReliquaryArchiverConfig.latestOutputVersion,
        metadata: { uid: 12345, trailblazer: 'Stelle' as const },
        gacha: { stellar_jade: 0, oneric_shards: 0 },
        materials: [],
        characters: [],
        light_cones: [],
        relics: [goodRelic, badRelic],
      }

      const result = parser.parse(json)

      // The good relic should survive, the bad one should be skipped
      expect(result.relics).toHaveLength(1)
      expect(result.relics[0].id).toBe('good-relic-uid')
    })
  })
})
