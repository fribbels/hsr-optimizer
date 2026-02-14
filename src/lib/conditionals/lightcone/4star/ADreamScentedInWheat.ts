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
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ADreamScentedInWheat.Content')
  const { SOURCE_LC } = Source.lightCone('21060')

  const sValuesUltFuaDmg = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    ultFuaDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultFuaDmgBoost: {
      lc: true,
      id: 'ultFuaDmgBoost',
      formItem: 'switch',
      text: t('ultFuaDmgBoost.text'),
      content: t('ultFuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesUltFuaDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.ultFuaDmgBoost) ? sValuesUltFuaDmg[s] : 0, x.damageType(DamageTag.ULT | DamageTag.FUA).source(SOURCE_LC))
    },
  }
}
