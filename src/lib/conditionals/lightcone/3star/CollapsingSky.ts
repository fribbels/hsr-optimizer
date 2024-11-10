import { BASIC_TYPE, SKILL_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CollapsingSky')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    basicSkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicSkillDmgBuff: {
      lc: true,
      formItem: 'switch',
      id: 'basicSkillDmgBuff',
      text: t('Content.basicSkillDmgBuff.text'),
      content: t('Content.basicSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, (r.basicSkillDmgBuff) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
