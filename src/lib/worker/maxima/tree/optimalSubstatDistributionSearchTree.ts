import { PriorityQueue } from '@js-sdsl/priority-queue'
import { Stats } from 'lib/constants/constants'
import { calculateDamage } from 'lib/optimization/calculateDamage'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  StatNode,
  StatRegion,
} from 'lib/worker/maxima/types/substatOptimizationTypes'
import { createRegionFromBounds } from 'lib/worker/maxima/utils/regionUtils'
import { generateSplitRepresentative } from 'lib/worker/maxima/utils/substatSpreadUtils'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

// Critical logging that always shows important issues
// @ts-ignore
const criticalLog = (...args) => {
  console.log('🚨', ...args)
}

// Progress logging for periodic updates
// @ts-ignore
const progressLog = (...args) => {
  console.log('📊', ...args)
}

// Target tracking for key events
// @ts-ignore
const targetLog = (...args) => {
  console.log('🎯', ...args)
}

// Type definitions for structured split results
interface SplitAttemptResult {
  success: boolean
  reason: string
  children: SplitChild[]
}

interface SplitChild {
  side: 'left' | 'right'
  splitValue: number
  representative: SubstatCounts
}

interface DiagnosticSummary {
  totalNodes: number
  leafNodes: number
  targetContainingRegions: number
  closestRegionDistance: number
  bestDamage: number
  closestToTargetDistance: number
  splitHistory: Array<{
    nodeId: number,
    dimension: string,
    targetInRegion: boolean,
    childrenContainTarget: number,
  }>
}

export class OptimalSubstatDistributionSearchTree {
  private rootRegion: StatRegion
  private rootNode: StatNode
  private nextNodeId: number = 0
  private queue: PriorityQueue<StatNode>
  private topDamage = -1
  private iterationCount = 0
  private topNode: StatNode

  // Diagnostic tracking
  private closestToTarget: StatNode | null = null
  private closestToTargetDistance: number = Infinity
  private splitHistory: DiagnosticSummary['splitHistory'] = []
  private allCreatedNodes: StatNode[] = []

  // Track critical events
  private targetLossEvents: number = 0
  private targetRegionsActive: number = 0

  // Target answer for tracking
  private TARGET_ANSWER: SubstatCounts = {
    'HP%': 0,
    'ATK%': 18,
    'DEF%': 0,
    'HP': 0,
    'ATK': 0,
    'DEF': 0,
    'SPD': 6,
    'CRIT Rate': 10,
    'CRIT DMG': 3,
    'Effect Hit Rate': 17,
    'Effect RES': 0,
    'Break Effect': 0,
  }

  constructor(
    public dimensions: number,
    public targetSum: number,
    public maxIterations: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    public effectiveStats: string[],
    public statPriority: string[],
    public damageFunction: (stats: SubstatCounts) => number,
    public substatValidator: SubstatDistributionValidator,
  ) {
    this.rootRegion = this.createRootRegion()
    this.rootNode = this.createRootNode()
    this.calculateDamage(this.rootNode)
    this.topNode = this.rootNode
    this.allCreatedNodes.push(this.rootNode)
    this.queue = new PriorityQueue<StatNode>([], (a, b) => b.priority - a.priority)
    this.queue.push(this.rootNode)

    // Initialize with critical checks only
    this.analyzeTargetAnswerFeasibility()
    this.updateTargetRegionCount()
  }

  // ============================================================================
  // LASER-FOCUSED TARGET LOSS DEBUGGING
  // ============================================================================

  private logTargetLossEvent(eventType: string, details: {
    splitDimension: string,
    splitValue: number,
    targetValue: number,
    childBounds: [number, number],
    representative: SubstatCounts | null,
    parentNodeId: number,
  }): void {
    criticalLog(`🎯 TARGET LOSS: ${eventType}`)
    criticalLog(`  Node: ${details.parentNodeId}, Dimension: ${details.splitDimension}`)
    criticalLog(`  Split at ${details.splitValue}, target=${details.targetValue}`)
    criticalLog(`  Child bounds: [${details.childBounds[0]}, ${details.childBounds[1]}]`)

    if (details.representative) {
      criticalLog(`  Generated rep: ${JSON.stringify(details.representative)}`)
      criticalLog(`  Rep sum: ${Object.values(details.representative).reduce((a, b) => a + b, 0)}`)

      // CHECK WHY VALIDATION FAILED
      const failureReason = this.getValidationFailureReason(details.representative)
      criticalLog(`  VALIDATION FAILURE: ${failureReason}`)
    } else {
      criticalLog(`  Representative generation FAILED`)
    }

    criticalLog(`  TARGET ANSWER: ${JSON.stringify(this.TARGET_ANSWER)}`)
    criticalLog('  ---')
  }

  private getValidationFailureReason(representative: SubstatCounts): string {
    try {
      // First check basic constraints
      const sum = Object.values(representative).reduce((a, b) => a + b, 0)
      if (sum !== this.targetSum) {
        return `SUM_MISMATCH: got ${sum}, expected ${this.targetSum}`
      }

      const nonZeroStats = Object.entries(representative).filter(([k, v]) => v > 0)
      if (nonZeroStats.length < 5) {
        return `INSUFFICIENT_DIVERSITY: only ${nonZeroStats.length} non-zero stats (need ≥5)`
      }

      // Check individual bounds
      for (const [stat, value] of Object.entries(representative)) {
        if (value < this.lower[stat] || value > this.upper[stat]) {
          return `BOUND_VIOLATION: ${stat} = ${value}, bounds [${this.lower[stat]}, ${this.upper[stat]}]`
        }
      }

      // Check if any stat has impossible values
      const impossibleStats = nonZeroStats.filter(([stat, value]) => value > 36) // Max possible substat rolls
      if (impossibleStats.length > 0) {
        return `IMPOSSIBLE_VALUES: ${impossibleStats.map(([s, v]) => `${s}:${v}`).join(', ')}`
      }

      // If we get here, it's a complex game validator issue
      return 'COMPLEX_GAME_CONSTRAINT_VIOLATION'
    } catch (error) {
      // @ts-ignore
      return `VALIDATION_ERROR: ${error.message}`
    }
  }

  private detectTargetLoss(parentNode: StatNode, splitDimension: string, children: SplitChild[]): boolean {
    const targetInParent = this.isPointWithinRegion(this.TARGET_ANSWER, parentNode.region)
    if (!targetInParent) return false

    const targetFoundInChild = children.some((child) => this.wouldChildContainTarget(parentNode, splitDimension, child))

    if (!targetFoundInChild) {
      this.targetLossEvents++
      criticalLog(`🚨 CONFIRMED TARGET LOSS #${this.targetLossEvents} - Node ${parentNode.nodeId}`)
      return true
    }
    return false
  }

  private updateTargetRegionCount(): void {
    const leaves = this.collectAllLeaves()
    const targetRegions = leaves.filter((node) => this.isPointWithinRegion(this.TARGET_ANSWER, node.region))

    if (targetRegions.length !== this.targetRegionsActive) {
      this.targetRegionsActive = targetRegions.length
      if (targetRegions.length === 0) {
        criticalLog(`ALL TARGET REGIONS LOST! Previous count: ${this.targetRegionsActive}`)
      }
    }
  }

  private analyzeTargetAnswerFeasibility(): void {
    const isValid = this.substatValidator.isValidDistribution(this.TARGET_ANSWER)
    if (!isValid) {
      const reason = this.getValidationFailureReason(this.TARGET_ANSWER)
      criticalLog(`🚨 TARGET INVALID: ${reason}`)
    }

    const isWithinBounds = this.isPointWithinRegion(this.TARGET_ANSWER, this.rootRegion)
    if (!isWithinBounds) {
      criticalLog('🚨 TARGET OUTSIDE BOUNDS!')
    }

    const targetSum = this.calculateSum(this.TARGET_ANSWER, this.rootRegion)
    if (targetSum !== this.targetSum) {
      criticalLog(`🚨 TARGET SUM MISMATCH: ${targetSum} !== ${this.targetSum}`)
    }
  }

  // ============================================================================
  // STREAMLINED PROGRESS REPORTING
  // ============================================================================

  private reportProgress(): void {
    if (this.iterationCount % 1000 === 0) {
      progressLog(`Iter ${this.iterationCount} - Damage: ${this.topDamage.toFixed(0)}, Targets: ${this.targetRegionsActive}, Losses: ${this.targetLossEvents}`)
    }
  }

  // ============================================================================
  // CORE ALGORITHM METHODS
  // ============================================================================

  public split() {
    this.iterationCount++
    this.reportProgress()

    const topNode = this.queue.pop()
    if (!topNode) {
      return 'STOP'
    }

    const targetInRegion = this.isPointWithinRegion(this.TARGET_ANSWER, topNode.region)
    const candidateDimensions = this.getSplitDimensionsInOrder(topNode)

    if (candidateDimensions.length === 0) {
      if (targetInRegion) {
        criticalLog(`UNSPLITTABLE TARGET REGION: Node ${topNode.nodeId}`)
      }
      return
    }

    // Try each dimension until one succeeds
    for (const splitDimension of candidateDimensions) {
      const splitResult = this.attemptSplitOnDimension(topNode, splitDimension)

      if (splitResult.success) {
        // Check for target loss BEFORE executing split
        const willLoseTarget = this.detectTargetLoss(topNode, splitDimension, splitResult.children)

        // Track split history for diagnostics
        let childrenContainTarget = 0
        for (const child of splitResult.children) {
          if (targetInRegion && this.wouldChildContainTarget(topNode, splitDimension, child)) {
            childrenContainTarget++
          }
        }

        this.splitHistory.push({
          nodeId: topNode.nodeId,
          dimension: splitDimension,
          targetInRegion,
          childrenContainTarget,
        })

        this.executeSplit(topNode, splitDimension, splitResult.children)

        // Update target region count after split
        if (this.iterationCount % 100 === 0) {
          this.updateTargetRegionCount()
        }

        return
      }
    }

    // All dimensions exhausted
    if (targetInRegion) {
      criticalLog(`TARGET REGION EXHAUSTED: Node ${topNode.nodeId} - no splittable dimensions`)
    }
  }

  private attemptSplitOnDimension(node: StatNode, splitDimension: string): SplitAttemptResult {
    const region = node.region
    const lowerBound = region.lower[splitDimension]
    const upperBound = region.upper[splitDimension]
    const candidateSplitValues = this.generateCandidateSplitValues(lowerBound, upperBound, node.representative[splitDimension], splitDimension)

    for (const splitValue of candidateSplitValues) {
      const result = this.tryBinarySpacePartition(node, splitDimension, splitValue)

      if (result.success && result.children.length >= 1) {
        return result // First successful split wins
      }
    }

    return {
      success: false,
      reason: 'No valid split found',
      children: [],
    }
  }

  private tryBinarySpacePartition(parentNode: StatNode, splitDimension: string, splitValue: number): SplitAttemptResult {
    const region = parentNode.region
    const lowerBound = region.lower[splitDimension]
    const upperBound = region.upper[splitDimension]
    const range = upperBound - lowerBound

    // Target tracking setup
    const targetInParent = this.isPointWithinRegion(this.TARGET_ANSWER, parentNode.region)
    const targetValue = this.TARGET_ANSWER[splitDimension] || 0

    if (targetInParent) {
      criticalLog(`🎯 PRE-SPLIT STATE - Node ${parentNode.nodeId}:`)
      criticalLog(`  Current representative: ${JSON.stringify(parentNode.representative)}`)
      criticalLog(`  Region bounds for ${splitDimension}: [${parentNode.region.lower[splitDimension]}, ${parentNode.region.upper[splitDimension]}]`)
      criticalLog(`  About to split ${splitDimension} at ${splitValue}`)
      criticalLog(`  Target: ${JSON.stringify(this.TARGET_ANSWER)}`)
    }

    // Handle range=1 special case
    if (range === 1) {
      const children: SplitChild[] = []

      const leftRep = generateSplitRepresentative(region, splitDimension, lowerBound + 1, this.targetSum, this.statPriority, 'left', this.substatValidator)
      if (leftRep && this.substatValidator.isValidDistribution(leftRep)) {
        children.push({ side: 'left', splitValue: lowerBound, representative: leftRep })
      }

      const rightRep = generateSplitRepresentative(region, splitDimension, upperBound, this.targetSum, this.statPriority, 'right', this.substatValidator)
      if (rightRep && this.substatValidator.isValidDistribution(rightRep)) {
        children.push({ side: 'right', splitValue: upperBound, representative: rightRep })
      }

      return { success: children.length >= 1, reason: `Range=1 split: ${children.length} valid children`, children }
    }

    // Validate normal split
    if (range <= 0) return { success: false, reason: 'Cannot split zero or negative range', children: [] }
    if (this.checkBoundaryError(splitValue, lowerBound, upperBound)) {
      return { success: false, reason: `Split value ${splitValue} outside valid range`, children: [] }
    }

    const children: SplitChild[] = []

    // LEFT CHILD PROCESSING
    const leftRep = generateSplitRepresentative(region, splitDimension, splitValue, this.targetSum, this.statPriority, 'left', this.substatValidator)
    const leftShouldContainTarget = targetInParent && (targetValue >= lowerBound && targetValue <= splitValue - 1)

    if (leftRep) {
      const leftValid = this.substatValidator.isValidDistribution(leftRep)
      if (leftValid) {
        children.push({ side: 'left', splitValue: splitValue - 1, representative: leftRep })
      } else if (leftShouldContainTarget) {
        this.logTargetLossEvent('LEFT_VALIDATION_FAILED', {
          splitDimension,
          splitValue,
          targetValue,
          childBounds: [lowerBound, splitValue - 1],
          representative: leftRep,
          parentNodeId: parentNode.nodeId,
        })
      }
    } else if (leftShouldContainTarget) {
      this.logTargetLossEvent('LEFT_GENERATION_FAILED', {
        splitDimension,
        splitValue,
        targetValue,
        childBounds: [lowerBound, splitValue - 1],
        representative: null,
        parentNodeId: parentNode.nodeId,
      })
    }

    // RIGHT CHILD PROCESSING
    const rightRep = generateSplitRepresentative(region, splitDimension, splitValue, this.targetSum, this.statPriority, 'right', this.substatValidator)
    const rightShouldContainTarget = targetInParent && (targetValue >= splitValue && targetValue <= upperBound)

    if (rightRep) {
      const rightValid = this.substatValidator.isValidDistribution(rightRep)
      if (rightValid) {
        children.push({ side: 'right', splitValue: splitValue, representative: rightRep })
      } else if (rightShouldContainTarget) {
        this.logTargetLossEvent('RIGHT_VALIDATION_FAILED', {
          splitDimension,
          splitValue,
          targetValue,
          childBounds: [splitValue, upperBound],
          representative: rightRep,
          parentNodeId: parentNode.nodeId,
        })
      }
    } else if (rightShouldContainTarget) {
      this.logTargetLossEvent('RIGHT_GENERATION_FAILED', {
        splitDimension,
        splitValue,
        targetValue,
        childBounds: [splitValue, upperBound],
        representative: null,
        parentNodeId: parentNode.nodeId,
      })
    }

    return {
      success: children.length >= 1,
      reason: `${children.length} valid children generated`,
      children,
    }
  }

  private executeSplit(parentNode: StatNode, splitDimension: string, children: SplitChild[]): void {
    const childNodes: StatNode[] = []

    // Create child nodes
    for (const childData of children) {
      const childNode = this.createChildNode(
        parentNode,
        splitDimension,
        childData.splitValue,
        childData.representative,
        childData.side,
      )
      childNodes.push(childNode)
      this.allCreatedNodes.push(childNode)
    }

    // Evaluate damage for children and add to queue
    for (const child of childNodes) {
      this.calculateDamage(child)
      child.priority = this.calculatePriority(child)
      this.queue.push(child)
    }

    // Update parent node structure
    parentNode.isLeaf = false
    parentNode.splitDimension = splitDimension

    if (childNodes.length === 2) {
      parentNode.leftChild = childNodes[0]
      parentNode.rightChild = childNodes[1]
      parentNode.splitValue = Math.max(
        childNodes[0].representative[splitDimension],
        childNodes[1].representative[splitDimension],
      )
    } else if (childNodes.length === 1) {
      const child = childNodes[0]
      const childValue = child.representative[splitDimension]
      const parentValue = parentNode.representative[splitDimension]

      if (childValue < parentValue) {
        parentNode.leftChild = child
        parentNode.rightChild = null
      } else {
        parentNode.leftChild = null
        parentNode.rightChild = child
      }
      parentNode.splitValue = childValue
    }
  }

  // ============================================================================
  // DIAGNOSTIC METHODS
  // ============================================================================

  public analyzeTargetCoverage(): DiagnosticSummary {
    const allLeaves = this.collectAllLeaves()
    const targetContainingRegions = allLeaves.filter((node) => this.isPointWithinRegion(this.TARGET_ANSWER, node.region))

    let closestRegionDistance = Infinity
    if (targetContainingRegions.length === 0) {
      const regionDistances = allLeaves.map((node) => ({
        node,
        distance: this.calculateDistanceFromRegionToTarget(node.region),
      })).sort((a, b) => a.distance - b.distance)
      closestRegionDistance = regionDistances[0]?.distance || Infinity
    } else {
      closestRegionDistance = 0
    }

    return {
      totalNodes: this.allCreatedNodes.length,
      leafNodes: allLeaves.length,
      targetContainingRegions: targetContainingRegions.length,
      closestRegionDistance,
      bestDamage: this.topDamage,
      closestToTargetDistance: this.closestToTargetDistance,
      splitHistory: this.splitHistory,
    }
  }

  public getDiagnosticReport(): string {
    const summary = this.analyzeTargetCoverage()

    let report = '\n' + '='.repeat(80) + '\n'
    report += 'DIAGNOSTIC REPORT\n'
    report += '='.repeat(80) + '\n'

    report += `Current Best: ${this.formatSubstatCounts(this.topNode.representative)}\n`
    report += `Target:       ${this.formatSubstatCounts(this.TARGET_ANSWER)}\n`
    report += `Distance:     ${this.calculateDistanceToTarget(this.topNode.representative)}\n`
    report += `Best Damage:  ${summary.bestDamage.toFixed(0)}\n`
    report += '\n'

    if (summary.targetContainingRegions === 0) {
      report += '❌ PROBLEM: Target not reachable in any remaining regions\n'
      report += `   Closest region distance: ${summary.closestRegionDistance.toFixed(2)}\n`
      report += `   Target loss events: ${this.targetLossEvents}\n`
    } else {
      report += `✅ Target reachable in ${summary.targetContainingRegions} regions\n`
    }

    report += '\nTree Statistics:\n'
    report += `  Total nodes: ${summary.totalNodes}\n`
    report += `  Leaf nodes: ${summary.leafNodes}\n`
    report += `  Estimated depth: ${Math.log2(summary.leafNodes).toFixed(1)}\n`

    report += '\n' + '='.repeat(80) + '\n'

    return report
  }

  private calculateDamage(node: StatNode) {
    node.damage = this.damageFunction(node.representative)

    if (node.damage > this.topDamage) {
      this.topDamage = node.damage
      this.topNode = node
    }

    const targetDistance = this.calculateDistanceToTarget(node.representative)
    if (targetDistance < this.closestToTargetDistance) {
      this.closestToTarget = node
      this.closestToTargetDistance = targetDistance

      if (targetDistance === 0) {
        targetLog(`EXACT TARGET FOUND! Node ${node.nodeId}`)
      } else if (targetDistance <= 3) {
        targetLog(`Close to target: distance=${targetDistance}, Node ${node.nodeId}`)
      }
    }
  }

  public getBest() {
    console.log(this.topNode.representative)
    console.log(this.topNode.damage)
    return this.topNode.representative
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private checkBoundaryError(splitValue: number, lowerBound: number, upperBound: number): boolean {
    return splitValue <= lowerBound || splitValue >= upperBound
  }

  private getSplitDimensionsInOrder(node: StatNode): string[] {
    const region = node.region
    const candidates: Array<{ stat: string, range: number }> = []

    for (const stat of region.variableStats) {
      const range = this.getStatRange(region, stat)
      if (range >= 0) {
        candidates.push({ stat, range })
      }
    }

    candidates.sort((a, b) => {
      const aTargetDiff = Math.abs((this.TARGET_ANSWER[a.stat] || 0) - node.representative[a.stat])
      const bTargetDiff = Math.abs((this.TARGET_ANSWER[b.stat] || 0) - node.representative[b.stat])

      if (aTargetDiff !== bTargetDiff) {
        return bTargetDiff - aTargetDiff
      }
      return b.range - a.range
    })

    return candidates.map((c) => c.stat)
  }

  private generateCandidateSplitValues(lowerBound: number, upperBound: number, currentValue: number, splitDimension: string): number[] {
    const range = upperBound - lowerBound
    const candidates: number[] = []

    if (range === 0) {
      return []
    } else if (range === 1) {
      candidates.push(lowerBound + 1)
    } else {
      const midpoint = Math.floor((lowerBound + upperBound) / 2)
      if (midpoint > lowerBound && midpoint <= upperBound) {
        candidates.push(midpoint)
      }

      if (currentValue > lowerBound && currentValue <= upperBound && currentValue !== midpoint) {
        candidates.push(currentValue)
      }

      if (range >= 4) {
        const quarter1 = Math.floor(lowerBound + range * 0.25)
        const quarter3 = Math.floor(lowerBound + range * 0.75)
        if (quarter1 > lowerBound && quarter1 <= upperBound) candidates.push(quarter1)
        if (quarter3 > lowerBound && quarter3 <= upperBound) candidates.push(quarter3)
      }
    }

    return [...new Set(candidates)].sort((a, b) => a - b)
  }

  private wouldChildContainTarget(parentNode: StatNode, splitDimension: string, child: SplitChild): boolean {
    const childBounds = {
      lower: { ...parentNode.region.lower },
      upper: { ...parentNode.region.upper },
    }

    if (child.side === 'left') {
      childBounds.upper[splitDimension] = child.splitValue
    } else {
      childBounds.lower[splitDimension] = child.splitValue
    }

    const childRegion: StatRegion = {
      lower: childBounds.lower,
      upper: childBounds.upper,
      statNames: parentNode.region.statNames,
      variableStats: parentNode.region.variableStats,
      fixedStats: parentNode.region.fixedStats,
    }

    return this.isPointWithinRegion(this.TARGET_ANSWER, childRegion)
  }

  private calculatePriority(node: StatNode): number {
    if (node.damage === null) return 0

    let volume = 1
    for (const stat of node.region.variableStats) {
      const range = node.region.upper[stat] - node.region.lower[stat]
      if (range > 0) {
        volume *= range
      }
    }

    const explorationWeight = 0.2
    return node.damage * Math.pow(Math.max(volume, 1), explorationWeight)
  }

  private createChildNode(parent: StatNode, splitDimension: string, splitValue: number, representative: SubstatCounts, side: 'left' | 'right'): StatNode {
    const childBounds = {
      lower: { ...parent.region.lower },
      upper: { ...parent.region.upper },
    }

    if (side === 'left') {
      childBounds.upper[splitDimension] = splitValue
    } else {
      childBounds.lower[splitDimension] = splitValue
    }

    const childRegion = createRegionFromBounds(childBounds, parent.region.statNames)

    return {
      region: childRegion,
      representative,
      damage: null,
      priority: 0,
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: this.nextNodeId++,
    }
  }

  private collectAllLeaves(): StatNode[] {
    const leaves: StatNode[] = []
    const queue = [this.rootNode]

    while (queue.length > 0) {
      const node = queue.shift()!
      if (node.isLeaf) {
        leaves.push(node)
      } else {
        if (node.leftChild) queue.push(node.leftChild)
        if (node.rightChild) queue.push(node.rightChild)
      }
    }

    return leaves
  }

  private isPointWithinRegion(point: SubstatCounts, region: StatRegion): boolean {
    for (const stat of region.statNames) {
      const value = point[stat] || 0
      if (value < region.lower[stat] || value > region.upper[stat]) {
        return false
      }
    }
    return true
  }

  private calculateDistanceToTarget(point: SubstatCounts): number {
    let distance = 0
    for (const stat of this.rootRegion.statNames) {
      const pointVal = point[stat] || 0
      const targetVal = this.TARGET_ANSWER[stat] || 0
      distance += Math.abs(pointVal - targetVal)
    }
    return distance
  }

  private calculateDistanceFromRegionToTarget(region: StatRegion): number {
    let distance = 0
    for (const stat of region.statNames) {
      const targetValue = this.TARGET_ANSWER[stat] || 0
      const lower = region.lower[stat]
      const upper = region.upper[stat]

      if (targetValue < lower) {
        distance += lower - targetValue
      } else if (targetValue > upper) {
        distance += targetValue - upper
      }
    }
    return distance
  }

  private formatSubstatCounts(stats: SubstatCounts): string {
    const relevantStats = [...this.rootRegion.variableStats]
    if (!relevantStats.includes('SPD') && (stats['SPD'] || 0) > 0) {
      relevantStats.push('SPD')
    }

    return relevantStats
      .filter((stat) => (stats[stat] || 0) > 0)
      .map((stat) => `${stat}:${stats[stat]}`)
      .join(', ')
  }

  private calculateSum(stats: SubstatCounts, region: StatRegion): number {
    let sum = 0
    for (const [stat, value] of Object.entries(stats)) {
      if (region.fixedStats.includes(stat) && !Number.isInteger(value)) {
        sum += Math.ceil(value)
      } else {
        sum += value
      }
    }
    return sum
  }

  private getStatRange(region: StatRegion, stat: string): number {
    return region.upper[stat] - region.lower[stat]
  }

  private createRootRegion(): StatRegion {
    const allStatNames = Object.keys(this.lower)
    const fixedStats: string[] = []
    const variableStats: string[] = []

    for (const stat of allStatNames) {
      if (this.lower[stat] === this.upper[stat]) {
        fixedStats.push(stat)
      } else {
        variableStats.push(stat)
      }
    }

    return {
      lower: { ...this.lower },
      upper: { ...this.upper },
      statNames: allStatNames,
      variableStats,
      fixedStats,
    }
  }

  private generateStartingPoint(): SubstatCounts {
    if (!this.rootRegion) throw new Error('Root region not initialized')

    const result: SubstatCounts = {}

    for (const stat of this.rootRegion.statNames) {
      result[stat] = this.rootRegion.fixedStats.includes(stat) ? this.rootRegion.lower[stat] : 0
    }

    const fixedBudget = this.rootRegion.fixedStats.reduce((sum, stat) => sum + Math.ceil(result[stat]), 0)
    const remaining = this.targetSum - fixedBudget
    const base = Math.floor(remaining / this.rootRegion.variableStats.length)
    const extra = remaining % this.rootRegion.variableStats.length

    this.rootRegion.variableStats.forEach((stat, i) => {
      result[stat] = Math.max(this.rootRegion.lower[stat], Math.min(this.rootRegion.upper[stat], base + (i < extra ? 1 : 0)))
    })

    return result
  }

  private createRootNode(): StatNode {
    const startingPoint = this.generateStartingPoint()
    return {
      region: this.rootRegion,
      representative: startingPoint,
      damage: null,
      priority: 0,
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: this.nextNodeId++,
    }
  }
}
