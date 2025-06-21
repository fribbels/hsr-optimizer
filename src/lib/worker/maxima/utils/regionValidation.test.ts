import { Stats } from 'lib/constants/constants'
import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  createRegionFromBounds,
  RegionBounds,
} from 'lib/worker/maxima/utils/regionUtils'
import { validateStatRegion } from 'lib/worker/maxima/utils/regionValidation'
import {
  describe,
  expect,
  test,
} from 'vitest'

const bounds = (lower: SubstatCounts, upper: SubstatCounts): RegionBounds => ({ lower, upper })

describe('validateStatRegion - accuracy checks', () => {
  test('validates correctly classified stats', () => {
    const region = createRegionFromBounds(
      bounds(
        { [Stats.ATK]: 0, [Stats.SPD]: 4.308, [Stats.CR]: 5 },
        { [Stats.ATK]: 12, [Stats.SPD]: 4.308, [Stats.CR]: 15 },
      ),
      [Stats.ATK, Stats.SPD, Stats.CR],
    )

    expect(() => validateStatRegion(region)).not.toThrow()
    expect(region.fixedStats).toContain(Stats.SPD)
    expect(region.variableStats).toContain(Stats.ATK)
    expect(region.variableStats).toContain(Stats.CR)
  })

  test('detects misclassified fixed stats', () => {
    const invalidRegion = {
      lower: { [Stats.ATK]: 0, [Stats.SPD]: 4.308 },
      upper: { [Stats.ATK]: 10, [Stats.SPD]: 4.308 },
      statNames: [Stats.ATK, Stats.SPD],
      fixedStats: [Stats.ATK], // Wrong: ATK should be variable
      variableStats: [Stats.SPD], // Wrong: SPD should be fixed
    }

    expect(() => validateStatRegion(invalidRegion)).toThrow()
  })

  test('detects misclassified variable stats', () => {
    const invalidRegion = {
      lower: { [Stats.CR]: 5 },
      upper: { [Stats.CR]: 5 },
      statNames: [Stats.CR],
      fixedStats: [],
      variableStats: [Stats.CR], // Wrong: should be fixed since bounds are equal
    }

    expect(() => validateStatRegion(invalidRegion)).toThrow()
  })
})
