import type {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WelcomeToTheCosmicCity.Content')
  const { SOURCE_LC } = Source.lightCone(WelcomeToTheCosmicCity.id)

  const sValuesDefPen = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    elationDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationDefPen: {
      lc: true,
      id: 'elationDefPen',
      formItem: 'switch',
      text: t('elationDefPen.text'),
      content: t('elationDefPen.content', { defShred: precisionRound(100 * sValuesDefPen[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      // Elation DMG ignores DEF
      x.buff(StatKey.DEF_PEN, (r.elationDefPen) ? sValuesDefPen[s] : 0, x.damageType(DamageTag.ELATION).source(SOURCE_LC))
    },
  }
}

export const WelcomeToTheCosmicCity: LightConeConfig = {
  id: '23057',
  conditionals,
}
