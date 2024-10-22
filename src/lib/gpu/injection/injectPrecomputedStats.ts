import { Stats } from 'lib/constants'
import { OptimizerAction } from 'types/Optimizer'
import { GpuConstants } from 'lib/gpu/webgpuTypes'

export function injectPrecomputedStatsContext(action: OptimizerAction, gpuParams: GpuConstants) {
  const x = action.precomputedX
  x.EHP = 0

  const computedStatsWgsl = `
      ${x[Stats.HP_P]},${gpuParams.DEBUG ? ' // Stats.HP_P' : ''}
      ${x[Stats.ATK_P]},${gpuParams.DEBUG ? ' // Stats.ATK_P' : ''}
      ${x[Stats.DEF_P]},${gpuParams.DEBUG ? ' // Stats.DEF_P' : ''}
      ${x[Stats.SPD_P]},${gpuParams.DEBUG ? ' // Stats.SPD_P' : ''}
      ${x[Stats.HP]},${gpuParams.DEBUG ? ' // Stats.HP' : ''}
      ${x[Stats.ATK]},${gpuParams.DEBUG ? ' // Stats.ATK' : ''}
      ${x[Stats.DEF]},${gpuParams.DEBUG ? ' // Stats.DEF' : ''}
      ${x[Stats.SPD]},${gpuParams.DEBUG ? ' // Stats.SPD' : ''}
      ${x[Stats.CR]},${gpuParams.DEBUG ? ' // Stats.CR' : ''}
      ${x[Stats.CD]},${gpuParams.DEBUG ? ' // Stats.CD' : ''}
      ${x[Stats.EHR]},${gpuParams.DEBUG ? ' // Stats.EHR' : ''}
      ${x[Stats.RES]},${gpuParams.DEBUG ? ' // Stats.RES' : ''}
      ${x[Stats.BE]},${gpuParams.DEBUG ? ' // Stats.BE' : ''}
      ${x[Stats.ERR]},${gpuParams.DEBUG ? ' // Stats.ERR' : ''}
      ${x[Stats.OHB]},${gpuParams.DEBUG ? ' // Stats.OHB' : ''}
      ${x[Stats.Physical_DMG]},${gpuParams.DEBUG ? ' // Stats.Physical_DMG' : ''}
      ${x[Stats.Fire_DMG]},${gpuParams.DEBUG ? ' // Stats.Fire_DMG' : ''}
      ${x[Stats.Ice_DMG]},${gpuParams.DEBUG ? ' // Stats.Ice_DMG' : ''}
      ${x[Stats.Lightning_DMG]},${gpuParams.DEBUG ? ' // Stats.Lightning_DMG' : ''}
      ${x[Stats.Wind_DMG]},${gpuParams.DEBUG ? ' // Stats.Wind_DMG' : ''}
      ${x[Stats.Quantum_DMG]},${gpuParams.DEBUG ? ' // Stats.Quantum_DMG' : ''}
      ${x[Stats.Imaginary_DMG]},${gpuParams.DEBUG ? ' // Stats.Imaginary_DMG' : ''}
      ${x.ELEMENTAL_DMG},${gpuParams.DEBUG ? ' // ELEMENTAL_DMG' : ''}
      ${x.BASIC_SCALING},${gpuParams.DEBUG ? ' // BASIC_SCALING' : ''}
      ${x.SKILL_SCALING},${gpuParams.DEBUG ? ' // SKILL_SCALING' : ''}
      ${x.ULT_SCALING},${gpuParams.DEBUG ? ' // ULT_SCALING' : ''}
      ${x.FUA_SCALING},${gpuParams.DEBUG ? ' // FUA_SCALING' : ''}
      ${x.DOT_SCALING},${gpuParams.DEBUG ? ' // DOT_SCALING' : ''}
      ${x.BASIC_CR_BOOST},${gpuParams.DEBUG ? ' // BASIC_CR_BOOST' : ''}
      ${x.SKILL_CR_BOOST},${gpuParams.DEBUG ? ' // SKILL_CR_BOOST' : ''}
      ${x.ULT_CR_BOOST},${gpuParams.DEBUG ? ' // ULT_CR_BOOST' : ''}
      ${x.FUA_CR_BOOST},${gpuParams.DEBUG ? ' // FUA_CR_BOOST' : ''}
      ${x.BASIC_CD_BOOST},${gpuParams.DEBUG ? ' // BASIC_CD_BOOST' : ''}
      ${x.SKILL_CD_BOOST},${gpuParams.DEBUG ? ' // SKILL_CD_BOOST' : ''}
      ${x.ULT_CD_BOOST},${gpuParams.DEBUG ? ' // ULT_CD_BOOST' : ''}
      ${x.FUA_CD_BOOST},${gpuParams.DEBUG ? ' // FUA_CD_BOOST' : ''}
      ${x.BASIC_BOOST},${gpuParams.DEBUG ? ' // BASIC_BOOST' : ''}
      ${x.SKILL_BOOST},${gpuParams.DEBUG ? ' // SKILL_BOOST' : ''}
      ${x.ULT_BOOST},${gpuParams.DEBUG ? ' // ULT_BOOST' : ''}
      ${x.FUA_BOOST},${gpuParams.DEBUG ? ' // FUA_BOOST' : ''}
      ${x.DOT_BOOST},${gpuParams.DEBUG ? ' // DOT_BOOST' : ''}
      ${x.VULNERABILITY},${gpuParams.DEBUG ? ' // VULNERABILITY' : ''}
      ${x.BASIC_VULNERABILITY},${gpuParams.DEBUG ? ' // BASIC_VULNERABILITY' : ''}
      ${x.SKILL_VULNERABILITY},${gpuParams.DEBUG ? ' // SKILL_VULNERABILITY' : ''}
      ${x.ULT_VULNERABILITY},${gpuParams.DEBUG ? ' // ULT_VULNERABILITY' : ''}
      ${x.FUA_VULNERABILITY},${gpuParams.DEBUG ? ' // FUA_VULNERABILITY' : ''}
      ${x.DOT_VULNERABILITY},${gpuParams.DEBUG ? ' // DOT_VULNERABILITY' : ''}
      ${x.BREAK_VULNERABILITY},${gpuParams.DEBUG ? ' // BREAK_VULNERABILITY' : ''}
      ${x.DEF_PEN},${gpuParams.DEBUG ? ' // DEF_PEN' : ''}
      ${x.BASIC_DEF_PEN},${gpuParams.DEBUG ? ' // BASIC_DEF_PEN' : ''}
      ${x.SKILL_DEF_PEN},${gpuParams.DEBUG ? ' // SKILL_DEF_PEN' : ''}
      ${x.ULT_DEF_PEN},${gpuParams.DEBUG ? ' // ULT_DEF_PEN' : ''}
      ${x.FUA_DEF_PEN},${gpuParams.DEBUG ? ' // FUA_DEF_PEN' : ''}
      ${x.DOT_DEF_PEN},${gpuParams.DEBUG ? ' // DOT_DEF_PEN' : ''}
      ${x.BREAK_DEF_PEN},${gpuParams.DEBUG ? ' // BREAK_DEF_PEN' : ''}
      ${x.SUPER_BREAK_DEF_PEN},${gpuParams.DEBUG ? ' // SUPER_BREAK_DEF_PEN' : ''}
      ${x.RES_PEN},${gpuParams.DEBUG ? ' // RES_PEN' : ''}
      ${x.PHYSICAL_RES_PEN},${gpuParams.DEBUG ? ' // PHYSICAL_RES_PEN' : ''}
      ${x.FIRE_RES_PEN},${gpuParams.DEBUG ? ' // FIRE_RES_PEN' : ''}
      ${x.ICE_RES_PEN},${gpuParams.DEBUG ? ' // ICE_RES_PEN' : ''}
      ${x.LIGHTNING_RES_PEN},${gpuParams.DEBUG ? ' // LIGHTNING_RES_PEN' : ''}
      ${x.WIND_RES_PEN},${gpuParams.DEBUG ? ' // WIND_RES_PEN' : ''}
      ${x.QUANTUM_RES_PEN},${gpuParams.DEBUG ? ' // QUANTUM_RES_PEN' : ''}
      ${x.IMAGINARY_RES_PEN},${gpuParams.DEBUG ? ' // IMAGINARY_RES_PEN' : ''}
      ${x.BASIC_RES_PEN},${gpuParams.DEBUG ? ' // BASIC_RES_PEN' : ''}
      ${x.SKILL_RES_PEN},${gpuParams.DEBUG ? ' // SKILL_RES_PEN' : ''}
      ${x.ULT_RES_PEN},${gpuParams.DEBUG ? ' // ULT_RES_PEN' : ''}
      ${x.FUA_RES_PEN},${gpuParams.DEBUG ? ' // FUA_RES_PEN' : ''}
      ${x.DOT_RES_PEN},${gpuParams.DEBUG ? ' // DOT_RES_PEN' : ''}
      ${x.BASIC_DMG},${gpuParams.DEBUG ? ' // BASIC_DMG' : ''}
      ${x.SKILL_DMG},${gpuParams.DEBUG ? ' // SKILL_DMG' : ''}
      ${x.ULT_DMG},${gpuParams.DEBUG ? ' // ULT_DMG' : ''}
      ${x.FUA_DMG},${gpuParams.DEBUG ? ' // FUA_DMG' : ''}
      ${x.DOT_DMG},${gpuParams.DEBUG ? ' // DOT_DMG' : ''}
      ${x.BREAK_DMG},${gpuParams.DEBUG ? ' // BREAK_DMG' : ''}
      ${x.COMBO_DMG},${gpuParams.DEBUG ? ' // COMBO_DMG' : ''}
      ${x.DMG_RED_MULTI},${gpuParams.DEBUG ? ' // DMG_RED_MULTI' : ''}
      ${x.EHP},${gpuParams.DEBUG ? ' // EHP' : ''}
      ${x.DOT_CHANCE},${gpuParams.DEBUG ? ' // DOT_CHANCE' : ''}
      ${x.EFFECT_RES_PEN},${gpuParams.DEBUG ? ' // EFFECT_RES_PEN' : ''}
      ${x.DOT_SPLIT},${gpuParams.DEBUG ? ' // DOT_SPLIT' : ''}
      ${x.DOT_STACKS},${gpuParams.DEBUG ? ' // DOT_STACKS' : ''}
      ${x.SUMMONS},${gpuParams.DEBUG ? ' // SUMMONS' : ''}
      ${x.ENEMY_WEAKNESS_BROKEN},${gpuParams.DEBUG ? ' // ENEMY_WEAKNESS_BROKEN' : ''}
      ${x.SUPER_BREAK_MODIFIER},${gpuParams.DEBUG ? ' // SUPER_BREAK_MODIFIER' : ''}
      ${x.BASIC_SUPER_BREAK_MODIFIER},${gpuParams.DEBUG ? ' // BASIC_SUPER_BREAK_MODIFIER' : ''}
      ${x.SUPER_BREAK_HMC_MODIFIER},${gpuParams.DEBUG ? ' // SUPER_BREAK_HMC_MODIFIER' : ''}
      ${x.BASIC_TOUGHNESS_DMG},${gpuParams.DEBUG ? ' // BASIC_TOUGHNESS_DMG' : ''}
      ${x.SKILL_TOUGHNESS_DMG},${gpuParams.DEBUG ? ' // SKILL_TOUGHNESS_DMG' : ''}
      ${x.ULT_TOUGHNESS_DMG},${gpuParams.DEBUG ? ' // ULT_TOUGHNESS_DMG' : ''}
      ${x.FUA_TOUGHNESS_DMG},${gpuParams.DEBUG ? ' // FUA_TOUGHNESS_DMG' : ''}
      ${x.BASIC_ORIGINAL_DMG_BOOST},${gpuParams.DEBUG ? ' // BASIC_ORIGINAL_DMG_BOOST' : ''}
      ${x.SKILL_ORIGINAL_DMG_BOOST},${gpuParams.DEBUG ? ' // SKILL_ORIGINAL_DMG_BOOST' : ''}
      ${x.ULT_ORIGINAL_DMG_BOOST},${gpuParams.DEBUG ? ' // ULT_ORIGINAL_DMG_BOOST' : ''}
      ${x.BASIC_BREAK_DMG_MODIFIER},${gpuParams.DEBUG ? ' // BASIC_BREAK_DMG_MODIFIER' : ''}
      ${x.ULT_CD_OVERRIDE},${gpuParams.DEBUG ? ' // ULT_CD_OVERRIDE' : ''}
      ${x.ULT_BOOSTS_MULTI},${gpuParams.DEBUG ? ' // ULT_BOOSTS_MULTI' : ''}
      ${x.RATIO_BASED_HP_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_HP_BUFF' : ''}
      ${x.RATIO_BASED_HP_P_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_HP_P_BUFF' : ''}
      ${x.RATIO_BASED_ATK_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_ATK_BUFF' : ''}
      ${x.RATIO_BASED_ATK_P_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_ATK_P_BUFF' : ''}
      ${x.RATIO_BASED_DEF_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_DEF_BUFF' : ''}
      ${x.RATIO_BASED_DEF_P_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_DEF_P_BUFF' : ''}
      ${x.RATIO_BASED_SPD_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_SPD_BUFF' : ''}
      ${x.RATIO_BASED_CD_BUFF},${gpuParams.DEBUG ? ' // RATIO_BASED_CD_BUFF' : ''}
      ${x.BREAK_EFFICIENCY_BOOST},${gpuParams.DEBUG ? ' // BREAK_EFFICIENCY_BOOST' : ''}
      ${x.BASIC_BREAK_EFFICIENCY_BOOST},${gpuParams.DEBUG ? ' // BASIC_BREAK_EFFICIENCY_BOOST' : ''}
      ${x.ULT_BREAK_EFFICIENCY_BOOST},${gpuParams.DEBUG ? ' // ULT_BREAK_EFFICIENCY_BOOST' : ''}
      ${x.BASIC_DMG_TYPE},${gpuParams.DEBUG ? ' // BASIC_DMG_TYPE' : ''}
      ${x.SKILL_DMG_TYPE},${gpuParams.DEBUG ? ' // SKILL_DMG_TYPE' : ''}
      ${x.ULT_DMG_TYPE},${gpuParams.DEBUG ? ' // ULT_DMG_TYPE' : ''}
      ${x.FUA_DMG_TYPE},${gpuParams.DEBUG ? ' // FUA_DMG_TYPE' : ''}
      ${x.DOT_DMG_TYPE},${gpuParams.DEBUG ? ' // DOT_DMG_TYPE' : ''}
      ${x.BREAK_DMG_TYPE},${gpuParams.DEBUG ? ' // BREAK_DMG_TYPE' : ''}
      ${x.SUPER_BREAK_DMG_TYPE},${gpuParams.DEBUG ? ' // SUPER_BREAK_DMG_TYPE' : ''}
      Sets(),`

  return computedStatsWgsl
}
