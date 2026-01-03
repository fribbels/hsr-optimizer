import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  DamageFunctionType,
  Hit,
} from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const cLevelConst = 20 + 80

interface DamageMultipliers {
  baseUniversal: number
  def: number
  res: number
  vulnerability: number
  dmgBoost: number
  finalDmg: number
}

// Pre-allocated reusable object to avoid GC pressure in hot path
const m: DamageMultipliers = {
  baseUniversal: 0,
  def: 0,
  res: 0,
  vulnerability: 0,
  dmgBoost: 0,
  finalDmg: 0,
}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => number
  wgsl: (action: OptimizerAction, hitIndex: number, context: OptimizerContext) => string
}

const DefaultDamageFunction: DamageFunction = {
  apply: () => 1,
  wgsl: () => '1',
}

const CritDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context, false)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * m.dmgBoost * m.finalDmg
    const initial = calculateInitialDamage(x, hit, hitIndex, context)
    const crit = getCritMultiplier(x, hitIndex)
    return initial * baseMulti * crit
  },
  wgsl: (action, hitIndex, context) => {
    // TODO: Implement WGSL generation
    return '/* CritDamageFunction WGSL stub */'
  },
}

const DotDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context, false)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * m.dmgBoost * m.finalDmg
    const initial = calculateInitialDamage(x, hit, hitIndex, context)
    const ehr = calculateEhrMulti(x, hitIndex, context)
    return initial * baseMulti * ehr
  },
  wgsl: (action, hitIndex, context) => {
    // TODO: Implement WGSL generation
    return '/* DotDamageFunction WGSL stub */'
  },
}

const BreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context, true)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * m.dmgBoost * m.finalDmg
    const be = 1 + x.getValue(StatKey.BE, hitIndex)
    const breakBase = 3767.5533 * context.elementalBreakScaling
      * (0.5 + context.enemyMaxToughness / 120)
      * (hit.specialScaling ?? 1)
    return breakBase * baseMulti * be
  },
  wgsl: (action, hitIndex, context) => {
    // TODO: Implement WGSL generation
    return '/* BreakDamageFunction WGSL stub */'
  },
}

const SuperBreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context, true)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * m.dmgBoost * m.finalDmg
    const toughnessDmg = hit.referenceHit?.toughnessDmg ?? 0
    const superBreakMod = x.getValue(StatKey.SUPER_BREAK_MODIFIER, hitIndex)
    if (superBreakMod === 0) return 0

    const be = 1 + x.getValue(StatKey.BE, hitIndex)
    const breakEff = 1 + x.getValue(StatKey.BREAK_EFFICIENCY_BOOST, hit.referenceHit?.localHitIndex ?? hitIndex)
    return (3767.5533 / 10) * baseMulti * be * superBreakMod * breakEff * toughnessDmg
  },
  wgsl: (action, hitIndex, context) => {
    // TODO: Implement WGSL generation
    return '/* SuperBreakDamageFunction WGSL stub */'
  },
}

const AdditionalDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    // Same as Crit for now
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context, false)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * m.dmgBoost * m.finalDmg
    const initial = calculateInitialDamage(x, hit, hitIndex, context)
    const crit = getCritMultiplier(x, hitIndex)
    return initial * baseMulti * crit
  },
  wgsl: (action, hitIndex, context) => {
    // TODO: Implement WGSL generation
    return '/* AdditionalDamageFunction WGSL stub */'
  },
}

export const DamageFunctionRegistry: Record<DamageFunctionType, DamageFunction> = {
  [DamageFunctionType.Default]: DefaultDamageFunction,
  [DamageFunctionType.Crit]: CritDamageFunction,
  [DamageFunctionType.Dot]: DotDamageFunction,
  [DamageFunctionType.Break]: BreakDamageFunction,
  [DamageFunctionType.SuperBreak]: SuperBreakDamageFunction,
  [DamageFunctionType.Additional]: AdditionalDamageFunction,
}

export function calculateDamage(
  x: ComputedStatsContainer,
  action: OptimizerAction,
  hitIndex: number,
  context: OptimizerContext,
  type: DamageFunctionType,
): number {
  return DamageFunctionRegistry[type].apply(x, action, hitIndex, context)
}

function computeCommonMultipliers(
  x: ComputedStatsContainer,
  hitIndex: number,
  context: OptimizerContext,
  useHitDmgBoost: boolean = false,
): void {
  const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
  const resPen = x.getValue(StatKey.RES_PEN, hitIndex)

  m.baseUniversal = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
  m.def = calculateDefMulti(context.enemyLevel, context.combatBuffs.DEF_PEN + defPen)
  m.res = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
  m.vulnerability = 1 + x.getValue(StatKey.VULNERABILITY, hitIndex)
  m.dmgBoost = 1 + (useHitDmgBoost
    ? x.getHitValue(StatKey.DMG_BOOST, hitIndex)
    : x.getValue(StatKey.DMG_BOOST, hitIndex))
  m.finalDmg = 1 + x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)
}

function calculateInitialDamage(
  x: ComputedStatsContainer,
  hit: Hit,
  hitIndex: number,
  context: OptimizerContext,
): number {
  const atk = x.getValue(StatKey.ATK, hitIndex)
  const hp = x.getValue(StatKey.HP, hitIndex)
  const def = x.getValue(StatKey.DEF, hitIndex)
  const atkBoost = x.getValue(StatKey.ATK_P_BOOST, hitIndex)

  return (hit.atkScaling ?? 0) * (atk + atkBoost * context.baseATK)
    + (hit.hpScaling ?? 0) * hp
    + (hit.defScaling ?? 0) * def
}

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function getCritMultiplier(x: ComputedStatsContainer, hitIndex: number): number {
  const cr = Math.min(1, x.getValue(StatKey.CR, hitIndex) + x.getValue(StatKey.CR_BOOST, hitIndex))
  const cd = x.getValue(StatKey.CD, hitIndex) + x.getValue(StatKey.CD_BOOST, hitIndex)
  return cr * (1 + cd) + (1 - cr)
}

function calculateEhrMulti(
  x: ComputedStatsContainer,
  hitIndex: number,
  context: OptimizerContext,
) {
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const dotChance = x.getValue(StatKey.DOT_CHANCE, hitIndex)
  const ehr = x.getValue(StatKey.EHR, hitIndex)
  const effResPen = x.getValue(StatKey.EFFECT_RES_PEN, hitIndex)
  const dotSplit = x.getValue(StatKey.DOT_SPLIT, hitIndex)

  const effectiveDotChance = Math.min(1, dotChance * (1 + ehr) * (1 - enemyEffectRes + effResPen))

  if (dotSplit) {
    const dotStacks = x.getValue(StatKey.DOT_STACKS, hitIndex)
    return (1 + dotSplit * effectiveDotChance * (dotStacks - 1)) / (1 + dotSplit * (dotStacks - 1))
  }
  return effectiveDotChance
}
