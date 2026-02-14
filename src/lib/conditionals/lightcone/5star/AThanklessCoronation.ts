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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AThanklessCoronation.Content')
  const { SOURCE_LC } = Source.lightCone('23045')

  const sValuesUltAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesEnergyAtk = [0.40, 0.50, 0.60, 0.70, 0.80]

  const defaults = {
    ultAtkBoost: true,
    energyAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultAtkBoost: {
      lc: true,
      id: 'ultAtkBoost',
      formItem: 'switch',
      text: t('ultAtkBoost.text'),
      content: t('ultAtkBoost.content', { UltAtkBuff: TsUtils.precisionRound(100 * sValuesUltAtk[s]) }),
    },
    energyAtkBuff: {
      lc: true,
      id: 'energyAtkBuff',
      formItem: 'switch',
      text: t('energyAtkBuff.text'),
      content: t('energyAtkBuff.content', { EnergyAtkBuff: TsUtils.precisionRound(100 * sValuesEnergyAtk[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.ultAtkBoost) ? sValuesUltAtk[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
      x.buff(StatKey.ATK_P, (r.energyAtkBuff && context.baseEnergy >= 300) ? sValuesEnergyAtk[s] : 0, x.source(SOURCE_LC))
    },
  }
}
