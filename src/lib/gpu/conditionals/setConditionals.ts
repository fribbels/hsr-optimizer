import { Stats } from "lib/constants";
import { BASIC_TYPE, BREAK_TYPE, ComputedStatsObject, FUA_TYPE, SKILL_TYPE, SUPER_BREAK_TYPE, ULT_TYPE } from "lib/conditionals/conditionalConstants";
import { buffAbilityDefShred, buffAbilityDmg } from "lib/optimizer/calculateBuffs";
import { buffStat, conditionalWgslWrapper, NewConditional } from "lib/gpu/conditionals/newConditionals";
import { OptimizerParams } from "lib/optimizer/calculateParams";

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
  statDependencies: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.70
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, 0.20)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).RutilantArena) >= 1 &&
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
  statDependencies: [Stats.CR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.CR] >= 0.50
  },
  effect: (x: ComputedStatsObject) => {
    buffAbilityDmg(x, ULT_TYPE | FUA_TYPE, 0.15)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).InertSalsotto) >= 1 &&
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
  statDependencies: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 120
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffStat(x, params, Stats.ATK, 0.12 * params.baseATK)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).SpaceSealingStation) >= 1 &&
  (*p_state).SpaceSealingStationConditional == 0.0 &&
  (*p_x).SPD >= 120
) {
  (*p_state).SpaceSealingStationConditional = 1.0;
  (*p_x).ATK += 0.12 * baseATK;

  evaluateDependenciesATK(p_x, p_state, p_sets);
}
    `)
  }
}

export const FleetOfTheAgelessConditional: NewConditional = {
  id: "FleetOfTheAgelessConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  statDependencies: [Stats.SPD],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.SPD] >= 120
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffStat(x, params, Stats.ATK, 0.08 * params.baseATK)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).FleetOfTheAgeless) >= 1 &&
  (*p_state).FleetOfTheAgelessConditional == 0.0 &&
  (*p_x).SPD >= 120
) {
  (*p_state).FleetOfTheAgelessConditional = 1.0;
  (*p_x).ATK += 0.08 * baseATK;

  evaluateDependenciesATK(p_x, p_state, p_sets);
}
    `)
  }
}

export const BelobogOfTheArchitectsConditional: NewConditional = {
  id: "BelobogOfTheArchitectsConditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  statDependencies: [Stats.EHR],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.EHR] >= 0.50
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffStat(x, params, Stats.DEF, 0.15 * params.baseDEF)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p2((*p_sets).BelobogOfTheArchitects) >= 1 &&
  (*p_state).BelobogOfTheArchitectsConditional == 0.0 &&
  (*p_x).EHR >= 0.50
) {
  (*p_state).BelobogOfTheArchitectsConditional = 1.0;
  (*p_x).DEF += 0.15 * baseDEF;
}
    `)
  }
}

export const IronCavalryAgainstTheScourge150Conditional: NewConditional = {
  id: "IronCavalryAgainstTheScourge250Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  statDependencies: [Stats.BE],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.BE] >= 1.50
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffAbilityDefShred(x, BREAK_TYPE, 0.10)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_sets).IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge250Conditional == 0.0 &&
  (*p_x).BE >= 2.50
) {
  (*p_state).IronCavalryAgainstTheScourge250Conditional = 1.0;
  buffAbilityDefShred(p_x, BREAK_TYPE, 0.15, 1);
}
    `)
  }
}

export const IronCavalryAgainstTheScourge250Conditional: NewConditional = {
  id: "IronCavalryAgainstTheScourge150Conditional",
  type: ConditionalType.SET,
  activation: ConditionalActivation.SINGLE,
  statDependencies: [Stats.BE],
  condition: function (x: ComputedStatsObject) {
    return x[Stats.BE] >= 2.50
  },
  effect: (x: ComputedStatsObject, params: OptimizerParams) => {
    buffAbilityDefShred(x, SUPER_BREAK_TYPE, 0.15)
  },
  gpu: function () {
    return conditionalWgslWrapper(this, `
if (
  p4((*p_sets).IronCavalryAgainstTheScourge) >= 1 &&
  (*p_state).IronCavalryAgainstTheScourge150Conditional == 0.0 &&
  (*p_x).BE >= 1.50
) {
  (*p_state).IronCavalryAgainstTheScourge150Conditional = 1.0;
  buffAbilityDefShred(p_x, SUPER_BREAK_TYPE, 0.10, 1);

  evaluateDependenciesDEF(p_x, p_state, p_sets);
}
    `)
  }
}

// x[Stats.ATK_P]
// + Math.min(0.25, 0.25 * x[Stats.EHR]) * p2(sets.PanCosmicCommercialEnterprise)
// x[Stats.CD]
//   + 0.10 * (x[Stats.RES] >= 0.30 ? 1 : 0) * p2(sets.BrokenKeel)
// x[Stats.CR]
//   + 0.60 * params.enabledCelestialDifferentiator * (x[Stats.CD] >= 1.20 ? 1 : 0) * p2(sets.CelestialDifferentiator)
// x[Stats.BE]
//   += 0.20 * (x[Stats.SPD] >= 145 ? 1 : 0) * p2(sets.TaliaKingdomOfBanditry)
// x.BREAK_DEF_PEN
//   += 0.10 * (x[Stats.BE] >= 1.50 ? 1 : 0) * p4(sets.IronCavalryAgainstTheScourge)
// x.SUPER_BREAK_DEF_PEN
//   += 0.15 * (x[Stats.BE] >= 2.50 ? 1 : 0) * p4(sets.IronCavalryAgainstTheScourge)
// x.ELEMENTAL_DMG
//   += 0.12 * (x[Stats.SPD] >= 135 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
//   + 0.06 * (x[Stats.SPD] >= 160 ? 1 : 0) * p2(sets.FirmamentFrontlineGlamoth)
// Fire set

export const ConditionalSets = [
  SpaceSealingStationConditional,
  RutilantArenaConditional,
  InertSalsottoConditional,
  FleetOfTheAgelessConditional,
  BelobogOfTheArchitectsConditional,
  IronCavalryAgainstTheScourge150Conditional,
  IronCavalryAgainstTheScourge250Conditional,
]