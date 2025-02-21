import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.GeniusesGreetings')
  const { SOURCE_LC } = Source.lightCone('21051')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    basicDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicDmgBoost: {
      lc: true,
      id: 'basicDmgBoost',
      formItem: 'switch',
      text: t('Content.basicDmgBoost.text'),
      content: t('Content.basicDmgBoost.content', { DmgBuff: TsUtils.precisionRound(sValues[s] * 100) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.BASIC_BOOST.buffDual((r.basicDmgBoost) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
