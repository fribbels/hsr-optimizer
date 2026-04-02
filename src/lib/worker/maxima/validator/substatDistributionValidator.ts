import { Stats } from 'lib/constants/constants'
import { STAT_INDEX, SUBSTAT_COUNT } from 'lib/worker/maxima/tree/statIndexMap'

interface StatConstraints {
  statIdx: number
  rolls: number
  availablePieces: number
  minPieces: number
  maxPieces: number
}

export class SubstatDistributionValidator {
  private target: number
  private maxSingleStatRollsPerPiece: number
  private mainStatIndices: number[]
  private availablePiecesByStat: Float32Array

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
    this.maxSingleStatRollsPerPiece = target === 54 ? 6 : 5

    const mainStatStrings = [
      mainStats.simLinkRope,
      mainStats.simPlanarSphere,
      mainStats.simFeet,
      mainStats.simBody,
      Stats.ATK,
      Stats.HP,
    ]

    this.mainStatIndices = mainStatStrings.map((s) => STAT_INDEX[s] ?? -1)

    this.availablePiecesByStat = new Float32Array(SUBSTAT_COUNT)
    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      let count = 0
      for (const mainIdx of this.mainStatIndices) {
        if (mainIdx !== i) count++
      }
      this.availablePiecesByStat[i] = count
    }
  }

  public isValidDistributionSimple(stats: Float32Array): boolean {
    let totalMaxAssignments = 0

    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      const rolls = stats[i]
      if (rolls === 0) continue

      totalMaxAssignments += Math.min(rolls, this.availablePiecesByStat[i])
    }

    return totalMaxAssignments >= 24
  }

  public isValidDistribution(stats: Float32Array): boolean {
    let sum = 0
    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      const rolls = stats[i] ?? 0
      if (rolls <= 0) continue

      const availablePieces = this.availablePiecesByStat[i]

      if (rolls > availablePieces * this.maxSingleStatRollsPerPiece) {
        return false
      }

      if (availablePieces < Math.ceil(rolls / this.maxSingleStatRollsPerPiece)) {
        return false
      }

      sum += rolls
    }

    if (Math.ceil(sum) !== this.target) {
      return false
    }

    return this.canSatisfyAssignmentRules(stats)
  }

  public getAvailablePieces(statIdx: number): number {
    return this.availablePiecesByStat[statIdx]
  }

  private canSatisfyAssignmentRules(stats: Float32Array): boolean {
    const statConstraints: StatConstraints[] = []
    let totalMinAssignments = 0
    let totalMaxAssignments = 0

    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      const rolls = stats[i]
      if (rolls === 0) continue

      const availablePieces = this.availablePiecesByStat[i]
      const constraints: StatConstraints = {
        statIdx: i,
        rolls,
        availablePieces,
        minPieces: Math.ceil(rolls / this.maxSingleStatRollsPerPiece),
        maxPieces: Math.min(rolls, availablePieces),
      }

      statConstraints.push(constraints)
      totalMinAssignments += constraints.minPieces
      totalMaxAssignments += constraints.maxPieces
    }

    if (totalMinAssignments > 24) {
      return false
    }

    if (totalMaxAssignments < 24) {
      return false
    }

    if (!this.isValidEligibleStatsPerPiece(statConstraints)) {
      return false
    }

    return true
  }

  private isValidEligibleStatsPerPiece(statConstraints: StatConstraints[]) {
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const mainStatIdx = this.mainStatIndices[pieceIndex]
      let eligibleStatsForPiece = 0
      for (const constraint of statConstraints) {
        if (constraint.rolls > 0 && constraint.statIdx !== mainStatIdx) {
          eligibleStatsForPiece++
        }
      }

      if (eligibleStatsForPiece < 4) return false
    }

    return true
  }
}
