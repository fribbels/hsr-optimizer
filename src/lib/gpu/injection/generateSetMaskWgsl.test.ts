// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  assertSetMaskCardinality,
  generateSetMaskWgsl,
  getSetMaskLocation,
} from 'lib/gpu/injection/generateSetMaskWgsl'
import {
  injectComputeShader,
  injectDispatchMode,
} from 'lib/gpu/injection/generateWgsl'
import {
  assertGpuSetRegistryCardinality,
  getSetRegistryCardinality,
} from 'lib/gpu/injection/setIndexMap'
import {
  MAX_ORNAMENT_SET_COUNT,
  MAX_RELIC_SET_COUNT,
} from 'lib/sets/setConfigRegistry'
import type { GpuConstants } from 'lib/gpu/webgpuTypes'
import {
  type SetConfig,
  SetType,
} from 'types/setConfig'

type MatchMasks = {
  relicMatch2: number[],
  relicMatch4: number[],
  ornamentMatch2: number[],
}

function oneHotWords(setIndex: number, setCount: number): number[] {
  const words = Array.from({ length: Math.ceil(setCount / 32) }, () => 0)
  const location = getSetMaskLocation(setIndex, setCount)
  if (location) {
    words[location.wordIndex] = (2 ** location.bitIndex) >>> 0
  }
  return words
}

function andWords(left: number[], right: number[]): number[] {
  return left.map((value, index) => (value & right[index]) >>> 0)
}

function orWords(...values: number[][]): number[] {
  return values[0].map((_, index) => values.reduce((result, value) => (result | value[index]) >>> 0, 0))
}

function evaluateGeneratedArithmetic(
  relicSets: [number, number, number, number],
  ornamentSets: [number, number],
  relicSetCount: number,
  ornamentSetCount: number,
): MatchMasks {
  const [h, g, b, f] = relicSets.map((setIndex) => oneHotWords(setIndex, relicSetCount))
  const [p, l] = ornamentSets.map((setIndex) => oneHotWords(setIndex, ornamentSetCount))

  return {
    relicMatch2: orWords(
      andWords(h, g),
      andWords(h, b),
      andWords(h, f),
      andWords(g, b),
      andWords(g, f),
      andWords(b, f),
    ),
    relicMatch4: andWords(andWords(andWords(h, g), b), f),
    ornamentMatch2: andWords(p, l),
  }
}

function injectCarry(tupleMode: boolean, masks = generateSetMaskWgsl()): string {
  const template = `
/* INJECT OFFSET DECODE */
/* INJECT PERM LIMIT CHECK */
/* INJECT CARRY CHAIN */
`
  return injectDispatchMode(template, { TUPLE_MODE: tupleMode } as GpuConstants, masks)
}

describe('generateSetMaskWgsl', () => {
  it('derives the live one-word shape from the 32 relic / 28 ornament registry', () => {
    expect(getSetRegistryCardinality()).toEqual({ relicSetCount: 32, ornamentSetCount: 28 })

    const generated = generateSetMaskWgsl()
    expect(generated.relicWordCount).toBe(1)
    expect(generated.ornamentWordCount).toBe(1)
    expect(generated.declarations).toContain('// Generated capacity-safe set masks: relicWords=1, ornamentWords=1')
    expect(generated.declarations).toContain('  relicMatch2: u32,')
    expect(generated.declarations).toContain('  relicMatch4: u32,')
    expect(generated.declarations).toContain('  ornamentMatch2: u32,')
    expect(generated.declarations).not.toContain('Word1')
  })

  it('emits the beta-equivalent live hot arithmetic with the boolean accessor ABI', () => {
    const generated = generateSetMaskWgsl({ relicSetCount: 32, ornamentSetCount: 28 })

    expect(generated.declarations).toContain('fn relic2p(s: SetMatches, setId: u32) -> bool {')
    expect(generated.declarations).toContain('return ((s.relicMatch2 >> setId) & 1u) == 1u;')
    expect(generated.declarations).toContain('return ((s.relicMatch4 >> setId) & 1u) == 1u;')
    expect(generated.declarations).toContain('return ((s.ornamentMatch2 >> setId) & 1u) == 1u;')

    expect(generated.outerMaskDeclarations).toContain('var maskH = 1u << setH;')
    expect(generated.outerMaskDeclarations).toContain('var maskG = 1u << setG;')
    expect(generated.outerMaskDeclarations).toContain('var maskB = 1u << setB;')
    expect(generated.outerMaskDeclarations).toContain('var maskF = 1u << setF;')
    expect(generated.setMatchConstruction).toContain(
      'sets.relicMatch2 = (maskH & maskG) | (maskH & maskB) | (maskH & maskF)',
    )
    expect(generated.setMatchConstruction).toContain('sets.relicMatch4 = maskH & maskG & maskB & maskF;')
    expect(generated.setMatchConstruction).toContain('sets.ornamentMatch2 = (1u << setP) & (1u << setL);')
  })

  it('accepts the largest counts below a flattened filter length of 2^32', () => {
    expect(() => assertSetMaskCardinality({
      relicSetCount: MAX_RELIC_SET_COUNT,
      ornamentSetCount: MAX_ORNAMENT_SET_COUNT,
    })).not.toThrow()
    expect(() => assertSetMaskCardinality({
      relicSetCount: MAX_RELIC_SET_COUNT + 1,
      ornamentSetCount: 1,
    })).toThrow('exceeds the flattened filter array-length limit 255')
    expect(() => assertSetMaskCardinality({
      relicSetCount: 1,
      ornamentSetCount: MAX_ORNAMENT_SET_COUNT + 1,
    })).toThrow('exceeds the flattened filter array-length limit 65535')
  })

  it('rejects a registry Map that lost a set to a cross-family setKey collision', () => {
    const collidedRegistry = new Map<string, SetConfig>()
    collidedRegistry.set('DUPLICATE', { info: { setType: SetType.RELIC } } as SetConfig)
    collidedRegistry.set('DUPLICATE', { info: { setType: SetType.ORNAMENT } } as SetConfig)

    expect(() => assertGpuSetRegistryCardinality(collidedRegistry.values(), {
      relicSetCount: 1,
      ornamentSetCount: 1,
    })).toThrow('cross-family setKey collision')
  })

  it.each([
    [31, 32, { wordIndex: 0, bitIndex: 31 }],
    [32, 33, { wordIndex: 1, bitIndex: 0 }],
    [63, 64, { wordIndex: 1, bitIndex: 31 }],
    [64, 65, { wordIndex: 2, bitIndex: 0 }],
  ])('maps set id %i within cardinality %i without aliasing', (setId, setCount, expected) => {
    expect(getSetMaskLocation(setId, setCount)).toEqual(expected)
  })

  it('emits named, word-gated scalars beyond ids 31 and 63, with invalid words false', () => {
    const twoWords = generateSetMaskWgsl({ relicSetCount: 64, ornamentSetCount: 64 })
    const threeWords = generateSetMaskWgsl({ relicSetCount: 65, ornamentSetCount: 65 })

    expect(twoWords.relicWordCount).toBe(2)
    expect(twoWords.declarations).toContain('relicMatch2Word1: u32')
    expect(twoWords.declarations).not.toContain('relicMatch2Word2')

    expect(threeWords.relicWordCount).toBe(3)
    expect(threeWords.ornamentWordCount).toBe(3)
    expect(threeWords.declarations).toContain('relicMatch2Word2: u32')
    expect(threeWords.declarations).toContain('relicMatch4Word2: u32')
    expect(threeWords.declarations).toContain('ornamentMatch2Word2: u32')
    expect(threeWords.declarations).toContain('(word == 2u) & ((s.relicMatch2Word2 & bit) != 0u)')
    expect(threeWords.declarations).not.toContain('word %')
    expect(threeWords.declarations).not.toContain('word &')

    expect(getSetMaskLocation(65, 65)).toBeUndefined()
    expect(getSetMaskLocation(96, 65)).toBeUndefined()
  })

  it('computes no match, 2p, 2+2, 4p, and ornament matches across word boundaries', () => {
    expect(evaluateGeneratedArithmetic([31, 32, 63, 64], [31, 32], 65, 65)).toEqual({
      relicMatch2: [0, 0, 0],
      relicMatch4: [0, 0, 0],
      ornamentMatch2: [0, 0, 0],
    })
    expect(evaluateGeneratedArithmetic([32, 32, 0, 1], [31, 32], 65, 65).relicMatch2).toEqual([0, 1, 0])
    expect(evaluateGeneratedArithmetic([31, 31, 64, 64], [31, 32], 65, 65).relicMatch2).toEqual([
      0x80000000,
      0,
      1,
    ])

    const fourPiece = evaluateGeneratedArithmetic([63, 63, 63, 63], [31, 32], 65, 65)
    expect(fourPiece.relicMatch2).toEqual([0, 0x80000000, 0])
    expect(fourPiece.relicMatch4).toEqual([0, 0x80000000, 0])
    expect(evaluateGeneratedArithmetic([0, 1, 2, 3], [64, 64], 65, 65).ornamentMatch2).toEqual([0, 0, 1])
  })

  it('assigns every generated match word and refreshes every outer word without stale fields', () => {
    const generated = generateSetMaskWgsl({ relicSetCount: 65, ornamentSetCount: 65 })

    for (const wordSuffix of ['', 'Word1', 'Word2']) {
      expect(generated.setMatchConstruction).toContain(`sets.relicMatch2${wordSuffix} =`)
      expect(generated.setMatchConstruction).toContain(`sets.relicMatch4${wordSuffix} =`)
      expect(generated.setMatchConstruction).toContain(`sets.ornamentMatch2${wordSuffix} =`)
      expect(generated.outerMaskRefresh.head).toContain(`maskH${wordSuffix} =`)
      expect(generated.outerMaskRefresh.hands).toContain(`maskG${wordSuffix} =`)
      expect(generated.outerMaskRefresh.body).toContain(`maskB${wordSuffix} =`)
      expect(generated.outerMaskRefresh.feet).toContain(`maskF${wordSuffix} =`)
    }
  })

  it('threads one descriptor shape through declarations, construction, and carry refresh', () => {
    const generated = generateSetMaskWgsl({ relicSetCount: 65, ornamentSetCount: 65 })
    const moduleWgsl = injectComputeShader('', generated)
    const carryWgsl = injectCarry(true, generated)

    expect(moduleWgsl).toContain('// Generated capacity-safe set masks: relicWords=3, ornamentWords=3')
    expect(moduleWgsl).toContain('var maskHWord2 =')
    expect(moduleWgsl).toContain('sets.relicMatch2Word2 =')
    expect(moduleWgsl).toContain('sets.ornamentMatch2Word2 =')
    expect(carryWgsl).toContain('maskHWord2 =')
    expect(carryWgsl).toContain('maskFWord2 =')
  })

  it.each([
    ['tuple', true],
    ['naive', false],
  ])('injects all outer carry refreshes in %s mode', (_, tupleMode) => {
    const generated = generateSetMaskWgsl({ relicSetCount: 65, ornamentSetCount: 65 })
    const carry = injectCarry(tupleMode, generated)

    expect(carry).toMatch(/setH = u32\(head\.v5\.z\);[\s\S]*maskHWord2 =/)
    expect(carry).toMatch(/setG = u32\(hands\.v5\.z\);[\s\S]*maskGWord2 =/)
    expect(carry).toMatch(/setB = u32\(body\.v5\.z\);[\s\S]*maskBWord2 =/)
    expect(carry).toMatch(/setF = u32\(feet\.v5\.z\);[\s\S]*maskFWord2 =/)
  })
})
