import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'

export interface StatConstraints {
  stat: string
  rolls: number
  availablePieces: number
  minPieces: number
  maxPieces: number
}

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

  // Warning!!! This is a heavily simplified validator, optimized for performance.
  // During testing the only constraint that gets violated in practice is the totalMaxAssignments < 24 check.
  // We only check this one here, but this is only logically sound for the current code when this was written.
  // This check's correctness may change in the future if the point generation code is changed.
  public isValidDistributionSimple(stats: SubstatCounts): boolean {
    let totalMaxAssignments = 0

    for (const stat of SubStats) {
      const rolls = stats[stat]
      if (rolls == 0) continue

      totalMaxAssignments += Math.min(rolls, this.getAvailablePieces(stat))
    }

    return totalMaxAssignments >= 24
  }

  public isValidDistribution(stats: SubstatCounts): boolean {
    let sum = 0
    for (const stat of SubStats) {
      const rolls = stats[stat] ?? 0
      if (rolls <= 0) continue

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

    return this.canSatisfyAssignmentRules(stats)
  }

  private getAvailablePieces(stat: string): number {
    return this.availablePiecesByStat[stat]
  }

  private canSatisfyAssignmentRules(stats: SubstatCounts): boolean {
    const statConstraints: StatConstraints[] = []
    let totalMinAssignments = 0
    let totalMaxAssignments = 0

    for (const stat of SubStats) {
      const rolls = stats[stat]
      if (rolls == 0) continue

      const constraints = {
        stat,
        rolls,
        availablePieces: this.getAvailablePieces(stat),
        // Minimum pieces needed (max 6 or 5 rolls per piece)
        minPieces: Math.ceil(rolls / this.maxSingleStatRollsPerPiece),
        // Maximum pieces that can be used
        maxPieces: Math.min(rolls, this.getAvailablePieces(stat)),
      }

      // Check if any stat needs more pieces than physically available
      // e.g. if ATK% needs 3 pieces but only 2 pieces can have ATK% as substat due to main stat conflicts
      for (const constraint of statConstraints) {
        if (constraint.minPieces > constraint.availablePieces) {
          return false
        }
      }

      statConstraints.push(constraints)
      totalMinAssignments += constraints.minPieces
      totalMaxAssignments += constraints.maxPieces
    }

    // Check if the sum of minimum required assignments is more than all 24 available slots
    if (totalMinAssignments > 24) {
      return false
    }

    // Check if there is sufficient assignment capacity to fill all required slots
    // The build needs exactly 24 assignments, if maximum possible < 24, then there will be an invalid empty substat slot
    if (totalMaxAssignments < 24) {
      return false
    }

    if (!this.isValidEligibleStatsPerPiece(statConstraints)) {
      return false
    }

    // If all the checks have passed then distribution must be valid
    return true
  }

  // Check if each piece has enough candidate substats to choose from
  // Each piece needs exactly 4 substats so there must be at least 4 eligible options per piece
  private isValidEligibleStatsPerPiece(statConstraints: StatConstraints[]) {
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const mainStat = this.mainStats[pieceIndex]
      let eligibleStatsForPiece = 0
      for (const constraint of statConstraints) {
        if (constraint.rolls > 0 && constraint.stat != mainStat) {
          eligibleStatsForPiece++
        }
      }

      if (eligibleStatsForPiece < 4) return false
    }

    return true
  }
}
