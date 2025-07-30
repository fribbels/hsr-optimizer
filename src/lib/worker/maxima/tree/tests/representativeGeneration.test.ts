import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  SearchTree,
  TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('generateRepresentative tests', () => {
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
      [Stats.RES]: 0,
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

  function calculateSum(stats: SubstatCounts): number {
    return Object.values(stats).reduce((sum, val) => sum + val, 0)
  }

  function verifyUpperLowerRepresentatives(tree: SearchTree, region: TreeStatRegion, splitDimension: string) {
    const lowerRep = tree.generateRepresentative(region, splitDimension, false)
    const upperRep = tree.generateRepresentative(region, splitDimension, true)

    expect(calculateSum(lowerRep)).toBe(tree.targetSum)
    expect(calculateSum(upperRep)).toBe(tree.targetSum)

    expect(tree.substatValidator.isValidDistribution(lowerRep)).toBe(true)
    expect(tree.substatValidator.isValidDistribution(upperRep)).toBe(true)

    expect(upperRep[splitDimension]).toBeGreaterThanOrEqual(lowerRep[splitDimension])

    return {
      upperRep,
      lowerRep,
    }
  }

  describe('Basic Representative Generation', () => {
    it('should generate valid representatives for both split sides of simple region', () => {
      const tree = initializeTree()
      const region = createRegion(
        {
          [Stats.ATK]: 5,
          [Stats.ATK_P]: 3,
          [Stats.HP]: 0,
          [Stats.HP_P]: 2,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 4,
          [Stats.CD]: 6,
          [Stats.EHR]: 3,
          [Stats.RES]: 0,
          [Stats.BE]: 8,
        },
        {
          [Stats.ATK]: 15,
          [Stats.ATK_P]: 10,
          [Stats.HP]: 0,
          [Stats.HP_P]: 12,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 14,
          [Stats.CD]: 16,
          [Stats.EHR]: 13,
          [Stats.RES]: 0,
          [Stats.BE]: 18,
        },
      )

      verifyUpperLowerRepresentatives(tree, region, Stats.ATK)
    })

    it('should start with lower bounds and distribute upward for both sides', () => {
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
          [Stats.BE]: 2,
        },
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
          [Stats.BE]: 20,
        },
      )

      const { lowerRep, upperRep } = verifyUpperLowerRepresentatives(tree, region, Stats.CR)

      // Should have at least the minimum values for corresponding regions
      expect(lowerRep[Stats.ATK]).toBeGreaterThanOrEqual(2)
      expect(upperRep[Stats.ATK]).toBeGreaterThanOrEqual(2)
    })
  })

  describe('SPD Decimal Handling', () => {
    it('should apply Math.ceil to SPD when it has decimal values for both sides', () => {
      const tree = initializeTree({
        minSubstatRollCounts: {
          [Stats.ATK]: 0,
          [Stats.ATK_P]: 0,
          [Stats.HP]: 0,
          [Stats.HP_P]: 0,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 4.3,
          [Stats.CR]: 0,
          [Stats.CD]: 0,
          [Stats.EHR]: 0,
          [Stats.RES]: 0,
          [Stats.BE]: 0,
        },
        maxSubstatRollCounts: {
          [Stats.ATK]: 30,
          [Stats.ATK_P]: 20,
          [Stats.HP]: 0,
          [Stats.HP_P]: 30,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 4.3,
          [Stats.CR]: 30,
          [Stats.CD]: 25,
          [Stats.EHR]: 30,
          [Stats.RES]: 0,
          [Stats.BE]: 30,
        },
      })

      const region = createRegion(tree.root.region.lower, tree.root.region.upper)
      const { lowerRep, upperRep } = verifyUpperLowerRepresentatives(tree, region, Stats.CR)

      expect(lowerRep[Stats.SPD]).toBe(5)
      expect(upperRep[Stats.SPD]).toBe(5)
    })
  })

  describe('Target Sum Variants', () => {
    it('should work correctly with targetSum=48 for both sides', () => {
      const tree = initializeTree({ targetSum: 48 })
      const region = tree.root.region

      const { lowerRep, upperRep } = verifyUpperLowerRepresentatives(tree, region, Stats.CR)

      expect(calculateSum(lowerRep)).toBe(48)
      expect(calculateSum(upperRep)).toBe(48)
    })

    it('should handle minimal budget scenarios for both sides', () => {
      const tree = initializeTree({
        targetSum: 48,
        maxSubstatRollCounts: {
          [Stats.ATK]: 15,
          [Stats.ATK_P]: 12,
          [Stats.HP]: 0,
          [Stats.HP_P]: 15,
          [Stats.DEF]: 0,
          [Stats.DEF_P]: 0,
          [Stats.SPD]: 0,
          [Stats.CR]: 15,
          [Stats.CD]: 12,
          [Stats.EHR]: 15,
          [Stats.RES]: 0,
          [Stats.BE]: 15,
        },
      })
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
          [Stats.BE]: 28, // Sum = 40, only 8 to distribute
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
          [Stats.BE]: 30,
        },
      )

      const { lowerRep, upperRep } = verifyUpperLowerRepresentatives(tree, region, Stats.CR)

      expect(calculateSum(lowerRep)).toBe(48)
      expect(calculateSum(upperRep)).toBe(48)
    })
  })

  describe('Edge Cases and Error Conditions', () => {
    it('should handle all stats at minimum bounds scenario for both sides', () => {
      const tree = initializeTree({
        minSubstatRollCounts: {
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
          [Stats.BE]: 24, // Forces most budget into BE
        },
      })

      const region = createRegion(tree.root.region.lower, tree.root.region.upper)
      const { lowerRep, upperRep } = verifyUpperLowerRepresentatives(tree, region, Stats.CR)

      expect(lowerRep[Stats.BE]).toBe(24) // Should respect minimum
      expect(upperRep[Stats.BE]).toBe(24) // Should respect minimum
    })
  })
})
