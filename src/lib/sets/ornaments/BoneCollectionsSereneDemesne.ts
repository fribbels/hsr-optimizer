import {
  ConditionalActivation,
  ConditionalDataType,
  ConditionalType,
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
} from 'types/setConfig'

const BoneCollectionsSereneDemesneConditional: DynamicConditional = {
  id: 'BoneCollectionsSereneDemesneConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.HP],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.BoneCollectionsSereneDemesne, x.c.sets) && x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX) >= 5000
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.CD, 0.28, action, context, x.targets(TargetTag.SelfAndMemosprite).source(Source.BoneCollectionsSereneDemesne))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_BoneCollectionsSereneDemesne) >= 1 &&
  (*p_state).BoneCollectionsSereneDemesneConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.HP, config)} >= 5000.0
) {
  (*p_state).BoneCollectionsSereneDemesneConditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.CD, 0.28).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.BoneCollectionsSereneDemesne)
  },
  dynamicConditionals: [BoneCollectionsSereneDemesneConditional],
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const BoneCollectionsSereneDemesne: SetConfig = {
  id: 'BoneCollectionsSereneDemesne',
  info: {
    index: 18,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
