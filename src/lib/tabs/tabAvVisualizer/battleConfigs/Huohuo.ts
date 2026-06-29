import { Stats } from 'lib/constants/constants'
import type { CharacterBattleConfig, InterventionTemplate } from 'lib/tabs/tabAvVisualizer/types'

// General DMG dealt boost (StatKey.BOOST) — Stats object in constants.ts does not include this
// extended key. Used for E6's "all-type" damage buff, which isn't tied to a specific element.
const BOOST = 'BOOST'

const RANGMING_BATTLE_START_DURATION = 2
const RANGMING_BASE_DURATION = 3
const RANGMING_E1_DURATION = 4

// Rangming (禳命) itself carries no stat — it's a marker buff whose only purpose is to gate the talent's
// "any ally action restores energy" passive (see globalListeners below) and, at E1, the team SPD aura.
const RANGMING_STAT = 'Rangming'

export const Huohuo: CharacterBattleConfig = {
  characterId: '1217b1',
  energyType: 'standard',

  // Only the basic attack hits (1 hit); skill/ult are omitted, defaulting to 0.
  hitCounts: { basic: 1 },

  // Battle start: +30 energy and a 2-turn Rangming buff
  onBattleStart: [
    { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
    {
      type: 'stat_buff', targets: 'self', stat: RANGMING_STAT, value: 0, unit: 'flat',
      durationTurns: RANGMING_BATTLE_START_DURATION, effectId: 'huohuo_rangming', tickPhase: 'start',
    },
  ],

  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' },
      { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
      // Talent: Skill grants Rangming for 3 turns (ticks on Huohuo's own turns)
      {
        type: 'stat_buff', targets: 'self', stat: RANGMING_STAT, value: 0, unit: 'flat',
        durationTurns: RANGMING_BASE_DURATION, effectId: 'huohuo_rangming', tickPhase: 'start',
      },
      // Skill requires picking a target (an ally, or Huohuo herself) — no mechanical effect modeled
      // yet (this tool doesn't track healing), but the target choice itself is still required in-game.
      { type: 'energy_gain', targets: 'single_ally_or_self', value: 0, unit: 'flat' },
    ],
    ult: [
      { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat' },
      // Restores 20% of max energy to allies OTHER than Huohuo herself (she gets her own separate +5
      // above); ability-granted energy, not a self-action, so it doesn't scale with the target's ERR
      // (matches in-game behavior)
      { type: 'energy_gain', targets: 'all_allies_except_self', value: 20, unit: 'percent', scalesWithErr: false },
      // 遣神役鬼: team-wide ATK +40% for 2 turns, ticking on each ally's own turn (direct)
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P, value: 40, unit: 'percent',
        durationTurns: 2, effectId: 'huohuo_qianshenyigui',
      },
      // 贞凶之命: only allies whose energy cap is >= 160 also get ATK +24% for 2 turns
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P, value: 24, unit: 'percent',
        durationTurns: 2, effectId: 'huohuo_zhenxiongzhiming',
        condition: { metric: 'maxEnergy', operator: 'gte', value: 160 },
      },
      // Talent: Ultimate also grants Rangming — same effectId as Skill's, so whichever fires last
      // refreshes the same buff instead of stacking a second instance
      {
        type: 'stat_buff', targets: 'self', stat: RANGMING_STAT, value: 0, unit: 'flat',
        durationTurns: RANGMING_BASE_DURATION, effectId: 'huohuo_rangming', tickPhase: 'start',
      },
    ],
  },

  // Special ability 3: while Huohuo holds Rangming, any ally's action restores her 2 energy
  globalListeners: [{
    trigger: 'any_ally_action',
    condition: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'huohuo_rangming'),
    effect: { type: 'energy_gain', targets: 'self', value: 2, unit: 'flat' },
  }],

  eidolonUpgrades: [
    {
      minEidolon: 1,
      patch: (config) => {
        // 岁阳寄体，妖邪依凭: while Rangming is active, all allies get +12% SPD. Modeled as an aura
        // (ticks on Huohuo's own turns, same clock as Rangming) with the same duration as whichever
        // Rangming grant it's bundled with, so the two stay in sync and expire together — granted by
        // every source that grants/refreshes Rangming (battle start, Skill, Ultimate), via the same
        // effectId, so each one correctly refreshes the same buff instead of stacking.
        const makeE1SpdBuff = (durationTurns: number) => ({
          type: 'spd_up' as const, targets: 'all_allies' as const, value: 12, unit: 'percent' as const,
          durationTurns, buffKind: 'aura' as const, effectId: 'huohuo_e1_spd', tickPhase: 'start' as const,
        })
        return {
          ...config,
          onBattleStart: [
            ...(config.onBattleStart ?? []),
            makeE1SpdBuff(RANGMING_BATTLE_START_DURATION),
          ],
          abilities: {
            ...config.abilities,
            // Huohuo's own skill/ult are always plain template arrays (never an AbilityResolver) — safe
            // to assert, since this patch is hand-written specifically against this character's config.
            skill: [
              ...(config.abilities.skill as InterventionTemplate[]).map((t) =>
                'effectId' in t && t.effectId === 'huohuo_rangming' ? { ...t, durationTurns: RANGMING_E1_DURATION } : t
              ),
              makeE1SpdBuff(RANGMING_E1_DURATION),
            ],
            ult: [
              ...(config.abilities.ult as InterventionTemplate[]).map((t) =>
                'effectId' in t && t.effectId === 'huohuo_rangming' ? { ...t, durationTurns: RANGMING_E1_DURATION } : t
              ),
              makeE1SpdBuff(RANGMING_E1_DURATION),
            ],
          },
        }
      },
    },
    {
      minEidolon: 6,
      patch: (config) => ({
        ...config,
        // 同休共戚，相须而行: permanent team-wide +50% DMG boost. durationTurns: Infinity ticks down to
        // Infinity forever (never reaches 0), so this is genuinely permanent, not just a large
        // approximation — granted once at battle start since it has no other natural trigger point.
        onBattleStart: [
          ...(config.onBattleStart ?? []),
          {
            type: 'stat_buff', targets: 'all_allies', stat: BOOST, value: 50, unit: 'percent',
            durationTurns: Infinity, effectId: 'huohuo_e6_dmg',
          },
        ],
      }),
    },
  ],
}
