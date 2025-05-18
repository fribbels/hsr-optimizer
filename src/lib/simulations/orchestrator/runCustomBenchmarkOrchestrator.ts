import { Stats } from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { BenchmarkForm } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { TsUtils } from 'lib/utils/TsUtils'

export async function runCustomBenchmarkOrchestrator(benchmarkForm: BenchmarkForm) {
  const simulationMetadata = generateSimulationMetadata(benchmarkForm)
  const simulationRequest = generateSimulationRequest(benchmarkForm)
  const simulationSets = generateSimulationSets(benchmarkForm)
  const orchestrator = new BenchmarkSimulationOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequest(simulationRequest)
  orchestrator.setSimSets(simulationSets)
  orchestrator.setSimForm(benchmarkForm)

  if (benchmarkForm.setConditionals) {
    orchestrator.form!.setConditionals = benchmarkForm.setConditionals
  }

  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(benchmarkForm.basicSpd, true)

  orchestrator.flags.forceErrRope = benchmarkForm.errRope

  await orchestrator.calculateBenchmark()
  await orchestrator.calculatePerfection()

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

function generateSimulationMetadata(benchmarkForm: BenchmarkForm) {
  const metadata = TsUtils.clone(DB.getMetadata().characters[benchmarkForm.characterId].scoringMetadata.simulation!)
  metadata.teammates = [
    benchmarkForm.teammate0!,
    benchmarkForm.teammate1!,
    benchmarkForm.teammate2!,
  ]

  metadata.deprioritizeBuffs = benchmarkForm.subDps

  return metadata
}

function generateSimulationSets(benchmarkForm: BenchmarkForm) {
  return {
    relicSet1: benchmarkForm.simRelicSet1!,
    relicSet2: benchmarkForm.simRelicSet2!,
    ornamentSet: benchmarkForm.simOrnamentSet!,
  }
}

function generateSimulationRequest(benchmarkForm: BenchmarkForm) {
  const request: SimulationRequest = {
    name: '',
    simRelicSet1: benchmarkForm.simRelicSet1!,
    simRelicSet2: benchmarkForm.simRelicSet2!,
    simOrnamentSet: benchmarkForm.simOrnamentSet!,
    simBody: Stats.HP_P,
    simFeet: Stats.HP_P,
    simPlanarSphere: Stats.HP_P,
    simLinkRope: benchmarkForm.errRope ? Stats.ERR : Stats.HP_P,
    stats: StatCalculator.getZeroesSubstats(),
  }

  return request
}
