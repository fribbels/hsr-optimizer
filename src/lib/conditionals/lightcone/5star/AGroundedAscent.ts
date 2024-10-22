import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CURRENT_DATA_VERSION } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AGroundedAscent')
  const sValuesDmg = [0.15, 0.1725, 0.195, 0.2175, 0.24]

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuffStacks',
    name: 'dmgBuffStacks',
    formItem: 'slider',
    text: t('Content.dmgBuffStacks.text'),
    title: t('Content.dmgBuffStacks.title', { Version: CURRENT_DATA_VERSION }),
    content: t('Content.dmgBuffStacks.content', { Version: CURRENT_DATA_VERSION }),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      dmgBuffStacks: 3,
    }),
    teammateDefaults: () => ({
      dmgBuffStacks: 3,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.ELEMENTAL_DMG += m.dmgBuffStacks * sValuesDmg[s]
    },
    finalizeCalculations: () => {
    },
  }
}
