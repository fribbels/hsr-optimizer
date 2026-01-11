import {
  containerActionVal,
  containerGetValue,
  containerHitVal,
  wgslDebugActionRegister,
  wgslDebugHitRegister,
} from 'lib/gpu/injection/injectUtils'
import { wgsl } from 'lib/gpu/injection/wgslUtils'
import {
  HKey,
  HKeyValue,
  StatKey,
  StatKeyValue,
} from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  BreakHit,
  DotHit,
  HealHit,
  Hit,
  ShieldHit,
} from 'types/hitConditionalTypes'
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
  Heal,
  Shield,
}

interface DamageMultipliers {
  baseUniversalMulti: number
  defMulti: number
  resMulti: number
  vulnMulti: number
  finalDmgMulti: number
}

// Pre-allocated reusable object to avoid GC pressure in hot path
const m: DamageMultipliers = {
  baseUniversalMulti: 0,
  defMulti: 0,
  resMulti: 0,
  vulnMulti: 0,
  finalDmgMulti: 0,
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

// Helper function to calculate total damage boost (generic + elemental)
function getTotalDmgBoost(
  x: ComputedStatsContainer,
  hit: Hit,
  hitIndex: number,
): number {
  const genericDmgBoost = x.getValue(StatKey.DMG_BOOST, hitIndex)
  const elementalDmgBoost = hit.damageElement === ElementTag.None
    ? 0
    : x.getValue(elementTagToStatKeyBoost[hit.damageElement], hitIndex)
  return 1 + genericDmgBoost + elementalDmgBoost
}

export const CritDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)

    const dmgBoostMulti = getTotalDmgBoost(x, hit, hitIndex)
    const initialDmgMulti = calculateInitialDamage(x, hit, hitIndex, context)
    const critMulti = getCritMultiplier(x, hitIndex)

    const dmg = m.baseUniversalMulti
      * m.defMulti
      * m.resMulti
      * m.vulnMulti
      * m.finalDmgMulti
      * dmgBoostMulti
      * initialDmgMulti
      * critMulti

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
    * defMulti
    * resMulti
    * vulnMulti
    * finalDmgMulti
    * dmgBoostMulti
    * abilityMulti
    * critMulti;

  comboDmg += damage;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const DotDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as DotHit
    computeCommonMultipliers(x, hitIndex, context)

    const dmgBoostMulti = getTotalDmgBoost(x, hit, hitIndex)
    const abilityMulti = calculateInitialDamage(x, hit, hitIndex, context)
    const ehrMulti = calculateEhrMultiFromHit(x, hit, hitIndex, context)

    const dmg = m.baseUniversalMulti
      * m.defMulti
      * m.resMulti
      * m.vulnMulti
      * m.finalDmgMulti
      * dmgBoostMulti
      * abilityMulti
      * ehrMulti

    return dmg
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
    const dotBaseChance = hit.dotBaseChance
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
  let effectiveDotChance = min(1.0, ${dotBaseChance} * (1.0 + ehr) * (1.0 - ${enemyEffectRes} + effResPen));

  let ehrMulti = select(
    effectiveDotChance,
    (1.0 + ${dotSplit} * effectiveDotChance * (${dotStacks} - 1.0)) / (1.0 + ${dotSplit} * (${dotStacks} - 1.0)),
    ${dotSplit} > 0.0
  );

  // Final damage
  let damage = baseUniversalMulti
    * defMulti
    * resMulti
    * vulnMulti
    * finalDmgMulti
    * dmgBoostMulti
    * abilityMulti
    * ehrMulti;

  comboDmg += damage;
  
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const BreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as BreakHit
    computeCommonMultipliers(x, hitIndex, context)

    const dmgBoostMulti = 1 + x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const breakBaseMulti = 3767.5533 * context.elementalBreakScaling
      * (0.5 + context.enemyMaxToughness / 120)
      * (hit.specialScaling ?? 1)
    const beMulti = 1 + x.getValue(StatKey.BE, hitIndex)

    const dmg = m.baseUniversalMulti
      * m.defMulti
      * m.resMulti
      * m.vulnMulti
      * m.finalDmgMulti
      * dmgBoostMulti
      * breakBaseMulti
      * beMulti

    return dmg
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as BreakHit
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)
    const getHitValue = (stat: HKeyValue) => containerHitVal(entityIndex, hitIndex, stat, config)

    // Break-specific constants from hit definition and context
    const specialScaling = hit.specialScaling ?? 1
    const elementalBreakScaling = context.elementalBreakScaling
    const enemyMaxToughness = context.enemyMaxToughness

    return wgsl`
{
  // Common multipliers
  let baseUniversalMulti = 0.9 + ${containerActionVal(0, StatKey.ENEMY_WEAKNESS_BROKEN, config)} * 0.1;
  let defMulti = 100.0 / ((f32(enemyLevel) + 20.0) * max(0.0, 1.0 - combatBuffsDEF_PEN - ${getValue(StatKey.DEF_PEN)}) + 100.0);
  let resMulti = 1.0 - (enemyDamageResistance - combatBuffsRES_PEN - ${getValue(StatKey.RES_PEN)});
  let vulnMulti = 1.0 + ${getValue(StatKey.VULNERABILITY)};
  let finalDmgMulti = 1.0 + ${getValue(StatKey.FINAL_DMG_BOOST)};

  // Break-specific: dmgBoost is hit-level only (no action-level, no elemental boost)
  let dmgBoostMulti = 1.0 + ${getHitValue(HKey.DMG_BOOST)};

  // Break base damage calculation
  let breakBaseMulti = 3767.5533 * ${elementalBreakScaling}
    * (0.5 + ${enemyMaxToughness} / 120.0)
    * ${specialScaling};

  // BE multiplier (action + hit combined)
  let beMulti = 1.0 + ${getValue(StatKey.BE)};

  // Final damage
  let damage = baseUniversalMulti
    * defMulti
    * resMulti
    * vulnMulti
    * finalDmgMulti
    * dmgBoostMulti
    * breakBaseMulti
    * beMulti;

  comboDmg += damage;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const SuperBreakDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)

    const superBreakModMulti = x.getValue(StatKey.SUPER_BREAK_MODIFIER, hitIndex)
    if (superBreakModMulti === 0) return 0

    const dmgBoostMulti = 1 + x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const superBreakBaseMulti = (3767.5533 / 10) * (hit.referenceHit?.toughnessDmg ?? 0)
    const beMulti = 1 + x.getValue(StatKey.BE, hitIndex)
    const breakEfficiencyMulti = 1 + x.getValue(StatKey.BREAK_EFFICIENCY_BOOST, hit.referenceHit?.localHitIndex ?? hitIndex)

    const dmg = m.baseUniversalMulti
      * m.defMulti
      * m.resMulti
      * m.vulnMulti
      * m.finalDmgMulti
      * dmgBoostMulti
      * superBreakBaseMulti
      * beMulti
      * superBreakModMulti
      * breakEfficiencyMulti

    return dmg
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)
    const getHitValue = (stat: HKeyValue) => containerHitVal(entityIndex, hitIndex, stat, config)

    // SuperBreak-specific constants from hit definition
    const toughnessDmg = hit.referenceHit?.toughnessDmg ?? 0
    const referenceHitIndex = hit.referenceHit?.localHitIndex ?? hitIndex

    return wgsl`
{
  // Common multipliers
  let baseUniversalMulti = 0.9 + ${containerActionVal(0, StatKey.ENEMY_WEAKNESS_BROKEN, config)} * 0.1;
  let defMulti = 100.0 / ((f32(enemyLevel) + 20.0) * max(0.0, 1.0 - combatBuffsDEF_PEN - ${getValue(StatKey.DEF_PEN)}) + 100.0);
  let resMulti = 1.0 - (enemyDamageResistance - combatBuffsRES_PEN - ${getValue(StatKey.RES_PEN)});
  let vulnMulti = 1.0 + ${getValue(StatKey.VULNERABILITY)};
  let finalDmgMulti = 1.0 + ${getValue(StatKey.FINAL_DMG_BOOST)};

  // SuperBreak-specific: dmgBoost is hit-level only (no action-level, no elemental boost)
  let dmgBoostMulti = 1.0 + ${getHitValue(HKey.DMG_BOOST)};

  // SuperBreak base damage calculation
  let superBreakBaseMulti = (3767.5533 / 10.0) * ${toughnessDmg};

  // BE multiplier (action + hit combined)
  let beMulti = 1.0 + ${getValue(StatKey.BE)};

  // SuperBreak modifier
  let superBreakModMulti = ${getValue(StatKey.SUPER_BREAK_MODIFIER)};

  // Break efficiency multiplier from reference hit
  let breakEfficiencyMulti = 1.0 + ${containerGetValue(entityIndex, referenceHitIndex, StatKey.BREAK_EFFICIENCY_BOOST, config)};

  // Final damage
  let damage = baseUniversalMulti
    * defMulti
    * resMulti
    * vulnMulti
    * finalDmgMulti
    * dmgBoostMulti
    * superBreakBaseMulti
    * beMulti
    * superBreakModMulti
    * breakEfficiencyMulti;

  comboDmg += damage;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

export const AdditionalDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex]
    computeCommonMultipliers(x, hitIndex, context)

    const dmgBoostMulti = getTotalDmgBoost(x, hit, hitIndex)
    const abilityMulti = calculateInitialDamage(x, hit, hitIndex, context)
    const critMulti = getCritMultiplier(x, hitIndex)

    const dmg = m.baseUniversalMulti
      * m.defMulti
      * m.resMulti
      * m.vulnMulti
      * m.finalDmgMulti
      * dmgBoostMulti
      * abilityMulti
      * critMulti

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

  // Additional-specific: uses generic + elemental dmg boost (same as Crit)
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
    * defMulti
    * resMulti
    * vulnMulti
    * finalDmgMulti
    * dmgBoostMulti
    * abilityMulti
    * critMulti;

  comboDmg += damage;
  ${wgslDebugHitRegister(hit, context)}
}
`
  },
}

// Heal hits use: BaseHeal = (ATK * atkScaling) + (HP * hpScaling) + flatHeal
// Then multiplied by (1 + OHB) * (1 + DMG_BOOST filtered by OutputTag.HEAL)
export const HealDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as HealHit

    // Base heal from scalings
    const atk = x.getValue(StatKey.ATK, hitIndex)
    const hp = x.getValue(StatKey.HP, hitIndex)
    const baseHeal = (hit.atkScaling ?? 0) * atk
      + (hit.hpScaling ?? 0) * hp
      + (hit.flatHeal ?? 0)

    // OHB multiplier - already filtered by damageType at buff application time
    const ohb = x.getValue(StatKey.OHB, hitIndex)
    const ohbMulti = 1 + ohb

    // Heal boost (reuses DMG_BOOST slot, filtered by OutputTag at buff application)
    const healBoost = x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const healBoostMulti = 1 + healBoost

    return baseHeal * ohbMulti * healBoostMulti
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as HealHit
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)
    const getHitValue = (stat: HKeyValue) => containerHitVal(entityIndex, hitIndex, stat, config)

    const atkScaling = hit.atkScaling ?? 0
    const hpScaling = hit.hpScaling ?? 0
    const flatHeal = hit.flatHeal ?? 0

    return wgsl`
{
  // Base heal calculation
  let atk = ${getValue(StatKey.ATK)};
  let hp = ${getValue(StatKey.HP)};
  let baseHeal = ${atkScaling} * atk + ${hpScaling} * hp + ${flatHeal};

  // OHB multiplier (already filtered by damageType at buff time)
  let ohb = ${getValue(StatKey.OHB)};
  let ohbMulti = 1.0 + ohb;

  // Heal boost multiplier (from DMG_BOOST slot, filtered by outputType at buff time)
  let healBoost = ${getHitValue(HKey.DMG_BOOST)};
  let healBoostMulti = 1.0 + healBoost;

  let heal = baseHeal * ohbMulti * healBoostMulti;
  comboHeal += heal;

  ${wgslDebugHitRegister(hit, context, 'heal')}
}
`
  },
}

// Shield hits use: BaseShield = (DEF * defScaling) + (HP * hpScaling) + flatShield
// Then multiplied by (1 + DMG_BOOST filtered by OutputTag.SHIELD)
export const ShieldDamageFunction: DamageFunction = {
  apply: (x, action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as ShieldHit

    // Base shield from scalings
    const def = x.getValue(StatKey.DEF, hitIndex)
    const hp = x.getValue(StatKey.HP, hitIndex)
    const baseShield = (hit.defScaling ?? 0) * def
      + (hit.hpScaling ?? 0) * hp
      + (hit.flatShield ?? 0)

    // Shield boost (from DMG_BOOST slot, filtered by OutputTag at buff application)
    const shieldBoost = x.getHitValue(HKey.DMG_BOOST, hitIndex)
    const shieldBoostMulti = 1 + shieldBoost

    return baseShield * shieldBoostMulti
  },
  wgsl: (action, hitIndex, context) => {
    const hit = action.hits![hitIndex] as ShieldHit
    const config = action.config
    const entityIndex = hit.sourceEntityIndex ?? 0

    const getValue = (stat: StatKeyValue) => containerGetValue(entityIndex, hitIndex, stat, config)
    const getHitValue = (stat: HKeyValue) => containerHitVal(entityIndex, hitIndex, stat, config)

    const defScaling = hit.defScaling ?? 0
    const hpScaling = hit.hpScaling ?? 0
    const flatShield = hit.flatShield ?? 0

    return wgsl`
{
  // Base shield calculation
  let def = ${getValue(StatKey.DEF)};
  let hp = ${getValue(StatKey.HP)};
  let baseShield = ${defScaling} * def + ${hpScaling} * hp + ${flatShield};

  // Shield boost multiplier (from DMG_BOOST slot, filtered by outputType at buff time)
  let shieldBoost = ${getHitValue(HKey.DMG_BOOST)};
  let shieldBoostMulti = 1.0 + shieldBoost;

  let shield = baseShield * shieldBoostMulti;
  comboShield += shield;

  ${wgslDebugHitRegister(hit, context, 'shield')}
}
`
  },
}

export const DamageFunctionRegistry: Record<DamageFunctionType, DamageFunction> = {
  [DamageFunctionType.Default]: DefaultDamageFunction,
  [DamageFunctionType.Crit]: CritDamageFunction,
  [DamageFunctionType.Dot]: DotDamageFunction,
  [DamageFunctionType.Break]: BreakDamageFunction,
  [DamageFunctionType.SuperBreak]: SuperBreakDamageFunction,
  [DamageFunctionType.Additional]: AdditionalDamageFunction,
  [DamageFunctionType.Heal]: HealDamageFunction,
  [DamageFunctionType.Shield]: ShieldDamageFunction,
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

  m.baseUniversalMulti = x.a[StatKey.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
  m.defMulti = calculateDefMulti(context.enemyLevel, context.combatBuffs.DEF_PEN + defPen)
  m.resMulti = 1 - (context.enemyDamageResistance - context.combatBuffs.RES_PEN - resPen)
  m.vulnMulti = 1 + x.getValue(StatKey.VULNERABILITY, hitIndex)
  m.finalDmgMulti = 1 + x.getValue(StatKey.FINAL_DMG_BOOST, hitIndex)
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
  const dotBaseChance = hit.dotBaseChance
  const dotSplit = hit.dotSplit ?? 0
  const dotStacks = hit.dotStacks ?? 1

  const ehr = x.getValue(StatKey.EHR, hitIndex)
  const effResPen = x.getValue(StatKey.EFFECT_RES_PEN, hitIndex)

  const effectiveDotChance = Math.min(1, dotBaseChance * (1 + ehr) * (1 - enemyEffectRes + effResPen))

  if (dotSplit) {
    return (1 + dotSplit * effectiveDotChance * (dotStacks - 1)) / (1 + dotSplit * (dotStacks - 1))
  }
  return effectiveDotChance
}
