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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Adversarial')
  const { SOURCE_LC } = Source.lightCone(Adversarial.id)

  const sValues = [0.10, 0.12, 0.14, 0.16, 0.18]

  const defaults = {
    defeatedEnemySpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemySpdBuff: {
      lc: true,
      id: 'defeatedEnemySpdBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemySpdBuff.text'),
      content: t('Content.defeatedEnemySpdBuff.content', { SpdBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (r.defeatedEnemySpdBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const Adversarial: LightConeConfig = {
  id: '20014',
  conditionals,
}
