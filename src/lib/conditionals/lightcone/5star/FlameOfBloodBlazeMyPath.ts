import {
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FlameOfBloodBlazeMyPath.Content')
  const { SOURCE_LC } = Source.lightCone('23039')

  const sValuesSkillUltDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const defaults = {
    skillUltDmgBoost: true,
    bonusBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillUltDmgBoost: {
      lc: true,
      id: 'skillUltDmgBoost',
      formItem: 'switch',
      text: t('skillUltDmgBoost.text'),
      content: t('skillUltDmgBoost.content', { DmgBoost: TsUtils.precisionRound(sValuesSkillUltDmg[s] * 100) }),
    },
    bonusBoost: {
      lc: true,
      id: 'bonusBoost',
      formItem: 'switch',
      text: t('bonusBoost.text'),
      content: t('bonusBoost.content', {
        HpConsumption: TsUtils.precisionRound((0.06 + 0.005 * s) * 100),
        BonusDmgBoost: TsUtils.precisionRound(sValuesSkillUltDmg[s] * 100),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0, SOURCE_LC)
      buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost && r.bonusBoost) ? sValuesSkillUltDmg[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
