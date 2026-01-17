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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SubscribeForMore')
  const { SOURCE_LC } = Source.lightCone('21017')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    maxEnergyDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyDmgBoost: {
      lc: true,
      id: 'maxEnergyDmgBoost',
      formItem: 'switch',
      text: t('Content.maxEnergyDmgBoost.text'),
      content: t('Content.maxEnergyDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, sValues[s], x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.maxEnergyDmgBoost) ? sValues[s] : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}
