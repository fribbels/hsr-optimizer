import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(NoShiftsOnRainyDays.id)
  const sValuesAtk = [0.20, 0.23, 0.26, 0.29, 0.32]
  const sValuesDefPen = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    atkBuff: true,
    basicUltDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuff: {
      lc: true,
      id: 'atkBuff',
      formItem: 'switch',
      text: 'ATK buff',
      content: betaContent,
    },
    basicUltDefPen: {
      lc: true,
      id: 'basicUltDefPen',
      formItem: 'switch',
      text: 'Basic / Ult DEF PEN',
      content: betaContent,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, r.atkBuff ? sValuesAtk[s] : 0, x.source(SOURCE_LC))
      x.buff(
        StatKey.DEF_PEN,
        (r.basicUltDefPen && context.baseEnergy >= 200) ? sValuesDefPen[s] * (r.atkBuff ? 2 : 1) : 0,
        x.targets(TargetTag.Self).damageType(DamageTag.BASIC | DamageTag.ULT).source(SOURCE_LC),
      )
    },
  }
}

export const NoShiftsOnRainyDays: LightConeConfig = {
  id: '23066',
  conditionals,
}
