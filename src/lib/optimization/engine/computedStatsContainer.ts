import {
  ADDITIONAL_DMG_TYPE,
  BASIC_DMG_TYPE,
  BREAK_DMG_TYPE,
  DamageType,
  DOT_DMG_TYPE,
  FUA_DMG_TYPE,
  MEMO_DMG_TYPE,
  SKILL_DMG_TYPE,
  SUPER_BREAK_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Namespaces } from 'lib/i18n/i18n'
import { KeysType } from 'lib/optimization/computedStatsArray'
import {
  BaseComputedStatsConfig,
  baseComputedStatsObject,
  ComputedStatsConfigBaseType,
  ComputedStatsConfigType,
  ComputedStatsObject,
} from 'lib/optimization/config/computedStatsConfig'
import { getTeammateMetadata } from 'lib/optimization/context/calculateActions'
import { OptimizerContext } from 'types/optimizer'
import Resources from 'types/resources'

const keyPrefix = 'ExpandedDataPanel.BuffsAnalysisDisplay.Stats'
type Prefixed = Resources['optimizerTab']['ExpandedDataPanel']['BuffsAnalysisDisplay']['Stats']

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

const commonReadableStat = createI18nKey<keyof Resources['common']['ReadableStats']>('common', 'ReadableStats')
const commonStat = createI18nKey<keyof Resources['common']['Stats']>('common', 'Stats')
const optimizerTabMisc = createI18nKey<keyof Prefixed['Misc']>('optimizerTab', `${keyPrefix}.Misc`)
const optimizerTabDmgTypes = createI18nKey<keyof Prefixed['DmgTypes']>('optimizerTab', `${keyPrefix}.DmgTypes`)
const optimizerTabCompositeSuffix = createI18nKey<keyof Prefixed['CompositeLabels']['Suffix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Suffix`)
const optimizerTabCompositePrefix = createI18nKey<keyof Prefixed['CompositeLabels']['Prefix']>('optimizerTab', `${keyPrefix}.CompositeLabels.Prefix`)
const optimizerTabUnconvertible = createI18nKey<keyof Resources['common']['Stats']>('optimizerTab', `${keyPrefix}.Unconvertible`, 'stat')
const optimizerTabResPen = createI18nKey<keyof Resources['common']['Elements']>('optimizerTab', `${keyPrefix}.ResPen`, 'element')

export const globalStatsConfig = {}

export const hitStatsConfig = {
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
} as const

enum StatCategory {
  CD,
  NONE,
}

export const FullStatsConfig: ComputedStatsConfigType = Object.fromEntries(
  Object.entries(hitStatsConfig).map(([key, value], index) => {
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

/**
 * Each combo is an array of actions
 * Each action is an array of hits
 * Each hit can have multiple damage types
 * Each hit has its own damage function
 *
 * Stats are calculated once per action
 * Damage is calculated once per hit
 *
 * Each individual damage type has its own container of stats. e.g. SKILL VULNERABILITY, ULT DEF PEN, etc
 *
 * Rutilant Arena set buffs SKILL | BASIC
 * What if we're calculating a SKILL | ULT hit?
 * Store every possible damage type from a character
 */
export class ComputedStatsContainer {
  public damageTypes: number[] = []
  public statsByDamageType: Record<number, Float32Array> = {}
  public entitiesByName: Record<string, OptimizerEntity> = {}

  constructor(public context: OptimizerContext) {
    // ===== Hits =====

    const hitActions = context.hitActions ?? []
    const activeDamageTypes = new Set<number>()

    for (const hitAction of hitActions) {
      for (const hit of hitAction.hits) {
        activeDamageTypes.add(hit.damageType)
      }
    }

    const len = Object.keys(FullStatsConfig).length

    this.damageTypes = [...activeDamageTypes]
    for (const damageType of activeDamageTypes) {
      this.statsByDamageType[damageType] = new Float32Array(len)
    }

    // ===== Entities =====

    for (const entity of context.entities!) {
      this.entitiesByName[entity.name] = entity
    }
  }

  public buff(key: number, damageType: number, value: number, source: BufferSource) {
    for (const type of this.damageTypes) {
      if (damageType & type) {
        this.statsByDamageType[type][key] += value
      }
    }
  }
}

export interface OptimizerEntity {
  name: string
  primary: boolean
  summon: boolean
  memosprite: boolean
}

export type StatKeyType = keyof typeof FullStatsConfig

export const StatKey: Record<StatKeyType, number> = Object.keys(FullStatsConfig).reduce(
  (acc, key, index) => {
    acc[key as StatKeyType] = index
    return acc
  },
  {} as Record<StatKeyType, number>,
)
