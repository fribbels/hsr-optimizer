import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')

  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const teammateDefaults = {
    postSkillDmgBuff: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    postSkillDmgBuff: {
      lc: true,
      id: 'postSkillDmgBuff',
      formItem: 'switch',
      text: t('Content.postSkillDmgBuff.text'),
      content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buff((t.postSkillDmgBuff) ? sValues[s] : 0, Source.NONE) // TODO: MEMO
    },
    finalizeCalculations: () => {
    },
  }
}
