import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone('21008')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.DMG_BOOST, sValues[s], x.damageType(DamageTag.DOT).source(SOURCE_LC))
    },
  }
}
