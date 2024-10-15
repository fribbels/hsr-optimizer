import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WoofWalkTime')
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBoost',
    name: 'atkBoost',
    formItem: 'switch',
    text: t('Content.atkBoost.text'),
    title: t('Content.atkBoost.title'),
    content: t('Content.atkBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      enemyBurnedBleeding: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.enemyBurnedBleeding) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
