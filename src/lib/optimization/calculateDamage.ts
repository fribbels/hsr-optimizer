import { SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { ComputedStatsArray, getElementalDamageType, getResPenType, Key } from 'lib/optimization/computedStatsArray'
import { p2, p4 } from 'lib/optimization/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function calculateBaseMultis(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.finalizeCalculations) lightConeConditionalController.finalizeCalculations(x, action, context)
  if (characterConditionalController.finalizeCalculations) characterConditionalController.finalizeCalculations(x, action, context)
}

export function calculateDamage(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  if (x.m) calculateDamage(x.m, action, context)

  const eLevel = context.enemyLevel
  const a = x.a

  calculateEhp(x, context)
  calculateHeal(x, context)
  calculateShield(x, context)

  a[Key.ELEMENTAL_DMG] += getElementalDamageType(x, context.elementalDamageType)

  const baseDmgBoost = 1 + a[Key.ELEMENTAL_DMG]
  const baseDefPen = a[Key.DEF_PEN] + context.combatBuffs.DEF_PEN
  const baseUniversalMulti = a[Key.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
  const baseResistance = context.enemyDamageResistance - a[Key.RES_PEN] - context.combatBuffs.RES_PEN - getResPenType(x, context.elementalResPenType)
  const baseBreakEfficiencyBoost = 1 + a[Key.BREAK_EFFICIENCY_BOOST]

  // === Default ===

  if (action.actionType == 'DEFAULT') {
    const dotDmgBoostMulti = baseDmgBoost + a[Key.DOT_BOOST]
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + a[Key.DOT_DEF_PEN])
    const dotVulnerabilityMulti = 1 + a[Key.VULNERABILITY] + a[Key.DOT_VULNERABILITY]
    const dotResMulti = 1 - (baseResistance - a[Key.DOT_RES_PEN])
    const dotEhrMulti = calculateEhrMulti(x, context)

    a[Key.DOT_DMG] = calculateDotDmg(
      a[Key.DOT_DMG],
      (baseUniversalMulti),
      (dotDmgBoostMulti),
      (dotDefMulti),
      (dotVulnerabilityMulti),
      (dotResMulti),
      (dotEhrMulti),
    )
  }

  // === Super / Break ===

  // Multiply by additional vulnerability
  a[Key.BREAK_DMG]
    = baseUniversalMulti
    * 3767.5533
    * context.elementalBreakScaling
    * calculateDefMulti(eLevel, baseDefPen + a[Key.BREAK_DEF_PEN])
    * (0.5 + context.enemyMaxToughness / 120)
    * (1 + a[Key.VULNERABILITY] + a[Key.BREAK_VULNERABILITY])
    * (1 - baseResistance)
    * (1 + a[Key.BE])
    * (1 + a[Key.BREAK_BOOST])

  // The % of Super Break instance dmg
  const baseSuperBreakModifier = a[Key.SUPER_BREAK_MODIFIER] + a[Key.SUPER_BREAK_HMC_MODIFIER]

  // The multiplier for an instance of 100% Super Break damage
  // Multiply this by the (1 + BREAK_EFFICIENCY_BOOST) * (SUPER_BREAK_MODIFIER)
  const baseSuperBreakInstanceDmg
    = baseUniversalMulti
    * 3767.5533
    * calculateDefMulti(eLevel, baseDefPen + a[Key.BREAK_DEF_PEN] + a[Key.SUPER_BREAK_DEF_PEN])
    * (1 + a[Key.VULNERABILITY] + a[Key.BREAK_VULNERABILITY])
    * (1 - baseResistance)
    * (1 + a[Key.BE])
    * (1 + a[Key.BREAK_BOOST])
    * (1 / 30)

  if (action.actionType == 'BASIC' || action.actionType == 'DEFAULT') {
    a[Key.BASIC_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      a[Key.BASIC_DMG],
      a[Key.BASIC_BOOST],
      a[Key.BASIC_VULNERABILITY],
      a[Key.BASIC_DEF_PEN],
      a[Key.BASIC_RES_PEN],
      a[Key.BASIC_CR_BOOST],
      a[Key.BASIC_CD_BOOST],
      a[Key.BASIC_ORIGINAL_DMG_BOOST],
      a[Key.BASIC_BREAK_EFFICIENCY_BOOST],
      a[Key.BASIC_SUPER_BREAK_MODIFIER],
      a[Key.BASIC_BREAK_DMG_MODIFIER],
      a[Key.BASIC_TOUGHNESS_DMG],
      a[Key.BASIC_ADDITIONAL_DMG],
      0, // a[Key.BASIC_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.BASIC_ADDITIONAL_DMG_CD_OVERRIDE],
      x.m ? x.m.a[Key.BASIC_DMG] : 0,
    )
  }

  if (action.actionType == 'SKILL' || action.actionType == 'DEFAULT') {
    a[Key.SKILL_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      a[Key.SKILL_DMG],
      a[Key.SKILL_BOOST],
      a[Key.SKILL_VULNERABILITY],
      a[Key.SKILL_DEF_PEN],
      a[Key.SKILL_RES_PEN],
      a[Key.SKILL_CR_BOOST],
      a[Key.SKILL_CD_BOOST],
      a[Key.SKILL_ORIGINAL_DMG_BOOST],
      0, // a[Key.SKILL_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.SKILL_SUPER_BREAK_MODIFIER],
      0, // a[Key.SKILL_BREAK_DMG_MODIFIER],
      a[Key.SKILL_TOUGHNESS_DMG],
      a[Key.SKILL_ADDITIONAL_DMG],
      0, // a[Key.SKILL_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.SKILL_ADDITIONAL_DMG_CD_OVERRIDE],
      x.m ? x.m.a[Key.SKILL_DMG] : 0,
    )
  }

  if (action.actionType == 'ULT' || action.actionType == 'DEFAULT') {
    a[Key.ULT_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      a[Key.ULT_DMG],
      a[Key.ULT_BOOST],
      a[Key.ULT_VULNERABILITY],
      a[Key.ULT_DEF_PEN],
      a[Key.ULT_RES_PEN],
      a[Key.ULT_CR_BOOST],
      a[Key.ULT_CD_BOOST],
      a[Key.ULT_ORIGINAL_DMG_BOOST],
      a[Key.ULT_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.ULT_SUPER_BREAK_MODIFIER],
      0, // a[Key.ULT_BREAK_DMG_MODIFIER],
      a[Key.ULT_TOUGHNESS_DMG],
      a[Key.ULT_ADDITIONAL_DMG],
      a[Key.ULT_ADDITIONAL_DMG_CR_OVERRIDE],
      a[Key.ULT_ADDITIONAL_DMG_CD_OVERRIDE],
      x.m ? x.m.a[Key.ULT_DMG] : 0,
    )
  }

  if (action.actionType == 'FUA' || action.actionType == 'DEFAULT') {
    a[Key.FUA_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      a[Key.FUA_DMG],
      a[Key.FUA_BOOST],
      a[Key.FUA_VULNERABILITY],
      a[Key.FUA_DEF_PEN],
      a[Key.FUA_RES_PEN],
      a[Key.FUA_CR_BOOST],
      a[Key.FUA_CD_BOOST],
      0, // a[Key.FUA_ORIGINAL_DMG_BOOST],
      0, // a[Key.FUA_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.FUA_SUPER_BREAK_MODIFIER],
      0, // a[Key.FUA_BREAK_DMG_MODIFIER],
      a[Key.FUA_TOUGHNESS_DMG],
      a[Key.FUA_ADDITIONAL_DMG],
      0, // a[Key.FUA_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.FUA_ADDITIONAL_DMG_CD_OVERRIDE],
      x.m ? x.m.a[Key.FUA_DMG] : 0,
    )
  }

  if (action.actionType == 'MEMO_SKILL' || action.actionType == 'DEFAULT') {
    if (x.m) {
      a[Key.MEMO_SKILL_DMG] += x.m.a[Key.MEMO_SKILL_DMG]
    } else {
      a[Key.MEMO_SKILL_DMG] = calculateAbilityDmg(
        x,
        action,
        context,
        baseUniversalMulti,
        baseDmgBoost,
        baseDefPen,
        baseResistance,
        baseSuperBreakInstanceDmg,
        baseSuperBreakModifier,
        baseBreakEfficiencyBoost,
        a[Key.MEMO_SKILL_DMG],
        0, // a[Key.MEMO_SKILL_BOOST],
        0, // a[Key.MEMO_SKILL_VULNERABILITY],
        0, // a[Key.MEMO_SKILL_DEF_PEN],
        0, // a[Key.MEMO_SKILL_RES_PEN],
        0, // a[Key.MEMO_SKILL_CR_BOOST],
        0, // a[Key.MEMO_SKILL_CD_BOOST],
        0, // a[Key.MEMO_SKILL_ORIGINAL_DMG_BOOST],
        0, // a[Key.MEMO_SKILL_BREAK_EFFICIENCY_BOOST],
        0, // a[Key.MEMO_SKILL_SUPER_BREAK_MODIFIER],
        0, // a[Key.MEMO_SKILL_BREAK_DMG_MODIFIER],
        0, // a[Key.MEMO_SKILL_TOUGHNESS_DMG],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG_CR_OVERRIDE],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG_CD_OVERRIDE],
        0, // No memo joint
      )
    }
  }
}

const cLevelConst = 20 + 80

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhp(x: ComputedStatsArray, context: OptimizerContext) {
  const a = x.a
  const sets = x.c.sets

  let ehp = a[Key.HP] / (1 - a[Key.DEF] / (a[Key.DEF] + 200 + 10 * context.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * a[Key.DMG_RED_MULTI])
  a[Key.EHP] = ehp
}

function calculateHeal(x: ComputedStatsArray, context: OptimizerContext) {
  const a = x.a
  a[Key.HEAL_VALUE] = a[Key.HEAL_VALUE] * (
    1
    + a[Key.OHB]
    + a[Key.SKILL_OHB] * (a[Key.HEAL_TYPE] == SKILL_DMG_TYPE ? 1 : 0)
    + a[Key.ULT_OHB] * (a[Key.HEAL_TYPE] == ULT_DMG_TYPE ? 1 : 0)
  )
}

function calculateShield(x: ComputedStatsArray, context: OptimizerContext) {
  const a = x.a
  const sets = x.c.sets

  a[Key.SHIELD_VALUE] = a[Key.SHIELD_VALUE] * (1 + 0.20 * p4(sets.KnightOfPurityPalace))
}

function calculateAbilityDmg(
  x: ComputedStatsArray,
  action: OptimizerAction,
  context: OptimizerContext,
  baseUniversalMulti: number,
  baseDmgBoost: number,
  baseDefPen: number,
  baseResistance: number,
  baseSuperBreakInstanceDmg: number,
  baseSuperBreakModifier: number,
  baseBreakEfficiencyBoost: number,
  abilityDmg: number,
  abilityDmgBoost: number,
  abilityVulnerability: number,
  abilityDefPen: number,
  abilityResPen: number,
  abilityCrBoost: number,
  abilityCdBoost: number,
  abilityOriginalDmgBoost: number,
  abilityBreakEfficiencyBoost: number,
  abilitySuperBreakModifier: number,
  abilityBreakDmgModifier: number,
  abilityToughnessDmg: number,
  abilityAdditionalDmg: number,
  abilityAdditionalCrOverride: number,
  abilityAdditionalCdOverride: number,
  abilityMemoJointDamage: number,
) {
  const a = x.a
  const eLevel = context.enemyLevel

  // === Crit DMG ===

  let abilityCritDmgOutput = 0
  if (abilityDmg) {
    const abilityCr = Math.min(1, a[Key.CR] + abilityCrBoost)
    const abilityCd = a[Key.CD] + abilityCdBoost
    const abilityCritMulti = abilityCr * (1 + abilityCd) + (1 - abilityCr)
    const abilityVulnerabilityMulti = 1 + a[Key.VULNERABILITY] + abilityVulnerability
    const abilityDefMulti = calculateDefMulti(eLevel, baseDefPen + abilityDefPen)
    const abilityResMulti = 1 - (baseResistance - abilityResPen)
    const abilityOriginalDmgMulti = 1 + abilityOriginalDmgBoost

    abilityCritDmgOutput = calculateCritDmg(
      abilityDmg,
      (baseUniversalMulti),
      (baseDmgBoost + abilityDmgBoost),
      (abilityDefMulti),
      (abilityVulnerabilityMulti),
      (abilityCritMulti),
      (abilityResMulti),
      (abilityOriginalDmgMulti),
    )
  }

  // === Break DMG ===

  let abilityBreakDmgOutput = 0
  if (abilityBreakDmgModifier) {
    abilityBreakDmgOutput = abilityBreakDmgModifier * a[Key.BREAK_DMG]
  }

  // === Super Break DMG ===

  let abilitySuperBreakDmgOutput = 0
  if (baseSuperBreakModifier + abilitySuperBreakModifier > 0) {
    abilitySuperBreakDmgOutput = calculateSuperBreakDmg(
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier + abilitySuperBreakModifier,
      baseBreakEfficiencyBoost + abilityBreakEfficiencyBoost,
      abilityToughnessDmg,
    )
  }

  // === Additional DMG ===

  let abilityAdditionalDmgOutput = 0
  if (abilityAdditionalDmg > 0) {
    const additionalDmgCr = abilityAdditionalCrOverride || Math.min(1, a[Key.CR])
    const additionalDmgCd = abilityAdditionalCdOverride || a[Key.CD]
    const abilityAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr)
    abilityAdditionalDmgOutput = calculateAdditionalDmg(
      abilityAdditionalDmg,
      (baseUniversalMulti),
      (baseDmgBoost + a[Key.ADDITIONAL_BOOST]),
      calculateDefMulti(eLevel, baseDefPen),
      (1 + a[Key.VULNERABILITY]),
      (abilityAdditionalCritMulti),
      (1 - baseResistance),
    )
  }

  // === Primary DMG ===

  const primaryDmgOutput = abilityCritDmgOutput
    + abilityBreakDmgOutput
    + abilitySuperBreakDmgOutput
    + abilityAdditionalDmgOutput

  // === True DMG ===

  const trueDmgOutput = a[Key.TRUE_DMG_MODIFIER] * primaryDmgOutput

  // === Memo Joint DMG ===

  let memoJointDmgOutput = 0
  if (abilityMemoJointDamage > 0) {
    memoJointDmgOutput += abilityMemoJointDamage
  }

  return primaryDmgOutput + trueDmgOutput + memoJointDmgOutput
}

function calculateSuperBreakDmg(
  superBreakInstanceDmg: number,
  superBreakModifier: number,
  breakEfficiencyBoost: number,
  toughnessDmg: number,
) {
  return superBreakInstanceDmg
    * superBreakModifier
    * breakEfficiencyBoost
    * toughnessDmg
}

function calculateCritDmg(
  baseDmg: number,
  universalMulti: number,
  dmgBoostMulti: number,
  defMulti: number,
  vulnerabilityMulti: number,
  critMulti: number,
  resMulti: number,
  originalDmgMulti: number,
) {
  return baseDmg
    * universalMulti
    * dmgBoostMulti
    * defMulti
    * vulnerabilityMulti
    * critMulti
    * resMulti
    * originalDmgMulti
}

function calculateDotDmg(
  baseDmg: number,
  universalMulti: number,
  dmgBoostMulti: number,
  defMulti: number,
  vulnerabilityMulti: number,
  resMulti: number,
  ehrMulti: number,
) {
  return baseDmg
    * universalMulti
    * dmgBoostMulti
    * defMulti
    * vulnerabilityMulti
    * resMulti
    * ehrMulti
}

function calculateEhrMulti(
  x: ComputedStatsArray,
  context: OptimizerContext,
) {
  const a = x.a
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const effectiveDotChance = Math.min(1, a[Key.DOT_CHANCE] * (1 + a[Key.EHR]) * (1 - enemyEffectRes + a[Key.EFFECT_RES_PEN]))
  return a[Key.DOT_SPLIT]
    ? (1 + a[Key.DOT_SPLIT] * effectiveDotChance * (a[Key.DOT_STACKS] - 1)) / (1 + 0.05 * (a[Key.DOT_STACKS] - 1))
    : effectiveDotChance
}

function calculateAdditionalDmg(
  baseDmg: number,
  universalMulti: number,
  dmgBoostMulti: number,
  defMulti: number,
  vulnerabilityMulti: number,
  critMulti: number,
  resMulti: number,
) {
  return baseDmg
    * universalMulti
    * dmgBoostMulti
    * defMulti
    * vulnerabilityMulti
    * critMulti
    * resMulti
}
