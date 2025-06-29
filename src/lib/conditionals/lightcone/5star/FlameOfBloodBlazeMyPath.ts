import {
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
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
  const sValuesHpDrain = [0.06, 0.065, 0.07, 0.075, 0.08]

  const defaults = {
    skillUltDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillUltDmgBoost: {
      lc: true,
      id: 'skillUltDmgBoost',
      formItem: 'switch',
      text: t('skillUltDmgBoost.text'),
      content: t('skillUltDmgBoost.content', { DmgBoost: TsUtils.precisionRound(sValuesSkillUltDmg[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x, action, context) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      if (x.a[Key.HP] * sValuesHpDrain[s] > 500) {
        buffAbilityDmg(x, SKILL_DMG_TYPE | ULT_DMG_TYPE, (r.skillUltDmgBoost) ? sValuesSkillUltDmg[s] : 0, SOURCE_LC)
      }
    },
    gpuFinalizeCalculations: (action, context) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      return `
if (${wgslTrue(r.skillUltDmgBoost)}) {
  (*p_x).SKILL_DMG_BOOST += select(0.0, ${sValuesSkillUltDmg[s]}, x.HP * ${sValuesHpDrain[s]} > 500);
  (*p_x).ULT_DMG_BOOST += select(0.0, ${sValuesSkillUltDmg[s]}, x.HP * ${sValuesHpDrain[s]} > 500);
}
`
    },
  }
}
