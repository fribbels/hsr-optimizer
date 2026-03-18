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
import { type OptimizerAction, type OptimizerContext } from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FinalVictor')
  const { SOURCE_LC } = Source.lightCone(FinalVictor.id)

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    goodFortuneStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    goodFortuneStacks: {
      lc: true,
      id: 'goodFortuneStacks',
      formItem: 'slider',
      text: t('Content.goodFortuneStacks.text'),
      content: t('Content.goodFortuneStacks.content', { CritBuff: precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.goodFortuneStacks * sValues[s], x.source(SOURCE_LC))
    },
  }
}

export const FinalVictor: LightConeConfig = {
  id: '21037',
  conditionals,
}
