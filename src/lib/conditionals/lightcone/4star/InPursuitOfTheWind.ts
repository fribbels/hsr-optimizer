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
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InPursuitOfTheWind.Content')
  const { SOURCE_LC } = Source.lightCone(InPursuitOfTheWind.id)

  const sValuesBreakDmg = [0.16, 0.18, 0.20, 0.22, 0.24]

  const defaults = {
    breakDmgBoost: true,
  }

  const teammateDefaults = {
    breakDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgBoost: {
      lc: true,
      id: 'breakDmgBoost',
      formItem: 'switch',
      text: t('breakDmgBoost.text'),
      content: t('breakDmgBoost.content', { BreakDmgBuff: precisionRound(100 * sValuesBreakDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    breakDmgBoost: content.breakDmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, m.breakDmgBoost ? sValuesBreakDmg[s] : 0, x.damageType(DamageTag.BREAK).targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const InPursuitOfTheWind: LightConeConfig = {
  id: '21056',
  conditionals,
}
