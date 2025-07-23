import {
  Stats,
  StatsValues,
} from 'lib/constants/constants'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import { Stat } from 'types/relic'
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

    it('analyze 4-tier hierarchical grid granularity by tiers', async () => {
      const validator = createValidator()
      const MAX_VAL = 36
      const OPTIMIZATION_DIMENSIONS = 7 // Only non-SPD dimensions for coordinate generation
      const DIMENSIONS = 8 // Total dimensions including SPD

      // Include SPD in optimization but fix it to 0 for this run
      const statNames: StatsValues[] = [Stats.HP_P, Stats.HP, Stats.ATK_P, Stats.CR, Stats.CD, Stats.EHR, Stats.BE, Stats.SPD]
      const FIXED_SPD_VALUE = 12 // SPD fixed to 0 rolls for this analysis
      const TARGET_SUM = 54 - FIXED_SPD_VALUE

      const mainStats = [
        Stats.HP,
        Stats.ATK,
        Stats.CR,
        Stats.ATK_P,
        Stats.Lightning_DMG,
        Stats.ATK_P,
      ]

      // [[0, 4], [5, 36]],
      // [[0, 0], [1, 12], [13, 24], [25, 36]],
      // [[0, 0], [1, 6], [7, 12], [13, 18], [19, 24], [25, 30], [31, 36]],
      // [[0, 0], [1, 4], [5, 20], [21, 36]],
      // [[0, 0], [1, 4], [5, 12], [13, 20], [21, 28], [29, 36]],

      // Predefined intervals for each level (inclusive ranges)
      const INTERVAL_DEFINITIONS: [number, number][][] = [
        [[0, 31], [32, 36]],
        [[0, 0], [1, 16], [17, 32], [33, 36]],
        [[0, 0], [1, 8], [9, 16], [17, 24], [25, 32], [33, 36]],
        [[0, 0], [1, 4], [5, 8], [9, 12], [13, 16], [17, 20], [21, 24], [25, 28], [29, 32], [33, 36]],
        [
          [0, 0],
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 8],
          [9, 10],
          [11, 12],
          [13, 14],
          [15, 16],
          [17, 18],
          [19, 20],
          [21, 22],
          [23, 24],
          [25, 26],
          [27, 28],
          [29, 30],
          [31, 32],
          [33, 34],
          [35, 36],
        ],
      ]

      const intervalsPerDim = INTERVAL_DEFINITIONS.map((level) => level.length)
      const totalCells = intervalsPerDim.map((intervals) => Math.pow(intervals, OPTIMIZATION_DIMENSIONS))

      const yieldControl = () => new Promise((resolve) => setTimeout(resolve, 0))

      function getAvailablePieces(stat: string): number {
        return mainStats.filter((mainStat) => mainStat !== stat).length
      }

      // Helper function to convert cell index to coordinates (7D for non-SPD dims)
      function getCellCoordinates(cellIndex: number, intervals: number): number[] {
        const coords = []
        let remaining = cellIndex
        for (let i = 0; i < OPTIMIZATION_DIMENSIONS; i++) {
          coords.push(remaining % intervals)
          remaining = Math.floor(remaining / intervals)
        }
        return coords
      }

      // Helper function to convert coordinates to cell index (7D for non-SPD dims)
      function getCellIndex(coords: number[], intervals: number): number {
        let index = 0
        let multiplier = 1
        for (let i = 0; i < OPTIMIZATION_DIMENSIONS; i++) {
          index += coords[i] * multiplier
          multiplier *= intervals
        }
        return index
      }

      // Helper function to get cell bounds from cell index and level
      function getCellBounds(cellIndex: number, level: number): Array<{ min: number, max: number }> {
        const intervals = intervalsPerDim[level]
        const coords = getCellCoordinates(cellIndex, intervals) // 7D coordinates for non-SPD
        const levelIntervals = INTERVAL_DEFINITIONS[level]

        const bounds = []

        // Handle the 7 non-SPD dimensions
        for (let i = 0; i < OPTIMIZATION_DIMENSIONS; i++) {
          bounds.push({
            min: levelIntervals[coords[i]][0],
            max: levelIntervals[coords[i]][1],
          })
        }

        // Add SPD as fixed dimension (8th dimension)
        bounds.push({ min: FIXED_SPD_VALUE, max: FIXED_SPD_VALUE })

        return bounds
      }

      // Helper function to find which child intervals a parent interval maps to
      function getChildIntervals(parentInterval: [number, number], childLevel: number): number[] {
        const childIntervals = INTERVAL_DEFINITIONS[childLevel]
        const [parentMin, parentMax] = parentInterval
        const childIndices: number[] = []

        for (let i = 0; i < childIntervals.length; i++) {
          const [childMin, childMax] = childIntervals[i]

          // Check if child interval overlaps with parent interval
          if (childMin <= parentMax && childMax >= parentMin) {
            childIndices.push(i)
          }
        }

        return childIndices
      }

      // Helper function to get child cell indices from parent
      function getChildCells(parentIndex: number, parentLevel: number): number[] {
        if (parentLevel >= INTERVAL_DEFINITIONS.length - 1) return []

        const parentIntervals = intervalsPerDim[parentLevel]
        const childIntervals = intervalsPerDim[parentLevel + 1]
        const parentCoords = getCellCoordinates(parentIndex, parentIntervals)

        // Get parent interval ranges for each non-SPD dimension (7D)
        const parentRanges = parentCoords.map((coord) => INTERVAL_DEFINITIONS[parentLevel][coord])

        // Find all valid child coordinate combinations
        const childCells: number[] = []

        function generateChildren(dimIndex: number, currentCoords: number[]) {
          if (dimIndex === OPTIMIZATION_DIMENSIONS) {
            childCells.push(getCellIndex(currentCoords, childIntervals))
            return
          }

          const parentRange = parentRanges[dimIndex]
          const validChildIndices = getChildIntervals(parentRange, parentLevel + 1)

          for (const childIndex of validChildIndices) {
            currentCoords[dimIndex] = childIndex
            generateChildren(dimIndex + 1, [...currentCoords])
          }
        }

        generateChildren(0, [])
        return childCells
      }

      // Helper function to calculate efficiency metrics
      function calculateEfficiency(feasibleCells: number, totalCells: number, totalAnalyzed: number): { efficiency: number, filteringSavings: number } {
        const efficiency = (feasibleCells / totalCells) * 100
        const filteringSavings = totalAnalyzed > 0 ? ((totalCells - totalAnalyzed) / totalCells) * 100 : 0
        return { efficiency, filteringSavings }
      }

      function isCellFeasible(cellIndex: number, level: number): boolean {
        const bounds = getCellBounds(cellIndex, level)
        const mins = bounds.map((b) => b.min)
        const maxs = bounds.map((b) => b.max)
        mins[7] = FIXED_SPD_VALUE
        maxs[7] = FIXED_SPD_VALUE

        // The possible ranges must include the target 54
        const sumMin = mins.reduce((a, b) => a + b, 0)
        const sumMax = maxs.reduce((a, b) => a + b, 0)
        if ((sumMin > TARGET_SUM || sumMax < TARGET_SUM)) return false

        // Must have enough pieces to fit each stat with minimum rolls
        for (let i = 0; i < DIMENSIONS; i++) {
          const stat = statNames[i]
          const minRolls = mins[i]
          const availablePieces = getAvailablePieces(stat)
          if (minRolls > availablePieces * 6) return false
        }

        // Each piece must have at least 4 eligible substats available
        for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
          const pieceMainStat = mainStats[pieceIndex]
          const eligibleStats = statNames.filter((stat, i) => {
            // Stat is eligible if:
            // 1. Not the same as piece main stat
            // 2. Could potentially have rolls in this cell (maxs[i] > 0)
            return stat !== pieceMainStat && maxs[i] > 0
          })
          if (eligibleStats.length < 4) return false
        }

        // Heuristic, no valid build should have 10+ flat stats
        for (let i = 0; i < DIMENSIONS; i++) {
          const stat = statNames[i]
          const minRolls = mins[i]
          if ((stat == Stats.HP || stat == Stats.ATK || stat == Stats.DEF) && minRolls >= 10) return false
        }

        return true
      }

      // Main analysis implementation
      console.log('7D Hierarchical Grid Analysis with SPD Fixed')
      console.log('============================================')
      console.log(`Target sum: ${TARGET_SUM}, Max value: ${MAX_VAL}`)
      console.log(`Optimization dimensions: ${OPTIMIZATION_DIMENSIONS}, Total dimensions: ${DIMENSIONS}`)
      console.log(`SPD fixed to: ${FIXED_SPD_VALUE} rolls`)
      console.log(`Intervals per dim: [${intervalsPerDim.join(', ')}]`)
      console.log(`Total cells per level: [${totalCells.map((n) => n.toLocaleString()).join(', ')}]`)
      console.log('')

      // Print interval definitions for reference
      INTERVAL_DEFINITIONS.forEach((levelIntervals, index) => {
        console.log(
          `Level ${index + 1} intervals (non-SPD dims): ${levelIntervals.map(([min, max]) => `[${min},${max}]`).join(', ')} (count: ${levelIntervals.length})`,
        )
      })
      console.log('')

      let totalAnalyzed = 0
      let feasibleCellsAtLevel: Set<number>[] = []

      for (let level = 0; level < INTERVAL_DEFINITIONS.length; level++) {
        console.log(`Level ${level + 1}:`)

        let cellsToAnalyze: Set<number>

        if (level === 0) {
          // Level 1: Analyze all cells
          cellsToAnalyze = new Set()
          for (let i = 0; i < totalCells[level]; i++) {
            cellsToAnalyze.add(i)
          }
        } else {
          // Level 2+: Only analyze children of feasible parents
          cellsToAnalyze = new Set()
          const parentFeasibleCells = feasibleCellsAtLevel[level - 1]

          for (const parentCell of parentFeasibleCells) {
            const children = getChildCells(parentCell, level - 1)
            children.forEach((child) => cellsToAnalyze.add(child))
          }
        }

        console.log(`   Analyzing ${cellsToAnalyze.size.toLocaleString()} cells...`)

        // Track feasible cells for this level
        const feasibleCells = new Set<number>()
        let processedCount = 0

        for (const cellIndex of cellsToAnalyze) {
          if (isCellFeasible(cellIndex, level)) {
            feasibleCells.add(cellIndex)
          }

          processedCount++
          totalAnalyzed++

          // Yield control periodically for large levels
          if (processedCount % 100000 === 0) {
            await yieldControl()
            console.log(`   Progress: ${processedCount.toLocaleString()}/${cellsToAnalyze.size.toLocaleString()} cells`)
          }
        }

        // Store feasible cells for next level
        feasibleCellsAtLevel[level] = feasibleCells

        // Calculate and report metrics
        const metrics = calculateEfficiency(feasibleCells.size, totalCells[level], cellsToAnalyze.size)

        console.log(`   Feasible cells: ${feasibleCells.size.toLocaleString()}`)
        console.log(`   Total efficiency: ${metrics.efficiency.toFixed(3)}%`)
        if (level > 0) {
          console.log(`   Hierarchical filtering: ${metrics.filteringSavings.toFixed(1)}%`)
        }
        console.log('')
      }

      // Final summary
      console.log('SUMMARY')
      console.log('=======')
      feasibleCellsAtLevel.forEach((cells, level) => {
        const metrics = calculateEfficiency(cells.size, totalCells[level], cells.size)
        console.log(`Level ${level + 1}: ${cells.size.toLocaleString()} feasible cells (${metrics.efficiency.toFixed(3)}% efficient)`)
      })

      const finalFeasibleCells = feasibleCellsAtLevel[feasibleCellsAtLevel.length - 1].size
      const finalTotalCells = totalCells[totalCells.length - 1]
      const compressionRatio = Math.round(finalTotalCells / finalFeasibleCells)
      const totalFilteringSavings = ((finalTotalCells - totalAnalyzed) / finalTotalCells) * 100

      console.log('')
      console.log(`Final results:`)
      console.log(`   ${finalFeasibleCells.toLocaleString()} feasible cells found`)
      console.log(`   ${compressionRatio}:1 compression ratio`)
      console.log(`   ${totalFilteringSavings.toFixed(1)}% filtering savings`)
      console.log(`   Total cells analyzed: ${totalAnalyzed.toLocaleString()}`)
    }, 3000000)
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
