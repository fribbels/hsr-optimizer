import {
  ConditionalActivation,
  ConditionalDataType,
  ConditionalType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import {
  BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  ornament2p,
  SetKeys,
} from 'lib/optimization/setMatching'
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

const info = {
  index: 0,
  setType: SetType.ORNAMENT,
  ingameId: '301',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const SpaceSealingStationConditional: DynamicConditional = {
  id: 'SpaceSealingStationConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.SpaceSealingStation, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 120
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseAtk = action.config.selfEntity.baseAtk
    x.buffDynamic(StatKey.ATK, 0.12 * baseAtk, action, context, x.source(Source.SpaceSealingStation))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 120.0
) {
  (*p_state).SpaceSealingStationConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} += 0.12 * ${config.selfEntity.baseAtk};
}
    `,
    )
  },
}
const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.SpaceSealingStation)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, SpaceSealingStation),
  ],
  dynamicConditionals: [SpaceSealingStationConditional],
}

export const SpaceSealingStation = {
  id: Sets.SpaceSealingStation,
  setKey: 'SpaceSealingStation',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
