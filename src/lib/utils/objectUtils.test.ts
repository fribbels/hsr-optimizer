import {
  clone,
  mergeDefinedValues,
  mergeUndefinedValues,
  objectHash,
} from 'lib/utils/objectUtils'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('clone', () => {
  it('returns null for null input', () => {
    expect(clone(null)).toBe(null)
  })
  it('returns undefined for undefined input', () => {
    expect(clone(undefined)).toBe(undefined)
  })
  it('returns 0 for 0 input', () => {
    expect(clone(0)).toBe(0)
  })
  it('returns empty string for empty string input', () => {
    expect(clone('')).toBe('')
  })
  it('deep clones objects', () => {
    const obj = { a: { b: 1 } }
    const result = clone(obj)
    expect(result).toEqual(obj)
    expect(result).not.toBe(obj)
    expect(result.a).not.toBe(obj.a)
  })
})

describe('mergeUndefinedValues', () => {
  it('fills missing keys from source', () => {
    const target = { a: 1 } as Record<string, unknown>
    const source = { a: 99, b: 2 }
    mergeUndefinedValues(target, source)
    expect(target.a).toBe(1)
    expect(target.b).toBe(2)
  })

  it('clones object values so source is not corrupted by mutations', () => {
    const source = { nested: { items: [1, 2, 3] } }
    const target = {} as Record<string, unknown>
    mergeUndefinedValues(target, source)
    ;(target.nested as { items: number[] }).items.push(4)

    expect(source.nested.items).toEqual([1, 2, 3])
  })

  it('clones array values so source is not corrupted by mutations', () => {
    const source = { tuple: [undefined, true] as [undefined, boolean] }
    const target = {} as Record<string, unknown>
    mergeUndefinedValues(target, source)
    ;(target.tuple as [undefined, boolean])[1] = false

    expect(source.tuple[1]).toBe(true)
  })

  it('passes primitive values through without overhead', () => {
    const source = { n: 42, s: 'hello', b: true }
    const target = {} as Record<string, unknown>
    mergeUndefinedValues(target, source)
    expect(target).toEqual({ n: 42, s: 'hello', b: true })
  })
})

describe('mergeDefinedValues', () => {
  it('overwrites target keys with defined source values', () => {
    const target = { a: 1, b: 2 } as Record<string, unknown>
    const source = { a: 99 }
    mergeDefinedValues(target, source)
    expect(target.a).toBe(99)
    expect(target.b).toBe(2)
  })

  it('clones object values so source is not corrupted by mutations', () => {
    const source = { items: [1, 2, 3] }
    const target = { items: [] as number[] } as Record<string, unknown>
    mergeDefinedValues(target, source)
    ;(target.items as number[]).push(4)

    expect(source.items).toEqual([1, 2, 3])
  })

  it('returns target unchanged when source is undefined', () => {
    const target = { a: 1 } as Record<string, unknown>
    const result = mergeDefinedValues(target, undefined)
    expect(result).toBe(target)
    expect(result).toEqual({ a: 1 })
  })
})

describe('objectHash', () => {
  it('produces deterministic hashes regardless of key order', () => {
    expect(objectHash({ b: 2, a: 1 })).toBe(objectHash({ a: 1, b: 2 }))
  })
})
