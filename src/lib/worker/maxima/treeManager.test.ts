import { StatTreeManager } from './treeManager'
import { StatNode, StatRegion, StatTreeStats } from './core'
import { describe, beforeEach, test, expect, vi } from 'vitest'

describe('StatTreeManager', () => {
  let treeManager: StatTreeManager
  let globalBounds: { lower: Float32Array, upper: Float32Array }

  beforeEach(() => {
    globalBounds = {
      lower: new Float32Array([0, 0, 0]),
      upper: new Float32Array([100, 100, 100])
    }
    treeManager = new StatTreeManager(3, globalBounds)
  })

  describe('Constructor and Initial State', () => {
    test('creates empty tree with correct dimensions', () => {
      expect(treeManager.isEmpty()).toBe(true)
      expect(treeManager.getRoot()).toBeNull()
      expect(treeManager.getDimensions()).toBe(3)
      expect(treeManager.countNodes()).toBe(0)
      expect(treeManager.countLeaves()).toBe(0)
    })

    test('creates tree with different dimensions', () => {
      const bounds4D = {
        lower: new Float32Array([0, 0, 0, 0]),
        upper: new Float32Array([50, 50, 50, 50])
      }
      const tree4D = new StatTreeManager(4, bounds4D)

      expect(tree4D.getDimensions()).toBe(4)
      expect(tree4D.isEmpty()).toBe(true)
    })
  })

  describe('Basic Insertion', () => {
    test('inserts first point creates root', () => {
      const point = new Float32Array([10, 20, 30])
      const node = treeManager.insertNode(point)

      expect(treeManager.isEmpty()).toBe(false)
      expect(treeManager.getRoot()).toBe(node)
      expect(treeManager.countNodes()).toBe(1)
      expect(treeManager.countLeaves()).toBe(1)
      expect(node.representative).toEqual(point)
      expect(node.isLeaf).toBe(true)
    })

    test('inserting second point creates split', () => {
      const point1 = new Float32Array([10, 20, 30])
      const point2 = new Float32Array([40, 50, 60])

      const node1 = treeManager.insertNode(point1)
      const node2 = treeManager.insertNode(point2)

      expect(treeManager.countNodes()).toBe(3) // 1 internal + 2 leaves
      expect(treeManager.countLeaves()).toBe(2)
      expect(node1).not.toBe(node2)
      expect(node1.representative).toEqual(point1)
      expect(node2.representative).toEqual(point2)

      // Root should now be internal
      const root = treeManager.getRoot()!
      expect(root.isLeaf).toBe(false)
      expect(root.leftChild).not.toBeNull()
      expect(root.rightChild).not.toBeNull()
    })

    test('throws error for wrong dimensions', () => {
      const badPoint = new Float32Array([10, 20]) // 2D instead of 3D
      expect(() => treeManager.insertNode(badPoint)).toThrow('Point dimension mismatch')
    })
  })

  describe('Tree Operations', () => {
    beforeEach(() => {
      // Insert several points to create a tree structure
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))
      treeManager.insertNode(new Float32Array([30, 30, 30]))
      treeManager.insertNode(new Float32Array([40, 40, 40]))
    })

    test('collectLeaves returns all leaf nodes', () => {
      const leaves = treeManager.collectLeaves()
      expect(leaves.length).toBe(4) // 4 points = 4 leaves

      // All should be leaves
      leaves.forEach(leaf => {
        expect(leaf.isLeaf).toBe(true)
        expect(leaf.representative).not.toBeNull()
      })
    })

    test('collectInternalNodes returns internal nodes', () => {
      const internals = treeManager.collectInternalNodes()
      expect(internals.length).toBe(3) // 4 leaves = 3 internal nodes

      // All should be internal
      internals.forEach(internal => {
        expect(internal.isLeaf).toBe(false)
        expect(internal.leftChild).not.toBeNull()
        expect(internal.rightChild).not.toBeNull()
      })
    })

    test('countNodes returns correct total', () => {
      expect(treeManager.countNodes()).toBe(7) // 4 leaves + 3 internal = 7 total
    })

    test('countLeaves returns correct count', () => {
      expect(treeManager.countLeaves()).toBe(4)
    })

    test('getTreeDepth returns reasonable depth', () => {
      const depth = treeManager.getTreeDepth()
      expect(depth).toBeGreaterThan(0)
      expect(depth).toBeLessThan(10) // Should be reasonable for 4 points
    })
  })

  describe('Priority-Based Operations', () => {
    let leaves: StatNode[]

    beforeEach(() => {
      // Create tree and set priorities
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))
      treeManager.insertNode(new Float32Array([30, 30, 30]))

      leaves = treeManager.collectLeaves()
      leaves[0].priority = 100
      leaves[1].priority = 300
      leaves[2].priority = 200
    })

    test('findHighestPriorityLeaf returns correct node', () => {
      const highest = treeManager.findHighestPriorityLeaf()
      expect(highest).toBe(leaves[1]) // priority 300
    })

    test('findLowestPriorityLeaf returns correct node', () => {
      const lowest = treeManager.findLowestPriorityLeaf()
      expect(lowest).toBe(leaves[0]) // priority 100
    })

    test('priority operations handle empty tree', () => {
      const emptyTree = new StatTreeManager(3, globalBounds)
      expect(emptyTree.findHighestPriorityLeaf()).toBeNull()
      expect(emptyTree.findLowestPriorityLeaf()).toBeNull()
    })
  })

  describe('Tree Statistics', () => {
    test('getTreeStats returns correct stats for empty tree', () => {
      const stats = treeManager.getTreeStats()

      expect(stats.totalNodes).toBe(0)
      expect(stats.leafNodes).toBe(0)
      expect(stats.internalNodes).toBe(0)
      expect(stats.maxDepth).toBe(0)
      expect(stats.avgLeafDepth).toBe(0)
      expect(stats.dimensions).toBe(3)
    })

    test('getTreeStats returns correct stats for populated tree', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))
      treeManager.insertNode(new Float32Array([30, 30, 30]))

      const stats = treeManager.getTreeStats()

      expect(stats.totalNodes).toBe(5) // 3 leaves + 2 internal
      expect(stats.leafNodes).toBe(3)
      expect(stats.internalNodes).toBe(2)
      expect(stats.maxDepth).toBeGreaterThan(0)
      expect(stats.avgLeafDepth).toBeGreaterThan(0)
      expect(stats.dimensions).toBe(3)
    })
  })

  describe('Tree Validation', () => {
    test('validateTreeStructure returns true for empty tree', () => {
      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('validateTreeStructure returns true for valid tree', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))
      treeManager.insertNode(new Float32Array([30, 30, 30]))

      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('validateTreeStructure detects corrupted structure', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))

      // Corrupt the tree structure
      const root = treeManager.getRoot()!
      ;(root as any).leftChild = null // Remove left child

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(treeManager.validateTreeStructure()).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Utility Methods', () => {
    let node1: StatNode, node2: StatNode, node3: StatNode

    beforeEach(() => {
      node1 = treeManager.insertNode(new Float32Array([10, 10, 10]))
      node2 = treeManager.insertNode(new Float32Array([20, 20, 20]))
      node3 = treeManager.insertNode(new Float32Array([30, 30, 30]))
    })

    test('findPathToNode finds correct path', () => {
      const path = treeManager.findPathToNode(node1)
      expect(path).not.toBeNull()
      expect(path!.length).toBeGreaterThan(0)
      expect(path![path!.length - 1]).toBe(node1)
    })

    test('findPathToNode returns null for non-existent node', () => {
      // Create a fake node that doesn't exist in the tree
      const fakeNode: StatNode = {
        region: { lower: new Float32Array([0, 0, 0]), upper: new Float32Array([100, 100, 100]), dimensions: 3 },
        representative: new Float32Array([50, 50, 50]),
        damage: null,
        priority: 0,
        splitDimension: null,
        splitValue: null,
        leftChild: null,
        rightChild: null,
        isLeaf: true,
        nodeId: 99999 // Use a very high ID that won't exist
      }

      const path = treeManager.findPathToNode(fakeNode)
      expect(path).toBeNull()
    })

    test('findNodeById finds correct node', () => {
      const found = treeManager.findNodeById(node2.nodeId)
      expect(found).toBe(node2)
    })

    test('findNodeById returns null for non-existent ID', () => {
      const found = treeManager.findNodeById(99999)
      expect(found).toBeNull()
    })

    test('traversePreOrder visits all nodes', () => {
      const visited: StatNode[] = []
      treeManager.traversePreOrder(node => visited.push(node))

      expect(visited.length).toBe(treeManager.countNodes())
    })

    test('traversePostOrder visits all nodes', () => {
      const visited: StatNode[] = []
      treeManager.traversePostOrder(node => visited.push(node))

      expect(visited.length).toBe(treeManager.countNodes())
    })

    test('cloneTree creates deep copy', () => {
      const cloned = treeManager.cloneTree()
      expect(cloned).not.toBeNull()
      expect(cloned).not.toBe(treeManager.getRoot())

      // Should have same structure but different objects
      const originalStats = treeManager.getTreeStats()
      const clonedTree = new StatTreeManager(3, globalBounds)
      // We can't easily create a new tree from cloned root, but we can verify structure
      expect(cloned!.region.dimensions).toBe(3)
    })
  })

  describe('Tree State Management', () => {
    test('clear() empties the tree', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))

      expect(treeManager.isEmpty()).toBe(false)
      expect(treeManager.countNodes()).toBe(3)

      treeManager.clear()

      expect(treeManager.isEmpty()).toBe(true)
      expect(treeManager.countNodes()).toBe(0)
      expect(treeManager.getRoot()).toBeNull()
    })

    test('getNodeAtPath returns correct nodes', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))
      treeManager.insertNode(new Float32Array([20, 20, 20]))

      const root = treeManager.getRoot()!
      const leftChild = treeManager.getNodeAtPath([0])
      const rightChild = treeManager.getNodeAtPath([1])

      expect(leftChild).toBe(root.leftChild)
      expect(rightChild).toBe(root.rightChild)
    })

    test('getNodeAtPath returns null for invalid paths', () => {
      treeManager.insertNode(new Float32Array([10, 10, 10]))

      const invalid = treeManager.getNodeAtPath([0, 0, 0]) // Too deep
      expect(invalid).toBeNull()
    })
  })

  describe('Algorithm Integration Scenarios', () => {
    test('simulates typical optimization algorithm usage', () => {
      // 1. Insert initial points
      const node1 = treeManager.insertNode(new Float32Array([25, 25, 25]))
      const node2 = treeManager.insertNode(new Float32Array([75, 75, 75]))

      // 2. Set damage and priority values (simulating algorithm evaluation)
      node1.damage = 1000
      node1.priority = 500
      node2.damage = 1200
      node2.priority = 600

      // 3. Algorithm finds best leaf
      const bestLeaf = treeManager.findHighestPriorityLeaf()
      expect(bestLeaf).toBe(node2)

      // 4. Algorithm continues inserting in promising regions
      const node3 = treeManager.insertNode(new Float32Array([70, 70, 70])) // Near best point
      const node4 = treeManager.insertNode(new Float32Array([80, 80, 80]))

      // 5. Tree should grow appropriately
      expect(treeManager.countLeaves()).toBe(4)
      expect(treeManager.countNodes()).toBeGreaterThan(4)

      // 6. Validation should pass
      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('handles many insertions efficiently', () => {
      const startTime = performance.now()

      // Insert many points
      for (let i = 0; i < 100; i++) {
        const point = new Float32Array([
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ])
        treeManager.insertNode(point)
      }

      const endTime = performance.now()

      expect(treeManager.countLeaves()).toBe(100)
      expect(treeManager.countNodes()).toBeGreaterThan(100)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('maintains tree balance with sequential insertions', () => {
      // Insert points in sequence (worst case for some tree types)
      for (let i = 0; i < 20; i++) {
        treeManager.insertNode(new Float32Array([i * 5, i * 5, i * 5]))
      }

      const depth = treeManager.getTreeDepth()
      expect(depth).toBeLessThanOrEqual(20) // Should not exceed number of points
      expect(depth).toBeGreaterThan(0) // Should have some depth
      expect(treeManager.validateTreeStructure()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('handles duplicate points', () => {
      const point = new Float32Array([50, 50, 50])

      const node1 = treeManager.insertNode(point)
      const node2 = treeManager.insertNode(point) // Same point

      expect(node1).not.toBe(node2)
      expect(treeManager.countLeaves()).toBe(2)
      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('handles points at boundaries', () => {
      const boundary1 = new Float32Array([0, 0, 0]) // Lower boundary
      const boundary2 = new Float32Array([100, 100, 100]) // Upper boundary

      const node1 = treeManager.insertNode(boundary1)
      const node2 = treeManager.insertNode(boundary2)

      expect(node1.representative).toEqual(boundary1)
      expect(node2.representative).toEqual(boundary2)
      expect(treeManager.validateTreeStructure()).toBe(true)
    })

    test('handles very close points', () => {
      const point1 = new Float32Array([50.0000, 50.0000, 50.0000])
      const point2 = new Float32Array([50.0001, 50.0001, 50.0001])

      const node1 = treeManager.insertNode(point1)
      const node2 = treeManager.insertNode(point2)

      expect(node1).not.toBe(node2)
      expect(treeManager.countLeaves()).toBe(2)
      expect(treeManager.validateTreeStructure()).toBe(true)
    })
  })
})
