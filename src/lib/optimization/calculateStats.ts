import {
  BASIC_DMG_TYPE,
  BREAK_DMG_TYPE,
  DOT_DMG_TYPE,
  FUA_DMG_TYPE,
  SKILL_DMG_TYPE,
  SUPER_BREAK_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  Sets,
  Stats,
  StatsValues,
} from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BelobogOfTheArchitectsConditional,
  BoneCollectionsSereneDemesneConditional,
  BrokenKeelConditional,
  FleetOfTheAgelessConditional,
  GiantTreeOfRaptBrooding135Conditional,
  GiantTreeOfRaptBrooding180Conditional,
  PanCosmicCommercialEnterpriseConditional,
  SpaceSealingStationConditional,
  TaliaKingdomOfBanditryConditional,
} from 'lib/gpu/conditionals/setConditionals'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  buffAbilityDefPen,
  buffAbilityDmg,
} from 'lib/optimization/calculateBuffs'
import {
  buffElementalDamageType,
  ComputedStatsArray,
  Key,
  StatToKey,
} from 'lib/optimization/computedStatsArray'
import {
  OrnamentSetsConfig,
  RelicSetsConfig,
  SetKeys,
  SetKeyType,
} from 'lib/optimization/config/setsConfig'
import { SimulationRelic } from 'lib/simulations/statSimulationTypes'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

const SET_EFFECTS = new Map()

const ornamentIndexToSetConfig = Object.entries(OrnamentSetsConfig)
  .sort((a, b) => a[1].index - b[1].index)
  .map((entry) => entry[1])

const ornamentIndexToSetKey = Object.entries(OrnamentSetsConfig)
  .sort((a, b) => a[1].index - b[1].index)
  .map((entry) => entry[0]) as (keyof typeof Sets)[]

const relicIndexToSetConfig = Object.entries(RelicSetsConfig)
  .sort((a, b) => a[1].index - b[1].index)
  .map((entry) => entry[1])

const relicIndexToSetKey = Object.entries(RelicSetsConfig)
  .sort((a, b) => a[1].index - b[1].index)
  .map((entry) => entry[0]) as (keyof typeof Sets)[]

export type SetCounts = Record<keyof typeof Sets, number>

export function calculateSetCounts(
  sets: number[],
) {
  const setCounts: Record<keyof typeof Sets, number> = Object.create(null)

  for (let i = 0; i < 4; i++) {
    const key = relicIndexToSetKey[sets[i]]
    setCounts[key] = (setCounts[key] ?? 0) + 1
  }

  if (sets[4] == sets[5]) {
    setCounts[ornamentIndexToSetKey[sets[4]]] = 2
  }

  return setCounts
}

export function calculateBasicSetEffects(c: BasicStatsArray, context: OptimizerContext, setCounts: SetCounts, sets: number[]) {
  const processed: Record<number, boolean> = {}
  for (let i = 0; i < 4; i++) {
    const set = sets[i]

    if (processed[set]) continue
    processed[set] = true

    const key = relicIndexToSetKey[set]
    const count = setCounts[key] ?? 0
    if (count >= 2) {
      const config = relicIndexToSetConfig[set]

      if (count >= 2 && config.p2c) config.p2c(c, context)
      if (count >= 4 && config.p4c) config.p4c(c, context)
    }
  }

  if (sets[4] == sets[5]) {
    const config = ornamentIndexToSetConfig[sets[4]]
    config.p2c && config.p2c(c, context)
  }
}

// TODO: Cleanup
export function calculateElementalStats(c: BasicStatsArray, context: OptimizerContext) {
  const a = c.a
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
  // This is mostly because there isn't a need to split out damage types while we're calculating display stats.
  a[Key.ELEMENTAL_DMG] = 0
  switch (context.elementalDamageType) {
    case Stats.Physical_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0)
      break
    case Stats.Fire_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0)
      break
    case Stats.Ice_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0)
      break
    case Stats.Lightning_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0)
      break
    case Stats.Wind_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0)
      break
    case Stats.Quantum_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0)
      break
    case Stats.Imaginary_DMG:
      a[Key.ELEMENTAL_DMG] = sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0)
      break
  }
}

export function calculateBaseStats(c: BasicStatsArray, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces
  const a = c.a

  a[Key.SPD] = sumFlatStat(Stats.SPD, Stats.SPD_P, context.baseSPD, lc, trace, c, 0)
  a[Key.HP] = sumFlatStat(Stats.HP, Stats.HP_P, context.baseHP, lc, trace, c, 0)
  a[Key.ATK] = sumFlatStat(Stats.ATK, Stats.ATK_P, context.baseATK, lc, trace, c, 0)
  a[Key.DEF] = sumFlatStat(Stats.DEF, Stats.DEF_P, context.baseDEF, lc, trace, c, 0)
  a[Key.CR] = sumPercentStat(Stats.CR, base, lc, trace, c, 0)
  a[Key.CD] = sumPercentStat(Stats.CD, base, lc, trace, c, 0)
  a[Key.EHR] = sumPercentStat(Stats.EHR, base, lc, trace, c, 0)
  a[Key.RES] = sumPercentStat(Stats.RES, base, lc, trace, c, 0)
  a[Key.BE] = sumPercentStat(Stats.BE, base, lc, trace, c, 0)
  a[Key.ERR] = sumPercentStat(Stats.ERR, base, lc, trace, c, 0)
  a[Key.OHB] = sumPercentStat(Stats.OHB, base, lc, trace, c, 0)
}

export function calculateBasicEffects(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.calculateBasicEffects) lightConeConditionalController.calculateBasicEffects(x, action, context)
  if (characterConditionalController.calculateBasicEffects) characterConditionalController.calculateBasicEffects(x, action, context)
}

export function calculateComputedStats(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const a = x.a
  const c = x.c
  const sets = c.sets
  const setsArray = c.setsArray
  const buffs = context.combatBuffs

  // Add base to computed
  a[Key.ATK] += c.a[Key.ATK] + buffs.ATK + buffs.ATK_P * context.baseATK
  a[Key.DEF] += c.a[Key.DEF] + buffs.DEF + buffs.DEF_P * context.baseDEF
  a[Key.HP] += c.a[Key.HP] + buffs.HP + buffs.HP_P * context.baseHP
  a[Key.SPD] += c.a[Key.SPD] + buffs.SPD + buffs.SPD_P * context.baseSPD
  a[Key.CD] += c.a[Key.CD] + buffs.CD
  a[Key.CR] += c.a[Key.CR] + buffs.CR
  a[Key.BE] += c.a[Key.BE] + buffs.BE
  a[Key.EHR] += c.a[Key.EHR]
  a[Key.RES] += c.a[Key.RES]
  a[Key.ERR] += c.a[Key.ERR]
  a[Key.OHB] += c.a[Key.OHB]

  a[Key.BASE_ATK] = context.baseATK
  a[Key.BASE_DEF] = context.baseDEF
  a[Key.BASE_HP] = context.baseHP
  a[Key.BASE_SPD] = context.baseSPD

  if (x.a[Key.MEMOSPRITE]) {
    const xmc = x.m.c
    const xmca = x.m.c.a
    const xma = x.m.a
    xmca[Key.ATK] = x.a[Key.MEMO_BASE_ATK_SCALING] * c.a[Key.ATK] + x.a[Key.MEMO_BASE_ATK_FLAT]
    xmca[Key.DEF] = x.a[Key.MEMO_BASE_DEF_SCALING] * c.a[Key.DEF] + x.a[Key.MEMO_BASE_DEF_FLAT]
    xmca[Key.HP] = x.a[Key.MEMO_BASE_HP_SCALING] * c.a[Key.HP] + x.a[Key.MEMO_BASE_HP_FLAT]
    xmca[Key.SPD] = x.a[Key.MEMO_BASE_SPD_SCALING] * c.a[Key.SPD] + x.a[Key.MEMO_BASE_SPD_FLAT]

    xma[Key.BASE_ATK] = xmc.a[Key.ATK]
    xma[Key.BASE_DEF] = xmc.a[Key.DEF]
    xma[Key.BASE_HP] = xmc.a[Key.HP]
    xma[Key.BASE_SPD] = xmc.a[Key.SPD]

    xma[Key.ATK] += xmc.a[Key.ATK]
    xma[Key.DEF] += xmc.a[Key.DEF]
    xma[Key.HP] += xmc.a[Key.HP]
    xma[Key.SPD] += xmc.a[Key.SPD]
    xma[Key.CD] += c.a[Key.CD]
    xma[Key.CR] += c.a[Key.CR]
    xma[Key.BE] += c.a[Key.BE]
    xma[Key.EHR] += c.a[Key.EHR]
    xma[Key.RES] += c.a[Key.RES]
    xma[Key.ERR] += c.a[Key.ERR]
    xma[Key.OHB] += c.a[Key.OHB]
  }

  a[Key.ELEMENTAL_DMG] += buffs.DMG_BOOST
  a[Key.EFFECT_RES_PEN] += buffs.EFFECT_RES_PEN
  a[Key.VULNERABILITY] += buffs.VULNERABILITY
  a[Key.BREAK_EFFICIENCY_BOOST] += buffs.BREAK_EFFICIENCY

  buffElementalDamageType(x, context.elementalDamageType, c.a[Key.ELEMENTAL_DMG])
  if (x.a[Key.MEMOSPRITE]) {
    buffElementalDamageType(x.m, context.elementalDamageType, c.a[Key.ELEMENTAL_DMG])
  }

  // BASIC

  executeNonDynamicCombatSets(x, context, setConditionals, sets, setsArray)

  a[Key.SPD] += a[Key.SPD_P] * context.baseSPD
  a[Key.ATK] += a[Key.ATK_P] * context.baseATK
  a[Key.DEF] += a[Key.DEF_P] * context.baseDEF
  a[Key.HP] += a[Key.HP_P] * context.baseHP

  if (x.a[Key.MEMOSPRITE]) {
    const xma = x.m.a
    xma[Key.SPD] += xma[Key.SPD_P] * (xma[Key.BASE_SPD])
    xma[Key.ATK] += xma[Key.ATK_P] * (xma[Key.BASE_ATK])
    xma[Key.DEF] += xma[Key.DEF_P] * (xma[Key.BASE_DEF])
    xma[Key.HP] += xma[Key.HP_P] * (xma[Key.BASE_HP])
  }

  // Dynamic ornament set conditionals

  if (setsArray[4] == setsArray[5]) {
    p2(SetKeys.SpaceSealingStation, sets) && evaluateConditional(SpaceSealingStationConditional, x, action, context)
    p2(SetKeys.FleetOfTheAgeless, sets) && evaluateConditional(FleetOfTheAgelessConditional, x, action, context)
    p2(SetKeys.BelobogOfTheArchitects, sets) && evaluateConditional(BelobogOfTheArchitectsConditional, x, action, context)
    p2(SetKeys.PanCosmicCommercialEnterprise, sets) && evaluateConditional(PanCosmicCommercialEnterpriseConditional, x, action, context)
    p2(SetKeys.BrokenKeel, sets) && evaluateConditional(BrokenKeelConditional, x, action, context)
    p2(SetKeys.TaliaKingdomOfBanditry, sets) && evaluateConditional(TaliaKingdomOfBanditryConditional, x, action, context)
    p2(SetKeys.BoneCollectionsSereneDemesne, sets) && evaluateConditional(BoneCollectionsSereneDemesneConditional, x, action, context)
    p2(SetKeys.GiantTreeOfRaptBrooding, sets) && evaluateConditional(GiantTreeOfRaptBrooding135Conditional, x, action, context)
    p2(SetKeys.GiantTreeOfRaptBrooding, sets) && evaluateConditional(GiantTreeOfRaptBrooding180Conditional, x, action, context)
  }

  // Dynamic character / lc conditionals

  for (const conditional of context.characterConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of context.lightConeConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of action.teammateDynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }

  // Terminal ornament set conditionals

  if (setsArray[4] == setsArray[5]) {
    if (p2(SetKeys.FirmamentFrontlineGlamoth, sets) && x.a[Key.SPD] >= 135) {
      x.ELEMENTAL_DMG.buff(x.a[Key.SPD] >= 160 ? 0.18 : 0.12, Source.FirmamentFrontlineGlamoth)
    }

    if (p2(SetKeys.RutilantArena, sets) && x.a[Key.CR] >= 0.70) {
      buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.RutilantArena)
    }

    if (p2(SetKeys.InertSalsotto, sets) && x.a[Key.CR] >= 0.50) {
      buffAbilityDmg(x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, Source.InertSalsotto)
    }

    if (p2(SetKeys.RevelryByTheSea, sets)) {
      if (x.a[Key.ATK] >= 3600) {
        buffAbilityDmg(x, DOT_DMG_TYPE, 0.24, Source.RevelryByTheSea)
      } else if (x.a[Key.ATK] >= 2400) {
        buffAbilityDmg(x, DOT_DMG_TYPE, 0.12, Source.RevelryByTheSea)
      }
    }
  }

  // Terminal relic set conditionals

  if (p4(SetKeys.IronCavalryAgainstTheScourge, sets) && x.a[Key.BE] >= 1.50) {
    buffAbilityDefPen(x, BREAK_DMG_TYPE, 0.10, Source.IronCavalryAgainstTheScourge)
    buffAbilityDefPen(x, SUPER_BREAK_DMG_TYPE, x.a[Key.BE] >= 2.50 ? 0.15 : 0, Source.IronCavalryAgainstTheScourge)
  }

  return x
}

function executeNonDynamicCombatSets(
  x: ComputedStatsArray,
  context: OptimizerContext,
  setConditionals: SetConditional,
  sets: SetCounts,
  setsArray: number[],
) {
  const [set0, set1, set2, set3, set4, set5] = setsArray

  if (set4 == set5) {
    const config = ornamentIndexToSetConfig[set4]
    config.p2x && config.p2x(x, context, setConditionals)
  }

  if (set0 === set1 && set1 === set2 && set2 === set3) {
    const config = relicIndexToSetConfig[set0]
    config.p2x && config.p2x(x, context, setConditionals)
    config.p4x && config.p4x(x, context, setConditionals)
    return
  }

  if (set0 === set1 || set0 === set2 || set0 === set3) {
    const config = relicIndexToSetConfig[set0]
    config.p2x && config.p2x(x, context, setConditionals)
  }

  if ((set1 === set2 || set1 === set3) && set1 !== set0) {
    const config = relicIndexToSetConfig[set1]
    config.p2x && config.p2x(x, context, setConditionals)
  }

  if (set2 === set3 && set2 !== set0 && set2 !== set1) {
    const config = relicIndexToSetConfig[set2]
    config.p2x && config.p2x(x, context, setConditionals)
  }
}

export function p2(key: SetKeyType, sets: SetCounts) {
  return sets[key] >> 1
}

export function p4(key: SetKeyType, sets: SetCounts) {
  return sets[key] >> 2
}

export function calculateRelicStats(
  c: BasicStatsArray,
  head: SimulationRelic,
  hands: SimulationRelic,
  body: SimulationRelic,
  feet: SimulationRelic,
  planarSphere: SimulationRelic,
  linkRope: SimulationRelic,
) {
  const a = c.a
  for (const condensedStat of head.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
  for (const condensedStat of hands.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
  for (const condensedStat of body.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
  for (const condensedStat of feet.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
  for (const condensedStat of planarSphere.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
  for (const condensedStat of linkRope.condensedStats) {
    a[condensedStat[0]] += condensedStat[1]
  }
}

function sumPercentStat(
  stat: StatsValues,
  base: Record<string, number>,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsArray,
  setEffects: number,
): number {
  return base[stat] + lc[stat] + relicSum.a[StatToKey[stat]] + trace[stat] + setEffects
}

function sumFlatStat(
  stat: StatsValues,
  statP: StatsValues,
  baseValue: number,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsArray,
  setEffects: number,
): number {
  return baseValue * (1 + setEffects + relicSum.a[StatToKey[statP]] + trace[statP] + lc[statP]) + relicSum.a[StatToKey[stat]] + trace[stat]
}

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}
