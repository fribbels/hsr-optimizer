import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThusBurnsTheDawn')
  const { SOURCE_LC } = Source.lightCone('23044')

  const sValuesDefPen = [0.18, 0.225, 0.27, 0.315, 0.36]
  const sValuesDmgBuff = [0.60, 0.78, 0.96, 1.14, 1.132]

  const defaults = {
    defPen: true,
    dmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: 'DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: 'DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.DEF_PEN.buff((r.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
      x.ELEMENTAL_DMG.buff((r.dmgBuff) ? sValuesDmgBuff[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
