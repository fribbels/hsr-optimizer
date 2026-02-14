import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone('21039')

  const sValues = [0.008, 0.009, 0.01, 0.011, 0.012]
  const sValuesMax = [0.32, 0.36, 0.40, 0.44, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const defValue = x.getActionValueByIndex(StatKey.DEF, SELF_ENTITY_INDEX)
      x.buff(StatKey.DMG_BOOST, Math.min(sValuesMax[s], Math.floor(defValue / 100) * sValues[s]), x.source(SOURCE_LC))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return wgsl`
let defValue = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, action.config)};
let dmgBuff = min(${sValuesMax[s]}, floor(defValue / 100.0) * ${sValues[s]});
${buff.action(AKey.DMG_BOOST, 'dmgBuff').wgsl(action)}
      `
    },
  }
}
