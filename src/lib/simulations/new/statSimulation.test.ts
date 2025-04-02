import { Sets, Stats } from 'lib/constants/constants'
import { generateFullDefaultForm } from 'lib/scoring/characterScorer'
import { runStatSimulations } from 'lib/simulations/new/statSimulation'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import { Metadata } from 'lib/state/metadata'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { test } from 'vitest'

Metadata.initialize()

const TEST = 'TEST'

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
  const simulation: Simulation = {
    simType: StatSimTypes.SubstatRolls,
    request: request,
  } as Simulation

  const result = runStatSimulations([simulation], form, null, {})

  console.log(result)
})
