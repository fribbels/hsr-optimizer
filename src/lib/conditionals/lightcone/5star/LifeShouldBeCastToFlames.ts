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
  const { SOURCE_LC } = Source.lightCone('23041')

  const sValueDmg = [0.60, 0.70, 0.80, 0.90, 1.00]
  const sValuesDefPen = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    defPen: true,
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: 'DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: 'DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.dmgBoost) ? sValueDmg[s] : 0, SOURCE_LC)
      x.DEF_PEN.buff((r.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
