import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  type LightConeConditionalFunction,
  type LightConeConfig,
} from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(TodaysGoodLuck.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TodaysGoodLuck.Content')

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
      content: t('elationStacks.content', { elationBuff: precisionRound(100 * sValues[s]) }),
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
