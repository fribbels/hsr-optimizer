import {
  containerActionVal,
  containerGetValue,
  wgslDebugHitRegister,
} from 'lib/gpu/injection/injectUtils'
import { wgsl } from 'lib/gpu/injection/wgslUtils'
import {
  HKey,
  StatKey,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { DotHit, Hit } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const cLevelConst = 20 + 80

export enum DamageFunctionType {
  Default,
  Crit,
  Dot,
  Break,
  SuperBreak,
  Additional,
}

interface DamageMultipliers {
  baseUniversal: number
  def: number
  res: number
  vulnerability: number
  finalDmg: number
}

// Pre-allocated reusable object to avoid GC pressure in hot path
const m: DamageMultipliers = {
  baseUniversal: 0,
  def: 0,
  res: 0,
  vulnerability: 0,
  finalDmg: 0,
}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, hitIndex: number, context: OptimizerContext) => number
  wgsl: (action: OptimizerAction, hitIndex: number, context: OptimizerContext) => string
}

export const DefaultDamageFunction: DamageFunction = {
  apply: () => 1,
  wgsl: () => '1',
}

const elementTagToStatKeyBoost = {
  [ElementTag.Physical]: StatKey.PHYSICAL_DMG_BOOST,
  [ElementTag.Fire]: StatKey.FIRE_DMG_BOOST,
  [ElementTag.Ice]: StatKey.ICE_DMG_BOOST,
  [ElementTag.Lightning]: StatKey.LIGHTNING_DMG_BOOST,
  [ElementTag.Wind]: StatKey.WIND_DMG_BOOST,
  [ElementTag.Quantum]: StatKey.QUANTUM_DMG_BOOST,
  [ElementTag.Imaginary]: StatKey.IMAGINARY_DMG_BOOST,
}

export const CritDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)
    const dmgBoostMulti = 1 + x.getValue(StatKey.DMG_BOOST, hitIndex)
    const initial = calculateInitialDamage(x, hit, hitIndex, context)
    const crit = getCritMultiplier(x, hitIndex)

    const dmg = m.baseUniversal
      * m.def
      * m.res
      * m.vulnerability
      * m.finalDmg
      * dmgBoostMulti
      * initial
      * crit

    return dmg
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)

    // Scalings from hit definition
    const atkScaling = hit.atkScaling ?? 0
    const hpScaling = hit.hpScaling ?? 0
    const defScaling = hit.defScaling ?? 0

    const elementalDmgBoost = hit.damageElement == ElementTag.None
      ? '0.0'
      : getValue(elementTagToStatKeyBoost[hit.damageElement])

    return wgsl`
{
  // Common multipliers
  let baseUniversalMulti = 0.9 + ${containerActionVal(0, StatKey.ENEMY_WEAKNESS_BROKEN, config)} * 0.1;
  let defMulti = 100.0 / ((f32(enemyLevel) + 20.0) * max(0.0, 1.0 - combatBuffsDEF_PEN - ${getValue(StatKey.DEF_PEN)}) + 100.0);
  let resMulti = 1.0 - (enemyDamageResistance - combatBuffsRES_PEN - ${getValue(StatKey.RES_PEN)});
  let vulnMulti = 1.0 + ${getValue(StatKey.VULNERABILITY)};
  let finalDmgMulti = 1.0 + ${getValue(StatKey.FINAL_DMG_BOOST)};

  // Crit-specific
  let dmgBoostMulti = 1.0 + ${getValue(StatKey.DMG_BOOST)} + ${elementalDmgBoost};

  // Initial damage
  let atk = ${getValue(StatKey.ATK)};
  let hp = ${getValue(StatKey.HP)};
  let def = ${getValue(StatKey.DEF)};
  let atkPBoost = ${getValue(StatKey.ATK_P_BOOST)};
  let abilityMulti = ${atkScaling} * (atk + atkPBoost * ${getValue(StatKey.BASE_ATK)}) 
    + ${hpScaling} * hp 
    + ${defScaling} * def;

  // Crit multiplier
  let cr = min(1.0, ${getValue(StatKey.CR)} + ${getValue(StatKey.CR_BOOST)});
  let cd = ${getValue(StatKey.CD)} + ${getValue(StatKey.CD_BOOST)};
  let critMulti = cr * (1.0 + cd) + (1.0 - cr);

  // Final damage
  let damage = baseUniversalMulti
    * abilityMulti
    * defMulti
    * resMulti
    * vulnMulti
    * dmgBoostMulti
    * finalDmgMulti
    * critMulti;

  // comboDmg = abilityMulti;
  comboDmg += damage + 0;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const DotDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as DotHit
    computeCommonMultipliers(x, hitIndex, context)
    const dmgBoost = 1 + x.getValue(StatKey.DMG_BOOST, hitIndex)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * dmgBoost * m.finalDmg
    const initial = calculateInitialDamage(x, hit, hitIndex, context)
    const ehr = calculateEhrMultiFromHit(x, hit, hitIndex, context)

    return initial * baseMulti * ehr
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as DotHit
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)

    // Scalings from hit definition
    const atkScaling = hit.atkScaling ?? 0
    const hpScaling = hit.hpScaling ?? 0
    const defScaling = hit.defScaling ?? 0

    const elementalDmgBoost = hit.damageElement == ElementTag.None
      ? '0.0'
      : getValue(elementTagToStatKeyBoost[hit.damageElement])

    // DOT properties from hit definition (compile-time constants)
    const dotChance = hit.dotChance
    const dotSplit = hit.dotSplit ?? 0
    const dotStacks = hit.dotStacks ?? 1

    const enemyEffectRes = context.enemyEffectResistance

    return wgsl`
{
  // Common multipliers
  let baseUniversalMulti = 0.9 + ${containerActionVal(0, StatKey.ENEMY_WEAKNESS_BROKEN, config)} * 0.1;
  let defMulti = 100.0 / ((f32(enemyLevel) + 20.0) * max(0.0, 1.0 - combatBuffsDEF_PEN - ${getValue(StatKey.DEF_PEN)}) + 100.0);
  let resMulti = 1.0 - (enemyDamageResistance - combatBuffsRES_PEN - ${getValue(StatKey.RES_PEN)});
  let vulnMulti = 1.0 + ${getValue(StatKey.VULNERABILITY)};
  let finalDmgMulti = 1.0 + ${getValue(StatKey.FINAL_DMG_BOOST)};

  // DOT-specific
  let dmgBoostMulti = 1.0 + ${getValue(StatKey.DMG_BOOST)} + ${elementalDmgBoost};

  // Initial damage
  let atk = ${getValue(StatKey.ATK)};
  let hp = ${getValue(StatKey.HP)};
  let def = ${getValue(StatKey.DEF)};
  let atkPBoost = ${getValue(StatKey.ATK_P_BOOST)};
  let abilityMulti = ${atkScaling} * (atk + atkPBoost * ${getValue(StatKey.BASE_ATK)})
    + ${hpScaling} * hp
    + ${defScaling} * def;

  // EHR multiplier (from hit definition)
  let ehr = ${getValue(StatKey.EHR)};
  let effResPen = ${getValue(StatKey.EFFECT_RES_PEN)};
  let effectiveDotChance = min(1.0, ${dotChance} * (1.0 + ehr) * (1.0 - ${enemyEffectRes} + effResPen));

  let ehrMulti = effectiveDotChance;
  if (${dotSplit} > 0.0) {
    ehrMulti = (1.0 + ${dotSplit} * effectiveDotChance * (${dotStacks} - 1.0)) / (1.0 + ${dotSplit} * (${dotStacks} - 1.0));
  }

  // Final damage
  let damage = baseUniversalMulti
    * abilityMulti
    * defMulti
    * resMulti
    * vulnMulti
    * dmgBoostMulti
    * finalDmgMulti
    * ehrMulti;

  // comboDmg = abilityMulti;
  comboDmg += damage + 0;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const BreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)
    const dmgBoost = 1 + x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * dmgBoost * m.finalDmg
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

export const SuperBreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)
    const dmgBoost = 1 + x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * dmgBoost * m.finalDmg
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

export const AdditionalDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    // Same as Crit for now
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)
    const dmgBoost = 1 + x.getValue(StatKey.DMG_BOOST, hitIndex)
    const baseMulti = m.baseUniversal * m.def * m.res * m.vulnerability * dmgBoost * m.finalDmg
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

export function getDamageFunction(type: DamageFunctionType): DamageFunction {
  return DamageFunctionRegistry[type]
}

function computeCommonMultipliers(
  x: ComputedStatsContainer,
  hitIndex: number,
  context: OptimizerContext,
): void {
  const defPen = x.getValue(StatKey.DEF_PEN, hitIndex)
  const resPen = x.getValue(StatKey.RES_PEN, hitIndex)

  m.baseUniversal = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
  m.def = calculateDefMulti(context.enemyLevel, context.combatBuffs.DEF_PEN + defPen)
  m.res = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
  m.vulnerability = 1 + x.getValue(StatKey.VULNERABILITY, hitIndex)
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

// New function: reads DOT properties from hit definition
function calculateEhrMultiFromHit(
  x: ComputedStatsContainer,
  hit: DotHit,
  hitIndex: number,
  context: OptimizerContext,
): number {
  const enemyEffectRes = context.enemyEffectResistance

  // Read from hit definition instead of stats
  const dotChance = hit.dotChance
  const dotSplit = hit.dotSplit ?? 0
  const dotStacks = hit.dotStacks ?? 1

  const ehr = x.getValue(StatKey.EHR, hitIndex)
  const effResPen = x.getValue(StatKey.EFFECT_RES_PEN, hitIndex)

  const effectiveDotChance = Math.min(1, dotChance * (1 + ehr) * (1 - enemyEffectRes + effResPen))

  if (dotSplit) {
    return (1 + dotSplit * effectiveDotChance * (dotStacks - 1)) / (1 + dotSplit * (dotStacks - 1))
  }
  return effectiveDotChance
}
