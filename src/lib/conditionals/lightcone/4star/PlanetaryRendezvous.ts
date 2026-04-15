import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { type WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
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

const conditionals = (s: SuperImpositionLevel, withContent: boolean, wearerMeta: WearerMetadata): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PlanetaryRendezvous')
  const { SOURCE_LC } = Source.lightCone(PlanetaryRendezvous.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    alliesSameElement: true,
  }

  const teammateDefaults = {
    alliesSameElement: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    alliesSameElement: {
      lc: true,
      id: 'alliesSameElement',
      formItem: 'switch',
      text: t('Content.alliesSameElement.text'),
      content: t('Content.alliesSameElement.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    alliesSameElement: content.alliesSameElement,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof content>

      if (wearerMeta.element == context.element) {
        x.buff(StatKey.DMG_BOOST, (m.alliesSameElement) ? sValues[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      }
    },
  }
}

export const PlanetaryRendezvous: LightConeConfig = {
  id: '21011',
  conditionals,
}
