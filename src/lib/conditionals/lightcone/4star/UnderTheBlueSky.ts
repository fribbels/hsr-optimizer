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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UnderTheBlueSky')
  const { SOURCE_LC } = Source.lightCone(UnderTheBlueSky.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    defeatedEnemyCrBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defeatedEnemyCrBuff: {
      lc: true,
      id: 'defeatedEnemyCrBuff',
      formItem: 'switch',
      text: t('Content.defeatedEnemyCrBuff.text'),
      content: t('Content.defeatedEnemyCrBuff.content', { CritBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (r.defeatedEnemyCrBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const UnderTheBlueSky: LightConeConfig = {
  id: '21019',
  conditionals,
}
