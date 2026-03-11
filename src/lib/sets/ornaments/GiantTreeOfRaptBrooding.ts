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
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  index: 19,
  setType: SetType.ORNAMENT,
  ingameId: '320',
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const GiantTreeOfRaptBrooding135Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding135Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 135
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.OHB, 0.12, action, context, x.targets(TargetTag.SelfAndMemosprite).source(Source.GiantTreeOfRaptBrooding))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding135Conditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 135.0
) {
  (*p_state).GiantTreeOfRaptBrooding135Conditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.OHB, 0.12).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

const GiantTreeOfRaptBrooding180Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding180Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 180
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.OHB, 0.08, action, context, x.targets(TargetTag.SelfAndMemosprite).source(Source.GiantTreeOfRaptBrooding))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding180Conditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 180.0
) {
  (*p_state).GiantTreeOfRaptBrooding180Conditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.OHB, 0.08).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.GiantTreeOfRaptBrooding)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, GiantTreeOfRaptBrooding),
  ],
  dynamicConditionals: [GiantTreeOfRaptBrooding135Conditional, GiantTreeOfRaptBrooding180Conditional],
}

export const GiantTreeOfRaptBrooding = {
  id: Sets.GiantTreeOfRaptBrooding,
  setKey: 'GiantTreeOfRaptBrooding',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
