import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WorrisomeBlissful')
  const { SOURCE_LC } = Source.lightCone('23016')

  const sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    targetTameStacks: 2,
  }

  const teammateDefaults = {
    targetTameStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetTameStacks: {
      lc: true,
      id: 'targetTameStacks',
      formItem: 'slider',
      text: t('Content.targetTameStacks.text'),
      content: t('Content.targetTameStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
      min: 0,
      max: 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetTameStacks: content.targetTameStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.DMG_BOOST, sValuesFuaDmg[s], x.damageType(DamageTag.FUA).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, m.targetTameStacks * sValuesCd[s], x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
