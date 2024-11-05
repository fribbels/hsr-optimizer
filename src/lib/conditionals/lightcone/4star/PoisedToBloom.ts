import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PoisedToBloom')

  const sValuesCd = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      content: t('Content.cdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  ]

  return {
    content: () => Object.values(content),
    teammatecontent: () => Object.values(content),
    defaults: () => ({
      cdBuff: true,
    }),
    teammateDefaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x[Stats.CD] += (m.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
