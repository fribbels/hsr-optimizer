import { PriorityQueue } from '@js-sdsl/priority-queue'
import { node } from 'globals'
import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'
import {
  calculateMinMaxMetadata,
  calculateRegionMidpoint,
  splitNode,
} from 'lib/worker/maxima/tree/searchTreeUtils'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export interface TreeStatRegion {
  lower: SubstatCounts
  upper: SubstatCounts
}

export interface ProtoTreeStatNode {
  region: TreeStatRegion
  representative: SubstatCounts
  damage: number
  volume: number
  nodeId: number
  evaluated: boolean
  parent: TreeStatNode | null
}
export interface TreeStatNode extends ProtoTreeStatNode {
  priority: number
  splitDimension: string
  splitValue: number
  lowerChild: ProtoTreeStatNode
  upperChild: ProtoTreeStatNode
}

export class SearchTree {
  private nodeId = 0
  public root: ProtoTreeStatNode
  private damageQueue: PriorityQueue<ProtoTreeStatNode>
  private volumeQueue: PriorityQueue<ProtoTreeStatNode>
  private bestDamage = 0
  private bestHistory: number[] = []
  private bestNode: ProtoTreeStatNode | null = null

  private maxStatRollsPerPiece = 6
  private dimensions: number
  private fixedSum: number
  private activeStats: string[] = []
  private allStats: string[] = []
  private availablePiecesByStat: Record<string, number> = {}

  constructor(
    public targetSum: number,
    public maxIterations: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    public mainStats: string[],
    public damageFunction: (stats: SubstatCounts) => number,
    public substatValidator: SubstatDistributionValidator,
  ) {
    const {
      dimensions,
      fixedSum,
      activeStats,
    } = calculateMinMaxMetadata(lower, upper)
    this.dimensions = dimensions
    this.fixedSum = fixedSum
    this.activeStats = activeStats
    this.allStats = SubStats
    this.allStats.forEach((stat) => {
      this.availablePiecesByStat[stat] = this.mainStats.filter((mainStat) => mainStat !== stat).length
    })

    this.damageQueue = new PriorityQueue<ProtoTreeStatNode>([], (a, b) => b.damage - a.damage)
    this.volumeQueue = new PriorityQueue<ProtoTreeStatNode>([], (a, b) => b.volume * b.damage - a.volume * a.damage)

    this.maxStatRollsPerPiece = this.targetSum == 54 ? 6 : 5

    this.root = this.generateRoot(lower, upper)!
  }

  //  ============= 21145 21646
  public singleIteration() {
    // Alternate queues to balance exploration and optimization
    if (this.nodeId < 1000) {
      this.evaluate(this.volumeQueue)
      this.evaluate(this.volumeQueue)
    } else if (this.nodeId < 3000) {
      this.evaluate(this.volumeQueue)
      this.evaluate(this.damageQueue)
    } else {
      this.evaluate(this.damageQueue)
      this.evaluate(this.damageQueue)
    }
  }

  public getBest() {
    console.log('=============', this.bestNode?.nodeId, this.nodeId, this.mainStats.slice(2))
    return this.bestNode
  }

  public evaluate(queue: PriorityQueue<ProtoTreeStatNode>) {
    const node = queue.pop()
    if (node == null) return
    if (node.evaluated) return

    const splitDimension = this.pickSplitDimension(node)
    if (!splitDimension) return

    const parentNode = node as TreeStatNode
    const {
      midpoint,
      lowerRegion,
      upperRegion,
    } = splitNode(parentNode, splitDimension)

    // if (parentNode.nodeId == 246) {
    //   console.log('debug')
    // }

    const lowerChild = this.generateChild(parentNode, lowerRegion, splitDimension, false)
    const upperChild = this.generateChild(parentNode, upperRegion, splitDimension, true)

    parentNode.evaluated = true
    parentNode.splitValue = midpoint
    parentNode.splitDimension = splitDimension
    if (lowerChild) parentNode.lowerChild = lowerChild
    if (upperChild) parentNode.upperChild = upperChild
  }

  public generateChild(
    parentNode: TreeStatNode,
    region: TreeStatRegion,
    dimension: string,
    upper: boolean,
  ) {
    // if (this.nodeId == 1282) {
    //   console.log('debug')
    // }
    if (!this.isRegionFeasible(region)) {
      return null
    }

    const representative = this.generateRepresentative(region, dimension, upper)

    if (!this.substatValidator.isValidDistribution(representative)) {
      return null
    }

    const childNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: 0,
      nodeId: this.nodeId++,
      evaluated: false,
      parent: parentNode,
    }

    this.calculateVolume(childNode)
    this.calculateDamage(childNode)

    this.damageQueue.push(childNode)
    this.volumeQueue.push(childNode)

    return childNode
  }

  public isRegionFeasible(region: TreeStatRegion): boolean {
    const mins = this.allStats.map((x) => region.lower[x])
    const maxs = this.allStats.map((x) => region.upper[x])

    // The possible ranges must include the target 54
    const sumMin = Math.ceil(mins.reduce((a, b) => a + b, 0))
    const sumMax = Math.ceil(maxs.reduce((a, b) => a + b, 0))
    if ((sumMin > this.targetSum || sumMax < this.targetSum)) return false

    // Must have enough pieces to fit each stat with minimum rolls
    for (let i = 0; i < this.dimensions; i++) {
      const stat = this.activeStats[i]
      const minRolls = mins[i]
      const availablePieces = this.getAvailablePieces(stat)
      if (minRolls > availablePieces * this.maxStatRollsPerPiece) return false
    }

    // Each piece must have at least 4 eligible substats available
    for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
      const pieceMainStat = this.mainStats[pieceIndex]
      const eligibleStats = this.allStats.filter((stat, i) => {
        // Stat is eligible if:
        // 1. Not the same as piece main stat
        // 2. Could potentially have rolls in this cell (maxs[i] > 0)
        return stat !== pieceMainStat && maxs[i] > 0
      })
      if (eligibleStats.length < 4) return false
    }

    for (let i = 0; i < this.dimensions; i++) {
      const stat = this.activeStats[i]
      const minRolls = mins[i]
      const availablePieces = this.getAvailablePieces(stat)
      if (minRolls > availablePieces * this.maxStatRollsPerPiece) return false
    }

    // Find the unfixable possible slot deficits
    let sumPossibleSlots = 0
    for (let i = 0; i < this.allStats.length; i++) {
      const stat = this.allStats[i]
      const availablePieces = this.getAvailablePieces(stat)
      const possibleSlots = Math.min(mins[i], availablePieces)
      sumPossibleSlots += possibleSlots
    }

    if ((24 - Math.ceil(sumPossibleSlots)) > (this.targetSum - sumMin)) {
      return false
    }

    return true
  }

  public getAvailablePieces(stat: string) {
    return this.availablePiecesByStat[stat]
  }

  public generateRepresentative(region: TreeStatRegion, splitDimension: string, upper: boolean) {
    let sum = this.fixedSum
    for (const stat of this.activeStats) {
      sum += region.lower[stat]
    }

    let leftToDistribute = Math.floor(this.targetSum - sum)
    const representative: SubstatCounts = {
      ...region.lower,
    }

    // Start the search at the lower bounds
    representative[Stats.SPD] = Math.ceil(representative[Stats.SPD])

    // How many slots you could use for filling up
    // We should pick stats that have the most available slots, to fill up empty slots first
    let assignmentsNeeded
    if (this.targetSum == 54) {
      const potentialMinPiecesAssignments: number[] = []
      let totalCurrentMins = 0
      for (let i = 0; i < this.activeStats.length; i++) {
        const stat = this.activeStats[i]

        const availablePieces = this.getAvailablePieces(stat)
        const upperLimit = region.upper[stat]
        const rolls = representative[stat]
        const currentMinPieces = Math.max(0, Math.min(availablePieces, upperLimit) - rolls)

        totalCurrentMins += currentMinPieces
        potentialMinPiecesAssignments[i] = currentMinPieces
      }
      assignmentsNeeded = Math.min(leftToDistribute, totalCurrentMins)
      for (let i = 0; i < assignmentsNeeded; i++) {
        let highestIndex = 0
        let highestValue = potentialMinPiecesAssignments[0]
        for (let j = 1; j < this.activeStats.length; j++) {
          if (potentialMinPiecesAssignments[j] > highestValue) {
            highestValue = potentialMinPiecesAssignments[j]
            highestIndex = j
          }
        }

        potentialMinPiecesAssignments[highestIndex]--
        representative[this.activeStats[highestIndex]] = (representative[this.activeStats[highestIndex]] ?? 0) + 1
      }

      leftToDistribute -= assignmentsNeeded

      // Fixes the totalMaxAssignments validation
      let totalMaxAssignments = 0
      const maxPiecesDiff = []
      for (let i = 0; i < this.allStats.length; i++) {
        const stat = this.allStats[i]
        const rolls = representative[stat]
        const availablePieces = this.getAvailablePieces(stat)
        const maxPieces = Math.min(rolls, availablePieces)
        totalMaxAssignments += Math.ceil(maxPieces)
        maxPiecesDiff[i] = Math.max(0, maxPieces - availablePieces)
      }
      if (totalMaxAssignments < 24) {
        let maxPieceAssignmentsNeeded = 24 - totalMaxAssignments
        for (let i = 0; i < maxPieceAssignmentsNeeded; i++) {
          let lowestIndex = 0
          let lowestValue = maxPiecesDiff[0]

          for (let j = 1; j < maxPiecesDiff.length; j++) {
            if (maxPiecesDiff[j] < lowestValue) {
              lowestValue = maxPiecesDiff[j]
              lowestIndex = j
            }
          }

          maxPiecesDiff[lowestIndex]++

          if ((representative[this.allStats[lowestIndex]] ?? 0) + 1 > region.upper[this.allStats[lowestIndex]]) {
            continue
          }

          representative[this.allStats[lowestIndex]] = (representative[this.allStats[lowestIndex]] ?? 0) + 1
          leftToDistribute--
        }
      }
    }

    // Distribute round-robin
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const stat = this.activeStats[i]
        const upgraded = (representative[stat] ?? 0) + 1
        if (upgraded <= region.upper[stat]) {
          representative[stat] = upgraded
          leftToDistribute--
        }

        if (upper && leftToDistribute > 0) {
          // Alternating attempt to bump up the split stat when possible
          const upgraded = (representative[splitDimension] ?? 0) + 1
          if (upgraded <= region.upper[splitDimension]) {
            representative[splitDimension] = upgraded
            leftToDistribute--
          }
        }
      } else {
        break
      }

      if (i == this.activeStats.length - 1) {
        i = -1
      }
    }

    return representative
  }

  public pickSplitDimension(node: ProtoTreeStatNode) {
    // Try the largest dimension
    let maxRange = 0
    let maxStat = null
    for (const stat of this.activeStats) {
      if (stat == Stats.SPD) continue
      const range = node.region.upper[stat] - node.region.lower[stat]
      if (range > maxRange) {
        maxRange = range
        maxStat = stat
      }
    }

    if (maxStat && this.isStatSplitPossibleStat(maxStat, node)) {
      return maxStat
    }

    return null
  }

  public isStatSplitPossibleStat(stat: string, node: ProtoTreeStatNode) {
    if (stat == Stats.SPD) return false
    if (node.region.upper[stat] - node.region.lower[stat] > 0) {
      return true
    }
    return false
  }

  public generateRoot(lower: SubstatCounts, upper: SubstatCounts) {
    // Region
    const region: TreeStatRegion = {
      lower: lower,
      upper: upper,
    }

    // Representative
    const representative: SubstatCounts = {
      ...lower,
    }

    let leftToDistribute = this.targetSum
    for (const value of Object.values(lower)) {
      leftToDistribute -= value ?? 0
    }

    let looped = false
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const stat = this.activeStats[i]
        const upgraded = (representative[stat] ?? 0) + 1
        if (upgraded <= region.upper[stat]) {
          representative[stat] = upgraded
          leftToDistribute--
          looped = false
        }
      } else {
        break
      }

      if (i == this.activeStats.length - 1) {
        i = -1
        if (looped) {
          return null
        }
        looped = true
      }
    }

    const rootNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: 0,
      nodeId: this.nodeId++,
      evaluated: false,
      parent: null,
    }

    this.calculateVolume(rootNode)
    this.calculateDamage(rootNode)

    this.damageQueue.push(rootNode)
    this.volumeQueue.push(rootNode)

    return rootNode
  }

  public calculateDamage(node: ProtoTreeStatNode) {
    node.damage = this.damageFunction(node.representative)
    if (node.damage > this.bestDamage) {
      this.bestDamage = node.damage
      this.bestNode = node
      this.bestHistory.push(node.nodeId!)
    }
  }

  public calculateVolume(node: ProtoTreeStatNode) {
    let volume = 1
    const region = node.region
    const upper = region.upper
    const lower = region.lower
    for (const stat of this.activeStats) {
      volume *= Math.max(1, upper[stat] - lower[stat])
    }

    node.volume = volume
  }
}
