// src/optimization/utils/regionUtils.test.ts

import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  calculateRegionVolume,
  createRegionFromBounds,
  getStatRange,
  RegionBounds,
} from 'lib/worker/maxima/utils/regionUtils'
import {
  describe,
  expect,
  test,
} from 'vitest'

const bounds = (lower: SubstatCounts, upper: SubstatCounts): RegionBounds => ({ lower, upper })

describe('createRegionFromBounds', () => {
  describe('stat classification accuracy', () => {
    test('correctly identifies mixed fixed and variable stats', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.ATK]: 0, [Stats.SPD]: 4.308, [Stats.CR]: 10 },
          { [Stats.ATK]: 10, [Stats.SPD]: 4.308, [Stats.CR]: 15 },
        ),
        [Stats.ATK, Stats.SPD, Stats.CR],
      )

      expect(region.fixedStats).toEqual([Stats.SPD])
      expect(region.variableStats).toEqual([Stats.ATK, Stats.CR])
      expect(region.statNames).toEqual([Stats.ATK, Stats.SPD, Stats.CR])
    })

    test('handles all fixed stats scenario', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.ATK]: 5, [Stats.SPD]: 4.308, [Stats.HP]: 0 },
          { [Stats.ATK]: 5, [Stats.SPD]: 4.308, [Stats.HP]: 0 },
        ),
        [Stats.ATK, Stats.SPD, Stats.HP],
      )

      expect(region.fixedStats).toEqual([Stats.ATK, Stats.SPD, Stats.HP])
      expect(region.variableStats).toEqual([])
    })

    test('handles all variable stats scenario', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.ATK_P]: 0, [Stats.CR]: 2, [Stats.CD]: 5 },
          { [Stats.ATK_P]: 12, [Stats.CR]: 8, [Stats.CD]: 36 },
        ),
        [Stats.ATK_P, Stats.CR, Stats.CD],
      )

      expect(region.fixedStats).toEqual([])
      expect(region.variableStats).toEqual([Stats.ATK_P, Stats.CR, Stats.CD])
    })

    test('identifies zero-bounded fixed stats', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.HP_P]: 0, [Stats.DEF_P]: 0, [Stats.CR]: 0 },
          { [Stats.HP_P]: 0, [Stats.DEF_P]: 5, [Stats.CR]: 8 },
        ),
        [Stats.HP_P, Stats.DEF_P, Stats.CR],
      )

      expect(region.fixedStats).toEqual([Stats.HP_P])
      expect(region.variableStats).toEqual([Stats.DEF_P, Stats.CR])
    })
  })

  describe('realistic substat scenarios', () => {
    test('typical distribution bounds', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.ATK_P]: 0, [Stats.ATK]: 0, [Stats.SPD]: 4.308, [Stats.CR]: 0, [Stats.CD]: 0 },
          { [Stats.ATK_P]: 6, [Stats.ATK]: 12, [Stats.SPD]: 4.308, [Stats.CR]: 12, [Stats.CD]: 36 },
        ),
        [Stats.ATK_P, Stats.ATK, Stats.SPD, Stats.CR, Stats.CD],
      )

      expect(region.fixedStats).toEqual([Stats.SPD])
      expect(region.variableStats).toEqual([Stats.ATK_P, Stats.ATK, Stats.CR, Stats.CD])
    })

    test('single variable stat optimization', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.CD]: 12 }, { [Stats.CD]: 36 }),
        [Stats.CD],
      )

      expect(region.variableStats).toEqual([Stats.CD])
      expect(region.fixedStats).toEqual([])
    })
  })

  describe('boundary conditions', () => {
    test('single point region becomes fixed stat', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.CR]: 15 }, { [Stats.CR]: 15 }),
        [Stats.CR],
      )

      expect(region.fixedStats).toEqual([Stats.CR])
      expect(region.variableStats).toEqual([])
    })

    test('minimal range creates variable stat', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.CR]: 0 }, { [Stats.CR]: 1 }),
        [Stats.CR],
      )

      expect(region.fixedStats).toEqual([])
      expect(region.variableStats).toEqual([Stats.CR])
    })

    test('maximum typical range creates variable stat', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.CD]: 0 }, { [Stats.CD]: 36 }), // Max CRIT DMG range
        [Stats.CD],
      )

      expect(region.fixedStats).toEqual([])
      expect(region.variableStats).toEqual([Stats.CD])
    })

    test('decimal fixed stat remains fixed', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.SPD]: 4.308 }, { [Stats.SPD]: 4.308 }), // Base SPD value
        [Stats.SPD],
      )

      expect(region.fixedStats).toEqual([Stats.SPD])
      expect(region.variableStats).toEqual([])
    })

    test('very small decimal range creates variable stat', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.SPD]: 4.0 }, { [Stats.SPD]: 4.1 }),
        [Stats.SPD],
      )

      expect(region.fixedStats).toEqual([])
      expect(region.variableStats).toEqual([Stats.SPD])
    })

    test('large integer range creates variable stat', () => {
      const region = createRegionFromBounds(
        bounds({ [Stats.ATK]: 0 }, { [Stats.ATK]: 500 }), // Extreme range
        [Stats.ATK],
      )

      expect(region.fixedStats).toEqual([])
      expect(region.variableStats).toEqual([Stats.ATK])
    })
  })
})

describe('calculateRegionVolume', () => {
  test('computes volume from variable stat ranges only', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.ATK_P]: 0, [Stats.SPD]: 4.308, [Stats.CR]: 5, [Stats.CD]: 10 },
        { [Stats.ATK_P]: 3, [Stats.SPD]: 4.308, [Stats.CR]: 8, [Stats.CD]: 25 },
      ),
      [Stats.ATK_P, Stats.SPD, Stats.CR, Stats.CD],
    )
    // Volume = (3-0) * (8-5) * (25-10) = 3 * 3 * 15 = 135
    // SPD is fixed, doesn't contribute
    expect(calculateRegionVolume(region)).toBe(135)
  })

  test('handles single variable stat', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.CR]: 0, [Stats.SPD]: 4.308 },
        { [Stats.CR]: 12, [Stats.SPD]: 4.308 },
      ),
      [Stats.CR, Stats.SPD],
    )
    expect(calculateRegionVolume(region)).toBe(12)
  })

  test('returns 1 for all-fixed region', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.308, [Stats.ERR]: 12.8 },
        { [Stats.SPD]: 4.308, [Stats.ERR]: 12.8 },
      ),
      [Stats.SPD, Stats.ERR],
    )
    expect(calculateRegionVolume(region)).toBe(1)
  })

  test('handles large realistic volumes', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.ATK_P]: 0, [Stats.ATK]: 0, [Stats.CR]: 0, [Stats.CD]: 0, [Stats.SPD]: 0 },
        { [Stats.ATK_P]: 6, [Stats.ATK]: 12, [Stats.CR]: 12, [Stats.CD]: 36, [Stats.SPD]: 12 },
      ),
      [Stats.ATK_P, Stats.ATK, Stats.CR, Stats.CD, Stats.SPD],
    )
    // Volume = 6 * 12 * 12 * 36 * 12 = 373,248
    expect(calculateRegionVolume(region)).toBe(373248)
  })

  test('computes volume for typical damage dealer build', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.ATK_P]: 0, [Stats.ATK]: 5, [Stats.CR]: 8, [Stats.CD]: 20 },
        { [Stats.ATK_P]: 6, [Stats.ATK]: 15, [Stats.CR]: 12, [Stats.CD]: 36 },
      ),
      [Stats.ATK_P, Stats.ATK, Stats.CR, Stats.CD],
    )
    // Volume = (6-0) * (15-5) * (12-8) * (36-20) = 6 * 10 * 4 * 16 = 3,840
    expect(calculateRegionVolume(region)).toBe(3840)
  })

  test('handles decimal ranges in volume calculation', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.0, [Stats.ERR]: 10.5 },
        { [Stats.SPD]: 8.5, [Stats.ERR]: 15.2 },
      ),
      [Stats.SPD, Stats.ERR],
    )
    // Volume = (8.5-4.0) * (15.2-10.5) = 4.5 * 4.7 = 21.15
    expect(calculateRegionVolume(region)).toBeCloseTo(21.15)
  })

  describe('edge cases', () => {
    test('empty region returns minimum volume', () => {
      const region = { lower: {}, upper: {}, statNames: [], fixedStats: [], variableStats: [] }
      expect(calculateRegionVolume(region)).toBe(1)
    })

    test('mixed zero and non-zero ranges', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.ATK]: 5, [Stats.CR]: 3, [Stats.CD]: 15 },
          { [Stats.ATK]: 5, [Stats.CR]: 8, [Stats.CD]: 15 },
        ),
        [Stats.ATK, Stats.CR, Stats.CD],
      )
      // Volume = (8-3) = 5 (ATK and CD have zero range)
      expect(calculateRegionVolume(region)).toBe(5)
    })

    test('single unit ranges multiply correctly', () => {
      const region = createRegionFromBounds(
        bounds(
          { [Stats.CR]: 10, [Stats.CD]: 25, [Stats.ATK]: 8 },
          { [Stats.CR]: 11, [Stats.CD]: 26, [Stats.ATK]: 9 },
        ),
        [Stats.CR, Stats.CD, Stats.ATK],
      )
      // Volume = (11-10) * (26-25) * (9-8) = 1 * 1 * 1 = 1
      expect(calculateRegionVolume(region)).toBe(1)
    })
  })
})

describe('getStatRange', () => {
  const region = createRegionFromBounds(
    bounds(
      { [Stats.ATK_P]: 0, [Stats.SPD]: 4.308, [Stats.CR]: 2, [Stats.CD]: 5 },
      { [Stats.ATK_P]: 6, [Stats.SPD]: 4.308, [Stats.CR]: 12, [Stats.CD]: 36 },
    ),
    [Stats.ATK_P, Stats.SPD, Stats.CR, Stats.CD],
  )

  test('calculates ATK% range correctly', () => {
    expect(getStatRange(region, Stats.ATK_P)).toBe(6) // 6 - 0
  })

  test('calculates SPD range correctly for fixed stat', () => {
    expect(getStatRange(region, Stats.SPD)).toBe(0) // 4.308 - 4.308
  })

  test('calculates CRIT Rate range correctly', () => {
    expect(getStatRange(region, Stats.CR)).toBe(10) // 12 - 2
  })

  test('calculates CRIT DMG range correctly', () => {
    expect(getStatRange(region, Stats.CD)).toBe(31) // 36 - 5
  })

  test('handles decimal ranges accurately', () => {
    const decimalRegion = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 2.5, [Stats.ERR]: 10.3 },
        { [Stats.SPD]: 8.7, [Stats.ERR]: 15.9 },
      ),
      [Stats.SPD, Stats.ERR],
    )

    expect(getStatRange(decimalRegion, Stats.SPD)).toBeCloseTo(6.2) // 8.7 - 2.5
    expect(getStatRange(decimalRegion, Stats.ERR)).toBeCloseTo(5.6) // 15.9 - 10.3
  })

  test('handles zero range for point regions', () => {
    const pointRegion = createRegionFromBounds(
      bounds(
        { [Stats.ATK]: 15, [Stats.CR]: 8 },
        { [Stats.ATK]: 15, [Stats.CR]: 8 },
      ),
      [Stats.ATK, Stats.CR],
    )

    expect(getStatRange(pointRegion, Stats.ATK)).toBe(0)
    expect(getStatRange(pointRegion, Stats.CR)).toBe(0)
  })

  test('handles very small decimal differences', () => {
    const smallRangeRegion = createRegionFromBounds(
      bounds(
        { [Stats.SPD]: 4.0 },
        { [Stats.SPD]: 4.001 },
      ),
      [Stats.SPD],
    )

    expect(getStatRange(smallRangeRegion, Stats.SPD)).toBeCloseTo(0.001)
  })

  test('handles large integer ranges', () => {
    const largeRegion = createRegionFromBounds(
      bounds(
        { [Stats.ATK]: 0 },
        { [Stats.ATK]: 1000 },
      ),
      [Stats.ATK],
    )

    expect(getStatRange(largeRegion, Stats.ATK)).toBe(1000)
  })

  test('calculates range for maximum CRIT DMG scenario', () => {
    const maxCritRegion = createRegionFromBounds(
      bounds(
        { [Stats.CD]: 0 },
        { [Stats.CD]: 36 }, // Maximum possible CRIT DMG from substats
      ),
      [Stats.CD],
    )

    expect(getStatRange(maxCritRegion, Stats.CD)).toBe(36)
  })
})
