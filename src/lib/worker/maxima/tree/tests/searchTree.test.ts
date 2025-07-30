import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { SearchTree } from 'lib/worker/maxima/tree/searchTree'
import { isRegionFeasible } from 'lib/worker/maxima/validator/regionFeasibilityValidator'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import {
  describe,
  expect,
  it,
} from 'vitest'

// More tests in
// - regionFeasibility.test.ts
// - representativeGeneration.test.ts
describe('basic search tree tests', () => {
  function initializeTree(
    overrides?: {
      minSubstatRollCounts?: SubstatCounts,
      maxSubstatRollCounts?: SubstatCounts,
    },
  ) {
    const mains = {
      simBody: Stats.ATK_P,
      simFeet: Stats.ATK_P,
      simPlanarSphere: Stats.Lightning_DMG,
      simLinkRope: Stats.ATK_P,
    }
    const substatValidator = new SubstatDistributionValidator(54, mains)

    const goal = 54
    const maxIterations = 20000
    const minSubstatRollCounts = overrides?.minSubstatRollCounts ?? {
      [Stats.ATK]: 0,
      [Stats.ATK_P]: 0,
      [Stats.HP]: 0,
      [Stats.HP_P]: 0,
      [Stats.DEF]: 0,
      [Stats.DEF_P]: 0,
      [Stats.SPD]: 0,
      [Stats.CR]: 0,
      [Stats.CD]: 0,
      [Stats.EHR]: 0,
      [Stats.RES]: 0,
      [Stats.BE]: 0,
    }
    const maxSubstatRollCounts = overrides?.maxSubstatRollCounts ?? {
      [Stats.ATK]: 36,
      [Stats.ATK_P]: 24,
      [Stats.HP]: 0,
      [Stats.HP_P]: 36,
      [Stats.DEF]: 0,
      [Stats.DEF_P]: 0,
      [Stats.SPD]: 0,
      [Stats.CR]: 36,
      [Stats.CD]: 30,
      [Stats.EHR]: 36,
      [Stats.RES]: 0,
      [Stats.BE]: 36,
    }

    const mainStats = [
      Stats.HP,
      Stats.ATK,
      Stats.CD,
      Stats.ATK_P,
      Stats.Ice_DMG,
      Stats.ATK_P,
    ]

    function damageFunction(stats: SubstatCounts): number {
      return 1
    }

    return new SearchTree(
      goal,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      mainStats,
      damageFunction,
      substatValidator,
    )
  }

  it('is region feasible', () => {
    const tree = initializeTree()

    expect(isRegionFeasible(tree.root.region, tree)).toBe(true)
  })

  it('available pieces', () => {
    const tree = initializeTree()

    expect(tree.getAvailablePieces(Stats.ATK)).toBe(5)
    expect(tree.getAvailablePieces(Stats.ATK_P)).toBe(4)
  })

  it('split dimension', () => {
    const tree = initializeTree({
      maxSubstatRollCounts: {
        [Stats.ATK]: 20,
        [Stats.ATK_P]: 20,
        [Stats.HP]: 0,
        [Stats.HP_P]: 20,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.SPD]: 0,
        [Stats.CR]: 20,
        [Stats.CD]: 20,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 36,
      },
    })

    const dimension = tree.pickSplitDimension(tree.root)
    expect(dimension).toBe(Stats.BE)
  })

  it('root', () => {
    const tree = initializeTree()

    expect(tree.substatValidator.isValidDistribution(tree.root.representative)).toBe(true)
    expect(tree.damageQueue.length).toBe(1)
    expect(tree.volumeQueue.length).toBe(1)
  })

  it('volume', () => {
    const tree = initializeTree()
    expect(tree.calculateVolume(tree.root)).toBe(36 * 24 * 36 * 36 * 30 * 36 * 36)

    const treeFixedEhr = initializeTree({
      maxSubstatRollCounts: {
        [Stats.ATK]: 36,
        [Stats.ATK_P]: 24,
        [Stats.HP]: 0,
        [Stats.HP_P]: 36,
        [Stats.DEF]: 0,
        [Stats.DEF_P]: 0,
        [Stats.SPD]: 0,
        [Stats.CR]: 36,
        [Stats.CD]: 30,
        [Stats.EHR]: 0,
        [Stats.RES]: 0,
        [Stats.BE]: 36,
      },
    })
    expect(treeFixedEhr.calculateVolume(treeFixedEhr.root)).toBe(36 * 24 * 36 * 36 * 30 * 1 * 36)
  })

  it('damage', () => {
    const tree = initializeTree()
    expect(tree.calculateDamage(tree.root)).toBe(1)
  })
})
