import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterBattleConfig, InterventionTemplate } from 'lib/tabs/tabAvVisualizer/types'
import type { CharacterId } from 'types/character'

// TODO: verify — male/female Remembrance Trailblazer character ids
const CAELUS_ID = '8007'
const STELLE_ID = '8008'

// Synthetic id: Mimi isn't a real character in game_data.json. Shared by both Trailblazer variants —
// only one of them is ever on a team at a time, so there's no ownership conflict.
const MIMI_ID = 'trailblazer_remembrance_mimi'

// 史诗 (Epic): a pure marker buff — its only purpose is to gate the enhanced basic-attack variant and
// hold a stack count. Carries no real stat, value is always 0.
const EPIC_STAT = 'EPIC'
const EPIC_EFFECT_ID = 'trailblazer_remembrance_epic'

// 迷迷的声援 / 现在的记叙者 (E1): both globally exclusive — see CHEER_EFFECT_ID/NOW_NARRATOR_EFFECT_ID's
// exclusiveEffectId usage below.
const CHEER_EFFECT_ID = 'mimi_cheer'
const NOW_NARRATOR_EFFECT_ID = 'mimi_now_narrator'

// True DMG isn't a real Stats enum member — see avVisualizerTab.yaml's EffectStatNames.TRUE_DMG for the
// display label.
const TRUE_DMG = 'TRUE_DMG'

// Shared by both Trailblazer variants — identical kit, only characterId differs.
const sharedAbilities: CharacterBattleConfig['abilities'] = {
  basic: [
    { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' },
    { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
  ],
  skill: [
    // Checked BEFORE summon_companion below, against the state as of the start of this cast — if Mimi
    // is already present, charge her 10% (fixed, doesn't scale with ERR); if not, this is skipped and
    // summon_companion spawns her instead. Never both in the same cast.
    {
      type: 'energy_gain', targets: 'self', fixedTargetId: MIMI_ID, value: 10, unit: 'percent', scalesWithErr: false,
      condition: { metric: 'entityPresent', operator: 'eq', value: 1 },
    },
    { type: 'summon_companion' },
    { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
    { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
  ],
  ult: [
    // Unconditional attempt — a no-op if Mimi is already present, summons her otherwise.
    { type: 'summon_companion' },
    // Unlike the skill, this charge always fires regardless of whether Mimi was already present.
    { type: 'energy_gain', targets: 'self', fixedTargetId: MIMI_ID, value: 40, unit: 'percent', scalesWithErr: false },
    {
      type: 'stat_buff', targets: 'self', stat: EPIC_STAT, value: 0, unit: 'flat', durationTurns: 0,
      effectId: EPIC_EFFECT_ID, stackable: { maxStacks: 2 },
    },
    { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat' },
  ],
}

const sharedConfig: Omit<CharacterBattleConfig, 'characterId'> = {
  energyType: 'standard',
  hitCounts: { basic: 1, ult: 1 },   // skill omitted -> 0
  companion: {
    type: 'memosprite', characterId: MIMI_ID, baseSpd: 130, presentFromStart: false,
    // Mimi's HP: 86% of Caelus's white HP, re-applying his % HP bonus against her own (scaled-down) base,
    // his flat HP bonus carried over as-is, plus her own unconditional +688.
    hpInheritance: { whiteRatio: 0.86, flatBonus: 688 },
  },

  onBattleStart: [
    { type: 'av_advance', targets: 'self', value: 30, unit: 'percent' },
  ],
  // Owner's own reaction to having just summoned Mimi (only fires on a real spawn, never on a no-op
  // summon_companion re-attempt) — Mimi's own self-charge lives on her own onBattleStart instead.
  onCompanionSummon: [
    { type: 'energy_gain', targets: 'self', fixedTargetId: MIMI_ID, value: 40, unit: 'percent', scalesWithErr: false },
  ],

  abilities: sharedAbilities,
  basicVariants: [{
    requiresEffectId: EPIC_EFFECT_ID,
    templates: [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
      { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
    ],
    consumesStack: true,
    hitCount: 2,
  }],

  // Talent: every point of energy any ally actually restores converts 0.1% of it into charge for Mimi
  // (e.g. 10 energy -> 1%, 3.5 energy -> 0.35%).
  onAllyEnergyGain: { ratioPercent: 0.1, fixedTargetId: MIMI_ID },

  eidolonUpgrades: [
    {
      // E2: any OTHER memosprite's own action (not Mimi's, not a regular character's) restores 8 energy
      // (scales with ERR), at most once per the Trailblazer's own turn cycle. Dormant unless the team
      // has some other memosprite-summoning character on it.
      minEidolon: 2,
      patch: (config) => ({
        ...config,
        globalListeners: [
          ...(config.globalListeners ?? []),
          {
            trigger: 'any_ally_action',
            condition: (ctx) => ctx.actingCharacterType === 'memosprite' && ctx.actingCharacterId !== MIMI_ID,
            effect: { type: 'energy_gain', targets: 'self', value: 8, unit: 'flat' },
            maxTriggersPerOwnTurn: 1,
          },
        ],
      }),
    },
    {
      // E6: 神启的转呈者 — permanent +100% crit rate, granted by the Ultimate.
      minEidolon: 6,
      patch: (config) => ({
        ...config,
        abilities: {
          ...config.abilities,
          // Caelus's own ult is always a plain template array (never an AbilityResolver) — safe to
          // assert, since this patch is hand-written specifically against this character's config.
          ult: [
            ...(config.abilities.ult as InterventionTemplate[]),
            {
              type: 'stat_buff', targets: 'self', stat: Stats.CR, value: 100, unit: 'percent',
              durationTurns: Infinity, effectId: 'trailblazer_remembrance_e6',
            },
          ],
        },
      }),
    },
  ],
}

export const TrailblazerRemembranceCaelus: CharacterBattleConfig = { characterId: CAELUS_ID, ...sharedConfig }
export const TrailblazerRemembranceStelle: CharacterBattleConfig = { characterId: STELLE_ID, ...sharedConfig }

export const Mimi: CharacterBattleConfig = {
  characterId: MIMI_ID,
  energyType: 'standard',
  customMaxEnergy: 100,   // TODO: verify real value — percentage math just needs a consistent base
  hitCounts: { basic: 1 },   // skill omitted -> 0

  // Fires whenever Mimi actually enters the simulation — at AV=0 if presentFromStart, or at the moment
  // summon_companion spawns her otherwise.
  onBattleStart: [
    { type: 'energy_gain', targets: 'self', value: 50, unit: 'percent', scalesWithErr: false },
    // 伙伴！一起！ — team-wide (including herself) CD buff: 26.4% flat + 13.2% of Mimi's own Crit DMG.
    // Mimi has no gear of her own — her "own" CD is Caelus's real CD, copied onto her BattleEntity.cd at
    // summon time (see AvVisualizerTab.tsx / summonCompanion).
    {
      type: 'stat_buff', targets: 'all_allies', stat: Stats.CD, value: 26.4, unit: 'percent',
      durationTurns: Infinity, buffKind: 'aura', effectId: 'mimi_partner_cheer',
      // ratio is 13.2, not 0.132: BattleEntity.cd is a fraction (1.5 for 150%), but this template's
      // `value`/unit:'percent' is in percent-*number* form (26.4 meaning 26.4%) — so the bonus needs to
      // come out in that same percent-number form: 13.2% of CD=150% is 19.8 (percentage points), i.e.
      // cd(1.5) * 13.2 = 19.8, not cd(1.5) * 0.132 = 0.198.
      casterStatScaling: { stat: 'cd', ratio: 13.2 },
    },
  ],

  abilities: {
    // 坏人！麻烦！ — auto-cast (via autoActsOnOwnEnergy) while below max energy.
    basic: [
      { type: 'energy_gain', targets: 'owner', value: 10, unit: 'flat' },
      // Special technique 2: self-charge, immediate, doesn't scale with ERR.
      { type: 'energy_gain', targets: 'self', value: 5, unit: 'percent', scalesWithErr: false },
    ],
    // 迷迷的声援 — auto-cast (via autoActsOnOwnEnergy) at/above max energy. targets:'single_ally' still
    // goes through the normal user-picked-target flow (ActionNodeOverride.targets) — only the choice of
    // basic vs skill itself is automatic, not who it's aimed at.
    skill: [
      // Spends her own energy first, before anything else — in particular, before the owner energy_gain
      // below. That gain bounces back into her own energy via Caelus's talent conversion (any ally's
      // energy_gain reflects a fraction back to her); if the self-reset ran last instead, she'd still be
      // sitting at 100% energy when that reflection landed, which would itself read as "maxed again" and
      // spuriously pull her own already-queued next action right back to this same AV. Resetting first
      // means she's already below max when the reflection happens, so it just leaves a small (correct)
      // residual instead of re-triggering the pull.
      { type: 'energy_loss', targets: 'self', value: 100, unit: 'percent', scalesWithErr: false },
      { type: 'av_advance', targets: 'single_ally', value: 100, unit: 'percent' },
      {
        type: 'stat_buff', targets: 'single_ally', stat: TRUE_DMG, value: 30, unit: 'percent', durationTurns: 3,
        effectId: CHEER_EFFECT_ID, exclusiveEffectId: true,
        // Special technique 3: +2% per 10 points the target's max energy exceeds 100, capped at +20%.
        valueScaling: { metric: 'maxEnergy', baseline: 100, perUnit: 2, unitSize: 10, maxBonus: 20 },
      },
      { type: 'energy_gain', targets: 'owner', value: 10, unit: 'flat' },
    ],
    ult: [],
  },

  autoActsOnOwnEnergy: true,

  eidolonUpgrades: [
    {
      // E1: 现在的记叙者 — the 声援 target also gets +10% crit rate; if that target has its own
      // companion, or is itself a companion, the related character gets the identical buff too.
      minEidolon: 1,
      patch: (config) => ({
        ...config,
        abilities: {
          ...config.abilities,
          // Caelus's own skill is always a plain template array (never an AbilityResolver) — safe to
          // assert, since this patch is hand-written specifically against this character's config.
          skill: [
            ...(config.abilities.skill as InterventionTemplate[]),
            {
              type: 'stat_buff', targets: 'single_ally', stat: Stats.CR, value: 10, unit: 'percent', durationTurns: 3,
              effectId: NOW_NARRATOR_EFFECT_ID, exclusiveEffectId: true, alsoTargetRelated: 'companion_and_owner',
            },
          ],
        },
      }),
    },
    {
      // E4: allies with 0 max energy casting basic/skill/ult charge Mimi 3% (fixed); the same allies
      // also get an extra +6% True DMG from 迷迷的声援 (added to the base template's valueScaling).
      minEidolon: 4,
      patch: (config) => ({
        ...config,
        abilities: {
          ...config.abilities,
          // Mimi's own skill is always a plain template array (never an AbilityResolver) — safe to
          // assert, since this patch is hand-written specifically against this character's config.
          skill: (config.abilities.skill as InterventionTemplate[]).map((t) =>
            ('effectId' in t && t.effectId === CHEER_EFFECT_ID && 'valueScaling' in t && t.valueScaling)
              ? {
                  ...t,
                  valueScaling: {
                    ...t.valueScaling,
                    extraCondition: { condition: { metric: 'maxEnergy', operator: 'eq', value: 0 }, bonus: 6 },
                  },
                }
              : t,
          ),
        },
        globalListeners: [
          ...(config.globalListeners ?? []),
          {
            trigger: 'any_ally_action',
            condition: (ctx) =>
              (ctx.actingAbility === 'basic' || ctx.actingAbility === 'skill' || ctx.actingAbility === 'ult')
              && (getGameMetadata().characters?.[ctx.actingCharacterId as CharacterId]?.max_sp === 0),
            effect: { type: 'energy_gain', targets: 'self', value: 3, unit: 'percent', scalesWithErr: false },
          },
        ],
      }),
    },
  ],
}
