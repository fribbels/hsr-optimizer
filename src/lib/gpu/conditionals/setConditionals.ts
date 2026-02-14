import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import {
  DynamicConditional,
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { Source } from 'lib/optimization/buffSource'
import { p2 } from 'lib/optimization/calculateStats'
import { SetKeys } from 'lib/optimization/config/setsConfig'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SpaceSealingStationConditional: DynamicConditional = {
  id: 'SpaceSealingStationConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.SpaceSealingStation, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 120
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseAtk = x.getActionValueByIndex(StatKey.BASE_ATK, SELF_ENTITY_INDEX)
    x.buffDynamic(StatKey.ATK, 0.12 * baseAtk, action, context, x.source(Source.SpaceSealingStation))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  p2((*p_sets).SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 120.0
) {
  (*p_state).SpaceSealingStationConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} += 0.12 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_ATK, config)};
}
    `,
    )
  },
}

export const FleetOfTheAgelessConditional: DynamicConditional = {
  id: 'FleetOfTheAgelessConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.FleetOfTheAgeless, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 120
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseAtk = x.getActionValueByIndex(StatKey.BASE_ATK, SELF_ENTITY_INDEX)
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
  p2((*p_sets).FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 120.0
) {
  (*p_state).FleetOfTheAgelessConditional${action.actionIdentifier} = 1.0;
  ${buff.action(StatKey.ATK, `0.08 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_ATK, config)}`).targets(TargetTag.SelfAndMemosprite).wgsl(action)}
}
    `,
    )
  },
}

export const BelobogOfTheArchitectsConditional: DynamicConditional = {
  id: 'BelobogOfTheArchitectsConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.DEF],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BelobogOfTheArchitects, x.c.sets) && x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX) >= 0.50
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    const baseDef = x.getActionValueByIndex(StatKey.BASE_DEF, SELF_ENTITY_INDEX)
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
  p2((*p_sets).BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)} >= 0.50
) {
  (*p_state).BelobogOfTheArchitectsConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, config)} += 0.15 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_DEF, config)};
}
    `,
    )
  },
}

export const PanCosmicCommercialEnterpriseConditional: DynamicConditional = {
  id: 'PanCosmicCommercialEnterpriseConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.ATK],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.PanCosmicCommercialEnterprise, x.c.sets)
  },
  effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    const stateValue = action.conditionalState[this.id] || 0
    const ehr = x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX)
    const baseAtk = x.getActionValueByIndex(StatKey.BASE_ATK, SELF_ENTITY_INDEX)
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
  p2((*p_sets).PanCosmicCommercialEnterprise) >= 1
) {
  let stateValue: f32 = (*p_state).PanCosmicCommercialEnterpriseConditional${action.actionIdentifier};
  let buffValue: f32 = min(0.25, 0.25 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, config)}) * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BASE_ATK, config)};

  (*p_state).PanCosmicCommercialEnterpriseConditional${action.actionIdentifier} = buffValue;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} += buffValue - stateValue;
}
    `,
    )
  },
}

export const BrokenKeelConditional: DynamicConditional = {
  id: 'BrokenKeelConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.RES],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BrokenKeel, x.c.sets) && x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX) >= 0.30
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
  p2((*p_sets).BrokenKeel) >= 1 &&
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

export const TaliaKingdomOfBanditryConditional: DynamicConditional = {
  id: 'TaliaKingdomOfBanditryConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.BE],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.TaliaKingdomOfBanditry, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 145
  },
  effect: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    x.buffDynamic(StatKey.BE, 0.20, action, context, x.source(Source.TaliaKingdomOfBanditry))
  },
  gpu: function(action: OptimizerAction, context: OptimizerContext) {
    const config = action.config

    return newConditionalWgslWrapper(
      this,
      action,
      context,
      `
if (
  p2((*p_sets).TaliaKingdomOfBanditry) >= 1 &&
  (*p_state).TaliaKingdomOfBanditryConditional${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, config)} >= 145.0
) {
  (*p_state).TaliaKingdomOfBanditryConditional${action.actionIdentifier} = 1.0;
  ${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, config)} += 0.20;
}
    `,
    )
  },
}

export const GiantTreeOfRaptBrooding135Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding135Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 135
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
  p2((*p_sets).GiantTreeOfRaptBrooding) >= 1 &&
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

export const GiantTreeOfRaptBrooding180Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding180Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 180
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
  p2((*p_sets).GiantTreeOfRaptBrooding) >= 1 &&
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

export const BoneCollectionsSereneDemesneConditional: DynamicConditional = {
  id: 'BoneCollectionsSereneDemesneConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.HP],
  chainsTo: [Stats.CD],
  condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BoneCollectionsSereneDemesne, x.c.sets) && x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX) >= 5000
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
  p2((*p_sets).BoneCollectionsSereneDemesne) >= 1 &&
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

export const ConditionalSets = [
  SpaceSealingStationConditional,
  FleetOfTheAgelessConditional,
  BelobogOfTheArchitectsConditional,
  PanCosmicCommercialEnterpriseConditional,
  BrokenKeelConditional,
  TaliaKingdomOfBanditryConditional,
  GiantTreeOfRaptBrooding135Conditional,
  GiantTreeOfRaptBrooding180Conditional,
  BoneCollectionsSereneDemesneConditional,
]
