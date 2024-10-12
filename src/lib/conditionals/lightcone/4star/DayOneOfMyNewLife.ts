import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DayOneOfMyNewLife')
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgResBuff',
    name: 'dmgResBuff',
    formItem: 'switch',
    text: t('Content.dmgResBuff.text'),
    title: t('Content.dmgResBuff.title'),
    content: t('Content.dmgResBuff.content', { ResBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      dmgResBuff: true,
    }),
    teammateDefaults: () => ({
      dmgResBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      // TODO: This is technically a DMG RES buff not a DMG Reduction buff
      x.DMG_RED_MULTI *= (m.dmgResBuff) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
