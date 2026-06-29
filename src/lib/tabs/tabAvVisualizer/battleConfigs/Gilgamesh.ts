import { Stats } from 'lib/constants/constants'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import type {
  CharacterBattleConfig,
  GlobalListener,
  InterventionTemplate,
} from 'lib/tabs/tabAvVisualizer/types'

// Real game_data.json id. Its own max_sp (600) doesn't match this kit's 360 ult threshold/cap, so
// customMaxEnergy below overrides it — same convention as Saber/Mimi's own mismatched lookups.
const GILGAMESH_ID = '1509'
const SABER_ID = '1014'
const FULL_ENERGY_THRESHOLD = 360

// Extended (non-Stats-enum) keys — see avVisualizerTab.yaml's EffectStatNames for their display labels,
// same convention as Huohuo's BOOST/RES_PEN.
const ULT_DMG_BOOST = 'ULT_DMG_BOOST'
const ULT_CD_BOOST = 'ULT_CD_BOOST'
const ULT_DMG_MULTIPLIER = 'ULT_DMG_MULTIPLIER'
const RES_PEN = 'RES_PEN'

const KINGS_ACKNOWLEDGEMENT_ID = 'gilgamesh_kings_acknowledgement'   // 王来承认
const KINGS_BURDEN_ID = 'gilgamesh_kings_burden'                     // 王来背负
const WITNESS_ID = 'gilgamesh_witness'                               // 见证一切之人 (E1)

// 兴致 (Interest): the stack counter itself, no real stat. Its SPD bonus is a *separate* buff
// (INTEREST_SPD_ID) kept in sync by a passiveTrigger below, instead of being granted incrementally —
// spd_up entries sharing one effectId replace rather than stack, so "current stacks * 10%" has to be
// recomputed from live state each time, not accumulated piece by piece.
const INTEREST_STAT = 'INTEREST'
const INTEREST_ID = 'gilgamesh_interest'
const INTEREST_SPD_ID = 'gilgamesh_interest_spd'
const INTEREST_PIQUED_STAT = 'INTEREST_PIQUED'
const INTEREST_PIQUED_ID = 'gilgamesh_interest_piqued'               // 来兴致了

// 英雄的孤傲 (Hero's Solitude): +25% CD per Interest stack *ever gained*, permanent, capped at 8 — never
// lost when Interest itself is cleared, unlike Saber's Crown of the Stars (CD) which is the same pattern.
const HERO_SOLITUDE_ID = 'gilgamesh_heros_solitude'

// 本王允许你进攻 (I Grant You Permission To Strike): shared hit-count-driven counter living on Gilgamesh,
// fed by both his own and Saber's attacks.
const PERMISSION_STAT = 'PERMISSION_TO_STRIKE'
const PERMISSION_TO_STRIKE_ID = 'gilgamesh_permission_to_strike'
// Granted to Saber by the extraAttack — consumed by her own Ult (see Saber.ts's matching clear_buff).
const SABER_ULT_DOUBLE_ID = 'gilgamesh_permission_to_strike_ult_double'

const KINGS_CONTEST_ATK_ID = 'gilgamesh_kings_contest_atk'   // 王霸的竞逐_攻击
const KINGS_CONTEST_CD_ID = 'gilgamesh_kings_contest_cd'     // 王霸的竞逐_暴伤

const KING_WHO_BOWED_ID = 'gilgamesh_king_who_bowed'                 // 唯我独尊之王 (E4)
const SOUL_BORE_FRIENDSHIP_ID = 'gilgamesh_soul_bore_friendship'     // 挚友淬锻之魂 (E6)
const GOLDEN_RULE_ID = 'gilgamesh_golden_rule'                       // 黄金律 (E6)

// Builds the complete config at a given eidolon tier — same rebuild-at-tier pattern as Saber.ts (each
// eidolonUpgrades patch just returns buildGilgameshConfig(its own tier) instead of incrementally
// appending to the previous patch's output).
function buildGilgameshConfig(eidolon: number): CharacterBattleConfig {
  const hasE1 = eidolon >= 1
  const hasE2 = eidolon >= 2
  const hasE4 = eidolon >= 4
  const hasE6 = eidolon >= 6

  // Every place that grants Interest also grants the same number of permanent Hero's Solitude layers
  // (特殊能力4) — bundled here so none of the several grant sites (talent reaction, 秘技, Ult, E2) can
  // forget to pair them, same convention as Saber's grantReactorCore.
  function grantInterest(n: number): InterventionTemplate[] {
    const out: InterventionTemplate[] = []
    for (let i = 0; i < n; i++) {
      out.push({
        type: 'stat_buff', targets: 'self', stat: INTEREST_STAT, value: 0, unit: 'flat',
        durationTurns: 0, effectId: INTEREST_ID, stackable: { maxStacks: 99 },
      })
      out.push({
        type: 'stat_buff', targets: 'self', stat: Stats.CD, value: 25, unit: 'percent',
        durationTurns: 0, effectId: HERO_SOLITUDE_ID, stackable: { maxStacks: 8 },
      })
    }
    return out
  }

  const globalListeners: GlobalListener[] = [
    // 天赋a: any ally's Ult (not his own) grants 王来背负 (Ult DMG +40%, 3 turns).
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingCharacterId !== ctx.selfId && ctx.actingAbility === 'ult',
      effect: { type: 'stat_buff', targets: 'self', stat: ULT_DMG_BOOST, value: 40, unit: 'percent', durationTurns: 3, effectId: KINGS_BURDEN_ID },
    },
    // 天赋c: any other character/memosprite's action (not summon/marker — see the standing decision to
    // leave those out of global listener triggers entirely) grants +1 Interest.
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingCharacterId !== ctx.selfId,
      effect: grantInterest(1),
    },
    // 特殊能力2: any other character's Ult grants an *additional* +2 Interest (on top of 天赋c's own +1
    // from that same action).
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingCharacterId !== ctx.selfId && ctx.actingAbility === 'ult',
      effect: grantInterest(2),
    },
    // 特殊能力3: restores 30% of *that character's own* Ult energy cost, fixed (doesn't scale with ERR).
    // Needs a function effect — the value depends on the acting character's own config, not a fixed number.
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingCharacterId !== ctx.selfId && ctx.actingAbility === 'ult',
      effect: (ctx) => {
        const actingConfig = getBattleConfig(ctx.actingCharacterId)
        const cost = actingConfig?.ultEnergyCost ?? actingConfig?.ultThreshold ?? 0
        return { type: 'energy_gain', targets: 'self', value: cost * 0.3, unit: 'flat', scalesWithErr: false }
      },
    },
    // 追加攻击 trigger: both his own and Saber's attacks feed the shared 本王允许你进攻 counter, scaled by
    // the actual hit count of that action (see GlobalListenerContext.hitCount).
    {
      trigger: 'any_ally_action',
      condition: (ctx) => ctx.actingCharacterId === ctx.selfId || ctx.actingCharacterId === SABER_ID,
      effect: (ctx) => Array.from({ length: Math.max(0, ctx.hitCount) }, () => ({
        type: 'stat_buff' as const, targets: 'self' as const, stat: PERMISSION_STAT, value: 0, unit: 'flat' as const,
        durationTurns: 0, effectId: PERMISSION_TO_STRIKE_ID, stackable: { maxStacks: 8 },
      })),
    },
    // E6: any other ally's Ult grants a stack of 黄金律 (Ult CRIT DMG +100%, max 3) — consumed by his own
    // Ult (see abilities.ult below).
    ...(hasE6
      ? [{
          trigger: 'any_ally_action' as const,
          condition: (ctx: { actingCharacterId: string; selfId: string; actingAbility: string }) =>
            ctx.actingCharacterId !== ctx.selfId && ctx.actingAbility === 'ult',
          effect: {
            type: 'stat_buff' as const, targets: 'self' as const, stat: ULT_CD_BOOST, value: 100, unit: 'percent' as const,
            durationTurns: 0, effectId: GOLDEN_RULE_ID, stackable: { maxStacks: 3 },
          },
        }]
      : []),
  ]

  return {
    characterId: GILGAMESH_ID,
    energyType: 'standard',
    customMaxEnergy: FULL_ENERGY_THRESHOLD,
    ultThreshold: FULL_ENERGY_THRESHOLD,
    ultEnergyCost: FULL_ENERGY_THRESHOLD,
    hitCounts: { basic: 1, skill: 1, ult: 1 },

    onBattleStart: [
      // 秘技: +3 Interest immediately.
      ...grantInterest(3),
      // 特殊能力5/6: team-wide ATK/CD +20%, scaling with each ally's own max energy past 140.
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P, value: 20, unit: 'percent', durationTurns: Infinity,
        effectId: KINGS_CONTEST_ATK_ID,
        valueScaling: { metric: 'maxEnergy', baseline: 140, perUnit: 1, unitSize: 1, maxBonus: 100 },
      },
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.CD, value: 20, unit: 'percent', durationTurns: Infinity,
        effectId: KINGS_CONTEST_CD_ID,
        valueScaling: { metric: 'maxEnergy', baseline: 140, perUnit: 1, unitSize: 1, maxBonus: 100 },
      },
      ...(hasE2 ? grantInterest(5) : []),
      ...(hasE4
        ? [{
            type: 'stat_buff' as const, targets: 'self' as const, stat: Stats.ERR, value: 20, unit: 'percent' as const,
            durationTurns: 0, effectId: KING_WHO_BOWED_ID, stackable: { maxStacks: 1 },
          }]
        : []),
      ...(hasE6
        ? [{
            type: 'stat_buff' as const, targets: 'all_allies' as const, stat: RES_PEN, value: 20, unit: 'percent' as const,
            durationTurns: Infinity, effectId: SOUL_BORE_FRIENDSHIP_ID,
          }]
        : []),
    ],

    abilities: {
      basic: [
        { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat', scalesWithErr: true },
        { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
      ],
      // 战技: 王来承认 (ignore 30% DEF, 3 turns) — E1 makes it a team-wide aura (still ticked off
      // Gilgamesh's own turns) and adds his own 见证一切之人 (+60% ATK self, 3 turns) alongside it.
      skill: [
        {
          type: 'stat_buff', targets: hasE1 ? 'all_allies' : 'self', stat: 'DEF_PEN', value: 30, unit: 'percent',
          durationTurns: 3, effectId: KINGS_ACKNOWLEDGEMENT_ID, buffKind: hasE1 ? 'aura' : 'direct',
        },
        ...(hasE1
          ? [{ type: 'stat_buff' as const, targets: 'self' as const, stat: Stats.ATK_P, value: 60, unit: 'percent' as const, durationTurns: 3, effectId: WITNESS_ID }]
          : []),
        { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: true },
        ...(hasE1 ? [{ type: 'energy_gain' as const, targets: 'self' as const, value: 40, unit: 'flat' as const, scalesWithErr: false }] : []),
        // 每次释放战技,清空兴致 (not Interest Piqued — separate effectId, never cleared once gained).
        { type: 'clear_buff', targets: 'self', effectId: INTEREST_ID },
      ],
      ult: [
        { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: true },
        // 特殊能力1: +2 Interest from his own Ult.
        ...grantInterest(2),
        ...(hasE2 ? grantInterest(5) : []),
        ...(hasE6 ? [{ type: 'clear_buff' as const, targets: 'self' as const, effectId: GOLDEN_RULE_ID }] : []),
      ],
    },

    globalListeners,

    passiveTrigger: [
      // 当兴致首次达到10点时,获得来兴致了 — idempotent re-grant (maxStacks:1) means it's safe to keep
      // checking forever; it simply never refires meaningfully once already held.
      {
        condition: (ctx) => (ctx.activeInterventions.find((b) => b.effectId === INTEREST_ID)?.stacks ?? 0) >= 10,
        effect: [{
          type: 'stat_buff', targets: 'self', stat: INTEREST_PIQUED_STAT, value: 0, unit: 'flat',
          durationTurns: 0, effectId: INTEREST_PIQUED_ID, stackable: { maxStacks: 1 },
        }],
      },
      // Keeps his SPD buff in sync with his current Interest stack count — always re-applied (same
      // effectId replaces, never stacks), so this is safe to check unconditionally every checkpoint.
      {
        condition: () => true,
        effect: (ctx) => {
          const stacks = ctx.activeInterventions.find((b) => b.effectId === INTEREST_ID)?.stacks ?? 0
          return [{
            type: 'spd_up', targets: 'self', value: stacks * 10, unit: 'percent',
            durationTurns: Infinity, effectId: INTEREST_SPD_ID,
          }]
        },
      },
    ],

    // 追加攻击: once the shared 本王允许你进攻 counter reaches 8, both Gilgamesh and Saber get a one-off
    // burst with no turn of their own (see TurnKind/extraAttack's own doc comments for why this is immune
    // to AV manipulation by construction).
    extraAttack: {
      condition: (ctx) => (ctx.activeInterventions.find((b) => b.effectId === PERMISSION_TO_STRIKE_ID)?.stacks ?? 0) >= 8,
      effect: [
        ...grantInterest(3),
        { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: true },
        { type: 'energy_gain', targets: 'self', fixedTargetId: SABER_ID, value: 120, unit: 'flat', scalesWithErr: false },
        { type: 'energy_gain', targets: 'self', fixedTargetId: SABER_ID, value: 5, unit: 'flat', scalesWithErr: true },
        {
          type: 'stat_buff', targets: 'self', fixedTargetId: SABER_ID, stat: ULT_DMG_MULTIPLIER, value: 100, unit: 'percent',
          durationTurns: 0, effectId: SABER_ULT_DOUBLE_ID, stackable: { maxStacks: 1 },
        },
        { type: 'clear_buff', targets: 'self', effectId: PERMISSION_TO_STRIKE_ID },
      ],
      hitCount: 2,
    },

    // 天赋b: locked to Basic before Interest Piqued, locked to Skill for good once gained — never a free
    // choice. UI-only (see actionLock's own doc comment) — doesn't affect the simulation itself.
    actionLock: (ctx) => ctx.activeInterventions.some((b) => b.effectId === INTEREST_PIQUED_ID) ? 'skill' : 'basic',
  }
}

export const Gilgamesh: CharacterBattleConfig = {
  ...buildGilgameshConfig(0),
  eidolonUpgrades: [1, 2, 4, 6].map((minEidolon) => ({
    minEidolon,
    patch: () => buildGilgameshConfig(minEidolon),
  })),
}
