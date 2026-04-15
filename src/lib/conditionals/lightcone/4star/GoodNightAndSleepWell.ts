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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GoodNightAndSleepWell')
  const { SOURCE_LC } = Source.lightCone(GoodNightAndSleepWell.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    debuffStacksDmgIncrease: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    debuffStacksDmgIncrease: {
      lc: true,
      id: 'debuffStacksDmgIncrease',
      formItem: 'slider',
      text: t('Content.debuffStacksDmgIncrease.text'),
      content: t('Content.debuffStacksDmgIncrease.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.debuffStacksDmgIncrease * sValues[s], x.source(SOURCE_LC))
    },
  }
}

export const GoodNightAndSleepWell: LightConeConfig = {
  id: '21001',
  conditionals,
}
