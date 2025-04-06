import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'

export function generateCustomBenchmark() {
  const form = OptimizerTabController.getForm()
  console.log(form)
}
