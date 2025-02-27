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
import { DEBUG } from 'lib/optimization/config/newStatsConfig'

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

  COMBO_DMG: {},

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
} as const

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

type AbilityTypeKeys = keyof typeof AbilityType

export const BaseComputedStatsConfig = {
  ...newBaseComputedStatsCorePropertiesConfig,
  ...Object.values(AbilityType)
    .filter((value): value is AbilityType => typeof value === 'number') // Ensure only numeric values
    .reduce((acc, ability) => {
      const abilityKey = AbilityType[ability] as AbilityTypeKeys // Convert numeric value to string key

      Object.keys(newBaseComputedStatsAbilityPropertiesConfig).forEach((key) => {
        acc[`${abilityKey}_${key}` as `${AbilityTypeKeys}_${keyof typeof newBaseComputedStatsAbilityPropertiesConfig}`] = {}
      })

      return acc
    }, {} as Record<`${AbilityTypeKeys}_${keyof typeof newBaseComputedStatsAbilityPropertiesConfig}`, object>),
  ...newBaseComputedStatsAbilityPropertiesConfig, // Add non-prefixed properties
}

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

console.log(DEBUG)
