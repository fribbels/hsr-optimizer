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
  index: 2,
  setType: SetType.ORNAMENT,
  ingameId: '303',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

// Note: The ATK from this relic set conversion is NOT unconvertible. E.g. Firefly on Pan Cosmic does convert EHR -> ATK -> BE.
const PanCosmicCommercialEnterpriseConditional: DynamicConditional = {
  id: 'PanCosmicCommercialEnterpriseConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return ornament2p(SetKeys.PanCosmicCommercialEnterprise, x.c.sets)
  },
  effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    const stateValue = action.conditionalState[this.id] || 0
    const ehr = x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX)
    const baseAtk = action.config.selfEntity.baseAtk
    const buffValue = Math.min(0.25, 0.25 * ehr) * baseAtk

    action.conditionalState[this.id] = buffValue
    x.buffDynamic(StatKey.ATK, buffValue - stateValue, action, context, x.source(Source.PanCosmicCommercialEnterprise))

    return buffValue
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  ornament2p(*p_sets, SET_PanCosmicCommercialEnterprise) >= 1
) {
  let stateValue: f32 = (*p_state).PanCosmicCommercialEnterpriseConditional${action.actionIdentifier};
  let buffValue: f32 = min(0.25, 0.25 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)}) * ${config.selfEntity.baseAtk};

  (*p_state).PanCosmicCommercialEnterpriseConditional${action.actionIdentifier} = buffValue;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} += buffValue - stateValue;
}
    `,
    )
  },
}

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.EHR.buff(0.10, Source.PanCosmicCommercialEnterprise)
  },
  gpuBasic: () => [
    basicP2(WgslStatName.EHR, 0.10, PanCosmicCommercialEnterprise),
  ],
  dynamicConditionals: [PanCosmicCommercialEnterpriseConditional],
}

export const PanCosmicCommercialEnterprise = {
  id: Sets.PanCosmicCommercialEnterprise,
  setKey: 'PanCosmicCommercialEnterprise',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
