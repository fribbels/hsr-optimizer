import { BASIC_DMG_TYPE, BREAK_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE, SUPER_BREAK_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { conditionalWgslWrapper, DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityDefPen, buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { p2, p4 } from 'lib/optimization/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export const RutilantArenaConditional: DynamicConditional = {
  id: 'RutilantArenaConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CR],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.RutilantArena) && x.a[Key.CR] >= 0.70
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.RutilantArena)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.RutilantArena) >= 1 &&
  (*p_state).RutilantArenaConditional == 0.0 &&
  (*p_x).CR >= 0.70
) {
  (*p_state).RutilantArenaConditional = 1.0;

  buffAbilityDmg(p_x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, 1);
}
    `)
  },
}

export const InertSalsottoConditional: DynamicConditional = {
  id: 'InertSalsottoConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CR],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.InertSalsotto) && x.a[Key.CR] >= 0.50
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    buffAbilityDmg(x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, Source.InertSalsotto)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.InertSalsotto) >= 1 &&
  (*p_state).InertSalsottoConditional == 0.0 &&
  (*p_x).CR >= 0.50
) {
  (*p_state).InertSalsottoConditional = 1.0;

  buffAbilityDmg(p_x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, 1);
}
    `)
  },
}

export const SpaceSealingStationConditional: DynamicConditional = {
  id: 'SpaceSealingStationConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
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
  buffNonDynamicATK_P(0.12, p_x, p_m, p_state);
}
    `)
  },
}

export const FleetOfTheAgelessConditional: DynamicConditional = {
  id: 'FleetOfTheAgelessConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
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
  buffNonDynamicATK_P(0.08, p_x, p_m, p_state);
  buffMemoNonDynamicATK_P(0.08, p_x, p_m, p_state);
}
    `)
  },
}

export const BelobogOfTheArchitectsConditional: DynamicConditional = {
  id: 'BelobogOfTheArchitectsConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
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
  buffNonDynamicDEF_P(0.15, p_x, p_m, p_state);
}
    `)
  },
}

export const IronCavalryAgainstTheScourge150Conditional: DynamicConditional = {
  id: 'IronCavalryAgainstTheScourge150Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p4(x.c.sets.IronCavalryAgainstTheScourge) && x.a[Key.BE] >= 1.50
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    buffAbilityDefPen(x, BREAK_DMG_TYPE, 0.10, Source.IronCavalryAgainstTheScourge)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_x).sets.IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge150Conditional == 0.0 &&
  (*p_x).BE >= 1.50
) {
  (*p_state).IronCavalryAgainstTheScourge150Conditional = 1.0;
  buffAbilityDefShred(p_x, BREAK_DMG_TYPE, 0.10, 1);
}
    `)
  },
}

export const IronCavalryAgainstTheScourge250Conditional: DynamicConditional = {
  id: 'IronCavalryAgainstTheScourge250Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p4(x.c.sets.IronCavalryAgainstTheScourge) && x.a[Key.BE] >= 2.50
  },
  effect: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    buffAbilityDefPen(x, SUPER_BREAK_DMG_TYPE, 0.15, Source.IronCavalryAgainstTheScourge)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_x).sets.IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge250Conditional == 0.0 &&
  (*p_x).BE >= 2.50
) {
  (*p_state).IronCavalryAgainstTheScourge250Conditional = 1.0;
  buffAbilityDefShred(p_x, SUPER_BREAK_DMG_TYPE, 0.15, 1);
}
    `)
  },
}

export const PanCosmicCommercialEnterpriseConditional: DynamicConditional = {
  id: 'PanCosmicCommercialEnterpriseConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
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
  buffNonDynamicATK(buffValue - stateValue, p_x, p_m, p_state);
}
    `)
  },
}

export const BrokenKeelConditional: DynamicConditional = {
  id: 'BrokenKeelConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.RES],
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
  buffNonDynamicCD(0.10, p_x, p_m, p_state);
  buffMemoNonDynamicCD(0.10, p_x, p_m, p_state);
}
    `)
  },
}

export const CelestialDifferentiatorConditional: DynamicConditional = {
  id: 'CelestialDifferentiatorConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CD],
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
  buffNonDynamicCR(0.60, p_x, p_m, p_state);
}
    `)
  },
}

export const TaliaKingdomOfBanditryConditional: DynamicConditional = {
  id: 'TaliaKingdomOfBanditryConditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
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
  buffNonDynamicBE(0.20, p_x, p_m, p_state);
}
    `)
  },
}

export const FirmamentFrontlineGlamoth135Conditional: DynamicConditional = {
  id: 'FirmamentFrontlineGlamoth135Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.FirmamentFrontlineGlamoth) && x.a[Key.SPD] >= 135
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.ELEMENTAL_DMG.buff(0.12, Source.FirmamentFrontlineGlamoth)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FirmamentFrontlineGlamoth) >= 1 &&
  (*p_state).FirmamentFrontlineGlamoth135Conditional == 0.0 &&
  (*p_x).SPD >= 135
) {
  (*p_state).FirmamentFrontlineGlamoth135Conditional = 1.0;
  (*p_x).ELEMENTAL_DMG += 0.12;
}
    `)
  },
}

export const FirmamentFrontlineGlamoth160Conditional: DynamicConditional = {
  id: 'FirmamentFrontlineGlamoth160Conditional',
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    return p2(x.c.sets.FirmamentFrontlineGlamoth) && x.a[Key.SPD] >= 160
  },
  effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
    x.ELEMENTAL_DMG.buff(0.06, Source.FirmamentFrontlineGlamoth)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FirmamentFrontlineGlamoth) >= 1 &&
  (*p_state).FirmamentFrontlineGlamoth160Conditional == 0.0 &&
  (*p_x).SPD >= 160
) {
  (*p_state).FirmamentFrontlineGlamoth160Conditional = 1.0;
  (*p_x).ELEMENTAL_DMG += 0.06;
}
    `)
  },
}

export const ConditionalSets = [
  SpaceSealingStationConditional,
  RutilantArenaConditional,
  InertSalsottoConditional,
  FleetOfTheAgelessConditional,
  BelobogOfTheArchitectsConditional,
  IronCavalryAgainstTheScourge150Conditional,
  IronCavalryAgainstTheScourge250Conditional,
  PanCosmicCommercialEnterpriseConditional,
  BrokenKeelConditional,
  CelestialDifferentiatorConditional,
  TaliaKingdomOfBanditryConditional,
  FirmamentFrontlineGlamoth135Conditional,
  FirmamentFrontlineGlamoth160Conditional,
]
