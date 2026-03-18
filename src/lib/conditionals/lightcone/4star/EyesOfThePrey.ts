import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(EyesOfThePrey.id)

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.DMG_BOOST, sValues[s], x.damageType(DamageTag.DOT).source(SOURCE_LC))
    },
  }
}

export const EyesOfThePrey: LightConeConfig = {
  id: '21008',
  conditionals,
}
