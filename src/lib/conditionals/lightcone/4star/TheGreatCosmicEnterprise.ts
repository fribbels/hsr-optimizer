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
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheGreatCosmicEnterprise.Content')
  const { SOURCE_LC } = Source.lightCone(TheGreatCosmicEnterprise.id)

  const sValuesDmg = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    weaknessTypes: 7,
  }

  const content: ContentDefinition<typeof defaults> = {
    weaknessTypes: {
      lc: true,
      id: 'weaknessTypes',
      formItem: 'slider',
      text: t('weaknessTypes.text'),
      content: t('weaknessTypes.content', { DmgBuff: precisionRound(100 * sValuesDmg[s]) }),
      min: 0,
      max: 7,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.weaknessTypes * sValuesDmg[s], x.source(SOURCE_LC))
    },
  }
}

export const TheGreatCosmicEnterprise: LightConeConfig = {
  id: '22004',
  conditionals,
}
