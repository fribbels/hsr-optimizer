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

  // Elation DMG is calculated independently of character element - it comes from traces/LC only (not relics)
  a[Key.ELATION_DMG_BOOST] = sumPercentStat(Stats.Elation_DMG, base, lc, trace, c, 0)
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

  transferBaseStats(x, a, c, context)
  calculateMemospriteBaseStats(x, a, c, context)
  applyCombatBuffs(x, context)
  executeNonDynamicCombatSets(x, context, setConditionals, sets, setsArray)
  applyPercentStats(x, a, context)
  evaluateDynamicSetConditionals(x, sets, setsArray, action, context)
  evaluateDynamicConditionals(x, action, context)
  evaluateTerminalSetConditionals(x, a, sets, setsArray, action, context)

  return x
}

function transferBaseStats(x: ComputedStatsContainer, a: Float32Array, c: BasicStatsArray, context: OptimizerContext) {
  const buffs = context.combatBuffs
  const ca = c.a
  const offsets = x.config.entityBaseOffsets[TargetTag.SelfAndPet]

  // Precompute values once, then write to all matched entities
  const vATK = ca[StatKey.ATK] + buffs.ATK + buffs.ATK_P * context.baseATK
  const vDEF = ca[StatKey.DEF] + buffs.DEF + buffs.DEF_P * context.baseDEF
  const vHP = ca[StatKey.HP] + buffs.HP + buffs.HP_P * context.baseHP
  const vSPD = ca[StatKey.SPD] + buffs.SPD + buffs.SPD_P * context.baseSPD
  const vCD = ca[StatKey.CD] + buffs.CD
  const vCR = ca[StatKey.CR] + buffs.CR
  const vBE = ca[StatKey.BE] + buffs.BE

  for (let i = 0; i < offsets.length; i++) {
    const o = offsets[i]

    // Core stats (actionBuff += semantics)
    a[o + StatKey.ATK] += vATK
    a[o + StatKey.DEF] += vDEF
    a[o + StatKey.HP] += vHP
    a[o + StatKey.SPD] += vSPD
    a[o + StatKey.CD] += vCD
    a[o + StatKey.CR] += vCR
    a[o + StatKey.BE] += vBE
    a[o + StatKey.EHR] += ca[StatKey.EHR]
    a[o + StatKey.RES] += ca[StatKey.RES]
    a[o + StatKey.ERR] += ca[StatKey.ERR]
    a[o + StatKey.OHB] += ca[StatKey.OHB]

    // Elemental damage boosts
    a[o + StatKey.PHYSICAL_DMG_BOOST] += ca[Key.PHYSICAL_DMG_BOOST]
    a[o + StatKey.FIRE_DMG_BOOST] += ca[Key.FIRE_DMG_BOOST]
    a[o + StatKey.ICE_DMG_BOOST] += ca[Key.ICE_DMG_BOOST]
    a[o + StatKey.LIGHTNING_DMG_BOOST] += ca[Key.LIGHTNING_DMG_BOOST]
    a[o + StatKey.WIND_DMG_BOOST] += ca[Key.WIND_DMG_BOOST]
    a[o + StatKey.QUANTUM_DMG_BOOST] += ca[Key.QUANTUM_DMG_BOOST]
    a[o + StatKey.IMAGINARY_DMG_BOOST] += ca[Key.IMAGINARY_DMG_BOOST]
    a[o + StatKey.ELATION_DMG_BOOST] += ca[Key.ELATION_DMG_BOOST]

    // Base stats (actionSet = semantics)
    a[o + StatKey.BASE_ATK] = context.baseATK
    a[o + StatKey.BASE_DEF] = context.baseDEF
    a[o + StatKey.BASE_HP] = context.baseHP
    a[o + StatKey.BASE_SPD] = context.baseSPD
  }
}

function calculateMemospriteBaseStats(x: ComputedStatsContainer, a: Float32Array, c: BasicStatsArray, context: OptimizerContext) {
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
    a[x.getActionIndex(entityIndex, StatKey.ELATION_DMG_BOOST)] += c.a[Key.ELATION_DMG_BOOST]
  }
}

function applyCombatBuffs(x: ComputedStatsContainer, context: OptimizerContext) {
  const buffs = context.combatBuffs
  const a = x.a
  const offsets = x.config.entityBaseOffsets[TargetTag.FullTeam]

  for (let i = 0; i < offsets.length; i++) {
    const o = offsets[i]
    a[o + StatKey.DMG_BOOST] += buffs.DMG_BOOST
    a[o + StatKey.EFFECT_RES_PEN] += buffs.EFFECT_RES_PEN
    a[o + StatKey.VULNERABILITY] += buffs.VULNERABILITY
    a[o + StatKey.BREAK_EFFICIENCY_BOOST] += buffs.BREAK_EFFICIENCY
  }
}

function applyPercentStats(x: ComputedStatsContainer, a: Float32Array, context: OptimizerContext) {
  const offsets = x.config.entityBaseOffsets[TargetTag.SelfAndPet]

  // Use entity 0's percent stats for all SelfAndPet entities
  const vSPD = a[StatKey.SPD_P] * context.baseSPD
  const vATK = a[StatKey.ATK_P] * context.baseATK
  const vDEF = a[StatKey.DEF_P] * context.baseDEF
  const vHP = a[StatKey.HP_P] * context.baseHP

  for (let i = 0; i < offsets.length; i++) {
    const o = offsets[i]
    a[o + StatKey.SPD] += vSPD
    a[o + StatKey.ATK] += vATK
    a[o + StatKey.DEF] += vDEF
    a[o + StatKey.HP] += vHP
  }

  // Apply percent stats to memosprite entities
  for (let entityIndex = 1; entityIndex < x.config.entitiesLength; entityIndex++) {
    const entity = x.config.entitiesArray[entityIndex]

    if (!entity.memosprite) continue

    a[x.getActionIndex(entityIndex, StatKey.SPD)] += a[x.getActionIndex(entityIndex, StatKey.SPD_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_SPD)]
    a[x.getActionIndex(entityIndex, StatKey.ATK)] += a[x.getActionIndex(entityIndex, StatKey.ATK_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_ATK)]
    a[x.getActionIndex(entityIndex, StatKey.DEF)] += a[x.getActionIndex(entityIndex, StatKey.DEF_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_DEF)]
    a[x.getActionIndex(entityIndex, StatKey.HP)] += a[x.getActionIndex(entityIndex, StatKey.HP_P)] * a[x.getActionIndex(entityIndex, StatKey.BASE_HP)]
  }
}

function evaluateDynamicSetConditionals(
  x: ComputedStatsContainer,
  sets: SetCounts,
  setsArray: number[],
  action: OptimizerAction,
  context: OptimizerContext,
) {
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
}

function evaluateDynamicConditionals(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  for (const conditional of context.characterConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of context.lightConeConditionalController.dynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
  for (const conditional of action.teammateDynamicConditionals ?? []) {
    evaluateConditional(conditional, x, action, context)
  }
}

function evaluateTerminalSetConditionals(
  x: ComputedStatsContainer,
  a: Float32Array,
  sets: SetCounts,
  setsArray: number[],
  action: OptimizerAction,
  context: OptimizerContext,
) {
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
