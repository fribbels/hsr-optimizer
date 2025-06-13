import {
  StatNode,
  StatRegion,
  StatTreeStats,
} from 'lib/worker/maxima/core'

export interface IStatTreeManager {
  // Core tree operations - no root parameter needed
  insertNode(representative: Float32Array): StatNode
  collectLeaves(): StatNode[]
  collectInternalNodes(): StatNode[]
  findHighestPriorityLeaf(): StatNode | null
  findLowestPriorityLeaf(): StatNode | null
  countNodes(): number
  countLeaves(): number
  getTreeDepth(): number
  getTreeStats(): StatTreeStats
  validateTreeStructure(): boolean

  // Utility methods
  findPathToNode(target: StatNode): StatNode[] | null
  getNodeAtPath(path: number[]): StatNode | null
  traversePreOrder(callback: (node: StatNode) => void): void
  traversePostOrder(callback: (node: StatNode) => void): void
  findNodeById(nodeId: number): StatNode | null
  cloneTree(): StatNode | null

  // Tree state
  isEmpty(): boolean
  getRoot(): StatNode | null
  getDimensions(): number
  clear(): void
}

/**
 * StatTreeManager - Self-contained KD-tree for constraint-aware optimization
 *
 * This class provides a complete KD-tree data structure with automatic region management.
 * Tree maintains its own root and dimensional bounds, providing a clean insertion-based API.
 */
export class StatTreeManager implements IStatTreeManager {
  private nodeIdCounter: number = 0
  private root: StatNode | null = null
  private readonly dimensions: number
  private readonly globalBounds: { lower: Float32Array, upper: Float32Array }

  constructor(dimensions: number, globalBounds: { lower: Float32Array, upper: Float32Array }) {
    this.dimensions = dimensions
    this.globalBounds = {
      lower: new Float32Array(globalBounds.lower),
      upper: new Float32Array(globalBounds.upper)
    }
  }

  /**
   * Inserts a point into the KD-tree, automatically determining regions and splits
   * Essential method - this is how points are added to the tree
   */
  insertNode(representative: Float32Array): StatNode {
    if (representative.length !== this.dimensions) {
      throw new Error(`Point dimension mismatch: expected ${this.dimensions}, got ${representative.length}`)
    }

    // Create first node if tree is empty
    if (this.root === null) {
      this.root = this.createLeafNode({
        lower: new Float32Array(this.globalBounds.lower),
        upper: new Float32Array(this.globalBounds.upper),
        dimensions: this.dimensions
      })
      this.root.representative = new Float32Array(representative)
      return this.root
    }

    // Find the leaf that should contain this point
    const targetLeaf = this.findInsertionLeaf(representative)

    // If leaf is empty, just place the point there
    if (targetLeaf.representative === null) {
      targetLeaf.representative = new Float32Array(representative)
      return targetLeaf
    }

    // Split the leaf to accommodate both points
    return this.splitLeafForInsertion(targetLeaf, representative)
  }

  /**
   * Collects all leaf nodes from the tree
   */
  collectLeaves(): StatNode[] {
    if (this.root === null) return []
    return this.collectLeavesFromNode(this.root)
  }

  /**
   * Collects all internal nodes from the tree
   */
  collectInternalNodes(): StatNode[] {
    if (this.root === null) return []
    return this.collectInternalNodesFromNode(this.root)
  }

  /**
   * Finds the leaf node with highest priority
   */
  findHighestPriorityLeaf(): StatNode | null {
    const leaves = this.collectLeaves()
    return this.findHighestPriorityFromLeaves(leaves)
  }

  /**
   * Finds the leaf node with lowest priority
   */
  findLowestPriorityLeaf(): StatNode | null {
    const leaves = this.collectLeaves()
    return this.findLowestPriorityFromLeaves(leaves)
  }

  /**
   * Counts total nodes in the tree
   */
  countNodes(): number {
    if (this.root === null) return 0
    return this.countNodesFromNode(this.root)
  }

  /**
   * Counts leaf nodes in the tree
   */
  countLeaves(): number {
    if (this.root === null) return 0
    return this.countLeavesFromNode(this.root)
  }

  /**
   * Calculates maximum depth of the tree
   */
  getTreeDepth(): number {
    if (this.root === null) return 0
    return this.getTreeDepthFromNode(this.root)
  }

  /**
   * Calculates comprehensive tree statistics
   */
  getTreeStats(): StatTreeStats {
    if (this.root === null) {
      return {
        totalNodes: 0,
        leafNodes: 0,
        internalNodes: 0,
        maxDepth: 0,
        avgLeafDepth: 0,
        dimensions: this.dimensions
      }
    }
    return this.getTreeStatsFromNode(this.root)
  }

  /**
   * Validates tree structure integrity
   */
  validateTreeStructure(): boolean {
    if (this.root === null) return true
    return this.validateTreeStructureFromNode(this.root, this.dimensions)
  }

  /**
   * Checks if tree is empty
   */
  isEmpty(): boolean {
    return this.root === null
  }

  /**
   * Gets the root node (may be null)
   */
  getRoot(): StatNode | null {
    return this.root
  }

  /**
   * Gets the dimensionality of the tree
   */
  getDimensions(): number {
    return this.dimensions
  }

  /**
   * Clears the tree
   */
  clear(): void {
    this.root = null
    this.nodeIdCounter = 0
  }

  // ===== UTILITY METHODS =====

  /**
   * Finds path from root to target node
   */
  findPathToNode(target: StatNode): StatNode[] | null {
    if (this.root === null) return null
    return this.findPathToNodeFromRoot(this.root, target)
  }

  /**
   * Gets node at specific path
   */
  getNodeAtPath(path: number[]): StatNode | null {
    if (this.root === null) return null
    return this.getNodeAtPathFromRoot(this.root, path)
  }

  /**
   * Pre-order traversal
   */
  traversePreOrder(callback: (node: StatNode) => void): void {
    if (this.root === null) return
    this.traversePreOrderFromNode(this.root, callback)
  }

  /**
   * Post-order traversal
   */
  traversePostOrder(callback: (node: StatNode) => void): void {
    if (this.root === null) return
    this.traversePostOrderFromNode(this.root, callback)
  }

  /**
   * Finds node by ID
   */
  findNodeById(nodeId: number): StatNode | null {
    if (this.root === null) return null
    return this.findNodeByIdFromRoot(this.root, nodeId)
  }

  /**
   * Clones entire tree
   */
  cloneTree(): StatNode | null {
    if (this.root === null) return null
    return this.cloneNodeTree(this.root)
  }

  // ===== PRIVATE HELPER METHODS =====

  private createLeafNode(region: StatRegion): StatNode {
    return {
      region,
      representative: null,
      damage: null,
      priority: 0,
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: ++this.nodeIdCounter
    }
  }

  private convertToInternalNode(
    node: StatNode,
    splitDimension: number,
    splitValue: number,
    leftChild: StatNode,
    rightChild: StatNode
  ): void {
    node.isLeaf = false
    node.splitDimension = splitDimension
    node.splitValue = splitValue
    node.leftChild = leftChild
    node.rightChild = rightChild
  }

  private findInsertionLeaf(point: Float32Array): StatNode {
    let current = this.root!

    while (!current.isLeaf) {
      const splitDim = current.splitDimension!
      const splitVal = current.splitValue!

      if (point[splitDim] <= splitVal) {
        current = current.leftChild!
      } else {
        current = current.rightChild!
      }
    }

    return current
  }

  private splitLeafForInsertion(leaf: StatNode, newPoint: Float32Array): StatNode {
    const existingPoint = leaf.representative!

    // Choose split dimension - use the dimension with largest range in the region
    // This creates more balanced subdivisions (e.g., rectangles become squares)
    let splitDim = 0
    let maxRange = leaf.region.upper[0] - leaf.region.lower[0]

    for (let i = 1; i < this.dimensions; i++) {
      const range = leaf.region.upper[i] - leaf.region.lower[i]
      if (range > maxRange) {
        maxRange = range
        splitDim = i
      }
    }

    // Choose split value - midpoint between the two points, clamped to region bounds
    let splitVal = (existingPoint[splitDim] + newPoint[splitDim]) / 2

    // Ensure split value is within the region bounds and creates meaningful subdivisions
    const regionMin = leaf.region.lower[splitDim]
    const regionMax = leaf.region.upper[splitDim]
    splitVal = Math.max(regionMin + 0.001, Math.min(regionMax - 0.001, splitVal))

    // Create child regions
    const leftRegion: StatRegion = {
      lower: new Float32Array(leaf.region.lower),
      upper: new Float32Array(leaf.region.upper),
      dimensions: this.dimensions
    }
    leftRegion.upper[splitDim] = splitVal

    const rightRegion: StatRegion = {
      lower: new Float32Array(leaf.region.lower),
      upper: new Float32Array(leaf.region.upper),
      dimensions: this.dimensions
    }
    rightRegion.lower[splitDim] = splitVal

    // Create child nodes
    const leftChild = this.createLeafNode(leftRegion)
    const rightChild = this.createLeafNode(rightRegion)

    // Assign points to appropriate children
    if (existingPoint[splitDim] <= splitVal) {
      leftChild.representative = existingPoint
      rightChild.representative = new Float32Array(newPoint)
    } else {
      leftChild.representative = new Float32Array(newPoint)
      rightChild.representative = existingPoint
    }

    // Convert leaf to internal node
    this.convertToInternalNode(leaf, splitDim, splitVal, leftChild, rightChild)

    // Return the child that contains the new point
    return newPoint[splitDim] <= splitVal ? leftChild : rightChild
  }

  // Implementation of all the helper methods that work with specific nodes
  private collectLeavesFromNode(root: StatNode): StatNode[] {
    const leaves: StatNode[] = []
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      if (node.isLeaf) {
        leaves.push(node)
      } else {
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }

    return leaves
  }

  private collectInternalNodesFromNode(root: StatNode): StatNode[] {
    const internals: StatNode[] = []
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      if (!node.isLeaf) {
        internals.push(node)
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }

    return internals
  }

  private findHighestPriorityFromLeaves(leaves: readonly StatNode[]): StatNode | null {
    if (leaves.length === 0) return null

    let bestLeaf = leaves[0]
    let maxPriority = bestLeaf.priority

    for (let i = 1; i < leaves.length; i++) {
      if (leaves[i].priority > maxPriority) {
        maxPriority = leaves[i].priority
        bestLeaf = leaves[i]
      }
    }

    return bestLeaf
  }

  private findLowestPriorityFromLeaves(leaves: readonly StatNode[]): StatNode | null {
    if (leaves.length === 0) return null

    let worstLeaf = leaves[0]
    let minPriority = worstLeaf.priority

    for (let i = 1; i < leaves.length; i++) {
      if (leaves[i].priority < minPriority) {
        minPriority = leaves[i].priority
        worstLeaf = leaves[i]
      }
    }

    return worstLeaf
  }

  private countNodesFromNode(root: StatNode): number {
    let count = 0
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!
      count++

      if (!node.isLeaf) {
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }

    return count
  }

  private countLeavesFromNode(root: StatNode): number {
    let count = 0
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      if (node.isLeaf) {
        count++
      } else {
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }

    return count
  }

  private getTreeDepthFromNode(root: StatNode): number {
    let maxDepth = 0
    const stack: Array<{node: StatNode, depth: number}> = [{node: root, depth: 1}]

    while (stack.length > 0) {
      const {node, depth} = stack.pop()!
      maxDepth = Math.max(maxDepth, depth)

      if (!node.isLeaf) {
        if (node.leftChild) stack.push({node: node.leftChild, depth: depth + 1})
        if (node.rightChild) stack.push({node: node.rightChild, depth: depth + 1})
      }
    }

    return maxDepth
  }

  private getTreeStatsFromNode(root: StatNode): StatTreeStats {
    let totalNodes = 0
    let leafNodes = 0
    let internalNodes = 0
    let maxDepth = 0
    let totalLeafDepth = 0

    const stack: Array<{node: StatNode, depth: number}> = [{node: root, depth: 1}]

    while (stack.length > 0) {
      const {node, depth} = stack.pop()!
      totalNodes++
      maxDepth = Math.max(maxDepth, depth)

      if (node.isLeaf) {
        leafNodes++
        totalLeafDepth += depth
      } else {
        internalNodes++
        if (node.leftChild) stack.push({node: node.leftChild, depth: depth + 1})
        if (node.rightChild) stack.push({node: node.rightChild, depth: depth + 1})
      }
    }

    return {
      totalNodes,
      leafNodes,
      internalNodes,
      maxDepth,
      avgLeafDepth: leafNodes > 0 ? totalLeafDepth / leafNodes : 0,
      dimensions: root.region.dimensions
    }
  }

  private validateTreeStructureFromNode(root: StatNode, expectedDimensions: number): boolean {
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      // Check dimension consistency
      if (node.region.dimensions !== expectedDimensions) {
        console.error(`Node ${node.nodeId}: dimension mismatch - expected ${expectedDimensions}, got ${node.region.dimensions}`)
        return false
      }

      // Check region bounds
      if (node.region.lower.length !== expectedDimensions ||
          node.region.upper.length !== expectedDimensions) {
        console.error(`Node ${node.nodeId}: region array size mismatch`)
        return false
      }

      // Validate region bounds are sensible
      for (let i = 0; i < expectedDimensions; i++) {
        if (node.region.lower[i] > node.region.upper[i]) {
          console.error(`Node ${node.nodeId}: invalid region bounds at dimension ${i}`)
          return false
        }
      }

      // Check leaf vs internal consistency
      if (node.isLeaf) {
        if (node.leftChild !== null || node.rightChild !== null) {
          console.error(`Node ${node.nodeId}: leaf node has children`)
          return false
        }
        if (node.splitDimension !== null || node.splitValue !== null) {
          console.error(`Node ${node.nodeId}: leaf node has split info`)
          return false
        }
      } else {
        if (node.leftChild === null || node.rightChild === null) {
          console.error(`Node ${node.nodeId}: internal node missing children`)
          return false
        }
        if (node.splitDimension === null || node.splitValue === null) {
          console.error(`Node ${node.nodeId}: internal node missing split info`)
          return false
        }

        // Validate split dimension is valid
        if (node.splitDimension < 0 || node.splitDimension >= expectedDimensions) {
          console.error(`Node ${node.nodeId}: invalid split dimension ${node.splitDimension}`)
          return false
        }

        // Validate split value is within region bounds
        if (node.splitValue < node.region.lower[node.splitDimension] ||
            node.splitValue > node.region.upper[node.splitDimension]) {
          console.error(`Node ${node.nodeId}: split value outside region bounds`)
          return false
        }

        // Add children to validation stack
        stack.push(node.leftChild, node.rightChild)
      }
    }

    return true
  }

  // Helper methods for utility functions
  private findPathToNodeFromRoot(root: StatNode, target: StatNode): StatNode[] | null {
    const stack: Array<{node: StatNode, path: StatNode[]}> = [{node: root, path: [root]}]

    while (stack.length > 0) {
      const {node, path} = stack.pop()!

      if (node.nodeId === target.nodeId) {
        return path
      }

      if (!node.isLeaf) {
        if (node.leftChild) {
          stack.push({node: node.leftChild, path: [...path, node.leftChild]})
        }
        if (node.rightChild) {
          stack.push({node: node.rightChild, path: [...path, node.rightChild]})
        }
      }
    }

    return null
  }

  private getNodeAtPathFromRoot(root: StatNode, path: number[]): StatNode | null {
    let current: StatNode | null = root

    for (const direction of path) {
      if (!current || current.isLeaf) return null

      if (direction === 0) {
        current = current.leftChild
      } else if (direction === 1) {
        current = current.rightChild
      } else {
        return null
      }

      if (!current) return null
    }

    return current
  }

  private traversePreOrderFromNode(root: StatNode, callback: (node: StatNode) => void): void {
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!
      callback(node)

      if (!node.isLeaf) {
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }
  }

  private traversePostOrderFromNode(root: StatNode, callback: (node: StatNode) => void): void {
    const stack: StatNode[] = []
    const visited = new Set<number>()
    let current: StatNode | null = root

    while (stack.length > 0 || current !== null) {
      if (current !== null) {
        stack.push(current)
        current = current.isLeaf ? null : current.leftChild
      } else {
        const node = stack[stack.length - 1]
        if (!node.isLeaf && node.rightChild && !visited.has(node.rightChild.nodeId)) {
          current = node.rightChild
        } else {
          stack.pop()
          callback(node)
          visited.add(node.nodeId)
        }
      }
    }
  }

  private findNodeByIdFromRoot(root: StatNode, nodeId: number): StatNode | null {
    const stack: StatNode[] = [root]

    while (stack.length > 0) {
      const node = stack.pop()!

      if (node.nodeId === nodeId) {
        return node
      }

      if (!node.isLeaf) {
        if (node.rightChild) stack.push(node.rightChild)
        if (node.leftChild) stack.push(node.leftChild)
      }
    }

    return null
  }

  private cloneNodeTree(root: StatNode): StatNode {
    const cloned = this.createLeafNode({
      lower: new Float32Array(root.region.lower),
      upper: new Float32Array(root.region.upper),
      dimensions: root.region.dimensions
    })

    // Copy node properties
    cloned.representative = root.representative ? new Float32Array(root.representative) : null
    cloned.damage = root.damage
    cloned.priority = root.priority

    if (!root.isLeaf) {
      const leftClone = this.cloneNodeTree(root.leftChild!)
      const rightClone = this.cloneNodeTree(root.rightChild!)
      this.convertToInternalNode(cloned, root.splitDimension!, root.splitValue!, leftClone, rightClone)
    }

    return cloned
  }
}
