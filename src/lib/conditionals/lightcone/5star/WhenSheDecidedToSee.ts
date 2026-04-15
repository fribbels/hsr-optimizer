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
import {
  type LightConeConditionalFunction,
  type LightConeConfig,
} from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(WhenSheDecidedToSee.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WhenSheDecidedToSee.Content')

  const sValuesCr = [0.10, 0.11, 0.12, 0.13, 0.14]
  const sValuesCd = [0.30, 0.375, 0.45, 0.525, 0.60]
  const sValuesErr = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    greatFortune: true,
  }

  const teammateDefaults = {
    greatFortune: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    greatFortune: {
      lc: true,
      id: 'greatFortune',
      formItem: 'switch',
      text: t('greatFortune.text'),
      content: t('greatFortune.content', {
        critDamageBuff: precisionRound(100 * sValuesCd[s]),
        critRateBuff: precisionRound(100 * sValuesCr[s]),
        errBuff: precisionRound(100 * sValuesErr[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    greatFortune: content.greatFortune,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ERR, (r.greatFortune) ? sValuesErr[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CR, (m.greatFortune) ? sValuesCr[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.CD, (m.greatFortune) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const WhenSheDecidedToSee: LightConeConfig = {
  id: '23054',
  conditionals,
}
