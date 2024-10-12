import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AnInstantBeforeAGaze')
  const sValues = [0.0036, 0.0042, 0.0048, 0.0054, 0.006]

  const content: ContentItem[] = [{
    lc: true,
    id: 'maxEnergyUltDmgStacks',
    name: 'maxEnergyUltDmgStacks',
    formItem: 'slider',
    text: t('Content.maxEnergyUltDmgStacks.text'),
    title: t('Content.maxEnergyUltDmgStacks.title'),
    content: t('Content.maxEnergyUltDmgStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 180,
  }]

  return {
    content: () => content,
    defaults: () => ({
      maxEnergyUltDmgStacks: 180,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDmg(x, ULT_TYPE, r.maxEnergyUltDmgStacks * sValues[s])
    },
    finalizeCalculations: () => {
    },
  }
}
