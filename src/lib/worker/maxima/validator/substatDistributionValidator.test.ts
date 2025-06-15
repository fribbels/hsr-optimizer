import { Stats } from 'lib/constants/constants'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { SubstatDistributionValidator } from 'lib/worker/maxima/substatDistributionValidator'
import {
  describe,
  expect,
  it,
} from 'vitest'

function createTestInput(mainStats: {
  simBody?: string,
  simFeet?: string,
  simPlanarSphere?: string,
  simLinkRope?: string,
} = {}): ComputeOptimalSimulationWorkerInput {
  return {
    partialSimulationWrapper: {
      simulation: {
        request: {
          simBody: mainStats.simBody || Stats.ATK_P,
          simFeet: mainStats.simFeet || Stats.ATK_P,
          simPlanarSphere: mainStats.simPlanarSphere || Stats.Lightning_DMG,
          simLinkRope: mainStats.simLinkRope || Stats.ATK_P,
        },
      },
    },
    metadata: {
      substats: [Stats.HP_P, Stats.ATK_P, Stats.DEF_P, Stats.CR, Stats.CD, Stats.EHR, Stats.RES, Stats.BE],
    },
  } as ComputeOptimalSimulationWorkerInput
}

function createValidator(mainStats?: Parameters<typeof createTestInput>[0]) {
  return new SubstatDistributionValidator(createTestInput(mainStats))
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

      expect(validator.isValidDistribution(distribution)).toBe(true)
    })

    it('should validate distribution where ATK% uses maximum capacity', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 18, // 18 rolls / 3 available pieces = 6 rolls each (max)
        [Stats.CR]: 12,
        [Stats.CD]: 6,
        [Stats.EHR]: 3,
        [Stats.SPD]: 24,
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

    it('should handle distribution with zero rolls', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 0,
        [Stats.CR]: 6,
        [Stats.CD]: 6,
        [Stats.EHR]: 6,
        [Stats.SPD]: 6,
      })

      expect(validator.isValidDistribution(distribution)).toBe(true)
    })

    it('should handle distribution with exactly minimum viable stats', () => {
      const validator = createValidator()
      const distribution = createDistribution({
        [Stats.ATK_P]: 3, // Must appear on 3 pieces (not ATK% main pieces)
        [Stats.CR]: 6, // Can appear on all 6 pieces, 1 roll each
        [Stats.CD]: 6, // Can appear on all 6 pieces, 1 roll each
        [Stats.EHR]: 6, // Can appear on all 6 pieces, 1 roll each
        [Stats.SPD]: 3, // Appears on remaining 3 pieces
        // Total: 3+6+6+6+3 = 24 assignments exactly
      })

      expect(validator.isValidDistribution(distribution)).toBe(true)
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
