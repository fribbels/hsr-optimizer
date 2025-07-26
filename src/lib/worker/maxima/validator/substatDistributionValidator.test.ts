import {
  Stats,
  StatsValues,
} from 'lib/constants/constants'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import {
  describe,
  expect,
  it,
} from 'vitest'

function createValidator(mainStats?: {
  simBody?: string,
  simFeet?: string,
  simPlanarSphere?: string,
  simLinkRope?: string,
}) {
  return new SubstatDistributionValidator(
    54,
    {
      simBody: mainStats?.simBody ?? Stats.ATK_P,
      simFeet: mainStats?.simFeet ?? Stats.ATK_P,
      simPlanarSphere: mainStats?.simPlanarSphere ?? Stats.Lightning_DMG,
      simLinkRope: mainStats?.simLinkRope ?? Stats.ATK_P,
    },
  )
}

function createDistribution(stats: Record<string, number>) {
  return stats
}

describe('SubstatDistributionValidator', () => {
  describe('Valid distributions', () => {
    it('should validate a simple balanced distribution', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK]: 2,
        [Stats.ATK_P]: 15,
        [Stats.CR]: 6,
        [Stats.CD]: 4,
        [Stats.EHR]: 3,
        [Stats.SPD]: 24,
      })

      expect(validator.isValidDistribution(distribution)).toBe(true)
    })

    it('should validate distribution with high roll counts', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK]: 2,
        [Stats.ATK_P]: 18,
        [Stats.CR]: 18,
        [Stats.CD]: 18,
        [Stats.EHR]: 3,
        [Stats.SPD]: 24,
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })

    it('should validate distribution where ATK% uses maximum capacity', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 18, // 18 rolls / 3 available pieces = 6 rolls each (max)
        [Stats.CR]: 12,
        [Stats.CD]: 6,
        [Stats.EHR]: 3,
        [Stats.SPD]: 15,
      })

      expect(validator.isValidDistribution(distribution)).toBe(true)
    })
  })

  describe('Invalid distributions - basic capacity violations', () => {
    it('should reject when stat exceeds maximum possible rolls', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 19, // 19 > 3 pieces * 6 rolls = 18 max
        [Stats.SPD]: 24,
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })

    it('should reject when stat cannot fit', () => {
      // Only 2 pieces for ATK% to appear, but needs 3 pieces
      const validator = createValidator({
        simBody: Stats.ATK_P,
        simFeet: Stats.ATK_P,
        simPlanarSphere: Stats.ATK_P,
        simLinkRope: Stats.ATK_P,
      })

      const distribution = createDistribution({
        [Stats.ATK_P]: 13,
        [Stats.CR]: 6,
        [Stats.CD]: 6,
        [Stats.EHR]: 6,
        [Stats.SPD]: 24,
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })
  })

  describe('Invalid distributions - assignment capacity violations', () => {
    it('should reject when minimum assignments exceed 24 slots', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 18, // minPieces = 3
        [Stats.CR]: 36, // minPieces = 6
        [Stats.CD]: 36, // minPieces = 6
        [Stats.SPD]: 36, // minPieces = 6
        [Stats.EHR]: 25, // minPieces = 5 (ceil(25/6) = 5)
        // Total minPieces = 26, which exceeds 24 available slots
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })

    it('should reject when maximum assignments are insufficient', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 18, // maxPieces = 3
        [Stats.CR]: 12, // maxPieces = 6
        [Stats.CD]: 5, // maxPieces = 5
        [Stats.EHR]: 3, // maxPieces = 3
        [Stats.SPD]: 24, // maxPieces = 6
        // Total maxPieces = 23, need 24
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })
  })

  describe('Invalid distributions - insufficient eligible stats per piece', () => {
    it('should reject when a piece has fewer than 4 eligible substats', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 6, // Can't appear on ATK% main pieces (pieces 0,1,3)
        [Stats.CR]: 6,
        [Stats.CD]: 6,
        // Only 3 active stats, but each piece needs 4 substats
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty distribution', () => {
      const validator = createValidator()
      const distribution = createDistribution({})

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })
  })

  describe('Different main stat configurations', () => {
    it('should validate with different main stats that affect availability', () => {
      // Configuration where SPD is a main stat, reducing its availability
      const validator = createValidator({
        simFeet: Stats.SPD,
      })

      const distribution = createDistribution({
        [Stats.ATK_P]: 12, // 5 pieces available (not simBody, simFeet, simLinkRope)
        [Stats.SPD]: 25, // 5 pieces available (not simFeet)
        [Stats.CR]: 6,
        [Stats.CD]: 6,
        [Stats.EHR]: 5,
      })

      expect(validator.isValidDistribution(distribution)).toBe(true)
    })

    it('should reject when main stat configuration creates conflicts', () => {
      // Make CR a main stat to reduce its availability
      const validator = createValidator({
        simBody: Stats.CR,
      })

      const distribution = createDistribution({
        [Stats.CR]: 30, // Needs too many pieces, but only 5 available now
        [Stats.CD]: 6,
        [Stats.EHR]: 6,
        [Stats.SPD]: 12,
      })

      expect(validator.isValidDistribution(distribution)).toBe(false)
    })
  })

  describe('Real-world scenarios from examples', () => {
    const scenarios: Scenario[] = [
      {
        name: 'Valid - Example 1',
        distribution: {
          [Stats.ATK]: 2,
          [Stats.ATK_P]: 15,
          [Stats.CR]: 6,
          [Stats.CD]: 4,
          [Stats.EHR]: 3,
          [Stats.SPD]: 24,
        },
        expected: true,
      },
      {
        name: 'Valid - Example 2 without ATK',
        distribution: {
          [Stats.ATK_P]: 15,
          [Stats.CR]: 6,
          [Stats.CD]: 6,
          [Stats.EHR]: 3,
          [Stats.SPD]: 24,
        },
        expected: true,
      },
      {
        name: 'Invalid - CD insufficient capacity',
        distribution: {
          [Stats.ATK_P]: 18,
          [Stats.CR]: 12,
          [Stats.CD]: 5, // Only 5 rolls, max 5 pieces, but need 24 total assignments
          [Stats.EHR]: 3,
          [Stats.SPD]: 24,
        },
        expected: false,
      },
    ]

    scenarios.forEach(({ name, distribution, expected }: Scenario) => {
      it(name, () => {
        const validator = createValidator()
        expect(validator.isValidDistribution(distribution)).toBe(expected)
      })
    })
  })
})

type Scenario = { name: string, distribution: Record<string, number>, expected: boolean }
