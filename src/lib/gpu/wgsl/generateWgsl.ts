import structs from 'lib/gpu/wgsl/structs/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structs/structComputedStats.wgsl?raw'
import shader from 'lib/gpu/wgsl/shader.wgsl?raw'
import { generateSettings } from "lib/gpu/wgsl/generateSettings";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Form } from "types/Form";
import { CharacterConditionals } from "lib/characterConditionals";
import { LightConeConditionals } from "lib/lightConeConditionals";
import { calculateConditionals } from "lib/optimizer/calculateConditionals";
import { calculateTeammates } from "lib/optimizer/calculateTeammates";
import { Stats } from "lib/constants";

export function generateWgsl(params: OptimizerParams, request: Form) {
  calculateConditionals(request, params)
  calculateTeammates(request, params)

  const settings = generateSettings(params, request)

  let wgsl = `
// Settings
${settings}

// Main
${shader}

// Structs
${structs}

${structComputedStats}
  `

  wgsl = injectConditionals(wgsl, request)
  wgsl = injectPrecomputedStats(wgsl, params)

  return wgsl
}

function injectPrecomputedStats(wgsl: string, params: OptimizerParams) {
  const x = params.precomputedX
  x.EHP = 0

  const computedStatsWgsl = `
  var x: ComputedStats = ComputedStats(  
    ${x[Stats.HP_P]}, // Stats.HP_P
    ${x[Stats.ATK_P]}, // Stats.ATK_P
    ${x[Stats.DEF_P]}, // Stats.DEF_P
    ${x[Stats.SPD_P]}, // Stats.SPD_P
    ${x[Stats.HP]}, // Stats.HP
    ${x[Stats.ATK]}, // Stats.ATK
    ${x[Stats.DEF]}, // Stats.DEF
    ${x[Stats.SPD]}, // Stats.SPD
    ${x[Stats.CR]}, // Stats.CR
    ${x[Stats.CD]}, // Stats.CD
    ${x[Stats.EHR]}, // Stats.EHR
    ${x[Stats.RES]}, // Stats.RES
    ${x[Stats.BE]}, // Stats.BE
    ${x[Stats.ERR]}, // Stats.ERR
    ${x[Stats.OHB]}, // Stats.OHB
    ${x[Stats.Physical_DMG]}, // Stats.Physical_DMG
    ${x[Stats.Fire_DMG]}, // Stats.Fire_DMG
    ${x[Stats.Ice_DMG]}, // Stats.Ice_DMG
    ${x[Stats.Lightning_DMG]}, // Stats.Lightning_DMG
    ${x[Stats.Wind_DMG]}, // Stats.Wind_DMG
    ${x[Stats.Quantum_DMG]}, // Stats.Quantum_DMG
    ${x[Stats.Imaginary_DMG]}, // Stats.Imaginary_DMG
    ${x.ELEMENTAL_DMG}, // ELEMENTAL_DMG
    ${x.BASIC_SCALING}, // BASIC_SCALING
    ${x.SKILL_SCALING}, // SKILL_SCALING
    ${x.ULT_SCALING}, // ULT_SCALING
    ${x.FUA_SCALING}, // FUA_SCALING
    ${x.DOT_SCALING}, // DOT_SCALING
    ${x.BASIC_CR_BOOST}, // BASIC_CR_BOOST
    ${x.SKILL_CR_BOOST}, // SKILL_CR_BOOST
    ${x.ULT_CR_BOOST}, // ULT_CR_BOOST
    ${x.FUA_CR_BOOST}, // FUA_CR_BOOST
    ${x.BASIC_CD_BOOST}, // BASIC_CD_BOOST
    ${x.SKILL_CD_BOOST}, // SKILL_CD_BOOST
    ${x.ULT_CD_BOOST}, // ULT_CD_BOOST
    ${x.FUA_CD_BOOST}, // FUA_CD_BOOST
    ${x.BASIC_BOOST}, // BASIC_BOOST
    ${x.SKILL_BOOST}, // SKILL_BOOST
    ${x.ULT_BOOST}, // ULT_BOOST
    ${x.FUA_BOOST}, // FUA_BOOST
    ${x.DOT_BOOST}, // DOT_BOOST
    ${x.DMG_TAKEN_MULTI}, // DMG_TAKEN_MULTI
    ${x.BASIC_VULNERABILITY}, // BASIC_VULNERABILITY
    ${x.SKILL_VULNERABILITY}, // SKILL_VULNERABILITY
    ${x.ULT_VULNERABILITY}, // ULT_VULNERABILITY
    ${x.FUA_VULNERABILITY}, // FUA_VULNERABILITY
    ${x.DOT_VULNERABILITY}, // DOT_VULNERABILITY
    ${x.BREAK_VULNERABILITY}, // BREAK_VULNERABILITY
    ${x.DEF_SHRED}, // DEF_SHRED
    ${x.BASIC_DEF_PEN}, // BASIC_DEF_PEN
    ${x.SKILL_DEF_PEN}, // SKILL_DEF_PEN
    ${x.ULT_DEF_PEN}, // ULT_DEF_PEN
    ${x.FUA_DEF_PEN}, // FUA_DEF_PEN
    ${x.DOT_DEF_PEN}, // DOT_DEF_PEN
    ${x.BREAK_DEF_PEN}, // BREAK_DEF_PEN
    ${x.SUPER_BREAK_DEF_PEN}, // SUPER_BREAK_DEF_PEN
    ${x.RES_PEN}, // RES_PEN
    ${x.PHYSICAL_RES_PEN}, // PHYSICAL_RES_PEN
    ${x.FIRE_RES_PEN}, // FIRE_RES_PEN
    ${x.ICE_RES_PEN}, // ICE_RES_PEN
    ${x.LIGHTNING_RES_PEN}, // LIGHTNING_RES_PEN
    ${x.WIND_RES_PEN}, // WIND_RES_PEN
    ${x.QUANTUM_RES_PEN}, // QUANTUM_RES_PEN
    ${x.IMAGINARY_RES_PEN}, // IMAGINARY_RES_PEN
    ${x.BASIC_RES_PEN}, // BASIC_RES_PEN
    ${x.SKILL_RES_PEN}, // SKILL_RES_PEN
    ${x.ULT_RES_PEN}, // ULT_RES_PEN
    ${x.FUA_RES_PEN}, // FUA_RES_PEN
    ${x.DOT_RES_PEN}, // DOT_RES_PEN
    ${x.BASIC_DMG}, // BASIC_DMG
    ${x.SKILL_DMG}, // SKILL_DMG
    ${x.ULT_DMG}, // ULT_DMG
    ${x.FUA_DMG}, // FUA_DMG
    ${x.DOT_DMG}, // DOT_DMG
    ${x.BREAK_DMG}, // BREAK_DMG
    ${x.COMBO_DMG}, // COMBO_DMG
    ${x.DMG_RED_MULTI}, // DMG_RED_MULTI
    ${x.EHP}, // EHP
    ${x.DOT_CHANCE}, // DOT_CHANCE
    ${x.EFFECT_RES_SHRED}, // EFFECT_RES_SHRED
    ${x.DOT_SPLIT}, // DOT_SPLIT
    ${x.DOT_STACKS}, // DOT_STACKS
    ${x.ENEMY_WEAKNESS_BROKEN}, // ENEMY_WEAKNESS_BROKEN
    ${x.SUPER_BREAK_MODIFIER}, // SUPER_BREAK_MODIFIER
    ${x.SUPER_BREAK_HMC_MODIFIER}, // SUPER_BREAK_HMC_MODIFIER
    ${x.BASIC_TOUGHNESS_DMG}, // BASIC_TOUGHNESS_DMG
    ${x.SKILL_TOUGHNESS_DMG}, // SKILL_TOUGHNESS_DMG
    ${x.ULT_TOUGHNESS_DMG}, // ULT_TOUGHNESS_DMG
    ${x.FUA_TOUGHNESS_DMG}, // FUA_TOUGHNESS_DMG
    ${x.BASIC_ORIGINAL_DMG_BOOST}, // BASIC_ORIGINAL_DMG_BOOST
    ${x.SKILL_ORIGINAL_DMG_BOOST}, // SKILL_ORIGINAL_DMG_BOOST
    ${x.ULT_ORIGINAL_DMG_BOOST}, // ULT_ORIGINAL_DMG_BOOST
    ${x.BASIC_BREAK_DMG_MODIFIER}, // BASIC_BREAK_DMG_MODIFIER
    ${x.ULT_CD_OVERRIDE}, // ULT_CD_OVERRIDE
    ${x.ULT_BOOSTS_MULTI}, // ULT_BOOSTS_MULTI
    ${x.RATIO_BASED_ATK_BUFF}, // RATIO_BASED_ATK_BUFF
    ${x.RATIO_BASED_ATK_P_BUFF}, // RATIO_BASED_ATK_P_BUFF
    ${x.BREAK_EFFICIENCY_BOOST}, // BREAK_EFFICIENCY_BOOST
    ${x.BASIC_BREAK_EFFICIENCY_BOOST}, // BASIC_BREAK_EFFICIENCY_BOOST
    ${x.ULT_BREAK_EFFICIENCY_BOOST}, // ULT_BREAK_EFFICIENCY_BOOST
    ${x.BASIC_DMG_TYPE}, // BASIC_DMG_TYPE
    ${x.SKILL_DMG_TYPE}, // SKILL_DMG_TYPE
    ${x.ULT_DMG_TYPE}, // ULT_DMG_TYPE
    ${x.FUA_DMG_TYPE}, // FUA_DMG_TYPE
    ${x.DOT_DMG_TYPE}, // DOT_DMG_TYPE
    ${x.BREAK_DMG_TYPE}, // BREAK_DMG_TYPE
    ${x.SUPER_BREAK_TYPE}, // SUPER_BREAK_TYPE
  );
  `

  wgsl = wgsl.replace('/* INJECT COMPUTED STATS */', computedStatsWgsl)

  return wgsl
}

function injectConditionals(wgsl: string, request: Form) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  if (lightConeConditionals.gpu) wgsl = wgsl.replace('/* INJECT LIGHT CONE CONDITIONALS */', lightConeConditionals.gpu())
  if (characterConditionals.gpu) wgsl = wgsl.replace('/* INJECT CHARACTER CONDITIONALS */', characterConditionals.gpu())

  return wgsl
}