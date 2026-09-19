import {
  bitpackBooleanArray,
  isSetSolutionValid,
} from 'lib/optimization/setSolutionBitset'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('isSetSolutionValid', () => {
  it('returns the value stored at an index', () => {
    const bitpacked = bitpackBooleanArray([1, 0, 1, 0])

    expect(isSetSolutionValid(bitpacked, 0)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 1)).toBe(false)
    expect(isSetSolutionValid(bitpacked, 2)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 3)).toBe(false)
  })

  it('handles indices across multiple packed words', () => {
    const values = Array.from({ length: 64 }, () => 0)
    values[0] = 1
    values[31] = 1
    values[32] = 1
    values[63] = 1
    const bitpacked = bitpackBooleanArray(values)

    expect(isSetSolutionValid(bitpacked, 0)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 31)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 32)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 63)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 15)).toBe(false)
    expect(isSetSolutionValid(bitpacked, 47)).toBe(false)
  })

  it('handles indices above the signed i32 range', () => {
    const index = 216 ** 4 - 1
    const packedIndex = Math.floor(index / 32)
    const bitpacked: number[] = []
    bitpacked[packedIndex] = 1 << (index & 31)

    expect(isSetSolutionValid(bitpacked, index)).toBe(true)
  })
})
