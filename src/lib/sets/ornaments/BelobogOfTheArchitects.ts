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

const info = {
  index: 3,
  setType: SetType.ORNAMENT,
  ingameId: '304',
  name: Sets.BelobogOfTheArchitects,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.DEF_P.buff(0.15, Source.BelobogOfTheArchitects)
  },
  dynamicConditionals: [BelobogOfTheArchitectsConditional],
} as const satisfies SetConditionals

export const BelobogOfTheArchitects = {
  id: 'BelobogOfTheArchitects',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
