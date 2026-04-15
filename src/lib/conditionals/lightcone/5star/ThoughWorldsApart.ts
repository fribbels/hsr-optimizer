import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoughWorldsApart.Content')
  const { SOURCE_LC } = Source.lightCone(ThoughWorldsApart.id)

  const sValuesDmgBoost = [0.24, 0.30, 0.36, 0.42, 0.48]
  const sValuesDmgBoostSummons = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    dmgBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: t('dmgBoost.text'),
      content: t('dmgBoost.content', {
        DmgBuff: precisionRound(100 * sValuesDmgBoost[s]),
        SummonDmgBuff: precisionRound(100 * sValuesDmgBoostSummons[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBoost: content.dmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, (m.dmgBoost) ? sValuesDmgBoost[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (m.dmgBoost && action.config.hasSummons) ? sValuesDmgBoostSummons[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const ThoughWorldsApart: LightConeConfig = {
  id: '23051',
  conditionals,
}
