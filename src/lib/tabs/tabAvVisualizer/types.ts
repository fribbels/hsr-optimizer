// ── Existing types (extended) ────────────────────────────────────────────────

// Grouped by engine behaviour, not by attribute granularity.
// Each group is handled by a distinct code path in the simulation engine.
export type InterventionType =
  | 'av_advance'    // Direct AV position shift
  | 'av_delay'
  | 'spd_up'        // Speed change — triggers gauge conservation math
  | 'spd_down'
  | 'energy_gain'   // Personal energy value change (Phase 2+)
  | 'energy_loss'
  | 'sp_gain'       // Team Skill Point change — instant (Phase 2+)
  | 'sp_loss'
  | 'sp_cap_up'     // Temporary SP ceiling change, has duration (Phase 2+)
  | 'sp_cap_down'
  | 'stat_buff'     // Attribute modifier — stat field specifies which (Phase 3+)
  | 'stat_debuff'
  | 'summon_companion'   // Spawns the caster's own companion if not already present; no-op otherwise
  | 'energy_set_minimum' // Raises energy to an absolute floor if below it; no-op otherwise
  | 'clear_buff'         // Instantly removes a held buff entirely (all its stacks, if stack-based)

export type InterventionUnit = 'flat' | 'percent'

export type Intervention = {
  id: string
  triggerAv: number
  // During action (before): fires right before the target character's beforeActionIndex-th action;
  // the spd buff is consumed by that very action (no effect when durationTurns=1)
  // When both beforeCharId and afterCharId are undefined = global "during action": not bound to any
  // character, fires once based purely on triggerAv (kept for backward compat / flat-view scenarios)
  beforeCharId?: string
  // Which action (0-based) this fires before; only meaningful when beforeCharId is set;
  // undefined is equivalent to 0 (before the 1st action)
  beforeActionIndex?: number
  // End-of-action instant (after): fires right after the target character's afterActionIndex-th action ends
  afterCharId?: string
  // Which action (0-based) this fires after; only meaningful when afterCharId is set;
  // undefined is equivalent to 0 (after the 1st action)
  afterActionIndex?: number
  // @deprecated Superseded by beforeCharId; kept only for backward compat with old data. The engine no longer reads this field.
  sourceCharId?: string
  // Precise ordering against other items (an UltInsertion or another Intervention) sharing the same
  // anchor (same beforeCharId/afterCharId+actionIndex, or same triggerAv for an unanchored/at_av item).
  // When set, this resolves immediately after the named item instead of the legacy default ("right
  // after the action, before any of its after_action ults" for afterCharId-anchored interventions).
  // Undefined for old/legacy data — that case keeps the pre-existing default ordering exactly as before.
  afterItemId?: string
  type: InterventionType
  targets: string[]
  value: number
  unit: InterventionUnit
  durationTurns: number
  // Extended fields (all optional to preserve backward compat with persisted data)
  stat?: string                         // stat_buff/debuff: which attribute to affect
  buffKind?: 'direct' | 'aura'         // Tick basis; default 'direct' if omitted
  auraTargets?: 'all_allies' | 'all_enemies'
  scalesWithErr?: boolean               // energy_gain/energy_loss: see InterventionTemplate
  effectId?: string                     // spd_up/down, stat_buff/debuff: see InterventionTemplate
  exclusiveEffectId?: boolean           // see InterventionTemplate's exclusiveEffectId
  stackable?: { maxStacks: number }     // see InterventionTemplate's stackable
  tickPhase?: 'start' | 'end'           // spd_up/down, stat_buff/debuff: see InterventionTemplate
}

// Shared contract between ActionDisplayPanel (emits requests) and EditPanel (consumes them), lifted in
// AvVisualizerTab. 'add' carries the timing context (before/after/global) the request originated from;
// 'edit' carries the full intervention being edited.
export type EditRequest =
  | { mode: 'add'; beforeCharId?: string; beforeActionIndex?: number; afterCharId?: string; afterActionIndex?: number; afterItemId?: string }
  | { mode: 'edit'; intervention: Intervention }

// Drives which component renders in the right-side context panel of AvVisualizerTab.
// Replaces the single EditRequest state — each kind maps to a different panel component.
export type RightPanelContext =
  | { kind: 'idle' }
  // afterItemId: precise chain position — whatever item (an Intervention or UltInsertion) is immediately
  // before this exact "+" click, so the newly added item (whichever kind the user picks next) resolves
  // right after it instead of falling back to the coarser legacy default. Undefined for the very first
  // slot in a given anchor's sequence (legacy default: goes first). afterUltId/insertBeforeUltId/
  // ultTimingReference are kept only for the existing Ult-to-Ult array-splice mechanics that addUltInsertion
  // still uses to decide an ult's array position (harmless to also set even when afterItemId already
  // makes that position non-authoritative).
  | { kind: 'add-branch'; triggerAv: number; afterCharId?: string; afterActionIndex?: number; beforeCharId?: string; beforeActionIndex?: number; afterUltId?: string; insertBeforeUltId?: string; ultTimingReference?: UltTiming; afterItemId?: string }
  | { kind: 'intervention'; request: EditRequest }
  | { kind: 'action-config'; characterId: string; actionIndex: number; hitCount?: number; stateSnapshot?: CharacterBattleState }
  | { kind: 'character-state'; characterId: string; actionIndex?: number; turnKind?: TurnKind; stateSnapshot?: CharacterBattleState }
  | { kind: 'ult-caster'; timing: UltTiming; insertAfterId?: string; insertBeforeUltId?: string; afterItemId?: string }
  | { kind: 'ult-effects'; casterId: string; targets?: string[] }
  | { kind: 'extra-effects'; casterId: string; targets?: string[] }

// ── New types ─────────────────────────────────────────────────────────────────

// Turn kind determines whether a BattleEvent participates in AV queue calculations.
// 'normal' events are AV-driven and affected by speed/advance/delay.
// 'ult' and 'extra' events are inserted at fixed points and are immune to AV manipulation.
export type TurnKind = 'normal' | 'ult' | 'extra'

// Actions a user can select at a normal action node.
// 'ult' is intentionally excluded — ultimates are inserted as independent UltInsertion events.
// 'follow_up' is generated by the engine, not selected by the user.
export type ActionChoice = 'basic' | 'skill' | 'follow_up'

// Semantic target descriptor used in InterventionTemplate.
// Distinct from Intervention.targets (which holds resolved characterId[]).
export type TargetType =
  | 'self'
  | 'single_ally'    // User picks a target; UI shows a dropdown, caster excluded from the choices
  | 'single_ally_or_self'   // Same as single_ally, but the caster is included as a valid choice
  | 'all_allies'
  | 'all_allies_except_self'   // Same as all_allies, but excludes the caster
  | 'owner'          // The caster's own owner, if it's a companion (e.g. Mimi restoring energy to
                      // whichever Trailblazer variant actually summoned her) — empty if the caster has
                      // no owner (e.g. a real character casting this by mistake)
  | 'single_enemy'
  | 'blast'          // 3 fixed enemies
  | 'all_enemies'    // 5 fixed enemies
  | 'team'           // The shared team SP pool — not a per-character target

// Filters which of a template's resolved targets actually receive the effect, based on a static or
// runtime property of each candidate target. 'maxEnergy' reads the target's energy cap from game
// metadata (static); 'currentEnergy' reads their live energy value (dynamic, via EnergyState).
export type TemplateCondition = {
  // 'entityPresent': 1 if this id currently exists in the simulation (e.g. a dynamically-summoned
  // companion that may or may not have been summoned yet), 0 otherwise — see InterventionType's
  // 'summon_companion' and CharacterBattleConfig.companion's presentFromStart.
  // 'buffStacks': whether/how much of a specific buff (see effectId) this id currently holds — 0 if not
  // held at all; a stack-based buff's real stack count if held; 1 if held and not stack-based (no
  // layered concept to read, just "present or not") — e.g. Saber: "does she currently hold Mana Burst"
  // is effectId + `operator:'gte', value:1`; "does she hold at least 3 Reactor Core stacks" is the same
  // shape with value:3.
  metric: 'maxEnergy' | 'currentEnergy' | 'entityPresent' | 'buffStacks'
  operator: 'gte' | 'lte' | 'gt' | 'lt' | 'eq'
  value: number
  effectId?: string   // Required when metric is 'buffStacks' — which buff to check
}

// Skill effect template bound to a CharacterBattleConfig ability.
// Does not contain triggerAv or resolved target IDs — the engine fills those in at action time.
// Uses a discriminated union so required fields differ by type group:
//   - Instant effects:   no duration, no buffKind
//   - SP instant:        targets locked to 'team'; unit always 'flat'
//   - SP cap effects:    duration required; targets locked to 'team'; unit always 'flat'
//   - Speed effects:     duration required, buffKind optional (can be aura e.g. Robin ult)
//   - Stat effects:      duration + stat required, buffKind optional
export type InterventionTemplate =
  | {
      type: 'av_advance' | 'av_delay'
      targets: TargetType
      value: number
      unit: 'flat' | 'percent'
      condition?: TemplateCondition
      // Bypasses targets/TargetType entirely and resolves straight to this id — for templates whose
      // target is a specific, statically-known entity rather than a caster-relative selection (e.g.
      // Trailblazer-Remembrance's skill always targets Mimi by her fixed companion id).
      fixedTargetId?: string
    }
  | {
      type: 'energy_gain' | 'energy_loss'
      targets: TargetType
      value: number
      unit: 'flat' | 'percent'
      // Whether this restoration scales with the target's Energy Regeneration Rate, matching in-game
      // rules: energy from one's own Basic ATK/Skill/taking DMG scales with ERR (default true), while
      // energy granted by an ability effect (e.g. Huohuo ult restoring allies' energy) does not.
      scalesWithErr?: boolean
      condition?: TemplateCondition
      // See av_advance/av_delay's fixedTargetId for semantics. Also the one way to land an energy_gain/
      // energy_loss on a memosprite — see the engine's memosprite exclusion rule in expandEnergyTemplate.
      fixedTargetId?: string
    }
  | {
      type: 'sp_gain' | 'sp_loss'
      targets: 'team'           // SP is always a team-level resource
      value: number
      unit: 'flat'              // SP counts are always integers
    }
  | {
      type: 'sp_cap_up' | 'sp_cap_down'
      targets: 'team'
      value: number
      unit: 'flat'
      durationTurns: number     // e.g. Sparkle ult: +2 cap for 2 turns
    }
  | {
      type: 'spd_up' | 'spd_down'
      targets: TargetType
      value: number
      unit: 'flat' | 'percent'
      durationTurns: number
      buffKind?: 'direct' | 'aura'
      auraTargets?: 'all_allies' | 'all_enemies'
      // Stable internal identity (NOT a display name/i18n key) for "this is the same named buff".
      // When set, re-applying this effect replaces any existing active buff sharing the same effectId
      // (refreshing its duration) instead of stacking a second instance — even if granted by a different
      // ability of the same character (e.g. Huohuo's Rangming buff from both Skill and Ultimate).
      effectId?: string
      // When true and effectId is set, this buff may only be held by ONE character at a time, globally
      // (not just "one per target") — re-applying it to a different target strips it from whoever
      // currently holds it, anywhere on the field (e.g. Mimi's 声援 buff).
      exclusiveEffectId?: boolean
      condition?: TemplateCondition
      fixedTargetId?: string   // See av_advance/av_delay's fixedTargetId for semantics
      // When this buff's durationTurns reaches 0: 'start' ticks (and, on reaching 0, stops applying)
      // right as the holder's *own* turn begins, before that turn's own choice/effects resolve — e.g.
      // Huohuo's Rangming (and the E1 team SPD buff bundled with it, kept in sync): if it would expire
      // this turn, it's already gone before this turn does anything with it. 'end' (the default when
      // omitted) ticks after the holder's entire turn (own effects, listeners, after-action effects) has
      // resolved, so the buff is still fully active through its last turn and only disappears starting
      // the turn after.
      tickPhase?: 'start' | 'end'
    }
  | {
      type: 'stat_buff' | 'stat_debuff'
      targets: TargetType
      stat: string               // Required: e.g. 'CR' | 'CD' | 'BREAK_EFFICIENCY'
      value: number
      unit: 'flat' | 'percent'
      durationTurns: number
      buffKind?: 'direct' | 'aura'
      auraTargets?: 'all_allies' | 'all_enemies'
      effectId?: string           // See spd_up/spd_down's effectId for semantics
      exclusiveEffectId?: boolean // See spd_up/spd_down's exclusiveEffectId for semantics
      condition?: TemplateCondition
      // Stack-based buff: no duration, holds 0..maxStacks copies of the same effect instead of ticking
      // down by turn (e.g. Trailblazer-Remembrance's 史诗 buff). When set, durationTurns is ignored —
      // the engine never expires this by turn count, only by explicit consumption (see
      // CharacterBattleConfig.basicVariants' consumesStack).
      stackable?: { maxStacks: number }
      // Per-target value scaling based on a target stat, evaluated once at apply time (not re-evaluated
      // later) — e.g. Mimi's 声援: +2% per 10 points of the target's max energy over 100, capped at +20%,
      // with an extra flat bonus once a condition is met (e.g. E4: +6% if the target's max energy is 0).
      valueScaling?: {
        metric: 'maxEnergy'
        baseline: number
        perUnit: number
        unitSize: number
        maxBonus: number
        extraCondition?: { condition: TemplateCondition; bonus: number }
      }
      // Linear scaling off the *caster's own* real stat (BattleEntity.cd) instead of a per-target metric
      // — e.g. Mimi's 伙伴！一起！: +13.2% of her own (= Trailblazer-Remembrance's, copied at summon time)
      // Crit DMG, on top of the flat 26.4% base `value`. Unlike valueScaling (per-target, stepped/capped),
      // this is a simple `value + casterStat * ratio`, uniform across every target.
      casterStatScaling?: { stat: 'cd'; ratio: number }
      fixedTargetId?: string   // See av_advance/av_delay's fixedTargetId for semantics
      // After normal target resolution, additionally include each resolved target's companion (e.g. a
      // memosprite owned by that target) and/or, if the target itself is a companion, its owner — e.g.
      // Trailblazer-Remembrance E1: "如果声援目标拥有忆灵或对方为忆灵，则其忆灵或该忆灵的主人也获得
      // 相同buff". 'companion_and_owner' covers both directions in one go.
      alsoTargetRelated?: 'companion' | 'owner' | 'companion_and_owner'
      // See spd_up/spd_down's tickPhase for semantics (e.g. Huohuo's Rangming uses 'start').
      tickPhase?: 'start' | 'end'
    }
  | {
      // Spawns the caster's own companion (CharacterBattleConfig.companion) if not already present in
      // the simulation; a complete no-op if it already is — see the engine's summonCompanion(). Has no
      // targets of its own (always implicitly "the caster's own companion") and never produces an
      // Intervention/ActiveIntervention; handled as a special case in resolveAndApplyTemplates.
      type: 'summon_companion'
    }
  | {
      // Sets the target's energy to *at least* value — a no-op if already there or above. Unlike
      // energy_gain (always relative, +value), this is an absolute floor — e.g. Saber: "if energy is
      // below 216 at battle start, raise it to exactly 216". Never produces an ActiveIntervention (no
      // lingering buff state, just an instant one-time adjustment); handled as a special case in
      // resolveAndApplyTemplates, same as summon_companion.
      type: 'energy_set_minimum'
      targets: TargetType
      value: number
      fixedTargetId?: string   // See av_advance/av_delay's fixedTargetId for semantics
    }
  | {
      // Instantly and completely removes a held buff matching effectId — all its stacks at once if
      // stack-based, not a -1 decrement (see CharacterBattleConfig.basicVariants' consumesStack for that).
      // A no-op if the target doesn't hold it. e.g. Saber's skill: "consume all Reactor Core stacks at
      // once to refill energy" or "consume Mana Burst" — both need to vanish in one shot, not tick down.
      // Never produces an ActiveIntervention of its own; handled as a special case in
      // resolveAndApplyTemplates, same as summon_companion/energy_set_minimum.
      type: 'clear_buff'
      targets: TargetType
      effectId: string
      fixedTargetId?: string   // See av_advance/av_delay's fixedTargetId for semantics
    }

// Context passed to a GlobalListener's condition function — deliberately narrow (just the listening
// character's own state) rather than handing over the full engine state; widen this if a future
// character's passive needs to read something else.
export type GlobalListenerContext = {
  selfId: string
  actingCharacterId: string         // The character whose action triggered this check (may equal selfId)
  // The acting character's entity type — lets a condition exclude/require memosprites etc. (e.g.
  // Trailblazer-Remembrance E2: "除了忆灵以外", excluding memosprite actions from triggering it).
  actingCharacterType: BattleEntity['type']
  // Which ability the acting character just used — lets a condition require specific ability types
  // (e.g. Trailblazer-Remembrance E4: "释放战技/普通攻击/大招的时候", excluding follow-up actions).
  actingAbility: ActionChoice | 'ult'
  // How many hits the acting character's action actually resolved as (see CharacterBattleConfig.
  // hitCounts/basicVariants' hitCount) — lets a condition/effect scale off it, e.g. Gilgamesh: "+1 stack
  // of 本王允许你进攻 per hit, from either his or Saber's own attacks".
  hitCount: number
  activeInterventions: ActiveIntervention[]  // The listener's own active buffs
  energy: number                    // The listener's own current energy
}

// Context passed to a callback-style ability resolver (see AbilityResolver) — the caster's own live
// state at the moment this ability is about to resolve, read-only.
export type AbilityResolutionContext = {
  energy: number
  maxEnergy: number
  activeInterventions: ActiveIntervention[]
  err: number
}

// What a callback-style ability resolver returns.
export type AbilityResolution = {
  templates: InterventionTemplate[]
  // Resolved *after* this ability's own templates (and consumesStack) have fully applied, and — unlike
  // templates above — after this character's own queued next action is no longer "pending" (see
  // QueueEntry.pending): a self-targeting av_advance/pull placed here can actually succeed, whereas the
  // same effect inside `templates` above would always be a no-op (the action hasn't "been released" yet
  // from the engine's point of view). e.g. Saber: "skill that refills energy lets her act again
  // immediately" — the self-pull belongs here, not in templates.
  afterEffects?: InterventionTemplate[]
}

// An ability can be a static template list (the common case) or, when its effects genuinely depend on
// live state in a way the declarative condition/valueScaling system can't express (e.g. Saber's skill:
// "if refilling to full energy by spending all Reactor Core stacks, do that *instead of* gaining stacks"
// — a full branch between two different effect sets, not a single conditionally-scaled value), a
// resolver function computed fresh each time this ability is about to fire.
export type AbilityResolver = (ctx: AbilityResolutionContext) => AbilityResolution

// A passive that isn't tied to the owning character's own basic/skill/ult — it instead listens for
// some global battle event (currently just "any ally took an action") and conditionally fires an effect
// targeted at the listener (e.g. Huohuo's talent: while she has Rangming, any ally's action restores
// her 2 energy).
export type GlobalListener = {
  trigger: 'any_ally_action'
  condition: (ctx: GlobalListenerContext) => boolean
  // targets is typically 'self'. Can be a single template, several fired together off the same trigger/
  // condition (e.g. Saber's talent: a damage buff plus 3 separate Reactor Core stack grants, all from one
  // ult-cast reaction), or a function computed fresh from this same ctx when the effect's value genuinely
  // depends on the acting character's own state — e.g. Gilgamesh: "restore 30% of the energy *that
  // character's own Ultimate costs*" needs to look up the acting character's own ultEnergyCost, which a
  // static template can't express.
  effect: InterventionTemplate | InterventionTemplate[] | ((ctx: GlobalListenerContext) => InterventionTemplate | InterventionTemplate[])
  // Caps how many times this listener may fire within the owner's own turn cycle (e.g. Trailblazer-
  // Remembrance E2: "once per turn, resets when her own turn starts"). Omitted = unlimited.
  maxTriggersPerOwnTurn?: number
  // Only actually fires every Nth time the condition is satisfied, counted across the *whole battle*
  // (never reset, unlike maxTriggersPerOwnTurn) — e.g. Saber E6: "every 3rd ultimate cast (by anyone)
  // grants another stack". Omitted = fires every time the condition is met.
  everyNOccurrences?: number
}

// Per-character battle behaviour definition. Hand-written in battleConfigs/<Name>.ts.
// max_sp is read from game_data.json at runtime, not stored here.
// Initial energy (max_sp × 50%) is applied by the engine, not configured here.
export type CharacterBattleConfig = {
  characterId: string
  energyType: 'standard' | 'special'   // 'special' not supported in Phase 1 (e.g. Huangque)
  // Permanent SP cap bonus applied at battle start, as long as this character is in the team.
  // Engine sums spCapBonus across all configs when initialising TeamBattleState.spMax.
  // e.g. Sparkle: +3 (raises team cap from 5 to 8 permanently)
  spCapBonus?: number
  ultThreshold?: number   // 触发大招所需的最低能量，默认等于 max_sp
  ultEnergyCost?: number  // 每次释放扣除的能量，默认等于 ultThreshold；低于 max_sp 时支持部分保留能量
  // Overrides the engine's max-energy lookup (normally game_data.json's max_sp, keyed by characterId) —
  // for entities that aren't a real character in game data, e.g. a memosprite's own energyStates entry
  // (Mimi). Takes priority over the game_data lookup whenever set.
  customMaxEnergy?: number
  // Fires once at AV=0, before the first action of the battle (e.g. Huohuo: +30 energy and a 2-turn
  // Rangming buff at battle start). Goes through the same resolve/apply pipeline as abilities — just
  // triggered by battle start instead of an action.
  onBattleStart?: InterventionTemplate[]
  abilities: {
    // Each can be a static template list (the common case) or an AbilityResolver — see its doc comment
    // for when a resolver is actually needed (Saber's skill, not most characters).
    basic:      InterventionTemplate[] | AbilityResolver
    skill:      InterventionTemplate[] | AbilityResolver
    ult:        InterventionTemplate[] | AbilityResolver  // Triggered by UltInsertion, not an ActionChoice
    follow_up?: InterventionTemplate[] | AbilityResolver
  }
  // Display-only hit counts per ability (e.g. Huohuo: basic 1, skill/ult 0 — omitted entries default to
  // 0). Purely informational — this engine doesn't compute damage, so hit count has no effect on the
  // simulation itself; it only shows up on BattleEvent.hitCount for characters whose kit cares about
  // hit-count-reading effects (e.g. a multi-hit basic attacking twice).
  hitCounts?: {
    basic?: number
    skill?: number
    ult?: number
    follow_up?: number
  }
  // Alternate basic-attack templates selected when the caster currently holds a matching stack-based
  // buff, checked in order, first match wins — falls back to abilities.basic when none match (e.g.
  // Trailblazer-Remembrance: with 史诗 stacked, basic becomes the enhanced 2-hit version instead).
  basicVariants?: Array<{
    requiresEffectId: string
    templates: InterventionTemplate[]
    consumesStack?: boolean   // decrements 1 stack of the matched buff after this variant is used
    hitCount?: number         // overrides hitCounts.basic while this variant is active, e.g. 2 instead of 1
  }>
  // @deprecated Defined but never read by the engine — superseded by `companion` below. Kept only
  // because JingYuan.ts still declares one; not wired into simulateBattle.ts.
  summon?: {
    id: string
    baseSpd: number
    ownerId: string
    derivedSpd?: (ownerExtras: Record<string, number>) => number
  }
  // The non-character entity this character brings into battle alongside itself, if any. AvVisualizerTab
  // is responsible for turning this into an actual BattleEntity (with the matching `type`) when the
  // owning character is slotted in. 'memosprite' points to its own separately-registered
  // CharacterBattleConfig (own abilities, own energy) via `characterId`; 'summon'/'marker' have no
  // abilities of their own, just a speed.
  companion?: {
    type: 'memosprite' | 'summon' | 'marker'
    characterId: string   // memosprite: its own battleConfig id. summon/marker: a synthetic id, e.g. `${ownerId}_<name>`
    baseSpd: number
    derivedSpd?: (ownerExtras: Record<string, number>) => number
    // true (default) = present for the whole battle from AV=0, as before. false = not in the
    // simulation at all until a 'summon_companion' template actually spawns it (see
    // simulateBattle.ts's summonCompanion()) — for kits where the companion is genuinely summoned
    // mid-battle (e.g. Trailblazer-Remembrance's Mimi) rather than always being on the field.
    presentFromStart?: boolean
    // Companion's HP, derived from the owner's real HP breakdown — display-only (CharacterStatePanel),
    // not read by the simulation engine. companionWhiteHp = ownerWhiteHp * whiteRatio; companion's final
    // HP = companionWhiteHp * (1 + ownerHpPercentBonus) + ownerFlatHpBonus + flatBonus — i.e. the owner's
    // % HP bonus re-applies against the companion's own (scaled-down) base, the owner's flat HP bonus
    // carries over as-is, and flatBonus is the companion's own unconditional addition (e.g.
    // Trailblazer-Remembrance's Mimi: 86% white ratio + 688 flat). Every other displayed stat (ATK, CR,
    // CD, ERR, etc.) just mirrors the owner's real value directly — only HP needs its own formula.
    hpInheritance?: { whiteRatio: number; flatBonus: number }
  }
  // Fires once, right after this character's own 'summon_companion' template actually spawns the
  // companion (not on a no-op re-attempt) — for the owner's own reaction to that event (e.g.
  // Trailblazer-Remembrance: "首次召唤迷迷获得40%固定充能"). The companion's own self-effects (e.g.
  // Mimi's own 50% self-charge) belong on the companion's own onBattleStart instead — that hook already
  // fires at "whenever this entity enters the simulation", whether that's AV=0 (presentFromStart) or
  // mid-battle (dynamically summoned).
  onCompanionSummon?: InterventionTemplate[]
  // Fires whenever ANY character's (not this character's own) energy_gain is applied — converts a
  // fraction of the actual amount restored (post-ERR, post-cap) into a fixed energy gain for
  // fixedTargetId, which doesn't scale with ERR (e.g. Trailblazer-Remembrance's talent: every 10 energy
  // any ally restores converts into 1% charge for Mimi — ratioPercent: 0.1). The conversion's own
  // application (landing on fixedTargetId itself) never triggers this again, so it can't recurse.
  onAllyEnergyGain?: {
    ratioPercent: number
    fixedTargetId: string
  }
  // This character decides its own action automatically from its own live energy, instead of the user's
  // ActionNodeOverride: below max -> 'basic', at/above max -> 'skill' (e.g. Trailblazer-Remembrance's
  // Mimi: "坏人！麻烦！" while charging, "声援" once full). Also makes every energy_gain that brings this
  // character to/over its max immediately pull its next queued action to "now" (and again on any further
  // overflow gain) — see the engine's energy_gain handling in applyIntervention. Who the resulting
  // skill/ult targets is still resolved normally (single_ally + user-picked override targets, same as
  // any other character) — only the basic-vs-skill choice itself is automatic.
  autoActsOnOwnEnergy?: boolean
  // A continuously-checked passive, independent of any specific ability cast — re-evaluated after every
  // state-changing checkpoint in the whole battle (this character's own actions, any other character's,
  // manually-added interventions, battle start — see the engine's runPassiveTriggers), not just "when I
  // cast skill". e.g. Saber: "while holding Mana Burst, if energy + 8*Reactor-Core-stacks >= 360 (for
  // whatever reason that became true), consume Mana Burst, gain 1 SP, and act immediately" — this needs
  // to fire even if something other than her own Skill pushed her into that state (a manual energy grant,
  // an ally's effect, etc.), unlike AbilityResolver which only runs when this specific ability is cast.
  // effect should normally make condition stop being true once applied (e.g. by clearing the buff it
  // checks for) — there's no separate per-trigger cooldown/dedup, it simply won't re-fire until the
  // condition is freshly satisfied again. The exception is a permanently-true condition paired with an
  // idempotent replace-effect (same effectId each time) — e.g. Gilgamesh: continuously re-syncing a SPD
  // buff to "current Interest stacks * 10%" any time it's checked, harmless to recompute every time since
  // it replaces rather than stacks. A self-targeting av_advance in here is naturally a no-op while this
  // character's own action is still mid-resolution (QueueEntry.pending) — no extra guard needed for that.
  // An array because a character can have more than one independent thing to continuously check (e.g.
  // Gilgamesh: "did Interest just reach 10" and "keep my SPD buff in sync with Interest" are unrelated).
  passiveTrigger?: Array<{
    condition: (ctx: AbilityResolutionContext) => boolean
    // Can be a function computed fresh from the same ctx — e.g. Gilgamesh's SPD-sync needs to read his
    // own current stack count to decide the replacement buff's value, not just whether to fire at all.
    effect: InterventionTemplate[] | ((ctx: AbilityResolutionContext) => InterventionTemplate[])
  }>
  // An automatic, turn-less attack triggered the same way passiveTrigger is (checked at every state-
  // changing checkpoint, regardless of cause) — but unlike passiveTrigger, it's a genuine *visible*
  // action: the engine records a BattleEvent for it (turnKind: 'extra') at the triggering AV, in addition
  // to applying effect. It never touches the queue at all (no pending entry, no SPD-based scheduling, no
  // turn-based buff ticking for anyone) — see TurnKind's own doc comment for why 'extra' events are
  // immune to AV manipulation: there's simply no queue entry for av_advance/delay to ever find.
  // e.g. Gilgamesh: once his and Saber's combined hit count reaches 8 stacks of 本王允许你进攻, they
  // both get a one-off burst of effects with no turn of their own. effect is expected to invalidate its
  // own condition (e.g. by clearing the stacks it checks for), same caveat as passiveTrigger.
  extraAttack?: {
    condition: (ctx: AbilityResolutionContext) => boolean
    effect: InterventionTemplate[]
    hitCount?: number   // Display-only, mirrors CharacterBattleConfig.hitCounts for a real action.
  }
  // UI-only choice lock — when this returns 'basic'/'skill', ActionConfigPanel locks the action choice
  // selector to that single option instead of showing both, given this character's own live state right
  // before this action. Returns undefined for "no lock, both selectable" (e.g. a character that's only
  // locked some of the time). Unlike basicVariants (which changes what Basic itself resolves to while
  // still letting Skill be picked, e.g. Saber's enhanced Basic), this is for a character with no special
  // Basic variant at all who simply can't choose one of the two some of the time — e.g. Gilgamesh: locked
  // to Basic before Interest Piqued, then locked to Skill for good once it's gained — there's no "free
  // choice" state at all for him. Doesn't affect the simulation itself (same caveat as the known
  // basicVariants UI gap) — purely guides/restricts what the panel lets you pick going forward; an
  // already-saved ActionNodeOverride that no longer matches the current lock isn't auto-corrected.
  actionLock?: (ctx: AbilityResolutionContext) => ActionChoice | undefined
  extrasOnAction?: Array<{
    ability: ActionChoice | 'ult'
    patch: (currentExtras: Record<string, number>) => Record<string, number>
  }>
  globalListeners?: GlobalListener[]
  // Additive, declarative Eidolon scaling: getBattleConfig applies every patch whose minEidolon is met
  // (in ascending order) on top of the base config. Eidolons with no effect simply have no entry here.
  eidolonUpgrades?: Array<{
    minEidolon: number
    patch: (config: CharacterBattleConfig) => CharacterBattleConfig
  }>
}

// User's decision at a normal action node in the Timeline.
// Resurgence fields (Seele) are attached to the triggering normal-turn Override
// rather than being a separate structure, so no extra ID scheme is needed.
export type ActionNodeOverride = {
  characterId: string
  actionIndex: number             // 0-based index among this character's normal turns
  choice: ActionChoice
  targets?: string[]              // Resolved target characterIds for single_ally effects
  triggerResurgence?: boolean     // Seele: insert a TurnKind 'extra' turn after this action
  resurgenceChoice?: ActionChoice // Action for the extra turn (defaults to 'basic')
  resurgenceTargets?: string[]    // Targets for the extra turn if single_ally
}

// Where in the timeline to insert an ultimate.
// Mirrors the existing before/after intervention timing model.
export type UltTiming =
  | { type: 'during_action'; charId: string; actionIndex: number }
  | { type: 'after_action';  charId: string; actionIndex: number }
  | { type: 'at_av';         av: number }

// An ultimate insertion request stored in the session.
// The engine validates caster energy >= ultThreshold (or max_sp if omitted) before producing a BattleEvent.
export type UltInsertion = {
  id: string
  casterId: string
  timing: UltTiming
  targets?: string[]
  // Same meaning as Intervention.afterItemId — lets an Ult be spliced immediately after a specific
  // Intervention sharing the same anchor, instead of only ever being ordered relative to other Ults via
  // ultInsertions' own array position (the legacy default, still used whenever this is unset).
  afterItemId?: string
}

// Carried over from the previous Wave's cut point (混沌回忆换面) — persistent resources (energy/buffs/
// team SP) that survive a wave transition, used as the next Wave's starting state INSTEAD of the normal
// onBattleStart baseline. See simulateBattle's seedState param and useAVVisualTabStore's Wave.seedState.
export type WaveSeedState = {
  energyByChar: Record<string, number>
  activeInterventionsByChar: Record<string, ActiveIntervention[]>
  teamSp: { sp: number; spMax: number }
}

// A currently active effect that is ticking down, stored in CharacterBattleState.
// buffKind is required (not optional) because runtime state must have a determined tick basis.
export type ActiveIntervention = {
  id: string
  sourceCharacterId: string
  sourceAbility: ActionChoice | 'ult' | 'external'  // 'external' = manually added Intervention
  type: InterventionType
  stat?: string
  value: number
  unit: 'flat' | 'percent'
  remainingTurns: number
  buffKind: 'direct' | 'aura'    // direct: tick on receiver's turn; aura: tick on caster's turn
  // See InterventionTemplate's tickPhase. Defaults to 'end' (ticks after the holder's whole turn is
  // done) when omitted — 'start' (ticks before the holder's own turn does anything) is the exception,
  // used by e.g. Huohuo's Rangming.
  tickPhase?: 'start' | 'end'
  auraTargets?: 'all_allies' | 'all_enemies'
  effectId?: string              // See InterventionTemplate's effectId — used to replace-not-stack on re-apply
  auraEffect?: {
    type: InterventionType
    stat?: string
    value: number
    unit: 'flat' | 'percent'
  }
  // Stack-based buff (see InterventionTemplate's stackable): present only on stack-based buffs, which
  // are never expired by remainingTurns ticking — only by explicit consumption decrementing stacks to 0.
  stacks?: number
  maxStacks?: number
}

// Complete state snapshot of a single entity (character or summon) at a point in time.
// Stored in BattleEvent.stateBefore / stateAfter for checkpoint-based re-simulation.
export type CharacterBattleState = {
  energy: number
  spd: number                              // Current effective speed (including SPD buffs)
  activeInterventions: ActiveIntervention[]
  extras: Record<string, number>           // Character-specific state; 0 = inactive
}

// Snapshot of the team-shared Skill Point pool at a point in time.
// spMax defaults to 5; temporarily raised by effects like Sparkle ult (sp_cap_up).
export type TeamBattleState = {
  sp: number
  spMax: number
}

// Unified entity type for the simulation queue and Timeline rows.
// Replaces TimelineCharacter (which was defined locally in Timeline.tsx).
// 'character': a real character, full participation (own energy, own buffs, own abilities, targetable).
// 'memosprite': owner's summoned "near-character" companion (e.g. Trailblazer Remembrance's Mimi) — full
//   participation just like a character (own energy, own independent buffs, own abilities via its own
//   CharacterBattleConfig registered under its own id, targetable by other characters' abilities).
// 'summon': a pure attack-vehicle (e.g. Lightning-Lord) — runs its own AV cycle and can be sped up/down
//   or AV-advanced/delayed, but has no energy and no independent buffs (mirrors the owner's buffs), and
//   is never a valid ability target.
// 'marker': a position-only timeline marker (e.g. an ult-duration tracker) — runs its own AV cycle off
//   a fixed speed, nothing else; no energy, no buffs, not targetable.
export type BattleEntityType = 'character' | 'memosprite' | 'summon' | 'marker'

export type BattleEntity = {
  id: string
  type: BattleEntityType
  ownerId?: string    // memosprite/summon/marker only: points to the owning character's id
  name: string
  baseSpd: number     // Speed without buffs; needed for percent-based SPD buff math
  spd: number         // Current effective speed
  err: number         // Energy Regeneration Rate bonus, e.g. 0.185 for +18.5%; 0 if unreadable/unset
  eidolon: number      // Eidolon level (0-6); drives CharacterBattleConfig.eidolonUpgrades
  // This character's real Crit DMG stat (fraction, e.g. 1.5 for 150%), read from their actual build —
  // undefined/0 if unreadable/unset. Only meaningful as a *simulation* input for effects whose value
  // scales off the caster's own CD (InterventionTemplate's casterStatScaling) — e.g. Mimi's "伙伴！一起！",
  // which scales off Trailblazer-Remembrance's CD and is copied onto Mimi's own companion entity at summon
  // time (see summonCompanion). Display-only stat panels (CharacterStatePanel) compute this live
  // themselves instead of reading this field.
  cd?: number
  color: string
  slotIndex: number
}

// Primary output type of the simulation engine.
// Replaces SimEvent. stateBefore/stateAfter and team fields are placeholder empty objects
// until the engine is extended in Step 3 (simulateBattle.ts).
export type BattleEvent = {
  av: number
  characterId: string
  actionIndex: number
  effectiveSpd: number
  turnKind: TurnKind
  actionChoice: ActionChoice | 'ult'
  stateBefore: Record<string, CharacterBattleState>
  stateAfter: Record<string, CharacterBattleState>
  teamStateBefore: TeamBattleState
  teamStateAfter: TeamBattleState
  ultInsertionId?: string   // set for turnKind='ult' events; links back to the UltInsertion that produced this event
  damageResult?: number
  damageStale?: boolean
  // Display-only — see CharacterBattleConfig.hitCounts. Omitted for non-acting entities (summon/marker).
  hitCount?: number
}
