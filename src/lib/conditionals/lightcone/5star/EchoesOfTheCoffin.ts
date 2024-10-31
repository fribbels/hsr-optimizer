import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.EchoesOfTheCoffin')

  const sValues = [12, 14, 16, 18, 20]
  const sValuesEnergy = [3, 3.5, 4, 4.5, 5]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'postUltSpdBuff',
      formItem: 'switch',
      text: t('Content.postUltSpdBuff.text'),
      content: t('Content.postUltSpdBuff.content', {
        EnergyRecovered: TsUtils.precisionRound(sValuesEnergy[s]),
        SpdBuff: TsUtils.precisionRound(sValues[s]),
      }),
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      postUltSpdBuff: false,
    }),
    teammateDefaults: () => ({
      postUltSpdBuff: false,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x[Stats.SPD] += (m.postUltSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
