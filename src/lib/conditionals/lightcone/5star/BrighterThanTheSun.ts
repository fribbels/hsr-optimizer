import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.BrighterThanTheSun')
  const sValuesAtk = [0.18, 0.21, 0.24, 0.27, 0.30]
  const sValuesErr = [0.06, 0.07, 0.08, 0.09, 0.10]
  const content: ContentItem[] = [{
    lc: true,
    id: 'dragonsCallStacks',
    name: 'dragonsCallStacks',
    formItem: 'slider',
    text: t('Content.dragonsCallStacks.text'),
    title: t('Content.dragonsCallStacks.title'),
    content: t('Content.dragonsCallStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
    min: 0,
    max: 2,
  }]

  return {
    content: () => content,
    defaults: () => ({
      dragonsCallStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += r.dragonsCallStacks * sValuesAtk[s]
      x[Stats.ERR] += r.dragonsCallStacks * sValuesErr[s]
    },
    finalizeCalculations: () => {
    },
  }
}
