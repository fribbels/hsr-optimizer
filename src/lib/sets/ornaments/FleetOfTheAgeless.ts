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
} from 'lib/gpu/injection/injectUtils'
import { Source } from 'lib/optimization/buffSource'
import { ornament2p, SetKeys } from 'lib/optimization/setMatching'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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

const FleetOfTheAgelessConditional: DynamicConditional = {
  id: 'FleetOfTheAgelessConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.FleetOfTheAgeless, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 120
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseAtk = action.config.selfEntity.baseAtk
    x.buffDynamic(StatKey.ATK, 0.08 * baseAtk, action, context, x.targets(TargetTag.SelfAndMemosprite).source(Source.FleetOfTheAgeless))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 120.0
) {
  (*p_state).FleetOfTheAgelessConditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.ATK, `0.08 * ${config.selfEntity.baseAtk}`).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

const info = {
  index: 1,
  setType: SetType.ORNAMENT,
  ingameId: '302',
  name: Sets.FleetOfTheAgeless,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.FleetOfTheAgeless)
  },
  dynamicConditionals: [FleetOfTheAgelessConditional],
  teammate: [{
    value: Sets.FleetOfTheAgeless,
    label: (t) => t('TeammateSets.Ageless.Text'),
    desc: (t) => t('TeammateSets.Ageless.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.ATK_P, 0.08, x.targets(TargetTag.FullTeam).source(Source.FleetOfTheAgeless))
    },
  }],
} as const satisfies SetConditionals

export const FleetOfTheAgeless = {
  id: 'FleetOfTheAgeless',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
