import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { precisionRound } from 'lib/utils/mathUtils'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.RaceToTheHorizon.Content')
  const { SOURCE_LC } = Source.lightCone(RaceToTheHorizon.id)

  const sValuesCdPerStack = [0.03, 0.035, 0.04, 0.045, 0.05]

  const defaults = {
    fuaCdStacks: 10,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaCdStacks: {
      lc: true,
      id: 'fuaCdStacks',
      formItem: 'slider',
      text: t('fuaCdStacks.text'),
      content: t('fuaCdStacks.content', { CdBuff: precisionRound(100 * sValuesCdPerStack[s]) }),
      min: 0,
      max: 10,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.fuaCdStacks * sValuesCdPerStack[s], x.source(SOURCE_LC))
    },
  }
}

export const RaceToTheHorizon: LightConeConfig = {
  id: '22008',
  conditionals,
}
