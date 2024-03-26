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
  let cLevel = 80
  let eLevel = request.enemyLevel
  let defReduction = x.DEF_SHRED + request.buffDefShred
  let defIgnore = 0

  x.ELEMENTAL_DMG += x[params.ELEMENTAL_DMG_TYPE]
  let dmgBoostMultiplier = 1 + x.ELEMENTAL_DMG
  let dmgReductionMultiplier = 1
  let originalDmgMultiplier = 1 + x.ORIGINAL_DMG_BOOST

  let ehp = x[Stats.HP] / (1 - x[Stats.DEF] / (x[Stats.DEF] + 200 + 10 * request.enemyLevel))
  ehp *= 1 / ((1 - 0.08 * p2(sets.GuardOfWutheringSnow)) * x.DMG_RED_MULTI)
  x.EHP = ehp

  let universalMulti = dmgReductionMultiplier * params.brokenMultiplier * originalDmgMultiplier
  const baseResistance = params.resistance - x.RES_PEN - x[params.RES_PEN_TYPE]

  const ULT_CD = x.ULT_CD_OVERRIDE || (x[Stats.CD] + x.ULT_CD_BOOST) // Robin overrides ULT CD

  x.BASIC_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.BASIC_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.BASIC_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST) * (1 + x[Stats.CD] + x.BASIC_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.BASIC_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.BASIC_VULNERABILITY)
    * (1 - (baseResistance - x.BASIC_RES_PEN))

  x.SKILL_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.SKILL_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.SKILL_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST) * (1 + x[Stats.CD] + x.SKILL_CD_BOOST) + (1 - Math.min(1, x[Stats.CR] + x.SKILL_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.SKILL_VULNERABILITY)
    * (1 - (baseResistance - x.SKILL_RES_PEN))

  x.ULT_DMG
    *= universalMulti
    * (dmgBoostMultiplier + x.ULT_BOOST)
    * calculateDefMultiplier(cLevel, eLevel, defReduction, defIgnore, x.ULT_DEF_PEN)
    * (Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST) * (1 + ULT_CD) + (1 - Math.min(1, x[Stats.CR] + x.ULT_CR_BOOST)))
    * (1 + x.DMG_TAKEN_MULTI + x.ULT_VULNERABILITY)
    * (1 - (baseResistance - x.ULT_RES_PEN))

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
