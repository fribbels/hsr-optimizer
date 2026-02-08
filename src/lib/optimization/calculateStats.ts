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
  Key,
  StatToKey,
} from 'lib/optimization/computedStatsArray'
import {
  OrnamentSetsConfig,
  RelicSetsConfig,
  SetKeys,
  SetKeyType,
} from 'lib/optimization/config/setsConfig'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
      a[Key.PHYSICAL_DMG_BOOST] = sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0)
      break
    case Stats.Fire_DMG:
      a[Key.FIRE_DMG_BOOST] = sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0)
      break
    case Stats.Ice_DMG:
      a[Key.ICE_DMG_BOOST] = sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0)
      break
    case Stats.Lightning_DMG:
      a[Key.LIGHTNING_DMG_BOOST] = sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0)
      break
    case Stats.Wind_DMG:
      a[Key.WIND_DMG_BOOST] = sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0)
      break
    case Stats.Quantum_DMG:
      a[Key.QUANTUM_DMG_BOOST] = sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0)
      break
    case Stats.Imaginary_DMG:
      a[Key.IMAGINARY_DMG_BOOST] = sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0)
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

export function calculateBasicEffects(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.newCalculateBasicEffects) lightConeConditionalController.newCalculateBasicEffects(x, action, context)
  if (characterConditionalController.newCalculateBasicEffects) characterConditionalController.newCalculateBasicEffects(x, action, context)
}

export function calculateComputedStats(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const a = x.a
  const c = x.c
  const sets = c.sets
  const setsArray = c.setsArray
  const buffs = context.combatBuffs

  // Add base to computed (defaults to SelfAndPet targeting)
  x.actionBuff(StatKey.ATK, c.a[StatKey.ATK] + buffs.ATK + buffs.ATK_P * context.baseATK)
  x.actionBuff(StatKey.DEF, c.a[StatKey.DEF] + buffs.DEF + buffs.DEF_P * context.baseDEF)
  x.actionBuff(StatKey.HP, c.a[StatKey.HP] + buffs.HP + buffs.HP_P * context.baseHP)
  x.actionBuff(StatKey.SPD, c.a[StatKey.SPD] + buffs.SPD + buffs.SPD_P * context.baseSPD)
  x.actionBuff(StatKey.CD, c.a[StatKey.CD] + buffs.CD)
  x.actionBuff(StatKey.CR, c.a[StatKey.CR] + buffs.CR)
  x.actionBuff(StatKey.BE, c.a[StatKey.BE] + buffs.BE)
  x.actionBuff(StatKey.EHR, c.a[StatKey.EHR])
  x.actionBuff(StatKey.RES, c.a[StatKey.RES])
  x.actionBuff(StatKey.ERR, c.a[StatKey.ERR])
  x.actionBuff(StatKey.OHB, c.a[StatKey.OHB])

  x.actionBuff(StatKey.PHYSICAL_DMG_BOOST, c.a[Key.PHYSICAL_DMG_BOOST])
  x.actionBuff(StatKey.FIRE_DMG_BOOST, c.a[Key.FIRE_DMG_BOOST])
  x.actionBuff(StatKey.ICE_DMG_BOOST, c.a[Key.ICE_DMG_BOOST])
  x.actionBuff(StatKey.LIGHTNING_DMG_BOOST, c.a[Key.LIGHTNING_DMG_BOOST])
  x.actionBuff(StatKey.WIND_DMG_BOOST, c.a[Key.WIND_DMG_BOOST])
  x.actionBuff(StatKey.QUANTUM_DMG_BOOST, c.a[Key.QUANTUM_DMG_BOOST])
  x.actionBuff(StatKey.IMAGINARY_DMG_BOOST, c.a[Key.IMAGINARY_DMG_BOOST])

  x.actionSet(StatKey.BASE_ATK, context.baseATK)
  x.actionSet(StatKey.BASE_DEF, context.baseDEF)
  x.actionSet(StatKey.BASE_HP, context.baseHP)
  x.actionSet(StatKey.BASE_SPD, context.baseSPD)

  // Calculate memosprite entity stats
  for (let entityIndex = 1; entityIndex < x.config.entitiesLength; entityIndex++) {
    const entity = x.config.entitiesArray[entityIndex]

    if (!entity.memosprite) continue

    // Set BASE_* stats using raw base stats with scaling only (no flat)
    a[x.getActionIndex(entityIndex, StatKey.BASE_ATK)] = (entity.memoBaseAtkScaling ?? 1) * context.baseATK
    a[x.getActionIndex(entityIndex, StatKey.BASE_DEF)] = (entity.memoBaseDefScaling ?? 1) * context.baseDEF
    a[x.getActionIndex(entityIndex, StatKey.BASE_HP)] = (entity.memoBaseHpScaling ?? 1) * context.baseHP
    a[x.getActionIndex(entityIndex, StatKey.BASE_SPD)] = (entity.memoBaseSpdScaling ?? 1) * context.baseSPD

    // Calculate memosprite stats from primary entity's total stats (scaling * total + flat)
    a[x.getActionIndex(entityIndex, StatKey.ATK)] += (entity.memoBaseAtkScaling ?? 1) * c.a[StatKey.ATK] + (entity.memoBaseAtkFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.DEF)] += (entity.memoBaseDefScaling ?? 1) * c.a[StatKey.DEF] + (entity.memoBaseDefFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.HP)] += (entity.memoBaseHpScaling ?? 1) * c.a[StatKey.HP] + (entity.memoBaseHpFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.SPD)] += (entity.memoBaseSpdScaling ?? 1) * c.a[StatKey.SPD] + (entity.memoBaseSpdFlat ?? 0)

    // Copy secondary stats from primary entity
    a[x.getActionIndex(entityIndex, StatKey.CD)] += c.a[StatKey.CD]
    a[x.getActionIndex(entityIndex, StatKey.CR)] += c.a[StatKey.CR]
    a[x.getActionIndex(entityIndex, StatKey.BE)] += c.a[StatKey.BE]
    a[x.getActionIndex(entityIndex, StatKey.EHR)] += c.a[StatKey.EHR]
    a[x.getActionIndex(entityIndex, StatKey.RES)] += c.a[StatKey.RES]
    a[x.getActionIndex(entityIndex, StatKey.ERR)] += c.a[StatKey.ERR]
    a[x.getActionIndex(entityIndex, StatKey.OHB)] += c.a[StatKey.OHB]

    a[x.getActionIndex(entityIndex, StatKey.PHYSICAL_DMG_BOOST)] += c.a[Key.PHYSICAL_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.FIRE_DMG_BOOST)] += c.a[Key.FIRE_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.ICE_DMG_BOOST)] += c.a[Key.ICE_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.LIGHTNING_DMG_BOOST)] += c.a[Key.LIGHTNING_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.WIND_DMG_BOOST)] += c.a[Key.WIND_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.QUANTUM_DMG_BOOST)] += c.a[Key.QUANTUM_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.IMAGINARY_DMG_BOOST)] += c.a[Key.IMAGINARY_DMG_BOOST]
  }

  x.actionBuff(StatKey.DMG_BOOST, buffs.DMG_BOOST, TargetTag.FullTeam)
  x.actionBuff(StatKey.EFFECT_RES_PEN, buffs.EFFECT_RES_PEN, TargetTag.FullTeam)
  x.actionBuff(StatKey.VULNERABILITY, buffs.VULNERABILITY, TargetTag.FullTeam)
  x.actionBuff(StatKey.BREAK_EFFICIENCY_BOOST, buffs.BREAK_EFFICIENCY, TargetTag.FullTeam)

  // BASIC

  executeNonDynamicCombatSets(x, context, setConditionals, sets, setsArray)

  x.actionBuff(StatKey.SPD, a[StatKey.SPD_P] * context.baseSPD, TargetTag.SelfAndPet)
  x.actionBuff(StatKey.ATK, a[StatKey.ATK_P] * context.baseATK, TargetTag.SelfAndPet)
  x.actionBuff(StatKey.DEF, a[StatKey.DEF_P] * context.baseDEF, TargetTag.SelfAndPet)
  x.actionBuff(StatKey.HP, a[StatKey.HP_P] * context.baseHP, TargetTag.SelfAndPet)

  // Apply percent stats to memosprite entities
  for (let entityIndex = 1; entityIndex < x.config.entitiesLength; entityIndex++) {
    const entity = x.config.entitiesArray[entityIndex]

    if (!entity.memosprite) continue

    a[x.getActionIndex(entityIndex, StatKey.SPD)] += a[x.getActionIndex(entityIndex, StatKey.SPD_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_SPD)]
    a[x.getActionIndex(entityIndex, StatKey.ATK)] += a[x.getActionIndex(entityIndex, StatKey.ATK_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_ATK)]
    a[x.getActionIndex(entityIndex, StatKey.DEF)] += a[x.getActionIndex(entityIndex, StatKey.DEF_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_DEF)]
    a[x.getActionIndex(entityIndex, StatKey.HP)] += a[x.getActionIndex(entityIndex, StatKey.HP_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_HP)]
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
    if (p2(SetKeys.FirmamentFrontlineGlamoth, sets) && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 135) {
      const spd = x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
      x.buff(StatKey.DMG_BOOST, spd >= 160 ? 0.18 : 0.12, x.source(Source.FirmamentFrontlineGlamoth))
    }

    if (p2(SetKeys.RutilantArena, sets) && x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.70) {
      x.buff(StatKey.DMG_BOOST, 0.20, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(Source.RutilantArena))
    }

    if (p2(SetKeys.InertSalsotto, sets) && x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX) >= 0.50) {
      x.buff(StatKey.DMG_BOOST, 0.15, x.damageType(DamageTag.ULT | DamageTag.FUA).source(Source.InertSalsotto))
    }

    if (p2(SetKeys.RevelryByTheSea, sets)) {
      const atk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)
      if (atk >= 3600) {
        x.buff(StatKey.DMG_BOOST, 0.24, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
      } else if (atk >= 2400) {
        x.buff(StatKey.DMG_BOOST, 0.12, x.damageType(DamageTag.DOT).source(Source.RevelryByTheSea))
      }
    }
  }

  // Terminal relic set conditionals

  if (p4(SetKeys.IronCavalryAgainstTheScourge, sets) && x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX) >= 1.50) {
    const be = x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX)
    x.buff(StatKey.DEF_PEN, 0.10, x.damageType(DamageTag.BREAK).source(Source.IronCavalryAgainstTheScourge))
    if (be >= 2.50) {
      x.buff(StatKey.DEF_PEN, 0.15, x.damageType(DamageTag.SUPER_BREAK).source(Source.IronCavalryAgainstTheScourge))
    }
  }

  return x
}

function executeNonDynamicCombatSets(
  x: ComputedStatsContainer,
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
