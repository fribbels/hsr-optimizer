import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UntoTomorrowsMorrow.Content')
  const { SOURCE_LC } = Source.lightCone(UntoTomorrowsMorrow.id)

  const sValuesDmgBoost = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    hp50DmgBoost: true,
  }

  const teammateDefaults = {
    hp50DmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hp50DmgBoost: {
      lc: true,
      id: 'hp50DmgBoost',
      formItem: 'switch',
      text: t('hp50DmgBoost.text'),
      content: t('hp50DmgBoost.content', { DmgBuff: precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    hp50DmgBoost: content.hp50DmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, m.hp50DmgBoost ? sValuesDmgBoost[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const UntoTomorrowsMorrow: LightConeConfig = {
  id: '21055',
  conditionals,
}
