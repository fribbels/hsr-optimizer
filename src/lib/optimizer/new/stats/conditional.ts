/* eslint-disable @typescript-eslint/no-unused-vars */
import { getContextValue, LateContext, SupportedContextStat as FromStat } from './context'
import { EarlyMatcher, Matcher } from './matcher'
import { PartialModifiableStats } from './stat'

/**
 * These stats can have different contextual requirement, for example, Topaz DMG
 * Boost is only applicable if the attack is a follow up.
 *
 * {@link ConditionalStats} that this class models after has diffent type of
 * conditions. In the previous example, Topaz DMG Boost requires the attack
 * having the {@link Trait.FOLLOW_UP FOLLOW_UP} trait. Others, like 2 pc
 * {@link https://honkai-star-rail.fandom.com/wiki/Inert_Salsotto Inert Salsotto}
 * depends on others stat (in this case Crit Rate).
 *
 * To work with those weird quirks, we need to have different points in
 * (relative) time where these stats can be applied. For now, it is safe to have
 * 3 different point in time where stats (external or internal) can be applied.
 * - Stats that can be applied unconditionally, like traces, most buffs,...
 * - Stats that requires the confirmation of {@link HsrElement Element} and
 *   {@link Trait}.
 * - Stats that requires some other "visible" stats.
 *
 * We can apply the 1st and 2nd type in any particular order.
 *
 * The 3rd type need to be applied at the very end, no matter what. This
 * actually leads to a pretty funny circular dependency if Hoyoverse doesn't
 * manage it well. For example, we can have a stat that increase your ATK at
 * required SPD, another one increase your DMG at required ATK. Say that the
 * first one nicely enable the character to hit the 2nd one. That would be an
 * headache to deal with no matter what we do. This is similar to how some LaTeX
 * components require multiple runs to render. Not to say it's unsolvable, but
 * would be pretty dogshit.
 */
// This type is mainly used for documentation
type ConditionalStat = {
  matcher: Matcher
}
export class EarlyConditional implements ConditionalStat {
  constructor(
    public readonly matcher: EarlyMatcher,
    public readonly statz: PartialModifiableStats,
  ) {}
}

export class LateConditional implements ConditionalStat {
  constructor(
    public readonly matcher: Matcher,
    public readonly provider: StatSupplier,
  ) {}
}

export type StatSupplier = {
  stat(ctx: LateContext): PartialModifiableStats
}

export class FixedStat implements StatSupplier {
  constructor(private statz: PartialModifiableStats) {}

  public stat(_ctx: LateContext): PartialModifiableStats {
    return this.statz
  }
}

export enum ToStat {
  ATK_PERCENTAGE,
  DEF_PERCENTAGE,
  HP_PERCENTAGE,
  SPEED_PERCENTAGE,
  ATK_FLAT,
  DEF_FLAT,
  HP_FLAT,
  SPEED_FLAT,
  BREAK_EFFECT,
  EFFECT_HIT_RATE,
  EFFECT_RES,
  CRIT_RATE,
  CRIT_DMG,
  OUTGOING_HEALING,
  ENERGY_REGENERATION_RATE,
  DMG_BONUS,
}

export class TransformingStat {
  constructor(
    private from: FromStat,
    private to: ToStat,
    private scale: number,
    private max: number,
  ) {}

  public stat(context: LateContext): PartialModifiableStats {
    const from = getContextValue(context, this.from)
    const val = Math.min(this.max, this.scale * from)
    // Yes, I hate it. TODO: make it less suck.
    /** It is actually fairly performant, since there is only 2 dynamic
     * conditional currently in the game,
     * {@link https://honkai-star-rail.fandom.com/wiki/Pan-Cosmic_Commercial_Enterprise}
     * and {@link https://honkai-star-rail.fandom.com/wiki/Candleflame%27s_Portent}
     */
    switch (this.to) {
      case ToStat.DMG_BONUS:
        return { dmgBoost: val }
      case ToStat.ATK_PERCENTAGE:
        return { basic: { percent: { atk: val } } }
      case ToStat.ATK_FLAT:
        return { basic: { flat: { atk: val } } }
      case ToStat.DEF_FLAT:
        return { basic: { flat: { def: val } } }
      case ToStat.HP_FLAT:
        return { basic: { flat: { hp: val } } }
      case ToStat.SPEED_FLAT:
        return { basic: { flat: { speed: val } } }
      case ToStat.DEF_PERCENTAGE:
        return { basic: { percent: { def: val } } }
      case ToStat.HP_PERCENTAGE:
        return { basic: { percent: { hp: val } } }
      case ToStat.SPEED_PERCENTAGE:
        return { basic: { percent: { speed: val } } }
      case ToStat.CRIT_RATE:
        return { crit: { critRate: val } }
      case ToStat.CRIT_DMG:
        return { crit: { critDmg: val } }
      case ToStat.BREAK_EFFECT:
        return { breakEffect: val }
      case ToStat.EFFECT_HIT_RATE:
        return { effectHitRate: val }
      case ToStat.EFFECT_RES:
        return { effectRes: val }
      case ToStat.ENERGY_REGENERATION_RATE:
        return { energyRegenerationRate: val }
      case ToStat.OUTGOING_HEALING:
        return { energyRegenerationRate: val }
      // This is likely ABI incompatibility, well, just say no way it will happen.
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        throw new Error('Unknown transform stat:' + this.to)
    }
  }
}
