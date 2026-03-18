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
  const { SOURCE_LC } = Source.lightCone(LingeringTear.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LingeringTear.Content')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('cdBuff.text'),
      content: t('cdBuff.content', { cdBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.cdBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const LingeringTear: LightConeConfig = {
  id: '20024',
  conditionals,
}
