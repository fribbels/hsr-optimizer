// @vitest-environment jsdom
import { Stats } from 'lib/constants/constants'
import {
  BasicKey,
  type BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { calculateElementalStats } from 'lib/optimization/calculateStats'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import {
  describe,
  expect,
  it,
} from 'vitest'

Metadata.initialize()

describe('light cone elemental damage bonuses', () => {
  it.each(
    [
      { lightCone: '23006', superimposition: 1, bonus: 0.24 },
      { lightCone: '23006', superimposition: 5, bonus: 0.40 },
      { lightCone: '21061', superimposition: 1, bonus: 0.16 },
      { lightCone: '21061', superimposition: 5, bonus: 0.32 },
    ] as const,
  )('preserves every element for $lightCone S$superimposition', ({ lightCone, superimposition, bonus }) => {
    const request = normalizeForm(generateFullDefaultForm('1005b1', lightCone, 0, superimposition))
    const context = generateContext(request)
    const c = new BasicStatsArrayCore() as BasicStatsArray
    // An off-element relic/set bonus must survive the merge too.
    c.a[BasicKey.ICE_DMG_BOOST] = 0.10

    calculateElementalStats(c, context)

    for (
      const key of [
        BasicKey.PHYSICAL_DMG_BOOST,
        BasicKey.FIRE_DMG_BOOST,
        BasicKey.WIND_DMG_BOOST,
        BasicKey.QUANTUM_DMG_BOOST,
        BasicKey.IMAGINARY_DMG_BOOST,
      ]
    ) {
      expect(c.a[key]).toBeCloseTo(bonus, 6)
    }
    expect(c.a[BasicKey.ICE_DMG_BOOST]).toBeCloseTo(bonus + 0.10, 6)
    expect(c.a[BasicKey.LIGHTNING_DMG_BOOST]).toBeCloseTo(bonus + context.characterStatsBreakdown.traces[Stats.Lightning_DMG], 6)
  })
})
