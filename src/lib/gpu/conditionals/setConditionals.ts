import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { p2 } from 'lib/optimization/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export const SpaceSealingStationConditional: DynamicConditional = {
  id: 'SpaceSealingStationConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  chainsTo: [Stats.ATK],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.SpaceSealingStation) && x.a[Key.SPD] >= 120
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.ATK.buffDynamic(0.12 * context.baseATK, Source.SpaceSealingStation, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional == 0.0 &&
  (*p_x).SPD >= 120
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
    return p2(x.c.sets.FleetOfTheAgeless) && x.a[Key.SPD] >= 120
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.ATK.buffDynamic(0.08 * context.baseATK, Source.FleetOfTheAgeless, action, context)
    if (x.m) {
      x.m.ATK.buffDynamic(0.08 * (context.baseATK * x.a[Key.MEMO_ATK_SCALING]), Source.FleetOfTheAgeless, action, context)
    }
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional == 0.0 &&
  (*p_x).SPD >= 120
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
    return p2(x.c.sets.BelobogOfTheArchitects) && x.a[Key.EHR] >= 0.50
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.DEF.buffDynamic(0.15 * context.baseDEF, Source.BelobogOfTheArchitects, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional == 0.0 &&
  (*p_x).EHR >= 0.50
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
    return p2(x.c.sets.PanCosmicCommercialEnterprise)
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
  p2((*p_x).sets.PanCosmicCommercialEnterprise) >= 1
) {
  let stateValue: f32 = (*p_state).PanCosmicCommercialEnterpriseConditional;
  let buffValue: f32 = min(0.25, 0.25 * (*p_x).EHR) * baseATK;

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
    return p2(x.c.sets.BrokenKeel) && x.a[Key.RES] >= 0.30
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.CD.buffDynamic(0.10, Source.BrokenKeel, action, context)
    if (x.m) {
      x.m.CD.buffDynamic(0.10, Source.BrokenKeel, action, context)
    }
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.BrokenKeel) >= 1 &&
  (*p_state).BrokenKeelConditional == 0.0 &&
  (*p_x).RES >= 0.30
) {
  (*p_state).BrokenKeelConditional = 1.0;
  (*p_x).CD += 0.10;
  (*p_m).CD += 0.10;
}
    `)
  },
}

export const CelestialDifferentiatorConditional: DynamicConditional = {
  id: 'CelestialDifferentiatorConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CD],
  chainsTo: [Stats.CR],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.CelestialDifferentiator) && action.setConditionals.enabledCelestialDifferentiator && x.a[Key.CD] >= 1.20
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.CR.buffDynamic(0.60, Source.CelestialDifferentiator, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.CelestialDifferentiator) >= 1 &&
  actions[(*p_state).actionIndex].setConditionals.enabledCelestialDifferentiator == true &&
  (*p_state).CelestialDifferentiatorConditional == 0.0 &&
  (*p_x).CD >= 1.20
) {
  (*p_state).CelestialDifferentiatorConditional = 1.0;
  (*p_x).CR += 0.60;
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
    return p2(x.c.sets.TaliaKingdomOfBanditry) && x.a[Key.SPD] >= 145
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.BE.buffDynamic(0.20, Source.TaliaKingdomOfBanditry, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.TaliaKingdomOfBanditry) >= 1 &&
  (*p_state).TaliaKingdomOfBanditryConditional == 0.0 &&
  (*p_x).SPD >= 145
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
    return p2(x.c.sets.GiantTreeOfRaptBrooding) && x.a[Key.SPD] >= 135
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.OHB.buffDynamic(0.12, Source.GiantTreeOfRaptBrooding, action, context)
    x.m.OHB.buffDynamic(0.12, Source.GiantTreeOfRaptBrooding, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding135Conditional == 0.0 &&
  (*p_x).SPD >= 135
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
    return p2(x.c.sets.GiantTreeOfRaptBrooding) && x.a[Key.SPD] >= 180
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.OHB.buffDynamic(0.08, Source.GiantTreeOfRaptBrooding, action, context)
    x.m.OHB.buffDynamic(0.08, Source.GiantTreeOfRaptBrooding, action, context)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.GiantTreeOfRaptBrooding) >= 1 &&
  (*p_state).GiantTreeOfRaptBrooding180Conditional == 0.0 &&
  (*p_x).SPD >= 180
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
    return p2(x.c.sets.BoneCollectionsSereneDemesne) && x.a[Key.HP] >= 5000
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    x.CD.buffBaseDual(0.28, Source.BoneCollectionsSereneDemesne)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.BoneCollectionsSereneDemesne) >= 1 &&
  (*p_state).BoneCollectionsSereneDemesneConditional == 0.0 &&
  (*p_x).HP >= 5000
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
  CelestialDifferentiatorConditional,
  TaliaKingdomOfBanditryConditional,
  GiantTreeOfRaptBrooding135Conditional,
  GiantTreeOfRaptBrooding180Conditional,
  BoneCollectionsSereneDemesneConditional,
]
