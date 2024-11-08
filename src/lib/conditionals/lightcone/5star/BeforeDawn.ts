import { FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BeforeDawn')
  const sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]

  const defaults = {
    fuaDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgBoost: {
      lc: true,
      id: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('Content.fuaDmgBoost.text'),
      content: t('Content.fuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, SKILL_TYPE | ULT_TYPE, sValuesSkillUltDmg[s], Source.NONE)
      buffAbilityDmg(x, FUA_TYPE, (r.fuaDmgBoost) ? sValuesFuaDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
