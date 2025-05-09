import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { ComputedStatsArray, DefaultActionDamageValues, getElementalDamageType, getResPenType, Key } from 'lib/optimization/computedStatsArray'
import { StatsConfigByIndex } from 'lib/optimization/config/computedStatsConfig'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function calculateBaseMultis(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.finalizeCalculations) lightConeConditionalController.finalizeCalculations(x, action, context)
  if (characterConditionalController.finalizeCalculations) characterConditionalController.finalizeCalculations(x, action, context)
}

export function calculateDamage(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
  if (x.a[Key.MEMOSPRITE]) {
    calculateDamage(x.m, action, context)
  }

  const eLevel = context.enemyLevel
  const a = x.a

  calculateEhp(x, context)
  calculateHeal(x, context)
  calculateShield(x, context)

  a[Key.CR] += a[Key.CR_BOOST]
  a[Key.CD] += a[Key.CD_BOOST]
  a[Key.ATK] += a[Key.ATK_P_BOOST] * context.baseATK
  a[Key.ELEMENTAL_DMG] += getElementalDamageType(x, context.elementalDamageType)

  const baseDmgBoost = 1 + a[Key.ELEMENTAL_DMG]
  const baseDefPen = a[Key.DEF_PEN] + context.combatBuffs.DEF_PEN
  const baseUniversalMulti = a[Key.ENEMY_WEAKNESS_BROKEN] ? 1 : 0.9
  const baseResistance = context.enemyDamageResistance - a[Key.RES_PEN] - context.combatBuffs.RES_PEN - getResPenType(x, context.elementalResPenType)
  const baseBreakEfficiencyBoost = 1 + a[Key.BREAK_EFFICIENCY_BOOST]

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
    * (1 + a[Key.BREAK_DMG_BOOST])

  // The multiplier for an instance of 100% Super Break damage
  // Multiply this by the (1 + BREAK_EFFICIENCY_BOOST) * (SUPER_BREAK_MODIFIER)
  const baseSuperBreakInstanceDmg
    = baseUniversalMulti
    * 3767.5533 / 10
    * calculateDefMulti(eLevel, baseDefPen + a[Key.SUPER_BREAK_DEF_PEN])
    * (1 + a[Key.VULNERABILITY] + a[Key.SUPER_BREAK_VULNERABILITY])
    * (1 - baseResistance)
    * (1 + a[Key.BE])
    * (1 + a[Key.SUPER_BREAK_DMG_BOOST])

  // === Default ===

  if (action.actionType == AbilityKind.NULL) {
    // NOOP
  }

  if ((action.actionType == AbilityKind.BASIC || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.BASIC) {
    const initialDmg = calculateInitial(
      a,
      context,
      a[Key.BASIC_DMG],
      a[Key.BASIC_HP_SCALING],
      a[Key.BASIC_DEF_SCALING],
      a[Key.BASIC_ATK_SCALING],
      a[Key.BASIC_ATK_P_BOOST],
    )
    a[Key.BASIC_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      Key.BASIC_DMG,
      initialDmg,
      a[Key.BASIC_DMG_BOOST],
      a[Key.BASIC_VULNERABILITY],
      a[Key.BASIC_DEF_PEN],
      a[Key.BASIC_RES_PEN],
      a[Key.BASIC_CR_BOOST],
      a[Key.BASIC_CD_BOOST],
      a[Key.BASIC_FINAL_DMG_BOOST],
      a[Key.BASIC_BREAK_EFFICIENCY_BOOST],
      a[Key.BASIC_SUPER_BREAK_MODIFIER],
      a[Key.BASIC_BREAK_DMG_MODIFIER],
      a[Key.BASIC_TOUGHNESS_DMG],
      a[Key.BASIC_ADDITIONAL_DMG],
      0, // a[Key.BASIC_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.BASIC_ADDITIONAL_DMG_CD_OVERRIDE],
      a[Key.BASIC_TRUE_DMG_MODIFIER],
      x.a[Key.MEMOSPRITE] ? x.m.a[Key.BASIC_DMG] : 0,
    )
  }

  if ((action.actionType == AbilityKind.SKILL || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.SKILL) {
    const initialDmg = calculateInitial(
      a,
      context,
      a[Key.SKILL_DMG],
      a[Key.SKILL_HP_SCALING],
      a[Key.SKILL_DEF_SCALING],
      a[Key.SKILL_ATK_SCALING],
      a[Key.SKILL_ATK_P_BOOST],
    )
    a[Key.SKILL_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      Key.SKILL_DMG,
      initialDmg,
      a[Key.SKILL_DMG_BOOST],
      a[Key.SKILL_VULNERABILITY],
      a[Key.SKILL_DEF_PEN],
      a[Key.SKILL_RES_PEN],
      a[Key.SKILL_CR_BOOST],
      a[Key.SKILL_CD_BOOST],
      a[Key.SKILL_FINAL_DMG_BOOST],
      0, // a[Key.SKILL_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.SKILL_SUPER_BREAK_MODIFIER],
      0, // a[Key.SKILL_BREAK_DMG_MODIFIER],
      a[Key.SKILL_TOUGHNESS_DMG],
      a[Key.SKILL_ADDITIONAL_DMG],
      0, // a[Key.SKILL_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.SKILL_ADDITIONAL_DMG_CD_OVERRIDE],
      a[Key.SKILL_TRUE_DMG_MODIFIER],
      x.a[Key.MEMOSPRITE] ? x.m.a[Key.SKILL_DMG] : 0,
    )
  }

  if ((action.actionType == AbilityKind.ULT || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.ULT) {
    const initialDmg = calculateInitial(
      a,
      context,
      a[Key.ULT_DMG],
      a[Key.ULT_HP_SCALING],
      a[Key.ULT_DEF_SCALING],
      a[Key.ULT_ATK_SCALING],
      a[Key.ULT_ATK_P_BOOST],
    )
    a[Key.ULT_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      Key.ULT_DMG,
      initialDmg,
      a[Key.ULT_DMG_BOOST],
      a[Key.ULT_VULNERABILITY],
      a[Key.ULT_DEF_PEN],
      a[Key.ULT_RES_PEN],
      a[Key.ULT_CR_BOOST],
      a[Key.ULT_CD_BOOST],
      a[Key.ULT_FINAL_DMG_BOOST],
      a[Key.ULT_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.ULT_SUPER_BREAK_MODIFIER],
      0, // a[Key.ULT_BREAK_DMG_MODIFIER],
      a[Key.ULT_TOUGHNESS_DMG],
      a[Key.ULT_ADDITIONAL_DMG],
      a[Key.ULT_ADDITIONAL_DMG_CR_OVERRIDE],
      a[Key.ULT_ADDITIONAL_DMG_CD_OVERRIDE],
      a[Key.ULT_TRUE_DMG_MODIFIER],
      x.a[Key.MEMOSPRITE] ? x.m.a[Key.ULT_DMG] : 0,
    )
  }

  if ((action.actionType == AbilityKind.FUA || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.FUA) {
    const initialDmg = calculateInitial(
      a,
      context,
      a[Key.FUA_DMG],
      a[Key.FUA_HP_SCALING],
      a[Key.FUA_DEF_SCALING],
      a[Key.FUA_ATK_SCALING],
      a[Key.FUA_ATK_P_BOOST],
    )
    a[Key.FUA_DMG] = calculateAbilityDmg(
      x,
      action,
      context,
      baseUniversalMulti,
      baseDmgBoost,
      baseDefPen,
      baseResistance,
      baseSuperBreakInstanceDmg,
      baseBreakEfficiencyBoost,
      Key.FUA_DMG,
      initialDmg,
      a[Key.FUA_DMG_BOOST],
      a[Key.FUA_VULNERABILITY],
      a[Key.FUA_DEF_PEN],
      a[Key.FUA_RES_PEN],
      a[Key.FUA_CR_BOOST],
      a[Key.FUA_CD_BOOST],
      0, // a[Key.FUA_FINAL_DMG_BOOST],
      0, // a[Key.FUA_BREAK_EFFICIENCY_BOOST],
      0, // a[Key.FUA_SUPER_BREAK_MODIFIER],
      0, // a[Key.FUA_BREAK_DMG_MODIFIER],
      a[Key.FUA_TOUGHNESS_DMG],
      a[Key.FUA_ADDITIONAL_DMG],
      0, // a[Key.FUA_ADDITIONAL_DMG_CR_OVERRIDE],
      0, // a[Key.FUA_ADDITIONAL_DMG_CD_OVERRIDE],
      a[Key.FUA_TRUE_DMG_MODIFIER],
      x.a[Key.MEMOSPRITE] ? x.m.a[Key.FUA_DMG] : 0,
    )
  }

  if ((action.actionType == AbilityKind.DOT || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.DOT) {
    const dotDmgBoostMulti = baseDmgBoost + a[Key.DOT_DMG_BOOST]
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + a[Key.DOT_DEF_PEN])
    const dotVulnerabilityMulti = 1 + a[Key.VULNERABILITY] + a[Key.DOT_VULNERABILITY]
    const dotResMulti = 1 - (baseResistance - a[Key.DOT_RES_PEN])
    const dotEhrMulti = calculateEhrMulti(x, context)
    const dotTrueDmgMulti = a[Key.TRUE_DMG_MODIFIER] + a[Key.DOT_TRUE_DMG_MODIFIER] // (1 +) dropped intentionally for dmg tracing

    const initialDmg = calculateInitial(
      a,
      context,
      a[Key.DOT_DMG],
      a[Key.DOT_HP_SCALING],
      a[Key.DOT_DEF_SCALING],
      a[Key.DOT_ATK_SCALING],
      a[Key.DOT_ATK_P_BOOST],
    )
    const instanceDmg = calculateDotDmg(
      x,
      action,
      Key.DOT_DMG,
      initialDmg,
      (baseUniversalMulti),
      (dotDmgBoostMulti),
      (dotDefMulti),
      (dotVulnerabilityMulti),
      (dotResMulti),
      (dotEhrMulti),
      (dotTrueDmgMulti),
    )
    a[Key.DOT_DMG] = instanceDmg
  }

  if ((action.actionType == AbilityKind.MEMO_SKILL || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.MEMO_SKILL) {
    if (x.a[Key.MEMOSPRITE]) {
      a[Key.MEMO_SKILL_DMG] += x.m.a[Key.MEMO_SKILL_DMG]
    } else {
      const initialDmg = calculateInitial(
        a, context,
        a[Key.MEMO_SKILL_DMG],
        a[Key.MEMO_SKILL_HP_SCALING],
        a[Key.MEMO_SKILL_DEF_SCALING],
        a[Key.MEMO_SKILL_ATK_SCALING],
        a[Key.MEMO_SKILL_ATK_P_BOOST],
      )
      a[Key.MEMO_SKILL_DMG] = calculateAbilityDmg(
        x,
        action,
        context,
        baseUniversalMulti,
        baseDmgBoost,
        baseDefPen,
        baseResistance,
        baseSuperBreakInstanceDmg,
        baseBreakEfficiencyBoost,
        Key.MEMO_SKILL_DMG,
        initialDmg,
        a[Key.MEMO_SKILL_DMG_BOOST],
        0, // a[Key.MEMO_SKILL_VULNERABILITY],
        0, // a[Key.MEMO_SKILL_DEF_PEN],
        0, // a[Key.MEMO_SKILL_RES_PEN],
        0, // a[Key.MEMO_SKILL_CR_BOOST],
        0, // a[Key.MEMO_SKILL_CD_BOOST],
        0, // a[Key.MEMO_SKILL_FINAL_DMG_BOOST],
        0, // a[Key.MEMO_SKILL_BREAK_EFFICIENCY_BOOST],
        0, // a[Key.MEMO_SKILL_SUPER_BREAK_MODIFIER],
        0, // a[Key.MEMO_SKILL_BREAK_DMG_MODIFIER],
        a[Key.MEMO_SKILL_TOUGHNESS_DMG],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG_CR_OVERRIDE],
        0, // a[Key.MEMO_SKILL_ADDITIONAL_DMG_CD_OVERRIDE],
        a[Key.MEMO_SKILL_TRUE_DMG_MODIFIER],
        0, // No memo joint
      )
    }
  }

  if ((action.actionType == AbilityKind.MEMO_TALENT || action.actionType == AbilityKind.NULL) && context.activeAbilityFlags & AbilityType.MEMO_TALENT) {
    if (x.a[Key.MEMOSPRITE]) {
      a[Key.MEMO_TALENT_DMG] += x.m.a[Key.MEMO_TALENT_DMG]
    } else {
      const initialDmg = calculateInitial(
        a,
        context,
        a[Key.MEMO_TALENT_DMG],
        a[Key.MEMO_TALENT_HP_SCALING],
        a[Key.MEMO_TALENT_DEF_SCALING],
        a[Key.MEMO_TALENT_ATK_SCALING],
        a[Key.MEMO_TALENT_ATK_P_BOOST],
      )
      a[Key.MEMO_TALENT_DMG] = calculateAbilityDmg(
        x,
        action,
        context,
        baseUniversalMulti,
        baseDmgBoost,
        baseDefPen,
        baseResistance,
        baseSuperBreakInstanceDmg,
        baseBreakEfficiencyBoost,
        Key.MEMO_TALENT_DMG,
        initialDmg,
        a[Key.MEMO_TALENT_DMG_BOOST],
        0, // a[Key.MEMO_TALENT_VULNERABILITY],
        0, // a[Key.MEMO_TALENT_DEF_PEN],
        0, // a[Key.MEMO_TALENT_RES_PEN],
        0, // a[Key.MEMO_TALENT_CR_BOOST],
        0, // a[Key.MEMO_TALENT_CD_BOOST],
        0, // a[Key.MEMO_TALENT_FINAL_DMG_BOOST],
        0, // a[Key.MEMO_TALENT_BREAK_EFFICIENCY_BOOST],
        0, // a[Key.MEMO_TALENT_SUPER_BREAK_MODIFIER],
        0, // a[Key.MEMO_TALENT_BREAK_DMG_MODIFIER],
        a[Key.MEMO_TALENT_TOUGHNESS_DMG],
        0, // a[Key.MEMO_TALENT_ADDITIONAL_DMG],
        0, // a[Key.MEMO_TALENT_ADDITIONAL_DMG_CR_OVERRIDE],
        0, // a[Key.MEMO_TALENT_ADDITIONAL_DMG_CD_OVERRIDE],
        a[Key.MEMO_TALENT_TRUE_DMG_MODIFIER],
        0, // No memo joint
      )
    }
  }

  // Break True DMG is handled separately due to break being re-used in ability calcs
  const breakTrueDmg = a[Key.BREAK_DMG] * (a[Key.TRUE_DMG_MODIFIER] + a[Key.BREAK_TRUE_DMG_MODIFIER])

  if (x.trace && action.actionType == AbilityKind.NULL) {
    const name = StatsConfigByIndex[Key.BREAK_DMG].name
    const splits = x.dmgSplits[name as keyof DefaultActionDamageValues]
    splits.breakDmg = a[Key.BREAK_DMG]
    splits.trueDmg = breakTrueDmg
  }

  a[Key.BREAK_DMG] += breakTrueDmg
}

const cLevelConst = 20 + 80

function calculateInitial(a: Float32Array, context: OptimizerContext, abilityDmg: number, hpScaling: number, defScaling: number, atkScaling: number, atkBoostP: number) {
  return abilityDmg
    + hpScaling * a[Key.HP]
    + defScaling * a[Key.DEF]
    + atkScaling * (a[Key.ATK] + atkBoostP * context.baseATK)
}

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhp(x: ComputedStatsArray, context: OptimizerContext) {
  const a = x.a

  let ehp = a[Key.HP] / (1 - a[Key.DEF] / (a[Key.DEF] + 200 + 10 * context.enemyLevel))
  ehp *= 1 / a[Key.DMG_RED_MULTI]
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
  a[Key.SHIELD_VALUE] = a[Key.SHIELD_VALUE] * (1 + a[Key.SHIELD_BOOST])
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
  baseBreakEfficiencyBoost: number,
  abilityKey: number,
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
  abilityTrueDmgModifier: number,
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
    const abilityOriginalDmgMulti = 1 + abilityOriginalDmgBoost + a[Key.FINAL_DMG_BOOST]

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
  const superBreakModifier = a[Key.SUPER_BREAK_MODIFIER] + abilitySuperBreakModifier
  if (superBreakModifier > 0) {
    abilitySuperBreakDmgOutput = calculateSuperBreakDmg(
      (baseSuperBreakInstanceDmg),
      (superBreakModifier),
      (baseBreakEfficiencyBoost + abilityBreakEfficiencyBoost),
      (abilityToughnessDmg),
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
      (baseDmgBoost + a[Key.ADDITIONAL_DMG_BOOST]),
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

  const trueDmgOutput = (a[Key.TRUE_DMG_MODIFIER] + abilityTrueDmgModifier) * primaryDmgOutput

  // === Memo Joint DMG ===

  let memoJointDmgOutput = 0
  if (abilityMemoJointDamage > 0) {
    memoJointDmgOutput = abilityMemoJointDamage
  }

  if (x.trace && action.actionType == AbilityKind.NULL) {
    const name = StatsConfigByIndex[abilityKey].name
    const splits = x.dmgSplits[name as keyof DefaultActionDamageValues]
    splits.abilityDmg = abilityCritDmgOutput
    splits.breakDmg = abilityBreakDmgOutput
    splits.superBreakDmg = abilitySuperBreakDmgOutput
    splits.additionalDmg = abilityAdditionalDmgOutput
    splits.trueDmg = trueDmgOutput
    splits.jointDmg = memoJointDmgOutput
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
  x: ComputedStatsArray,
  action: OptimizerAction,
  abilityKey: number,
  baseDmg: number,
  universalMulti: number,
  dmgBoostMulti: number,
  defMulti: number,
  vulnerabilityMulti: number,
  resMulti: number,
  ehrMulti: number,
  trueDmgMulti: number,
) {
  const dotDmg = baseDmg
    * universalMulti
    * dmgBoostMulti
    * defMulti
    * vulnerabilityMulti
    * resMulti
    * ehrMulti

  const trueDmg = dotDmg * trueDmgMulti

  if (x.trace && action.actionType == AbilityKind.NULL) {
    const name = StatsConfigByIndex[abilityKey].name
    const splits = x.dmgSplits[name as keyof DefaultActionDamageValues]
    splits.dotDmg = dotDmg
    splits.trueDmg = trueDmg
  }

  return dotDmg + trueDmg
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
    ? (1 + a[Key.DOT_SPLIT] * effectiveDotChance * (a[Key.DOT_STACKS] - 1)) / (1 + a[Key.DOT_SPLIT] * (a[Key.DOT_STACKS] - 1))
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
