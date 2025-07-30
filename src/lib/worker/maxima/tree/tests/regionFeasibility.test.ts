import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  SearchTree,
  TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'
import { isRegionFeasible } from 'lib/worker/maxima/validator/regionFeasibilityValidator'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('isRegionFeasible tests', () => {
  function initializeTree(
    overrides?: {
      minSubstatRollCounts?: SubstatCounts,
      maxSubstatRollCounts?: SubstatCounts,
      mainStats?: string[],
      targetSum?: number,
    },
  ) {
    const mains = {
      simBody: Stats.ATK_P,
      simFeet: Stats.ATK_P,
      simPlanarSphere: Stats.Lightning_DMG,
      simLinkRope: Stats.ATK_P,
    }
    const targetSum = overrides?.targetSum ?? 54
    const substatValidator = new SubstatDistributionValidator(targetSum, mains)

    const maxIterations = 20000
    const minSubstatRollCounts = overrides?.minSubstatRollCounts ?? {
      [Stats.ATK]: 0,
      [Stats.ATK_P]: 0,
      [Stats.HP]: 0,
      [Stats.HP_P]: 0,
      [Stats.DEF]: 0,
      [Stats.DEF_P]: 0,
      [Stats.SPD]: 0,
      [Stats.CR]: 0,
      [Stats.CD]: 0,
      [Stats.EHR]: 0,
      [Stats.RES]: 0,
      [Stats.BE]: 0,
    }
    const maxSubstatRollCounts = overrides?.maxSubstatRollCounts ?? {
      [Stats.ATK]: 36,
      [Stats.ATK_P]: 18,
      [Stats.HP]: 0,
      [Stats.HP_P]: 36,
      [Stats.DEF]: 0,
      [Stats.DEF_P]: 0,
      [Stats.SPD]: 0,
      [Stats.CR]: 36,
      [Stats.CD]: 30,
      [Stats.EHR]: 36,
      [Stats.RES]: 36,
      [Stats.BE]: 36,
    }

    const mainStats = overrides?.mainStats ?? [
      Stats.HP,
      Stats.ATK,
      mains.simBody,
      mains.simFeet,
      mains.simPlanarSphere,
      mains.simLinkRope,
    ]

    function damageFunction(stats: SubstatCounts): number {
      return 1
    }

    return new SearchTree(
      targetSum,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      mainStats,
      damageFunction,
      substatValidator,
    )
  }

  function createRegion(lower: SubstatCounts, upper: SubstatCounts): TreeStatRegion {
    return { lower, upper }
  }

  describe('Basic Feasibility Tests', () => {
    it('should accept the root region as feasible', () => {
      const tree = initializeTree()
      expect(isRegionFeasible(tree.root.region, tree)).toBe(true)
    })

    it('should accept a valid feasible subregion', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 5,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 10,
          [Stats.CD]: 15,
          [Stats.EHR]: 10,
          [Stats.RES]: 0,
          [Stats.BE]: 4,
        },
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 10,
          [Stats.HP]: 0,
          [Stats.HP_P]: 10,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 15,
          [Stats.CD]: 20,
          [Stats.EHR]: 15,
          [Stats.RES]: 0,
          [Stats.BE]: 8,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(true)
    })

    it('should accept point regions (min = max) when valid', () => {
      const tree = initializeTree()
      const validPoint = {
        [Stats.ATK]: 10,
        [Stats.ATK_P]: 8,
        [Stats.HP]: 0,
        [Stats.HP_P]: 10,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.SPD]: 0,
        [Stats.CR]: 8,
        [Stats.CD]: 10,
        [Stats.EHR]: 8,
        [Stats.RES]: 0,
        [Stats.BE]: 0,
      }
      const region = createRegion(validPoint, validPoint)
      expect(isRegionFeasible(region, tree)).toBe(true)
    })
  })

  describe('Sum Constraint Violations', () => {
    it('should reject region where minimum sum exceeds target', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 20,
          [Stats.ATK_P]: 20,
          [Stats.HP]: 0,
          [Stats.HP_P]: 20,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 20,
          [Stats.CD]: 20,
          [Stats.EHR]: 20,
          [Stats.RES]: 0,
          [Stats.BE]: 20, // Sum = 140, above 54
        },
        {
          [Stats.ATK]: 30,
          [Stats.ATK_P]: 30,
          [Stats.HP]: 0,
          [Stats.HP_P]: 30,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 30,
          [Stats.CD]: 30,
          [Stats.EHR]: 30,
          [Stats.RES]: 0,
          [Stats.BE]: 30,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(false)
    })

    it('should reject region where maximum sum is below target', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 0,
          [Stats.ATK_P]: 0,
          [Stats.HP]: 0,
          [Stats.HP_P]: 0,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 0,
          [Stats.CD]: 0,
          [Stats.EHR]: 0,
          [Stats.RES]: 0,
          [Stats.BE]: 0,
        },
        {
          [Stats.ATK]: 5,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 0,
          [Stats.BE]: 5, // Sum = 30, below 54
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(false)
    })

    it('should handle edge case where the only possible point exactly equals target', () => {
      const tree = initializeTree()
      const exactSum = {
        [Stats.ATK]: 5,
        [Stats.ATK_P]: 5,
        [Stats.HP]: 0,
        [Stats.HP_P]: 5,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.SPD]: 0,
        [Stats.CR]: 5,
        [Stats.CD]: 5,
        [Stats.EHR]: 5,
        [Stats.RES]: 0,
        [Stats.BE]: 24,
      }
      const region = createRegion(exactSum, exactSum)
      expect(isRegionFeasible(region, tree)).toBe(true)
    })
  })

  describe('Piece Capacity Violations', () => {
    // Disabled temporarily, see code notes
    // it('should reject when ATK_P exceeds its reduced capacity due to main stat conflicts', () => {
    //   const tree = initializeTree()
    //   const region = createRegion(
    //     {
    //       [Stats.ATK]: 0,
    //       [Stats.ATK_P]: 19, // Exceeds 3 × 6 = 18
    //       [Stats.HP]: 0,
    //       [Stats.HP_P]: 0,
    //       [Stats.DEF]: 0,
    //       [Stats.DEF_P]: 0,
    //       [Stats.SPD]: 0,
    //       [Stats.CR]: 0,
    //       [Stats.CD]: 0,
    //       [Stats.EHR]: 0,
    //       [Stats.RES]: 0,
    //       [Stats.BE]: 0,
    //     },
    //     {
    //       [Stats.ATK]: 5,
    //       [Stats.ATK_P]: 25,
    //       [Stats.HP]: 0,
    //       [Stats.HP_P]: 5,
    //       [Stats.DEF]: 0,
    //       [Stats.DEF_P]: 0,
    //       [Stats.SPD]: 0,
    //       [Stats.CR]: 5,
    //       [Stats.CD]: 5,
    //       [Stats.EHR]: 5,
    //       [Stats.RES]: 0,
    //       [Stats.BE]: 40,
    //     },
    //   )
    //   expect(isRegionFeasible(region, tree)).toBe(false)
    // })

    it('should accept when stat exactly equals available capacity', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 5,
          [Stats.BE]: 14,
        },
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 5,
          [Stats.BE]: 14,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(true)
    })
  })

  describe('Slot Deficit Analysis', () => {
    it('should reject when slot deficit exceeds remaining rolls', () => {
      const tree = initializeTree()
      // Create scenario where we need more slots than we have rolls to fill them
      const region = createRegion(
        {
          [Stats.ATK]: 1, // These small minimums create slot requirements
          [Stats.ATK_P]: 1,
          [Stats.HP]: 20,
          [Stats.HP_P]: 1,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 1,
          [Stats.CD]: 1,
          [Stats.EHR]: 1,
          [Stats.RES]: 0,
          [Stats.BE]: 27, // High minimum leaves little room for adjustments
        },
        {
          [Stats.ATK]: 2,
          [Stats.ATK_P]: 2,
          [Stats.HP]: 20,
          [Stats.HP_P]: 2,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 2,
          [Stats.CD]: 2,
          [Stats.EHR]: 2,
          [Stats.RES]: 0,
          [Stats.BE]: 28,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(false)
    })

    it('should accept when slot requirements can be satisfied', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 2,
          [Stats.ATK_P]: 2,
          [Stats.HP]: 0,
          [Stats.HP_P]: 2,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 2,
          [Stats.CD]: 2,
          [Stats.EHR]: 2,
          [Stats.RES]: 0,
          [Stats.BE]: 6,
        },
        {
          [Stats.ATK]: 8,
          [Stats.ATK_P]: 8,
          [Stats.HP]: 0,
          [Stats.HP_P]: 8,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 8,
          [Stats.CD]: 8,
          [Stats.EHR]: 8,
          [Stats.RES]: 0,
          [Stats.BE]: 20,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(true)
    })
  })

  describe('Eligible Substats Per Piece Violations', () => {
    // Disabled temporarily, see code notes
    // it('should reject when piece cannot have 4 eligible substats due to main stat conflicts', () => {
    //   const tree = initializeTree({
    //     mainStats: [
    //       Stats.HP,
    //       Stats.ATK,
    //       Stats.CD,
    //       Stats.ATK_P,
    //       Stats.ATK_P,
    //       Stats.BE,
    //     ],
    //     maxSubstatRollCounts: {
    //       [Stats.ATK]: 36,
    //       [Stats.ATK_P]: 0,
    //       [Stats.HP]: 0,
    //       [Stats.HP_P]: 0,
    //       [Stats.DEF]: 0,
    //       [Stats.DEF_P]: 0,
    //       [Stats.SPD]: 2,
    //       [Stats.CR]: 36,
    //       [Stats.CD]: 30,
    //       [Stats.EHR]: 0,
    //       [Stats.RES]: 0,
    //       [Stats.BE]: 0,
    //     },
    //   })
    //
    //   const region = tree.root.region
    //   expect(isRegionFeasible(region, tree)).toBe(false)
    // })

    it('should accept when all pieces have sufficient eligible substats', () => {
      const tree = initializeTree({
        mainStats: [
          Stats.HP,
          Stats.ATK,
          Stats.CR,
          Stats.ATK_P,
          Stats.Ice_DMG,
          Stats.ATK_P,
        ],
        maxSubstatRollCounts: {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 10,
          [Stats.HP]: 0,
          [Stats.HP_P]: 0,
          [Stats.DEF]: 10,
          [Stats.DEF_P]: 10,
          [Stats.SPD]: 0,
          [Stats.CR]: 10,
          [Stats.CD]: 10,
          [Stats.EHR]: 10,
          [Stats.RES]: 0,
          [Stats.BE]: 4,
        },
      })

      const region = createRegion(
        {
          [Stats.ATK]: 5,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 0,
          [Stats.DEF]: 5,
          [Stats.DEF_P]: 5,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 0,
          [Stats.BE]: 4,
        },
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 10,
          [Stats.HP]: 0,
          [Stats.HP_P]: 0,
          [Stats.DEF]: 10,
          [Stats.DEF_P]: 10,
          [Stats.SPD]: 0,
          [Stats.CR]: 10,
          [Stats.CD]: 10,
          [Stats.EHR]: 10,
          [Stats.RES]: 0,
          [Stats.BE]: 4,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(true)
    })
  })

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle regions with zero-width dimensions', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 8,
          [Stats.HP]: 0,
          [Stats.HP_P]: 10,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 8,
          [Stats.CD]: 10,
          [Stats.EHR]: 8,
          [Stats.RES]: 0,
          [Stats.BE]: 0,
        },
        {
          [Stats.ATK]: 15,
          [Stats.ATK_P]: 8,
          [Stats.HP]: 0,
          [Stats.HP_P]: 15,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 12,
          [Stats.CD]: 15,
          [Stats.EHR]: 12,
          [Stats.RES]: 0,
          [Stats.BE]: 5,
        },
      )
      expect(isRegionFeasible(region, tree)).toBe(true)
    })

    it('should handle different target sums correctly', () => {
      const tree48 = initializeTree({ targetSum: 48 })

      // Same region, different target sums
      const region = createRegion(
        {
          [Stats.ATK]: 5,
          [Stats.ATK_P]: 5,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 0,
          [Stats.BE]: 10,
        },
        {
          [Stats.ATK]: 10,
          [Stats.ATK_P]: 10,
          [Stats.HP]: 0,
          [Stats.HP_P]: 5,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 5,
          [Stats.CD]: 5,
          [Stats.EHR]: 5,
          [Stats.RES]: 0,
          [Stats.BE]: 10,
        },
      )

      expect(isRegionFeasible(region, tree48)).toBe(true)
    })
  })
})
