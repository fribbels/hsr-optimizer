import { Stats } from "lib/constants";
import { BASIC_TYPE, BREAK_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, SUPER_BREAK_TYPE, ULT_TYPE } from "lib/conditionals/conditionalConstants";
import { buffAbilityDefShred, buffAbilityDmg } from "lib/optimizer/calculateBuffs";
import { buffStat, conditionalWgslWrapper, NewConditional } from "lib/gpu/conditionals/newConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { p2 } from "lib/optimizer/optimizerUtils";
import { Form } from "types/Form";

export const ConditionalType = {
  SET: 0,
  ABILITY: 1,
}

export const ConditionalActivation = {
  SINGLE: 0,
  CONTINUOUS: 1,
}

export const RutilantArenaConditional: NewConditional = {
  id: "RutilantArenaConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.70
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, 0.20)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.RutilantArena) >= 1 &&
  (*p_state).RutilantArenaConditional == 0.0 &&
  (*p_x).CR > 0.70
) {
  (*p_state).RutilantArenaConditional = 1.0;

  buffAbilityDmg(p_x, BASIC_TYPE | SKILL_TYPE, 0.20, 1);
}
    `)
  }
}

export const InertSalsottoConditional: NewConditional = {
  id: "InertSalsottoConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, ULT_TYPE | FUA_TYPE, 0.15)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.InertSalsotto) >= 1 &&
  (*p_state).InertSalsottoConditional == 0.0 &&
  (*p_x).CR > 0.50
) {
  (*p_state).InertSalsottoConditional = 1.0;

  buffAbilityDmg(p_x, ULT_TYPE | FUA_TYPE, 0.15, 1);
}
    `)
  }
}

export const SpaceSealingStationConditional: NewConditional = {
  id: "SpaceSealingStationConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 120
  },
  effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
    buffStat(x, request, params, Stats.ATK, 0.12 * params.baseATK)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional == 0.0 &&
  (*p_x).SPD >= 120
) {
  (*p_state).SpaceSealingStationConditional = 1.0;
  buffDynamicATK_P(0.12, p_x, p_state);
}
    `)
  }
}

export const FleetOfTheAgelessConditional: NewConditional = {
  id: "FleetOfTheAgelessConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 120
  },
  effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
    buffStat(x, request, params, Stats.ATK, 0.08 * params.baseATK)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional == 0.0 &&
  (*p_x).SPD >= 120
) {
  (*p_state).FleetOfTheAgelessConditional = 1.0;
  buffDynamicATK_P(0.08, p_x, p_state);
}
    `)
  }
}

export const BelobogOfTheArchitectsConditional: NewConditional = {
  id: "BelobogOfTheArchitectsConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.EHR] >= 0.50
  },
  effect: (x: ComputedStatsObject, request: Form, params: OptimizerParams) => {
    buffStat(x, request, params, Stats.DEF, 0.15 * params.baseDEF)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional == 0.0 &&
  (*p_x).EHR >= 0.50
) {
  (*p_state).BelobogOfTheArchitectsConditional = 1.0;
  buffDynamicDEF_P(0.15, p_x, p_state);
}
    `)
  }
}

export const IronCavalryAgainstTheScourge150Conditional: NewConditional = {
  id: "IronCavalryAgainstTheScourge150Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.BE] >= 1.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDefShred(x, BREAK_TYPE, 0.10)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_x).sets.IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge150Conditional == 0.0 &&
  (*p_x).BE >= 1.50
) {
  (*p_state).IronCavalryAgainstTheScourge150Conditional = 1.0;
  buffAbilityDefShred(p_x, BREAK_TYPE, 0.10, 1);
}
    `)
  }
}

export const IronCavalryAgainstTheScourge250Conditional: NewConditional = {
  id: "IronCavalryAgainstTheScourge250Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.BE],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.BE] >= 2.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDefShred(x, SUPER_BREAK_TYPE, 0.15)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_x).sets.IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge250Conditional == 0.0 &&
  (*p_x).BE >= 2.50
) {
  (*p_state).IronCavalryAgainstTheScourge250Conditional = 1.0;
  buffAbilityDefShred(p_x, SUPER_BREAK_TYPE, 0.15, 1);
}
    `)
  }
}

export const PanCosmicCommercialEnterpriseConditional: NewConditional = {
  id: "PanCosmicCommercialEnterpriseConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.CONTINUOUS,
  dependsOn: [Stats.EHR],
  condition: function () {
    return true
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    const stateValue = params.conditionalState[this.id] || 0
    const buffValue = Math.min(0.25, 0.25 * x[Stats.EHR]) * params.baseATK

    params.conditionalState[this.id] = buffValue
    buffStat(x, request, params, Stats.ATK, buffValue - stateValue)

    return buffValue;
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.PanCosmicCommercialEnterprise) >= 1
) {
  let stateValue: f32 = (*p_state).PanCosmicCommercialEnterpriseConditional;
  let buffValue: f32 = min(0.25, 0.25 * (*p_x).EHR) * baseATK;

  (*p_state).PanCosmicCommercialEnterpriseConditional = buffValue;
  buffDynamicATK(buffValue - stateValue, p_x, p_state);
}
    `)
  }
}

export const BrokenKeelConditional: NewConditional = {
  id: "BrokenKeelConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.EHR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.RES] >= 0.30
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    buffStat(x, request, params, Stats.CD, 0.10)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.BrokenKeel) >= 1 &&
  (*p_x).RES >= 0.30
) {
  (*p_state).BrokenKeelConditional = 1.0;
  buffDynamicCD(0.10, p_x, p_state);
}
    `)
  }
}

export const CelestialDifferentiatorConditional: NewConditional = {
  id: "CelestialDifferentiatorConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.CD],
  condition: function (x: ComputedStatsObject) {
    return p2(x.sets.CelestialDifferentiator) >= 1 && x[Stats.CD] >= 1.20
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    buffStat(x, request, params, Stats.CR, 0.60)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.CelestialDifferentiator) >= 1 &&
  (*p_x).CD >= 1.20
) {
  (*p_state).CelestialDifferentiatorConditional = 1.0;
  buffDynamicCR(0.60, p_x, p_state);
}
    `)
  }
}

export const TaliaKingdomOfBanditryConditional: NewConditional = {
  id: "TaliaKingdomOfBanditryConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 145
  },
  effect: function (x: ComputedStatsObject, request: Form, params: OptimizerParams) {
    buffStat(x, request, params, Stats.BE, 0.20)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.TaliaKingdomOfBanditry) >= 1 &&
  (*p_x).SPD >= 145
) {
  (*p_state).TaliaKingdomOfBanditryConditional = 1.0;
  buffDynamicBE(0.20, p_x, p_state);
}
    `)
  }
}

export const FirmamentFrontlineGlamoth135Conditional: NewConditional = {
  id: "FirmamentFrontlineGlamoth135Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 135
  },
  effect: function (x: ComputedStatsObject) {
    x.ELEMENTAL_DMG += 0.12
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FirmamentFrontlineGlamoth) >= 1 &&
  (*p_x).SPD >= 135
) {
  (*p_state).FirmamentFrontlineGlamoth135Conditional = 1.0;
  (*p_x).ELEMENTAL_DMG += 0.12;
}
    `)
  }
}

export const FirmamentFrontlineGlamoth160Conditional: NewConditional = {
  id: "FirmamentFrontlineGlamoth160Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  dependsOn: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 160
  },
  effect: function (x: ComputedStatsObject) {
    x.ELEMENTAL_DMG += 0.06
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_x).sets.FirmamentFrontlineGlamoth) >= 1 &&
  (*p_x).SPD >= 160
) {
  (*p_state).FirmamentFrontlineGlamoth160Conditional = 1.0;
  (*p_x).ELEMENTAL_DMG += 0.06;
}
    `)
  }
}

// Fire set

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
