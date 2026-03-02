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
  SetType,
  TeammateOption,
} from 'types/setConfig'

const BrokenKeelConditional: DynamicConditional = {
  id: 'BrokenKeelConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.RES],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.BrokenKeel, x.c.sets) && x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX) >= 0.30
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.CD, 0.10, action, context, x.targets(TargetTag.SelfAndMemosprite).source(Source.BrokenKeel))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_BrokenKeel) >= 1 &&
  (*p_state).BrokenKeelConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.RES, config)} >= 0.30
) {
  (*p_state).BrokenKeelConditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.CD, 0.10).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.RES.buff(0.10, Source.BrokenKeel)
  },
  teammate: [{
    value: Sets.BrokenKeel,
    i18nKey: 'Keel',
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.10, x.targets(TargetTag.FullTeam).source(Source.BrokenKeel))
    },
  }],
  dynamicConditionals: [BrokenKeelConditional],
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const BrokenKeel: SetConfig = {
  id: 'BrokenKeel',
  info: {
    index: 9,
    setType: SetType.ORNAMENT,
    ingameId: '310',
  },
  conditionals,
  display,
}
