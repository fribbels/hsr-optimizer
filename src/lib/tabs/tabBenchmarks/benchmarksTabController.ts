import { cloneWorkerResult } from 'lib/scoring/simScoringUtils'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/new/orchestrator/runCustomBenchmarkOrchestrator'
import { BenchmarkForm, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { TsUtils } from 'lib/utils/TsUtils'

export function handleBenchmarkFormSubmit(benchmarkForm: BenchmarkForm) {
  const { teammate0, teammate1, teammate2, setResults, currentPartialHash, resetCache } = useBenchmarksTabStore.getState()

  // Merge form and the teammate state management
  const mergedBenchmarkForm: BenchmarkForm = {
    ...benchmarkForm,
    teammate0,
    teammate1,
    teammate2,
  }

  const partialHash = generatePartialHash(mergedBenchmarkForm)
  const fullHash = TsUtils.objectHash(mergedBenchmarkForm)
  if (currentPartialHash && currentPartialHash != partialHash) {
    console.debug('RESET CACHE')
    resetCache()
  }

  console.log('Complete benchmark data:', mergedBenchmarkForm)

  void runCustomBenchmarkOrchestrator(mergedBenchmarkForm)
    .then((orchestrator) => {
      console.log(orchestrator)
      console.log(cloneWorkerResult(orchestrator.perfectionSimResult!))

      setResults(mergedBenchmarkForm, orchestrator, partialHash, fullHash)
    })
}

// If these fields are different, then benchmarks can't be compared
function generatePartialHash(benchmarkForm: BenchmarkForm) {
  const hashObject = {
    characterId: benchmarkForm.characterId,
    lightCone: benchmarkForm.lightCone,
    characterEidolon: benchmarkForm.characterEidolon,
    lightConeSuperimposition: benchmarkForm.lightConeSuperimposition,
    basicSpd: benchmarkForm.basicSpd,
    errRope: benchmarkForm.errRope,
    teammate0: benchmarkForm.teammate0,
    teammate1: benchmarkForm.teammate1,
    teammate2: benchmarkForm.teammate2,
  }

  return TsUtils.objectHash(hashObject)
}
