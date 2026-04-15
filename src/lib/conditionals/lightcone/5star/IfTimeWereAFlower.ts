import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IfTimeWereAFlower.Content')
  const { SOURCE_LC } = Source.lightCone(IfTimeWereAFlower.id)

  const sValuesCd = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    presage: true,
  }

  const teammateDefaults = {
    presage: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    presage: {
      lc: true,
      id: 'presage',
      formItem: 'switch',
      text: t('presage.text'),
      content: t('presage.content', { CdBuff: precisionRound(sValuesCd[s] * 100) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    presage: content.presage,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, (m.presage) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const IfTimeWereAFlower: LightConeConfig = {
  id: '23038',
  conditionals,
}
