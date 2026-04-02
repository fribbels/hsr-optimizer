import { MinQueue } from 'lib/dataStructures/minQueue'
import { SubStats } from 'lib/constants/constants'
import { type SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  SUBSTAT_COUNT,
  SPD_INDEX,
  toFloat32Array,
  writeToSubstatCounts,
} from 'lib/worker/maxima/tree/statIndexMap'
import {
  calculateMinMaxMetadata,
  calculateRegionMidpoint,
  getQueueCapacities,
  getSearchTreeConfig,
  pointToBitwiseId,
} from 'lib/worker/maxima/tree/searchTreeUtils'
import {
  isRegionFeasible,
} from 'lib/worker/maxima/validator/regionFeasibilityValidator'
import { type SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

export interface TreeStatRegion {
  lower: Float32Array
  upper: Float32Array
}

export interface TreeConfig {
  explorationLimit: number
  transitionLimit: number
  refinementLimit: number
}

export interface ProtoTreeStatNode {
  region: TreeStatRegion
  representative: Float32Array
  damage: number
  volume: number
  logVolume: number
  nodeId: number
  measurement: number
  evaluated: boolean
  parent: TreeStatNode | null
}

export interface TreeStatNode extends ProtoTreeStatNode {
  splitValue: number
  splitDimension: number
  lowerChild: ProtoTreeStatNode
  upperChild: ProtoTreeStatNode
}

export class SearchTree {
  public config: TreeConfig
  public root: ProtoTreeStatNode
  public damageQueue: MinQueue
  public volumeQueue: MinQueue
  public nodeStore: ProtoTreeStatNode[] = []

  public nodeId = 0
  public measurements = 0
  public bestDamage = 0
  public bestHistory: number[] = []
  public bestHistoryDamage: number[] = []
  public bestNode: ProtoTreeStatNode | null = null

  public maxStatRollsPerPiece = 6
  public dimensions: number
  public fixedSum: number
  public activeStats: number[] = []
  public allStats: number[] = []
  public availablePiecesByStat: Float32Array

  public lower: Float32Array
  public upper: Float32Array

  public cache: Record<string, number> = {}
  public startTime = 0
  public endTime = 0
  public completed = false

  public dimensionVarianceTracker: {
    totalVariance: number,
    splitCount: number,
    avgVariance: number,
  }[] = []

  private potentialMinPiecesAssignments: number[] = []
  private maxPiecesDiff: number[] = []

  private damageFunctionBuffer: SubstatCounts = {}

  constructor(
    public targetSum: number,
    lower: SubstatCounts,
    upper: SubstatCounts,
    public mainStats: string[],
    public damageFunction: (stats: SubstatCounts) => number,
    public substatValidator: SubstatDistributionValidator,
  ) {
    this.lower = toFloat32Array(lower)
    this.upper = toFloat32Array(upper)

    const {
      dimensions,
      fixedSum,
      activeStats,
    } = calculateMinMaxMetadata(this.lower, this.upper)
    this.dimensions = dimensions
    this.fixedSum = fixedSum
    this.activeStats = activeStats
    this.allStats = Array.from({ length: SUBSTAT_COUNT }, (_, i) => i)

    this.availablePiecesByStat = new Float32Array(SUBSTAT_COUNT)
    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      this.availablePiecesByStat[i] = this.mainStats.filter((m) => m !== SubStats[i]).length
    }

    for (const stat of SubStats) {
      this.damageFunctionBuffer[stat] = 0
    }

    this.maxStatRollsPerPiece = this.targetSum === 54 ? 6 : 5

    this.config = getSearchTreeConfig(this)

    // damageQueue peaks at ~1× budget. volumeQueue accumulates during refinement (no pops) and can peak much higher.
    // Capacities are dimension-tuned from production data with ~2-3× headroom. Both grow dynamically if exceeded.
    const [damageCapacity, volumeCapacity] = getQueueCapacities(this.dimensions)
    this.damageQueue = new MinQueue(damageCapacity, Uint32Array)
    this.volumeQueue = new MinQueue(volumeCapacity, Uint32Array)
    this.root = this.generateRoot(this.lower, this.upper)!

    for (let i = 0; i < SUBSTAT_COUNT; i++) {
      this.dimensionVarianceTracker[i] = {
        totalVariance: 0,
        splitCount: 0,
        avgVariance: 0,
      }
    }
  }

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

  public getBest(): Float32Array {
    return this.bestNode!.representative!
  }

  public evaluate(queue: MinQueue) {
    const key = queue.pop()
    if (key == null) {
      this.completed = true
      return
    }
    const node = this.nodeStore[key]
    if (node.evaluated) {
      return
    }

    const splitDimension = this.pickSplitDimension(node)
    if (splitDimension == null) return

    const parentNode = node as TreeStatNode

    const midpoint = calculateRegionMidpoint(parentNode.region, splitDimension)

    const lowerUpper = parentNode.region.upper.slice() as Float32Array
    lowerUpper[splitDimension] = midpoint - 1
    const lowerRegion: TreeStatRegion = {
      lower: parentNode.region.lower,
      upper: lowerUpper,
    }

    const upperLower = parentNode.region.lower.slice() as Float32Array
    upperLower[splitDimension] = midpoint
    const upperRegion: TreeStatRegion = {
      lower: upperLower,
      upper: parentNode.region.upper,
    }

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

  public generateChild(
    parentNode: TreeStatNode,
    region: TreeStatRegion,
    dimension: number,
    upper: boolean,
  ) {
    const feasible = isRegionFeasible(region, this)
    if (!feasible) {
      return null
    }

    const representative = this.generateRepresentative(region, dimension, upper)
    const valid = this.substatValidator.isValidDistributionSimple(representative)
    if (!valid) {
      return null
    }

    const childNode: ProtoTreeStatNode = {
      region: region,
      representative: representative,
      damage: 0,
      volume: 0,
      logVolume: 0,
      nodeId: this.nodeId++,
      measurement: this.measurements,
      evaluated: false,
      parent: parentNode,
    }

    this.calculateDamage(childNode)
    this.calculateVolume(childNode)
    this.trackBestDamage(childNode)
    this.enqueue(childNode)

    return childNode
  }

  public getAvailablePieces(statIdx: number) {
    return this.availablePiecesByStat[statIdx]
  }

  public generateRepresentative(region: TreeStatRegion, splitDimension: number, upper: boolean): Float32Array {
    let sum = this.fixedSum
    for (let i = 0; i < this.activeStats.length; i++) {
      sum += region.lower[this.activeStats[i]]
    }

    let leftToDistribute = Math.floor(this.targetSum - sum)
    const representative = region.lower.slice() as Float32Array

    representative[SPD_INDEX] = Math.ceil(representative[SPD_INDEX])

    let assignmentsNeeded
    if (this.targetSum === 54) {
      const potentialMinPiecesAssignments = this.potentialMinPiecesAssignments
      let totalCurrentMins = 0
      for (let i = 0; i < this.activeStats.length; i++) {
        const statIdx = this.activeStats[i]

        const availablePieces = this.getAvailablePieces(statIdx)
        const upperLimit = region.upper[statIdx]
        const rolls = representative[statIdx]
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

      let totalMaxAssignments = 0
      const maxPiecesDiff = this.maxPiecesDiff
      for (let i = 0; i < this.allStats.length; i++) {
        const statIdx = this.allStats[i]
        const rolls = representative[statIdx]
        const availablePieces = this.getAvailablePieces(statIdx)
        const maxPieces = Math.min(rolls, availablePieces)
        totalMaxAssignments += Math.ceil(maxPieces)
        maxPiecesDiff[i] = Math.max(0, rolls - availablePieces)
      }
      if (totalMaxAssignments < 24) {
        const maxPieceAssignmentsNeeded = 24 - totalMaxAssignments
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

          const targetStatIdx = this.allStats[lowestIndex]
          const currentValue = representative[targetStatIdx]
          const nextValue = currentValue + 1

          if (nextValue > region.upper[targetStatIdx]) {
            continue
          }

          representative[targetStatIdx] = nextValue
          leftToDistribute--
        }
      }
    }

    let looped = false
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const statIdx = this.activeStats[i]

        const upgraded = representative[statIdx] + 1
        if (upgraded <= region.upper[statIdx]) {
          representative[statIdx] = upgraded
          leftToDistribute--
          looped = false
        }

        if (upper && leftToDistribute > 0) {
          const upgraded = representative[splitDimension] + 1
          if (upgraded <= region.upper[splitDimension]) {
            representative[splitDimension] = upgraded
            leftToDistribute--
            looped = false
          }
        }
      } else {
        break
      }

      if (i === this.activeStats.length - 1) {
        i = -1
        if (looped) {
          break
        }
        looped = true
      }
    }

    return representative
  }

  public pickSplitDimension(node: ProtoTreeStatNode): number | null {
    let bestVariance = 0
    let bestStat: number | null = null
    for (let i = 0; i < this.activeStats.length; i++) {
      const statIdx = this.activeStats[i]
      const tracker = this.dimensionVarianceTracker[statIdx]

      if (
        tracker && tracker.splitCount >= 100
        && tracker.avgVariance > bestVariance
        && this.isStatSplitPossible(statIdx, node)
      ) {
        bestVariance = tracker.avgVariance
        bestStat = statIdx
      }
    }

    if (bestStat != null) {
      return bestStat
    }

    let maxRange = 0
    let maxStat: number | null = null
    for (let i = 0; i < this.activeStats.length; i++) {
      const statIdx = this.activeStats[i]
      if (statIdx === SPD_INDEX) continue
      const range = node.region.upper[statIdx] - node.region.lower[statIdx]
      if (range > maxRange) {
        maxRange = range
        maxStat = statIdx
      }
    }

    if (maxStat != null && this.isStatSplitPossible(maxStat, node)) {
      return maxStat
    }

    return null
  }

  public isStatSplitPossible(statIdx: number, node: ProtoTreeStatNode) {
    if (statIdx === SPD_INDEX) return false
    return node.region.upper[statIdx] - node.region.lower[statIdx] > 0
  }

  public generateRoot(lower: Float32Array, upper: Float32Array) {
    const region: TreeStatRegion = {
      lower: lower,
      upper: upper,
    }

    const representative = lower.slice() as Float32Array

    let leftToDistribute = this.targetSum
    for (let i = 0; i < this.allStats.length; i++) {
      leftToDistribute -= lower[this.allStats[i]]
    }
    leftToDistribute = Math.floor(leftToDistribute)

    let looped = false
    for (let i = 0; i < this.activeStats.length; i++) {
      if (leftToDistribute > 0) {
        const statIdx = this.activeStats[i]
        const upgraded = representative[statIdx] + 1
        if (upgraded <= region.upper[statIdx]) {
          representative[statIdx] = upgraded
          leftToDistribute--
          looped = false
        }
      } else {
        break
      }

      if (i === this.activeStats.length - 1) {
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
      logVolume: 0,
      nodeId: this.nodeId++,
      measurement: this.measurements,
      evaluated: false,
      parent: null,
    }

    this.calculateVolume(rootNode)
    this.calculateDamage(rootNode)
    this.trackBestDamage(rootNode)
    this.enqueue(rootNode)

    return rootNode
  }

  public calculateDamage(node: ProtoTreeStatNode) {
    const id = pointToBitwiseId(node.representative, this.activeStats)
    const value = this.cache[id]
    if (value !== undefined) {
      node.damage = value
      return value
    }

    writeToSubstatCounts(node.representative, this.damageFunctionBuffer)
    const damage = this.damageFunction(this.damageFunctionBuffer)

    this.measurements++
    this.cache[id] = damage
    node.damage = damage

    return damage
  }

  public trackBestDamage(node: ProtoTreeStatNode) {
    if (node.damage > this.bestDamage) {
      this.bestDamage = node.damage
      this.bestNode = node
      this.bestHistory.push(node.nodeId)
      this.bestHistoryDamage.push(node.damage)

      if (this.measurements > this.config.explorationLimit) {
        this.scanPointNeighbors(node.representative)
      }
    }
  }

  public calculateVolume(node: ProtoTreeStatNode) {
    let volume = 1
    const region = node.region
    const upper = region.upper
    const lower = region.lower
    for (let i = 0; i < this.activeStats.length; i++) {
      const statIdx = this.activeStats[i]
      volume *= Math.max(1, upper[statIdx] - lower[statIdx])
    }

    node.volume = volume
    node.logVolume = Math.log(volume)
    return volume
  }

  private enqueue(node: ProtoTreeStatNode) {
    this.nodeStore[node.nodeId] = node
    // Negate priorities for max-heap behavior in a min-heap
    this.damageQueue.push(node.nodeId, -node.damage)
    this.volumeQueue.push(node.nodeId, -(node.logVolume * node.damage))
  }

  public scanPointNeighbors(centerPoint: Float32Array) {
    const validOffsets = this.generateZeroSumOffsets(this.activeStats.length, centerPoint)
    const testPoint = centerPoint.slice() as Float32Array

    for (const offsets of validOffsets) {
      for (let i = 0; i < this.activeStats.length; i++) {
        testPoint[this.activeStats[i]] = centerPoint[this.activeStats[i]] + offsets[i]
      }

      if (!this.substatValidator.isValidDistributionSimple(testPoint)) {
        continue
      }

      const id = pointToBitwiseId(testPoint, this.activeStats)
      const value = this.cache[id]
      if (value === undefined) {
        writeToSubstatCounts(testPoint, this.damageFunctionBuffer)
        const damage = this.damageFunction(this.damageFunctionBuffer)

        this.measurements++
        this.cache[id] = damage

        if (damage > this.bestDamage) {
          const newPoint = testPoint.slice() as Float32Array
          this.insertIntoTree(newPoint, this.root as TreeStatNode)
        }
      }
    }
  }

  private insertIntoTree(point: Float32Array, root: TreeStatNode): ProtoTreeStatNode {
    const dimension = root.splitDimension
    const value = root.splitValue
    const isUpper = point[dimension] >= value

    if (isUpper && root.upperChild) {
      return this.insertIntoTree(point, root.upperChild as TreeStatNode)
    }
    if (!isUpper && root.lowerChild) {
      return this.insertIntoTree(point, root.lowerChild as TreeStatNode)
    }

    const midpoint = calculateRegionMidpoint(root.region, dimension)
    let region: TreeStatRegion
    if (isUpper) {
      const upperLower = root.region.lower.slice() as Float32Array
      upperLower[dimension] = midpoint
      region = { lower: upperLower, upper: root.region.upper }
    } else {
      const lowerUpper = root.region.upper.slice() as Float32Array
      lowerUpper[dimension] = midpoint - 1
      region = { lower: root.region.lower, upper: lowerUpper }
    }

    const childNode: ProtoTreeStatNode = {
      region,
      representative: point,
      damage: 0,
      volume: 0,
      logVolume: 0,
      nodeId: this.nodeId++,
      measurement: this.measurements,
      evaluated: false,
      parent: root,
    }

    this.calculateVolume(childNode)
    this.calculateDamage(childNode)
    this.trackBestDamage(childNode)
    this.enqueue(childNode)

    return childNode
  }

  private generateZeroSumOffsets(dimensions: number, centerPoint: Float32Array): number[][] {
    const result: number[][] = []

    const backtrack = (currentOffsets: number[], remainingDimensions: number, currentSum: number) => {
      if (remainingDimensions === 0) {
        if (currentSum === 0) {
          result.push([...currentOffsets])
        }
        return
      }

      const currentDimIndex = dimensions - remainingDimensions
      const statIdx = this.activeStats[currentDimIndex]
      const centerValue = centerPoint[statIdx]

      for (const offset of [-1, 0, 1]) {
        const newValue = centerValue + offset

        if (newValue < this.lower[statIdx] || newValue > this.upper[statIdx]) {
          continue
        }

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
