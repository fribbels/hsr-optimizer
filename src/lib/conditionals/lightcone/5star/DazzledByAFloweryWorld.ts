import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
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
  const { SOURCE_LC } = Source.lightCone(DazzledByAFloweryWorld.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DazzledByAFloweryWorld.Content')

  const sValuesDefPen = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesElation = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    spConsumedStacks: 4,
    elationBuff: true,
  }

  const teammateDefaults = {
    elationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spConsumedStacks: {
      lc: true,
      id: 'spConsumedStacks',
      formItem: 'slider',
      text: t('spConsumedStacks.text'),
      content: t('spConsumedStacks.content', { defShred: precisionRound(100 * sValuesDefPen[s]) }),
      min: 0,
      max: 4,
    },
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

      x.buff(StatKey.DEF_PEN, r.spConsumedStacks * sValuesDefPen[s], x.damageType(DamageTag.ELATION).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ELATION, (m.elationBuff) ? sValuesElation[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const DazzledByAFloweryWorld: LightConeConfig = {
  id: '23053',
  conditionals,
}
