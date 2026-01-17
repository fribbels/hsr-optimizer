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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheFlowerRemembers.Content')
  const { SOURCE_LC } = Source.lightCone('21057')

  const sValuesMemoCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    memoCdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    memoCdBoost: {
      lc: true,
      id: 'memoCdBoost',
      formItem: 'switch',
      text: t('memoCdBoost.text'),
      content: t('memoCdBoost.content', { CritDmgBuff: TsUtils.precisionRound(100 * sValuesMemoCd[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD_BOOST, r.memoCdBoost ? sValuesMemoCd[s] : 0, x.targets(TargetTag.MemospritesOnly).source(SOURCE_LC))
    },
  }
}
