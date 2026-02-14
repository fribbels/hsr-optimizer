import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, (m.defPen) ? sValuesDefPen[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, (t.defPen && t.additionalDefPen) ? sValuesDefPenAdditional[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      const spd = x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)

      x.buff(StatKey.DEF_PEN, (r.defPen && spd >= 170) ? sValuesDefPenAdditional[s] : 0, x.source(SOURCE_LC))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.defPen)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 170.0) {
  ${buff.action(AKey.DEF_PEN, sValuesDefPenAdditional[s]).wgsl(action)}
}
      `
    },
  }
}
