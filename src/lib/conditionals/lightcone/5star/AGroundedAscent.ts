import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CURRENT_DATA_VERSION } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import i18next from 'i18next'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AGroundedAscent')
  const sValuesDmg = [0.24, 0.24, 0.24, 0.24, 0.24] // TODO

  const content: ContentItem[] = [{
    lc: true,
    id: 'dmgBuffStacks',
    name: 'dmgBuffStacks',
    formItem: 'slider',
    text: 'DMG boost stacks',
    title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
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
