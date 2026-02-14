import { Namespaces } from 'lib/i18n/i18n'
import Resources from 'types/resources'

interface tInput {
  ns: Namespaces
  key: string
  args?: Record<string, string>
}

interface SimpleLabel extends tInput {
  composite?: false
}

export interface StatConfigEntry {
  hit?: boolean
  flat?: boolean
  bool?: boolean
  default?: number
  label: SimpleLabel | string
}

const createI18nKey = <K extends string>(ns: SimpleLabel['ns'], path: string, argName?: string) => (value: K): SimpleLabel =>
  argName
    ? { ns, key: path, args: { [argName]: value } }
    : { ns, key: `${path}.${value}` }

const keyPrefix = 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats'
type Prefixed = Resources['optimizerTab']['ExpandedDataPanel']['BuffsAnalysisDisplay']['Stats']

const commonReadableStat = createI18nKey<keyof Resources['common']['ReadableStats']>('common', 'ReadableStats')
const commonStat = createI18nKey<keyof Resources['common']['Stats']>('common', 'Stats')
const optimizerTabMisc = createI18nKey<keyof Prefixed['Misc']>('optimizerTab', `${keyPrefix}.Misc`)
const optimizerTabDmgTypes = createI18nKey<keyof Prefixed['DmgTypes']>('optimizerTab', `${keyPrefix}.DmgTypes`)
const optimizerTabCompositeSuffix = createI18nKey<keyof Prefixed['CompositeLabels']['Suffix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Suffix`)
const optimizerTabCompositePrefix = createI18nKey<keyof Prefixed['CompositeLabels']['Prefix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Prefix`)
const optimizerTabUnconvertible = createI18nKey<keyof Resources['common']['Stats']>('optimizerTab', `${keyPrefix}.Unconvertible`, 'stat')
const optimizerTabResPen = createI18nKey<keyof Resources['common']['Elements']>('optimizerTab', `${keyPrefix}.ResPen`, 'element')

export const newStatsConfig = {
  // ================ Hit Stats ================

  HP_P: { hit: true, label: commonReadableStat('HP%') },
  ATK_P: { hit: true, label: commonReadableStat('ATK%') },
  DEF_P: { hit: true, label: commonReadableStat('DEF%') },
  SPD_P: { hit: true, label: commonReadableStat('SPD%') },
  HP: { hit: true, flat: true, label: commonReadableStat('HP') },
  ATK: { hit: true, flat: true, label: commonReadableStat('ATK') },
  DEF: { hit: true, flat: true, label: commonReadableStat('DEF') },
  SPD: { hit: true, flat: true, default: 0.0001, label: commonReadableStat('SPD') },
  CR: { hit: true, label: commonReadableStat('CRIT Rate') },
  CD: { hit: true, label: commonReadableStat('CRIT DMG') },
  EHR: { hit: true, label: commonReadableStat('Effect Hit Rate') },
  RES: { hit: true, label: commonReadableStat('Effect RES') },
  BE: { hit: true, label: commonReadableStat('Break Effect') },
  ERR: { hit: true, label: commonReadableStat('Energy Regeneration Rate') },
  OHB: { hit: true, label: commonReadableStat('Outgoing Healing Boost') },

  DMG_BOOST: { hit: true, label: 'DMG Boost' },

  VULNERABILITY: { hit: true, label: optimizerTabCompositeSuffix('Vulnerability') },
  RES_PEN: { hit: true, label: optimizerTabCompositeSuffix('RES PEN') },
  DEF_PEN: { hit: true, label: optimizerTabCompositeSuffix('DEF PEN') },
  BREAK_EFFICIENCY_BOOST: { hit: true, label: optimizerTabCompositeSuffix('Break Efficiency boost') },
  FINAL_DMG_BOOST: { hit: true, label: optimizerTabCompositeSuffix('Final DMG multiplier') },
  TRUE_DMG_MODIFIER: { hit: true, label: optimizerTabCompositeSuffix('True DMG multiplier') },

  // ================ Action Stats ================

  PHYSICAL_DMG_BOOST: { label: 'Physical DMG Boost' },
  FIRE_DMG_BOOST: { label: 'Fire DMG Boost' },
  ICE_DMG_BOOST: { label: 'Ice DMG Boost' },
  LIGHTNING_DMG_BOOST: { label: 'Lightning DMG Boost' },
  WIND_DMG_BOOST: { label: 'Wind DMG Boost' },
  QUANTUM_DMG_BOOST: { label: 'Quantum DMG Boost' },
  IMAGINARY_DMG_BOOST: { label: 'Imaginary DMG Boost' },

  ELATION_DMG_BOOST: { label: 'Elation DMG Boost' },

  // Base
  BASE_HP: { flat: true, label: optimizerTabMisc('Base HP') }, // Remove
  BASE_ATK: { flat: true, label: optimizerTabMisc('Base ATK') }, // Remove
  BASE_DEF: { flat: true, label: optimizerTabMisc('Base DEF') }, // Remove
  BASE_SPD: { flat: true, label: optimizerTabMisc('Base SPD') }, // Remove

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
  DMG_RED: { label: optimizerTabMisc('DMG reduction') }, // Dmg reduction for EHP calcs - defaults to 0 (no reduction), uses MULTIPLICATIVE_COMPLEMENT operator
  EHP: { flat: true, label: optimizerTabMisc('Effective HP') },

  // Misc configs
  SUMMONS: { flat: true, label: optimizerTabMisc('Summons') }, // Remove
  MEMOSPRITE: { bool: true, label: optimizerTabMisc('Memosprite') }, // Remove
  ENEMY_WEAKNESS_BROKEN: { bool: true, label: optimizerTabMisc('Enemy weakness broken') }, // Remove
  MEMO_BUFF_PRIORITY: { bool: true, label: optimizerTabMisc('Prioritize memosprite buffs') }, // Remove
  DEPRIORITIZE_BUFFS: { bool: true, label: optimizerTabMisc('Deprioritize buffs') }, // Remove
  COMBO_DMG: { flat: true, label: optimizerTabMisc('Combo DMG') }, // Remove

  EFFECT_RES_PEN: { label: optimizerTabMisc('Effect RES PEN') },

  ATK_P_BOOST: { label: optimizerTabCompositeSuffix('ATK % boost') },
  CR_BOOST: { label: optimizerTabCompositeSuffix('Crit Rate boost') },
  CD_BOOST: { label: optimizerTabCompositeSuffix('Crit DMG boost') },

  SUPER_BREAK_MODIFIER: { label: optimizerTabCompositeSuffix('Super Break multiplier') },
} satisfies Record<string, StatConfigEntry>

export const STATS_LENGTH = Object.values(newStatsConfig).length
