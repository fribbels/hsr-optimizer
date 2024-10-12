import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SolitaryHealing')
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const content: ContentItem[] = [{
    lc: true,
    id: 'postUltDotDmgBuff',
    name: 'postUltDotDmgBuff',
    formItem: 'switch',
    text: t('Content.postUltDotDmgBuff.text'),
    title: t('Content.postUltDotDmgBuff.title'),
    content: t('Content.postUltDotDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      postUltDotDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDmg(x, DOT_TYPE, sValues[s], (r.postUltDotDmgBuff))
    },
    finalizeCalculations: () => {
    },
  }
}
