import { generateFullDefaultForm } from 'lib/scoring/characterScorer'
import { simulate } from 'lib/simulations/statSimulation'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('statSim', () => {
  const form = generateFullDefaultForm('1005', '23006', 6, 5)
  simulate([], form, null, {})
})
