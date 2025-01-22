import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      content: t('Content.targetEnsnared.content', { BaseChance: TsUtils.precisionRound(60 + 10 * s), DefShred: TsUtils.precisionRound(100 * sValues[s]) }),
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
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((m.targetEnsnared) ? sValues[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
