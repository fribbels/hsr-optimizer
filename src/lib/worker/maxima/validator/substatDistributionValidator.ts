import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'

/**
 * This checks if the substat distribution is a valid distribution in-game,
 * following the substat and main stat assignment rules.
 */
export class SubstatDistributionValidator {
  private target: number
  private maxSingleStatRollsPerPiece: number
  private mainStats: string[]
  private availablePiecesByStat: Record<string, number> = {}

  constructor(
    target: number,
    mainStats: {
      simBody: string,
      simFeet: string,
      simPlanarSphere: string,
      simLinkRope: string,
    },
  ) {
    this.target = target
    this.maxSingleStatRollsPerPiece = target == 54 ? 6 : 5
    this.mainStats = [
      mainStats.simLinkRope,
      mainStats.simPlanarSphere,
      mainStats.simFeet,
      mainStats.simBody,
      Stats.ATK,
      Stats.HP,
    ]

    SubStats.forEach((stat) => {
      this.availablePiecesByStat[stat] = this.mainStats.filter((mainStat) => mainStat !== stat).length
    })
  }

  public isValidDistribution(stats: Record<string, number>): boolean {
    const activeStats = Object.entries(stats).filter(([_, rolls]) => rolls > 0)

    let sum = 0
    for (const [stat, rolls] of activeStats) {
      const availablePieces = this.getAvailablePieces(stat)

      // Can't exceed maximum possible rolls (6 or 5 per piece)
      if (rolls > availablePieces * this.maxSingleStatRollsPerPiece) {
        return false
      }

      // Must have at least one piece where the stat can appear
      if (availablePieces === 0) {
        return false
      }

      // Must be possible to assign with minimum 1 roll per piece
      if (rolls > 0 && availablePieces < Math.ceil(rolls / this.maxSingleStatRollsPerPiece)) {
        return false
      }

      sum += rolls
    }

    if (Math.ceil(sum) != this.target) {
      return false
    }

    return this.canSatisfyAssignmentRules(activeStats)
  }

  private getAvailablePieces(stat: string): number {
    return this.availablePiecesByStat[stat]
  }

  private canSatisfyAssignmentRules(activeStats: [string, number][]): boolean {
    const statConstraints = activeStats.map(([stat, rolls]) => ({
      stat,
      rolls,
      availablePieces: this.getAvailablePieces(stat),
      // Minimum pieces needed (max 6 or 5 rolls per piece)
      minPieces: Math.ceil(rolls / this.maxSingleStatRollsPerPiece),
      // Maximum pieces that can be used
      maxPieces: Math.min(rolls, this.getAvailablePieces(stat)),
    }))

    // Check if the stat requirements exceeds available pieces
    for (const constraint of statConstraints) {
      if (constraint.minPieces > constraint.availablePieces) {
        return false
      }
    }

    // Check if any stat needs more pieces than physically available
    // e.g. if ATK% needs 3 pieces but only 2 pieces can have ATK% as substat due to main stat conflicts
    for (const constraint of statConstraints) {
      if (constraint.minPieces > constraint.availablePieces) {
        return false
      }
    }

    // Check if the sum of minimum required assignments is more than all 24 available slots
    const totalMinAssignments = statConstraints.reduce((sum, c) => sum + c.minPieces, 0)
    if (totalMinAssignments > 24) {
      return false
    }

    // Check if there is sufficient assignment capacity to fill all required slots
    // The build needs exactly 24 assignments, if maximum possible < 24, then there will be an invalid empty substat slot
    const totalMaxAssignments = statConstraints.reduce((sum, c) => sum + c.maxPieces, 0)
    if (totalMaxAssignments < 24) {
      return false
    }

    // Check if each piece has enough candidate substats to choose from
    // Each piece needs exactly 4 substats so there must be at least 4 eligible options per piece
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const mainStat = this.mainStats[pieceIndex]
      const eligibleStatsForPiece = activeStats.filter(([stat, _]) => stat !== mainStat)

      if (eligibleStatsForPiece.length < 4) {
        return false
      }
    }

    // If all the checks have passed then distribution must be valid
    return true
  }
}
