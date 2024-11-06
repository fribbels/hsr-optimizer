import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ResolutionShinesAsPearlsOfSweat')

  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]

  const defaults = {
    targetEnsnared: true,
  }

  const teammateDefaults = {
    targetEnsnared: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetEnsnared: {
      lc: true,
      id: 'targetEnsnared',
      formItem: 'switch',
      text: t('Content.targetEnsnared.text'),
      content: t('Content.targetEnsnared.content', { DefShred: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetEnsnared: content.targetEnsnared,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.DEF_PEN.buff((m.targetEnsnared) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
