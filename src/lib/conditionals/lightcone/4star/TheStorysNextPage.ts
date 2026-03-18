import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheStorysNextPage.Content')
  const { SOURCE_LC } = Source.lightCone(TheStorysNextPage.id)

  const sValuesOhb = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    ohbBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ohbBuff: {
      lc: true,
      id: 'ohbBuff',
      formItem: 'switch',
      text: t('ohbBuff.text'),
      content: t('ohbBuff.content', { OHBBuff: precisionRound(100 * sValuesOhb[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, r.ohbBuff ? sValuesOhb[s] : 0, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_LC))
    },
  }
}

export const TheStorysNextPage: LightConeConfig = {
  id: '21054',
  conditionals,
}
