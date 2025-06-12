import {
  StatNode,
  StatRegion,
  StatTreeStats,
} from 'lib/worker/maxima/core'

export interface IStatTreeManager {
  createNode(region: StatRegion): StatNode
  createLeafNode(region: StatRegion): StatNode
  createInternalNode(region: StatRegion, splitDim: number, splitVal: number, left: StatNode, right: StatNode): StatNode
  convertToInternalNode(node: StatNode, splitDimension: number, splitValue: number, leftChild: StatNode, rightChild: StatNode): void
  collectLeaves(root: StatNode): StatNode[]
  collectInternalNodes(root: StatNode): StatNode[]
  findHighestPriorityLeaf(leaves: readonly StatNode[]): StatNode | null
  findLowestPriorityLeaf(leaves: readonly StatNode[]): StatNode | null
  countNodes(root: StatNode): number
  countLeaves(root: StatNode): number
  findPathToNode(root: StatNode, target: StatNode): StatNode[] | null
  validateTreeStructure(root: StatNode, expectedDimensions: number): boolean
  getTreeDepth(root: StatNode): number
  getTreeStats(root: StatNode): StatTreeStats
  getNodeAtPath(root: StatNode, path: number[]): StatNode | null
  traversePreOrder(root: StatNode, callback: (node: StatNode) => void): void
  traversePostOrder(root: StatNode, callback: (node: StatNode) => void): void
  findNodeById(root: StatNode, nodeId: number): StatNode | null
  cloneTree(root: StatNode): StatNode
}
