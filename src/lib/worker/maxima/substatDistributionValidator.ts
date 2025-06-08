import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'

export class SubstatDistributionValidator {
  private input: ComputeOptimalSimulationWorkerInput
  private mainStats: string[]
  private candidateStats: string[]

  constructor(input: ComputeOptimalSimulationWorkerInput) {
    this.input = input

    // Cache main stats for performance
    const request = this.input.partialSimulationWrapper.simulation.request
    this.mainStats = [
      request.simLinkRope,
      request.simPlanarSphere,
      request.simFeet,
      request.simBody,
      'ATK', // Head is always ATK
      'HP', // Hands is always HP
    ]

    // Get candidate substats from metadata
    this.candidateStats = [...this.input.metadata.substats, 'SPD']
  }

  public isValidDistribution(stats: Record<string, number>): boolean {
    // Filter active stats (>0 rolls)
    const activeStats = Object.entries(stats).filter(([_, rolls]) => rolls > 0)

    // Rule 1: Basic capacity checks for each stat
    for (const [stat, rolls] of activeStats) {
      const availablePieces = this.getAvailablePieces(stat)

      // Can't exceed maximum possible rolls (6 per piece)
      if (rolls > availablePieces * 6) {
        return false
      }

      // Must have at least one piece where stat can appear
      if (availablePieces === 0) {
        return false
      }

      // Must be possible to assign with minimum 1 roll per piece
      if (rolls > 0 && availablePieces < Math.ceil(rolls / 6)) {
        return false
      }
    }

    // Rule 2: Each piece must have exactly 4 eligible substats available
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const mainStat = this.mainStats[pieceIndex]
      const eligibleStatsForPiece = activeStats.filter(([stat, _]) => stat !== mainStat)

      if (eligibleStatsForPiece.length < 4) {
        return false
      }
    }

    // Rule 3: Try to assign stats to pieces using constraint satisfaction
    return this.canSatisfyAssignment(activeStats)
  }

  private getAvailablePieces(stat: string): number {
    return this.mainStats.filter((mainStat) => mainStat !== stat).length
  }

  private canSatisfyAssignment(activeStats: [string, number][]): boolean {
    // Core insight: We need exactly 24 (stat, piece) assignments total (6 pieces × 4 substats each)
    // Each stat must appear on enough pieces to achieve its target rolls

    // Calculate constraints for each stat
    const statConstraints = activeStats.map(([stat, rolls]) => ({
      stat,
      rolls,
      availablePieces: this.getAvailablePieces(stat),
      minPieces: Math.ceil(rolls / 6), // Minimum pieces needed (max 6 rolls per piece)
      maxPieces: Math.min(rolls, this.getAvailablePieces(stat)), // Maximum pieces that can be used
    }))

    // Check basic feasibility for each stat
    for (const constraint of statConstraints) {
      if (constraint.minPieces > constraint.availablePieces) {
        return false
      }
    }

    // Check if total minimum assignments exceed available slots
    const totalMinAssignments = statConstraints.reduce((sum, c) => sum + c.minPieces, 0)
    if (totalMinAssignments > 24) {
      return false
    }

    // Check if we have enough "flexible" assignments to fill all 24 slots
    const totalMaxAssignments = statConstraints.reduce((sum, c) => sum + c.maxPieces, 0)
    if (totalMaxAssignments < 24) {
      return false
    }

    // For each piece, verify it has enough eligible substats
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const mainStat = this.mainStats[pieceIndex]
      const eligibleStatsForPiece = activeStats.filter(([stat, _]) => stat !== mainStat)

      if (eligibleStatsForPiece.length < 4) {
        return false // Not enough eligible stats for this piece
      }
    }

    // If we passed all checks, the distribution should be valid
    return true
  }
}
