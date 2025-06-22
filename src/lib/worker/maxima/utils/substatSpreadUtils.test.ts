// src/optimization/utils/substatSpreadUtils.test.ts

import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'
import {
  createRegionFromBounds,
  type RegionBounds,
} from './regionUtils'
import {
  calculateSubstatSum,
  generateSplitRepresentative,
  getSplittableDimensions,
  isRegionSplittable,
} from './substatSpreadUtils'

const bounds = (lower: SubstatCounts, upper: SubstatCounts): RegionBounds => ({ lower, upper })

// Mock validator for testing
class MockValidator {
  private rejectedPatterns: Set<string> = new Set()

  constructor(rejectedPatterns: string[] = []) {
    rejectedPatterns.forEach((pattern) => this.rejectedPatterns.add(pattern))
  }

  isValidDistribution(stats: SubstatCounts): boolean {
    const pattern = this.statsToPattern(stats)
    return !this.rejectedPatterns.has(pattern)
  }

  private statsToPattern(stats: SubstatCounts): string {
    const relevant = Object.entries(stats)
      .filter(([_, value]) => value > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([stat, value]) => `${stat}:${value}`)
      .join(',')
    return relevant
  }

  addRejectedPattern(stats: SubstatCounts): void {
    this.rejectedPatterns.add(this.statsToPattern(stats))
  }

  reset(): void {
    this.rejectedPatterns.clear()
  }
}

describe('calculateSubstatSum', () => {
  test('calculates sum for integer stats', () => {
    const stats = { [Stats.ATK]: 5, [Stats.CR]: 8, [Stats.CD]: 12 }
    const region = createRegionFromBounds(
      bounds(
        { [Stats.ATK]: 0, [Stats.CR]: 0, [Stats.CD]: 0 },
        { [Stats.ATK]: 10, [Stats.CR]: 12, [Stats.CD]: 36 },
      ),
      [Stats.ATK, Stats.CR, Stats.CD],
    )

    expect(calculateSubstatSum(stats, region)).toBe(25)
  })

  test('rounds up fixed decimal stats', () => {
    const stats = { [Stats.SPD]: 4.308, [Stats.ATK]: 5, [Stats.CR]: 8 }
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.308, [Stats.ATK]: 0, [Stats.CR]: 0 },
        { [Stats.SPD]: 4.308, [Stats.ATK]: 10, [Stats.CR]: 12 },
      ),
      [Stats.SPD, Stats.ATK, Stats.CR],
    )

    expect(calculateSubstatSum(stats, region)).toBe(18) // ceil(4.308) + 5 + 8
  })
})

describe('exhaustive redistribution', () => {
  const statPriority = [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK, Stats.SPD]
  let mockValidator: MockValidator

  beforeEach(() => {
    mockValidator = new MockValidator()
  })

  test('finds valid redistribution when first pattern fails validation', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 30, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 6, [Stats.ATK_P]: 6 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK_P],
    )

    // Reject the pattern where CD gets all the redistribution
    mockValidator.addRejectedPattern({ [Stats.CD]: 32, [Stats.CR]: 0, [Stats.ATK_P]: 0 })

    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      30,
      32,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result![Stats.CD]).toBe(30) // Split dimension fixed
    expect(calculateSubstatSum(result!, region)).toBe(32)
    // Should find alternative pattern like CD:30, CR:2 or CD:30, ATK_P:2
    expect(result![Stats.CR] + result![Stats.ATK_P]).toBe(2)
  })

  test('tries all redistribution patterns before giving up', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 34, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 3, [Stats.ATK_P]: 3 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK_P],
    )

    // Reject first few patterns
    mockValidator.addRejectedPattern({ [Stats.CD]: 36, [Stats.CR]: 0, [Stats.ATK_P]: 0 }) // CD+2
    mockValidator.addRejectedPattern({ [Stats.CD]: 35, [Stats.CR]: 1, [Stats.ATK_P]: 0 }) // CD+1, CR+1
    mockValidator.addRejectedPattern({ [Stats.CD]: 35, [Stats.CR]: 0, [Stats.ATK_P]: 1 }) // CD+1, ATK_P+1
    // But allow CD+0, CR+1, ATK_P+1

    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      34,
      36,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result![Stats.CD]).toBe(34) // Split dimension fixed
    expect(result![Stats.CR]).toBe(1)
    expect(result![Stats.ATK_P]).toBe(1)
    expect(calculateSubstatSum(result!, region)).toBe(36)
  })

  test('returns null when all redistribution patterns fail validation', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 35, [Stats.CR]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 2 },
      ),
      [Stats.CD, Stats.CR],
    )

    // Reject all possible patterns for redistributing +1
    mockValidator.addRejectedPattern({ [Stats.CD]: 36, [Stats.CR]: 0 }) // CD+1
    mockValidator.addRejectedPattern({ [Stats.CD]: 35, [Stats.CR]: 1 }) // CR+1

    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      35,
      36,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).toBeNull()
  })

  test('handles complex redistribution with multiple stats', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 30, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 6, [Stats.ATK_P]: 6, [Stats.ATK]: 6 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
    )

    // Need to redistribute +3, reject simpler patterns
    mockValidator.addRejectedPattern({ [Stats.CD]: 33, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 }) // CD+3
    mockValidator.addRejectedPattern({ [Stats.CD]: 32, [Stats.CR]: 1, [Stats.ATK_P]: 0, [Stats.ATK]: 0 }) // CD+2, CR+1
    mockValidator.addRejectedPattern({ [Stats.CD]: 31, [Stats.CR]: 2, [Stats.ATK_P]: 0, [Stats.ATK]: 0 }) // CD+1, CR+2
    // But allow CD+1, CR+1, ATK_P+1

    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      30,
      33,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result![Stats.CD]).toBe(30)
    expect(result![Stats.CR]).toBe(1)
    expect(result![Stats.ATK_P]).toBe(1)
    expect(result![Stats.ATK]).toBe(1)
    expect(calculateSubstatSum(result!, region)).toBe(33)
  })

  test('uses round-robin fallback for large problems', () => {
    // Create a problem large enough to trigger round-robin fallback
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 20, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0, [Stats.SPD]: 1, [Stats.HP]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 18, [Stats.ATK]: 15, [Stats.SPD]: 6, [Stats.HP]: 10 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK, Stats.SPD, Stats.HP],
    )

    // This should use round-robin (large adjustment + many stats)
    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      20,
      40, // Need +15 redistribution, triggers fallback
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result![Stats.CD]).toBe(20)
    expect(calculateSubstatSum(result!, region)).toBe(40)
  })

  test('prefers simpler redistribution patterns', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 34, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 6, [Stats.ATK_P]: 6, [Stats.ATK]: 6 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
    )

    const result = generateSplitRepresentative(
      region,
      Stats.CD,
      34,
      36,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result![Stats.CD]).toBe(34)

    // Should prefer simpler pattern (one stat gets +2) over complex pattern (two stats get +1 each)
    const redistributedStats = [result![Stats.CR], result![Stats.ATK_P], result![Stats.ATK]]
    const nonZeroStats = redistributedStats.filter((val) => val > 0)

    // Simpler patterns should be tried first, so we expect fewer stats involved
    expect(nonZeroStats.length).toBeLessThanOrEqual(2)
  })
})

describe('generateSplitRepresentative with validation', () => {
  const statPriority = [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK]
  let mockValidator: MockValidator

  beforeEach(() => {
    mockValidator = new MockValidator()
  })

  test('generates valid left side representative', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 20, [Stats.CR]: 5, [Stats.ATK]: 0 },
        { [Stats.CD]: 30, [Stats.CR]: 12, [Stats.ATK]: 10 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK],
    )

    const result = generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      8,
      35,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(mockValidator.isValidDistribution(result!)).toBe(true)
    expect(calculateSubstatSum(result!, parentRegion)).toBe(35)

    // Left child bounds: CR [5, 7], result should be within these bounds
    expect(result![Stats.CR]).toBeGreaterThanOrEqual(5)
    expect(result![Stats.CR]).toBeLessThanOrEqual(7)
  })

  test('generates valid right side representative', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 20, [Stats.CR]: 5, [Stats.ATK]: 0 },
        { [Stats.CD]: 30, [Stats.CR]: 12, [Stats.ATK]: 10 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK],
    )

    const result = generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      8,
      35,
      statPriority,
      'right',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(mockValidator.isValidDistribution(result!)).toBe(true)
    expect(calculateSubstatSum(result!, parentRegion)).toBe(35)

    // Right child bounds: CR [8, 12], result should be within these bounds
    expect(result![Stats.CR]).toBeGreaterThanOrEqual(8)
    expect(result![Stats.CR]).toBeLessThanOrEqual(12)
  })

  test('returns null when no valid representative can be generated', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 30, [Stats.CR]: 5 },
        { [Stats.CD]: 36, [Stats.CR]: 8 },
      ),
      [Stats.CD, Stats.CR],
    )

    // Reject all possible distributions
    for (let cd = 30; cd <= 36; cd++) {
      for (let cr = 5; cr <= 8; cr++) {
        if (cd + cr === 35) {
          mockValidator.addRejectedPattern({ [Stats.CD]: cd, [Stats.CR]: cr })
        }
      }
    }

    const result = generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      6,
      35,
      statPriority,
      'left',
      mockValidator,
    )

    expect(result).toBeNull()
  })

  test('finds closest representative to child region midpoint', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 25, [Stats.CR]: 10, [Stats.ATK]: 0 },
        { [Stats.CD]: 30, [Stats.CR]: 20, [Stats.ATK]: 15 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK],
    )

    const result = generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      15,
      40,
      statPriority,
      'right',
      mockValidator,
    )

    expect(result).not.toBeNull()

    // Right child bounds: CR [15, 20], midpoint = 17.5
    // Algorithm should find representative closest to CR = 17 or 18
    const childMidpoint = (15 + 20) / 2 // 17.5
    const distance = Math.abs(result![Stats.CR] - childMidpoint)
    expect(distance).toBeLessThanOrEqual(1.5) // Should be close to midpoint
  })

  test('handles point regions correctly', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
        { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
      ),
      [Stats.CD, Stats.CR, Stats.ATK],
    )

    const result = generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      8,
      38,
      statPriority,
      'right',
      mockValidator,
    )

    expect(result).not.toBeNull()
    expect(result).toEqual({
      [Stats.CD]: 25,
      [Stats.CR]: 8,
      [Stats.ATK]: 5,
    })
  })

  test('validates final representative before returning', () => {
    const parentRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 30, [Stats.CR]: 0 },
        { [Stats.CD]: 36, [Stats.CR]: 10 },
      ),
      [Stats.CD, Stats.CR],
    )

    // Create specific validation that will catch the final result
    const spyValidator = {
      isValidDistribution: vi.fn().mockReturnValue(true),
    }

    generateSplitRepresentative(
      parentRegion,
      Stats.CR,
      5,
      35,
      statPriority,
      'left',
      spyValidator,
    )

    // Should have called validation during redistribution process
    expect(spyValidator.isValidDistribution).toHaveBeenCalled()
  })
})

describe('utility functions', () => {
  test('isRegionSplittable identifies splittable regions', () => {
    const splittable = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10 },
        { [Stats.CR]: 8, [Stats.CD]: 25 },
      ),
      [Stats.CR, Stats.CD],
    )

    const unsplittable = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 8, [Stats.CD]: 25 },
        { [Stats.CR]: 8, [Stats.CD]: 25 },
      ),
      [Stats.CR, Stats.CD],
    )

    expect(isRegionSplittable(splittable)).toBe(true)
    expect(isRegionSplittable(unsplittable)).toBe(false)
  })

  test('getSplittableDimensions returns ordered dimensions', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10, [Stats.ATK]: 5 },
        { [Stats.CR]: 4, [Stats.CD]: 25, [Stats.ATK]: 15 },
      ),
      [Stats.CR, Stats.CD, Stats.ATK],
    )

    const dimensions = getSplittableDimensions(region)
    expect(dimensions).toEqual([Stats.CD, Stats.ATK, Stats.CR]) // By range: 15, 10, 4
  })
})
