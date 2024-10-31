import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'postSkillDmgBuff',
      formItem: 'switch',
      text: t('Content.postSkillDmgBuff.text'),
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

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

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
