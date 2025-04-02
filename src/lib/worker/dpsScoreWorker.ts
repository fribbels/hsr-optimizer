import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Sets, Stats } from 'lib/constants/constants'
import { simulate, StatSimTypes } from 'lib/simulations/statSimulation'
// import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
// import { DpsScoreWorkerInput } from 'lib/worker/dpsScoreWorkerRunner'

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

  context.characterConditionalController = CharacterConditionalsResolver.get(context)
  context.lightConeConditionalController = LightConeConditionalsResolver.get(context)

  for (const action of context.actions) {
    // Reconstruct arrays after transfer
    action.precomputedX.a = new Float32Array(Object.values(action.precomputedX.a))
    action.precomputedM.a = new Float32Array(Object.values(action.precomputedM.a))
  }

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

  const result = simulate([simulation], form, context, {})

  self.postMessage({
    simScoringResult: result,
  })
}

export function DEBUG() {

}
