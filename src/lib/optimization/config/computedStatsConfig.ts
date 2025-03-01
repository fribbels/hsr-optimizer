import {
  ADDITIONAL_DMG_TYPE,
  BASIC_DMG_TYPE,
  BREAK_DMG_TYPE,
  DOT_DMG_TYPE,
  FUA_DMG_TYPE,
  MEMO_DMG_TYPE,
  SKILL_DMG_TYPE,
  SUPER_BREAK_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'

enum StatCategory {
  CD,
  NONE,
}

export type ComputedStatsConfigBaseType = {
  category?: StatCategory
  default?: number
  flat?: boolean
  whole?: boolean
}

export const BaseComputedStatsConfig = {
  HP_P: {},
  ATK_P: {},
  DEF_P: {},
  SPD_P: {},
  HP: { flat: true },
  ATK: { flat: true },
  DEF: { flat: true },
  SPD: { flat: true, default: 0.0001 },
  CR: {},
  CD: {},
  EHR: {},
  RES: {},
  BE: {},
  ERR: {},
  OHB: {},

  PHYSICAL_DMG_BOOST: {},
  FIRE_DMG_BOOST: {},
  ICE_DMG_BOOST: {},
  LIGHTNING_DMG_BOOST: {},
  WIND_DMG_BOOST: {},
  QUANTUM_DMG_BOOST: {},
  IMAGINARY_DMG_BOOST: {},

  ELEMENTAL_DMG: {},

  BASE_HP: {},
  BASE_ATK: {},
  BASE_DEF: {},
  BASE_SPD: {},

  BASIC_SCALING: {},
  SKILL_SCALING: {},
  ULT_SCALING: {},
  FUA_SCALING: {},
  DOT_SCALING: {},

  BASIC_CR_BOOST: {},
  SKILL_CR_BOOST: {},
  ULT_CR_BOOST: {},
  FUA_CR_BOOST: {},

  BASIC_CD_BOOST: {},
  SKILL_CD_BOOST: {},
  ULT_CD_BOOST: {},
  FUA_CD_BOOST: {},

  BASIC_BOOST: {},
  SKILL_BOOST: {},
  ULT_BOOST: {},
  FUA_BOOST: {},
  DOT_BOOST: {},
  BREAK_BOOST: {},
  ADDITIONAL_BOOST: {},
  MEMO_SKILL_BOOST: {},
  MEMO_TALENT_BOOST: {},

  VULNERABILITY: {},
  BASIC_VULNERABILITY: {},
  SKILL_VULNERABILITY: {},
  ULT_VULNERABILITY: {},
  FUA_VULNERABILITY: {},
  DOT_VULNERABILITY: {},
  BREAK_VULNERABILITY: {},

  DEF_PEN: {},
  BASIC_DEF_PEN: {},
  SKILL_DEF_PEN: {},
  ULT_DEF_PEN: {},
  FUA_DEF_PEN: {},
  DOT_DEF_PEN: {},
  BREAK_DEF_PEN: {},
  SUPER_BREAK_DEF_PEN: {},

  RES_PEN: {},
  PHYSICAL_RES_PEN: {},
  FIRE_RES_PEN: {},
  ICE_RES_PEN: {},
  LIGHTNING_RES_PEN: {},
  WIND_RES_PEN: {},
  QUANTUM_RES_PEN: {},
  IMAGINARY_RES_PEN: {},

  // These should technically be split by element but they are rare enough to ignore imo (e.g. DHIL basic attack)
  BASIC_RES_PEN: {},
  SKILL_RES_PEN: {},
  ULT_RES_PEN: {},
  FUA_RES_PEN: {},
  DOT_RES_PEN: {},

  BASIC_DMG: { flat: true },
  SKILL_DMG: { flat: true },
  ULT_DMG: { flat: true },
  FUA_DMG: { flat: true },
  DOT_DMG: { flat: true },
  BREAK_DMG: { flat: true },
  COMBO_DMG: { flat: true },

  DMG_RED_MULTI: { default: 1 }, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi)
  EHP: { flat: true },
  SHIELD_BOOST: {},

  DOT_CHANCE: {},
  EFFECT_RES_PEN: {},

  // Black swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_SPLIT: {},
  DOT_STACKS: { flat: true },

  SUMMONS: { flat: true },

  ENEMY_WEAKNESS_BROKEN: { flat: true },

  SUPER_BREAK_MODIFIER: {},
  BASIC_SUPER_BREAK_MODIFIER: {},
  BASIC_TOUGHNESS_DMG: { flat: true },
  SKILL_TOUGHNESS_DMG: { flat: true },
  ULT_TOUGHNESS_DMG: { flat: true },
  FUA_TOUGHNESS_DMG: { flat: true },
  MEMO_SKILL_TOUGHNESS_DMG: { flat: true },
  MEMO_TALENT_TOUGHNESS_DMG: { flat: true },

  // True dmg
  TRUE_DMG_MODIFIER: {},
  BASIC_TRUE_DMG_MODIFIER: {},
  SKILL_TRUE_DMG_MODIFIER: {},
  ULT_TRUE_DMG_MODIFIER: {},
  FUA_TRUE_DMG_MODIFIER: {},
  BREAK_TRUE_DMG_MODIFIER: {},
  MEMO_TRUE_DMG_MODIFIER: {},

  // e.g. Acheron multiplier
  FINAL_DMG_BOOST: {},
  BASIC_FINAL_DMG_BOOST: {},
  SKILL_FINAL_DMG_BOOST: {},
  ULT_FINAL_DMG_BOOST: {},

  // Boothill
  BASIC_BREAK_DMG_MODIFIER: {},

  // Robin
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: {},
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: {},

  SKILL_OHB: {},
  ULT_OHB: {},
  HEAL_TYPE: { flat: true },
  HEAL_FLAT: { flat: true },
  HEAL_SCALING: {},
  HEAL_VALUE: { flat: true },
  SHIELD_FLAT: { flat: true },
  SHIELD_SCALING: {},
  SHIELD_VALUE: { flat: true },

  BASIC_ADDITIONAL_DMG_SCALING: {},
  SKILL_ADDITIONAL_DMG_SCALING: {},
  ULT_ADDITIONAL_DMG_SCALING: {},
  FUA_ADDITIONAL_DMG_SCALING: {},

  BASIC_ADDITIONAL_DMG: { flat: true },
  SKILL_ADDITIONAL_DMG: { flat: true },
  ULT_ADDITIONAL_DMG: { flat: true },
  FUA_ADDITIONAL_DMG: { flat: true },

  MEMO_BUFF_PRIORITY: { flat: true },
  DEPRIORITIZE_BUFFS: { flat: true },

  MEMO_BASE_HP_SCALING: {},
  MEMO_BASE_HP_FLAT: { flat: true },
  MEMO_BASE_DEF_SCALING: {},
  MEMO_BASE_DEF_FLAT: { flat: true },
  MEMO_BASE_ATK_SCALING: {},
  MEMO_BASE_ATK_FLAT: { flat: true },
  MEMO_BASE_SPD_SCALING: {},
  MEMO_BASE_SPD_FLAT: { flat: true },

  MEMO_SKILL_SCALING: {},
  MEMO_TALENT_SCALING: {},

  MEMO_SKILL_DMG: { flat: true },
  MEMO_TALENT_DMG: { flat: true },

  UNCONVERTIBLE_HP_BUFF: { flat: true },
  UNCONVERTIBLE_ATK_BUFF: { flat: true },
  UNCONVERTIBLE_DEF_BUFF: { flat: true },
  UNCONVERTIBLE_SPD_BUFF: { flat: true },
  UNCONVERTIBLE_CR_BUFF: {},
  UNCONVERTIBLE_CD_BUFF: {},
  UNCONVERTIBLE_EHR_BUFF: {},
  UNCONVERTIBLE_BE_BUFF: {},
  UNCONVERTIBLE_OHB_BUFF: {},
  UNCONVERTIBLE_RES_BUFF: {},
  UNCONVERTIBLE_ERR_BUFF: {},

  BREAK_EFFICIENCY_BOOST: {},
  BASIC_BREAK_EFFICIENCY_BOOST: {}, // Boothill
  ULT_BREAK_EFFICIENCY_BOOST: {}, // Feixiao

  BASIC_DMG_TYPE: { flat: true, default: BASIC_DMG_TYPE },
  SKILL_DMG_TYPE: { flat: true, default: SKILL_DMG_TYPE },
  ULT_DMG_TYPE: { flat: true, default: ULT_DMG_TYPE },
  FUA_DMG_TYPE: { flat: true, default: FUA_DMG_TYPE },
  DOT_DMG_TYPE: { flat: true, default: DOT_DMG_TYPE },
  BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE },
  SUPER_BREAK_DMG_TYPE: { flat: true, default: SUPER_BREAK_DMG_TYPE },
  MEMO_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE },
  ADDITIONAL_DMG_TYPE: { flat: true, default: ADDITIONAL_DMG_TYPE },
} as const

export type ComputedStatKeys = keyof typeof BaseComputedStatsConfig

export type StatConfig = {
  name: string
  index: number
  default: number
  flat: boolean
  whole: boolean
  category: StatCategory
}

export type ComputedStatsConfigType = {
  [K in ComputedStatKeys]: StatConfig;
}

export const StatsConfig: ComputedStatsConfigType = Object.fromEntries(
  Object.entries(BaseComputedStatsConfig).map(([key, value], index) => {
    const baseValue = value as ComputedStatsConfigBaseType

    return [
      key,
      {
        name: key,
        index: index,
        default: baseValue.default ?? 0,
        flat: baseValue.flat ?? false,
        whole: baseValue.whole ?? false,
        category: baseValue.category ?? StatCategory.NONE,
      },
    ]
  }),
) as ComputedStatsConfigType

export type ComputedStatsObject = {
  [K in keyof typeof StatsConfig]: number;
}

export const baseComputedStatsObject: ComputedStatsObject = Object.fromEntries(
  Object.entries(StatsConfig).map(([key, value]) => [key, value.default]),
) as ComputedStatsObject

export const StatsConfigByIndex: StatConfig[] = Object.values(StatsConfig).sort((a, b) => a.index - b.index)
