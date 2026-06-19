// @vitest-environment jsdom
import {
  CharacterConverter,
} from 'lib/importer/characterConverter'
import {
  expandProfile,
  type MinifiedProfile,
  minifyProfile,
} from 'lib/simulations/leaderboard/profileCompression'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  fileExists,
  gunzipBase64Text,
  gzipTextToBase64,
  readTextFile,
} from 'scripts/leaderboard/shared/nodeFacade'
import {
  describe,
  expect,
  test,
} from 'vitest'
import { compressedProfileSampleBase64 } from './leaderboardProfileSample'

Metadata.initialize()

function compress(avatarDetailList: Record<string, unknown>[]): string {
  return gzipTextToBase64(JSON.stringify(minifyProfile(avatarDetailList)))
}

function decompress(base64: string) {
  const minified: MinifiedProfile = JSON.parse(gunzipBase64Text(base64))
  return expandProfile(minified)
}

const PROFILE_PATH = import.meta.env['LEADERBOARD_TEST_PROFILE'] as string | undefined
const hasRealProfile = PROFILE_PATH ? fileExists(PROFILE_PATH) : false

function loadRealProfile(): Record<string, unknown>[] {
  const raw = JSON.parse(readTextFile(PROFILE_PATH!)) as Record<string, unknown>
  const detailInfo = raw.detailInfo as Record<string, unknown> | undefined
  return (detailInfo?.avatarDetailList as Record<string, unknown>[]) ?? []
}

describe('profileCompression', () => {
  describe('sample profile roundtrip', () => {
    test('decompresses the sample profile to valid characters', () => {
      const characters = decompress(compressedProfileSampleBase64)

      expect(characters).toHaveLength(8)
      for (const char of characters) {
        expect(char.avatarId).toBeTruthy()
        expect(char.relicList).toBeDefined()
        expect(char.relicList!.length).toBeGreaterThan(0)
      }
    })

    test('all characters convert through CharacterConverter without error', () => {
      const characters = decompress(compressedProfileSampleBase64)

      for (const char of characters) {
        const converted = CharacterConverter.convert(char)
        expect(converted.id).toBeTruthy()
        expect(converted.form).toBeDefined()
      }
    })

    test('sample profile contains Trailblazer variants with correct IDs', () => {
      const characters = decompress(compressedProfileSampleBase64)
      const ids = characters.map((c) => c.avatarId)

      expect(ids).toContain('1307b1')
      expect(ids).toContain('1005b1')
    })

    test('Trailblazer variant converts to correct CharacterConverter ID', () => {
      const characters = decompress(compressedProfileSampleBase64)
      const trailblazer = characters.find((c) => c.avatarId === '1307b1')!

      const converted = CharacterConverter.convert(trailblazer)
      expect(converted.id).toBe('1307b1')
    })
  })

  describe('enhancedId / Trailblazer variants', () => {
    test('enhancedId is applied as b-suffix to avatarId during expand', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1307, r: 2, e: 1, q: { t: 23022, r: 1 }, l: [] }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].avatarId).toBe('1307b1')
    })

    test('avatarId without enhancedId remains a number', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1314, r: 0, q: { t: 23000, r: 1 }, l: [] }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].avatarId).toBe(1314)
    })
  })

  describe('field preservation', () => {
    test('equipment and relic identity fields survive minify and expand', () => {
      const fakeCharList: Record<string, unknown>[] = [{
        avatarId: 9999,
        rank: 2,
        equipment: { tid: 23000, rank: 5 },
        relicList: [{
          tid: 61151,
          level: 12,
          mainAffixId: 3,
          subAffixList: [{ affixId: 5, cnt: 2, step: 1 }],
        }],
      }]

      const expanded = expandProfile(minifyProfile(fakeCharList))
      const character = expanded[0]
      const relic = character.relicList![0]

      expect(character).toMatchObject({
        avatarId: 9999,
        rank: 2,
        equipment: { tid: '23000', rank: 5, level: 80 },
      })
      expect(relic).toMatchObject({
        tid: '61151',
        level: 12,
        mainAffixId: 3,
      })
      expect(relic.subAffixList[0]).toEqual({ affixId: 5, cnt: 2, step: 1 })
    })

    test('rank: 0 is preserved, not omitted', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1314, r: 0, q: { t: 23000, r: 1 }, l: [] }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].rank).toBe(0)
    })

    test('missing rank defaults to undefined', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1314, q: { t: 23000, r: 1 }, l: [] }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].rank).toBeUndefined()
    })

    test('character with no equipment', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1314, l: [] }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].equipment).toBeUndefined()
    })

    test('character with no relics', () => {
      const minified: MinifiedProfile = {
        a: [{ a: 1314, q: { t: 23000, r: 1 } }],
      }
      const expanded = expandProfile(minified)

      expect(expanded[0].relicList).toBeUndefined()
    })

    test('step: 0 omitted during minify, expanded as 0', () => {
      const fakeCharList: Record<string, unknown>[] = [{
        avatarId: 9999,
        relicList: [{
          tid: 61151,
          level: 15,
          mainAffixId: 1,
          subAffixList: [{ affixId: 5, cnt: 2, step: 0 }],
        }],
      }]
      const minified = minifyProfile(fakeCharList)
      expect(minified.a[0].l![0].u[0].s).toBeUndefined()

      const expanded = expandProfile(minified)
      expect(expanded[0].relicList![0].subAffixList[0].step).toBe(0)
    })

    test('all 6 relics with 4 substats each preserved through roundtrip', () => {
      const characters = decompress(compressedProfileSampleBase64)

      for (const char of characters) {
        if (!char.relicList) continue
        expect(char.relicList.length).toBe(6)
        for (const relic of char.relicList) {
          expect(relic.subAffixList.length).toBe(4)
          for (const sub of relic.subAffixList) {
            expect(sub.affixId).toBeGreaterThan(0)
            expect(sub.cnt).toBeGreaterThan(0)
            expect(typeof sub.step).toBe('number')
          }
        }
      }
    })
  })

  describe.skipIf(!hasRealProfile)('real profile roundtrip', () => {
    test('locally minified profile matches sample profile', () => {
      const fullProfile = loadRealProfile()
      const localCharacters = decompress(compress(fullProfile))
      const sampleCharacters = decompress(compressedProfileSampleBase64)

      expect(localCharacters.length).toBe(sampleCharacters.length)
      for (let i = 0; i < localCharacters.length; i++) {
        expect(localCharacters[i].avatarId).toBe(sampleCharacters[i].avatarId)
        expect(localCharacters[i].rank).toBe(sampleCharacters[i].rank)
        expect(localCharacters[i].relicList?.length).toBe(sampleCharacters[i].relicList?.length)
      }
    })

    test('same input produces identical compressed output', () => {
      const fullProfile = loadRealProfile()
      const compressed1 = compress(fullProfile)
      const compressed2 = compress(fullProfile)

      expect(compressed1).toBe(compressed2)
    })

    test('base64 binary attribute decodes through full pipeline', () => {
      const fullProfile = loadRealProfile()
      const b64 = compress(fullProfile)

      const exportRow = { pk: { S: '601069336' }, sk: { S: 'U' }, d: { B: b64 } }
      const characters = decompress(exportRow.d.B)

      expect(characters).toHaveLength(8)
      expect(characters.map((c) => c.avatarId)).toContain('1307b1')
    })
  })

  describe('synthetic minify edge cases', () => {
    test('dedup removes duplicate avatarId, keeping first after sort', () => {
      const relic1 = { tid: 61151, level: 15, mainAffixId: 1, subAffixList: [{ affixId: 5, cnt: 2, step: 2 }] }
      const relic2 = { tid: 99999, level: 15, mainAffixId: 1, subAffixList: [{ affixId: 1, cnt: 1, step: 0 }] }
      const chars: Record<string, unknown>[] = [
        { avatarId: 1314, relicList: [relic1] },
        { avatarId: 1314, relicList: [relic2] },
      ]
      const minified = minifyProfile(chars)

      expect(minified.a).toHaveLength(1)
      expect(minified.a[0].l![0].t).toBe(61151)
    })

    test('null characters are filtered', () => {
      const chars: unknown[] = [null, { avatarId: 1314, relicList: [] }, null]
      const minified = minifyProfile(chars as Record<string, unknown>[])

      expect(minified.a).toHaveLength(1)
    })
  })
})
