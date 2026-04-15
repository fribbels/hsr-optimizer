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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IndeliblePromise')
  const { SOURCE_LC } = Source.lightCone(IndeliblePromise.id)

  const sValues = [0.15, 0.1875, 0.225, 0.2625, 0.3]

  const defaults = {
    crBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    crBuff: {
      lc: true,
      id: 'crBuff',
      formItem: 'switch',
      text: t('Content.crBuff.text'),
      content: t('Content.crBuff.content', { CritBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.crBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const IndeliblePromise: LightConeConfig = {
  id: '21042',
  conditionals,
}
