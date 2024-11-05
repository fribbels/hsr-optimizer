import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeAreWildfire')

  const sValues = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesHealing = [0.3, 0.35, 0.4, 0.45, 0.5]

  const content: ContentItem[] = [
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
    teammatecontent: () => Object.values(content),
    defaults: () => ({
      initialDmgReductionBuff: true,
    }),
    teammateDefaults: () => ({
      initialDmgReductionBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.DMG_RED_MULTI *= (m.initialDmgReductionBuff) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
