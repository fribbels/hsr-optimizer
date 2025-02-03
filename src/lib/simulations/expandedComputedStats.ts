import { calculateBuild } from 'lib/optimization/calculateBuild'
import { RelicFilters } from 'lib/relics/relicFilters'
import DB from 'lib/state/db'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { TsUtils } from 'lib/utils/TsUtils'
import { Build } from 'types/character'

// Reconstruct computed stats from an optimization ID
export function getComputedStatsFromOptimizerBuild(build: Build) {
  const optimizationId = window.store.getState().optimizationId
  const cachedForm = optimizerFormCache[optimizationId!]
  if (!cachedForm) return null

  const relics = TsUtils.clone({
    LinkRope: DB.getRelicById(build.LinkRope!),
    PlanarSphere: DB.getRelicById(build.PlanarSphere!),
    Feet: DB.getRelicById(build.Feet!),
    Body: DB.getRelicById(build.Body!),
    Hands: DB.getRelicById(build.Hands!),
    Head: DB.getRelicById(build.Head!),
  })

  const nonNullRelics = Object.values(relics).filter((relic) => !!relic)
  if (nonNullRelics.length != 6) return null

  RelicFilters.condenseRelicSubstatsForOptimizerSingle(nonNullRelics)
  const { c, computedStatsArray } = calculateBuild(cachedForm, relics, null, null)

  return computedStatsArray
}

export function handleOptimizerExpandedRowData(build: Build) {
  const computedStatsArray = getComputedStatsFromOptimizerBuild(build)

  console.log(computedStatsArray)
}
