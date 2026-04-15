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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Loop')
  const { SOURCE_LC } = Source.lightCone(Loop.id)

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    enemySlowedDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemySlowedDmgBuff: {
      lc: true,
      id: 'enemySlowedDmgBuff',
      formItem: 'switch',
      text: t('Content.enemySlowedDmgBuff.text'),
      content: t('Content.enemySlowedDmgBuff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.enemySlowedDmgBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const Loop: LightConeConfig = {
  id: '20011',
  conditionals,
}
