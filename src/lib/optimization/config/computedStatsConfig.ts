import { AbilityType, ADDITIONAL_DMG_TYPE, BASIC_DMG_TYPE, BREAK_DMG_TYPE, DOT_DMG_TYPE, FUA_DMG_TYPE, MEMO_DMG_TYPE, SKILL_DMG_TYPE, SUPER_BREAK_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Namespaces } from 'lib/i18n/i18n'
import Resources from 'types/resources'

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
  key: string
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

const keyPrefix = 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats'
type Prefixed = Resources['optimizerTab']['ExpandedDataPanel']['BuffsAnalysisDisplay']['Stats']

const createI18nKey = <K extends string>(ns: SimpleLabel['ns'], path: string, argName?: string) =>
  (value: K): SimpleLabel => argName
    ? { ns, key: path, args: { [argName]: value } }
    : { ns, key: `${path}.${value}` }

const commonReadableStat = createI18nKey<keyof Resources['common']['ReadableStats']>('common', 'ReadableStats')
const commonStat = createI18nKey<keyof Resources['common']['Stats']>('common', 'Stats')
const optimizerTabMisc = createI18nKey<keyof Prefixed['Misc']>('optimizerTab', `${keyPrefix}.Misc`)
const optimizerTabDmgTypes = createI18nKey<keyof Prefixed['DmgTypes']>('optimizerTab', `${keyPrefix}.DmgTypes`)
const optimizerTabCompositeSuffix = createI18nKey<keyof Prefixed['CompositeLabels']['Suffix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Suffix`)
const optimizerTabCompositePrefix = createI18nKey<keyof Prefixed['CompositeLabels']['Prefix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Prefix`)
const optimizerTabUnconvertible = createI18nKey<keyof Resources['common']['Stats']>('optimizerTab', `${keyPrefix}.Unconvertible`, 'stat')
const optimizerTabResPen = createI18nKey<keyof Resources['common']['Elements']>('optimizerTab', `${keyPrefix}.ResPen`, 'element')

export const newBaseComputedStatsCorePropertiesConfig = {
  // Core stats
  HP_P: { label: commonReadableStat('HP%') },
  ATK_P: { label: commonReadableStat('ATK%') },
  DEF_P: { label: commonReadableStat('DEF%') },
  SPD_P: { label: commonReadableStat('SPD%') },
  HP: { flat: true, label: commonReadableStat('HP') },
  ATK: { flat: true, label: commonReadableStat('ATK') },
  DEF: { flat: true, label: commonReadableStat('DEF') },
  SPD: { flat: true, default: 0.0001, label: commonReadableStat('SPD') },
  CR: { label: commonReadableStat('CRIT Rate') },
  CD: { label: commonReadableStat('CRIT DMG') },
  EHR: { label: commonReadableStat('Effect Hit Rate') },
  RES: { label: commonReadableStat('Effect RES') },
  BE: { label: commonReadableStat('Break Effect') },
  ERR: { label: commonReadableStat('Energy Regeneration Rate') },
  OHB: { label: commonReadableStat('Outgoing Healing Boost') },

  // Elemental stats
  PHYSICAL_DMG_BOOST: { label: commonStat('Physical DMG Boost') },
  FIRE_DMG_BOOST: { label: commonStat('Fire DMG Boost') },
  ICE_DMG_BOOST: { label: commonStat('Ice DMG Boost') },
  LIGHTNING_DMG_BOOST: { label: commonStat('Lightning DMG Boost') },
  WIND_DMG_BOOST: { label: commonStat('Wind DMG Boost') },
  QUANTUM_DMG_BOOST: { label: commonStat('Quantum DMG Boost') },
  IMAGINARY_DMG_BOOST: { label: commonStat('Imaginary DMG Boost') },

  ELEMENTAL_DMG: { label: optimizerTabMisc('Elemental DMG') },

  // Base
  BASE_HP: { flat: true, label: optimizerTabMisc('Base HP') },
  BASE_ATK: { flat: true, label: optimizerTabMisc('Base ATK') },
  BASE_DEF: { flat: true, label: optimizerTabMisc('Base DEF') },
  BASE_SPD: { flat: true, label: optimizerTabMisc('Base SPD') },

  // Memosprites
  MEMO_BASE_HP_SCALING: { label: optimizerTabMisc('Memosprite base HP scaling') },
  MEMO_BASE_DEF_SCALING: { label: optimizerTabMisc('Memosprite base DEF scaling') },
  MEMO_BASE_ATK_SCALING: { label: optimizerTabMisc('Memosprite base ATK scaling') },
  MEMO_BASE_SPD_SCALING: { label: optimizerTabMisc('Memosprite base SPD scaling') },
  MEMO_BASE_HP_FLAT: { flat: true, label: optimizerTabMisc('Memosprite base HP flat') },
  MEMO_BASE_DEF_FLAT: { flat: true, label: optimizerTabMisc('Memosprite base DEF flat') },
  MEMO_BASE_ATK_FLAT: { flat: true, label: optimizerTabMisc('Memosprite base ATK flat') },
  MEMO_BASE_SPD_FLAT: { flat: true, label: optimizerTabMisc('Memosprite base SPD flat') },

  // Secondary conversions
  UNCONVERTIBLE_HP_BUFF: { flat: true, label: optimizerTabUnconvertible('HP') },
  UNCONVERTIBLE_ATK_BUFF: { flat: true, label: optimizerTabUnconvertible('ATK') },
  UNCONVERTIBLE_DEF_BUFF: { flat: true, label: optimizerTabUnconvertible('DEF') },
  UNCONVERTIBLE_SPD_BUFF: { flat: true, label: optimizerTabUnconvertible('SPD') },
  UNCONVERTIBLE_CR_BUFF: { label: optimizerTabUnconvertible('CRIT Rate') },
  UNCONVERTIBLE_CD_BUFF: { label: optimizerTabUnconvertible('CRIT DMG') },
  UNCONVERTIBLE_EHR_BUFF: { label: optimizerTabUnconvertible('Effect Hit Rate') },
  UNCONVERTIBLE_BE_BUFF: { label: optimizerTabUnconvertible('Break Effect') },
  UNCONVERTIBLE_OHB_BUFF: { label: optimizerTabUnconvertible('Outgoing Healing Boost') },
  UNCONVERTIBLE_RES_BUFF: { label: optimizerTabUnconvertible('Effect RES') },
  UNCONVERTIBLE_ERR_BUFF: { label: optimizerTabUnconvertible('Energy Regeneration Rate') },

  // EHP
  DMG_RED_MULTI: { default: 1, label: optimizerTabMisc('DMG reduction') }, // Dmg reduction multiplier for EHP calcs - this should be multiplied by (1 - multi) instead of additive
  EHP: { flat: true, label: optimizerTabMisc('Effective HP') },

  // Misc configs
  SUMMONS: { flat: true, label: optimizerTabMisc('Summons') },
  MEMOSPRITE: { bool: true, label: optimizerTabMisc('Memosprite') },
  ENEMY_WEAKNESS_BROKEN: { bool: true, label: optimizerTabMisc('Enemy weakness broken') },
  MEMO_BUFF_PRIORITY: { bool: true, label: optimizerTabMisc('Prioritize memosprite buffs') },
  DEPRIORITIZE_BUFFS: { bool: true, label: optimizerTabMisc('Deprioritize buffs') },
  COMBO_DMG: { flat: true, label: optimizerTabMisc('Combo DMG') },

  // DOT
  DOT_CHANCE: { label: optimizerTabMisc('Dot base chance') },
  EFFECT_RES_PEN: { label: optimizerTabMisc('Effect RES PEN') },
  DOT_SPLIT: { label: optimizerTabMisc('Dot DMG split') }, // Black Swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  DOT_STACKS: { flat: true, label: optimizerTabMisc('Dot stacks') },

  // Heal / Shield
  HEAL_TYPE: { flat: true, label: optimizerTabMisc('Heal ability type') },
  HEAL_FLAT: { flat: true, label: optimizerTabMisc('Heal flat') },
  HEAL_SCALING: { label: optimizerTabMisc('Heal scaling') },
  HEAL_VALUE: { flat: true, label: optimizerTabMisc('Heal value') },
  SHIELD_FLAT: { flat: true, label: optimizerTabMisc('Shield flat') },
  SHIELD_SCALING: { label: optimizerTabMisc('Shield scaling') },
  SHIELD_VALUE: { flat: true, label: optimizerTabMisc('Shield value') },
  SHIELD_BOOST: { label: optimizerTabMisc('Shield boost') },
  SKILL_OHB: { label: optimizerTabMisc('Skill Outgoing Healing Boost') },
  ULT_OHB: { label: optimizerTabMisc('Ult Outgoing Healing Boost') },

  // Elemental res pen
  PHYSICAL_RES_PEN: { label: optimizerTabResPen('Physical') },
  FIRE_RES_PEN: { label: optimizerTabResPen('Fire') },
  ICE_RES_PEN: { label: optimizerTabResPen('Ice') },
  LIGHTNING_RES_PEN: { label: optimizerTabResPen('Lightning') },
  WIND_RES_PEN: { label: optimizerTabResPen('Wind') },
  QUANTUM_RES_PEN: { label: optimizerTabResPen('Quantum') },
  IMAGINARY_RES_PEN: { label: optimizerTabResPen('Imaginary') },

  // Misc variables that don't need to be split into abilities yet
  SUPER_BREAK_DEF_PEN: { label: optimizerTabMisc('Super Break DEF PEN') },
  SUPER_BREAK_DMG_BOOST: { label: optimizerTabMisc('Super Break DMG Boost') },
  SUPER_BREAK_VULNERABILITY: { label: optimizerTabMisc('Super Break Vulnerability') },
  ADDITIONAL_DMG_BOOST: { label: optimizerTabMisc('Additional DMG boost') },
  ULT_ADDITIONAL_DMG_CR_OVERRIDE: { label: optimizerTabMisc('Ult Additional DMG CR override') },
  ULT_ADDITIONAL_DMG_CD_OVERRIDE: { label: optimizerTabMisc('Ult Additional DMG CD override') },

  // Abilities to damage type mapping
  BASIC_DMG_TYPE: { flat: true, default: BASIC_DMG_TYPE, label: optimizerTabDmgTypes('Basic') },
  SKILL_DMG_TYPE: { flat: true, default: SKILL_DMG_TYPE, label: optimizerTabDmgTypes('Skill') },
  ULT_DMG_TYPE: { flat: true, default: ULT_DMG_TYPE, label: optimizerTabDmgTypes('Ult') },
  FUA_DMG_TYPE: { flat: true, default: FUA_DMG_TYPE, label: optimizerTabDmgTypes('Fua') },
  DOT_DMG_TYPE: { flat: true, default: DOT_DMG_TYPE, label: optimizerTabDmgTypes('Dot') },
  BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE, label: optimizerTabDmgTypes('Break') },
  MEMO_SKILL_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: optimizerTabDmgTypes('MemoSkill') },
  MEMO_TALENT_DMG_TYPE: { flat: true, default: MEMO_DMG_TYPE, label: optimizerTabDmgTypes('MemoTalent') },
  ADDITIONAL_DMG_TYPE: { flat: true, default: ADDITIONAL_DMG_TYPE, label: optimizerTabDmgTypes('Additional') },
  SUPER_BREAK_DMG_TYPE: { flat: true, default: BREAK_DMG_TYPE | SUPER_BREAK_DMG_TYPE, label: optimizerTabDmgTypes('SuperBreak') },
} as const

export const newBaseComputedStatsAbilityPropertiesConfig = {
  ATK_SCALING: { separated: true, label: optimizerTabCompositeSuffix('ATK scaling') },
  DEF_SCALING: { separated: true, label: optimizerTabCompositeSuffix('DEF scaling') },
  HP_SCALING: { separated: true, label: optimizerTabCompositeSuffix('HP scaling') },
  SPECIAL_SCALING: { separated: true, label: optimizerTabCompositeSuffix('Special scaling') },

  ATK_P_BOOST: { label: optimizerTabCompositeSuffix('ATK % boost') },
  CR_BOOST: { label: optimizerTabCompositeSuffix('Crit Rate boost') },
  CD_BOOST: { label: optimizerTabCompositeSuffix('Crit DMG boost') },
  DMG_BOOST: { separated: true, label: optimizerTabCompositeSuffix('DMG boost') }, // When merged this is just ELEMENTAL_DMG

  VULNERABILITY: { label: optimizerTabCompositeSuffix('Vulnerability') },
  RES_PEN: { label: optimizerTabCompositeSuffix('RES PEN') },
  DEF_PEN: { label: optimizerTabCompositeSuffix('DEF PEN') },
  BREAK_DEF_PEN: { label: optimizerTabCompositeSuffix('Break DEF PEN') },

  TOUGHNESS_DMG: { flat: true, separated: true, label: optimizerTabCompositeSuffix('Toughness DMG') },
  SUPER_BREAK_MODIFIER: { label: optimizerTabCompositeSuffix('Super Break multiplier') },
  BREAK_EFFICIENCY_BOOST: { label: optimizerTabCompositeSuffix('Break Efficiency boost') },

  TRUE_DMG_MODIFIER: { label: optimizerTabCompositeSuffix('True DMG multiplier') },
  FINAL_DMG_BOOST: { label: optimizerTabCompositeSuffix('Final DMG multiplier') },
  BREAK_DMG_MODIFIER: { separated: true, label: optimizerTabCompositeSuffix('Break DMG multiplier') },

  ADDITIONAL_DMG_SCALING: { separated: true, label: optimizerTabCompositeSuffix('Additional DMG scaling') },
  ADDITIONAL_DMG: { flat: true, separated: true, label: optimizerTabCompositeSuffix('Additional DMG') },

  DMG: { flat: true, label: optimizerTabCompositeSuffix('DMG') },
} as const

type AbilityTypeKeys = keyof typeof AbilityType
type FilteredKeys = {
  [K in keyof typeof newBaseComputedStatsAbilityPropertiesConfig]:
  typeof newBaseComputedStatsAbilityPropertiesConfig[K] extends { separated: true } ? never : K
}[keyof typeof newBaseComputedStatsAbilityPropertiesConfig]

const abilityTypeLabels: Record<AbilityTypeKeys, SimpleLabel> = {
  BASIC: optimizerTabCompositePrefix('Basic'),
  SKILL: optimizerTabCompositePrefix('Skill'),
  ULT: optimizerTabCompositePrefix('Ult'),
  FUA: optimizerTabCompositePrefix('Fua'),
  DOT: optimizerTabCompositePrefix('Dot'),
  BREAK: optimizerTabCompositePrefix('Break'),
  MEMO_SKILL: optimizerTabCompositePrefix('Memo Skill'),
  MEMO_TALENT: optimizerTabCompositePrefix('Memo Talent'),
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
