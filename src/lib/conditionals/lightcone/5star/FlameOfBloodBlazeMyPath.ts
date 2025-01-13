import i18next from 'i18next'
import { SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.x')

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
      text: 'Skill / Ult DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    bonusBoost: {
      lc: true,
      id: 'bonusBoost',
      formItem: 'switch',
      text: 'Bonus DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0, Source.NONE)
      buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost && r.bonusBoost) ? sValuesSkillUltDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
