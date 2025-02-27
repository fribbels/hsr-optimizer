export const newBaseComputedStatsCorePropertiesConfig = {
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

  HEAL_TYPE: { flat: true },
  HEAL_FLAT: { flat: true },
  HEAL_SCALING: {},
  HEAL_VALUE: { flat: true },
  SHIELD_FLAT: { flat: true },
  SHIELD_SCALING: {},
  SHIELD_VALUE: { flat: true },

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
}

export const newBaseComputedStatsAbilityPropertiesConfig = {
  ATK_SCALING: {},
  DEF_SCALING: {},
  HP_SCALING: {},
  SPD_SCALING: {},
  CR_BOOST: {},
  CD_BOOST: {},
  DMG_BOOST: {},
  ADDITIONAL_DMG_BOOST: {},
  VULNERABILITY: {},
  DEF_PEN: {},
  BREAK_DEF_PEN: {},
  SUPER_BREAK_DEF_PEN: {},
  PHYSICAL_RES_PEN: {},
  FIRE_RES_PEN: {},
  ICE_RES_PEN: {},
  LIGHTNING_RES_PEN: {},
  WIND_RES_PEN: {},
  QUANTUM_RES_PEN: {},
  IMAGINARY_RES_PEN: {},
  RES_PEN: {},
  DMG: {},
  SUPER_BREAK_MODIFIER: {},
  TOUGHNESS_DMG: {},
  TRUE_DMG_MODIFIER: {},
  FINAL_DMG_BOOST: {},
  BREAK_DMG_MODIFIER: {},
  ADDITIONAL_DMG_CR_OVERRIDE: {},
  ADDITIONAL_DMG_CD_OVERRIDE: {},
  OHB: {},
  ADDITIONAL_DMG_SCALING: {},
  ADDITIONAL_DMG: {},
  BREAK_EFFICIENCY_BOOST: {},
  DMG_TYPE: {},
}

export enum DamageType {
  BASIC,
  SKILL,
  ULT,
  FUA,
  DOT,
  BREAK,
  SUPER_BREAK,
  MEMO,
  ADDITIONAL,
}

export enum AbilityType {
  BASIC,
  SKILL,
  ULT,
  FUA,
  DOT, // *
  BREAK, // *
  MEMO_SKILL,
  MEMO_TALENT,
}

// Convert numeric enum to string keys
const abilityTypeNames = Object.keys(AbilityType).filter((key) => isNaN(Number(key)))

export const combinedConfig = {
  ...newBaseComputedStatsCorePropertiesConfig,
  ...abilityTypeNames.reduce((acc, ability) => {
    Object.keys(newBaseComputedStatsAbilityPropertiesConfig).forEach((key) => {
      acc[`${ability}_${key}`] = {}
    })
    return acc
  }, {} as Record<string, object>),
} as const

export type NewComputedStatKeys = keyof typeof combinedConfig

enum NewStatCategory {
  CD,
  NONE,
}

export type NewStatConfig = {
  name: string
  index: number
  default: number
  flat: boolean
  whole: boolean
  category: NewStatCategory
}

export type NewComputedStatsConfigType = {
  [K in NewComputedStatKeys]: NewStatConfig;
}

export type NewComputedStatsConfigBaseType = {
  category?: NewStatCategory
  default?: number
  flat?: boolean
  whole?: boolean
}

export const NewStatsConfig: NewComputedStatsConfigType = Object.fromEntries(
  Object.entries(combinedConfig).map(([key, value], index) => {
    const baseValue = value as NewComputedStatsConfigBaseType

    return [
      key,
      {
        name: key,
        index: index,
        default: baseValue.default ?? 0,
        flat: baseValue.flat ?? false,
        whole: baseValue.whole ?? false,
        category: baseValue.category ?? NewStatCategory.NONE,
      },
    ]
  }),
) as NewComputedStatsConfigType

export type NewComputedStatsObject = {
  [K in keyof typeof NewStatsConfig]: number;
}

export const newBaseComputedStatsObject: NewComputedStatsObject = Object.fromEntries(
  Object.entries(NewStatsConfig).map(([key, value]) => [key, value.default]),
) as NewComputedStatsObject

export const NewStatsConfigByIndex: NewStatConfig[] = Object.values(NewStatsConfig).sort((a, b) => a.index - b.index)

export const DEBUG = 1

console.debug(NewStatsConfig)
console.debug(newBaseComputedStatsObject)
console.debug(NewStatsConfigByIndex)
