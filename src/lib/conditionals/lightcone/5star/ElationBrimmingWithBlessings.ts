import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  type LightConeConditionalFunction,
  type LightConeConfig,
} from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(ElationBrimmingWithBlessings.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ElationBrimmingWithBlessings.Content')

  const sValuesElation = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    elationBuff: false,
  }

  const teammateDefaults = {
    elationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationBuff: {
      lc: true,
      id: 'elationBuff',
      formItem: 'switch',
      text: t('elationBuff.text'),
      content: t('elationBuff.content', { elationBuff: precisionRound(100 * sValuesElation[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationBuff: content.elationBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ELATION, (r.elationBuff) ? sValuesElation[s] : 0, x.source(SOURCE_LC))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ELATION, (t.elationBuff) ? sValuesElation[s] : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
    },
  }
}

export const ElationBrimmingWithBlessings: LightConeConfig = {
  id: '24006',
  conditionals,
}
