import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UntoTomorrowsMorrow.Content')
  const { SOURCE_LC } = Source.lightCone('21055')

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
      content: t('hp50DmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
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
