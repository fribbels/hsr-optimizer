import {
  Parts,
  RelicSetFilterOptions,
} from 'lib/constants/constants'
import {
  bitpackBooleanArray,
  computeValidPermutationCount,
  generateOrnamentSetSolutions,
  generateRelicSetSolutions,
  isSetSolutionValid,
} from 'lib/optimization/relicSetSolver'
import { zeroCountsBySet } from 'lib/relics/relicFilters'
import {
  OrnamentSetToIndex,
  RelicSetToIndex,
  SetsOrnamentsNames,
  SetsRelicsNames,
} from 'lib/sets/setConfigRegistry'
import type { Form } from 'types/form'
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

describe('computeValidPermutationCount', () => {
  function makeForm(overrides: Partial<Form> = {}): Form {
    return {
      relicSets: [],
      ornamentSets: [],
      ...overrides,
    } as Form
  }

  const SET_A = SetsRelicsNames[0]
  const SET_B = SetsRelicsNames[1]
  const SET_A_IDX = RelicSetToIndex[SET_A]
  const SET_B_IDX = RelicSetToIndex[SET_B]
  const ORN_A_IDX = OrnamentSetToIndex[SetsOrnamentsNames[0]]

  it('with no set filter, equals the naive slot product', () => {
    const c = zeroCountsBySet()
    c[Parts.Head][SET_A_IDX] = 3
    c[Parts.Hands][SET_A_IDX] = 4
    c[Parts.Body][SET_A_IDX] = 2
    c[Parts.Feet][SET_A_IDX] = 5
    c[Parts.PlanarSphere][ORN_A_IDX] = 6
    c[Parts.LinkRope][ORN_A_IDX] = 7

    const form = makeForm()
    const relicSol = generateRelicSetSolutions(form)
    const ornSol = generateOrnamentSetSolutions(form)

    expect(computeValidPermutationCount(c, relicSol, ornSol)).toBe(3 * 4 * 2 * 5 * 6 * 7)
  })

  it('returns 0 when 2+Any of setA is required and no setA relics remain', () => {
    const c = zeroCountsBySet()
    // Non-setA relics present, zero setA relics
    // where min-enhance filter excluded all setA relics.
    c[Parts.Head][SET_B_IDX] = 10
    c[Parts.Hands][SET_B_IDX] = 10
    c[Parts.Body][SET_B_IDX] = 10
    c[Parts.Feet][SET_B_IDX] = 10
    c[Parts.PlanarSphere][ORN_A_IDX] = 5
    c[Parts.LinkRope][ORN_A_IDX] = 5

    const form = makeForm({ relicSets: [[RelicSetFilterOptions.relic2PlusAny, SET_A]] })
    const relicSol = generateRelicSetSolutions(form)
    const ornSol = generateOrnamentSetSolutions(form)

    expect(computeValidPermutationCount(c, relicSol, ornSol)).toBe(0)
  })

  it('counts only permutations with ≥2 setA pieces for a 2+Any setA filter', () => {
    const c = zeroCountsBySet()
    // 1 setA and 1 setB in every relic slot. Naive product is 2^4 = 16, but only
    // 4-tuples with ≥2 setA pieces are valid (not all 16).
    c[Parts.Head][SET_A_IDX] = 1
    c[Parts.Head][SET_B_IDX] = 1
    c[Parts.Hands][SET_A_IDX] = 1
    c[Parts.Hands][SET_B_IDX] = 1
    c[Parts.Body][SET_A_IDX] = 1
    c[Parts.Body][SET_B_IDX] = 1
    c[Parts.Feet][SET_A_IDX] = 1
    c[Parts.Feet][SET_B_IDX] = 1
    c[Parts.PlanarSphere][ORN_A_IDX] = 1
    c[Parts.LinkRope][ORN_A_IDX] = 1

    const form = makeForm({ relicSets: [[RelicSetFilterOptions.relic2PlusAny, SET_A]] })
    const relicSol = generateRelicSetSolutions(form)
    const ornSol = generateOrnamentSetSolutions(form)

    // Valid 4-tuples over {A,B}^4 with ≥2 A's: C(4,2)+C(4,3)+C(4,4) = 6+4+1 = 11
    expect(computeValidPermutationCount(c, relicSol, ornSol)).toBe(11)
  })

  it('enforces 4pc setA by requiring setA in every relic slot', () => {
    const c = zeroCountsBySet()
    c[Parts.Head][SET_A_IDX] = 2
    c[Parts.Head][SET_B_IDX] = 3
    c[Parts.Hands][SET_A_IDX] = 2
    c[Parts.Hands][SET_B_IDX] = 3
    c[Parts.Body][SET_A_IDX] = 2
    c[Parts.Body][SET_B_IDX] = 3
    c[Parts.Feet][SET_A_IDX] = 2
    c[Parts.Feet][SET_B_IDX] = 3
    c[Parts.PlanarSphere][ORN_A_IDX] = 1
    c[Parts.LinkRope][ORN_A_IDX] = 1

    const form = makeForm({ relicSets: [[RelicSetFilterOptions.relic4Piece, SET_A]] })
    const relicSol = generateRelicSetSolutions(form)
    const ornSol = generateOrnamentSetSolutions(form)

    expect(computeValidPermutationCount(c, relicSol, ornSol)).toBe(2 * 2 * 2 * 2 * 1 * 1)
  })

  it('returns 0 when any relic slot is empty', () => {
    const c = zeroCountsBySet()
    c[Parts.Head][SET_A_IDX] = 1
    // Hands intentionally empty
    c[Parts.Body][SET_A_IDX] = 1
    c[Parts.Feet][SET_A_IDX] = 1
    c[Parts.PlanarSphere][ORN_A_IDX] = 1
    c[Parts.LinkRope][ORN_A_IDX] = 1

    const form = makeForm()
    const relicSol = generateRelicSetSolutions(form)
    const ornSol = generateOrnamentSetSolutions(form)

    expect(computeValidPermutationCount(c, relicSol, ornSol)).toBe(0)
  })
})
