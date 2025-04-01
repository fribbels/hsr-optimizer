import { Sets, Stats } from 'lib/constants/constants'
import { generateFullDefaultForm } from 'lib/scoring/characterScorer'
import { simulate } from 'lib/simulations/statSimulation'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import { Metadata } from 'lib/state/metadata'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { test } from 'vitest'

Metadata.initialize()

const TEST = 'TEST'

test('statSim', () => {
  const form = generateFullDefaultForm('1005', '23006', 6, 5)
  const request: SimulationRequest = {
    name: TEST,
    simBody: Stats.CD,
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
    penaltyMultiplier: 0,
    request: request,
  } as Simulation

  const result = simulate([simulation], form, null, {})

  console.log(result)
})
