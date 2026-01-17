import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, r.trickStacks * sValuesDmg[s], x.source(SOURCE_LC))
    },
    dynamicConditionals: [
      {
        id: 'ItsShowtimeConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) >= 0.80
        },
        effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
          x.buffDynamic(StatKey.ATK, sValuesAtkBuff[s] * context.baseATK, action, context, x.source(SOURCE_LC))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).ItsShowtimeConversionConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)} >= 0.80
) {
  (*p_state).ItsShowtimeConversionConditional${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} += ${sValuesAtkBuff[s]} * baseATK;
}
    `,
          )
        },
      },
    ],
  }
}
