import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { Source } from 'lib/optimization/buffSource'
import { p2 } from 'lib/optimization/calculateStats'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { SetKeys } from 'lib/optimization/config/setsConfig'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export const SpaceSealingStationConditional: DynamicConditional = {
  id: 'SpaceSealingStationConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.SpaceSealingStation, x.c.sets) && x.a[Key.SPD] >= 120
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.ATK.buffDynamic(0.12 * context.baseATK, Source.SpaceSealingStation, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional == 0.0 &&
  x.SPD >= 120
) {
  (*p_state).SpaceSealingStationConditional = 1.0;
  (*p_x).ATK += 0.12 * baseATK;
}
    `)
  },
}

export const FleetOfTheAgelessConditional: DynamicConditional = {
  id: 'FleetOfTheAgelessConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.FleetOfTheAgeless, x.c.sets) && x.a[Key.SPD] >= 120
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.ATK.buffDynamic(0.08 * x.a[Key.BASE_ATK], Source.FleetOfTheAgeless, action, context)
    if (x.a[Key.MEMOSPRITE]) {
      x.m.ATK.buffDynamic(0.08 * x.a[Key.BASE_ATK], Source.FleetOfTheAgeless, action, context)
    }
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional == 0.0 &&
  x.SPD >= 120
) {
  (*p_state).FleetOfTheAgelessConditional = 1.0;
  (*p_x).ATK += 0.08 * baseATK;
  (*p_m).ATK += 0.08 * baseATK;
}
    `)
  },
}

export const BelobogOfTheArchitectsConditional: DynamicConditional = {
  id: 'BelobogOfTheArchitectsConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.DEF],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BelobogOfTheArchitects, x.c.sets) && x.a[Key.EHR] >= 0.50
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.DEF.buffDynamic(0.15 * context.baseDEF, Source.BelobogOfTheArchitects, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional == 0.0 &&
  x.EHR >= 0.50
) {
  (*p_state).BelobogOfTheArchitectsConditional = 1.0;
  (*p_x).DEF += 0.15 * baseDEF;
}
    `)
  },
}

export const PanCosmicCommercialEnterpriseConditional: DynamicConditional = {
  id: 'PanCosmicCommercialEnterpriseConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  chainsTo: [Stats.ATK],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.PanCosmicCommercialEnterprise, x.c.sets)
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    const stateValue = action.conditionalState[this.id] || 0
    const buffValue = Math.min(0.25, 0.25 * x.a[Key.EHR]) * context.baseATK

    action.conditionalState[this.id] = buffValue
    x.ATK.buffDynamic(buffValue - stateValue, Source.PanCosmicCommercialEnterprise, action, context)

    return buffValue
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).PanCosmicCommercialEnterprise) >= 1
) {
  let stateValue: f32 = (*p_state).PanCosmicCommercialEnterpriseConditional;
  let buffValue: f32 = min(0.25, 0.25 * x.EHR) * baseATK;

  (*p_state).PanCosmicCommercialEnterpriseConditional = buffValue;
  (*p_x).ATK += buffValue - stateValue;
}
    `)
  },
}

export const BrokenKeelConditional: DynamicConditional = {
  id: 'BrokenKeelConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.RES],
  chainsTo: [Stats.CD],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BrokenKeel, x.c.sets) && x.a[Key.RES] >= 0.30
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.CD.buffDynamic(0.10, Source.BrokenKeel, action, context)
    if (x.a[Key.MEMOSPRITE]) {
      x.m.CD.buffDynamic(0.10, Source.BrokenKeel, action, context)
    }
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).BrokenKeel) >= 1 &&
  (*p_state).BrokenKeelConditional == 0.0 &&
  x.RES >= 0.30
) {
  (*p_state).BrokenKeelConditional = 1.0;
  (*p_x).CD += 0.10;
  (*p_m).CD += 0.10;
}
    `)
  },
}

export const TaliaKingdomOfBanditryConditional: DynamicConditional = {
  id: 'TaliaKingdomOfBanditryConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.BE],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.TaliaKingdomOfBanditry, x.c.sets) && x.a[Key.SPD] >= 145
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.BE.buffDynamic(0.20, Source.TaliaKingdomOfBanditry, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).TaliaKingdomOfBanditry) >= 1 &&
  (*p_state).TaliaKingdomOfBanditryConditional == 0.0 &&
  x.SPD >= 145
) {
  (*p_state).TaliaKingdomOfBanditryConditional = 1.0;
  (*p_x).BE += 0.20;
}
    `)
  },
}

export const GiantTreeOfRaptBrooding135Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding135Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.a[Key.SPD] >= 135
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.OHB.buffDynamic(0.12, Source.GiantTreeOfRaptBrooding, action, context)
    x.m.OHB.buffDynamic(0.12, Source.GiantTreeOfRaptBrooding, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding135Conditional == 0.0 &&
  x.SPD >= 135
) {
  (*p_state).GiantTreeOfRaptBrooding135Conditional = 1.0;
  (*p_x).OHB += 0.12;
  (*p_m).OHB += 0.12;
}
    `)
  },
}

export const GiantTreeOfRaptBrooding180Conditional: DynamicConditional = {
  id: 'GiantTreeOfRaptBrooding180Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.OHB],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.GiantTreeOfRaptBrooding, x.c.sets) && x.a[Key.SPD] >= 180
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.OHB.buffDynamic(0.08, Source.GiantTreeOfRaptBrooding, action, context)
    x.m.OHB.buffDynamic(0.08, Source.GiantTreeOfRaptBrooding, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding180Conditional == 0.0 &&
  x.SPD >= 180
) {
  (*p_state).GiantTreeOfRaptBrooding180Conditional = 1.0;
  (*p_x).OHB += 0.08;
  (*p_m).OHB += 0.08;
}
    `)
  },
}

export const BoneCollectionsSereneDemesneConditional: DynamicConditional = {
  id: 'BoneCollectionsSereneDemesneConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.HP],
  chainsTo: [Stats.CD],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(SetKeys.BoneCollectionsSereneDemesne, x.c.sets) && x.a[Key.HP] >= 5000
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.CD.buffBaseDualDynamic(0.28, Source.BoneCollectionsSereneDemesne, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).BoneCollectionsSereneDemesne) >= 1 &&
  (*p_state).BoneCollectionsSereneDemesneConditional == 0.0 &&
  x.HP >= 5000
) {
  (*p_state).BoneCollectionsSereneDemesneConditional = 1.0;
  (*p_x).CD += 0.28;
  (*p_m).CD += 0.28;
}
    `)
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
