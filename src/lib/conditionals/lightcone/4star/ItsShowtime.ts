import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ItsShowtime')

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

      x.ELEMENTAL_DMG.buff(r.trickStacks * sValuesDmg[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
    dynamicConditionals: [
      {
        id: 'ItsShowtimeConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          return x.a[Key.EHR] >= 0.80
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          const stateValue = action.conditionalState[this.id] || 0
          const buffValue = sValuesAtkBuff[s] * context.baseATK

          action.conditionalState[this.id] = buffValue
          x.ATK.buffDynamic(buffValue - stateValue, Source.NONE, action, context)
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          return conditionalWgslWrapper(this, `
if (x.EHR < 0.80) {
  return;
}

let stateValue: f32 = (*p_state).ItsShowtimeConversionConditional;
let buffValue: f32 = ${sValuesAtkBuff[s]};

(*p_state).ItsShowtimeConversionConditional = buffValue;
buffDynamicATK_P(buffValue - stateValue, p_x, p_state);
    `)
        },
      },
    ],
  }
}
