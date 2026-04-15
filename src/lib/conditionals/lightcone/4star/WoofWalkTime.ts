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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WoofWalkTime')
  const { SOURCE_LC } = Source.lightCone(WoofWalkTime.id)

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    enemyBurnedBleeding: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enemyBurnedBleeding: {
      lc: true,
      id: 'enemyBurnedBleeding',
      formItem: 'switch',
      text: t('Content.enemyBurnedBleeding.text'),
      content: t('Content.enemyBurnedBleeding.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.enemyBurnedBleeding) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const WoofWalkTime: LightConeConfig = {
  id: '21026',
  conditionals,
}
