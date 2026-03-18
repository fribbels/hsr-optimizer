import {
  ConditionalActivation,
  ConditionalDataType,
  ConditionalType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  type DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  ornament2p,
  SetKeys,
} from 'lib/optimization/setMatching'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 3,
  setType: SetType.ORNAMENT,
  ingameId: '304',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const BelobogOfTheArchitectsConditional: DynamicConditional = {
  id: 'BelobogOfTheArchitectsConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.DEF],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.BelobogOfTheArchitects, x.c.sets) && x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) >= 0.50
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseDef = action.config.selfEntity.baseDef
    x.buffDynamic(StatKey.DEF, 0.15 * baseDef, action, context, x.source(Source.BelobogOfTheArchitects))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)} >= 0.50
) {
  (*p_state).BelobogOfTheArchitectsConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, config)} += 0.15 * ${config.selfEntity.baseDef};
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.DEF_P.buff(0.15, Source.BelobogOfTheArchitects)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.DEF_P, 0.15, BelobogOfTheArchitects),
  ],
  dynamicConditionals: [BelobogOfTheArchitectsConditional],
}

export const BelobogOfTheArchitects = {
  id: Sets.BelobogOfTheArchitects,
  setKey: 'BelobogOfTheArchitects',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
