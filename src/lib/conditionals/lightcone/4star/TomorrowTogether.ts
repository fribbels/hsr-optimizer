import type {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import type { LightConeConditionalsController } from 'types/conditionals'
import type { SuperImpositionLevel } from 'types/lightCone'
import type { LightConeConfig } from 'types/lightConeConfig'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TomorrowTogether.Content')
  const { SOURCE_LC } = Source.lightCone(TomorrowTogether.id)

  const sValuesElation = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    elationBuff: true,
  }

  const teammateDefaults = {
    elationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationBuff: {
      lc: true,
      id: 'elationBuff',
      formItem: 'switch',
      text: t('elationBuff.text'),
      content: t('elationBuff.content', { elationBuff: precisionRound(100 * sValuesElation[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationBuff: content.elationBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ELATION, (m.elationBuff) ? sValuesElation[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const TomorrowTogether: LightConeConfig = {
  id: '22007',
  conditionals,
}
