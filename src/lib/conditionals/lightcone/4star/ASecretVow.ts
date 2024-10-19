import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ASecretVow')
  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]
  const content: ContentItem[] = [{
    lc: true,
    id: 'enemyHpHigherDmgBoost',
    name: 'enemyHpHigherDmgBoost',
    formItem: 'switch',
    text: t('Content.enemyHpHigherDmgBoost.text'),
    title: t('Content.enemyHpHigherDmgBoost.title'),
    content: t('Content.enemyHpHigherDmgBoost.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyHpHigherDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += sValues[s]
      x.ELEMENTAL_DMG += (r.enemyHpHigherDmgBoost) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
