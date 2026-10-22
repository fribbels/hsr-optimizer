import type { SelectorParam } from 'i18next'
import { type Namespaces } from 'lib/i18n/i18n'
import { OutputTag } from 'lib/optimization/engine/config/tag'
import type Resources from 'types/resources'

interface NamespacedStatLabel<Ns extends Namespaces> {
  ns: Ns
  selector: SelectorParam<Ns>
  args?: Record<string, string>
}

export type StatLabel =
  | NamespacedStatLabel<'common'>
  | NamespacedStatLabel<'optimizerTab'>

export interface StatConfigEntry {
  hit?: boolean
  flat?: boolean
  bool?: boolean
  default?: number
  label: StatLabel
}

const createI18nKey = <Ns extends Namespaces, K extends string>(
  ns: Ns,
  selector: (value: K) => SelectorParam<Ns>,
  argName?: string,
) =>
(value: K): NamespacedStatLabel<Ns> =>
  argName
    ? { ns, selector: selector(value), args: { [argName]: value } }
    : { ns, selector: selector(value) }

type Prefixed = Resources['optimizerTab']['ExpandedDataPanel']['BuffsAnalysisDisplay']['Stats']

const commonReadableStat = createI18nKey(
  'common',
  (value: keyof Resources['common']['ReadableStats']) =>
    ($: Parameters<SelectorParam<'common'>>[0]): string => $.ReadableStats[value],
)
const optimizerTabMisc = createI18nKey(
  'optimizerTab',
  (value: keyof Prefixed['Misc']) =>
    ($: Parameters<SelectorParam<'optimizerTab'>>[0]): string => $.ExpandedDataPanel.BuffsAnalysisDisplay.Stats.Misc[value],
)
const optimizerTabCompositeSuffix = createI18nKey(
  'optimizerTab',
  (value: keyof Prefixed['CompositeLabels']['Suffix']) =>
    ($: Parameters<SelectorParam<'optimizerTab'>>[0]): string => $.ExpandedDataPanel.BuffsAnalysisDisplay.Stats.CompositeLabels.Suffix[value],
)
const optimizerTabUnconvertible = createI18nKey(
  'optimizerTab',
  (_value: keyof Resources['common']['Stats']) =>
    ($: Parameters<SelectorParam<'optimizerTab'>>[0]): string => $.ExpandedDataPanel.BuffsAnalysisDisplay.Stats.Unconvertible,
  'stat',
)
const optimizerTabDmgBoost = createI18nKey(
  'optimizerTab',
  (_value: keyof Resources['gameData']['Elements']) =>
    ($: Parameters<SelectorParam<'optimizerTab'>>[0]): string => $.ExpandedDataPanel.BuffsAnalysisDisplay.Stats.ElementalDmgBoost,
  'element',
)

export function getBoostLabel(outputTags?: OutputTag): StatLabel {
  if (outputTags === OutputTag.SHIELD) return optimizerTabMisc('Shield boost')
  if (outputTags === OutputTag.HEAL) return commonReadableStat('Outgoing Healing Boost')
  return optimizerTabCompositeSuffix('DMG Boost')
}

export const newStatsConfig = {
  // ================ Hit Stats ================

  HP_P: { label: commonReadableStat('HP%') },
  ATK_P: { label: commonReadableStat('ATK%') },
  DEF_P: { label: commonReadableStat('DEF%') },
  SPD_P: { label: commonReadableStat('SPD%') },
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

  BOOST: { hit: true, label: optimizerTabCompositeSuffix('DMG Boost') },

  VULNERABILITY: { hit: true, label: optimizerTabCompositeSuffix('Vulnerability') },
  RES_PEN: { hit: true, label: optimizerTabCompositeSuffix('RES PEN') },
  DEF_PEN: { hit: true, label: optimizerTabCompositeSuffix('DEF PEN') },
  BREAK_EFFICIENCY_BOOST: { hit: true, label: optimizerTabCompositeSuffix('Break Efficiency boost') },
  FINAL_DMG_BOOST: { hit: true, label: optimizerTabCompositeSuffix('Final DMG multiplier') },
  TRUE_DMG_MODIFIER: { hit: true, label: optimizerTabCompositeSuffix('True DMG multiplier') },

  // ================ Action Stats ================

  PHYSICAL_DMG_BOOST: { label: optimizerTabDmgBoost('Physical') },
  FIRE_DMG_BOOST: { label: optimizerTabDmgBoost('Fire') },
  ICE_DMG_BOOST: { label: optimizerTabDmgBoost('Ice') },
  LIGHTNING_DMG_BOOST: { label: optimizerTabDmgBoost('Thunder') },
  WIND_DMG_BOOST: { label: optimizerTabDmgBoost('Wind') },
  QUANTUM_DMG_BOOST: { label: optimizerTabDmgBoost('Quantum') },
  IMAGINARY_DMG_BOOST: { label: optimizerTabDmgBoost('Imaginary') },

  ELATION: { label: optimizerTabMisc('Elation') },
  MERRYMAKING: { label: optimizerTabMisc('Merrymaking') },

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
  UNCONVERTIBLE_ELATION_BUFF: { label: optimizerTabUnconvertible('Elation') },

  // EHP
  DMG_RED: { label: optimizerTabMisc('DMG reduction') }, // Dmg reduction for EHP calcs - defaults to 0 (no reduction), uses MULTIPLICATIVE_COMPLEMENT operator
  EHP: { flat: true, label: optimizerTabMisc('Effective HP') },

  EFFECT_RES_PEN: { label: optimizerTabMisc('Effect RES PEN') },

  CR_BOOST: { label: optimizerTabCompositeSuffix('Crit Rate boost') },
  CD_BOOST: { label: optimizerTabCompositeSuffix('Crit DMG boost') },

  SUPER_BREAK_MODIFIER: { label: optimizerTabCompositeSuffix('Super Break multiplier') },
} satisfies Record<string, StatConfigEntry>

export const STATS_LENGTH = Object.values(newStatsConfig).length
