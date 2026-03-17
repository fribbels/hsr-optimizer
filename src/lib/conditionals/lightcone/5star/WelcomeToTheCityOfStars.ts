import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { LightConeConfig } from 'types/lightConeConfig'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WelcomeToTheCityOfStars')
  const { SOURCE_LC } = Source.lightCone(WelcomeToTheCityOfStars.id)

  // TODO: fill in superimposition values
  const sValues = [0.00, 0.00, 0.00, 0.00, 0.00]

  const defaults = {
    // TODO: add light cone conditionals
  }

  const content: ContentDefinition<typeof defaults> = {
    // TODO: add light cone content definitions
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      // TODO: add light cone effects
    },
  }
}

export const WelcomeToTheCityOfStars: LightConeConfig = {
  id: '23057',
  conditionals,
}
