import {
  Stats,
  type StatsValues,
} from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BasicKey,
  type BasicStatsArray,
  BasicStatToKey,
} from 'lib/optimization/basicStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type SetCounts } from 'lib/optimization/setMatching'
import {
  getAllSetDynamicConditionals,
  ornamentIndexToSetConfig,
  relicIndexToSetConfig,
} from 'lib/sets/setConfigRegistry'
import { type SimulationRelic } from 'lib/simulations/statSimulationTypes'
import type {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

export function calculateSetCounts(
  sets: number[],
): SetCounts {
  const maskH = 1 << sets[0]
  const maskG = 1 << sets[1]
  const maskB = 1 << sets[2]
  const maskF = 1 << sets[3]

  return {
    relicMatch2: (maskH & maskG) | (maskH & maskB) | (maskH & maskF)
      | (maskG & maskB) | (maskG & maskF) | (maskB & maskF),
    relicMatch4: maskH & maskG & maskB & maskF,
    ornamentMatch2: (1 << sets[4]) & (1 << sets[5]),
  }
}

export function calculateSetCountsInPlace(
  setCounts: SetCounts,
  sets: number[],
): void {
  const maskH = 1 << sets[0]
  const maskG = 1 << sets[1]
  const maskB = 1 << sets[2]
  const maskF = 1 << sets[3]

  setCounts.relicMatch2 = (maskH & maskG) | (maskH & maskB) | (maskH & maskF)
    | (maskG & maskB) | (maskG & maskF) | (maskB & maskF)
  setCounts.relicMatch4 = maskH & maskG & maskB & maskF
  setCounts.ornamentMatch2 = (1 << sets[4]) & (1 << sets[5])
}

export function calculateBasicSetEffects(c: BasicStatsArray, context: OptimizerContext, setCounts: SetCounts, sets: number[]) {
  for (let i = 0; i < 4; i++) {
    const set = sets[i]

    // Skip if this set was already processed by an earlier slot
    if ((i > 0 && sets[0] === set) || (i > 1 && sets[1] === set) || (i > 2 && sets[2] === set)) continue

    const bit = 1 << set
    if (setCounts.relicMatch2 & bit) {
      const conditionals = relicIndexToSetConfig[set].conditionals

      if (conditionals.p2c) conditionals.p2c(c, context)
      if ((setCounts.relicMatch4 & bit) && conditionals.p4c) conditionals.p4c(c, context)
    }
  }

  if (sets[4] == sets[5]) {
    ornamentIndexToSetConfig[sets[4]].conditionals.p2c?.(c, context)
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
  a[BasicKey.ELEMENTAL_DMG] = 0
  switch (context.elementalDamageType) {
    case Stats.Physical_DMG:
      a[BasicKey.PHYSICAL_DMG_BOOST] = sumPercentStat(Stats.Physical_DMG, base, lc, trace, c, 0)
      break
    case Stats.Fire_DMG:
      a[BasicKey.FIRE_DMG_BOOST] = sumPercentStat(Stats.Fire_DMG, base, lc, trace, c, 0)
      break
    case Stats.Ice_DMG:
      a[BasicKey.ICE_DMG_BOOST] = sumPercentStat(Stats.Ice_DMG, base, lc, trace, c, 0)
      break
    case Stats.Lightning_DMG:
      a[BasicKey.LIGHTNING_DMG_BOOST] = sumPercentStat(Stats.Lightning_DMG, base, lc, trace, c, 0)
      break
    case Stats.Wind_DMG:
      a[BasicKey.WIND_DMG_BOOST] = sumPercentStat(Stats.Wind_DMG, base, lc, trace, c, 0)
      break
    case Stats.Quantum_DMG:
      a[BasicKey.QUANTUM_DMG_BOOST] = sumPercentStat(Stats.Quantum_DMG, base, lc, trace, c, 0)
      break
    case Stats.Imaginary_DMG:
      a[BasicKey.IMAGINARY_DMG_BOOST] = sumPercentStat(Stats.Imaginary_DMG, base, lc, trace, c, 0)
      break
  }

  // Elation DMG is calculated independently of character element - it comes from traces/LC only (not relics)
  a[BasicKey.ELATION] = sumPercentStat(Stats.Elation, base, lc, trace, c, 0)
}

export function calculateBaseStats(c: BasicStatsArray, context: OptimizerContext) {
  const base = context.characterStatsBreakdown.base
  const lc = context.characterStatsBreakdown.lightCone
  const trace = context.characterStatsBreakdown.traces
  const a = c.a

  a[BasicKey.SPD] = sumFlatStat(Stats.SPD, Stats.SPD_P, context.baseSPD, lc, trace, c, 0)
  a[BasicKey.HP] = sumFlatStat(Stats.HP, Stats.HP_P, context.baseHP, lc, trace, c, 0)
  a[BasicKey.ATK] = sumFlatStat(Stats.ATK, Stats.ATK_P, context.baseATK, lc, trace, c, 0)
  a[BasicKey.DEF] = sumFlatStat(Stats.DEF, Stats.DEF_P, context.baseDEF, lc, trace, c, 0)
  a[BasicKey.CR] = sumPercentStat(Stats.CR, base, lc, trace, c, 0)
  a[BasicKey.CD] = sumPercentStat(Stats.CD, base, lc, trace, c, 0)
  a[BasicKey.EHR] = sumPercentStat(Stats.EHR, base, lc, trace, c, 0)
  a[BasicKey.RES] = sumPercentStat(Stats.RES, base, lc, trace, c, 0)
  a[BasicKey.BE] = sumPercentStat(Stats.BE, base, lc, trace, c, 0)
  a[BasicKey.ERR] = sumPercentStat(Stats.ERR, base, lc, trace, c, 0)
  a[BasicKey.OHB] = sumPercentStat(Stats.OHB, base, lc, trace, c, 0)
}

export function calculateBasicEffects(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const lightConeController = context.lightConeController
  const characterController = context.characterController

  if (lightConeController.newCalculateBasicEffects) lightConeController.newCalculateBasicEffects(x, action, context)
  if (characterController.newCalculateBasicEffects) characterController.newCalculateBasicEffects(x, action, context)
}

export function calculateComputedStats(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const setConditionals = action.setConditionals
  const a = x.a
  const c = x.c
  const sets = c.sets
  const setsArray = c.setsArray

  transferBaseStats(x, a, c, context)
  calculateMemospriteBaseStats(x, a, c, context)
  executeNonDynamicCombatSets(x, context, setConditionals, sets, setsArray)
  applyPercentStats(x, a, context)
  evaluateDynamicSetConditionals(x, sets, setsArray, action, context)
  evaluateDynamicConditionals(x, action, context)
  evaluateTerminalSetConditionals(x, a, sets, setsArray, action, context)

  return x
}

function transferBaseStats(x: ComputedStatsContainer, a: Float32Array, c: BasicStatsArray, context: OptimizerContext) {
  const ca = c.a
  const offsets = x.config.entityBaseOffsets[TargetTag.SelfAndPet]

  const vATK = ca[StatKey.ATK]
  const vDEF = ca[StatKey.DEF]
  const vHP = ca[StatKey.HP]
  const vSPD = ca[StatKey.SPD]
  const vCD = ca[StatKey.CD]
  const vCR = ca[StatKey.CR]
  const vBE = ca[StatKey.BE]

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
    a[o + StatKey.PHYSICAL_DMG_BOOST] += ca[BasicKey.PHYSICAL_DMG_BOOST]
    a[o + StatKey.FIRE_DMG_BOOST] += ca[BasicKey.FIRE_DMG_BOOST]
    a[o + StatKey.ICE_DMG_BOOST] += ca[BasicKey.ICE_DMG_BOOST]
    a[o + StatKey.LIGHTNING_DMG_BOOST] += ca[BasicKey.LIGHTNING_DMG_BOOST]
    a[o + StatKey.WIND_DMG_BOOST] += ca[BasicKey.WIND_DMG_BOOST]
    a[o + StatKey.QUANTUM_DMG_BOOST] += ca[BasicKey.QUANTUM_DMG_BOOST]
    a[o + StatKey.IMAGINARY_DMG_BOOST] += ca[BasicKey.IMAGINARY_DMG_BOOST]
    a[o + StatKey.ELATION] += ca[BasicKey.ELATION]
  }
}

function calculateMemospriteBaseStats(x: ComputedStatsContainer, a: Float32Array, c: BasicStatsArray, context: OptimizerContext) {
  for (let entityIndex = 1; entityIndex < x.config.entitiesLength; entityIndex++) {
    const entity = x.config.entitiesArray[entityIndex]

    if (!entity.memosprite) continue

    // Calculate memosprite stats from primary entity's total stats (scaling * total + flat)
    a[x.getActionIndex(entityIndex, StatKey.ATK)] += (entity.memoBaseAtkScaling ?? 0) * c.a[StatKey.ATK] + (entity.memoBaseAtkFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.DEF)] += (entity.memoBaseDefScaling ?? 0) * c.a[StatKey.DEF] + (entity.memoBaseDefFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.HP)] += (entity.memoBaseHpScaling ?? 0) * c.a[StatKey.HP] + (entity.memoBaseHpFlat ?? 0)
    a[x.getActionIndex(entityIndex, StatKey.SPD)] += (entity.memoBaseSpdScaling ?? 0) * c.a[StatKey.SPD] + (entity.memoBaseSpdFlat ?? 0)

    // Copy secondary stats from primary entity
    a[x.getActionIndex(entityIndex, StatKey.CD)] += c.a[StatKey.CD]
    a[x.getActionIndex(entityIndex, StatKey.CR)] += c.a[StatKey.CR]
    a[x.getActionIndex(entityIndex, StatKey.BE)] += c.a[StatKey.BE]
    a[x.getActionIndex(entityIndex, StatKey.EHR)] += c.a[StatKey.EHR]
    a[x.getActionIndex(entityIndex, StatKey.RES)] += c.a[StatKey.RES]
    a[x.getActionIndex(entityIndex, StatKey.ERR)] += c.a[StatKey.ERR]
    a[x.getActionIndex(entityIndex, StatKey.OHB)] += c.a[StatKey.OHB]

    a[x.getActionIndex(entityIndex, StatKey.PHYSICAL_DMG_BOOST)] += c.a[BasicKey.PHYSICAL_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.FIRE_DMG_BOOST)] += c.a[BasicKey.FIRE_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.ICE_DMG_BOOST)] += c.a[BasicKey.ICE_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.LIGHTNING_DMG_BOOST)] += c.a[BasicKey.LIGHTNING_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.WIND_DMG_BOOST)] += c.a[BasicKey.WIND_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.QUANTUM_DMG_BOOST)] += c.a[BasicKey.QUANTUM_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.IMAGINARY_DMG_BOOST)] += c.a[BasicKey.IMAGINARY_DMG_BOOST]
    a[x.getActionIndex(entityIndex, StatKey.ELATION)] += c.a[BasicKey.ELATION]
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

    a[x.getActionIndex(entityIndex, StatKey.SPD)] += a[x.getActionIndex(entityIndex, StatKey.SPD_P)] * entity.baseSpd
    a[x.getActionIndex(entityIndex, StatKey.ATK)] += a[x.getActionIndex(entityIndex, StatKey.ATK_P)] * entity.baseAtk
    a[x.getActionIndex(entityIndex, StatKey.DEF)] += a[x.getActionIndex(entityIndex, StatKey.DEF_P)] * entity.baseDef
    a[x.getActionIndex(entityIndex, StatKey.HP)] += a[x.getActionIndex(entityIndex, StatKey.HP_P)] * entity.baseHp
  }
}

const setDynamicConditionals = getAllSetDynamicConditionals()

function evaluateDynamicSetConditionals(
  x: ComputedStatsContainer,
  sets: SetCounts,
  setsArray: number[],
  action: OptimizerAction,
  context: OptimizerContext,
) {
  if (setsArray[4] == setsArray[5]) {
    for (let i = 0; i < setDynamicConditionals.length; i++) {
      evaluateConditional(setDynamicConditionals[i], x, action, context)
    }
  }
}

function evaluateDynamicConditionals(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
  const characterConditionals = context.characterController.dynamicConditionals
  if (characterConditionals) {
    for (let i = 0; i < characterConditionals.length; i++) {
      evaluateConditional(characterConditionals[i], x, action, context)
    }
  }
  const lightConeConditionals = context.lightConeController.dynamicConditionals
  if (lightConeConditionals) {
    for (let i = 0; i < lightConeConditionals.length; i++) {
      evaluateConditional(lightConeConditionals[i], x, action, context)
    }
  }
  const teammateConditionals = action.teammateDynamicConditionals
  if (teammateConditionals) {
    for (let i = 0; i < teammateConditionals.length; i++) {
      evaluateConditional(teammateConditionals[i], x, action, context)
    }
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
  const setConditionals = action.setConditionals

  // Terminal ornament set conditionals
  if (setsArray[4] == setsArray[5]) {
    ornamentIndexToSetConfig[setsArray[4]].conditionals.p2t?.(x, context, setConditionals)
  }

  // Terminal relic set conditionals
  if (setsArray[0] === setsArray[1] && setsArray[1] === setsArray[2] && setsArray[2] === setsArray[3]) {
    relicIndexToSetConfig[setsArray[0]].conditionals.p4t?.(x, context, setConditionals)
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
    const conditionals = ornamentIndexToSetConfig[set4].conditionals
    conditionals.p2x?.(x, context, setConditionals)
  }

  if (set0 === set1 && set1 === set2 && set2 === set3) {
    const conditionals = relicIndexToSetConfig[set0].conditionals
    conditionals.p2x?.(x, context, setConditionals)
    conditionals.p4x?.(x, context, setConditionals)
    return
  }

  if (set0 === set1 || set0 === set2 || set0 === set3) {
    relicIndexToSetConfig[set0].conditionals.p2x?.(x, context, setConditionals)
  }

  if ((set1 === set2 || set1 === set3) && set1 !== set0) {
    relicIndexToSetConfig[set1].conditionals.p2x?.(x, context, setConditionals)
  }

  if (set2 === set3 && set2 !== set0 && set2 !== set1) {
    relicIndexToSetConfig[set2].conditionals.p2x?.(x, context, setConditionals)
  }
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
  return base[stat] + lc[stat] + relicSum.a[BasicStatToKey[stat]] + trace[stat] + setEffects
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
  return baseValue * (1 + setEffects + relicSum.a[BasicStatToKey[statP]] + trace[statP] + lc[statP]) + relicSum.a[BasicStatToKey[stat]] + trace[stat]
}
