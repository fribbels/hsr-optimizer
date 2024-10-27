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
  const baseUniversalMulti = (x.ENEMY_WEAKNESS_BROKEN ? 1 : 0.9)
  const baseResistance = context.enemyDamageResistance - x.RES_PEN - context.combatBuffs.RES_PEN - x[context.elementalResPenType]

  const ULT_CD = x.ULT_CD_OVERRIDE || (x[Stats.CD] + x.ULT_CD_BOOST) // Robin overrides ULT CD

  // Break calcs
  const maxToughness = context.enemyMaxToughness

  // ======================================== Refactored ================================

  // Multiply by additional vulnerability
  x.BREAK_DMG
    = baseUniversalMulti
    * 3767.5533
    * context.elementalBreakScaling
    * calculateDefMultiplier(eLevel, baseDefPen + x.BREAK_DEF_PEN)
    * (0.5 + maxToughness / 120)
    * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x[Stats.BE])

  // The percentage of Super Break instance dmg
  const baseSuperBreakModifier = x.SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER

  // The multiplier for an instance of 100% Super Break damage
  // Multiply this by the (1 + BREAK_EFFICIENCY_BOOST) * (SUPER_BREAK_MODIFIER)
  const baseSuperBreakInstanceDmg
    = baseUniversalMulti
    * 3767.5533
    * calculateDefMultiplier(eLevel, baseDefPen + x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
    * (1 + x.VULNERABILITY + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x[Stats.BE])
    * (1 / 30)

  const baseBreakEfficiencyBoost = 1 + x.BREAK_EFFICIENCY_BOOST

  if (action.actionType == 'BASIC' || action.actionType == 'DEFAULT') {
    const basicCr = Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)
    const basicCd = x[Stats.CD] + x.BASIC_CD_BOOST
    const basicCritMulti = basicCr * (1 + basicCd) + (1 - basicCr)
    const basicVulnerabilityMulti = 1 + x.VULNERABILITY + x.BASIC_VULNERABILITY
    const basicDefMulti = calculateDefMultiplier(eLevel, baseDefPen + x.BASIC_DEF_PEN)
    const basicResMulti = 1 - (baseResistance - x.BASIC_RES_PEN)
    const basicOriginalDmgMulti = 1 + x.BASIC_ORIGINAL_DMG_BOOST

    const basicBreakDmg = x.BASIC_BREAK_DMG_MODIFIER * x.BREAK_DMG

    const basicSuperBreakDmg = calculateSuperBreakDmg(
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier + x.BASIC_SUPER_BREAK_MODIFIER,
      baseBreakEfficiencyBoost + x.BASIC_BREAK_EFFICIENCY_BOOST,
      x.BASIC_TOUGHNESS_DMG,
    )

    const basicCritDmg = calculateCritDmg(
      x.BASIC_DMG,
      (baseUniversalMulti),
      (baseDmgBoost + x.BASIC_BOOST),
      (basicDefMulti),
      (basicVulnerabilityMulti),
      (basicCritMulti),
      (basicResMulti),
      (basicOriginalDmgMulti),
    )

    x.BASIC_DMG
      = basicCritDmg
      + basicBreakDmg
      + basicSuperBreakDmg
  }

  if (action.actionType == 'SKILL' || action.actionType == 'DEFAULT') {
    const skillCr = Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)
    const skillCd = x[Stats.CD] + x.SKILL_CD_BOOST
    const skillCritMulti = skillCr * (1 + skillCd) + (1 - skillCr)
    const skillVulnerabilityMulti = 1 + x.VULNERABILITY + x.SKILL_VULNERABILITY
    const skillDefMulti = calculateDefMultiplier(eLevel, baseDefPen + x.SKILL_DEF_PEN)
    const skillResMulti = 1 - (baseResistance - x.SKILL_RES_PEN)
    const skillOriginalDmgMulti = 1 + x.SKILL_ORIGINAL_DMG_BOOST

    const skillSuperBreakDmg = calculateSuperBreakDmg(
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      x.SKILL_TOUGHNESS_DMG,
    )

    const skillCritDmg = calculateCritDmg(
      x.SKILL_DMG,
      (baseUniversalMulti),
      (baseDmgBoost + x.SKILL_BOOST),
      (skillDefMulti),
      (skillVulnerabilityMulti),
      (skillCritMulti),
      (skillResMulti),
      (skillOriginalDmgMulti),
    )

    x.SKILL_DMG
      = skillCritDmg
      + skillSuperBreakDmg
  }

  if (action.actionType == 'ULT' || action.actionType == 'DEFAULT') {
    let ultCritDmg = 0
    if (x.ULT_DMG) {
      const ultCr = Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)
      const ultCd = x[Stats.CD] + x.ULT_CD_BOOST
      const ultCritMulti = ultCr * (1 + ultCd) + (1 - ultCr)
      const ultVulnerabilityMulti = 1 + x.VULNERABILITY + x.ULT_VULNERABILITY
      const ultDefMulti = calculateDefMultiplier(eLevel, baseDefPen + x.ULT_DEF_PEN)
      const ultResMulti = 1 - (baseResistance - x.ULT_RES_PEN)
      const ultOriginalDmgMulti = 1 + x.ULT_ORIGINAL_DMG_BOOST

      ultCritDmg = calculateCritDmg(
        x.ULT_DMG,
        (baseUniversalMulti),
        (baseDmgBoost + x.ULT_BOOST),
        (ultDefMulti),
        (ultVulnerabilityMulti),
        (ultCritMulti),
        (ultResMulti),
        (ultOriginalDmgMulti),
      )
    }

    let ultSuperBreakDmg = 0
    if (baseSuperBreakModifier > 0) {
      ultSuperBreakDmg = calculateSuperBreakDmg(
        baseSuperBreakInstanceDmg,
        baseSuperBreakModifier,
        baseBreakEfficiencyBoost + x.ULT_BREAK_EFFICIENCY_BOOST,
        x.ULT_TOUGHNESS_DMG,
      )
    }

    let ultAdditionalDmg = 0
    if (x.ULT_ADDITIONAL_DMG > 0) {
      const additionalDmgCr = x.ULT_CR_OVERRIDE || Math.min(1, x[Stats.CR])
      const additionalDmgCd = x.ULT_CD_OVERRIDE || x[Stats.CD]
      const ultAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr)
      ultAdditionalDmg = calculateAdditionalDmg(
        x.ULT_ADDITIONAL_DMG,
        (baseUniversalMulti),
        (baseDmgBoost),
        calculateDefMultiplier(eLevel, baseDefPen),
        (1 + x.VULNERABILITY),
        (ultAdditionalCritMulti),
        (1 - baseResistance),
      )
    }

    x.ULT_DMG
      = ultCritDmg
      + ultSuperBreakDmg
      + ultAdditionalDmg
  }

  if (action.actionType == 'FUA' || action.actionType == 'DEFAULT') {
    const fuaCr = Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)
    const fuaCd = x[Stats.CD] + x.FUA_CD_BOOST
    const fuaCritMulti = fuaCr * (1 + fuaCd) + (1 - fuaCr)
    const fuaVulnerabilityMulti = 1 + x.VULNERABILITY + x.FUA_VULNERABILITY
    const fuaDefMulti = calculateDefMultiplier(eLevel, baseDefPen + x.FUA_DEF_PEN)
    const fuaResMulti = 1 - (baseResistance - x.FUA_RES_PEN)
    const fuaOriginalDmgMulti = 1

    const fuaSuperBreakDmg = calculateSuperBreakDmg(
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost,
      x.FUA_TOUGHNESS_DMG,
    )

    const fuaCritDmg = calculateCritDmg(
      x.FUA_DMG,
      (baseUniversalMulti),
      (baseDmgBoost + x.FUA_BOOST),
      (fuaDefMulti),
      (fuaVulnerabilityMulti),
      (fuaCritMulti),
      (fuaResMulti),
      (fuaOriginalDmgMulti),
    )

    x.FUA_DMG
      = fuaCritDmg
      + fuaSuperBreakDmg
  }

  if (action.actionType == 'DEFAULT') {
    const dotDmgBoostMulti = baseDmgBoost + x.DOT_BOOST
    const dotDefMulti = calculateDefMultiplier(eLevel, baseDefPen + x.DOT_DEF_PEN)
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

  // x.SKILL_DMG
  //   = x.SKILL_DMG
  //   * baseUniversalMulti
  //   * (baseDmgBoost + x.SKILL_BOOST)
  //   * calculateDefMultiplier(eLevel, baseDefPen + x.SKILL_DEF_PEN)
  //   * ((skillVulnerability) * Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + skillVulnerability * (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
  //   * (1 - (baseResistance - x.SKILL_RES_PEN))
  //   * (1 + x.SKILL_ORIGINAL_DMG_BOOST)
  //   + (superBreakDmg * x.SKILL_TOUGHNESS_DMG)
  //
  // x.ULT_DMG
  //   = x.ULT_DMG
  //   * baseUniversalMulti
  //   * (baseDmgBoost + x.ULT_BOOST * x.ULT_BOOSTS_MULTI)
  //   * calculateDefMultiplier(eLevel, (baseDefPen + x.ULT_DEF_PEN) * x.ULT_BOOSTS_MULTI)
  //   * ((ultVulnerability) * Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST) * (1 + ULT_CD) + ultVulnerability * (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
  //   * (1 - (baseResistance - x.ULT_RES_PEN * x.ULT_BOOSTS_MULTI))
  //   * (1 + x.ULT_ORIGINAL_DMG_BOOST)
  //   + (superBreakDmg * x.ULT_TOUGHNESS_DMG * (1 + x.ULT_BREAK_EFFICIENCY_BOOST))
  //
  // x.FUA_DMG
  //   = x.FUA_DMG
  //   * baseUniversalMulti
  //   * (baseDmgBoost + x.FUA_BOOST)
  //   * calculateDefMultiplier(eLevel, baseDefPen + x.FUA_DEF_PEN)
  //   * ((fuaVulnerability) * Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST) * (1 + x[Stats.CD] + x.FUA_CD_BOOST) + fuaVulnerability * (1 - Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)))
  //   * (1 - (baseResistance - x.FUA_RES_PEN))
  //   + (superBreakDmg * x.FUA_TOUGHNESS_DMG)
  //
  // x.DOT_DMG
  //   = x.DOT_DMG
  //   * baseUniversalMulti
  //   * (baseDmgBoost + x.DOT_BOOST)
  //   * calculateDefMultiplier(eLevel, baseDefPen + x.DOT_DEF_PEN)
  //   * dotVulnerability
  //   * (1 - (baseResistance - x.DOT_RES_PEN))
  //   * dotEhrMultiplier
}

const cLevelConst = 20 + 80

function calculateDefMultiplier(eLevel: number, defPen: number) {
  return cLevelConst / ((eLevel + 20) * Math.max(0, 1 - defPen) + cLevelConst)
}

function calculateEhp(x: ComputedStatsObject, context: OptimizerContext) {
  const sets = x.sets

  let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * context.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
  x.EHP = ehp
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
  abilityCrOverride: number,
  abilityCdOverride: number,
) {
  const eLevel = context.enemyLevel

  let ultCritDmg = 0
  if (abilityDmg) {
    const ultCr = Math.min(1, x[Stats.CR] + abilityCrBoost)
    const ultCd = x[Stats.CD] + abilityCdBoost
    const ultCritMulti = ultCr * (1 + ultCd) + (1 - ultCr)
    const ultVulnerabilityMulti = 1 + x.VULNERABILITY + abilityVulnerability
    const ultDefMulti = calculateDefMultiplier(eLevel, baseDefPen + abilityDefPen)
    const ultResMulti = 1 - (baseResistance - abilityResPen)
    const ultOriginalDmgMulti = 1 + abilityOriginalDmgBoost

    ultCritDmg = calculateCritDmg(
      abilityDmg,
      (baseUniversalMulti),
      (baseDmgBoost + x.ULT_BOOST),
      (ultDefMulti),
      (ultVulnerabilityMulti),
      (ultCritMulti),
      (ultResMulti),
      (ultOriginalDmgMulti),
    )
  }

  let ultSuperBreakDmg = 0
  if (baseSuperBreakModifier > 0) {
    ultSuperBreakDmg = calculateSuperBreakDmg(
      baseSuperBreakInstanceDmg,
      baseSuperBreakModifier,
      baseBreakEfficiencyBoost + x.ULT_BREAK_EFFICIENCY_BOOST,
      x.ULT_TOUGHNESS_DMG,
    )
  }

  let ultAdditionalDmg = 0
  if (x.ULT_ADDITIONAL_DMG > 0) {
    const additionalDmgCr = x.ULT_CR_OVERRIDE || Math.min(1, x[Stats.CR])
    const additionalDmgCd = x.ULT_CD_OVERRIDE || x[Stats.CD]
    const ultAdditionalCritMulti = additionalDmgCr * (1 + additionalDmgCd) + (1 - additionalDmgCr)
    ultAdditionalDmg = calculateAdditionalDmg(
      x.ULT_ADDITIONAL_DMG,
      (baseUniversalMulti),
      (baseDmgBoost),
      calculateDefMultiplier(eLevel, baseDefPen),
      (1 + x.VULNERABILITY),
      (ultAdditionalCritMulti),
      (1 - baseResistance),
    )
  }

  x.ULT_DMG
    = ultCritDmg
    + ultSuperBreakDmg
    + ultAdditionalDmg
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
