import {
  getSupportedFlags,
  hasExEidolon,
  setExEidolon,
} from 'lib/conditionals/exEidolons'
import { ExEidolon } from 'types/character'
import {
  describe,
  expect,
  test,
} from 'vitest'

describe('EX eidolon flags', () => {
  test.each([
    [0, 1, 0],
    [1, 0, 0],
    [3, 1, 1],
    [3, 2, 2],
    [3, 3, 3],
  ])('getSupportedFlags(%s, %s) keeps %s', (flags, supported, expected) => {
    expect(getSupportedFlags(flags, supported)).toBe(expected)
  })

  test('missing and zero masks disable EX1', () => {
    expect(hasExEidolon(undefined, ExEidolon.EX1)).toBe(false)
    expect(hasExEidolon(0, ExEidolon.EX1)).toBe(false)
    expect(setExEidolon(0, ExEidolon.EX1, false)).toBe(0)
  })

  test('EX1 is independently enabled without replacing other bits', () => {
    expect(setExEidolon(0, ExEidolon.EX1, true)).toBe(1)
    expect(setExEidolon(2, ExEidolon.EX1, true)).toBe(3)
    expect(hasExEidolon(2, ExEidolon.EX1)).toBe(false)
    expect(hasExEidolon(3, ExEidolon.EX1)).toBe(true)
  })

  test('disabling EX1 preserves other bits and repeated toggles are stable', () => {
    expect(setExEidolon(3, ExEidolon.EX1, false)).toBe(2)
    expect(setExEidolon(1, ExEidolon.EX1, true)).toBe(1)
    expect(setExEidolon(2, ExEidolon.EX1, false)).toBe(2)
  })
})
