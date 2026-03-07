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
  index: 24,
  setType: SetType.ORNAMENT,
  ingameId: '325',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const PunklordeStageZeroConditional40: DynamicConditional = {
  id: 'PunklordeStageZeroConditional40',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.Elation],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.PunklordeStageZero, x.c.sets) && x.getActionValueByIndex(StatKey.ELATION, SELF_ENTITY_INDEX) >= 0.40
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.CD, 0.20, action, context, x.source(Source.PunklordeStageZero))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_PunklordeStageZero) >= 1 &&
  (*p_state).PunklordeStageZeroConditional40${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ELATION, config)} >= 0.40
) {
  (*p_state).PunklordeStageZeroConditional40${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += 0.20;
}
    `,
    )
  },
}

const PunklordeStageZeroConditional80: DynamicConditional = {
  id: 'PunklordeStageZeroConditional80',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.Elation],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.PunklordeStageZero, x.c.sets) && x.getActionValueByIndex(StatKey.ELATION, SELF_ENTITY_INDEX) >= 0.80
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.CD, 0.12, action, context, x.source(Source.PunklordeStageZero))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_PunklordeStageZero) >= 1 &&
  (*p_state).PunklordeStageZeroConditional80${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ELATION, config)} >= 0.80
) {
  (*p_state).PunklordeStageZeroConditional80${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += 0.12;
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ELATION.buff(0.08, Source.PunklordeStageZero)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ELATION, 0.08, PunklordeStageZero),
  ],
  dynamicConditionals: [PunklordeStageZeroConditional40, PunklordeStageZeroConditional80],
}

export const PunklordeStageZero = {
  id: Sets.PunklordeStageZero,
  setKey: 'PunklordeStageZero',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
