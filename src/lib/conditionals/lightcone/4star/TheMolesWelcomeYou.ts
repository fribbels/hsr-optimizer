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
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheMolesWelcomeYou')
  const { SOURCE_LC } = Source.lightCone('21005')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    atkBuffStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuffStacks: {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('Content.atkBuffStacks.text'),
      content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.atkBuffStacks * sValues[s], x.source(SOURCE_LC))
    },
  }
}
