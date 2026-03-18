import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ShatteredHome')
  const { SOURCE_LC } = Source.lightCone(ShatteredHome.id)

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    enemyHp50Buff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyHp50Buff: {
      lc: true,
      id: 'enemyHp50Buff',
      formItem: 'switch',
      text: t('Content.enemyHp50Buff.text'),
      content: t('Content.enemyHp50Buff.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.enemyHp50Buff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const ShatteredHome: LightConeConfig = {
  id: '20009',
  conditionals,
}
