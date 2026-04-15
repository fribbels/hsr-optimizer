import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AThanklessCoronation.Content')
  const { SOURCE_LC } = Source.lightCone(AThanklessCoronation.id)

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
      content: t('ultAtkBoost.content', { UltAtkBuff: precisionRound(100 * sValuesUltAtk[s]) }),
    },
    energyAtkBuff: {
      lc: true,
      id: 'energyAtkBuff',
      formItem: 'switch',
      text: t('energyAtkBuff.text'),
      content: t('energyAtkBuff.content', { EnergyAtkBuff: precisionRound(100 * sValuesEnergyAtk[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK, (r.ultAtkBoost) ? sValuesUltAtk[s] * context.baseATK : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
      x.buff(StatKey.ATK_P, (r.energyAtkBuff && context.baseEnergy >= 300) ? sValuesEnergyAtk[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const AThanklessCoronation: LightConeConfig = {
  id: '23045',
  conditionals,
}
