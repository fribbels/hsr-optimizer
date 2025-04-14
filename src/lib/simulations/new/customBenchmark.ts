import { generateContext } from 'lib/optimization/context/calculateContext'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import DB from 'lib/state/db'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'

export function generateCustomBenchmark() {
  const form = OptimizerTabController.getForm()
  console.log(form)

  const simulationRequest = form.statSim?.benchmarks
  if (!form.characterId || !simulationRequest) {
    console.log('Invalid form')
    return
  }

  const simulationMetadata = DB.getScoringMetadata(form.characterId).simulation
  if (!simulationMetadata) {
    console.log('No simulation metadata')
    return
  }

  const context = generateContext(form)
  transformWorkerContext(context)
}
