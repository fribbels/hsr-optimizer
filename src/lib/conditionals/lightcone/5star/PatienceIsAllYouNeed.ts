import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PatienceIsAllYouNeed')
  const sValuesDmg = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesSpd = [0.048, 0.056, 0.064, 0.072, 0.08]
  const sValuesErode = [0.6, 0.7, 0.8, 0.9, 1]

  const content: ContentItem[] = [{
    lc: true,
    id: 'spdStacks',
    name: 'spdStacks',
    formItem: 'slider',
    text: t('Content.spdStacks.text'),
    title: t('Content.spdStacks.title'),
    content: t('Content.spdStacks.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpd[s]) }),
    min: 0,
    max: 3,
  }, {
    lc: true,
    id: 'dotEffect',
    name: 'dotEffect',
    formItem: 'switch',
    text: t('Content.dotEffect.text'),
    title: t('Content.dotEffect.title'),
    content: t('Content.dotEffect.content', { Multiplier: TsUtils.precisionRound(100 * sValuesErode[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      spdStacks: 3,
      dotEffect: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.SPD_P] += r.spdStacks * sValuesSpd[s]
      x.ELEMENTAL_DMG += sValuesDmg[s]
    },
    finalizeCalculations: () => {
    },
  }
}
