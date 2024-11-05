import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeAreWildfire')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesHealing = [0.3, 0.35, 0.4, 0.45, 0.5]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'initialDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.initialDmgReductionBuff.text'),
      content: t('Content.initialDmgReductionBuff.content', {
        Healing: TsUtils.precisionRound(100 * sValuesHealing[s]),
        DmgReduction: sValues[s],
      }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      initialDmgReductionBuff: true,
    }),
    teammateDefaults: () => ({
      initialDmgReductionBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x.DMG_RED_MULTI *= (m.initialDmgReductionBuff) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
