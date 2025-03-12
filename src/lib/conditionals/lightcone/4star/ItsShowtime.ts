import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ItsShowtime')
  const { SOURCE_LC } = Source.lightCone('21041')

  const sValuesDmg = [0.06, 0.07, 0.08, 0.09, 0.10]
  const sValuesAtkBuff = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    trickStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    trickStacks: {
      lc: true,
      id: 'trickStacks',
      formItem: 'slider',
      text: t('Content.trickStacks.text'),
      content: t('Content.trickStacks.content', {
        DmgBuff: TsUtils.precisionRound(100 * sValuesDmg[s]),
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]),
      }),
      min: 0,
      max: 3,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff(r.trickStacks * sValuesDmg[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
    dynamicConditionals: [
      {
        id: 'ItsShowtimeConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.EHR] >= 0.80
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          x.ATK.buffDynamic(sValuesAtkBuff[s] * context.baseATK, SOURCE_LC, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (
  (*p_state).ItsShowtimeConversionConditional == 0.0 &&
  x.EHR >= 0.80
) {
  (*p_state).ItsShowtimeConversionConditional = 1.0;
  (*p_x).ATK += ${sValuesAtkBuff[s]} * baseATK;
}
    `)
        },
      },
    ],
  }
}
