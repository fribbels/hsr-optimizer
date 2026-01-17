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
import {
  DamageTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SailingTowardsASecondLife')
  const { SOURCE_LC } = Source.lightCone('23027')

  const sValuesSpdBuff = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesDefShred = [0.20, 0.23, 0.26, 0.29, 0.32]

  const defaults = {
    breakDmgDefShred: true,
    spdBuffConditional: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgDefShred: {
      lc: true,
      id: 'breakDmgDefShred',
      formItem: 'switch',
      text: t('Content.breakDmgDefShred.text'),
      content: t('Content.breakDmgDefShred.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
    },
    spdBuffConditional: {
      lc: true,
      id: 'spdBuffConditional',
      formItem: 'switch',
      text: t('Content.spdBuffConditional.text'),
      content: t('Content.spdBuffConditional.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, (r.breakDmgDefShred) ? sValuesDefShred[s] : 0, x.damageType(DamageTag.BREAK).source(SOURCE_LC))
    },
    dynamicConditionals: [
      {
        id: 'SailingTowardsASecondLifeConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.BE],
        chainsTo: [Stats.SPD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return r.spdBuffConditional && x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 1.50
        },
        effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
          x.buffDynamic(StatKey.SPD, sValuesSpdBuff[s] * context.baseSPD, action, context, x.source(SOURCE_LC))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.lightConeConditionals as Conditionals<typeof content>

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${wgslFalse(r.spdBuffConditional)}) {
  return;
}

if (
  (*p_state).SailingTowardsASecondLifeConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)} >= 1.50
) {
  (*p_state).SailingTowardsASecondLifeConditional${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} += ${sValuesSpdBuff[s]} * baseSPD;
}
    `,
          )
        },
      },
    ],
  }
}
