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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Cornucopia')
  const { SOURCE_LC } = Source.lightCone('20001')

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    healingBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healingBuff: {
      lc: true,
      id: 'healingBuff',
      formItem: 'switch',
      text: t('Content.healingBuff.text'),
      content: t('Content.healingBuff.content', { HealingBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, (r.healingBuff) ? sValues[s] : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
    },
  }
}
