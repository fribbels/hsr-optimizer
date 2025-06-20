import { PriorityQueue } from '@js-sdsl/priority-queue'
import { Stats } from 'lib/constants/constants'
import { calculateDamage } from 'lib/optimization/calculateDamage'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  StatNode,
  StatRegion,
} from 'lib/worker/maxima/types/substatOptimizationTypes'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'

let debug = false
// @ts-ignore
const logger = (...args) => {
  if (debug) {
    console.log(...args)
  }
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
  private topNode: StatNode

  // Diagnostic tracking
  private closestToTarget: StatNode | null = null
  private closestToTargetDistance: number = Infinity
  private splitHistory: DiagnosticSummary['splitHistory'] = []
  private allCreatedNodes: StatNode[] = []

  // Target answer for tracking
  private TARGET_ANSWER: SubstatCounts = {
    'ATK%': 6,
    'ATK': 4,
    'HP%': 0,
    'HP': 0,
    'DEF%': 0,
    'DEF': 0,
    'SPD': 6.00,
    'CRIT Rate': 9,
    'CRIT DMG': 29,
    'Effect Hit Rate': 0,
    'Effect RES': 0,
    'Break Effect': 0,
  }

  constructor(
    public dimensions: number,
    public targetSum: number,
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

    logger('🎯 TARGET ANSWER TRACKING INITIALIZED:')
    logger('Target:', this.TARGET_ANSWER)
    this.analyzeTargetAnswerFeasibility()
  }

  // ============================================================================
  // ENHANCED DEBUGGING METHODS
  // ============================================================================

  private debugSplitPartitioning(parentNode: StatNode, splitDimension: string, children: SplitChild[]): void {
    const targetInParent = this.isPointWithinRegion(this.TARGET_ANSWER, parentNode.region)

    logger('\n🔍 DETAILED SPACE PARTITIONING DEBUG:')
    logger(`Parent node ${parentNode.nodeId} splitting on ${splitDimension}`)
    logger(`Target in parent: ${targetInParent}`)

    if (!targetInParent) {
      logger('Target not in parent - no space loss concern')
      return
    }

    logger(`Target value for ${splitDimension}: ${this.TARGET_ANSWER[splitDimension]}`)
    logger(`Parent bounds for ${splitDimension}: [${parentNode.region.lower[splitDimension]}, ${parentNode.region.upper[splitDimension]}]`)
    logger(`Parent representative ${splitDimension}: ${parentNode.representative[splitDimension]}`)

    // Show full parent region for context
    logger('PARENT REGION FULL BOUNDS:')
    for (const stat of parentNode.region.variableStats) {
      const targetVal = this.TARGET_ANSWER[stat] || 0
      const inBounds = targetVal >= parentNode.region.lower[stat] && targetVal <= parentNode.region.upper[stat]
      logger(`  ${stat}: [${parentNode.region.lower[stat]}, ${parentNode.region.upper[stat]}] target=${targetVal} ${inBounds ? '✓' : '✗'}`)
    }

    // Analyze each child's bounds
    let targetFoundInChild = false

    for (const child of children) {
      logger(`\n  === ${child.side.toUpperCase()} CHILD ANALYSIS ===`)
      logger(`  Split value used: ${child.splitValue}`)

      // Recreate child bounds exactly as createChildNode does
      const childBounds = {
        lower: { ...parentNode.region.lower },
        upper: { ...parentNode.region.upper },
      }

      if (child.side === 'left') {
        childBounds.upper[splitDimension] = child.splitValue
        logger(`  Left child: [${childBounds.lower[splitDimension]}, ${childBounds.upper[splitDimension]}] (upper bound set to split value)`)
      } else {
        childBounds.lower[splitDimension] = child.splitValue
        logger(`  Right child: [${childBounds.lower[splitDimension]}, ${childBounds.upper[splitDimension]}] (lower bound set to split value)`)
      }

      // Check target specifically in split dimension
      const targetValue = this.TARGET_ANSWER[splitDimension]
      const targetInSplitDim = targetValue >= childBounds.lower[splitDimension] && targetValue <= childBounds.upper[splitDimension]
      logger(
        `  Target ${targetValue} in ${splitDimension} bounds [${childBounds.lower[splitDimension]}, ${childBounds.upper[splitDimension]}]: ${targetInSplitDim}`,
      )

      // Check full target
      const childRegion: StatRegion = {
        lower: childBounds.lower,
        upper: childBounds.upper,
        statNames: parentNode.region.statNames,
        variableStats: parentNode.region.variableStats,
        fixedStats: parentNode.region.fixedStats,
      }

      const targetInFullRegion = this.isPointWithinRegion(this.TARGET_ANSWER, childRegion)
      logger(`  Target in full child region: ${targetInFullRegion}`)

      if (targetInFullRegion) {
        targetFoundInChild = true
        logger(`  ✅ TARGET PRESERVED in ${child.side} child`)
      } else if (targetInSplitDim) {
        logger(`  ⚠️ Target in split dimension but excluded by other constraints`)
        // Check which other dimension excludes it
        for (const stat of parentNode.region.variableStats) {
          if (stat === splitDimension) continue
          const targetVal = this.TARGET_ANSWER[stat] || 0
          const inBounds = targetVal >= childBounds.lower[stat] && targetVal <= childBounds.upper[stat]
          if (!inBounds) {
            logger(`    ❌ Excluded by ${stat}: target=${targetVal} not in [${childBounds.lower[stat]}, ${childBounds.upper[stat]}]`)
          }
        }
      } else {
        logger(`  ❌ Target excluded by split dimension itself`)
      }

      logger(`  Child representative: ${this.formatSubstatCounts(child.representative)}`)
    }

    // CRITICAL ANALYSIS
    if (!targetFoundInChild && targetInParent) {
      logger('\n🚨🚨🚨 SPACE PARTITIONING BUG DETECTED! 🚨🚨🚨')
      logger('Target was in parent but is in NEITHER child - this violates space conservation!')

      // Detailed analysis of what went wrong
      if (children.length === 2) {
        const leftChild = children.find((c) => c.side === 'left')!
        const rightChild = children.find((c) => c.side === 'right')!
        const targetValue = this.TARGET_ANSWER[splitDimension]

        logger('PARTITION VERIFICATION:')
        logger(`  Parent covers: [${parentNode.region.lower[splitDimension]}, ${parentNode.region.upper[splitDimension]}]`)
        logger(`  Left covers:   [${parentNode.region.lower[splitDimension]}, ${leftChild.splitValue}]`)
        logger(`  Right covers:  [${rightChild.splitValue}, ${parentNode.region.upper[splitDimension]}]`)
        logger(`  Target value:  ${targetValue}`)

        // Check for gap
        if (leftChild.splitValue < rightChild.splitValue) {
          logger(`  🐛 GAP DETECTED: (${leftChild.splitValue}, ${rightChild.splitValue})`)
          if (targetValue > leftChild.splitValue && targetValue < rightChild.splitValue) {
            logger(`  🎯 TARGET FALLS IN GAP! This is the bug!`)
          }
        }

        // Check boundary conditions
        if (targetValue === leftChild.splitValue) {
          logger(`  🔍 Target is exactly at left split value - check boundary inclusion`)
        }
        if (targetValue === rightChild.splitValue) {
          logger(`  🔍 Target is exactly at right split value - check boundary inclusion`)
        }
      }
    } else if (targetFoundInChild) {
      logger('\n✅ Target preserved - space partitioning working correctly')
    }
  }

  private verifySpaceConservation(parentNode: StatNode, children: SplitChild[], splitDimension: string): void {
    if (children.length !== 2) return

    const leftChild = children.find((c) => c.side === 'left')!
    const rightChild = children.find((c) => c.side === 'right')!

    const parentLower = parentNode.region.lower[splitDimension]
    const parentUpper = parentNode.region.upper[splitDimension]

    // logger('\n📏 SPACE CONSERVATION VERIFICATION:')
    // logger(`Dimension: ${splitDimension}`)
    // logger(`Parent bounds: [${parentLower}, ${parentUpper}]`)
    // logger(`Left split value: ${leftChild.splitValue}`)
    // logger(`Right split value: ${rightChild.splitValue}`)

    // Expected child bounds
    const expectedLeftBounds = [parentLower, leftChild.splitValue]
    const expectedRightBounds = [rightChild.splitValue, parentUpper]

    logger(`Expected left:  [${expectedLeftBounds[0]}, ${expectedLeftBounds[1]}]`)
    logger(`Expected right: [${expectedRightBounds[0]}, ${expectedRightBounds[1]}]`)

    // Check for proper partitioning
    const leftEndsCorrect = leftChild.splitValue <= parentUpper
    const rightStartsCorrect = rightChild.splitValue >= parentLower
    const boundsConnect = leftChild.splitValue === rightChild.splitValue

    logger(`Left ends within parent: ${leftEndsCorrect}`)
    logger(`Right starts within parent: ${rightStartsCorrect}`)
    logger(`Bounds connect properly: ${boundsConnect}`)

    if (!boundsConnect) {
      const gap = rightChild.splitValue - leftChild.splitValue
      if (gap > 0) {
        logger(`🐛 GAP DETECTED: ${gap} units between children`)
        logger(`  Lost range: (${leftChild.splitValue}, ${rightChild.splitValue})`)
      } else {
        logger(`🐛 OVERLAP DETECTED: ${-gap} units of overlap`)
      }
    }
  }

  // ============================================================================
  // DIAGNOSTIC METHODS
  // ============================================================================

  public analyzeTargetCoverage(): DiagnosticSummary {
    debug = true
    logger('\n🔍 TARGET COVERAGE ANALYSIS:')

    // Collect all leaf nodes
    const allLeaves = this.collectAllLeaves()
    logger(`Total leaf nodes: ${allLeaves.length}`)
    logger(`Total nodes created: ${this.allCreatedNodes.length}`)

    // Find regions that contain the target
    const targetContainingRegions = allLeaves.filter((node) => this.isPointWithinRegion(this.TARGET_ANSWER, node.region))

    logger(`Regions containing target: ${targetContainingRegions.length}`)

    let closestRegionDistance = Infinity

    if (targetContainingRegions.length === 0) {
      logger('❌ NO REGIONS CONTAIN THE TARGET - TARGET LOST IN SPLITS!')

      // Find the closest regions
      const regionDistances = allLeaves.map((node) => ({
        node,
        distance: this.calculateDistanceFromRegionToTarget(node.region),
      })).sort((a, b) => a.distance - b.distance)

      closestRegionDistance = regionDistances[0]?.distance || Infinity

      logger('Closest regions to target:')
      regionDistances.slice(0, 5).forEach((item, i) => {
        logger(
          `  ${i + 1}. Node ${item.node.nodeId}: region_distance=${item.distance.toFixed(2)}, rep_distance=${
            this.calculateDistanceToTarget(item.node.representative).toFixed(2)
          }, damage=${item.node.damage?.toFixed(0)}`,
        )
        logger(`     Rep: ${this.formatSubstatCounts(item.node.representative)}`)
        logger(`     Bounds: ${this.formatRegionBounds(item.node.region)}`)
        logger(`     Region size: ${this.calculateRegionSize(item.node.region)}`)
        logger('')
      })
    } else {
      logger('✅ Target is still reachable in these regions:')
      closestRegionDistance = 0

      targetContainingRegions
        .sort((a, b) => this.calculateDistanceToTarget(a.representative) - this.calculateDistanceToTarget(b.representative))
        .forEach((node, i) => {
          const distance = this.calculateDistanceToTarget(node.representative)
          logger(`  ${i + 1}. Node ${node.nodeId}: rep_distance=${distance}, damage=${node.damage?.toFixed(0)}, priority=${node.priority.toFixed(0)}`)
          logger(`     Rep: ${this.formatSubstatCounts(node.representative)}`)
          logger(`     Region size: ${this.calculateRegionSize(node.region)}`)
          logger(`     Bounds: ${this.formatRegionBounds(node.region)}`)
          logger('')
        })
    }

    // Analyze split history
    logger('📊 SPLIT HISTORY ANALYSIS:')
    const targetRegionSplits = this.splitHistory.filter((split) => split.targetInRegion)
    logger(`Splits of regions containing target: ${targetRegionSplits.length}`)

    targetRegionSplits.forEach((split) => {
      logger(`  Node ${split.nodeId} split on ${split.dimension}: ${split.childrenContainTarget}/2 children contain target`)
    })

    const summary: DiagnosticSummary = {
      totalNodes: this.allCreatedNodes.length,
      leafNodes: allLeaves.length,
      targetContainingRegions: targetContainingRegions.length,
      closestRegionDistance,
      bestDamage: this.topDamage,
      closestToTargetDistance: this.closestToTargetDistance,
      splitHistory: this.splitHistory,
    }

    logger('📋 SUMMARY:')
    logger(`  Best damage: ${summary.bestDamage.toFixed(0)}`)
    logger(`  Closest to target: distance=${summary.closestToTargetDistance}`)
    logger(`  Target regions remaining: ${summary.targetContainingRegions}`)
    logger(`  Tree depth estimate: ${Math.log2(summary.leafNodes).toFixed(1)}`)

    debug = false
    return summary
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
      // If target is within bounds, distance contribution is 0
    }

    return distance
  }

  private calculateRegionSize(region: StatRegion): number {
    let size = 1
    for (const stat of region.variableStats) {
      size *= Math.max(1, region.upper[stat] - region.lower[stat] + 1)
    }
    return size
  }

  private formatRegionBounds(region: StatRegion): string {
    return region.variableStats
      .filter((stat) => region.upper[stat] - region.lower[stat] > 0)
      .map((stat) => `${stat}:[${region.lower[stat]},${region.upper[stat]}]`)
      .join(', ')
  }

  private formatSubstatCounts(stats: SubstatCounts): string {
    const relevantStats = this.rootRegion.variableStats.concat(['SPD'])
    return relevantStats
      .filter((stat) => (stats[stat] || 0) > 0)
      .map((stat) => `${stat}:${stats[stat]}`)
      .join(', ')
  }

  // ============================================================================
  // EXISTING METHODS WITH ENHANCED TRACKING
  // ============================================================================

  private analyzeTargetAnswerFeasibility(): void {
    logger('\n📋 TARGET ANSWER FEASIBILITY ANALYSIS:')

    // Check if target is within root region bounds
    const isWithinBounds = this.isPointWithinRegion(this.TARGET_ANSWER, this.rootRegion)
    logger(`Target within root bounds: ${isWithinBounds}`)

    if (!isWithinBounds) {
      logger('❌❌❌ TARGET ANSWER IS OUTSIDE ROOT REGION BOUNDS! ❌❌❌')
      logger('This means the algorithm CANNOT POSSIBLY find the correct answer!')
      logger('Bound violations:')
      for (const stat of this.rootRegion.statNames) {
        const targetVal = this.TARGET_ANSWER[stat] || 0
        const lower = this.rootRegion.lower[stat]
        const upper = this.rootRegion.upper[stat]
        if (targetVal < lower) {
          logger(`  ❌ ${stat}: target=${targetVal} < lower_bound=${lower} (need to REDUCE lower bound)`)
        } else if (targetVal > upper) {
          logger(`  ❌ ${stat}: target=${targetVal} > upper_bound=${upper} (need to INCREASE upper bound)`)
        } else {
          logger(`  ✅ ${stat}: target=${targetVal} within bounds=[${lower}, ${upper}]`)
        }
      }
      logger('❌❌❌ ALGORITHM WILL NEVER FIND CORRECT ANSWER WITH THESE BOUNDS ❌❌❌')
    } else {
      logger('✅ Target answer is within bounds - algorithm has potential to find it')
    }

    // Check budget
    const targetSum = this.calculateSum(this.TARGET_ANSWER, this.rootRegion)
    logger(`Target sum: ${targetSum}, Required: ${this.targetSum}`)

    // Check validator
    const isValid = this.substatValidator.isValidDistribution(this.TARGET_ANSWER)
    logger(`Target passes validator: ${isValid}`)

    if (isValid) {
      const targetDamage = this.damageFunction(this.TARGET_ANSWER)
      logger(`Target damage: ${targetDamage}`)
    }

    logger('─'.repeat(50))
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

  private logTargetAnalysis(point: SubstatCounts, context: string): void {
    const distance = this.calculateDistanceToTarget(point)
    const isExactMatch = distance === 0

    if (isExactMatch) {
      logger(`🎯 EXACT TARGET MATCH FOUND! Context: ${context}`)
      logger('Point:', point)
    } else if (distance <= 5) {
      logger(`🔍 CLOSE TO TARGET (distance=${distance}) Context: ${context}`)
      logger('Point:', point)
      logger('Target:', this.TARGET_ANSWER)
    }
  }

  private calculateDamage(node: StatNode) {
    node.damage = this.damageFunction(node.representative)

    // Track target analysis
    this.logTargetAnalysis(node.representative, `Node ${node.nodeId} damage calculation`)

    // Enhanced tracking for both best damage and closest to target
    if (node.damage > this.topDamage) {
      this.topDamage = node.damage
      this.topNode = node
      logger(`🏆 NEW BEST DAMAGE: ${node.damage} (Node ${node.nodeId})`)
    }

    // Track closest to target
    const targetDistance = this.calculateDistanceToTarget(node.representative)
    if (targetDistance < this.closestToTargetDistance) {
      this.closestToTarget = node
      this.closestToTargetDistance = targetDistance
      logger(`🎯 CLOSEST TO TARGET: distance=${targetDistance} (Node ${node.nodeId})`)
      logger(`  Point:`, this.formatSubstatCounts(node.representative))

      if (targetDistance === 0) {
        logger(`🎯🎯🎯 EXACT TARGET FOUND! 🎯🎯🎯`)
      }
    }
  }

  public split() {
    const topNode = this.queue.pop()
    if (!topNode) {
      logger('No node to split')
      return
    }

    logger(`\n🔄 SPLITTING NODE ${topNode.nodeId}`)
    this.logTargetAnalysis(topNode.representative, `Pre-split node ${topNode.nodeId}`)

    // Check if target could be in this region
    const targetInRegion = this.isPointWithinRegion(this.TARGET_ANSWER, topNode.region)
    if (targetInRegion) {
      logger(`🎯 TARGET COULD BE IN THIS REGION! (Node ${topNode.nodeId})`)
    }

    // Get all splittable dimensions in order of preference (largest range first)
    const candidateDimensions = this.getSplitDimensionsInOrder(topNode)

    if (candidateDimensions.length === 0) {
      logger('No splittable dimensions available')
      if (targetInRegion) {
        logger('❌ REGION CONTAINING TARGET CANNOT BE SPLIT!')
      }
      return
    }

    logger(`Attempting to split node ${topNode.nodeId} on ${candidateDimensions.length} candidate dimensions`)
    // logger('Representative:', topNode.representative)
    // logger('Region bounds:', { lower: topNode.region.lower, upper: topNode.region.upper })

    // Try each dimension in order until one succeeds
    for (let i = 0; i < candidateDimensions.length; i++) {
      const splitDimension = candidateDimensions[i]
      logger(`===\nAttempting split on dimension ${i + 1}/${candidateDimensions.length}: ${splitDimension}`)

      // Check which direction would move toward target
      const currentVal = topNode.representative[splitDimension]
      const targetVal = this.TARGET_ANSWER[splitDimension] || 0
      if (targetInRegion) {
        logger(`🎯 TARGET DIRECTION for ${splitDimension}: current=${currentVal}, target=${targetVal}`)
      }

      const splitResult = this.attemptSplitOnDimension(topNode, splitDimension)

      if (splitResult.success) {
        logger(`Successfully split on dimension: ${splitDimension}`)

        // Track which children contain target
        let childrenContainTarget = 0

        // Analyze children for target proximity
        for (const child of splitResult.children) {
          this.logTargetAnalysis(child.representative, `Child ${child.side} of node ${topNode.nodeId}`)

          if (targetInRegion) {
            const childContainsTarget = this.wouldChildContainTarget(topNode, splitDimension, child)
            if (childContainsTarget) {
              logger(`🎯 ${child.side.toUpperCase()} CHILD WOULD CONTAIN TARGET!`)
              childrenContainTarget++
            }
          }
        }

        // Record split history for diagnostics
        this.splitHistory.push({
          nodeId: topNode.nodeId,
          dimension: splitDimension,
          targetInRegion,
          childrenContainTarget,
        })

        // CRITICAL: Add comprehensive debugging for problematic split
        if (targetInRegion && childrenContainTarget === 0) {
          logger('\n🚨🚨🚨 CRITICAL: TARGET WILL BE LOST IN THIS SPLIT! 🚨🚨🚨')
        }

        this.executeSplit(topNode, splitDimension, splitResult.children)
        return // Success - exit early
      } else {
        logger(`Failed to split on dimension: ${splitDimension} (${splitResult.reason})`)
        if (targetInRegion && splitDimension === this.getTargetPreferredSplitDimension(topNode)) {
          logger(`❌ FAILED TO SPLIT ON DIMENSION NEEDED FOR TARGET!`)
        }
        // Continue to next dimension
      }
    }

    // If we reach here, all dimensions have been exhausted
    logger(`All ${candidateDimensions.length} dimensions exhausted. Node ${topNode.nodeId} cannot be split.`)
    if (targetInRegion) {
      logger('❌ REGION CONTAINING TARGET EXHAUSTED ALL SPLIT OPTIONS!')
    }
  }

  private wouldChildContainTarget(parentNode: StatNode, splitDimension: string, child: SplitChild): boolean {
    // Create child region bounds
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

  private getTargetPreferredSplitDimension(node: StatNode): string | null {
    const currentRep = node.representative
    let maxDifference = 0
    let bestDimension: string | null = null

    for (const stat of node.region.variableStats) {
      const currentVal = currentRep[stat] || 0
      const targetVal = this.TARGET_ANSWER[stat] || 0
      const difference = Math.abs(currentVal - targetVal)

      if (difference > maxDifference) {
        maxDifference = difference
        bestDimension = stat
      }
    }

    return bestDimension
  }

  public getBest() {
    debug = true
    logger(this.topNode.representative)
    logger(this.topNode.damage)
    debug = false
  }

  // Get all variable stats sorted by range (descending), filtered by minimum range
  private getSplitDimensionsInOrder(node: StatNode): string[] {
    const region = node.region
    const minSplitRange = 1 // Configurable minimum range for meaningful splits

    const candidates: Array<{ stat: string, range: number }> = []

    for (const stat of region.variableStats) {
      const range = this.getStatRange(region, stat)
      if (range >= minSplitRange) {
        candidates.push({ stat, range })
      }
    }

    // Sort by range descending (largest ranges first)
    candidates.sort((a, b) => b.range - a.range)

    logger('Split candidates:', candidates.map((c) => `${c.stat}:${c.range}`).join(', '))

    return candidates.map((c) => c.stat)
  }

  // CORRECTED: Proper space partitioning that guarantees 2 children

  // Replace your attemptSplitOnDimension method with this corrected version
  private attemptSplitOnDimension(node: StatNode, splitDimension: string): SplitAttemptResult {
    const region = node.region
    const lowerBound = region.lower[splitDimension]
    const upperBound = region.upper[splitDimension]
    const currentValue = node.representative[splitDimension]

    logger(`  CORRECTED SPLIT LOGIC:`)
    logger(`  Region bounds: [${lowerBound}, ${upperBound}]`)
    logger(`  Current representative: ${currentValue}`)

    // Try multiple split values, prioritizing those that preserve space
    const candidateSplitValues = this.generateCandidateSplitValues(
      lowerBound,
      upperBound,
      currentValue,
      splitDimension,
    )

    logger(`  Candidate split values: ${candidateSplitValues.join(', ')}`)

    // Try each candidate until we find one that produces 2 valid children
    for (const splitValue of candidateSplitValues) {
      logger(`    Trying split value: ${splitValue}`)

      const result = this.tryBinarySpacePartition(node, splitDimension, splitValue)

      if (result.success && result.children.length === 2) {
        logger(`    ✅ SUCCESS: Split at ${splitValue} produces 2 valid children`)
        return result
      } else {
        logger(`    ❌ FAILED: Split at ${splitValue} - ${result.reason}`)
      }
    }

    return {
      success: false,
      reason: 'No split value produced 2 valid children',
      children: [],
    }
  }

  private generateCandidateSplitValues(
    lowerBound: number,
    upperBound: number,
    currentValue: number,
    splitDimension: string,
  ): number[] {
    const targetValue = this.TARGET_ANSWER[splitDimension] || 0
    const candidates: number[] = []

    // Strategy 1: Midpoint of region bounds (most balanced)
    const regionMidpoint = Math.floor((lowerBound + upperBound) / 2)
    if (regionMidpoint > lowerBound && regionMidpoint < upperBound) {
      candidates.push(regionMidpoint)
    }

    // Strategy 2: Current representative value (maintains parent properties)
    if (currentValue > lowerBound && currentValue < upperBound) {
      candidates.push(currentValue)
    }

    // Strategy 3: Values near current representative
    for (let offset of [-1, 1, -2, 2]) {
      const candidate = currentValue + offset
      if (candidate > lowerBound && candidate < upperBound) {
        candidates.push(candidate)
      }
    }

    // Strategy 4: Values that would preserve target (diagnostic only)
    if (targetValue > lowerBound && targetValue < upperBound) {
      // Split just before target (target goes right)
      if (targetValue - 1 > lowerBound) {
        candidates.push(targetValue - 1)
      }
      // Split just after target (target goes left)
      if (targetValue + 1 < upperBound) {
        candidates.push(targetValue + 1)
      }
    }

    // Remove duplicates and sort by distance from current value
    const uniqueCandidates = [...new Set(candidates)]
    return uniqueCandidates.sort((a, b) => {
      const distA = Math.abs(a - currentValue)
      const distB = Math.abs(b - currentValue)
      return distA - distB
    })
  }

  private tryBinarySpacePartition(
    parentNode: StatNode,
    splitDimension: string,
    splitValue: number,
  ): SplitAttemptResult {
    logger(`      Binary partition at ${splitDimension}=${splitValue}`)

    const region = parentNode.region
    const lowerBound = region.lower[splitDimension]
    const upperBound = region.upper[splitDimension]

    // Create BOTH children with exact space partitioning
    const leftChildBounds = {
      lower: { ...region.lower },
      upper: { ...region.upper, [splitDimension]: splitValue },
    }

    const rightChildBounds = {
      lower: { ...region.lower, [splitDimension]: splitValue },
      upper: { ...region.upper },
    }

    logger(`        Left child bounds: [${leftChildBounds.lower[splitDimension]}, ${leftChildBounds.upper[splitDimension]}]`)
    logger(`        Right child bounds: [${rightChildBounds.lower[splitDimension]}, ${rightChildBounds.upper[splitDimension]}]`)

    // Verify space conservation
    const leftCovers = [leftChildBounds.lower[splitDimension], leftChildBounds.upper[splitDimension]]
    const rightCovers = [rightChildBounds.lower[splitDimension], rightChildBounds.upper[splitDimension]]

    const spaceConserved = leftCovers[0] === lowerBound
      && leftCovers[1] === splitValue
      && rightCovers[0] === splitValue
      && rightCovers[1] === upperBound

    if (!spaceConserved) {
      return {
        success: false,
        reason: 'Space conservation violation in bounds creation',
        children: [],
      }
    }

    logger(`        ✅ Space conservation verified`)

    // Check target preservation (diagnostic)
    const targetValue = this.TARGET_ANSWER[splitDimension] || 0
    const targetInParent = this.isPointWithinRegion(this.TARGET_ANSWER, parentNode.region)

    if (targetInParent) {
      const targetInLeft = targetValue >= leftCovers[0] && targetValue <= leftCovers[1]
      const targetInRight = targetValue >= rightCovers[0] && targetValue <= rightCovers[1]
      logger(`        🎯 Target ${targetValue}: left=${targetInLeft}, right=${targetInRight}`)

      if (!targetInLeft && !targetInRight) {
        logger(`        🐛 BUG: Target would be lost in this partition!`)
      }
    }

    // Generate representatives for BOTH children
    const children: SplitChild[] = []

    // Left child
    const leftRegion = this.createRegionFromBounds(leftChildBounds, region.statNames)
    const leftRep = this.generateRepresentativeForRegion(leftRegion, splitDimension, splitValue)

    if (leftRep && this.substatValidator.isValidDistribution(leftRep)) {
      children.push({
        side: 'left',
        splitValue,
        representative: leftRep,
      })
      logger(`        Left child VALID: ${this.formatSubstatCounts(leftRep)}`)
    } else {
      logger(`        Left child INVALID`)
      return {
        success: false,
        reason: 'Left child representative invalid',
        children: [],
      }
    }

    // Right child
    const rightRegion = this.createRegionFromBounds(rightChildBounds, region.statNames)
    const rightRep = this.generateRepresentativeForRegion(rightRegion, splitDimension, splitValue)

    if (rightRep && this.substatValidator.isValidDistribution(rightRep)) {
      children.push({
        side: 'right',
        splitValue,
        representative: rightRep,
      })
      logger(`        Right child VALID: ${this.formatSubstatCounts(rightRep)}`)
    } else {
      logger(`        Right child INVALID`)
      return {
        success: false,
        reason: 'Right child representative invalid',
        children: [],
      }
    }

    // Both children must be valid for success
    if (children.length === 2) {
      return {
        success: true,
        reason: 'Both children generated successfully',
        children,
      }
    } else {
      return {
        success: false,
        reason: `Only ${children.length}/2 children valid`,
        children: [],
      }
    }
  }

  private generateRepresentativeForRegion(
    region: StatRegion,
    splitDimension: string,
    splitValue: number,
  ): SubstatCounts | null {
    logger(`          Generating representative for region with ${splitDimension}=${splitValue}`)

    const result: SubstatCounts = {}

    // Step 1: Initialize all stats to their lower bounds
    for (const stat of region.statNames) {
      result[stat] = region.lower[stat]
    }

    // Step 2: Set the split dimension to the split value
    result[splitDimension] = splitValue

    // Step 3: Calculate current budget usage
    const currentSum = this.calculateSum(result, region)
    const budgetDiff = this.targetSum - currentSum

    logger(`          Initial sum: ${currentSum}, target: ${this.targetSum}, diff: ${budgetDiff}`)

    if (budgetDiff === 0) {
      logger(`          Perfect budget match`)
      return result
    }

    // Step 4: Distribute remaining budget using round-robin
    const isAddition = budgetDiff > 0
    const adjustmentsNeeded = Math.abs(budgetDiff)

    logger(`          Need to ${isAddition ? 'add' : 'remove'} ${adjustmentsNeeded} points`)

    for (let i = 0; i < adjustmentsNeeded; i++) {
      let adjusted = false

      // Round-robin through variable stats (excluding split dimension)
      for (const stat of region.variableStats) {
        if (stat === splitDimension) continue // Split dimension already set

        const newValue = result[stat] + (isAddition ? 1 : -1)

        // Check bounds
        if (newValue >= region.lower[stat] && newValue <= region.upper[stat]) {
          result[stat] = newValue
          adjusted = true
          // logger(`            Adjusted ${stat}: ${result[stat] - (isAddition ? 1 : -1)} → ${result[stat]}`)
          break
        }
      }

      if (!adjusted) {
        logger(`          Failed to make adjustment ${i + 1}/${adjustmentsNeeded}`)
        return null
      }
    }

    // Step 5: Final validation
    const finalSum = this.calculateSum(result, region)
    if (finalSum !== this.targetSum) {
      logger(`          Final sum mismatch: ${finalSum} !== ${this.targetSum}`)
      return null
    }

    // Verify all bounds
    for (const stat of region.statNames) {
      if (result[stat] < region.lower[stat] || result[stat] > region.upper[stat]) {
        logger(`          Bound violation: ${stat}=${result[stat]} not in [${region.lower[stat]}, ${region.upper[stat]}]`)
        return null
      }
    }

    logger(`          ✅ Valid representative generated`)
    return result
  }

  // Execute the actual split once a valid dimension and children are found
  private executeSplit(parentNode: StatNode, splitDimension: string, children: SplitChild[]): void {
    logger(`Executing split on ${splitDimension} with ${children.length} children`)

    // Add comprehensive debugging
    this.debugSplitPartitioning(parentNode, splitDimension, children)
    // this.verifySpaceConservation(parentNode, children, splitDimension)

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
      this.allCreatedNodes.push(childNode) // Track all created nodes
    }

    // Evaluate damage for children and add to queue
    for (const child of childNodes) {
      this.calculateDamage(child)
      child.priority = this.calculatePriority(child)
      this.queue.push(child)

      logger(`  Created child node ${child.nodeId} with damage ${child.damage}`)

      // Additional debugging for target tracking
      const targetInChild = this.isPointWithinRegion(this.TARGET_ANSWER, child.region)
      if (targetInChild) {
        logger(`  🎯 Child ${child.nodeId} contains target`)
      }
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
      // Handle asymmetric split
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

    logger(`Split completed: ${childNodes.length} children created`)
  }

  private findValidSplitPoint(
    parentNode: StatNode,
    splitDimension: string,
    startValue: number,
    midpointLimit: number,
    direction: 1 | -1, // 1 for increasing, -1 for decreasing
  ): { splitValue: number, representative: SubstatCounts } | null {
    const region = parentNode.region
    let currentSplitValue = startValue
    let lastValidResult: { splitValue: number, representative: SubstatCounts } | null = null

    const targetValue = this.TARGET_ANSWER[splitDimension] || 0
    const targetInParent = this.isPointWithinRegion(this.TARGET_ANSWER, parentNode.region)

    logger(`  🔍 Searching ${direction === 1 ? 'right' : 'left'} from ${startValue} to ${midpointLimit}`)
    if (targetInParent) {
      logger(`  🎯 Target for ${splitDimension} is ${targetValue}`)
    }

    while (true) {
      // Move one step in the specified direction
      currentSplitValue += direction

      // Check midpoint limits
      if (direction === 1 && currentSplitValue > midpointLimit) {
        logger(`    Reached right midpoint limit: ${midpointLimit}`)
        break
      }
      if (direction === -1 && currentSplitValue < midpointLimit) {
        logger(`    Reached left midpoint limit: ${midpointLimit}`)
        break
      }

      // Also check region bounds as safety
      if (currentSplitValue < region.lower[splitDimension] || currentSplitValue > region.upper[splitDimension]) {
        logger(`    Hit region boundary: ${currentSplitValue}`)
        break
      }

      logger(`    Trying split value: ${currentSplitValue}`)

      // Show target implications if relevant
      if (targetInParent) {
        // For left search (direction = -1): left child gets [lower, currentSplitValue], right gets [currentSplitValue, upper]
        // For right search (direction = 1): left child gets [lower, currentSplitValue], right gets [currentSplitValue, upper]
        const targetInLeft = targetValue <= currentSplitValue
        const targetInRight = targetValue >= currentSplitValue
        logger(`      Target would be in: ${targetInLeft ? 'LEFT' : ''}${targetInLeft && targetInRight ? '+' : ''}${targetInRight ? 'RIGHT' : ''}`)
      }

      // Create child region bounds for this split value
      const childRegionBounds = this.createChildRegionBounds(
        region,
        splitDimension,
        currentSplitValue,
        direction,
      )

      // Generate representative using incremental approach
      const representative = this.generateIncrementalRepresentative(
        parentNode.representative,
        splitDimension,
        currentSplitValue,
        childRegionBounds,
      )

      if (!representative) {
        logger(`      Failed to generate representative for ${splitDimension}=${currentSplitValue}`)
        continue // Continue searching instead of breaking
      }

      // Track target analysis for this representative
      this.logTargetAnalysis(representative, `Split candidate ${splitDimension}=${currentSplitValue}`)

      // Validate the distribution
      if (this.substatValidator.isValidDistribution(representative)) {
        logger(`      Valid split point found: ${splitDimension}=${currentSplitValue}`)

        // Use FIRST valid result found (closest to parent) for proper space partitioning
        if (!lastValidResult) {
          lastValidResult = { splitValue: currentSplitValue, representative }
          logger(`      🎯 USING FIRST VALID SPLIT: ${splitDimension}=${currentSplitValue} for space partitioning`)
        } else {
          logger(`      Additional valid point found but keeping first: ${splitDimension}=${currentSplitValue}`)
        }
      } else {
        logger(`      Invalid distribution for ${splitDimension}=${currentSplitValue}, continuing search`)
        // Continue searching - don't break on validation failure
      }
    }

    return lastValidResult
  }

  private createChildRegionBounds(
    parentRegion: StatRegion,
    splitDimension: string,
    splitValue: number,
    direction: 1 | -1,
  ): StatRegion {
    const childBounds = {
      lower: { ...parentRegion.lower },
      upper: { ...parentRegion.upper },
    }

    if (direction === -1) {
      // Left child: upper bound becomes split value
      childBounds.upper[splitDimension] = splitValue
    } else {
      // Right child: lower bound becomes split value
      childBounds.lower[splitDimension] = splitValue
    }

    return {
      lower: childBounds.lower,
      upper: childBounds.upper,
      statNames: parentRegion.statNames,
      variableStats: parentRegion.variableStats,
      fixedStats: parentRegion.fixedStats,
    }
  }

  private generateIncrementalRepresentative(
    parentRepresentative: SubstatCounts,
    splitDimension: string,
    newSplitValue: number,
    newRegionBounds: StatRegion,
  ): SubstatCounts | null {
    // Step 1: Copy parent and update split dimension
    const result = { ...parentRepresentative }
    result[splitDimension] = newSplitValue

    // Step 2: Calculate budget difference
    const currentSum = this.calculateSum(result, newRegionBounds)
    const budgetDiff = this.targetSum - currentSum

    if (budgetDiff === 0) {
      // Perfect - no adjustment needed
      return result
    }

    // Step 3: Distribute difference one roll at a time
    const isAddition = budgetDiff > 0
    const adjustmentsNeeded = Math.abs(budgetDiff)

    for (let i = 0; i < adjustmentsNeeded; i++) {
      const bestStat = this.findBestStatForAdjustment(
        result,
        newRegionBounds,
        splitDimension,
        isAddition,
      )

      if (!bestStat) {
        logger(`        Cannot find stat to adjust for budget difference: ${budgetDiff}`)
        return null
      }

      result[bestStat] += isAddition ? 1 : -1
    }

    // Step 4: Verify final constraints
    const finalSum = this.calculateSum(result, newRegionBounds)
    if (finalSum !== this.targetSum) {
      logger(`        Sum constraint violation: ${finalSum} !== ${this.targetSum}`)
      return null
    }

    // Verify bounds
    for (const stat of newRegionBounds.statNames) {
      if (result[stat] < newRegionBounds.lower[stat] || result[stat] > newRegionBounds.upper[stat]) {
        logger(`        Bound violation for ${stat}: ${result[stat]} not in [${newRegionBounds.lower[stat]}, ${newRegionBounds.upper[stat]}]`)
        return null
      }
    }

    return result
  }

  private findBestStatForAdjustment(
    current: SubstatCounts,
    region: StatRegion,
    splitDimension: string,
    isAddition: boolean,
  ): string | null {
    const regionCenter = this.calculateRegionCenter(region, splitDimension)

    // Track stats that move closer to center and stats for fallback
    let bestStatMovingCloser: string | null = null
    let furthestDistanceForCloser = -1

    let bestStatForFallback: string | null = null
    let closestDistanceForFallback = Infinity

    for (const stat of region.variableStats) {
      if (stat === splitDimension) continue

      // Check if adjustment is within bounds
      const newValue = current[stat] + (isAddition ? 1 : -1)
      if (newValue < region.lower[stat] || newValue > region.upper[stat]) continue

      // Calculate distances (absolute values)
      const currentDistance = Math.abs(current[stat] - regionCenter[stat])
      const newDistance = Math.abs(newValue - regionCenter[stat])

      // Check if this adjustment moves the stat closer to center
      if (newDistance < currentDistance) {
        // This stat moves closer - track if it's the furthest one
        if (currentDistance > furthestDistanceForCloser) {
          furthestDistanceForCloser = currentDistance
          bestStatMovingCloser = stat
        }
      }

      // Always track the closest stat for fallback
      if (currentDistance < closestDistanceForFallback) {
        closestDistanceForFallback = currentDistance
        bestStatForFallback = stat
      }
    }

    // Return the best stat that moves closer, or fallback to closest stat
    return bestStatMovingCloser || bestStatForFallback
  }

  private calculateRegionCenter(region: StatRegion, excludeStat: string): Record<string, number> {
    const center: Record<string, number> = {}

    for (const stat of region.variableStats) {
      if (stat === excludeStat) continue
      center[stat] = (region.lower[stat] + region.upper[stat]) / 2
    }

    return center
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

  private createChildNode(
    parent: StatNode,
    splitDimension: string,
    splitValue: number,
    representative: SubstatCounts,
    side: 'left' | 'right',
  ): StatNode {
    // Create child region bounds
    const childBounds = {
      lower: { ...parent.region.lower },
      upper: { ...parent.region.upper },
    }

    if (side === 'left') {
      childBounds.upper[splitDimension] = splitValue
    } else {
      childBounds.lower[splitDimension] = splitValue
    }

    // Create child region
    const childRegion: StatRegion = {
      lower: childBounds.lower,
      upper: childBounds.upper,
      statNames: parent.region.statNames,
      variableStats: parent.region.variableStats,
      fixedStats: parent.region.fixedStats,
    }

    return {
      region: childRegion,
      representative,
      damage: null, // Will be set by caller
      priority: 0, // Will be set by caller
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: this.nextNodeId++,
    }
  }

  private calculatePriority(node: StatNode): number {
    if (node.damage === null) return 0

    // Calculate region volume for exploration component
    let volume = 1
    for (const stat of node.region.variableStats) {
      const range = node.region.upper[stat] - node.region.lower[stat]
      if (range > 0) {
        volume *= range
      }
    }

    // Priority = damage * (volume^explorationWeight)
    // Using 0.8 as default exploration weight (80% exploration bias)
    const explorationWeight = 0.8
    return node.damage * Math.pow(Math.max(volume, 1), explorationWeight)
  }

  private createRootRegion(): StatRegion {
    // Identify fixed vs variable stats
    const fixedStats: string[] = []
    const variableStats: string[] = []

    for (const stat of this.effectiveStats) {
      if (this.lower[stat] === this.upper[stat]) {
        fixedStats.push(stat)
      } else {
        variableStats.push(stat)
      }
    }

    return {
      lower: { ...this.lower },
      upper: { ...this.upper },
      statNames: this.effectiveStats,
      variableStats,
      fixedStats,
    }
  }

  private generateStartingPoint(): SubstatCounts {
    if (!this.rootRegion) throw new Error('Root region not initialized')

    const result: SubstatCounts = {}

    // Initialize all stats and apply fixed values
    for (const stat of this.rootRegion.statNames) {
      result[stat] = this.rootRegion.fixedStats.includes(stat) ? this.rootRegion.lower[stat] : 0
    }

    // Calculate remaining budget and distribute evenly
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
      damage: null, // Will be set when we add damage evaluation
      priority: 0, // Will be calculated when we add priority system
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: this.nextNodeId++,
    }
  }

  public debugStartingPoint(): void {
    if (!this.rootRegion) return

    const point = this.generateStartingPoint()
    const budgetUsed = this.rootRegion.fixedStats.reduce((sum, stat) => sum + Math.ceil(point[stat]), 0)
      + this.rootRegion.variableStats.reduce((sum, stat) => sum + point[stat], 0)

    logger('Starting Point:', point)
    logger('Budget used:', budgetUsed, '/ target:', this.targetSum)
  }

  public debugRootNode(): void {
    if (!this.rootNode) return

    logger('Root Node Debug:')
    logger('- Node ID:', this.rootNode.nodeId)
    logger('- Is Leaf:', this.rootNode.isLeaf)
    logger('- Representative:', this.rootNode.representative)
    logger('- Damage:', this.rootNode.damage)
  }

  private getStatRange(region: StatRegion, stat: string): number {
    return region.upper[stat] - region.lower[stat]
  }

  public debugRootRegion(): void {
    if (!this.rootRegion) return

    logger('Root Region Debug:')
    logger('- Total stats:', this.rootRegion.statNames.length)
    logger('- Variable stats:', this.rootRegion.variableStats)
    logger('- Fixed stats:', this.rootRegion.fixedStats)

    for (const stat of this.rootRegion.statNames) {
      const range = this.getStatRange(this.rootRegion, stat)
      logger(`- ${stat}: [${this.rootRegion.lower[stat]}, ${this.rootRegion.upper[stat]}] (range: ${range})`)
    }
  }

  // Add helper method for region creation from bounds
  private createRegionFromBounds(bounds: { lower: SubstatCounts, upper: SubstatCounts }, statNames: string[]): StatRegion {
    const fixedStats: string[] = []
    const variableStats: string[] = []

    for (const stat of statNames) {
      if (bounds.lower[stat] === bounds.upper[stat]) {
        fixedStats.push(stat)
      } else {
        variableStats.push(stat)
      }
    }

    return {
      lower: bounds.lower,
      upper: bounds.upper,
      statNames,
      variableStats,
      fixedStats,
    }
  }
}
