import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.MomentOfVictory')
  const sValues = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    id: 'selfAttackedDefBuff',
    name: 'selfAttackedDefBuff',
    formItem: 'switch',
    text: t('Content.selfAttackedDefBuff.text'),
    title: t('Content.selfAttackedDefBuff.title'),
    content: t('Content.selfAttackedDefBuff.content', { DefBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      selfAttackedDefBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.DEF_P] += (r.selfAttackedDefBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
