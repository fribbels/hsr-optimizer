import {
  AbilityType,
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
  separated?: boolean
  bool?: boolean
  label: string
}

export const newBaseComputedStatsCorePropertiesConfig = {
  // Core stats
  HP_P: { label: 'HP %' },
  ATK_P: { label: 'ATK %' },
  DEF_P: { label: 'DEF %' },
  SPD_P: { label: 'SPD %' },
  HP: { flat: true, label: 'HP' },
  ATK: { flat: true, label: 'ATK' },
  DEF: { flat: true, label: 'DEF' },
  SPD: { flat: true, default: 0.0001, label: 'SPD' },
  CR: { label: 'Crit Rate' },
  CD: { label: 'Crit DMG' },
  EHR: { label: 'Effect Hit Rate' },
  RES: { label: 'Effect RES' },
  BE: { label: 'Break Effect' },
  ERR: { label: 'Energy Regeneration Rate' },
  OHB: { label: 'Outgoing Healing Boost' },

  // Elemental stats
  PHYSICAL_DMG_BOOST: { label: 'Physical DMG Boost' },
  FIRE_DMG_BOOST: { label: 'Fire DMG Boost' },
  ICE_DMG_BOOST: { label: 'Ice DMG Boost' },
  LIGHTNING_DMG_BOOST: { label: 'Thunder DMG Boost' },
  WIND_DMG_BOOST: { label: 'Wind DMG Boost' },
  QUANTUM_DMG_BOOST: { label: 'Quantum DMG Boost' },
  IMAGINARY_DMG_BOOST: { label: 'Imaginary DMG Boost' },

  ELEMENTAL_DMG: { label: 'Elemental DMG' },

  // Base
  BASE_HP: { flat: true, label: 'Base HP' },
  BASE_ATK: { flat: true, label: 'Base ATK' },
  BASE_DEF: { flat: true, label: 'Base DEF' },
  BASE_SPD: { flat: true, label: 'Base SPD' },

  // Memosprites
  MEMO_BASE_HP_SCALING: { label: 'Memosprite base HP scaling' },
  MEMO_BASE_DEF_SCALING: { label: 'Memosprite base DEF scaling' },
  MEMO_BASE_ATK_SCALING: { label: 'Memosprite base ATK scaling' },
  MEMO_BASE_SPD_SCALING: { label: 'Memosprite base SPD scaling' },
  MEMO_BASE_HP_FLAT: { flat: true, label: 'Memosprite base HP flat' },
  MEMO_BASE_DEF_FLAT: { flat: true, label: 'Memosprite base DEF flat' },
  MEMO_BASE_ATK_FLAT: { flat: true, label: 'Memosprite base ATK flat' },
  MEMO_BASE_SPD_FLAT: { flat: true, label: 'Memosprite base SPD flat' },

  // Secondary conversions
  UNCONVERTIBLE_HP_BUFF: { flat: true, label: 'Unconvertible HP' },
  UNCONVERTIBLE_ATK_BUFF: { flat: true, label: 'Unconvertible ATK' },
  UNCONVERTIBLE_DEF_BUFF: { flat: true, label: 'Unconvertible DEF' },
  UNCONVERTIBLE_SPD_BUFF: { flat: true, label: 'Unconvertible SPD' },
  UNCONVERTIBLE_CR_BUFF: { label: 'Unconvertible Crit Rate' },
  UNCONVERTIBLE_CD_BUFF: { label: 'Unconvertible Crit DMG' },
  UNCONVERTIBLE_EHR_BUFF: { label: 'Unconvertible Effect Hit Rate' },
  UNCONVERTIBLE_BE_BUFF: { label: 'Unconvertible Break Effect' },
  UNCONVERTIBLE_OHB_BUFF: { label: 'Unconvertible Outgoing Healing Boost' },
  UNCONVERTIBLE_RES_BUFF: { label: 'Unconvertible Effect RES' },
  UNCONVERTIBLE_ERR_BUFF: { label: 'Unconvertible Energy Regeneration Rate' },

  // EHP
  DMG_RED_MULTI: { default: 1, label: 'DMG reduction' }, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi) instead of additive
  EHP: { flat: true, label: 'Effective HP' },

  // Misc configs
  SUMMONS: { flat: true, label: 'Summons' },
  MEMOSPRITE: { bool: true, label: 'Memosprite' },
  ENEMY_WEAKNESS_BROKEN: { bool: true, label: 'Enemy weakness broken' },
  MEMO_BUFF_PRIORITY: { bool: true, label: 'Prioritize memosprite buffs' },
  DEPRIORITIZE_BUFFS: { bool: true, label: 'Deprioritize buffs' },
  COMBO_DMG: { flat: true, label: 'Combo DMG' },

  // DOT
  DOT_CHANCE: { label: 'Dot base chance' },
  EFFECT_RES_PEN: { label: 'Effect RES PEN' },
  DOT_SPLIT: { label: 'Dot DMG split' }, // Black Swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_STACKS: { flat: true, label: 'Dot stacks' },

  // Heal / Shield
  HEAL_TYPE: { flat: true, label: 'Heal ability type' },
  HEAL_FLAT: { flat: true, label: 'Heal flat' },
  HEAL_SCALING: { label: 'Heal scaling' },
  HEAL_VALUE: { flat: true, label: 'Heal value' },
  SHIELD_FLAT: { flat: true, label: 'Shield flat' },
  SHIELD_SCALING: { label: 'Shield scaling' },
  SHIELD_VALUE: { flat: true, label: 'Shield value' },
  SHIELD_BOOST: { label: 'Shield boost' },
  SKILL_OHB: { label: 'Skill Outgoing Healing Boost' },
  ULT_OHB: { label: 'Ult Outgoing Healing Boost' },

  // Elemental res pen
  PHYSICAL_RES_PEN: { label: 'Physical RES PEN' },
  FIRE_RES_PEN: { label: 'Fire RES PEN' },
  ICE_RES_PEN: { label: 'Ice RES PEN' },
  LIGHTNING_RES_PEN: { label: 'Lightning RES PEN' },
  WIND_RES_PEN: { label: 'Wind RES PEN' },
  QUANTUM_RES_PEN: { label: 'Quantum RES PEN' },
  IMAGINARY_RES_PEN: { label: 'Imaginary RES PEN' },

  // Misc variables that dont need to be split into abilities yet
  SUPER_BREAK_DEF_PEN: { label: 'Super Break DEF PEN' },
  SUPER_BREAK_DMG_BOOST: { label: 'Super Break DMG Boost' },
  SUPER_BREAK_VULNERABILITY: { label: 'Super Break Vulnerability' },
  ADDITIONAL_DMG_BOOST: { label: 'Additional DMG boost' },
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: { label: 'Ult Additional DMG CR override' },
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: { label: 'Ult Additional DMG CD override' },

  // Abilities to damage type mapping
  BASIC_DMG_TYPE: { flat: true, default: BASIC_DMG_TYPE, label: 'Basic DMG type' },
  SKILL_DMG_TYPE: { flat: true, default: SKILL_DMG_TYPE, label: 'Skill DMG type' },
  ULT_DMG_TYPE: { flat: true, default: ULT_DMG_TYPE, label: 'Ult DMG type' },
  FUA_DMG_TYPE: { flat: true, default: FUA_DMG_TYPE, label: 'Fua DMG type' },
  DOT_DMG_TYPE: { flat: true, default: DOT_DMG_TYPE, label: 'Dot DMG type' },
  BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE, label: 'Break DMG type' },
  MEMO_SKILL_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: 'Memo Skill DMG type' },
  MEMO_TALENT_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: 'Memo Talent DMG type' },
  ADDITIONAL_DMG_TYPE: { flat: true, default: ADDITIONAL_DMG_TYPE, label: 'Additional DMG type' },
  SUPER_BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE | SUPER_BREAK_DMG_TYPE, label: 'Super Break DMG type' },
} as const

export const newBaseComputedStatsAbilityPropertiesConfig = {
  ATK_SCALING: { separated: true, label: 'ATK scaling' },
  DEF_SCALING: { separated: true, label: 'DEF scaling' },
  HP_SCALING: { separated: true, label: 'HP scaling' },
  SPECIAL_SCALING: { separated: true, label: 'Special scaling' },

  ATK_P_BOOST: { label: 'ATK % boost' },
  CR_BOOST: { label: 'Crit Rate boost' },
  CD_BOOST: { label: 'Crit DMG boost' },
  DMG_BOOST: { separated: true, label: 'DMG boost' }, // When merged this is just ELEMENTAL_DMG

  VULNERABILITY: { label: 'Vulnerability' },
  RES_PEN: { label: 'RES PEN' },
  DEF_PEN: { label: 'DEF PEN' },
  BREAK_DEF_PEN: { label: 'Break DEF PEN' },

  TOUGHNESS_DMG: { flat: true, separated: true, label: 'Toughness DMG' },
  SUPER_BREAK_MODIFIER: { label: 'Super Break multiplier' },
  BREAK_EFFICIENCY_BOOST: { label: 'Break Efficiency boost' },

  TRUE_DMG_MODIFIER: { label: 'True DMG multiplier' },
  FINAL_DMG_BOOST: { label: 'Final DMG multiplier' },
  BREAK_DMG_MODIFIER: { separated: true, label: 'Break DMG multiplier' },

  ADDITIONAL_DMG_SCALING: { separated: true, label: 'Additional DMG scaling' },
  ADDITIONAL_DMG: { flat: true, separated: true, label: 'Additional DMG' },

  DMG: { flat: true, label: 'DMG' },
} as const

type AbilityTypeKeys = keyof typeof AbilityType
type FilteredKeys = {
  [K in keyof typeof newBaseComputedStatsAbilityPropertiesConfig]:
  typeof newBaseComputedStatsAbilityPropertiesConfig[K] extends { separated: true } ? never : K
}[keyof typeof newBaseComputedStatsAbilityPropertiesConfig]

const abilityTypeLabels: Record<AbilityTypeKeys, string> = {
  BASIC: 'Basic',
  SKILL: 'Skill',
  ULT: 'Ult',
  FUA: 'Fua',
  DOT: 'Dot',
  BREAK: 'Break',
  MEMO_SKILL: 'Memo Skill',
  MEMO_TALENT: 'Memo Talent',
}

export const BaseComputedStatsConfig = {
  ...newBaseComputedStatsCorePropertiesConfig,

  ...Object.values(AbilityType)
    .filter((value): value is AbilityType => typeof value === 'number')
    .reduce((acc, ability) => {
      const abilityKey = AbilityType[ability] as AbilityTypeKeys

      Object.entries(newBaseComputedStatsAbilityPropertiesConfig).forEach(([key, value]) => {
        acc[`${abilityKey}_${key}` as `${AbilityTypeKeys}_${keyof typeof newBaseComputedStatsAbilityPropertiesConfig}`] = {
          ...value,
          label: `${abilityTypeLabels[abilityKey]} ${value.label}`,
        }
      })

      return acc
    }, {} as Record<`${AbilityTypeKeys}_${keyof typeof newBaseComputedStatsAbilityPropertiesConfig}`, ComputedStatsConfigBaseType>),

  ...Object.entries(newBaseComputedStatsAbilityPropertiesConfig)
    .reduce((acc, [key, value]) => {
      // @ts-ignore
      if (!value.separated) {
        acc[key as FilteredKeys] = value
      }
      return acc
    }, {} as Record<FilteredKeys, ComputedStatsConfigBaseType>),
}

export type ComputedStatKeys = keyof typeof BaseComputedStatsConfig

export type StatConfig = {
  name: string
  label: string
  index: number
  default: number
  flat: boolean
  whole: boolean
  bool: boolean
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
        bool: baseValue.bool ?? false,
        category: baseValue.category ?? StatCategory.NONE,
        label: baseValue.label,
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

