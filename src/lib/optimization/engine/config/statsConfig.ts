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

  PHYSICAL_DMG_BOOST: { label: 'Physical DMG Boost' },
  FIRE_DMG_BOOST: { label: 'Fire DMG Boost' },
  ICE_DMG_BOOST: { label: 'Ice DMG Boost' },
  LIGHTNING_DMG_BOOST: { label: 'Lightning DMG Boost' },
  WIND_DMG_BOOST: { label: 'Wind DMG Boost' },
  QUANTUM_DMG_BOOST: { label: 'Quantum DMG Boost' },
  IMAGINARY_DMG_BOOST: { label: 'Imaginary DMG Boost' },
  DMG_BOOST: { label: 'DMG Boost' },

  // Base
  BASE_HP: { flat: true, label: optimizerTabMisc('Base HP') },
  BASE_ATK: { flat: true, label: optimizerTabMisc('Base ATK') },
  BASE_DEF: { flat: true, label: optimizerTabMisc('Base DEF') },
  BASE_SPD: { flat: true, label: optimizerTabMisc('Base SPD') },

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
  // MEMO_BUFF_PRIORITY: { bool: true, label: optimizerTabMisc('Prioritize memosprite buffs') },
  // DEPRIORITIZE_BUFFS: { bool: true, label: optimizerTabMisc('Deprioritize buffs') },
  COMBO_DMG: { flat: true, label: optimizerTabMisc('Combo DMG') },

  // // DOT
  // DOT_CHANCE: { label: optimizerTabMisc('Dot base chance') },
  // EFFECT_RES_PEN: { label: optimizerTabMisc('Effect RES PEN') },
  // DOT_SPLIT: { label: optimizerTabMisc('Dot DMG split') }, // Black Swan's stacking DoTs, the initial DoT has full value but subsequent stacks have reduced (DOT_SPLIT) value
  // DOT_STACKS: { flat: true, label: optimizerTabMisc('Dot stacks') },
  //
  // // Heal / Shield
  HEAL_TYPE: { flat: true, label: optimizerTabMisc('Heal ability type') },
  HEAL_FLAT: { flat: true, label: optimizerTabMisc('Heal flat') },
  HEAL_SCALING: { label: optimizerTabMisc('Heal scaling') },
  HEAL_VALUE: { flat: true, label: optimizerTabMisc('Heal value') },
  SHIELD_FLAT: { flat: true, label: optimizerTabMisc('Shield flat') },
  SHIELD_SCALING: { label: optimizerTabMisc('Shield scaling') },
  SHIELD_VALUE: { flat: true, label: optimizerTabMisc('Shield value') },
  SHIELD_BOOST: { label: optimizerTabMisc('Shield boost') },
  //
  ATK_SCALING: { separated: true, label: optimizerTabCompositeSuffix('ATK scaling') },
  DEF_SCALING: { separated: true, label: optimizerTabCompositeSuffix('DEF scaling') },
  HP_SCALING: { separated: true, label: optimizerTabCompositeSuffix('HP scaling') },
  SPECIAL_SCALING: { separated: true, label: optimizerTabCompositeSuffix('Special scaling') },

  ATK_P_BOOST: { label: optimizerTabCompositeSuffix('ATK % boost') },
  CR_BOOST: { label: optimizerTabCompositeSuffix('Crit Rate boost') },
  CD_BOOST: { label: optimizerTabCompositeSuffix('Crit DMG boost') },

  VULNERABILITY: { label: optimizerTabCompositeSuffix('Vulnerability') },
  RES_PEN: { label: optimizerTabCompositeSuffix('RES PEN') },
  DEF_PEN: { label: optimizerTabCompositeSuffix('DEF PEN') },

  // TOUGHNESS_DMG: { flat: true, separated: true, label: optimizerTabCompositeSuffix('Toughness DMG') },
  SUPER_BREAK_MODIFIER: { label: optimizerTabCompositeSuffix('Super Break multiplier') },
  BREAK_EFFICIENCY_BOOST: { label: optimizerTabCompositeSuffix('Break Efficiency boost') },

  FINAL_DMG_BOOST: { label: optimizerTabCompositeSuffix('Final DMG multiplier') },
}

export const STATS_LENGTH = Object.values(newStatsConfig).length
