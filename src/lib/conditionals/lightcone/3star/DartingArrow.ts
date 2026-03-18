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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DartingArrow')
  const { SOURCE_LC } = Source.lightCone(DartingArrow.id)

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    defeatedEnemyAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemyAtkBuff: {
      lc: true,
      id: 'defeatedEnemyAtkBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemyAtkBuff.text'),
      content: t('Content.defeatedEnemyAtkBuff.content', { AtkBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.defeatedEnemyAtkBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const DartingArrow: LightConeConfig = {
  id: '20007',
  conditionals,
}
