import i18next from 'i18next'
import {
  ConditionalActivation,
  ConditionalDataType,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  type DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
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
  index: 29,
  setType: SetType.ORNAMENT,
  ingameId: '330',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const SubspaceASCCenterConditional: DynamicConditional = {
  id: 'SubspaceASCCenterConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.BE],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.SubspaceASCCenter, x.c.setMatches) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 145
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.BE, 0.15, action, context, x.targets(TargetTag.FullTeam).source(Source.SubspaceASCCenter))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_SubspaceASCCenter) &&
  (*p_state).SubspaceASCCenterConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 145.0
) {
  (*p_state).SubspaceASCCenterConditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.BE, 0.15).targets(TargetTag.FullTeam).wgsl(action)}
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.SubspaceASCCenter)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, SubspaceASCCenter),
  ],
  dynamicConditionals: [SubspaceASCCenterConditional],
  teammate: [{
    value: Sets.SubspaceASCCenter,
    label: () => 'Subspace ASC Center (145 SPD)',
    desc: () => i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.BE, 0.15, x.targets(TargetTag.FullTeam).source(Source.SubspaceASCCenter))
    },
  }],
}

export const SubspaceASCCenter = {
  id: Sets.SubspaceASCCenter,
  setKey: 'SubspaceASCCenter',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
