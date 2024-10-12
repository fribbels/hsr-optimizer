import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GoodNightAndSleepWell')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'debuffStacksDmgIncrease',
    name: 'debuffStacksDmgIncrease',
    formItem: 'slider',
    text: t('Content.debuffStacksDmgIncrease.text'),
    title: t('Content.debuffStacksDmgIncrease.title'),
    content: t('Content.debuffStacksDmgIncrease.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      debuffStacksDmgIncrease: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += r.debuffStacksDmgIncrease * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
