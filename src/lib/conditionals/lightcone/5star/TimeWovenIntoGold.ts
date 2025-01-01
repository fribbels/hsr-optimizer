import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TimeWovenIntoGold')

  const sValuesCd = [0.09, 0.105, 0.12, 0.135, 0.15]
  const sValuesBasicDmg = [0.09, 0.105, 0.12, 0.135, 0.15]

  const defaults = {
    brocadeStacks: 6,
    maxStacksBasicDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    brocadeStacks: {
      lc: true,
      id: 'brocadeStacks',
      formItem: 'slider',
      text: 'Brocade stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 6,
    },
    maxStacksBasicDmgBoost: {
      lc: true,
      id: 'maxStacksBasicDmgBoost',
      formItem: 'switch',
      text: 'Stacked Basic DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD.buffDual(r.brocadeStacks * sValuesCd[s], Source.NONE)
      x.BASIC_BOOST.buffDual((r.brocadeStacks >= 6 && r.maxStacksBasicDmgBoost) ? r.brocadeStacks * sValuesBasicDmg[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
