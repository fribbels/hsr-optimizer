import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NinjaRecordSoundHunt')

  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const defaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      content: t('Content.cdBuff.content', { sValuesCd: TsUtils.precisionRound(100 * sValuesCd[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CD.buff((r.cdBuff) ? sValuesCd[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
