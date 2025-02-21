import { BASIC_DMG_TYPE, BasicStatsObject, BREAK_DMG_TYPE, FUA_DMG_TYPE, SKILL_DMG_TYPE, SUPER_BREAK_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Sets, Stats, StatsValues } from 'lib/constants/constants'
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
import { buffAbilityDefPen, buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { buffElementalDamageType, ComputedStatsArray, Key, StatToKey } from 'lib/optimization/computedStatsArray'
import { OrnamentSetsConfig, RelicSetsConfig, SetsConfig, SetsDefinition } from 'lib/optimization/config/setsConfig'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'
import { Relic } from 'types/relic'

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

export type SetCounts = Map<keyof typeof Sets, number>

export function calculateSetCounts(
  sets: number[],
) {
  const setCounts = new Map<keyof typeof Sets, number>()

  for (let i = 0; i < 4; i++) {
    const key = relicIndexToSetKey[sets[i]]
    setCounts.set(key, (setCounts.get(key) ?? 0) + 1)
  }

  if (sets[4] == sets[5]) {
    setCounts.set(ornamentIndexToSetKey[sets[4]], 2)
  }

  return setCounts
}

export function calculateBasicSetEffects(c: BasicStatsArray, context: OptimizerContext, setCounts: SetCounts, sets: number[]) {
  for (const set of new Set(sets)) {
    const key = relicIndexToSetKey[set]
    const count = setCounts.get(key) ?? 0
    const config = relicIndexToSetConfig[set]

    if (count >= 2) config.p2c && config.p2c(c, context)
    if (count >= 4) config.p4c && config.p4c(c, context)
  }

  if (sets[4] == sets[5]) {
    const config = ornamentIndexToSetConfig[sets[4]]
    config.p2c && config.p2c(c, context)
  }
}

// TODO: Cleanup
export function calculateElementalStats(c: BasicStatsArray, context: OptimizerContext) {
  const sets = c.sets
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  // NOTE: c.ELEMENTAL_DMG represents the character's type, while x.ELEMENTAL_DMG represents ALL types.
  // This is mostly because there isn't a need to split out damage types while we're calculating display stats.
  c.ELEMENTAL_DMG.set(0, Source.NONE)
  switch (context.elementalDamageType) {
    case Stats.Physical_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Fire_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Ice_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Lightning_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Wind_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Quantum_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0), Source.NONE)
      break
    case Stats.Imaginary_DMG:
      c.ELEMENTAL_DMG.set(sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0), Source.NONE)
      break
  }
}

export function calculateBaseStats(c: BasicStatsArray, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces

  c.SPD.set(sumFlatStat(Stats.SPD, Stats.SPD_P, context.baseSPD, lc, trace, c, 0), Source.NONE)
  c.HP.set(sumFlatStat(Stats.HP, Stats.HP_P, context.baseHP, lc, trace, c, 0), Source.NONE)
  c.ATK.set(sumFlatStat(Stats.ATK, Stats.ATK_P, context.baseATK, lc, trace, c, 0), Source.NONE)
  c.DEF.set(sumFlatStat(Stats.DEF, Stats.DEF_P, context.baseDEF, lc, trace, c, 0), Source.NONE)
  c.CR.set(sumPercentStat(Stats.CR, base, lc, trace, c, 0), Source.NONE)
  c.CD.set(sumPercentStat(Stats.CD, base, lc, trace, c, 0), Source.NONE)
  c.EHR.set(sumPercentStat(Stats.EHR, base, lc, trace, c, 0), Source.NONE)
  c.RES.set(sumPercentStat(Stats.RES, base, lc, trace, c, 0), Source.NONE)
  c.BE.set(sumPercentStat(Stats.BE, base, lc, trace, c, 0), Source.NONE)
  c.ERR.set(sumPercentStat(Stats.ERR, base, lc, trace, c, 0), Source.NONE)
  c.OHB.set(sumPercentStat(Stats.OHB, base, lc, trace, c, 0), Source.NONE)
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

  x.BASE_ATK.set(context.baseATK, Source.NONE)
  x.BASE_DEF.set(context.baseDEF, Source.NONE)
  x.BASE_HP.set(context.baseHP, Source.NONE)
  x.BASE_SPD.set(context.baseSPD, Source.NONE)

  if (x.m) {
    const xmc = x.m.c
    const xma = x.m.a
    xmc.ATK.set(x.a[Key.MEMO_BASE_ATK_SCALING] * c.a[Key.ATK] + x.a[Key.MEMO_BASE_ATK_FLAT], Source.NONE)
    xmc.DEF.set(x.a[Key.MEMO_BASE_DEF_SCALING] * c.a[Key.DEF] + x.a[Key.MEMO_BASE_DEF_FLAT], Source.NONE)
    xmc.HP.set(x.a[Key.MEMO_BASE_HP_SCALING] * c.a[Key.HP] + x.a[Key.MEMO_BASE_HP_FLAT], Source.NONE)
    xmc.SPD.set(x.a[Key.MEMO_BASE_SPD_SCALING] * c.a[Key.SPD] + x.a[Key.MEMO_BASE_SPD_FLAT], Source.NONE)

    x.m.BASE_ATK.set(xmc.a[Key.ATK], Source.NONE)
    x.m.BASE_DEF.set(xmc.a[Key.DEF], Source.NONE)
    x.m.BASE_HP.set(xmc.a[Key.HP], Source.NONE)
    x.m.BASE_SPD.set(xmc.a[Key.SPD], Source.NONE)

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
  if (x.m) {
    buffElementalDamageType(x.m, context.elementalDamageType, c.a[Key.ELEMENTAL_DMG])
  }

  // BASIC

  for (const set of sets.keys()) {
    const config = SetsConfig[set]
    const count = sets.get(set) ?? 0

    if (count >= 2) config.p2x && config.p2x(x, context, setConditionals)
    if (count >= 4) config.p4x && config.p4x(x, context, setConditionals)
  }

  a[Key.SPD] += a[Key.SPD_P] * context.baseSPD
  a[Key.ATK] += a[Key.ATK_P] * context.baseATK
  a[Key.DEF] += a[Key.DEF_P] * context.baseDEF
  a[Key.HP] += a[Key.HP_P] * context.baseHP

  if (x.m) {
    const xma = x.m.a
    xma[Key.SPD] += xma[Key.SPD_P] * (xma[Key.BASE_SPD])
    xma[Key.ATK] += xma[Key.ATK_P] * (xma[Key.BASE_ATK])
    xma[Key.DEF] += xma[Key.DEF_P] * (xma[Key.BASE_DEF])
    xma[Key.HP] += xma[Key.HP_P] * (xma[Key.BASE_HP])
  }

  // Dynamic set conditionals

  p2New(SetsConfig.SpaceSealingStation, sets) && evaluateConditional(SpaceSealingStationConditional, x, action, context)
  p2New(SetsConfig.FleetOfTheAgeless, sets) && evaluateConditional(FleetOfTheAgelessConditional, x, action, context)
  p2New(SetsConfig.BelobogOfTheArchitects, sets) && evaluateConditional(BelobogOfTheArchitectsConditional, x, action, context)
  p2New(SetsConfig.PanCosmicCommercialEnterprise, sets) && evaluateConditional(PanCosmicCommercialEnterpriseConditional, x, action, context)
  p2New(SetsConfig.BrokenKeel, sets) && evaluateConditional(BrokenKeelConditional, x, action, context)
  p2New(SetsConfig.TaliaKingdomOfBanditry, sets) && evaluateConditional(TaliaKingdomOfBanditryConditional, x, action, context)
  p2New(SetsConfig.BoneCollectionsSereneDemesne, sets) && evaluateConditional(BoneCollectionsSereneDemesneConditional, x, action, context)
  p2New(SetsConfig.GiantTreeOfRaptBrooding, sets) && evaluateConditional(GiantTreeOfRaptBrooding135Conditional, x, action, context)
  p2New(SetsConfig.GiantTreeOfRaptBrooding, sets) && evaluateConditional(GiantTreeOfRaptBrooding180Conditional, x, action, context)

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

  // Terminal set conditionals

  if (p2New(SetsConfig.FirmamentFrontlineGlamoth, sets) && x.a[Key.SPD] >= 135) {
    x.ELEMENTAL_DMG.buff(x.a[Key.SPD] >= 160 ? 0.18 : 0.12, Source.FirmamentFrontlineGlamoth)
  }

  if (p2New(SetsConfig.RutilantArena, sets) && x.a[Key.CR] >= 0.70) {
    buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 0.20, Source.RutilantArena)
  }

  if (p2New(SetsConfig.InertSalsotto, sets) && x.a[Key.CR] >= 0.50) {
    buffAbilityDmg(x, ULT_DMG_TYPE | FUA_DMG_TYPE, 0.15, Source.InertSalsotto)
  }

  if (p4New(SetsConfig.IronCavalryAgainstTheScourge, sets) && x.a[Key.BE] >= 1.50) {
    buffAbilityDefPen(x, BREAK_DMG_TYPE, 0.10, Source.IronCavalryAgainstTheScourge)
    buffAbilityDefPen(x, SUPER_BREAK_DMG_TYPE, x.a[Key.BE] >= 2.50 ? 0.15 : 0, Source.IronCavalryAgainstTheScourge)
  }

  return x
}

export function p2New(setsDefinition: SetsDefinition, sets: SetCounts) {
  return Math.min(1, (sets.get(setsDefinition.key) ?? 0) >> 1)
}

export function p4New(setsDefinition: SetsDefinition, sets: SetCounts) {
  return (sets.get(setsDefinition.key) ?? 0) >> 2
}

// function p2x(x: ComputedStatsArray, context: OptimizerContext, setConfig: SetsDefinition) {
//   if (!setConfig.p2x) return
//   setConfig.p2x(x, context)
// }

export function calculateRelicStats(c: BasicStatsArray, head: Relic, hands: Relic, body: Relic, feet: Relic, planarSphere: Relic, linkRope: Relic, weights: boolean) {
  const a = c.a
  if (head?.condensedStats) {
    for (const condensedStat of head.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (hands?.condensedStats) {
    for (const condensedStat of hands.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (body?.condensedStats) {
    for (const condensedStat of body.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (feet?.condensedStats) {
    for (const condensedStat of feet.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (planarSphere?.condensedStats) {
    for (const condensedStat of planarSphere.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }
  if (linkRope?.condensedStats) {
    for (const condensedStat of linkRope.condensedStats) {
      a[condensedStat[0]] += condensedStat[1]
    }
  }

  if (weights) {
    c.setWeight(
      head.weightScore
      + hands.weightScore
      + body.weightScore
      + feet.weightScore
      + planarSphere.weightScore
      + linkRope.weightScore,
    )
  }
}

function sumPercentStat(
  stat: StatsValues,
  base: Record<string, number>,
  lc: Record<string, number>,
  trace: Record<string, number>,
  relicSum: BasicStatsArray,
  setEffects: number): number {
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
  return (baseValue) * (1 + setEffects + relicSum.a[StatToKey[statP]] + trace[statP] + lc[statP]) + relicSum.a[StatToKey[stat]] + trace[stat]
}

const pioneerSetIndexToCd: Record<number, number> = {
  [-1]: 0,
  0: 0,
  1: 0.08,
  2: 0.12,
  3: 0.16,
  4: 0.24,
}

// @ts-ignore
export const baseCharacterStats: BasicStatsObject = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 0,
  [Stats.DEF_P]: 0,
  [Stats.HP]: 0.000001,
  [Stats.ATK]: 0.000001,
  [Stats.DEF]: 0.000001,
  [Stats.SPD]: 0.000001,
  [Stats.SPD_P]: 0,
  [Stats.CR]: 0.000001,
  [Stats.CD]: 0.000001,
  [Stats.EHR]: 0.000001,
  [Stats.RES]: 0.000001,
  [Stats.BE]: 0.000001,
  [Stats.ERR]: 0.000001,
  [Stats.OHB]: 0.000001,
  [Stats.Physical_DMG]: 0.000001,
  [Stats.Fire_DMG]: 0.000001,
  [Stats.Ice_DMG]: 0.000001,
  [Stats.Lightning_DMG]: 0.000001,
  [Stats.Wind_DMG]: 0.000001,
  [Stats.Quantum_DMG]: 0.000001,
  [Stats.Imaginary_DMG]: 0.000001,
}
