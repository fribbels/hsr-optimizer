import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentDefinition<typeof defaults> = [
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
    teammateContent: () => Object.values(content),
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
