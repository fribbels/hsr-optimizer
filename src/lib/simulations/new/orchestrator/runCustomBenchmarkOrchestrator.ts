import { Stats } from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/new/orchestrator/BenchmarkSimulationOrchestrator'
import { SimulationRequest } from 'lib/simulations/new/statSimulationTypes'
import DB from 'lib/state/db'
import { BenchmarkForm } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { TsUtils } from 'lib/utils/TsUtils'

export async function runCustomBenchmarkOrchestrator(benchmarkForm: BenchmarkForm) {
  const simulationMetadata = TsUtils.clone(DB.getMetadata().characters[benchmarkForm.characterId].scoringMetadata.simulation!)

  const orchestrator = new BenchmarkSimulationOrchestrator(simulationMetadata)
  const simulationRequest = generateSimulationRequest(benchmarkForm)

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequest(simulationRequest)
  orchestrator.setSimSets()
  orchestrator.setFlags()
  orchestrator.setSimForm(benchmarkForm)
  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(benchmarkForm.basicSpd)

  await orchestrator.calculateBenchmark()
  await orchestrator.calculatePerfection()

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

function generateSimulationRequest(benchmarkForm: BenchmarkForm) {
  const request: SimulationRequest = {
    name: '',
    simRelicSet1: benchmarkForm.simRelicSet1,
    simRelicSet2: benchmarkForm.simRelicSet2,
    simOrnamentSet: benchmarkForm.simOrnamentSet,
    simBody: Stats.HP_P,
    simFeet: Stats.HP_P,
    simPlanarSphere: Stats.HP_P,
    simLinkRope: Stats.HP_P,
    stats: StatCalculator.getZeroesSubstats(),
  }

  return request
}

