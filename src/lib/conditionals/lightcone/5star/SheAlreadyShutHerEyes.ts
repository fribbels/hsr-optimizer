import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SheAlreadyShutHerEyes')

  const sValues = [0.09, 0.105, 0.12, 0.135, 0.15]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'hpLostDmgBuff',
      formItem: 'switch',
      text: t('Content.hpLostDmgBuff.text'),
      content: t('Content.hpLostDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  ]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      hpLostDmgBuff: true,
    }),
    teammateDefaults: () => ({
      hpLostDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.ELEMENTAL_DMG += (m.hpLostDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
