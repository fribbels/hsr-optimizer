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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Amber')
  const { SOURCE_LC } = Source.lightCone(Amber.id)

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    hp50DefBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hp50DefBuff: {
      lc: true,
      id: 'hp50DefBuff',
      formItem: 'switch',
      text: t('Content.hp50DefBuff.text'),
      content: t('Content.hp50DefBuff.content', { DefBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, (r.hp50DefBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const Amber: LightConeConfig = {
  id: '20003',
  conditionals,
}
