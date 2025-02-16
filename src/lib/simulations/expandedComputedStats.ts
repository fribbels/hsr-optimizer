import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { ComputedStatsArray, ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { RelicFilters } from 'lib/relics/relicFilters'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import DB from 'lib/state/db'
import { optimizerFormCache } from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { TsUtils } from 'lib/utils/TsUtils'
import { Build } from 'types/character'
import { OptimizerForm } from 'types/form'

export type BuildData = {
  x: ComputedStatsArray
  request: OptimizerForm
}

// Reconstruct computed stats from an optimization ID
export function getComputedStatsFromOptimizerBuild(build: Build): BuildData | null {
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

  const request = TsUtils.clone(cachedForm)
  request.trace = true

  RelicFilters.condenseRelicSubstatsForOptimizerSingle(nonNullRelics)
  const x = calculateBuild(request, relics, null, new BasicStatsArrayCore(true), new ComputedStatsArrayCore(true))

  return { x, request: cachedForm }
}

export function handleOptimizerExpandedRowData(build: Build) {
  const buildData = getComputedStatsFromOptimizerBuild(build)

  if (!buildData) return
  const { x, request } = buildData
  const buffGroups = aggregateCombatBuffs(x, request)

  window.store.getState().setOptimizerExpandedPanelBuildData(buildData)
  window.store.getState().setOptimizerBuffGroups(buffGroups)
  console.log('buildData', buildData, 'buffGroups', buffGroups)
}
