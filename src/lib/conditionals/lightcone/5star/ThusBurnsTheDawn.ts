import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThusBurnsTheDawn.Content')
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
      text: t('defPen.text'),
      content: t('defPen.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
    },
    dmgBuff: {
      lc: true,
      id: 'dmgBuff',
      formItem: 'switch',
      text: t('dmgBuff.text'),
      content: t('dmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDefPen[s]) }),
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
