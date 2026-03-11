import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  LightConeConditionalFunction,
  LightConeConfig,
} from 'types/lightConeConfig'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(TodaysGoodLuck.id)

  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TodaysGoodLuck.Content')

  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    elationStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationStacks: {
      lc: true,
      id: 'elationStacks',
      formItem: 'slider',
      text: t('elationStacks.text'),
      content: t('elationStacks.content', { elationBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ELATION, r.elationStacks * sValues[s], x.source(SOURCE_LC))
    },
  }
}

export const TodaysGoodLuck: LightConeConfig = {
  id: '21065',
  conditionals,
}
