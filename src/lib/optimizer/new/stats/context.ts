import { VisibleStats } from './stat'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Step } from '../step/step'
// Note: The Step import is used to link documentation.

/**
 * This file contain context helpers.
 *
 * IMPORTANT: A lot of variable name in this class is hardcoded so that they can
 * be deserialized correctly. If you change a variable name, also update it in
 * {@link deserialize}
 */

/**
 * The keyword Element conflicts with browser {@link Element}
 */
export enum HsrElement {
  PHYSICAL,
  LIGHTING,
  FIRE,
  WIND,
  ICE,
  QUANTUM,
  IMAGINARY,
}
export enum Trait {
  NORMAL,
  SKILL,
  ULTIMATE,
  FOLLOW_UP,
  DOT,
  DOT_BLEED,
  DOT_BURN,
  DOT_WIND_SHEAR,
  DOT_SHOCK,
  DELAY,
  DELAY_FREEZE,
  DELAY_ENTANGLEMENT,
}

/**
 * This context is only available after we add all the relic stats.
 */
export type LateContext = { stat: VisibleStats } & InitializationContext
/**
 * Each Matcher class has a companion ```EarlyMatcher``` version, used to
 * strongly enforce type checking between 2 types of available contexts, more or
 * less some sugar to work with Typescript. Note that Typescript does not
 * respect generic (well, in this case, due to the structured typing), so
 * actually both is a single type.
 */
export type EarlyContext = InitializationContext

/**
 * This context is only available after the creation of each {@link Step}
 * metadata.
 */
type InitializationContext = {
  element?: HsrElement
  traits: Trait[]
}

export enum SupportedContextStat {
  ATK,
  DEF,
  HP,
  SPEED,
  BREAK_EFFECT,
  EFFECT_HIT_RATE,
  EFFECT_RES,
  CRIT_RATE,
  CRIT_DMG,
  OUTGOING_HEALING,
  ENERGY_REGENERATION_RATE,
}

export function getContextValue(
  context: Readonly<LateContext>,
  whichStat: SupportedContextStat,
) {
  // Don't ask. I hate it. TODO: make it less suck
  switch (whichStat) {
    case SupportedContextStat.SPEED:
      return context.stat.basic.speed
    case SupportedContextStat.CRIT_RATE:
      return context.stat.crit.critRate
    case SupportedContextStat.CRIT_DMG:
      return context.stat.crit.critDmg
    case SupportedContextStat.EFFECT_HIT_RATE:
      return context.stat.effectHitRate
    case SupportedContextStat.ATK:
      return context.stat.basic.atk
    case SupportedContextStat.HP:
      return context.stat.basic.hp
    case SupportedContextStat.DEF:
      return context.stat.basic.def
    case SupportedContextStat.BREAK_EFFECT:
      return context.stat.breakEffect
    case SupportedContextStat.EFFECT_RES:
      return context.stat.effectRes
    case SupportedContextStat.ENERGY_REGENERATION_RATE:
      return context.stat.energyRegenerationRate
    case SupportedContextStat.OUTGOING_HEALING:
      return context.stat.outgoingHealing

    default:
      throw new Error('Unknown stat: ' + SupportedContextStat[whichStat])
  }
}
