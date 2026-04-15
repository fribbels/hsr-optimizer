import {
  bitpackBooleanArray,
  isSetSolutionValid,
} from 'lib/optimization/relicSetSolver'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('isSetSolutionValid', () => {
  it('returns true for valid (1) positions in bitpacked array', () => {
    const arr = [1, 0, 1, 0]
    const bitpacked = bitpackBooleanArray(arr)
    expect(isSetSolutionValid(bitpacked, 0)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 2)).toBe(true)
  })

  it('returns false for invalid (0) positions in bitpacked array', () => {
    const arr = [1, 0, 1, 0]
    const bitpacked = bitpackBooleanArray(arr)
    expect(isSetSolutionValid(bitpacked, 1)).toBe(false)
    expect(isSetSolutionValid(bitpacked, 3)).toBe(false)
  })

  it('handles indices across multiple packed i32 values', () => {
    const arr = Array.from({ length: 64 }, () => 0)
    arr[0] = 1
    arr[31] = 1
    arr[32] = 1
    arr[63] = 1
    const bitpacked = bitpackBooleanArray(arr)

    expect(isSetSolutionValid(bitpacked, 0)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 31)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 32)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 63)).toBe(true)
    expect(isSetSolutionValid(bitpacked, 15)).toBe(false)
    expect(isSetSolutionValid(bitpacked, 47)).toBe(false)
  })
})
