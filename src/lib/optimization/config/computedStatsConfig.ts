import { AbilityType, ADDITIONAL_DMG_TYPE, BASIC_DMG_TYPE, BREAK_DMG_TYPE, DOT_DMG_TYPE, FUA_DMG_TYPE, MEMO_DMG_TYPE, SKILL_DMG_TYPE, SUPER_BREAK_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Namespaces } from 'lib/i18n/i18n'

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
  label: Label
}
interface tInput {
  ns: Namespaces
  key: string// TODO: if I could get proper typing working here (via Resources probably) that would be nice
  args?: Record<string, string>
}
interface SimpleLabel extends tInput {
  composite?: false
}
interface CompositeLabel {
  composite: true
  prefix: tInput
  suffix: tInput
}
type Label = CompositeLabel | SimpleLabel

const keyPrefix = 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats.'
export const newBaseComputedStatsCorePropertiesConfig = {
  // Core stats
  HP_P: { label: { ns: 'common', key: 'ReadableStats.HP%' } },
  ATK_P: { label: { ns: 'common', key: 'ReadableStats.ATK%' } },
  DEF_P: { label: { ns: 'common', key: 'ReadableStats.DEF%' } },
  SPD_P: { label: { ns: 'common', key: 'ReadableStats.SPD%' } },
  HP: { flat: true, label: { ns: 'common', key: 'ReadableStats.HP' } },
  ATK: { flat: true, label: { ns: 'common', key: 'ReadableStats.ATK' } },
  DEF: { flat: true, label: { ns: 'common', key: 'ReadableStats.DEF' } },
  SPD: { flat: true, default: 0.0001, label: { ns: 'common', key: 'ReadableStats.SPD' } },
  CR: { label: { ns: 'common', key: 'ReadableStats.CRIT Rate' } },
  CD: { label: { ns: 'common', key: 'ReadableStats.CRIT DMG' } },
  EHR: { label: { ns: 'common', key: 'ReadableStats.Effect Hit Rate' } },
  RES: { label: { ns: 'common', key: 'ReadableStats.Effect RES' } },
  BE: { label: { ns: 'common', key: 'ReadableStats.Break Effect' } },
  ERR: { label: { ns: 'common', key: 'ReadableStats.Energy Regeneration Rate' } },
  OHB: { label: { ns: 'common', key: 'ReadableStats.Outgoing Healing Boost' } },

  // Elemental stats
  PHYSICAL_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Physical DMG Boost' } },
  FIRE_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Fire DMG Boost' } },
  ICE_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Ice DMG Boost' } },
  LIGHTNING_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Lightning DMG Boost' } },
  WIND_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Wind DMG Boost' } },
  QUANTUM_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Quantum DMG Boost' } },
  IMAGINARY_DMG_BOOST: { label: { ns: 'common', key: 'Stats.Imaginary DMG Boost' } },

  ELEMENTAL_DMG: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Elemental DMG` } },

  // Base
  BASE_HP: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Base HP` } },
  BASE_ATK: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Base ATK` } },
  BASE_DEF: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Base DEF` } },
  BASE_SPD: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Base SPD` } },

  // Memosprites
  MEMO_BASE_HP_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base HP scaling` } },
  MEMO_BASE_DEF_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base DEF scaling` } },
  MEMO_BASE_ATK_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base ATK scaling` } },
  MEMO_BASE_SPD_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base SPD scaling` } },
  MEMO_BASE_HP_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base HP flat` } },
  MEMO_BASE_DEF_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base DEF flat` } },
  MEMO_BASE_ATK_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base ATK flat` } },
  MEMO_BASE_SPD_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite base SPD flat` } },

  // Secondary conversions
  UNCONVERTIBLE_HP_BUFF: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'HP' } } },
  UNCONVERTIBLE_ATK_BUFF: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'ATK' } } },
  UNCONVERTIBLE_DEF_BUFF: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'DEF' } } },
  UNCONVERTIBLE_SPD_BUFF: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'SPD' } } },
  UNCONVERTIBLE_CR_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'CRIT Rate' } } },
  UNCONVERTIBLE_CD_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'CRIT DMG' } } },
  UNCONVERTIBLE_EHR_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'Effect Hit Rate' } } },
  UNCONVERTIBLE_BE_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'Break Effect' } } },
  UNCONVERTIBLE_OHB_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'Outgoing Healing Boost' } } },
  UNCONVERTIBLE_RES_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'Effect RES' } } },
  UNCONVERTIBLE_ERR_BUFF: { label: { ns: 'optimizerTab', key: `${keyPrefix}Unconvertible`, args: { stat: 'Energy Regeneration Rate' } } },

  // EHP
  DMG_RED_MULTI: { default: 1, label: { ns: '', key: 'DMG reduction' } }, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi) instead of additive
  EHP: { flat: true, label: { ns: '', key: 'Effective HP' } },

  // Misc configs
  SUMMONS: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Summons` } },
  MEMOSPRITE: { bool: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Memosprite` } },
  ENEMY_WEAKNESS_BROKEN: { bool: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Enemy weakness broken` } },
  MEMO_BUFF_PRIORITY: { bool: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Prioritize memosprite buffs` } },
  DEPRIORITIZE_BUFFS: { bool: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Deprioritize buffs` } },
  COMBO_DMG: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Combo DMG` } },

  // DOT
  DOT_CHANCE: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Dot base chance` } },
  EFFECT_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Effect RES PEN` } },
  DOT_SPLIT: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Dot DMG split` } }, // Black Swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_STACKS: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Dot stacks` } },

  // Heal / Shield
  HEAL_TYPE: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Heal ability type` } },
  HEAL_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Heal flat` } },
  HEAL_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Heal scaling` } },
  HEAL_VALUE: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Heal value` } },
  SHIELD_FLAT: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Shield flat` } },
  SHIELD_SCALING: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Shield scaling` } },
  SHIELD_VALUE: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Shield value` } },
  SHIELD_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Shield boost` } },
  SKILL_OHB: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Skill Outgoing Healing Boost` } },
  ULT_OHB: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Ult Outgoing Healing Boost` } },

  // Elemental res pen
  PHYSICAL_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Physical' } } },
  FIRE_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Fire' } } },
  ICE_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Ice' } } },
  LIGHTNING_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Lightning' } } },
  WIND_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Wind' } } },
  QUANTUM_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Quantum' } } },
  IMAGINARY_RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}ResPen`, args: { element: 'Imaginary' } } },

  // Misc variables that dont need to be split into abilities yet
  SUPER_BREAK_DEF_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Super Break DEF PEN` } },
  SUPER_BREAK_DMG_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Super Break DMG Boost` } },
  SUPER_BREAK_VULNERABILITY: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Super Break Vulnerability` } },
  ADDITIONAL_DMG_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Additional DMG boost` } },
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Ult Additional DMG CR override` } },
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: { label: { ns: 'optimizerTab', key: `${keyPrefix}Misc.Ult Additional DMG CD override` } },

  // Abilities to damage type mapping
  BASIC_DMG_TYPE: { flat: true, default: BASIC_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Basic` } },
  SKILL_DMG_TYPE: { flat: true, default: SKILL_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Skill` } },
  ULT_DMG_TYPE: { flat: true, default: ULT_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Ult` } },
  FUA_DMG_TYPE: { flat: true, default: FUA_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Fua` } },
  DOT_DMG_TYPE: { flat: true, default: DOT_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Dot` } },
  BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Break` } },
  MEMO_SKILL_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.MemoSkill` } },
  MEMO_TALENT_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.MemoTalent` } },
  ADDITIONAL_DMG_TYPE: { flat: true, default: ADDITIONAL_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.Additional` } },
  SUPER_BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE | SUPER_BREAK_DMG_TYPE, label: { ns: 'optimizerTab', key: `${keyPrefix}DmgTypes.SuperBreak` } },
} as const

export const newBaseComputedStatsAbilityPropertiesConfig = {
  ATK_SCALING: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.ATK scaling` } },
  DEF_SCALING: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.DEF scaling` } },
  HP_SCALING: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.HP scaling` } },
  SPECIAL_SCALING: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Special scaling` } },

  ATK_P_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.ATK % boost` } },
  CR_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Crit Rate boost` } },
  CD_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Crit DMG boost` } },
  DMG_BOOST: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.DMG boost` } }, // When merged this is just ELEMENTAL_DMG

  VULNERABILITY: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Vulnerability` } },
  RES_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.RES PEN` } },
  DEF_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.DEF PEN` } },
  BREAK_DEF_PEN: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Break DEF PEN` } },

  TOUGHNESS_DMG: { flat: true, separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Toughness DMG` } },
  SUPER_BREAK_MODIFIER: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Super Break multiplier` } },
  BREAK_EFFICIENCY_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Break Efficiency boost` } },

  TRUE_DMG_MODIFIER: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.True DMG multiplier` } },
  FINAL_DMG_BOOST: { label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Final DMG multiplier` } },
  BREAK_DMG_MODIFIER: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Break DMG multiplier` } },

  ADDITIONAL_DMG_SCALING: { separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Additional DMG scaling` } },
  ADDITIONAL_DMG: { flat: true, separated: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.Additional DMG` } },

  DMG: { flat: true, label: { ns: 'optimizerTab', key: `${keyPrefix}CompositeLabels.Suffix.DMG` } },
} as const

type AbilityTypeKeys = keyof typeof AbilityType
type FilteredKeys = {
  [K in keyof typeof newBaseComputedStatsAbilityPropertiesConfig]:
  typeof newBaseComputedStatsAbilityPropertiesConfig[K] extends { separated: true } ? never : K
}[keyof typeof newBaseComputedStatsAbilityPropertiesConfig]

const abilityTypeLabels: Record<AbilityTypeKeys, SimpleLabel> = {
  BASIC: { key: `${keyPrefix}CompositeLabels.Prefix.Basic`, ns: 'optimizerTab' },
  SKILL: { key: `${keyPrefix}CompositeLabels.Prefix.Skill`, ns: 'optimizerTab' },
  ULT: { key: `${keyPrefix}CompositeLabels.Prefix.Ult`, ns: 'optimizerTab' },
  FUA: { key: `${keyPrefix}CompositeLabels.Prefix.Fua`, ns: 'optimizerTab' },
  DOT: { key: `${keyPrefix}CompositeLabels.Prefix.Dot`, ns: 'optimizerTab' },
  BREAK: { key: `${keyPrefix}CompositeLabels.Prefix.Break`, ns: 'optimizerTab' },
  MEMO_SKILL: { key: `${keyPrefix}CompositeLabels.Prefix.Memo Skill`, ns: 'optimizerTab' },
  MEMO_TALENT: { key: `${keyPrefix}CompositeLabels.Prefix.Memo Talent`, ns: 'optimizerTab' },
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
          label: {
            composite: true,
            prefix: { key: abilityTypeLabels[abilityKey].key, ns: abilityTypeLabels[abilityKey].ns },
            suffix: { key: value.label.key, ns: value.label.ns },
          },
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
  label: Label
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
