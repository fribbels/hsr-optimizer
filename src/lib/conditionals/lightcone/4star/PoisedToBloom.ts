import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PoisedToBloom')

  const sValuesCd = [0.16, 0.20, 0.24, 0.28, 0.32]

  const defaults = {
    cdBuff: true,
  }

  const teammateDefaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      content: t('Content.cdBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    cdBuff: content.cdBuff,
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

      x.CD.buff((m.cdBuff) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
