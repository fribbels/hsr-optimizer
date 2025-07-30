import { PriorityQueue } from '@js-sdsl/priority-queue'
import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  calculateMinMaxMetadata,
  getSearchTreeConfig,
  pointToBitwiseId,
  splitNode,
} from 'lib/worker/maxima/tree/searchTreeUtils'
import {
  isRegionFeasible,
} from 'lib/worker/maxima/validator/regionFeasibilityValidator'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export interface TreeStatRegion {
  lower: SubstatCounts
  upper: SubstatCounts
}

export interface TreeConfig {
  explorationLimit: number
  transitionLimit: number
  refinementLimit: number
}

export interface ProtoTreeStatNode {
  region: TreeStatRegion
  representative: SubstatCounts
  damage: number
  volume: number
  nodeId: number
  measurement: number
  evaluated: boolean
  parent: TreeStatNode | null
}

export interface TreeStatNode extends ProtoTreeStatNode {
  splitValue: number
  splitDimension: string
  lowerChild: ProtoTreeStatNode
  upperChild: ProtoTreeStatNode
}

/**
 * Global maxima search algorithm for optimal substat distributions
 *
 * The problem:
 * - Calculating the globally optimal solution is very computationally costly
 * - Each stat dimension has [0, 36] range, with up to 8 dimensions to search
 * - Naively the search space upper bound is 37^8 = 3,512,479,453,921 points
 * - Realistically lower, after applying substat constraints
 * - The damage function has to be considered as a black box, since it frequently changes
 * - The damage function is not smooth, has cliffs from stat conversions, conditional activations
 * - The solution must be a valid in-game substat distribution, which follows complex assignment rules
 - The algorithm has to be deterministic and reproducible
 *
 * Tech constraints:
 * - Must run within ~1 second, since these are used in the browser for character cards DPS Score
 * - Must run within workers, meaning multiple parallel executions at a time
 * - Browser RAM limits, restricts the amount of precomputation we can do (multiplied by # workers)
 *
 * Simple summary:
 * - Initialize root region covering entire feasible space, push it onto a queue
 * - Create a Priority Queue ordered by damage based metric
 * - Loop:
 *   - Pop a node from the queue
 *   - Split the node's region into two child nodes with half the size
 *   - Generate a point in each region and measure their damage
 *   - Push the points onto the queue
 * - Stop the loop when n iterations are complete, take the highest damage node as the optimal
 *
 * This progressively builds a space partitioning tree to search the space,
 * by assigning representative points to regions and subdividing them. The binary splits reduce variance
 * within each region and the priority queue focuses search on the optimal regions.
 */
export class SearchTree {
  public config: TreeConfig
  public root: ProtoTreeStatNode
  public damageQueue: PriorityQueue<ProtoTreeStatNode>
  public volumeQueue: PriorityQueue<ProtoTreeStatNode>

  public nodeId = 0
  public measurements = 0
  public bestDamage = 0
  public bestHistory: number[] = []
  public bestHistoryDamage: number[] = []
  public bestNode: ProtoTreeStatNode | null = null

  public maxStatRollsPerPiece = 6
  public dimensions: number
  public fixedSum: number
  public activeStats: string[] = []
  public allStats: string[] = []
  public availablePiecesByStat: Record<string, number> = {}

  public cache: Record<string, number> = {}
  public collisions = 0
  public startTime = 0
  public endTime = 0
  public completed = false

  public dimensionVarianceTracker: Record<string, {
    totalVariance: number,
    splitCount: number,
    avgVariance: number,
  }> = {}

  constructor(
    public targetSum: number,
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
    this.volumeQueue = new PriorityQueue<ProtoTreeStatNode>([], (a, b) => Math.log(b.volume) * b.damage - Math.log(a.volume) * a.damage)

    this.maxStatRollsPerPiece = this.targetSum == 54 ? 6 : 5

    this.config = getSearchTreeConfig(this)
    this.root = this.generateRoot(lower, upper)!

    for (const stat of activeStats) {
      this.dimensionVarianceTracker[stat] = {
        totalVariance: 0,
        splitCount: 0,
        avgVariance: 0,
      }
    }
  }

  // Alternate queues to balance exploration and optimization
  public singleIteration() {
    if (this.measurements < this.config.explorationLimit) {
      this.evaluate(this.volumeQueue)
      this.evaluate(this.volumeQueue)
    } else if (this.measurements < this.config.transitionLimit) {
      this.evaluate(this.volumeQueue)
      this.evaluate(this.damageQueue)
    } else {
      this.evaluate(this.damageQueue)
      this.evaluate(this.damageQueue)
    }
  }

  // Search until 2x the best node's measurement index, or at least until the max configured limit
  public search() {
    this.startTime = performance.now()
    while (
      ((this.measurements < this.config.refinementLimit) || (this.measurements < this.bestNode!.measurement * 2))
      && !this.completed
    ) {
      this.singleIteration()
    }
    this.endTime = performance.now()

    return this.getBest()
  }

  public getBest() {
    const benchmark = this.targetSum == 54 ? 200 : 100

    console.log(
      '=============',
      `${this.dimensions}-D ${benchmark}%`,
      this.bestNode?.measurement,
      this.measurements,
      this.mainStats.slice(2).join(' / '),
      `${Math.floor(this.endTime - this.startTime)}ms`,
    )
    return this.bestNode!.representative!
  }

  /**
   * Splits a node into two child regions
   */
  public evaluate(queue: PriorityQueue<ProtoTreeStatNode>) {
    const node = queue.pop()
    if (node == null) {
      this.completed = true
      return
    }
    if (node.evaluated) return

    const splitDimension = this.pickSplitDimension(node)
    if (!splitDimension) return

    const parentNode = node as TreeStatNode
    const {
      midpoint,
      lowerRegion,
      upperRegion,
    } = splitNode(parentNode, splitDimension)

    // if (parentNode.nodeId == 1872) {
    //   console.log('debug')
    // }

    const lowerChild = this.generateChild(parentNode, lowerRegion, splitDimension, false)
    const upperChild = this.generateChild(parentNode, upperRegion, splitDimension, true)

    parentNode.evaluated = true
    parentNode.splitValue = midpoint
    parentNode.splitDimension = splitDimension
    if (lowerChild) parentNode.lowerChild = lowerChild
    if (upperChild) parentNode.upperChild = upperChild

    if (lowerChild && upperChild) {
      const tracker = this.dimensionVarianceTracker[splitDimension]
      const variance = Math.abs(lowerChild.damage - upperChild.damage)
      tracker.totalVariance += variance
      tracker.splitCount++
      tracker.avgVariance = tracker.totalVariance / tracker.splitCount
    }
  }

  /**
   * Creates a child if there is one within the region, and adds it to the queues
   */
  public generateChild(
    parentNode: TreeStatNode,
    region: TreeStatRegion,
    dimension: string,
    upper: boolean,
  ) {
    // if (this.nodeId == 1282) {
    //   console.log('debug')
    // }

    if (!isRegionFeasible(region, this)) {
      return null
    }

    const representative = this.generateRepresentative(region, dimension, upper)

    if (!this.substatValidator.isValidDistributionSimple(representative)) {
      return null
    }

    const childNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: 0,
      nodeId: this.nodeId++,
      measurement: this.measurements,
      evaluated: false,
      parent: parentNode,
    }

    this.calculateDamage(childNode)
    this.calculateVolume(childNode)
    this.trackBestDamage(childNode)

    this.damageQueue.push(childNode)
    this.volumeQueue.push(childNode)

    return childNode
  }

  public getAvailablePieces(stat: string) {
    return this.availablePiecesByStat[stat]
  }

  /**
   * Generates a valid point within the region.
   * Combines various heuristics to build up a point based on validator rules.
   */
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
    // This only needs to be checked for the 200% benchmark
    // The 100% benchmark can assume that simple round-robin will never generate an invalid distribution
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
        representative[this.activeStats[highestIndex]]++
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

          const targetStat = this.allStats[lowestIndex]
          const currentValue = representative[targetStat]
          const nextValue = currentValue + 1

          if (nextValue > region.upper[targetStat]) {
            continue
          }

          representative[targetStat] = nextValue
          leftToDistribute--
        }
      }
    }

    // Distribute round-robin
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const stat = this.activeStats[i]

        const upgraded = representative[stat] + 1
        if (upgraded <= region.upper[stat]) {
          representative[stat] = upgraded
          leftToDistribute--
        }

        if (upper && leftToDistribute > 0) {
          // Alternating attempt to bump up the upper split stat when possible
          const upgraded = representative[splitDimension] + 1
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

  // Try to pick the best dimension to split on.
  // First try to pick the dimension with the highest variance, to split the most important stats.
  // Otherwise pick the dimension with the highest range.
  // This reduces the variance in each region for better representative points
  public pickSplitDimension(node: ProtoTreeStatNode) {
    let bestVariance = 0
    let bestStat: string | null = null
    for (const stat of this.activeStats) {
      const tracker = this.dimensionVarianceTracker[stat]

      if (
        tracker && tracker.splitCount >= 100
        && tracker.avgVariance > bestVariance
        && this.isStatSplitPossible(stat, node)
      ) {
        bestVariance = tracker.avgVariance
        bestStat = stat
      }
    }

    if (bestStat) {
      return bestStat
    }

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

    if (maxStat && this.isStatSplitPossible(maxStat, node)) {
      return maxStat
    }

    return null
  }

  // Any dimension with 2 points can be split, except SPD
  public isStatSplitPossible(stat: string, node: ProtoTreeStatNode) {
    if (stat == Stats.SPD) return false
    return node.region.upper[stat] - node.region.lower[stat] > 0
  }

  // The root is generated with separate rules
  // We basically assume that round-robin will always generate a valid root distribution
  public generateRoot(lower: SubstatCounts, upper: SubstatCounts) {
    // Region
    const region: TreeStatRegion = {
      lower: lower,
      upper: upper,
    }

    // Representative starts at lower bounds
    const representative: SubstatCounts = {
      ...lower,
    }

    let leftToDistribute = this.targetSum
    for (const stat of this.allStats) {
      leftToDistribute -= lower[stat]
    }
    leftToDistribute = Math.floor(leftToDistribute)

    // Distribute round-robin
    let looped = false
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const stat = this.activeStats[i]
        const upgraded = representative[stat] + 1
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
        // Infinite loop guard
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
      measurement: this.measurements,
      evaluated: false,
      parent: null,
    }

    this.calculateVolume(rootNode)
    this.calculateDamage(rootNode)
    this.trackBestDamage(rootNode)

    this.damageQueue.push(rootNode)
    this.volumeQueue.push(rootNode)

    return rootNode
  }

  public calculateDamage(node: ProtoTreeStatNode) {
    const id = pointToBitwiseId(node.representative, this.activeStats)
    const value = this.cache[id]
    if (value) {
      this.collisions++
      node.damage = value
      return value
    }

    const damage = this.damageFunction(node.representative)
    this.measurements++
    this.cache[id] = damage
    node.damage = damage

    return damage
  }

  public trackBestDamage(node: ProtoTreeStatNode) {
    if (node.damage > this.bestDamage) {
      this.bestDamage = node.damage
      this.bestNode = node
      this.bestHistory.push(node.nodeId!)
      this.bestHistoryDamage.push(node.damage!)

      if (this.measurements > this.config.explorationLimit) {
        this.scanPointNeighbors(node.representative)
      }
    }
  }

  // Number of points each region contains, note that when upper == lower, volume is considered 1
  public calculateVolume(node: ProtoTreeStatNode) {
    let volume = 1
    const region = node.region
    const upper = region.upper
    const lower = region.lower
    for (const stat of this.activeStats) {
      volume *= Math.max(1, upper[stat] - lower[stat])
    }

    node.volume = volume
    return volume
  }

  public scanPointNeighbors(centerPoint: SubstatCounts) {
    const comparisonDmg = this.bestDamage
    let betterPoints = 0

    // Generate all offset combinations that sum to 0
    const validOffsets = this.generateZeroSumOffsets(this.activeStats.length, centerPoint)
    const testPoint = { ...centerPoint }

    for (const offsets of validOffsets) {
      // Apply offsets in-place
      for (let i = 0; i < this.activeStats.length; i++) {
        testPoint[this.activeStats[i]] = centerPoint[this.activeStats[i]] + offsets[i]
      }

      if (!this.substatValidator.isValidDistributionSimple(testPoint)) {
        continue
      }

      const id = pointToBitwiseId(testPoint, this.activeStats)
      const value = this.cache[id]
      if (!value) {
        const damage = this.damageFunction(testPoint)
        this.measurements++
        this.cache[id] = damage

        if (damage > this.bestDamage) {
          const newPoint: SubstatCounts = { ...testPoint }
          betterPoints++

          this.insertIntoTree(newPoint, this.root as TreeStatNode)
        }
      }
    }

    // console.log('Better points: ', betterPoints)
  }

  private insertIntoTree(point: SubstatCounts, root: TreeStatNode): ProtoTreeStatNode {
    const dimension = root.splitDimension
    const value = root.splitValue
    const upper = point[dimension] >= value

    let childNode: ProtoTreeStatNode
    if (upper && root.upperChild) {
      return this.insertIntoTree(point, root.upperChild as TreeStatNode)
    }
    if (!upper && root.lowerChild) {
      return this.insertIntoTree(point, root.lowerChild as TreeStatNode)
    }

    const split = splitNode(root, dimension)
    childNode = {
      region: upper ? split.upperRegion : split.lowerRegion,
      representative: point,
      damage: 0,
      volume: 0,
      nodeId: this.nodeId++,
      measurement: this.measurements,
      evaluated: false,
      parent: root,
    }

    this.calculateVolume(childNode)
    this.calculateDamage(childNode)
    this.trackBestDamage(childNode)

    this.damageQueue.push(childNode)
    this.volumeQueue.push(childNode)

    return childNode
  }

  private generateZeroSumOffsets(dimensions: number, centerPoint: SubstatCounts): number[][] {
    const result: number[][] = []

    const backtrack = (currentOffsets: number[], remainingDimensions: number, currentSum: number) => {
      if (remainingDimensions === 0) {
        if (currentSum === 0) {
          result.push([...currentOffsets])
        }
        return
      }

      const currentDimIndex = dimensions - remainingDimensions
      const stat = this.activeStats[currentDimIndex]
      const centerValue = centerPoint[stat]

      // Try each possible offset for this dimension
      for (const offset of [-1, 0, 1]) {
        const newValue = centerValue + offset

        // Check bounds first
        if (newValue < this.lower[stat] || newValue > this.upper[stat]) {
          continue
        }

        // Check if we can still reach sum=0, otherwise prune
        const newSum = currentSum + offset
        const maxPossibleFromRemaining = (remainingDimensions - 1) * 1
        const minPossibleFromRemaining = (remainingDimensions - 1) * -1

        if (newSum + minPossibleFromRemaining <= 0 && newSum + maxPossibleFromRemaining >= 0) {
          currentOffsets.push(offset)
          backtrack(currentOffsets, remainingDimensions - 1, newSum)
          currentOffsets.pop()
        }
      }
    }

    backtrack([], dimensions, 0)
    return result
  }
}
