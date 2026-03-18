import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type SuperImpositionLevel } from 'types/lightCone'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheSeriousnessOfBreakfast')
  const { SOURCE_LC } = Source.lightCone(TheSeriousnessOfBreakfast.id)

  const sValuesStacks = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    defeatedEnemyAtkStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemyAtkStacks: {
      lc: true,
      id: 'defeatedEnemyAtkStacks',
      formItem: 'slider',
      text: t('Content.defeatedEnemyAtkStacks.text'),
      content: t('Content.defeatedEnemyAtkStacks.content', { AtkBuff: precisionRound(100 * sValuesStacks[s]) }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.defeatedEnemyAtkStacks * sValuesStacks[s], x.source(SOURCE_LC))
    },
  }
}

export const TheSeriousnessOfBreakfast: LightConeConfig = {
  id: '21027',
  conditionals,
}
