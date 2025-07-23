import { PriorityQueue } from '@js-sdsl/priority-queue'
import { node } from 'globals'
import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'
import { calculateMinMaxMetadata } from 'lib/worker/maxima/tree/searchTreeUtils'
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
  isLeaf: boolean
}

export class SearchTree {
  private nodeId = 0
  public root: ProtoTreeStatNode
  private damageQueue: PriorityQueue<ProtoTreeStatNode>
  private volumeQueue: PriorityQueue<ProtoTreeStatNode>
  private bestDamage = 0
  private bestNode: ProtoTreeStatNode | null = null
  private maxStatRollsPerPiece = 6

  private dimensions: number
  private fixedSum: number
  private fixedStats: SubstatCounts = {}
  private activeStats: string[] = []

  constructor(
    public targetSum: number,
    public maxIterations: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    // public effectiveStats: string[],
    public statPriority: string[],
    public mainStats: string[],
    public damageFunction: (stats: SubstatCounts) => number,
    public substatValidator: SubstatDistributionValidator,
  ) {
    this.damageQueue = new PriorityQueue<ProtoTreeStatNode>([], (a, b) => b.damage - a.damage)
    this.volumeQueue = new PriorityQueue<ProtoTreeStatNode>([], (a, b) => b.volume - a.volume)
    const root = this.generateRoot(lower, upper)
    this.root = root!
    this.maxStatRollsPerPiece = this.targetSum == 54 ? 6 : 5

    const {
      dimensions,
      fixedSum,
      fixedStats,
      activeStats,
    } = calculateMinMaxMetadata(lower, upper)

    this.dimensions = dimensions
    this.fixedSum = fixedSum
    this.fixedStats = fixedStats
    this.activeStats = activeStats
  }

  public singleIteration() {
    // Alternate queues to balance exploration and optimization
    this.evaluate(this.damageQueue)
    this.evaluate(this.volumeQueue)
  }

  public getBest() {
    return this.bestNode
  }

  public evaluate(queue: PriorityQueue<ProtoTreeStatNode>) {
    const node = queue.pop()
    if (!node) return
    if (node.evaluated) return

    // if (node.nodeId == 1283) {
    //   console.log('debug')
    // }

    const splitDimension = this.pickSplitDimension(node)
    if (!splitDimension) {
      let same = true
      for (const stat of this.activeStats) {
        if (stat == Stats.SPD) continue
        if (node.region.lower[stat] != node.region.upper[stat]) same = false
      }
      if (!same) {
        console.warn('Impossible split')
      }
      return
    }

    const midpoint = Math.ceil((node.region.upper[splitDimension] - node.region.lower[splitDimension]) / 2) + node.region.lower[splitDimension]

    const lowerRegion: TreeStatRegion = {
      lower: {
        ...node.region.lower,
      },
      upper: {
        ...node.region.upper,
        [splitDimension]: midpoint - 1,
      },
    }

    const upperRegion: TreeStatRegion = {
      lower: {
        ...node.region.lower,
        [splitDimension]: midpoint,
      },
      upper: {
        ...node.region.upper,
      },
    }

    const parent = node as TreeStatNode
    // if (parent.nodeId == 31) {
    //   console.log('debug')
    // }

    const lowerChild = this.generateChild(parent, lowerRegion, splitDimension, false)
    const upperChild = this.generateChild(parent, upperRegion, splitDimension, true)

    parent.evaluated = true
    parent.splitDimension = splitDimension
    parent.splitValue = midpoint
    if (lowerChild) parent.lowerChild = lowerChild
    if (upperChild) parent.upperChild = upperChild
    parent.isLeaf = false
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
    if (!this.isCellFeasible(region)) {
      return null
    }

    const volume = this.calculateVolume(region)
    const representative = this.generateRepresentative(region, dimension, upper)

    if (!this.substatValidator.isValidDistribution(representative)) {
      return null
    }

    const childNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: volume,
      nodeId: this.nodeId++,
      evaluated: false,
      parent: parentNode,
    }

    this.calculateDamage(childNode)

    this.damageQueue.push(childNode)
    this.volumeQueue.push(childNode)

    return childNode
  }

  public isCellFeasible(region: TreeStatRegion): boolean {
    const mins = this.activeStats.map((x) => region.lower[x])
    const maxs = this.activeStats.map((x) => region.upper[x])

    // The possible ranges must include the target 54
    const sumMin = Math.ceil(mins.reduce((a, b) => a + b, 0)) + this.fixedSum
    const sumMax = Math.ceil(maxs.reduce((a, b) => a + b, 0)) + this.fixedSum
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
      const eligibleStats = this.activeStats.filter((stat, i) => {
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
    for (let i = 0; i < this.dimensions; i++) {
      const stat = this.activeStats[i]
      const availablePieces = this.getAvailablePieces(stat)
      const possibleSlots = Math.min(mins[i], availablePieces)
      sumPossibleSlots += possibleSlots
    }

    if ((24 - Math.ceil(sumPossibleSlots)) > (this.targetSum - sumMin)) {
      return false
    }

    return true
  }

  // TODO: calculate in constructor
  public getAvailablePieces(stat: string) {
    return this.mainStats.filter((mainStat) => mainStat !== stat).length
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
    // TODO: This is only for SPD
    for (let i = 0; i < this.activeStats.length; i++) {
      const stat = this.activeStats[i]
      representative[stat] = Math.ceil(representative[stat])
    }

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

      // Fixes the totalMaxAssignments validation
      let totalMaxAssignments = 0
      const maxPiecesDiff = []
      for (let i = 0; i < this.activeStats.length; i++) {
        const stat = this.activeStats[i]
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

          if ((representative[this.activeStats[lowestIndex]] ?? 0) + 1 > region.upper[this.activeStats[lowestIndex]]) {
            continue
          }

          representative[this.activeStats[lowestIndex]] = (representative[this.activeStats[lowestIndex]] ?? 0) + 1
          leftToDistribute--
        }
      }
    } else {
      assignmentsNeeded = leftToDistribute
    }

    // Distribute round-robin
    leftToDistribute -= assignmentsNeeded
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const stat = this.activeStats[i]
        const upgraded = (representative[stat] ?? 0) + 1
        if (upgraded <= region.upper[stat]) {
          representative[stat] = upgraded
          leftToDistribute--
        }

        if (upper && leftToDistribute > 0) {
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
    const parent = node.parent
    if (parent) {
      const previousStat = parent.splitDimension
      const startingIndex = this.activeStats.indexOf(previousStat)
      for (let i = startingIndex + 1; i < this.activeStats.length; i++) {
        if (this.isStatSplitPossible(i, node)) return this.activeStats[i]
      }
      for (let i = 0; i <= startingIndex; i++) {
        if (this.isStatSplitPossible(i, node)) return this.activeStats[i]
      }
    } else {
      for (let i = 0; i < this.activeStats.length; i++) {
        if (this.isStatSplitPossible(i, node)) return this.activeStats[i]
      }
    }

    return null
  }

  public isStatSplitPossible(i: number, node: ProtoTreeStatNode) {
    const candidateStat = this.activeStats[i]
    if (candidateStat == Stats.SPD) return false
    if (node.region.upper[candidateStat] - node.region.lower[candidateStat] > 0) {
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
    const volume = this.calculateVolume(region)

    const rootNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: volume,
      nodeId: this.nodeId++,
      evaluated: false,
      parent: null,
    }

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
    }
  }

  public calculateVolume(region: TreeStatRegion) {
    let volume = 1
    const upper = region.upper
    const lower = region.lower
    for (const stat of this.activeStats) {
      volume *= Math.max(1, upper[stat] - lower[stat])
    }

    return volume
  }
}
