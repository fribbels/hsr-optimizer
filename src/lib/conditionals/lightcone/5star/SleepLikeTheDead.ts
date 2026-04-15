import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SleepLikeTheDead')
  const { SOURCE_LC } = Source.lightCone(SleepLikeTheDead.id)

  const sValues = [0.36, 0.42, 0.48, 0.54, 0.60]

  const defaults = {
    missedCritCrBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    missedCritCrBuff: {
      lc: true,
      id: 'missedCritCrBuff',
      formItem: 'switch',
      text: t('Content.missedCritCrBuff.text'),
      content: t('Content.missedCritCrBuff.content', { CritBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.missedCritCrBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const SleepLikeTheDead: LightConeConfig = {
  id: '23012',
  conditionals,
}
