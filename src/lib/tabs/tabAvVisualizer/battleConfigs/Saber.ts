import { Stats } from 'lib/constants/constants'
import type {
  AbilityResolution,
  CharacterBattleConfig,
  GlobalListener,
  InterventionTemplate,
} from 'lib/tabs/tabAvVisualizer/types'

// Real game_data.json id (collab character) — has max_sp: 360, matching her ult threshold below.
const SABER_ID = '1014'

// General DMG dealt boost — not a real Stats enum member, see avVisualizerTab.yaml's
// EffectStatNames.BOOST (same convention as Huohuo's E6).
const BOOST = 'BOOST'
const WIND_RES_PEN = 'WIND_RES_PEN'

// 炉心共鸣 (Reactor Core): the resource currency itself — a pure marker/counter buff, no real stat.
// No official localized buff name (it's the gameplay resource, not a named buff like the others below).
const REACTOR_CORE_STAT = 'REACTOR_CORE'
const REACTOR_CORE_ID = 'saber_reactor_core'

// 星之冠冕_暴击伤害 (Crown of the Stars, bonus ability): +4% CD per Reactor Core ever gained, permanent,
// capped at 8 stacks — never consumed, unlike Reactor Core itself.
const CROWN_CD_ID = 'saber_crown_of_stars_cd'

// 星之冠冕 (Crown of the Stars): the temporary +50% CD buff granted by Skill itself — same official name
// as the bonus ability above but a different effect/buff, so a distinct effectId.
const CROWN_OF_STARS_ID = 'saber_crown_of_stars'

const KING_OF_KNIGHTS_ID = 'saber_king_of_knights'     // 骑士王的登场
const KNIGHT_OF_DRAGON_ID = 'saber_knight_of_dragon'   // 龙之骑士
const DRAGON_REACTOR_CORE_ID = 'saber_dragon_reactor_core' // 龙之炉心 (talent's dmg buff)

// 魔力放出 (Mana Burst): pure marker, capped at 1 stack.
const MANA_BURST_STAT = 'MANA_BURST'
const MANA_BURST_ID = 'saber_mana_burst'

// Internal marker granted by Ult: gates the next Basic into its enhanced variant (basicVariants below).
// No official name — purely an engine-side bookkeeping buff, never shown as a named effect in-game.
const ENHANCED_BASIC_STAT = 'ENHANCED_BASIC_MARKER'
const ENHANCED_BASIC_MARKER_ID = 'saber_enhanced_basic_marker'

const E1_ULT_BOOST_ID = 'saber_e1_lost_white_walls'        // 失落的白垩坚城
const E2_DEF_PEN_ID = 'saber_e2_round_table'                // 尘封的圆桌誓言
const E4_RES_PEN_ID = 'saber_e4_sixteen_winters'            // 十六个冬日的奇遇
const E6_RES_PEN_ID = 'saber_e6_long_fated_night'           // 守护命运长夜 (permanent RES PEN)
const E6_ENERGY_STAT = 'E6_ENERGY_MARKER'
const E6_ENERGY_MARKER_ID = 'saber_e6_long_fated_night_energy' // 守护命运长夜 (energy-trigger marker)

// Granted by Gilgamesh's own extraAttack (see Gilgamesh.ts) when his/Saber's combined hit count reaches
// 8 — doubles her Ult's DMG, consumed by her own Ult cast. Cross-referenced by this exact effectId string
// since the grant and the consumption live in two different characters' configs.
const GILGAMESH_ULT_DOUBLE_ID = 'gilgamesh_permission_to_strike_ult_double'

// "Full energy" for the skill's refill check is the Ultimate threshold (360) — not the 480/560 cap that
// includes overflow. Always 360 regardless of eidolon.
const FULL_ENERGY_THRESHOLD = 360

// Builds the complete config at a given eidolon tier — used both as the base (tier 0) export and as
// every eidolonUpgrades patch's return value (each patch just rebuilds at its own tier instead of
// incrementally appending to the previous one, see the bottom of this file for why). Reactor Core is
// granted from several different places (talent listener, skill's branch, E1's bonus) and every single
// grant needs to also hand out a matching Crown of the Stars CD layer (and, from E2 on, a DEF PEN layer)
// — grantReactorCore bundles all of that in one place instead of repeating it at each call site.
function buildSaberConfig(eidolon: number): CharacterBattleConfig {
  const hasE1 = eidolon >= 1
  const hasE2 = eidolon >= 2
  const hasE4 = eidolon >= 4
  const hasE6 = eidolon >= 6

  function grantReactorCore(n: number): InterventionTemplate[] {
    const out: InterventionTemplate[] = []
    for (let i = 0; i < n; i++) {
      out.push({
        type: 'stat_buff', targets: 'self', stat: REACTOR_CORE_STAT, value: 0, unit: 'flat',
        durationTurns: 0, effectId: REACTOR_CORE_ID, stackable: { maxStacks: 99 },
      })
      out.push({
        type: 'stat_buff', targets: 'self', stat: Stats.CD, value: 4, unit: 'percent',
        durationTurns: 0, effectId: CROWN_CD_ID, stackable: { maxStacks: 8 },
      })
      if (hasE2) {
        out.push({
          type: 'stat_buff', targets: 'self', stat: 'DEF_PEN', value: 1, unit: 'percent',
          durationTurns: 0, effectId: E2_DEF_PEN_ID, stackable: { maxStacks: 15 },
        })
      }
    }
    return out
  }

  // 战技: always +30 energy / -1 SP / Crown of the Stars buff, then a branch — if consuming all held
  // Reactor Core would refill to 360, do that instead of gaining 3 more stacks. E1 always tacks on one
  // more Reactor Core grant regardless of which branch ran. The Mana Burst self-pull (特殊技能5) is NOT
  // handled here — it's a continuously-checked passiveTrigger below, independent of what caused the
  // refill condition to become true (her own Skill, an external energy grant, anything).
  const skill = (ctx: { energy: number; maxEnergy: number; activeInterventions: { effectId?: string; stacks?: number }[] }): AbilityResolution => {
    const reactorStacks = ctx.activeInterventions.find((b) => b.effectId === REACTOR_CORE_ID)?.stacks ?? 0
    const energyAfterBase = ctx.energy + 30
    const canRefill = reactorStacks > 0 && (energyAfterBase + reactorStacks * 8) >= FULL_ENERGY_THRESHOLD

    const templates: InterventionTemplate[] = [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: true },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
      { type: 'stat_buff', targets: 'self', stat: Stats.CD, value: 50, unit: 'percent', durationTurns: 2, effectId: CROWN_OF_STARS_ID },
      ...(canRefill
        ? [
            { type: 'energy_gain' as const, targets: 'self' as const, value: reactorStacks * 8, unit: 'flat' as const, scalesWithErr: false },
            { type: 'clear_buff' as const, targets: 'self' as const, effectId: REACTOR_CORE_ID },
          ]
        : grantReactorCore(3)),
      ...(hasE1 ? grantReactorCore(1) : []),
    ]

    return { templates }
  }

  const ultTemplates: InterventionTemplate[] = [
    // Next Basic becomes the enhanced version (basicVariants below), consumed after one use.
    {
      type: 'stat_buff', targets: 'self', stat: ENHANCED_BASIC_STAT, value: 0, unit: 'flat',
      durationTurns: 0, effectId: ENHANCED_BASIC_MARKER_ID, stackable: { maxStacks: 1 },
    },
    { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: true },
    ...(hasE4
      ? [{
          type: 'stat_buff' as const, targets: 'self' as const, stat: WIND_RES_PEN, value: 4, unit: 'percent' as const,
          durationTurns: 0, effectId: E4_RES_PEN_ID, stackable: { maxStacks: 5 },
        }]
      : []),
    ...(hasE6
      ? [{
          type: 'energy_gain' as const, targets: 'self' as const, value: 300, unit: 'flat' as const, scalesWithErr: false,
          condition: { metric: 'buffStacks' as const, effectId: E6_ENERGY_MARKER_ID, operator: 'gte' as const, value: 1 },
        }]
      : []),
    // Consumes Gilgamesh's extraAttack-granted Ult-damage-double buff, if held — a no-op otherwise.
    { type: 'clear_buff' as const, targets: 'self' as const, effectId: GILGAMESH_ULT_DOUBLE_ID },
  ]

  const globalListeners: GlobalListener[] = [
    // 天赋: any ally's ult grants 龙之炉心 (60% DMG, 2 turns) and 3 Reactor Core (+ matching CD/DEF PEN).
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingAbility === 'ult',
      effect: [
        { type: 'stat_buff', targets: 'self', stat: BOOST, value: 60, unit: 'percent', durationTurns: 2, effectId: DRAGON_REACTOR_CORE_ID },
        ...grantReactorCore(3),
      ],
    },
    ...(hasE6
      ? [{
          trigger: 'any_ally_action' as const,
          condition: (ctx: { actingAbility: string }) => ctx.actingAbility === 'ult',
          everyNOccurrences: 3,
          effect: {
            type: 'stat_buff' as const, targets: 'self' as const, stat: E6_ENERGY_STAT, value: 0, unit: 'flat' as const,
            durationTurns: 0, effectId: E6_ENERGY_MARKER_ID, stackable: { maxStacks: 99 },
          },
        }]
      : []),
  ]

  return {
    characterId: SABER_ID,
    energyType: 'standard',
    customMaxEnergy: hasE6 ? 560 : 480,
    ultThreshold: FULL_ENERGY_THRESHOLD,
    ultEnergyCost: FULL_ENERGY_THRESHOLD,
    hitCounts: { basic: 1, skill: 1, ult: 1 },

    onBattleStart: [
      // 天赋: +1层炉心共鸣
      ...grantReactorCore(1),
      // 秘技: +2层炉心共鸣 (合计开局3层) + 骑士王的登场 (ATK+35%, 2回合)
      ...grantReactorCore(2),
      { type: 'stat_buff', targets: 'self', stat: Stats.ATK_P, value: 35, unit: 'percent', durationTurns: 2, effectId: KING_OF_KNIGHTS_ID },
      // 特殊技能2: 能量不足216则补满
      { type: 'energy_set_minimum', targets: 'self', value: 216 },
      // 特殊技能3: 龙之骑士 暴击率+20% 永久
      { type: 'stat_buff', targets: 'self', stat: Stats.CR, value: 20, unit: 'percent', durationTurns: Infinity, effectId: KNIGHT_OF_DRAGON_ID },
      // 特殊技能4: 开局获得魔力放出 (上限1层)
      { type: 'stat_buff', targets: 'self', stat: MANA_BURST_STAT, value: 0, unit: 'flat', durationTurns: 0, effectId: MANA_BURST_ID, stackable: { maxStacks: 1 } },
      ...(hasE4
        ? [
            { type: 'stat_buff' as const, targets: 'self' as const, stat: WIND_RES_PEN, value: 4, unit: 'percent' as const, durationTurns: 0, effectId: E4_RES_PEN_ID, stackable: { maxStacks: 5 } },
            { type: 'stat_buff' as const, targets: 'self' as const, stat: WIND_RES_PEN, value: 4, unit: 'percent' as const, durationTurns: 0, effectId: E4_RES_PEN_ID, stackable: { maxStacks: 5 } },
          ]
        : []),
      ...(hasE6
        ? [
            { type: 'stat_buff' as const, targets: 'self' as const, stat: WIND_RES_PEN, value: 20, unit: 'percent' as const, durationTurns: Infinity, effectId: E6_RES_PEN_ID },
            { type: 'stat_buff' as const, targets: 'self' as const, stat: E6_ENERGY_STAT, value: 0, unit: 'flat' as const, durationTurns: 0, effectId: E6_ENERGY_MARKER_ID, stackable: { maxStacks: 99 } },
          ]
        : []),
      ...(hasE1
        ? [{ type: 'stat_buff' as const, targets: 'self' as const, stat: BOOST, value: 60, unit: 'percent' as const, durationTurns: Infinity, effectId: E1_ULT_BOOST_ID }]
        : []),
    ],

    abilities: {
      basic: [
        { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat', scalesWithErr: true },
        { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
        ...(hasE1 ? grantReactorCore(1) : []),
      ],
      skill,
      ult: ultTemplates,
    },

    basicVariants: [{
      requiresEffectId: ENHANCED_BASIC_MARKER_ID,
      templates: [
        { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: true },
        { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
        { type: 'stat_buff', targets: 'self', stat: MANA_BURST_STAT, value: 0, unit: 'flat', durationTurns: 0, effectId: MANA_BURST_ID, stackable: { maxStacks: 1 } },
        // Base kit: +2 Reactor Core, regardless of eidolon. E1 adds its own +1 on top (3 total at E1+).
        ...grantReactorCore(2),
        ...(hasE1 ? grantReactorCore(1) : []),
      ],
      consumesStack: true,
      hitCount: 1,
    }],

    globalListeners,

    // 特殊技能5: continuously checked, independent of what caused it — her own Skill, an external energy
    // grant, anything. The effect itself clears Mana Burst, so it can't refire until Mana Burst is
    // granted again (battle start / enhanced Basic) and the condition becomes freshly true.
    passiveTrigger: [{
      condition: (ctx) => {
        const stacks = ctx.activeInterventions.find((b) => b.effectId === REACTOR_CORE_ID)?.stacks ?? 0
        const hasManaBurst = ctx.activeInterventions.some((b) => b.effectId === MANA_BURST_ID)
        return hasManaBurst && stacks > 0 && (ctx.energy + stacks * 8) >= FULL_ENERGY_THRESHOLD
      },
      effect: [
        { type: 'clear_buff', targets: 'self', effectId: MANA_BURST_ID },
        { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
        { type: 'av_advance', targets: 'self', value: 100, unit: 'percent' },
      ],
    }],
  }
}

export const Saber: CharacterBattleConfig = {
  ...buildSaberConfig(0),
  // Each patch rebuilds the whole config at its own tier (instead of incrementally appending to the
  // previous patch's output) — index.ts's getBattleConfig applies these in increasing minEidolon order,
  // feeding each one the prior result, so the final output after all unlocked patches is just
  // buildSaberConfig(highest unlocked tier). This avoids re-patching every single Reactor Core grant
  // site (talent listener, skill branch, E1 bonus, basic/enhanced-basic) by hand for E1/E2 — they're
  // already accounted for inside grantReactorCore/buildSaberConfig itself.
  eidolonUpgrades: [1, 2, 4, 6].map((minEidolon) => ({
    minEidolon,
    patch: () => buildSaberConfig(minEidolon),
  })),
}
