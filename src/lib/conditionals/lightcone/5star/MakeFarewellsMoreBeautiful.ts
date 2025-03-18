import i18next from 'i18next'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LifeShouldBeCastToFlames')
  const { SOURCE_LC } = Source.lightCone('23040')

  const sValuesDefPen = [0.30, 0.35, 0.40, 0.45, 0.50]

  const defaults = {
    deathFlower: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    deathFlower: {
      lc: true,
      id: 'deathFlower',
      formItem: 'switch',
      text: 'Death Flower DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.DEF_PEN.buffDual((r.deathFlower) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
