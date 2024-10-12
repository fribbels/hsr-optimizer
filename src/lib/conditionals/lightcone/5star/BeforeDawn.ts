import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, FUA_TYPE, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BeforeDawn')
  const sValuesSkillUltDmg = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesFuaDmg = [0.48, 0.56, 0.64, 0.72, 0.80]

  const content: ContentItem[] = [{
    lc: true,
    id: 'fuaDmgBoost',
    name: 'fuaDmgBoost',
    formItem: 'switch',
    text: t('Content.fuaDmgBoost.text'),
    title: t('Content.fuaDmgBoost.title'),
    content: t('Content.fuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      fuaDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDmg(x, SKILL_TYPE | ULT_TYPE, sValuesSkillUltDmg[s])
      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s], (r.fuaDmgBoost))
    },
    finalizeCalculations: () => {
    },
  }
}
