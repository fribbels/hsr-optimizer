// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { resolveEidolon, resolveFlexibleLC } from './buildCodec'
import type { LightConeId } from 'types/lightCone'

describe('resolveFlexibleLC', () => {
  const LC_A = '21001' as LightConeId
  const LC_B = '21002' as LightConeId

  it('same LC, saved SI lower than current → keeps current SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_A, 5)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 5 })
  })

  it('same LC, saved SI higher than current → uses saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 5, LC_A, 2)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 5 })
  })

  it('same LC, equal SI → returns unchanged', () => {
    const result = resolveFlexibleLC(LC_A, 3, LC_A, 3)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 3 })
  })

  it('different LC → uses saved LC and saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_B, 5)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 2 })
  })

  it('different LC, saved SI lower → still uses saved LC and saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_B, 1)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 2 })
  })
})

describe('resolveEidolon', () => {
  it('returns max of saved and current eidolon', () => {
    expect(resolveEidolon(2, 4)).toBe(4)
    expect(resolveEidolon(6, 0)).toBe(6)
    expect(resolveEidolon(3, 3)).toBe(3)
  })
})
