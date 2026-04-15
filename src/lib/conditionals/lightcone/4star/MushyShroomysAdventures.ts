import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
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
  const { SOURCE_LC } = Source.lightCone(MushyShroomysAdventures.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MushyShroomysAdventure.Content')

  const sValues = [0.06, 0.07, 0.08, 0.09, 0.10]

  const defaults = {
    elationVulnerability: true,
  }

  const teammateDefaults = {
    elationVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationVulnerability: {
      lc: true,
      id: 'elationVulnerability',
      formItem: 'switch',
      text: t('elationVulnerability.text'),
      content: t('elationVulnerability.content', { vulnerability: precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationVulnerability: content.elationVulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.elationVulnerability) ? sValues[s] : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const MushyShroomysAdventures: LightConeConfig = {
  id: '21064',
  conditionals,
}
