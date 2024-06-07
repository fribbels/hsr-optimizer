import { Stats } from 'lib/constants'
import { p2 } from 'lib/optimizer/optimizerUtils'

export function calculateBaseMultis(c, request, params) {
  const lightConeConditionals = params.lightConeConditionals
  const characterConditionals = params.characterConditionals

  if (lightConeConditionals.calculateBaseMultis) lightConeConditionals.calculateBaseMultis(c, request, params)
  if (characterConditionals.calculateBaseMultis) characterConditionals.calculateBaseMultis(c, request, params)
}

export function calculatePassiveStatConversions(c, request, params) {
  const characterConditionals = params.characterConditionals

  if (characterConditionals.calculatePassives) characterConditionals.calculatePassives(c, request, params)
}

export function calculateDamage(c, request, params) {
  const x = c.x
  const sets = c.sets
  const cLevel = 80
  const eLevel = request.enemyLevel
  const defReduction = x.DEF_SHRED + request.combatBuffs.DEF_SHRED
  const defIgnore = 0

  x.ELEMENTAL_DMG += x[params.ELEMENTAL_DMG_TYPE]
  const dmgBoostMultiplier = 1 + x.ELEMENTAL_DMG
  const dmgReductionMultiplier = 1

  let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * request.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
  x.EHP = ehp

  // Reapply broken multiplier here since certain conditionals can force weakness
  params.brokenMultiplier = x.ENEMY_WEAKNESS_BROKEN ? 1 : 0.9

  const universalMulti = dmgReductionMultiplier * params.brokenMultiplier
  const baseResistance = params.resistance - x.RES_PEN - x[params.RES_PEN_TYPE]

  const ULT_CD = x.ULT_CD_OVERRIDE || (x[Stats.CD] + x.ULT_CD_BOOST) // Robin overrides ULT CD

  const breakVulnerability = 1 + x.DMG_TAKEN_MULTI + x.BREAK_VULNERABILITY
  const basicVulnerability = 1 + x.DMG_TAKEN_MULTI + x.BASIC_VULNERABILITY
  const skillVulnerability = 1 + x.DMG_TAKEN_MULTI + x.SKILL_VULNERABILITY
  const ultVulnerability = 1 + x.DMG_TAKEN_MULTI + x.ULT_VULNERABILITY * x.ULT_BOOSTS_MULTI
  const fuaVulnerability = 1 + x.DMG_TAKEN_MULTI + x.FUA_VULNERABILITY
  const dotVulnerability = 1 + x.DMG_TAKEN_MULTI + x.DOT_VULNERABILITY

  const ENEMY_EFFECT_RES = 0.20
  // const ENEMY_DEBUFF_RES = 0 // Ignored debuff res for now

  // For stacking dots where the first stack has extra value
  // c = dot chance, s = stacks => avg dmg = (full dmg) * (1 + 0.05 * c * (s-1)) / (1 + 0.05 * (s-1))
  const effectiveDotChance = Math.min(1, x.DOT_CHANCE * (1 + x[Stats.EHR]) * (1 - ENEMY_EFFECT_RES + x.EFFECT_RES_SHRED))
  const dotEhrMultiplier = x.DOT_SPLIT
    ? (1 + x.DOT_SPLIT * effectiveDotChance * (x.DOT_STACKS - 1)) / (1 + 0.05 * (x.DOT_STACKS - 1))
    : effectiveDotChance

  // BREAK
  const maxToughness = request.enemyMaxToughness

  x.BREAK_DMG
    = universalMulti
    * 3767.5533
    * params.ELEMENTAL_BREAK_SCALING
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BREAK_DEF_PEN)
    * (0.5 + maxToughness / 120)
    * breakVulnerability
    * (1 - baseResistance)
    * (1 + x[Stats.BE])

  x.SUPER_BREAK_DMG
    = universalMulti
    * 3767.5533
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BREAK_DEF_PEN + x.SUPER_BREAK_DEF_PEN)
    * breakVulnerability
    * (1 - baseResistance)
    * (1 + x[Stats.BE])
    * (x.SUPER_BREAK_MODIFIER + x.SUPER_BREAK_HMC_MODIFIER)
    * (1 / 30)
    * (1 + x.BREAK_EFFICIENCY_BOOST)

  x.BASIC_DMG
    = x.BASIC_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.BASIC_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
    * ((basicVulnerability) * Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST) * (1 + x[Stats.CD] + x.BASIC_CD_BOOST) + basicVulnerability * (1 - Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)))
    * (1 - (baseResistance - x.BASIC_RES_PEN))
    * (1 + x.BASIC_ORIGINAL_DMG_BOOST)
    + (x.BASIC_BREAK_DMG_MODIFIER * x.BREAK_DMG)
    + (x.SUPER_BREAK_DMG * x.BASIC_TOUGHNESS_DMG * (1 + x.BASIC_BREAK_EFFICIENCY_BOOST))

  x.SKILL_DMG
    = x.SKILL_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.SKILL_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN)
    * ((skillVulnerability) * Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + skillVulnerability * (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
    * (1 - (baseResistance - x.SKILL_RES_PEN))
    * (1 + x.SKILL_ORIGINAL_DMG_BOOST)
    + (x.SUPER_BREAK_DMG * x.SKILL_TOUGHNESS_DMG)

  x.ULT_DMG
    = x.ULT_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.ULT_BOOST * x.ULT_BOOSTS_MULTI)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN * x.ULT_BOOSTS_MULTI)
    * ((ultVulnerability) * Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST) * (1 + ULT_CD) + ultVulnerability * (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
    * (1 - (baseResistance - x.ULT_RES_PEN * x.ULT_BOOSTS_MULTI))
    * (1 + x.ULT_ORIGINAL_DMG_BOOST)
    + (x.SUPER_BREAK_DMG * x.ULT_TOUGHNESS_DMG)

  x.FUA_DMG
    = x.FUA_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.FUA_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.FUA_DEF_PEN)
    * ((fuaVulnerability) * Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST) * (1 + x[Stats.CD] + x.FUA_CD_BOOST) + fuaVulnerability * (1 - Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)))
    * (1 - (baseResistance - x.FUA_RES_PEN))
    + (x.SUPER_BREAK_DMG * x.FUA_TOUGHNESS_DMG)

  x.DOT_DMG
    = x.DOT_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.DOT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.DOT_DEF_PEN)
    * dotVulnerability
    * (1 - (baseResistance - x.DOT_RES_PEN))
    * dotEhrMultiplier

  x.COMBO_DMG
    = request.combo.BASIC * x.BASIC_DMG
    + request.combo.SKILL * x.SKILL_DMG
    + request.combo.ULT * x.ULT_DMG
    + request.combo.FUA * x.FUA_DMG
    + request.combo.DOT * x.DOT_DMG
    + request.combo.BREAK * x.BREAK_DMG
}

function calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, additionalPen) {
  return (cLevel + 20) / ((eLevel + 20) * Math.max(0, 1 - defReduction - defIgnore - additionalPen) + cLevel + 20)
}
