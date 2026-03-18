import { describe, expect, it } from 'vitest'
import { clone, objectHash } from 'lib/utils/objectUtils'

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

describe('objectHash', () => {
  it('produces deterministic hashes regardless of key order', () => {
    expect(objectHash({ b: 2, a: 1 })).toBe(objectHash({ a: 1, b: 2 }))
  })
})
