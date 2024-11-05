import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Mediation')

  const sValues = [12, 14, 16, 18, 20]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'initialSpdBuff',
      formItem: 'switch',
      text: t('Content.initialSpdBuff.text'),
      content: t('Content.initialSpdBuff.content', { SpdBuff: sValues[s] }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      initialSpdBuff: true,
    }),
    teammateDefaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x[Stats.SPD] += (m.initialSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
