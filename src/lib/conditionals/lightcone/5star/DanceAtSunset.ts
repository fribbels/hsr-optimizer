import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DanceAtSunset')
  const { SOURCE_LC } = Source.lightCone('23030')

  const sValuesFuaDmg = [0.36, 0.42, 0.48, 0.54, 0.60]

  const defaults = {
    fuaDmgStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgStacks: {
      lc: true,
      formItem: 'slider',
      id: 'fuaDmgStacks',
      text: t('Content.fuaDmgStacks.text'),
      content: t('Content.fuaDmgStacks.content', { DmgBoost: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.fuaDmgStacks * sValuesFuaDmg[s], x.damageType(DamageTag.FUA).source(SOURCE_LC))
    },
  }
}
