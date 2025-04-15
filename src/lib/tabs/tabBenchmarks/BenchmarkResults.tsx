import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'

export function BenchmarkResults() {
  const {
    benchmarkForm,
    orchestrator,
  } = useBenchmarksTabStore()

  console.log(benchmarkForm, orchestrator)

  return (
    <></>
  )
}
