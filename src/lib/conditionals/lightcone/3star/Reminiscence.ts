import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Reminiscence')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    dmgStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgStacks: {
      lc: true,
      id: 'dmgStacks',
      formItem: 'slider',
      text: 'DMG stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buffDual(r.dmgStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
