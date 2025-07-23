import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { testInput } from 'lib/worker/maxima/testData'
import {
  SearchTree,
  TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'
import { SubstatDistributionValidator } from 'lib/worker/maxima/validator/substatDistributionValidator'
import {
  describe,
  it,
} from 'vitest'

describe('test', () => {
  const input = testInput as unknown as ComputeOptimalSimulationWorkerInput
  const substatValidator = new SubstatDistributionValidator(input)

  const goal = 54
  const max = 20000
  const minSubstatRollCounts = {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.HP_P]: 0,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.BE]: 0,
  }
  const maxSubstatRollCounts = {
    [Stats.ATK]: 10,
    [Stats.ATK_P]: 18,
    [Stats.HP_P]: 36,
    [Stats.CR]: 36,
    [Stats.CD]: 36,
    [Stats.EHR]: 36,
    [Stats.BE]: 36,
  }

  // const dimensions = 7
  // const effectiveStats = [
  //   Stats.ATK,
  //   Stats.ATK_P,
  //   Stats.HP_P,
  //   Stats.CR,
  //   Stats.CD,
  //   Stats.EHR,
  //   Stats.BE,
  //   Stats.SPD,
  // ]
  const dimensions = 6
  const effectiveStats = [
    Stats.ATK_P,
    Stats.ATK,
    Stats.EHR,
    Stats.CR,
    Stats.CD,
    Stats.SPD,
  ]

  const mainStats = [
    Stats.HP,
    Stats.ATK,
    input.partialSimulationWrapper.simulation.request.simBody,
    input.partialSimulationWrapper.simulation.request.simFeet,
    input.partialSimulationWrapper.simulation.request.simPlanarSphere,
    input.partialSimulationWrapper.simulation.request.simLinkRope,
  ]

  const substats = effectiveStats

  function damageFunction(stats: SubstatCounts): number {
    return 1
  }

  it('test', () => {
    const tree = new SearchTree(
      goal,
      max,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      // effectiveStats,
      substats,
      mainStats,
      damageFunction,
      substatValidator,
    )

    function randomLow() {
      return Math.floor(Math.random() * 24)
    }

    function randomHigh() {
      return Math.floor(Math.random() * 30 + 6)
    }

    function randomRegion(): TreeStatRegion {
      return {
        lower: {
          [Stats.ATK]: randomLow(),
          [Stats.ATK_P]: randomLow(),
          [Stats.HP_P]: randomLow(),
          [Stats.CR]: randomLow(),
          [Stats.CD]: randomLow(),
          [Stats.EHR]: randomLow(),
          [Stats.BE]: randomLow(),
          [Stats.SPD]: 5,
        },
        upper: {
          [Stats.ATK]: Math.min(maxSubstatRollCounts[Stats.ATK], randomHigh()),
          [Stats.ATK_P]: Math.min(maxSubstatRollCounts[Stats.ATK_P], randomHigh()),
          [Stats.HP_P]: Math.min(maxSubstatRollCounts[Stats.HP_P], randomHigh()),
          [Stats.CR]: Math.min(maxSubstatRollCounts[Stats.CR], randomHigh()),
          [Stats.CD]: Math.min(maxSubstatRollCounts[Stats.CD], randomHigh()),
          [Stats.EHR]: Math.min(maxSubstatRollCounts[Stats.EHR], randomHigh()),
          [Stats.BE]: Math.min(maxSubstatRollCounts[Stats.BE], randomHigh()),
          [Stats.SPD]: 5,
        },
      }
    }

    let checks = 0
    for (let i = 0; i < 10000000; i++) {
      const region = randomRegion()
      let valid = true
      let sum = 0
      for (const stat of Object.keys(region.upper)) {
        sum += region.lower[stat]
        if (region.upper[stat] <= region.lower[stat] && stat != Stats.SPD || sum > 54) {
          valid = false
          break
        }
        if (!tree.isCellFeasible(region)) {
          valid = false
          break
        }
      }

      if (valid) {
        const representative = tree.generateRepresentative(region, Stats.ATK_P, true)
        const validated = substatValidator.isValidDistribution(representative)
        if (!validated) {
          console.log(region)
          console.log('---')
          console.log(representative)
          console.log('===============')
        }
        checks++
      }
    }

    console.log('Done', checks)
  }, 1000000)

  it('test single', () => {
    const tree = new SearchTree(
      goal,
      max,
      minSubstatRollCounts,
      maxSubstatRollCounts,
      // effectiveStats,
      substats,
      mainStats,
      damageFunction,
      substatValidator,
    )

    function specificRegion(): TreeStatRegion {
      return {
        lower: {
          'HP%': 0,
          'ATK%': 14,
          'DEF%': 0,
          'HP': 0,
          'ATK': 0,
          'DEF': 0,
          'SPD': 23.782,
          'CRIT Rate': 0,
          'CRIT DMG': 0,
          'Effect Hit Rate': 0,
          'Effect RES': 0,
          'Break Effect': 0,
        },
        upper: {
          'HP%': 0,
          'ATK%': 18,
          'DEF%': 0,
          'HP': 0,
          'ATK': 4,
          'DEF': 0,
          'SPD': 23.782,
          'CRIT Rate': 8,
          'CRIT DMG': 8,
          'Effect Hit Rate': 8,
          'Effect RES': 0,
          'Break Effect': 0,
        },
      }
    }

    const region = specificRegion()
    const feasible = tree.isCellFeasible(region)
    const representative = tree.generateRepresentative(region, Stats.ATK_P, true)
    const validated = substatValidator.isValidDistribution(representative)

    console.log(feasible)
    console.log(tree.mainStats)
    console.log('---')
    console.log(region)
    console.log('---')
    console.log(representative)
    console.log('---')
    console.log(validated)
    console.log('===============')
  })
})
