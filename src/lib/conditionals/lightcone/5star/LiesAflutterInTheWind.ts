import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LiesAflutterInTheWind')
  const { SOURCE_LC } = Source.lightCone('23043')

  const sValuesDefPen = [0.16, 0.18, 0.20, 0.22, 0.24]
  const sValuesDefPenAdditional = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    defPen: true,
  }

  const teammateDefaults = {
    defPen: true,
    additionalDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defPen: {
      lc: true,
      id: 'defPen',
      formItem: 'switch',
      text: t('Content.defPen.text'),
      content: t('Content.defPen.content', {
        DefShred: TsUtils.precisionRound(100 * sValuesDefPen[s]),
        AdditionalDefShred: TsUtils.precisionRound(100 * sValuesDefPenAdditional[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    defPen: content.defPen,
    additionalDefPen: {
      lc: true,
      id: 'additionalDefPen',
      formItem: 'switch',
      text: t('TeammateContent.additionalDefPen.text'),
      content: t('TeammateContent.additionalDefPen.content', {
        DefShred: TsUtils.precisionRound(100 * sValuesDefPen[s]),
        AdditionalDefShred: TsUtils.precisionRound(100 * sValuesDefPenAdditional[s]),
      }),
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((m.defPen) ? sValuesDefPen[s] : 0, SOURCE_LC)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((t.defPen && t.additionalDefPen) ? sValuesDefPenAdditional[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.DEF_PEN.buff((r.defPen && x.a[Key.SPD] >= 170) ? sValuesDefPenAdditional[s] : 0, SOURCE_LC)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.defPen)} && x.SPD >= 170) {
  x.DEF_PEN += ${sValuesDefPenAdditional[s]};
}
      `
    },
  }
}
