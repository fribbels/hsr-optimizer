import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(LandausChoice.id)

  const sValues = [0.16, 0.18, 0.20, 0.22, 0.24]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.multiplicativeComplement(StatKey.DMG_RED, sValues[s], x.source(SOURCE_LC))
    },
  }
}

export const LandausChoice: LightConeConfig = {
  id: '21009',
  conditionals,
}
