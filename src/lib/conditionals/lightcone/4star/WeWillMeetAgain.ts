import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeWillMeetAgain')
  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]
  const content: ContentItem[] = [{
    lc: true,
    id: 'extraDmgProc',
    name: 'extraDmgProc',
    formItem: 'switch',
    text: t('Content.extraDmgProc.text'),
    title: t('Content.extraDmgProc.title'),
    content: t('Content.extraDmgProc.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      extraDmgProc: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.BASIC_SCALING += (r.extraDmgProc) ? sValues[s] : 0
      x.SKILL_SCALING += (r.extraDmgProc) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
