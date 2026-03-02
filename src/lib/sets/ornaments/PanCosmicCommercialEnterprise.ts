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
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { Source } from 'lib/optimization/buffSource'
import { ornament2p } from 'lib/optimization/calculateStats'
import { SetKeys } from 'lib/optimization/config/setsConfig'
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
  SetType,
} from 'types/setConfig'

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
  dynamicConditionals: [PanCosmicCommercialEnterpriseConditional],
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
}

export const PanCosmicCommercialEnterprise: SetConfig = {
  id: 'PanCosmicCommercialEnterprise',
  info: {
    index: 2,
    setType: SetType.ORNAMENT,
  },
  conditionals,
  display,
}
