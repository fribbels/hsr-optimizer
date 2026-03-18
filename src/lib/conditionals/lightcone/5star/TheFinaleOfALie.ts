import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  type LightConeConditionalFunction,
  type LightConeConfig,
} from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals: LightConeConditionalFunction = (s, withContent) => {
  const { SOURCE_LC } = Source.lightCone(TheFinaleOfALie.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheFinaleOfALie.Content')

  const sValuesAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesVulnerability = [0.20, 0.225, 0.25, 0.275, 0.30]

  const defaults = {
    umbraDevourerBuff: true,
  }

  const teammateDefaults = {
    umbraDevourerBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    umbraDevourerBuff: {
      lc: true,
      id: 'umbraDevourerBuff',
      formItem: 'switch',
      text: t('umbraDevourerBuff.text'),
      content: t('umbraDevourerBuff.content', {
        atkBuff: precisionRound(100 * sValuesAtk[s]),
        vulnerability: precisionRound(100 * sValuesVulnerability[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    umbraDevourerBuff: content.umbraDevourerBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.umbraDevourerBuff) ? sValuesAtk[s] : 0, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.umbraDevourerBuff) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const TheFinaleOfALie: LightConeConfig = {
  id: '23056',
  conditionals,
}
