import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TextureOfMemories')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesShieldHp = [0.16, 0.2, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [{
    lc: true,
    id: 'activeShieldDmgDecrease',
    name: 'activeShieldDmgDecrease',
    formItem: 'switch',
    text: t('Content.activeShieldDmgDecrease.text'),
    title: t('Content.activeShieldDmgDecrease.title'),
    content: t('Content.activeShieldDmgDecrease.content', { ShieldHp: TsUtils.precisionRound(100 * sValuesShieldHp[s]), DmgReduction: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      activeShieldDmgDecrease: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.DMG_RED_MULTI *= (r.activeShieldDmgDecrease) ? (1 - sValues[s]) : 1
    },
    finalizeCalculations: () => {
    },
  }
}
