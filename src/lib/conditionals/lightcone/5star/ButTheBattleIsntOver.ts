import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ButTheBattleIsntOver')
  const sValuesDmg = [0.30, 0.35, 0.40, 0.45, 0.50]

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: 'switch',
    text: t('Content.postSkillDmgBuff.text'),
    title: t('Content.postSkillDmgBuff.title'),
    content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]) }),
  }]

  return {
    content: () => [],
    teammateContent: () => content,
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
