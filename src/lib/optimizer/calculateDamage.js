import { Stats } from 'lib/constants'
import { p2 } from 'lib/optimizer/optimizerUtils'

export function calculateBaseMultis(c, request, params) {
  const lightConeConditionals = params.lightConeConditionals
  const characterConditionals = params.characterConditionals

  if (lightConeConditionals.calculateBaseMultis) lightConeConditionals.calculateBaseMultis(c, request, params)
  if (characterConditionals.calculateBaseMultis) characterConditionals.calculateBaseMultis(c, request, params)
}

export function calculateDamage(c, request, params) {
  const x = c.x
  const sets = c.sets
  const cLevel = 80
  const eLevel = request.enemyLevel
  const defReduction = x.DEF_SHRED + request.buffDefShred
  const defIgnore = 0

  x.ELEMENTAL_DMG += x[params.ELEMENTAL_DMG_TYPE]
  const dmgBoostMultiplier = 1 + x.ELEMENTAL_DMG
  const dmgReductionMultiplier = 1
  const originalDmgMultiplier = 1 + x.ORIGINAL_DMG_BOOST

  let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * request.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
  x.EHP = ehp

  const universalMulti = dmgReductionMultiplier * params.brokenMultiplier
  const baseResistance = params.resistance - x.RES_PEN - x[params.RES_PEN_TYPE]

  const ULT_CD = x.ULT_CD_OVERRIDE || (x[Stats.CD] + x.ULT_CD_BOOST) // Robin overrides ULT CD

  // BREAK
  const maxToughness = request.enemyMaxToughness

  x.BREAK_DMG
    = universalMulti
    * 3767.5533
    * params.ELEMENTAL_BREAK_SCALING
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, 0)
    * (0.5 + maxToughness / 120)
    * (1 + x.DMG_TAKEN_MULTI + x.BREAK_VULNERABILITY)
    * (1 - baseResistance)
    * (1 + x[Stats.BE])

  x.BASIC_DMG
    = x.BASIC_DMG
    * universalMulti
    * (dmgBoostMultiplier + x.BASIC_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST) * (1 + x[Stats.CD] + x.BASIC_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.BASIC_VULNERABILITY)
    * (1 - (baseResistance - x.BASIC_RES_PEN))
    * (1 + x.BASIC_ORIGINAL_DMG_BOOST)
    + x.BASIC_BREAK_DMG_MODIFIER * x.BREAK_DMG

  x.SKILL_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.SKILL_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.SKILL_VULNERABILITY)
    * (1 - (baseResistance - x.SKILL_RES_PEN))
    * (1 + x.SKILL_ORIGINAL_DMG_BOOST)

  x.ULT_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.ULT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST) * (1 + ULT_CD) + (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.ULT_VULNERABILITY)
    * (1 - (baseResistance - x.ULT_RES_PEN))
    * (1 + x.ULT_ORIGINAL_DMG_BOOST)

  x.FUA_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.FUA_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.FUA_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST) * (1 + x[Stats.CD] + x.FUA_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.FUA_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.FUA_VULNERABILITY)
    * (1 - (baseResistance - x.FUA_RES_PEN))

  x.DOT_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.DOT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.DOT_DEF_PEN)
    * (1 + x.DMG_TAKEN_MULTI + x.DOT_VULNERABILITY)
    * (1 - (baseResistance - x.DOT_RES_PEN))
}

function calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, additionalPen) {
  return (cLevel + 20) / ((eLevel + 20) * Math.max(0, 1 - defReduction - defIgnore - additionalPen) + cLevel + 20)
}
