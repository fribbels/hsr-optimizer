import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { p2 } from 'lib/optimizer/optimizerUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export function calculateBaseMultis(x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
  const lightConeConditionalController = context.lightConeConditionalController
  const characterConditionalController = context.characterConditionalController

  if (lightConeConditionalController.finalizeCalculations) lightConeConditionalController.finalizeCalculations(x, action, context)
  if (characterConditionalController.finalizeCalculations) characterConditionalController.finalizeCalculations(x, action, context)
}

export function calculateDamage(x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) {
  const eLevel = context.enemyLevel

  calculateEhp(x, context)

  x.ELEMENTAL_DMG += x[context.elementalDamageType]

  const baseDmgBoost = 1 + x.ELEMENTAL_DMG
  const baseDefPen = x.DEF_PEN + context.combatBuffs.DEF_PEN
  const baseUniversalMulti = x.ENEMY_WEAKNESS_BROKEN ? 1 : 0.9
  const baseResistance = context.enemyDamageResistance - x.RES_PEN - context.combatBuffs.RES_PEN - x[context.elementalResPenType]
  const baseBreakEfficiencyBoost = 1 + x.BREAK_EFFICIENCY_BOOST

  // === Default ===

  if (action.actionType == 'DEFAULT') {
    const dotDmgBoostMulti = baseDmgBoost + x.DOT_BOOST
    const dotDefMulti = calculateDefMulti(eLevel, baseDefPen + x.DOT_DEF_PEN)
    const dotVulnerabilityMulti = 1 + x.VULNERABILITY + x.DOT_VULNERABILITY
    const dotResMulti = 1 - (baseResistance - x.DOT_RES_PEN)
    const dotEhrMulti = calculateEhrMulti(x, context)

    x.DOT_DMG = calculateDotDmg(
      x.DOT_DMG,
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
  x.BREAK_DMG
    = baseUniversalMulti
    * 3767.5533
    * context.elementalBreakScaling
    * calculateDefMulti(eLevel, baseDefPen + x.BREAK_DEF_PEN)
    * (0.5 + context.enemyMaxToughness / 120)
    * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x[Stats.BE])

  // The % of Super Break instance dmg
  const baseSuperBreakModifier = x.SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER

  // The multiplier for an instance of 100% Super Break damage
  // Multiply this by the (1 + BREAK_EFFICIENCY_BOOST) * (SUPER_BREAK_MODIFIER)
  const baseSuperBreakInstanceDmg
    = baseUniversalMulti
    * 3767.5533
    * calculateDefMulti(eLevel, baseDefPen + x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
    * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x[Stats.BE])
    * (1 / 30)

  if (action.actionType == 'BASIC' || action.actionType == 'DEFAULT') {
    x.BASIC_DMG = calculateAbilityDmg(
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
      x.BASIC_DMG,
      x.BASIC_BOOST,
      x.BASIC_VULNERABILITY,
      x.BASIC_DEF_PEN,
      x.BASIC_RES_PEN,
      x.BASIC_CR_BOOST,
      x.BASIC_CD_BOOST,
      x.BASIC_ORIGINAL_DMG_BOOST,
      x.BASIC_BREAK_EFFICIENCY_BOOST,
      x.BASIC_SUPER_BREAK_MODIFIER,
      x.BASIC_BREAK_DMG_MODIFIER,
      x.BASIC_TOUGHNESS_DMG,
      x.BASIC_ADDITIONAL_DMG,
      0, // x.BASIC_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.BASIC_ADDITIONAL_DMG_CD_OVERRIDE,
    )
  }

  if (action.actionType == 'SKILL' || action.actionType == 'DEFAULT') {
    x.SKILL_DMG = calculateAbilityDmg(
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
      x.SKILL_DMG,
      x.SKILL_BOOST,
      x.SKILL_VULNERABILITY,
      x.SKILL_DEF_PEN,
      x.SKILL_RES_PEN,
      x.SKILL_CR_BOOST,
      x.SKILL_CD_BOOST,
      x.SKILL_ORIGINAL_DMG_BOOST,
      0, // x.SKILL_BREAK_EFFICIENCY_BOOST,
      0, // x.SKILL_SUPER_BREAK_MODIFIER,
      0, // x.SKILL_BREAK_DMG_MODIFIER,
      x.SKILL_TOUGHNESS_DMG,
      x.SKILL_ADDITIONAL_DMG,
      0, // x.SKILL_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.SKILL_ADDITIONAL_DMG_CD_OVERRIDE,
    )
  }

  if (action.actionType == 'ULT' || action.actionType == 'DEFAULT') {
    x.ULT_DMG = calculateAbilityDmg(
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
      x.ULT_DMG,
      x.ULT_BOOST,
      x.ULT_VULNERABILITY,
      x.ULT_DEF_PEN,
      x.ULT_RES_PEN,
      x.ULT_CR_BOOST,
      x.ULT_CD_BOOST,
      x.ULT_ORIGINAL_DMG_BOOST,
      x.ULT_BREAK_EFFICIENCY_BOOST,
      0, // x.ULT_SUPER_BREAK_MODIFIER,
      0, // x.ULT_BREAK_DMG_MODIFIER,
      x.ULT_TOUGHNESS_DMG,
      x.ULT_ADDITIONAL_DMG,
      x.ULT_ADDITIONAL_DMG_CR_OVERRIDE,
      x.ULT_ADDITIONAL_DMG_CD_OVERRIDE,
    )
  }

  if (action.actionType == 'FUA' || action.actionType == 'DEFAULT') {
    x.FUA_DMG = calculateAbilityDmg(
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
      x.FUA_DMG,
      x.FUA_BOOST,
      x.FUA_VULNERABILITY,
      x.FUA_DEF_PEN,
      x.FUA_RES_PEN,
      x.FUA_CR_BOOST,
      x.FUA_CD_BOOST,
      0, // x.FUA_ORIGINAL_DMG_BOOST,
      0, // x.FUA_BREAK_EFFICIENCY_BOOST,
      0, // x.FUA_SUPER_BREAK_MODIFIER,
      0, // x.FUA_BREAK_DMG_MODIFIER,
      x.FUA_TOUGHNESS_DMG,
      x.FUA_ADDITIONAL_DMG,
      0, // x.FUA_ADDITIONAL_DMG_CR_OVERRIDE,
      0, // x.FUA_ADDITIONAL_DMG_CD_OVERRIDE,
    )
  }
}

const cLevelConst = 20 + 80

function calculateDefMulti(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhp(x: ComputedStatsObject, context: OptimizerContext) {
  const sets = x.sets

  let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * context.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
  x.EHP = ehp
}

function calculateAbilityDmg(
  x: ComputedStatsObject,
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
) {
  const eLevel = context.enemyLevel

  // === Crit DMG ===

  let abilityCritDmgOutput = 0
  if (abilityDmg) {
    const abilityCr = Math.min(1, x[Stats.CR] + abilityCrBoost)
    const abilityCd = x[Stats.CD] + abilityCdBoost
    const abilityCritMulti = abilityCr * (1 + abilityCd) + (1 - abilityCr)
    const abilityVulnerabilityMulti = 1 + x.VULNERABILITY + abilityVulnerability
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
    abilityBreakDmgOutput = abilityBreakDmgModifier * x.BREAK_DMG
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
    const additionalDmgCr = abilityAdditionalCrOverride || Math.min(1, x[Stats.CR])
    const additionalDmgCd = abilityAdditionalCdOverride || x[Stats.CD]
    const abilityAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr)
    abilityAdditionalDmgOutput = calculateAdditionalDmg(
      abilityAdditionalDmg,
      (baseUniversalMulti),
      (baseDmgBoost),
      calculateDefMulti(eLevel, baseDefPen),
      (1 + x.VULNERABILITY),
      (abilityAdditionalCritMulti),
      (1 - baseResistance),
    )
  }

  return abilityCritDmgOutput
    + abilityBreakDmgOutput
    + abilitySuperBreakDmgOutput
    + abilityAdditionalDmgOutput
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
  x: ComputedStatsObject,
  context: OptimizerContext,
) {
  const enemyEffectRes = context.enemyEffectResistance

  // Dot calcs
  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const effectiveDotChance = Math.min(1, x.DOT_CHANCE * (1 + x[Stats.EHR]) * (1 - enemyEffectRes + x.EFFECT_RES_PEN))
  const dotEhrMulti = x.DOT_SPLIT
    ? (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + 0.05 * (x.DOT_STACKS - 1))
    : effectiveDotChance

  return dotEhrMulti
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
