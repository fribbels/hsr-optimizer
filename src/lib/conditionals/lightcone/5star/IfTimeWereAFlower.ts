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
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IfTimeWereAFlower.Content')
  const { SOURCE_LC } = Source.lightCone('23038')

  const sValuesCd = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    presage: true,
  }

  const teammateDefaults = {
    presage: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    presage: {
      lc: true,
      id: 'presage',
      formItem: 'switch',
      text: t('presage.text'),
      content: t('presage.content', { CdBuff: TsUtils.precisionRound(sValuesCd[s] * 100) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    presage: content.presage,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, (m.presage) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
