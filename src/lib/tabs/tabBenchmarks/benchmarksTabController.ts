import { cloneWorkerResult } from 'lib/scoring/simScoringUtils'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/new/orchestrator/runCustomBenchmarkOrchestrator'
import { BenchmarkForm, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'

export function handleBenchmarkFormSubmit(benchmarkForm: BenchmarkForm) {
  const { teammate0, teammate1, teammate2, setResults } = useBenchmarksTabStore.getState()

  // Merge form and the teammate state management
  const mergedBenchmarkForm: BenchmarkForm = {
    ...benchmarkForm,
    teammate0,
    teammate1,
    teammate2,
  }

  console.log('Complete benchmark data:', mergedBenchmarkForm)

  void runCustomBenchmarkOrchestrator(mergedBenchmarkForm)
    .then((orchestrator) => {
      console.log(orchestrator)
      console.log(cloneWorkerResult(orchestrator.perfectionSimResult!))

      setResults(mergedBenchmarkForm, orchestrator)
    })
}
