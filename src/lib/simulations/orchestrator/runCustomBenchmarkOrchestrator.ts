import { Stats } from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { SimulationRequest } from 'lib/simulations/statSimulationTypes'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { clone } from 'lib/utils/objectUtils'

export async function runCustomBenchmarkOrchestrator(benchmarkForm: BenchmarkForm, options?: { benchmarkOnly?: boolean, skipScoring?: boolean }) {
  const simulationMetadata = generateSimulationMetadata(benchmarkForm)
  const simulationRequest = generateSimulationRequest(benchmarkForm)
  const simulationSets = generateSimulationSets(benchmarkForm)
  const orchestrator = new BenchmarkSimulationOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequest(simulationRequest)
  orchestrator.setSimSets(simulationSets)
  orchestrator.setSimForm(benchmarkForm, simulationMetadata)

  if (benchmarkForm.setConditionals) {
    orchestrator.form!.setConditionals = benchmarkForm.setConditionals
  }

  orchestrator.setSimContext()
  orchestrator.setFlags()

  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(benchmarkForm.basicSpd, true)

  orchestrator.flags.forceErrRope = benchmarkForm.errRope

  const clonedContext = clone(orchestrator.context!)
  await orchestrator.calculateBenchmark(clonedContext)

  if (options?.benchmarkOnly) return orchestrator

  await orchestrator.calculatePerfection(clonedContext)

  if (options?.skipScoring) return orchestrator

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

function generateSimulationMetadata(benchmarkForm: BenchmarkForm) {
  const metadata = clone(getGameMetadata().characters[benchmarkForm.characterId].scoringMetadata.simulation!)
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
