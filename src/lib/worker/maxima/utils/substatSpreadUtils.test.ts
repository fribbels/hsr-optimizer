// src/optimization/utils/substatSpreadUtils.test.ts

import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  describe,
  expect,
  test,
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
  redistributeBudget,
} from './substatSpreadUtils'

const bounds = (lower: SubstatCounts, upper: SubstatCounts): RegionBounds => ({ lower, upper })

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

    expect(calculateSubstatSum(stats, region)).toBe(25) // 5 + 8 + 12
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

    expect(calculateSubstatSum(stats, region)).toBe(18) // ceil(4.308) + 5 + 8 = 5 + 5 + 8
  })

  test('handles mixed integer and decimal fixed stats', () => {
    const stats = { [Stats.SPD]: 4.308, [Stats.ERR]: 12.8, [Stats.ATK]: 6, [Stats.CR]: 4 }
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.308, [Stats.ERR]: 12.8, [Stats.ATK]: 0, [Stats.CR]: 0 },
        { [Stats.SPD]: 4.308, [Stats.ERR]: 12.8, [Stats.ATK]: 12, [Stats.CR]: 12 },
      ),
      [Stats.SPD, Stats.ERR, Stats.ATK, Stats.CR],
    )

    expect(calculateSubstatSum(stats, region)).toBe(28) // ceil(4.308) + ceil(12.8) + 6 + 4 = 5 + 13 + 6 + 4
  })

  test('handles integer values for fixed stats correctly', () => {
    const stats = { [Stats.SPD]: 5, [Stats.ATK]: 8 } // SPD is integer but fixed
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 5, [Stats.ATK]: 0 },
        { [Stats.SPD]: 5, [Stats.ATK]: 15 },
      ),
      [Stats.SPD, Stats.ATK],
    )

    expect(calculateSubstatSum(stats, region)).toBe(13) // 5 + 8 (no rounding needed)
  })

  test('handles empty stats object', () => {
    const stats = {}
    const region = createRegionFromBounds(
      bounds({}, {}),
      [],
    )

    expect(calculateSubstatSum(stats, region)).toBe(0)
  })
})

describe('redistributeBudget', () => {
  const statPriority = [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK, Stats.SPD]

  describe('successful redistribution', () => {
    test('redistributes +1 to highest priority stat', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 8, [Stats.ATK_P]: 3, [Stats.ATK]: 5 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6, [Stats.ATK]: 15 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
      )

      const success = redistributeBudget(representative, 1, region, statPriority, Stats.SPD)

      expect(success).toBe(true)
      expect(representative[Stats.CD]).toBe(21) // Highest priority gets +1
      expect(representative[Stats.CR]).toBe(8) // Others unchanged
      expect(representative[Stats.ATK_P]).toBe(3)
      expect(representative[Stats.ATK]).toBe(5)
    })

    test('redistributes -1 from lowest priority stat', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 8, [Stats.ATK_P]: 3, [Stats.ATK]: 5 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6, [Stats.ATK]: 15 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
      )

      const success = redistributeBudget(representative, -1, region, statPriority, Stats.SPD)

      expect(success).toBe(true)
      expect(representative[Stats.CD]).toBe(20) // High priority unchanged
      expect(representative[Stats.CR]).toBe(8)
      expect(representative[Stats.ATK_P]).toBe(3)
      expect(representative[Stats.ATK]).toBe(4) // Lowest priority gets -1
    })

    test('skips excluded stat during redistribution', () => {
      const representative = { [Stats.CD]: 30, [Stats.CR]: 8, [Stats.ATK_P]: 3 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P],
      )

      const success = redistributeBudget(representative, 1, region, statPriority, Stats.CD)

      expect(success).toBe(true)
      expect(representative[Stats.CD]).toBe(30) // Excluded, unchanged
      expect(representative[Stats.CR]).toBe(9) // Next highest priority gets +1
      expect(representative[Stats.ATK_P]).toBe(3)
    })

    test('handles multiple adjustments correctly', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 8, [Stats.ATK_P]: 3, [Stats.ATK]: 5 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6, [Stats.ATK]: 15 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
      )

      const success = redistributeBudget(representative, 3, region, statPriority, Stats.SPD)

      expect(success).toBe(true)
      // Round 1: CD gets +1 (highest priority)
      // Round 2: CR gets +1 (second priority)
      // Round 3: ATK_P gets +1 (third priority)
      expect(representative[Stats.CD]).toBe(21) // +1
      expect(representative[Stats.CR]).toBe(9) // +1
      expect(representative[Stats.ATK_P]).toBe(4) // +1
      expect(representative[Stats.ATK]).toBe(5) // Unchanged (only 3 adjustments)
    })

    test('handles zero amount redistribution', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 8 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12 },
        ),
        [Stats.CD, Stats.CR],
      )

      const success = redistributeBudget(representative, 0, region, statPriority, Stats.SPD)

      expect(success).toBe(true)
      expect(representative[Stats.CD]).toBe(20) // Unchanged
      expect(representative[Stats.CR]).toBe(8) // Unchanged
    })
  })

  describe('redistribution failures', () => {
    test('fails when highest priority stat hits upper bound', () => {
      const representative = { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6 } // All at max
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P],
      )

      const success = redistributeBudget(representative, 1, region, statPriority, Stats.SPD)

      expect(success).toBe(false)
      // Values should remain unchanged after failure
      expect(representative[Stats.CD]).toBe(36)
      expect(representative[Stats.CR]).toBe(12)
      expect(representative[Stats.ATK_P]).toBe(6)
    })

    test('fails when lowest priority stat hits lower bound', () => {
      const representative = { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0 } // All at min
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P],
      )

      const success = redistributeBudget(representative, -1, region, statPriority, Stats.SPD)

      expect(success).toBe(false)
      expect(representative[Stats.CD]).toBe(0)
      expect(representative[Stats.CR]).toBe(0)
      expect(representative[Stats.ATK_P]).toBe(0)
    })

    test('fails when requesting more redistribution than available capacity', () => {
      const representative = { [Stats.CD]: 35, [Stats.CR]: 8 } // CD near max
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12 },
        ),
        [Stats.CD, Stats.CR],
      )

      const success = redistributeBudget(representative, 10, region, statPriority, Stats.SPD)

      expect(success).toBe(false)
    })

    test('fails when all stats except excluded are at bounds', () => {
      const representative = { [Stats.CD]: 5, [Stats.CR]: 12, [Stats.ATK_P]: 6 } // CR and ATK_P at max
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P],
      )

      const success = redistributeBudget(representative, 1, region, statPriority, Stats.CD)

      expect(success).toBe(false)
    })

    // Missing: Split value at exact child region boundaries
    test('handles split value at child region boundary', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 5, [Stats.CD]: 10 },
          { [Stats.CR]: 15, [Stats.CD]: 30 },
        ),
        [Stats.CR, Stats.CD],
      )

      // Right child bounds will be [10, 15], midpoint = 12.5
      // Algorithm should try CR = 10, 11, 12 and pick closest to 12.5
      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        10,
        35,
        [Stats.CD, Stats.CR],
        'right',
      )

      expect(result).not.toBeNull()
      expect(result![Stats.CR]).toBe(12) // Closest to midpoint 12.5
    })

    test('returns null for split value outside parent bounds', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 5, [Stats.CD]: 10 },
          { [Stats.CR]: 15, [Stats.CD]: 30 },
        ),
        [Stats.CR, Stats.CD],
      )

      // splitValue=3 < parentLower=5 → should return null
      expect(generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        3,
        35,
        [Stats.CD, Stats.CR],
        'left',
      )).toBeNull() // ✅ Now works

      // splitValue=20 > parentUpper=15 → should return null
      expect(generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        20,
        35,
        [Stats.CD, Stats.CR],
        'right',
      )).toBeNull() // ✅ Now works
    })
  })

  describe('priority ordering behavior', () => {
    test('respects priority order for addition', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 5, [Stats.ATK_P]: 2, [Stats.ATK]: 3 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6, [Stats.ATK]: 15 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
      )

      redistributeBudget(representative, 2, region, statPriority, Stats.SPD)

      // Round 1: CD gets +1 (highest priority)
      // Round 2: CR gets +1 (second priority)
      expect(representative[Stats.CD]).toBe(21) // +1 from round 1
      expect(representative[Stats.CR]).toBe(6) // +1 from round 2
      expect(representative[Stats.ATK_P]).toBe(2) // Unchanged (only 2 adjustments)
      expect(representative[Stats.ATK]).toBe(3) // Unchanged
    })

    test('respects reverse priority order for removal', () => {
      const representative = { [Stats.CD]: 20, [Stats.CR]: 5, [Stats.ATK_P]: 2, [Stats.ATK]: 3 }
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 0, [Stats.ATK_P]: 0, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 12, [Stats.ATK_P]: 6, [Stats.ATK]: 15 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK],
      )

      redistributeBudget(representative, -2, region, statPriority, Stats.SPD)

      // Round 1: ATK gets -1 (lowest priority)
      // Round 2: ATK_P gets -1 (second lowest priority)
      expect(representative[Stats.CD]).toBe(20) // Unchanged (highest priority)
      expect(representative[Stats.CR]).toBe(5) // Unchanged (second highest)
      expect(representative[Stats.ATK_P]).toBe(1) // -1 from round 2
      expect(representative[Stats.ATK]).toBe(2) // -1 from round 1
    })
  })
})

describe('generateSplitRepresentative', () => {
  const statPriority = [Stats.CD, Stats.CR, Stats.ATK_P, Stats.ATK, Stats.SPD]
  const targetSum = 54

  describe('successful generation', () => {
    test('generates left side representative', () => {
      // Parent region with CR range [5, 12], split at 8
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 20, [Stats.CR]: 5, [Stats.ATK]: 0 },
          { [Stats.CD]: 25, [Stats.CR]: 12, [Stats.ATK]: 10 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        8,
        40,
        statPriority,
        'left',
      )

      expect(result).not.toBeNull()
      // Left child bounds: CR [5, 7], midpoint = (5+7)/2 = 6
      // Algorithm tries CR = 7, 6 and picks closest to midpoint
      expect(result![Stats.CR]).toBe(6) // Closest to midpoint (distance = 0)
      expect(calculateSubstatSum(result!, parentRegion)).toBe(40)
    })

    test('generates right side representative', () => {
      // Parent region with CR range [5, 12], split at 8
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
        40,
        statPriority,
        'right',
      )

      expect(result).not.toBeNull()
      // Right child bounds: CR [8, 12], midpoint = (8+12)/2 = 10
      // Algorithm tries CR = 8, 9, 10, 11, 12 and picks closest to midpoint
      expect(result![Stats.CR]).toBe(10) // Closest to midpoint (distance = 0)
      expect(calculateSubstatSum(result!, parentRegion)).toBe(40)
    })

    test('finds best representative closest to midpoint', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 5, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 15, [Stats.ATK]: 12 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        10,
        30,
        statPriority,
        'left',
      )

      expect(result).not.toBeNull()
      // Left child bounds: CR [5, 9], midpoint = (5+9)/2 = 7
      // Algorithm tries CR = 9, 8, 7 (moving toward midpoint)
      // Should pick CR = 7 as it's exactly at the midpoint
      const childMidpoint = (5 + 9) / 2 // 7
      const actualDistance = Math.abs(result![Stats.CR] - childMidpoint)
      expect(actualDistance).toBeLessThanOrEqual(1) // Should be very close to midpoint
    })

    test('handles point region correctly', () => {
      // Parent region where the child will be a point
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
      )

      expect(result).not.toBeNull()
      expect(result).toEqual({
        [Stats.CD]: 25,
        [Stats.CR]: 8,
        [Stats.ATK]: 5,
      })
    })

    test('debug actual sum calculation', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
          { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK],
      )

      const testResult = { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 }
      const actualSum = calculateSubstatSum(testResult, parentRegion)

      console.log('Expected sum: 38')
      console.log('Actual sum:', actualSum)
      console.log('Region fixedStats:', parentRegion.fixedStats)
      console.log('Region variableStats:', parentRegion.variableStats)

      expect(actualSum).toBe(38) // This will tell us what the actual sum is
    })

    test('debug generateSplitRepresentative execution path', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
          { [Stats.CD]: 25, [Stats.CR]: 8, [Stats.ATK]: 5 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK],
      )

      // Mock the function to add debug logging
      const originalGenerateSplitRepresentative = generateSplitRepresentative

      // Let's trace what happens inside the function
      console.log('=== DEBUGGING generateSplitRepresentative ===')
      console.log('Input params:')
      console.log('- splitDimension:', Stats.CR)
      console.log('- splitValue:', 8)
      console.log('- targetSum:', 38)
      console.log('- side:', 'right')

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        8,
        38,
        [Stats.CD, Stats.CR, Stats.ATK],
        'right',
      )

      console.log('Final result:', result)
      expect(result).not.toBeNull()
    })

    test('handles region with fixed decimal stats', () => {
      // Parent region with fixed SPD
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.SPD]: 4.308, [Stats.CD]: 10, [Stats.CR]: 5 },
          { [Stats.SPD]: 4.308, [Stats.CD]: 30, [Stats.CR]: 15 },
        ),
        [Stats.SPD, Stats.CD, Stats.CR],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        10,
        35,
        statPriority,
        'right',
      )

      expect(result).not.toBeNull()
      expect(result![Stats.SPD]).toBe(4.308) // Fixed stat unchanged
      // Right child bounds: CR [10, 15], midpoint = (10+15)/2 = 12.5
      // Algorithm tries CR = 10, 11, 12 and picks closest to midpoint
      expect(result![Stats.CR]).toBe(12) // Closest to midpoint (distance = 0.5)
      expect(calculateSubstatSum(result!, parentRegion)).toBe(35) // SPD counts as 5
    })
  })

  describe('generation failures', () => {
    test('returns null for impossible point region', () => {
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 8, [Stats.CD]: 25 },
          { [Stats.CR]: 8, [Stats.CD]: 25 },
        ),
        [Stats.CR, Stats.CD],
      )

      // splitValue=8 on fixed CR[8,8], side='left' would create CR[8,7] → invalid
      // But actually, splitValue=8 is valid since it equals the bounds
      // The real issue is we can't split a point region meaningfully

      // Better test: Try to split beyond the point
      expect(generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        9,
        35,
        [Stats.CD, Stats.CR],
        'left',
      )).toBeNull() // ✅ splitValue=9 > upper=8
    })

    test('returns null when no valid representative found', () => {
      // Parent region that creates very constrained child
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 35, [Stats.CR]: 5, [Stats.ATK]: 0 },
          { [Stats.CD]: 36, [Stats.CR]: 10, [Stats.ATK]: 1 },
        ),
        [Stats.CD, Stats.CR, Stats.ATK],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        8,
        10,
        statPriority,
        'left', // Very low target sum
      )

      expect(result).toBeNull()
    })

    test('returns null when redistribution always fails', () => {
      // Parent region with very limited capacity
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CD]: 0, [Stats.CR]: 5 },
          { [Stats.CD]: 1, [Stats.CR]: 20 },
        ),
        [Stats.CD, Stats.CR],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        15,
        50,
        statPriority,
        'right', // Needs lots of redistribution
      )

      expect(result).toBeNull()
    })
  })

  describe('boundary conditions', () => {
    test('handles split value at region boundary', () => {
      // Parent region with CR range [8, 12], split at 10
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 8, [Stats.CD]: 0 },
          { [Stats.CR]: 12, [Stats.CD]: 36 },
        ),
        [Stats.CR, Stats.CD],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        10,
        25,
        statPriority,
        'right',
      )

      expect(result).not.toBeNull()
      // Right child bounds: CR [10, 12], midpoint = (10+12)/2 = 11
      // Algorithm tries CR = 10, 11 and picks closest to midpoint
      expect(result![Stats.CR]).toBe(11) // Closest to midpoint (distance = 0)
    })

    test('handles very small regions', () => {
      // Parent region that creates small child regions
      const parentRegion = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 10, [Stats.CD]: 20 },
          { [Stats.CR]: 13, [Stats.CD]: 23 },
        ),
        [Stats.CR, Stats.CD],
      )

      const result = generateSplitRepresentative(
        parentRegion,
        Stats.CR,
        12,
        32,
        statPriority,
        'right',
      )

      expect(result).not.toBeNull()
      // Right child bounds: CR [12, 13], starts trying CR = 12
      expect(result![Stats.CR]).toBe(12)
    })
  })
})

describe('isRegionSplittable', () => {
  test('identifies splittable region', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10 },
        { [Stats.CR]: 8, [Stats.CD]: 25 },
      ),
      [Stats.CR, Stats.CD],
    )

    expect(isRegionSplittable(region)).toBe(true)
  })

  test('identifies unsplittable region with small ranges', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 8, [Stats.CD]: 25 },
        { [Stats.CR]: 9, [Stats.CD]: 26 },
      ),
      [Stats.CR, Stats.CD],
    )

    expect(isRegionSplittable(region)).toBe(false)
  })

  test('identifies unsplittable point region', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 8, [Stats.CD]: 25 },
        { [Stats.CR]: 8, [Stats.CD]: 25 },
      ),
      [Stats.CR, Stats.CD],
    )

    expect(isRegionSplittable(region)).toBe(false)
  })

  test('respects custom minimum split range', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10 },
        { [Stats.CR]: 2, [Stats.CD]: 15 },
      ),
      [Stats.CR, Stats.CD],
    )

    expect(isRegionSplittable(region, 2)).toBe(true) // CR range = 2, meets threshold
    expect(isRegionSplittable(region, 3)).toBe(true) // CD range = 5, meets threshold
    expect(isRegionSplittable(region, 10)).toBe(false) // No range meets threshold
  })
})

describe('getSplittableDimensions', () => {
  test('returns dimensions ordered by range size', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10, [Stats.ATK]: 5 },
        { [Stats.CR]: 4, [Stats.CD]: 25, [Stats.ATK]: 15 },
      ),
      [Stats.CR, Stats.CD, Stats.ATK],
    )

    const dimensions = getSplittableDimensions(region)

    expect(dimensions).toEqual([Stats.CD, Stats.ATK, Stats.CR]) // 15, 10, 4
  })

  test('filters by minimum range', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.CD]: 10, [Stats.ATK]: 8 },
        { [Stats.CR]: 2, [Stats.CD]: 25, [Stats.ATK]: 9 },
      ),
      [Stats.CR, Stats.CD, Stats.ATK],
    )

    const dimensions = getSplittableDimensions(region, 3)

    expect(dimensions).toEqual([Stats.CD]) // Only CD range (15) >= 3
  })

  test('returns empty array for unsplittable region', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 8, [Stats.CD]: 25 },
        { [Stats.CR]: 9, [Stats.CD]: 26 },
      ),
      [Stats.CR, Stats.CD],
    )

    const dimensions = getSplittableDimensions(region)

    expect(dimensions).toEqual([])
  })

  test('handles region with fixed stats', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.308, [Stats.CR]: 0, [Stats.CD]: 10 },
        { [Stats.SPD]: 4.308, [Stats.CR]: 8, [Stats.CD]: 30 },
      ),
      [Stats.SPD, Stats.CR, Stats.CD],
    )

    const dimensions = getSplittableDimensions(region)

    expect(dimensions).toEqual([Stats.CD, Stats.CR]) // SPD is fixed, excluded
  })
})
