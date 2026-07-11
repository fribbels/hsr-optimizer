import {
  truncate10000ths,
  truncate1000ths,
  truncate100ths,
  truncate10ths,
} from 'lib/utils/mathUtils'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('truncate functions', () => {
  it('truncate10ths', () => {
    expect(truncate10ths(16.1999)).toBe(16.1)
    expect(truncate10ths(0)).toBe(0)
    expect(truncate10ths(-1.99)).toBe(-2)
  })
  it('truncate100ths', () => {
    expect(truncate100ths(16.1999)).toBe(16.19)
  })
  it('truncate1000ths', () => {
    expect(truncate1000ths(16.1999)).toBe(16.199)
  })
  it('truncate10000ths', () => {
    expect(truncate10000ths(16.19999)).toBe(16.1999)
  })
})
