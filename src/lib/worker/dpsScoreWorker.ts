import { Sets, Stats } from 'lib/constants/constants'
import { runStatSimulations, StatSimTypes } from 'lib/simulations/new/statSimulation'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import { DpsScoreWorkerInput } from 'lib/worker/dpsScoreWorkerRunner'

export function dpsScoreWorker(e: MessageEvent<DpsScoreWorkerInput>) {
  const input = e.data

  // const simScoringResult = scoreCharacterSimulation(
  //   input.character,
  //   input.displayRelics,
  //   input.teamSelection,
  //   input.showcaseTemporaryOptions,
  //   input.defaultScoringMetadata,
  //   input.customScoringMetadata,
  // )

  // const form = generateFullDefaultForm('1005', '23006', 6, 5)
  const form = input.form
  const context = input.context

  transformWorkerContext(context)

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

  const result = runStatSimulations([simulation], form, context, {})

  self.postMessage({
    simScoringResult: result,
  })
}

export function DEBUG() {

}
