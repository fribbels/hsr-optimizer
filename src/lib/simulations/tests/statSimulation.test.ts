import { Sets, Stats } from 'lib/constants/constants'
import { addE6S5Teammate } from 'lib/gpu/tests/webgpuTestGenerator'
import { toComputedStatsObject } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { Simulation, SimulationRequest, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { expectWithinDelta } from 'lib/simulations/tests/statSimTestUtils'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('statSim', () => {
  const form = generateFullDefaultForm('1005', '23006', 6, 5)
  const request: SimulationRequest = {
    simBody: Stats.CR,
    simFeet: Stats.SPD,
    simLinkRope: Stats.ATK_P,
    simPlanarSphere: Stats.Lightning_DMG,
    simOrnamentSet: Sets.FirmamentFrontlineGlamoth,
    simRelicSet1: Sets.PrisonerInDeepConfinement,
    simRelicSet2: Sets.PrisonerInDeepConfinement,
    stats: {
      [Stats.ATK_P]: 3,
    },
  }

  addE6S5Teammate(form, 0, '8008', '21051')
  addE6S5Teammate(form, 1, '1225', '23035')
  addE6S5Teammate(form, 2, '1313', '23034')

  const simulation: Simulation = {
    simType: StatSimTypes.SubstatRolls,
    request: request,
  } as Simulation

  const context = generateContext(form)
  const results = runStatSimulations([simulation], form, context, {})
  const computedStatsObject = toComputedStatsObject(results[0].xa)

  expectWithinDelta(computedStatsObject.COMBO_DMG, 1258999, 1.0)
})
