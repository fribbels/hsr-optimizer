import {
  ConditionalActivation,
  ConditionalDataType,
  ConditionalType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import {
  DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { Source } from 'lib/optimization/buffSource'
import { ornament2p, SetKeys } from 'lib/optimization/setMatching'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const TaliaKingdomOfBanditryConditional: DynamicConditional = {
  id: 'TaliaKingdomOfBanditryConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.BE],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.TaliaKingdomOfBanditry, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 145
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.BE, 0.20, action, context, x.source(Source.TaliaKingdomOfBanditry))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_TaliaKingdomOfBanditry) >= 1 &&
  (*p_state).TaliaKingdomOfBanditryConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 145.0
) {
  (*p_state).TaliaKingdomOfBanditryConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, config)} += 0.20;
}
    `,
    )
  },
}

const info = {
  index: 6,
  setType: SetType.ORNAMENT,
  ingameId: '307',
  name: Sets.TaliaKingdomOfBanditry,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.TaliaKingdomOfBanditry)
  },
  dynamicConditionals: [TaliaKingdomOfBanditryConditional],
} as const satisfies SetConditionals

export const TaliaKingdomOfBanditry = {
  id: 'TaliaKingdomOfBanditry',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
