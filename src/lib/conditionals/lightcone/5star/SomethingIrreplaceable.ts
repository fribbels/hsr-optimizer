import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SomethingIrreplaceable')

  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesHealing = [0.08, 0.09, 0.1, 0.11, 0.12]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('Content.dmgBuff.text'),
      content: t('Content.dmgBuff.content', {
        Multiplier: TsUtils.precisionRound(100 * sValuesHealing[s]),
        DmgBuff: TsUtils.precisionRound(100 * sValues[s]),
      }),
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      dmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.dmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
