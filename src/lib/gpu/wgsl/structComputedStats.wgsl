// Don't change this without updating the variable order mapping

struct ComputedStats {
  HP_P: f32,
  ATK_P: f32,
  DEF_P: f32,
  SPD_P: f32,
  HP: f32,
  ATK: f32,
  DEF: f32,
  SPD: f32,
  CR: f32,
  CD: f32,
  EHR: f32,
  RES: f32,
  BE: f32,
  ERR: f32,
  OHB: f32,

  Physical_DMG: f32,
  Fire_DMG: f32,
  Ice_DMG: f32,
  Lightning_DMG: f32,
  Wind_DMG: f32,
  Quantum_DMG: f32,
  Imaginary_DMG: f32,

  ELEMENTAL_DMG: f32,

  BASIC_SCALING: f32,
  SKILL_SCALING: f32,
  ULT_SCALING: f32,
  FUA_SCALING: f32,
  DOT_SCALING: f32,

  BASIC_CR_BOOST: f32,
  SKILL_CR_BOOST: f32,
  ULT_CR_BOOST: f32,
  FUA_CR_BOOST: f32,

  BASIC_CD_BOOST: f32,
  SKILL_CD_BOOST: f32,
  ULT_CD_BOOST: f32,
  FUA_CD_BOOST: f32,

  BASIC_BOOST: f32,
  SKILL_BOOST: f32,
  ULT_BOOST: f32,
  FUA_BOOST: f32,
  DOT_BOOST: f32,
  BREAK_BOOST: f32,
  ADDITIONAL_BOOST: f32,

  VULNERABILITY: f32,
  BASIC_VULNERABILITY: f32,
  SKILL_VULNERABILITY: f32,
  ULT_VULNERABILITY: f32,
  FUA_VULNERABILITY: f32,
  DOT_VULNERABILITY: f32,
  BREAK_VULNERABILITY: f32, // 47

  DEF_PEN: f32,
  BASIC_DEF_PEN: f32,
  SKILL_DEF_PEN: f32,
  ULT_DEF_PEN: f32,
  FUA_DEF_PEN: f32,
  DOT_DEF_PEN: f32,
  BREAK_DEF_PEN: f32,
  SUPER_BREAK_DEF_PEN: f32, // 55

  RES_PEN: f32,
  PHYSICAL_RES_PEN: f32,
  FIRE_RES_PEN: f32,
  ICE_RES_PEN: f32,
  LIGHTNING_RES_PEN: f32,
  WIND_RES_PEN: f32,
  QUANTUM_RES_PEN: f32,
  IMAGINARY_RES_PEN: f32, // 63

  BASIC_RES_PEN: f32,
  SKILL_RES_PEN: f32,
  ULT_RES_PEN: f32,
  FUA_RES_PEN: f32,
  DOT_RES_PEN: f32, // 68

  BASIC_DMG: f32,
  SKILL_DMG: f32,
  ULT_DMG: f32,
  FUA_DMG: f32,
  DOT_DMG: f32,
  BREAK_DMG: f32,
  COMBO_DMG: f32, // 75

  DMG_RED_MULTI: f32,
  EHP: f32,

  DOT_CHANCE: f32,
  EFFECT_RES_PEN: f32,

  DOT_SPLIT: f32,
  DOT_STACKS: f32,

  SUMMONS: f32,

  ENEMY_WEAKNESS_BROKEN: f32,

  SUPER_BREAK_MODIFIER: f32,
  BASIC_SUPER_BREAK_MODIFIER: f32,
  SUPER_BREAK_HMC_MODIFIER: f32,
  BASIC_TOUGHNESS_DMG: f32,
  SKILL_TOUGHNESS_DMG: f32,
  ULT_TOUGHNESS_DMG: f32,
  FUA_TOUGHNESS_DMG: f32,

  TRUE_DMG_MODIFIER: f32,

  BASIC_ORIGINAL_DMG_BOOST: f32,
  SKILL_ORIGINAL_DMG_BOOST: f32,
  ULT_ORIGINAL_DMG_BOOST: f32,

  BASIC_BREAK_DMG_MODIFIER: f32,

  ULT_ADDITIONAL_DMG_CR_OVERRIDE: f32,
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: f32,

  SKILL_OHB: f32,
  ULT_OHB: f32,
  HEAL_TYPE: f32,
  HEAL_FLAT: f32,
  HEAL_SCALING: f32,
  HEAL_VALUE: f32,
  SHIELD_FLAT: f32,
  SHIELD_SCALING: f32,
  SHIELD_VALUE: f32,

  BASIC_ADDITIONAL_DMG_SCALING: f32,
  SKILL_ADDITIONAL_DMG_SCALING: f32,
  ULT_ADDITIONAL_DMG_SCALING: f32,
  FUA_ADDITIONAL_DMG_SCALING: f32,

  BASIC_ADDITIONAL_DMG: f32,
  SKILL_ADDITIONAL_DMG: f32,
  ULT_ADDITIONAL_DMG: f32,
  FUA_ADDITIONAL_DMG: f32,

  MEMO_BUFF_PRIORITY: f32,
  DEPRIORITIZE_BUFFS: f32,

  MEMO_HP_SCALING: f32,
  MEMO_HP_FLAT: f32,
  MEMO_DEF_SCALING: f32,
  MEMO_DEF_FLAT: f32,
  MEMO_ATK_SCALING: f32,
  MEMO_ATK_FLAT: f32,
  MEMO_SPD_SCALING: f32,
  MEMO_SPD_FLAT: f32,

  MEMO_SKILL_SCALING: f32,
  MEMO_TALENT_SCALING: f32,

  MEMO_SKILL_DMG: f32,
  MEMO_TALENT_DMG: f32,

  UNCONVERTIBLE_HP_BUFF: f32,
  UNCONVERTIBLE_ATK_BUFF: f32,
  UNCONVERTIBLE_DEF_BUFF: f32,
  UNCONVERTIBLE_SPD_BUFF: f32,
  UNCONVERTIBLE_CR_BUFF: f32,
  UNCONVERTIBLE_CD_BUFF: f32,
  UNCONVERTIBLE_EHR_BUFF: f32,
  UNCONVERTIBLE_BE_BUFF: f32,
  UNCONVERTIBLE_OHB_BUFF: f32,
  UNCONVERTIBLE_RES_BUFF: f32,
  UNCONVERTIBLE_ERR_BUFF: f32,

  BREAK_EFFICIENCY_BOOST: f32,
  BASIC_BREAK_EFFICIENCY_BOOST: f32,
  ULT_BREAK_EFFICIENCY_BOOST: f32,

  BASIC_DMG_TYPE: f32,
  SKILL_DMG_TYPE: f32,
  ULT_DMG_TYPE: f32,
  FUA_DMG_TYPE: f32,
  DOT_DMG_TYPE: f32,
  BREAK_DMG_TYPE: f32,
  SUPER_BREAK_DMG_TYPE: f32,
  MEMO_DMG_TYPE: f32,
  ADDITIONAL_DMG_TYPE: f32,

  sets: Sets,
}
