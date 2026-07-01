import { getGameMetadata } from 'lib/state/gameMetadata'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { mergeChainedOrder } from 'lib/tabs/tabAvVisualizer/chainOrder'
import type {
  AbilityResolution,
  ActionChoice,
  ActionNodeOverride,
  ActiveIntervention,
  BattleEntity,
  BattleEvent,
  CharacterBattleState,
  GlobalListenerContext,
  Intervention,
  InterventionTemplate,
  TargetType,
  TeamBattleState,
  TemplateCondition,
  TurnKind,
  UltInsertion,
  WaveSeedState,
} from 'lib/tabs/tabAvVisualizer/types'
import { uuid } from 'lib/utils/miscUtils'
import type { CharacterId } from 'types/character'

// ---- Internal types (mirrors simulateTimeline.ts) ----

// SpdBuff is always stored internally as a flat delta (percent is converted to flat against the white value when applied)
// id links back to the ActiveIntervention in activeBuffsMap for synchronized removal on aura expiry.
// aura buffs use remainingTurns: Number.MAX_SAFE_INTEGER so they never expire via the target's own tick;
// expiry is driven by the caster's activeBuffsMap entry in the main loop (Step B).
type SpdBuff = {
  id: string
  delta: number
  remainingTurns: number
  buffKind: 'direct' | 'aura'
  casterId: string  // direct: same as targetId; aura: the caster's id
  // See InterventionTemplate's tickPhase. Defaults to 'end' when omitted.
  tickPhase?: 'start' | 'end'
}

// Tracks a temporary SP cap change (sp_cap_up/sp_cap_down with durationTurns > 0).
// restoreDelta is applied to spMax when the effect expires (reversal of the original delta).
type SpCapChange = {
  id: string
  restoreDelta: number
  remainingTurns: number
}

type TeamStateInternal = {
  sp: number
  spMax: number
  spCapChanges: SpCapChange[]
}

type CharState = {
  panelSpd: number  // Panel speed including relics, used to compute effective speed
  whiteSpd: number  // White value, used to convert percent buffs
  spdBuffs: SpdBuff[]
}

type QueueEntry = {
  av: number
  originalAv?: number  // Original AV before being modified by av_advance (used for the same-AV sort tiebreaker)
  characterId: string
  actionIndex: number
  // True from the moment this entry is pushed (right as its owner's turn begins) until that same turn
  // fully finishes (during-action ults, own templates, listeners, after-action ults all resolved) — see
  // the main loop's end-of-turn handling. Marks "this is my own not-yet-finalized future turn, occupied
  // while my current turn is still in progress" — nothing happening during that current turn can advance
  // or snap this entry, since there's no meaningful sense of "earlier" relative to a turn that's already
  // underway. Buff/AV effects targeting *other* characters' entries are unaffected either way.
  pending?: boolean
}

// err: this character's Energy Regeneration Rate bonus fraction (e.g. 0.185 for +18.5%), used to scale
// energy_gain/energy_loss effects where the InterventionTemplate has scalesWithErr !== false.
// eidolon: this character's Eidolon level (0-6), passed to getBattleConfig so CharacterBattleConfig.
// eidolonUpgrades can conditionally patch in higher-Eidolon effects.
// cd: this character's real Crit DMG (see BattleEntity.cd) — only read by InterventionTemplate's
// casterStatScaling.
// maxEnergy is the real hard cap used to clamp energy (e.g. Saber: 480/560, including her overflow-style
// mechanic) — percentBasis is the "real 100%" reference percent-based energy_gain/loss effects (e.g.
// Huohuo's Ult: "restore 20% energy") compute their delta against instead. These differ specifically for
// overflow-style characters; ultThreshold ?? maxEnergy for everyone else (where they're the same number).
type EnergyState = { energy: number; maxEnergy: number; percentBasis: number; err: number; eidolon: number; cd?: number }

// ---- Public output types ----

export type EnergyCheckpoint = {
  av: number
  energyMap: Record<string, number>
}

export type SimulationResult = {
  events: BattleEvent[]
  energyTimeline: EnergyCheckpoint[]
  // Buffs right after onBattleStart resolves, before any action — mirrors energyTimeline's own av=0
  // checkpoint, but for buffs: onBattleStart never produces a BattleEvent (no stateAfter snapshot), so
  // without this there's no way to know a character's buffs at the very start of the battle until their
  // own first action actually happens (e.g. Saber's Reactor Core stacks from her talent/technique
  // wouldn't show up on an energy bar reading "buffs as of the playhead" until her first turn).
  initialActiveInterventions: Record<string, ActiveIntervention[]>
  // Per-character state right after a specific chained item (a Ult OR a manually-added Intervention,
  // sharing an anchor with afterItemId — see chainOrder.ts) resolved, keyed by that item's own id. Lets
  // the UI ("+" buttons in ActionDisplayPanel, used as RightPanelContext's insertAfterId) look up the
  // exact baseline for whatever it's inserting right after, regardless of whether the preceding item was
  // a Ult (which already produces its own BattleEvent.stateAfter) or an Intervention (which doesn't
  // produce any event at all otherwise — this is the only place its post-resolution state is recorded).
  chainSnapshots: Record<string, Record<string, CharacterBattleState>>
}

// ---- Internal helpers (mirrors simulateTimeline.ts) ----

function computeEffectiveSpd(state: CharState): number {
  const buffTotal = state.spdBuffs.reduce((sum, b) => sum + b.delta, 0)
  return Math.max(state.panelSpd + buffTotal, 1)
}

// Primary key: av ascending; on a tie, the smaller originalAv (pre-pull position) acts first
function sortQueue(queue: QueueEntry[]): void {
  queue.sort((a, b) => {
    if (a.av !== b.av) return a.av - b.av
    return (a.originalAv ?? a.av) - (b.originalAv ?? b.av)
  })
}

// Ticks every direct SPD buff (CharState.spdBuffs) and activeBuffsMap entry belonging to characterId
// whose tickPhase matches the given phase — defaulting to 'end' when a buff doesn't specify one (see
// InterventionTemplate's tickPhase). Called twice per turn from the main loop: once with phase='start'
// right as the turn begins (before this turn's own choice/effects resolve — e.g. Huohuo's Rangming, which
// should already be gone for this turn if it would expire now), and once with phase='end' once the whole
// turn (during-action ults, own effects, listeners, after-action effects) is fully done (the default for
// everything else — still fully active through its last turn, gone starting the next one).
//
// existingIds, when given, restricts ticking to buffs that already existed *before* this same call's
// triggering moment — used for the 'end' pass so a buff freshly granted during this very turn (e.g. by
// an "after this action" effect) doesn't immediately lose a turn of its own nominal duration; it gets its
// first real tick at the next turn's end instead, same as any buff that's actually lived through a turn.
function tickBuffsForCharacter(
  characterId: string,
  phase: 'start' | 'end',
  av: number,
  charStates: Map<string, CharState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  queue: QueueEntry[],
  existingIds?: Set<string>,
): void {
  const matchesPhase = (b: { tickPhase?: 'start' | 'end'; id: string }) =>
    (b.tickPhase ?? 'end') === phase && (!existingIds || existingIds.has(b.id))

  const state = charStates.get(characterId)
  if (state) {
    state.spdBuffs = state.spdBuffs
      .map((b) => (b.buffKind === 'direct' && matchesPhase(b)) ? { ...b, remainingTurns: b.remainingTurns - 1 } : b)
      .filter((b) => b.buffKind !== 'direct' || !matchesPhase(b) || b.remainingTurns > 0)
  }

  const myActive = activeBuffsMap.get(characterId) ?? []
  const afterTickActive = myActive.map((a) => matchesPhase(a) ? { ...a, remainingTurns: a.remainingTurns - 1 } : a)
  const expiredActive = afterTickActive.filter((a) => matchesPhase(a) && a.remainingTurns <= 0)
  activeBuffsMap.set(characterId, afterTickActive.filter((a) => !matchesPhase(a) || a.remainingTurns > 0))

  for (const expired of expiredActive) {
    if (expired.buffKind !== 'aura') continue

    // Remove the display-only mirror entry (see applyIntervention's aura registration) from every
    // target's activeBuffsMap — applies to all aura types, not just spd_up/down.
    for (const [charId, list] of activeBuffsMap) {
      if (charId === characterId) continue
      const filtered = list.filter((b) => b.id !== expired.id)
      if (filtered.length !== list.length) activeBuffsMap.set(charId, filtered)
    }

    if (expired.type !== 'spd_up' && expired.type !== 'spd_down') continue

    // Remove the SpdBuff from every target that holds it and apply reverse gauge conservation
    for (const [charId, charState] of charStates) {
      const auraBuffInTarget = charState.spdBuffs.find((b) => b.id === expired.id)
      if (!auraBuffInTarget) continue

      const oldSpd = computeEffectiveSpd(charState)
      charState.spdBuffs = charState.spdBuffs.filter((b) => b.id !== expired.id)
      const newSpd = computeEffectiveSpd(charState)

      if (oldSpd !== newSpd) {
        const targetEntry = queue.find((e) => e.characterId === charId)
        if (targetEntry && targetEntry.av > av) {
          const gaugeDistance = (targetEntry.av - av) * oldSpd
          targetEntry.av = av + gaugeDistance / newSpd
        }
      }
    }
  }

  sortQueue(queue)
}

// Removes any existing ActiveIntervention on `ownerId` sharing `effectId` (and its linked SpdBuff entries,
// found by the same `id` across all characters — aura SpdBuffs are spread across every affected target's
// spdBuffs array) so a fresh one can be pushed in its place. This is what makes re-applying an effect with
// the same effectId "refresh the duration" instead of stacking a second independent buff instance.
function purgeActiveBuffByEffectId(
  effectId: string,
  ownerId: string,
  activeBuffsMap: Map<string, ActiveIntervention[]> | undefined,
  charStates: Map<string, CharState>,
): void {
  const list = activeBuffsMap?.get(ownerId)
  if (!list) return
  const idx = list.findIndex((b) => b.effectId === effectId)
  if (idx === -1) return
  const [removed] = list.splice(idx, 1)
  for (const cs of charStates.values()) {
    cs.spdBuffs = cs.spdBuffs.filter((b) => b.id !== removed.id)
  }
}

// Exclusive buff (InterventionTemplate.exclusiveEffectId): this effectId may only be held by ONE
// character at a time, anywhere on the field — unlike the regular per-owner purge above, scan every
// owner's list (e.g. Mimi's 声援 buff moving from one ally to another strips it from the old holder).
function purgeActiveBuffByEffectIdGlobal(
  effectId: string,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  charStates: Map<string, CharState>,
): void {
  for (const ownerId of activeBuffsMap.keys()) {
    purgeActiveBuffByEffectId(effectId, ownerId, activeBuffsMap, charStates)
  }
}

// Stack-based buff (InterventionTemplate.stackable): finds an existing buff sharing this effectId on
// the target and increments its stacks (clamped to maxStacks) instead of replacing it; creates a fresh
// stacks:1 entry if none exists yet. Uses remainingTurns: Infinity (same trick as permanent eidolon
// buffs) since stack-based buffs are never expired by turn count — only by explicit consumption.
function applyStackableBuff(
  targetId: string,
  iv: Intervention,
  casterId: string | undefined,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
): void {
  if (!iv.stackable || !iv.effectId) return
  const list = activeBuffsMap.get(targetId) ?? []
  const existingIdx = list.findIndex((b) => b.effectId === iv.effectId)
  if (existingIdx !== -1) {
    // Replace with a fresh object (never mutate in place) — an already-captured stateAfter snapshot
    // elsewhere may still be holding a reference to the old one (snapshotStates only shallow-copies the
    // array), and mutating it would retroactively change what that earlier snapshot reports.
    const existing = list[existingIdx]
    const updated = { ...existing, stacks: Math.min(iv.stackable.maxStacks, (existing.stacks ?? 0) + 1) }
    activeBuffsMap.set(targetId, list.map((b, i) => i === existingIdx ? updated : b))
    return
  }
  list.push({
    id: iv.id,
    sourceCharacterId: casterId ?? targetId,
    sourceAbility: 'external',
    type: iv.type,
    stat: iv.stat,
    value: iv.value,
    unit: iv.unit,
    remainingTurns: Number.POSITIVE_INFINITY,
    buffKind: 'direct',
    effectId: iv.effectId,
    stacks: 1,
    maxStacks: iv.stackable.maxStacks,
  })
  activeBuffsMap.set(targetId, list)
}

// Consumes 1 stack of a stack-based buff (CharacterBattleConfig.basicVariants' consumesStack) — removes
// the buff entirely once its stacks reach 0.
function consumeStack(
  ownerId: string,
  effectId: string,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
): void {
  const list = activeBuffsMap.get(ownerId)
  if (!list) return
  const entry = list.find((b) => b.effectId === effectId)
  if (!entry || entry.stacks === undefined) return
  // Never mutate in place (see applyStackableBuff) — an already-captured stateAfter snapshot elsewhere
  // may still reference this same object.
  const newStacks = entry.stacks - 1
  activeBuffsMap.set(
    ownerId,
    newStacks <= 0
      ? list.filter((b) => b !== entry)
      : list.map((b) => b === entry ? { ...b, stacks: newStacks } : b),
  )
}

// Spawns ownerId's own companion (CharacterBattleConfig.companion) into the live simulation state if it
// isn't already present — a complete no-op otherwise (returns null). Mutates the existing Maps/array in
// place (.set()/.push(), never reassigns) so every function already holding these references sees the
// new entity immediately, without needing to thread a "live" container through the whole call chain.
// Returns the spawned companion's id on a real spawn, so the caller can fire its onBattleStart/the
// owner's onCompanionSummon — or null if it was a no-op.
function summonCompanion(
  ownerId: string,
  triggerAv: number,
  charStates: Map<string, CharState>,
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  queue: QueueEntry[],
  targetableIds: string[],
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): string | null {
  const companion = getBattleConfig(ownerId)?.companion
  if (!companion) return null
  if (entityTypeById.has(companion.characterId)) return null   // already present — no-op

  entityTypeById.set(companion.characterId, companion.type)
  charStates.set(companion.characterId, { panelSpd: companion.baseSpd, whiteSpd: companion.baseSpd, spdBuffs: [] })

  if (companion.type === 'memosprite') {
    const ownerEnergy = energyStates.get(ownerId)
    const companionConfig = getBattleConfig(companion.characterId)
    const maxEnergy = companionConfig?.customMaxEnergy ?? 100
    const percentBasis = companionConfig?.ultThreshold ?? maxEnergy
    energyStates.set(companion.characterId, {
      energy: 0, maxEnergy, percentBasis, err: ownerEnergy?.err ?? 0, eidolon: ownerEnergy?.eidolon ?? 0, cd: ownerEnergy?.cd ?? 0,
    })
    activeBuffsMap.set(companion.characterId, [])
    targetableIds.push(companion.characterId)
    companionIdByOwnerId.set(ownerId, companion.characterId)
    ownerIdByCompanionId.set(companion.characterId, ownerId)
  }

  queue.push({ av: triggerAv + 10000 / companion.baseSpd, characterId: companion.characterId, actionIndex: 0 })
  sortQueue(queue)
  return companion.characterId
}

// autoActsOnOwnEnergy: pulls characterId's next queued action to right now if it isn't already due
// sooner — used both for a character maxed by its own direct energy_gain, and one maxed indirectly via
// another character's onAllyEnergyGain conversion (e.g. Mimi, charged off Trailblazer's talent).
function pullToFrontIfMaxed(characterId: string, av: number, queue: QueueEntry[]): void {
  const queueEntry = queue.find((e) => e.characterId === characterId)
  // A pending entry belongs to a turn that's still being resolved right now (see QueueEntry.pending) —
  // there's no meaningful "earlier" relative to a turn already underway, so it's left alone here. Its
  // own end-of-turn handling re-checks autoActsOnOwnEnergy once the turn is fully done anyway.
  if (queueEntry && !queueEntry.pending && queueEntry.av > av) {
    queueEntry.av = av
    sortQueue(queue)
  }
}

function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
  activeBuffsMap?: Map<string, ActiveIntervention[]>,
  casterId?: string,
  teamState?: TeamStateInternal,
): void {
  // SP instant effects: team resource, no charStates/queue involvement, early return
  if (iv.type === 'sp_gain' || iv.type === 'sp_loss') {
    if (teamState) {
      const delta = iv.value
      teamState.sp = iv.type === 'sp_gain'
        ? Math.min(teamState.spMax, teamState.sp + delta)
        : Math.max(0, teamState.sp - delta)
    }
    return
  }

  // SP cap effects: adjust spMax and track reversal via spCapChanges
  if (iv.type === 'sp_cap_up' || iv.type === 'sp_cap_down') {
    if (teamState) {
      const delta = iv.type === 'sp_cap_up' ? iv.value : -iv.value
      teamState.spMax += delta
      if (iv.durationTurns > 0) {
        teamState.spCapChanges.push({ id: iv.id, restoreDelta: -delta, remainingTurns: iv.durationTurns })
      }
      if (delta < 0) {
        // cap decrease: clamp current SP to new max
        teamState.sp = Math.min(teamState.sp, teamState.spMax)
      }
    }
    return
  }

  const buffKind = iv.buffKind ?? 'direct'

  // For spd_up/down, snapshot each target's effective speed BEFORE the effectId purge below — purging
  // removes the old buff first, which would otherwise make a same-value refresh look like a fresh speed
  // change (oldSpd computed post-purge = unbuffed) and trigger a spurious AV gauge adjustment every time
  // an already-active buff (e.g. an aura re-granted by a later cast) is simply refreshed in place.
  const preApplySpd = (iv.type === 'spd_up' || iv.type === 'spd_down')
    ? new Map(iv.targets.map((id) => {
        const cs = charStates.get(id)
        return [id, cs ? computeEffectiveSpd(cs) : 0] as const
      }))
    : null

  // Replace-not-stack: clear out any existing buff sharing this effectId before applying the new one, so
  // re-triggering the same named effect (possibly from a different ability) refreshes it in place.
  // Stack-based buffs (iv.stackable) skip this entirely — applyStackableBuff increments in place instead
  // of purge-then-reapply, further down in the per-target loop.
  if (iv.effectId && !iv.stackable) {
    if (iv.exclusiveEffectId && activeBuffsMap) {
      // Held by at most one character anywhere on the field — purge every owner, not just this target.
      purgeActiveBuffByEffectIdGlobal(iv.effectId, activeBuffsMap, charStates)
    } else if (buffKind === 'aura' && casterId) {
      purgeActiveBuffByEffectId(iv.effectId, casterId, activeBuffsMap, charStates)
      for (const targetId of iv.targets) {
        if (targetId !== casterId) purgeActiveBuffByEffectId(iv.effectId, targetId, activeBuffsMap, charStates)
      }
    } else if (buffKind === 'direct') {
      for (const targetId of iv.targets) {
        purgeActiveBuffByEffectId(iv.effectId, targetId, activeBuffsMap, charStates)
      }
    }
  }

  // Aura buff: register ONE "master" entry on the caster's activeBuffsMap before the per-target loop —
  // this drives the real tick/expiry (Step B in the main loop) and display in the caster's own panel.
  // Also mirror it onto every affected target's activeBuffsMap, purely so their CharacterStatePanel can
  // show the buff exists — the mirror is never ticked independently (CharacterStatePanel hides its
  // remainingTurns since it isn't meaningful there); it's removed in sync when the master expires.
  if (
    activeBuffsMap && casterId && buffKind === 'aura' && iv.targets.length > 0
    && (iv.type === 'spd_up' || iv.type === 'spd_down' || iv.type === 'stat_buff' || iv.type === 'stat_debuff')
  ) {
    const masterEntry: ActiveIntervention = {
      id: iv.id,
      sourceCharacterId: casterId,
      sourceAbility: 'external',
      type: iv.type,
      stat: iv.stat,
      value: iv.value,
      unit: iv.unit,
      remainingTurns: iv.durationTurns,
      buffKind: 'aura',
      tickPhase: iv.tickPhase,
      auraTargets: iv.auraTargets,
      effectId: iv.effectId,
    }
    activeBuffsMap.set(casterId, [...(activeBuffsMap.get(casterId) ?? []), masterEntry])

    for (const targetId of iv.targets) {
      if (targetId === casterId) continue
      // Sentinel remainingTurns, same trick SpdBuff aura entries already use: prevents Step B's generic
      // per-owner tick (which would run on the *target's* own turns) from decrementing/expiring this
      // mirror independently of the master — it only ever gets removed by the master's expiry cleanup.
      activeBuffsMap.set(targetId, [
        ...(activeBuffsMap.get(targetId) ?? []),
        { ...masterEntry, remainingTurns: Number.MAX_SAFE_INTEGER },
      ])
    }
  }

  for (const targetId of iv.targets) {
    const targetState = charStates.get(targetId)
    if (!targetState) continue

    if (iv.type === 'spd_up' || iv.type === 'spd_down') {
      const flatDelta = iv.unit === 'flat'
        ? iv.value
        : targetState.whiteSpd * (iv.value / 100)
      const delta = iv.type === 'spd_up' ? flatDelta : -flatDelta
      const effectiveCasterId = buffKind === 'aura' && casterId ? casterId : targetId

      const oldSpd = preApplySpd?.get(targetId) ?? computeEffectiveSpd(targetState)
      const newBuff: SpdBuff = {
        id: iv.id,
        delta,
        // Aura buffs never expire via the target's tick; sentinel prevents filter from removing them.
        remainingTurns: buffKind === 'aura' ? Number.MAX_SAFE_INTEGER : iv.durationTurns,
        buffKind,
        casterId: effectiveCasterId,
        tickPhase: iv.tickPhase,
      }
      targetState.spdBuffs.push(newBuff)
      const newSpd = computeEffectiveSpd(targetState)

      const targetEntry = queue.find((e) => e.characterId === targetId)
      let displayRemainingTurns = iv.durationTurns

      if (targetEntry) {
        const remainingAv = targetEntry.av - iv.triggerAv
        if (remainingAv >= 0) {
          if (remainingAv > 0 && oldSpd !== newSpd) {
            const gaugeDistance = remainingAv * oldSpd
            targetEntry.av = iv.triggerAv + gaugeDistance / newSpd
          }
          // Immediate tick on apply: only for direct, 'start'-phase buffs (aura turns count on caster's
          // actions; 'end'-phase buffs are about lasting through a *complete future* turn of the
          // holder's, not partial-AV-window accounting at apply time, so they're left untouched here —
          // they only ever tick via the end-of-turn pass).
          if (buffKind !== 'aura' && (iv.tickPhase ?? 'end') === 'start') {
            newBuff.remainingTurns -= 1
            displayRemainingTurns -= 1
            if (newBuff.remainingTurns <= 0) {
              targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
            }
          }
        }
      }

      // Direct SPD buff: register per-target entry (aura already registered before loop)
      if (activeBuffsMap && buffKind === 'direct' && displayRemainingTurns > 0) {
        const list = activeBuffsMap.get(targetId) ?? []
        list.push({
          id: iv.id,
          sourceCharacterId: casterId ?? targetId,
          sourceAbility: 'external',
          type: iv.type,
          value: iv.value,
          unit: iv.unit,
          remainingTurns: displayRemainingTurns,
          buffKind: 'direct',
          tickPhase: iv.tickPhase,
          auraTargets: iv.auraTargets,
          effectId: iv.effectId,
        })
        activeBuffsMap.set(targetId, list)
      }
    } else if (iv.type === 'energy_gain' || iv.type === 'energy_loss') {
      const energyTarget = energyStates?.get(targetId)
      if (!energyTarget) continue
      const errMultiplier = iv.scalesWithErr === false ? 1 : 1 + energyTarget.err
      // percentBasis, not maxEnergy — see EnergyState's own doc comment (an overflow-style character's
      // real hard cap shouldn't inflate what "100%" means for an external ability's percent restoration).
      const delta = (iv.unit === 'percent'
        ? energyTarget.percentBasis * (iv.value / 100)
        : iv.value) * errMultiplier
      const energyBefore = energyTarget.energy
      energyTarget.energy = iv.type === 'energy_gain'
        ? Math.min(energyTarget.maxEnergy, energyTarget.energy + delta)
        : Math.max(0, energyTarget.energy - delta)

      // Talent-style energy-gain-conversion hooks (e.g. Trailblazer-Remembrance: every point of energy
      // any ally actually restores converts a fraction into Mimi's own charge) — based on the real
      // amount applied (post-ERR, post-cap), not the nominal delta. Skipped for energy_loss, and for the
      // conversion's own application (landing on fixedTargetId itself) so it can't double-count.
      if (iv.type === 'energy_gain' && energyStates) {
        const actualGain = energyTarget.energy - energyBefore
        if (actualGain > 0) {
          for (const ownerId of energyStates.keys()) {
            const hook = getBattleConfig(ownerId)?.onAllyEnergyGain
            if (!hook || targetId === hook.fixedTargetId) continue
            const hookTarget = energyStates.get(hook.fixedTargetId)
            if (!hookTarget) continue
            const bonusPercent = actualGain * hook.ratioPercent
            hookTarget.energy = Math.min(
              hookTarget.maxEnergy, hookTarget.energy + hookTarget.maxEnergy * bonusPercent / 100,
            )

            // autoActsOnOwnEnergy: this conversion can max out the hook's target (e.g. Mimi) even though
            // the energy_gain itself targeted someone else entirely — the pull-to-front check below only
            // looks at targetId, so it'd otherwise miss this indirect case. pullToFrontIfMaxed itself
            // skips a pending entry (see QueueEntry.pending), so a reflection landing while the hook's
            // target is mid-resolving her own turn (e.g. another character's "any ally acts" listener
            // firing before her own self-reset runs) correctly falls through as a no-op.
            if (getBattleConfig(hook.fixedTargetId)?.autoActsOnOwnEnergy && hookTarget.energy >= hookTarget.maxEnergy) {
              pullToFrontIfMaxed(hook.fixedTargetId, iv.triggerAv, queue)
            }
          }
        }
      }

      // autoActsOnOwnEnergy: reaching (or, on a later overflow gain, still being at) max energy
      // immediately pulls this character's next queued action to right now — e.g. Mimi: "当迷迷充能
      //达到100%的时候迷迷会被100%拉条，继续获得能量时也会再次被拉条". Runs on every energy_gain that
      // resolves at/above the cap, not just the first crossing.
      if (iv.type === 'energy_gain' && getBattleConfig(targetId)?.autoActsOnOwnEnergy && energyTarget.energy >= energyTarget.maxEnergy) {
        pullToFrontIfMaxed(targetId, iv.triggerAv, queue)
      }
    } else if (iv.type === 'stat_buff' || iv.type === 'stat_debuff') {
      // Aura stat buff: already registered on caster before the loop; no per-target AV state to update.
      // Direct stat buff: register per-target entry; no AV/energy effect.
      if (activeBuffsMap && buffKind === 'direct') {
        if (iv.stackable) {
          applyStackableBuff(targetId, iv, casterId, activeBuffsMap)
        } else {
          const list = activeBuffsMap.get(targetId) ?? []
          list.push({
            id: iv.id,
            sourceCharacterId: casterId ?? targetId,
            sourceAbility: 'external',
            type: iv.type,
            stat: iv.stat,
            value: iv.value,
            unit: iv.unit,
            remainingTurns: iv.durationTurns,
            buffKind: 'direct',
            tickPhase: iv.tickPhase,
            effectId: iv.effectId,
          })
          activeBuffsMap.set(targetId, list)
        }
      }
    } else {
      // av_advance / av_delay: directly modify the target's next-action AV in the queue. Skipped for a
      // pending entry (see QueueEntry.pending) — that's the target's own turn, still being resolved
      // right now; there's no meaningful "earlier/later" relative to a turn that's already underway.
      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry && !targetEntry.pending) {
        const maxInterval = 10000 / computeEffectiveSpd(targetState)
        const delta = iv.unit === 'flat'
          ? iv.value
          : maxInterval * (iv.value / 100)

        const oldAv = targetEntry.av
        targetEntry.av = iv.type === 'av_advance'
          ? Math.max(iv.triggerAv, targetEntry.av - delta)
          : targetEntry.av + delta

        if (iv.type === 'av_advance' && targetEntry.av < oldAv) {
          targetEntry.originalAv = oldAv
        }
      }
    }
  }

  sortQueue(queue)
}

// ---- Step 3: template expansion helpers ----

function resolveTargets(
  targetType: TargetType,
  casterId: string,
  allCharacterIds: string[],
  overrideTargets: string[] | undefined,
  ownerIdByCompanionId: Map<string, string>,
): string[] {
  switch (targetType) {
    case 'self':                      return [casterId]
    case 'all_allies':                return allCharacterIds
    case 'all_allies_except_self':    return allCharacterIds.filter((id) => id !== casterId)
    case 'single_ally':
    case 'single_ally_or_self':       return overrideTargets ?? []
    case 'owner': {
      const ownerId = ownerIdByCompanionId.get(casterId)
      return ownerId ? [ownerId] : []
    }
    default:                          return []  // enemy targets and 'team' (SP): skipped in Step 3
  }
}

// 'maxEnergy' reads static game metadata; 'currentEnergy' reads the live EnergyState.
function readConditionMetric(
  condition: TemplateCondition,
  id: string,
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): number {
  if (condition.metric === 'entityPresent') return entityTypeById.has(id) ? 1 : 0
  if (condition.metric === 'maxEnergy') return getGameMetadata().characters?.[id as CharacterId]?.max_sp ?? 0
  if (condition.metric === 'buffStacks') {
    const buff = activeBuffsMap.get(id)?.find((b) => b.effectId === condition.effectId)
    if (!buff) return 0
    return buff.stacks ?? 1   // held but not stack-based: "present" reads as 1, same as entityPresent
  }
  return energyStates.get(id)?.energy ?? 0
}

function evaluateCondition(
  condition: TemplateCondition,
  id: string,
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): boolean {
  const metricValue = readConditionMetric(condition, id, energyStates, activeBuffsMap, entityTypeById)
  switch (condition.operator) {
    case 'gte': return metricValue >= condition.value
    case 'lte': return metricValue <= condition.value
    case 'gt':  return metricValue > condition.value
    case 'lt':  return metricValue < condition.value
    case 'eq':  return metricValue === condition.value
  }
}

// Narrows resolvedTargets down to only those satisfying the template's condition (if any). No condition
// = no filtering.
function filterByCondition(
  resolvedTargets: string[],
  condition: TemplateCondition | undefined,
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): string[] {
  if (!condition) return resolvedTargets
  return resolvedTargets.filter((id) => evaluateCondition(condition, id, energyStates, activeBuffsMap, entityTypeById))
}

// Computes a stat_buff/stat_debuff template's final value for one specific target, applying
// valueScaling (if present) on top of the template's base value — e.g. Mimi's 声援: +2% per 10 points
// of the target's max energy over 100, capped at +20%, plus an eidolon-gated extra bonus (E4: +6% if
// the target's max energy is 0). Evaluated once, at apply time — not re-evaluated later.
function computeScaledStatValue(
  template: InterventionTemplate & { type: 'stat_buff' | 'stat_debuff' },
  targetId: string,
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): number {
  const scaling = template.valueScaling
  if (!scaling) return template.value
  const metricValue = readConditionMetric({ metric: scaling.metric, operator: 'gte', value: 0 }, targetId, energyStates, activeBuffsMap, entityTypeById)
  const over = Math.max(0, metricValue - scaling.baseline)
  const scaledBonus = Math.min(scaling.maxBonus, Math.floor(over / scaling.unitSize) * scaling.perUnit)
  let total = template.value + scaledBonus
  if (scaling.extraCondition && evaluateCondition(scaling.extraCondition.condition, targetId, energyStates, activeBuffsMap, entityTypeById)) {
    total += scaling.extraCondition.bonus
  }
  return total
}

function expandAvTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  casterId: string,
  actionIndex: number,
  resolvedTargets: string[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): Intervention | null {
  if (template.type !== 'av_advance' && template.type !== 'av_delay') return null
  const targets = filterByCondition(resolvedTargets, template.condition, energyStates, activeBuffsMap, entityTypeById)
  if (targets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
    afterCharId: casterId,
    afterActionIndex: actionIndex,
  }
}

function expandSpdTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): Intervention | null {
  if (template.type !== 'spd_up' && template.type !== 'spd_down') return null
  const targets = filterByCondition(resolvedTargets, template.condition, energyStates, activeBuffsMap, entityTypeById)
  if (targets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    buffKind: template.buffKind,
    auraTargets: template.auraTargets,
    effectId: template.effectId,
    exclusiveEffectId: template.exclusiveEffectId,
    tickPhase: template.tickPhase,
  }
}

// Returns an array (not a single Intervention) because valueScaling can give each target a different
// computed value — every other template type shares one Intervention/value across all its targets, but
// a per-target value can't be represented that way. Without valueScaling, this is still just a single-
// element array sharing one Intervention exactly like before (no behavior change for existing configs,
// notably aura buffs, which rely on one shared master entry covering every target).
function expandStatTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
  energyStates: Map<string, EnergyState>,
  casterId: string,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): Intervention[] | null {
  if (template.type !== 'stat_buff' && template.type !== 'stat_debuff') return null
  const targets = filterByCondition(resolvedTargets, template.condition, energyStates, activeBuffsMap, entityTypeById)
  if (targets.length === 0) return null

  // Linear bonus off the caster's own real stat (e.g. Mimi's 伙伴！一起！: +13.2% of her own — i.e.
  // Trailblazer-Remembrance's, copied onto her at summon time — Crit DMG) — uniform across every target,
  // unlike valueScaling below (per-target, stepped/capped).
  const casterStatBonus = template.casterStatScaling
    ? (energyStates.get(casterId)?.[template.casterStatScaling.stat] ?? 0) * template.casterStatScaling.ratio
    : 0

  if (!template.valueScaling) {
    return [{
      id: uuid(),
      triggerAv,
      type: template.type,
      targets,
      stat: template.stat,
      value: template.value + casterStatBonus,
      unit: template.unit,
      durationTurns: template.durationTurns,
      buffKind: template.buffKind,
      auraTargets: template.auraTargets,
      effectId: template.effectId,
      exclusiveEffectId: template.exclusiveEffectId,
      stackable: template.stackable,
      tickPhase: template.tickPhase,
    }]
  }

  return targets.map((targetId) => ({
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: [targetId],
    stat: template.stat,
    value: computeScaledStatValue(template, targetId, energyStates, activeBuffsMap, entityTypeById) + casterStatBonus,
    unit: template.unit,
    durationTurns: template.durationTurns,
    tickPhase: template.tickPhase,
    buffKind: template.buffKind,
    auraTargets: template.auraTargets,
    effectId: template.effectId,
    exclusiveEffectId: template.exclusiveEffectId,
    stackable: template.stackable,
  }))
}

function expandEnergyTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
  energyStates: Map<string, EnergyState>,
  casterId: string,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  entityTypeById: Map<string, BattleEntity['type']>,
): Intervention | null {
  if (template.type !== 'energy_gain' && template.type !== 'energy_loss') return null
  let targets = filterByCondition(resolvedTargets, template.condition, energyStates, activeBuffsMap, entityTypeById)
  // Memosprites (e.g. Mimi) don't share the owner's energy bar and can't receive energy from other
  // characters' restoration effects — they have their own means of gaining energy instead. Exempt:
  // fixedTargetId (deliberate, e.g. Trailblazer-Remembrance's skill charging Mimi directly) and
  // self-targeting (a memosprite's own ability restoring its own energy).
  if (!template.fixedTargetId) {
    targets = targets.filter((id) => id === casterId || entityTypeById.get(id) !== 'memosprite')
  }
  if (targets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
    scalesWithErr: template.scalesWithErr,
  }
}

// SP instant/cap templates expand to a zero-target Intervention; applyIntervention handles them
// before the per-target loop and returns early, so resolvedTargets is irrelevant here.
function expandSpTemplate(
  template: InterventionTemplate,
  triggerAv: number,
): Intervention | null {
  if (
    template.type !== 'sp_gain' && template.type !== 'sp_loss'
    && template.type !== 'sp_cap_up' && template.type !== 'sp_cap_down'
  ) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: [],
    value: template.value,
    unit: 'flat',
    durationTurns: 'durationTurns' in template ? template.durationTurns : 0,
  }
}

function snapshotEnergy(energyStates: Map<string, EnergyState>, allCharacterIds: string[]): Record<string, number> {
  const snap: Record<string, number> = {}
  for (const id of allCharacterIds) {
    const e = energyStates.get(id)
    if (e) snap[id] = e.energy
  }
  return snap
}

function snapshotStates(
  energyStates: Map<string, EnergyState>,
  charStates: Map<string, CharState>,
  allCharacterIds: string[],
  activeBuffsMap?: Map<string, ActiveIntervention[]>,
): Record<string, CharacterBattleState> {
  const snap: Record<string, CharacterBattleState> = {}
  for (const id of allCharacterIds) {
    const e = energyStates.get(id)
    const s = charStates.get(id)
    if (!e || !s) continue
    snap[id] = {
      energy: e.energy,
      spd: computeEffectiveSpd(s),
      // Shallow-copy the array so later ticks do not mutate already-snapshotted events
      activeInterventions: [...(activeBuffsMap?.get(id) ?? [])],
      extras: {},  // Step 9
    }
  }
  return snap
}

function snapshotTeamState(teamState: TeamStateInternal): TeamBattleState {
  return { sp: teamState.sp, spMax: teamState.spMax }
}

// Resolves targets and applies every template in `templates`, one ability's worth at a time. Shared by
// the normal-action path and processUlt so the "resolve → filter by condition → expand → apply" pipeline
// only lives in one place.
// Expands a resolved target list to also include each target's companion and/or owner, per
// InterventionTemplate's alsoTargetRelated — see its doc comment for semantics. Targets with no such
// relationship (no entry in either map) are left as-is, contributing nothing extra.
function expandRelatedTargets(
  targets: string[],
  mode: 'companion' | 'owner' | 'companion_and_owner',
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): string[] {
  const related: string[] = []
  for (const id of targets) {
    if (mode !== 'owner') {
      const companionId = companionIdByOwnerId.get(id)
      if (companionId) related.push(companionId)
    }
    if (mode !== 'companion') {
      const ownerId = ownerIdByCompanionId.get(id)
      if (ownerId) related.push(ownerId)
    }
  }
  return related.length > 0 ? [...targets, ...related] : targets
}

function resolveAndApplyTemplates(
  templates: InterventionTemplate[],
  casterId: string,
  triggerAv: number,
  actionIndex: number,
  overrideTargets: string[] | undefined,
  allCharacterIds: string[],
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): void {
  for (const template of templates) {
    if (template.type === 'summon_companion') {
      const spawnedId = summonCompanion(
        casterId, triggerAv, charStates, energyStates, activeBuffsMap, queue, allCharacterIds,
        entityTypeById, companionIdByOwnerId, ownerIdByCompanionId,
      )
      if (spawnedId) {
        // The companion's own "just entered the simulation" effects (e.g. Mimi's own 50% self-charge,
        // the team-wide 伙伴！一起！ aura) — reuses onBattleStart, which now means "whenever this entity
        // enters the simulation", not strictly "at AV=0".
        const spawnedOnBattleStart = getBattleConfig(spawnedId)?.onBattleStart
        if (spawnedOnBattleStart) {
          resolveAndApplyTemplates(
            spawnedOnBattleStart, spawnedId, triggerAv, -1, undefined,
            allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
            companionIdByOwnerId, ownerIdByCompanionId,
          )
        }
        // The owner's own reaction to having just summoned (e.g. Trailblazer-Remembrance: +40% to Mimi
        // on first summon).
        const onCompanionSummon = getBattleConfig(casterId)?.onCompanionSummon
        if (onCompanionSummon) {
          resolveAndApplyTemplates(
            onCompanionSummon, casterId, triggerAv, -1, undefined,
            allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
            companionIdByOwnerId, ownerIdByCompanionId,
          )
        }
      }
      continue
    }

    // fixedTargetId bypasses targets/TargetType resolution entirely — see InterventionTemplate's
    // fixedTargetId for semantics (e.g. Trailblazer-Remembrance's skill always targeting Mimi by id).
    // Not present on the SP-locked variants ('fixedTargetId' in template guards against those).
    let resolvedTargets = ('fixedTargetId' in template && template.fixedTargetId)
      ? [template.fixedTargetId]
      : resolveTargets(template.targets, casterId, allCharacterIds, overrideTargets, ownerIdByCompanionId)

    if ('alsoTargetRelated' in template && template.alsoTargetRelated) {
      resolvedTargets = expandRelatedTargets(
        resolvedTargets, template.alsoTargetRelated, companionIdByOwnerId, ownerIdByCompanionId,
      )
    }

    if (template.type === 'energy_set_minimum') {
      for (const targetId of resolvedTargets) {
        const energyState = energyStates.get(targetId)
        if (energyState) energyState.energy = Math.max(energyState.energy, template.value)
      }
      continue
    }

    if (template.type === 'clear_buff') {
      for (const targetId of resolvedTargets) {
        const list = activeBuffsMap.get(targetId)
        if (!list) continue
        const matched = list.filter((b) => b.effectId === template.effectId)
        if (matched.length === 0) continue
        activeBuffsMap.set(targetId, list.filter((b) => b.effectId !== template.effectId))
        // spd_up/spd_down buffs additionally live in CharState.spdBuffs (a separate array, keyed by the
        // same id) — e.g. Gilgamesh: clearing Interest must also remove the SPD bonus it grants, not
        // just the stack counter. Mirrors purgeActiveBuffByEffectId's own cleanup for the "replace via
        // same effectId" case.
        const matchedIds = new Set(matched.map((b) => b.id))
        for (const cs of charStates.values()) {
          cs.spdBuffs = cs.spdBuffs.filter((b) => !matchedIds.has(b.id))
        }
      }
      continue
    }

    const avIv = expandAvTemplate(template, triggerAv, casterId, actionIndex, resolvedTargets, energyStates, activeBuffsMap, entityTypeById)
    if (avIv) applyIntervention(avIv, charStates, queue, energyStates, activeBuffsMap, casterId, teamState)

    const energyIv = expandEnergyTemplate(template, triggerAv, resolvedTargets, energyStates, casterId, activeBuffsMap, entityTypeById)
    if (energyIv) applyIntervention(energyIv, charStates, queue, energyStates, activeBuffsMap, casterId, teamState)

    const spdIv = expandSpdTemplate(template, triggerAv, resolvedTargets, energyStates, activeBuffsMap, entityTypeById)
    if (spdIv) applyIntervention(spdIv, charStates, queue, energyStates, activeBuffsMap, casterId, teamState)

    const statIvs = expandStatTemplate(template, triggerAv, resolvedTargets, energyStates, casterId, activeBuffsMap, entityTypeById)
    if (statIvs) {
      for (const statIv of statIvs) {
        applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, casterId, teamState)
      }
    }

    const spIv = expandSpTemplate(template, triggerAv)
    if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, casterId, teamState)
  }
}

// Checks every character's CharacterBattleConfig for an 'any_ally_action' passive and fires its effect
// when the listener's own condition is met — this is how a passive that isn't triggered by the listener's
// own ability gets modeled (e.g. Huohuo's talent: any ally's action restores her energy, but only while
// she currently holds her Rangming buff). actingCharacterId is whoever's action just resolved; it may
// equal the listener's own id — a condition that needs to exclude self-triggering checks for that itself.
function runGlobalListeners(
  actingCharacterId: string,
  actingAbility: ActionChoice | 'ult',
  actingHitCount: number,
  triggerAv: number,
  allCharacterIds: string[],
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,
  listenerTriggerCounts: Map<string, number>,
  listenerOccurrenceCounts: Map<string, number>,
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): void {
  for (const selfId of allCharacterIds) {
    const listeners = getBattleConfig(selfId, energyStates.get(selfId)?.eidolon ?? 0)?.globalListeners
    if (!listeners) continue

    listeners.forEach((listener, listenerIdx) => {
      if (listener.trigger !== 'any_ally_action') return
      const ctx: GlobalListenerContext = {
        selfId,
        actingCharacterId,
        actingCharacterType: entityTypeById.get(actingCharacterId) ?? 'character',
        actingAbility,
        hitCount: actingHitCount,
        activeInterventions: activeBuffsMap.get(selfId) ?? [],
        energy: energyStates.get(selfId)?.energy ?? 0,
      }
      const satisfied = listener.condition(ctx)
      if (!satisfied) return

      // Rate-limited listener (e.g. Trailblazer-Remembrance E2: once per her own turn) — counter is
      // reset to 0 whenever selfId's own turn begins, see the main loop below.
      if (listener.maxTriggersPerOwnTurn !== undefined) {
        const key = `${selfId}:${listenerIdx}`
        const count = listenerTriggerCounts.get(key) ?? 0
        if (count >= listener.maxTriggersPerOwnTurn) return
        listenerTriggerCounts.set(key, count + 1)
      }

      // "Every Nth occurrence" listener (e.g. Saber E6: every 3rd ultimate cast by anyone) — counted
      // across the whole battle, never reset (unlike listenerTriggerCounts above).
      if (listener.everyNOccurrences !== undefined) {
        const key = `${selfId}:${listenerIdx}`
        const count = (listenerOccurrenceCounts.get(key) ?? 0) + 1
        listenerOccurrenceCounts.set(key, count)
        if (count % listener.everyNOccurrences !== 0) return
      }

      const resolvedEffect = typeof listener.effect === 'function' ? listener.effect(ctx) : listener.effect
      resolveAndApplyTemplates(
        Array.isArray(resolvedEffect) ? resolvedEffect : [resolvedEffect], selfId, triggerAv, -1, undefined,
        allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
        companionIdByOwnerId, ownerIdByCompanionId,
      )
    })
  }
}

// Checks every character's CharacterBattleConfig.passiveTrigger (e.g. Saber: "while holding Mana Burst,
// if energy + 8*Reactor Core stacks >= 360, consume Mana Burst + gain 1 SP + act immediately") against
// their *current* live state — unlike GlobalListener (reacts to a specific ally's action) or
// AbilityResolver (only runs when that ability is cast), this isn't tied to any particular cause. Called
// after every state-changing checkpoint in the whole battle (see call sites), so it fires regardless of
// what made the condition true. A self-targeting av_advance in the effect naturally no-ops while this
// same character's own action is still mid-resolution (QueueEntry.pending) — nothing extra needed here
// for that; the effect itself is expected to invalidate its own condition so it doesn't refire forever.
function runPassiveTriggers(
  allCharacterIds: string[],
  triggerAv: number,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): void {
  for (const id of allCharacterIds) {
    const triggers = getBattleConfig(id, energyStates.get(id)?.eidolon ?? 0)?.passiveTrigger
    if (!triggers) continue
    for (const trigger of triggers) {
      const energyState = energyStates.get(id)
      const ctx = {
        energy: energyState?.energy ?? 0,
        maxEnergy: energyState?.maxEnergy ?? 0,
        activeInterventions: activeBuffsMap.get(id) ?? [],
        err: energyState?.err ?? 0,
      }
      const satisfied = trigger.condition(ctx)
      if (!satisfied) continue
      const resolvedEffect = typeof trigger.effect === 'function' ? trigger.effect(ctx) : trigger.effect
      resolveAndApplyTemplates(
        resolvedEffect, id, triggerAv, -1, undefined,
        allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
        companionIdByOwnerId, ownerIdByCompanionId,
      )
    }
  }
}

// Checks every character's CharacterBattleConfig.extraAttack the same way runPassiveTriggers checks
// passiveTrigger (after every state-changing checkpoint, regardless of cause) — but unlike
// passiveTrigger, this is a genuinely *visible* action: a BattleEvent (turnKind: 'extra') gets recorded
// at triggerAv in addition to applying effect. It never touches `queue` — no pending entry, no SPD-based
// scheduling, no turn-based buff ticking for anyone — so there's simply no queue entry for av_advance/
// delay to ever find; it's immune to AV manipulation by construction, not by a special-case guard.
// e.g. Gilgamesh: once his and Saber's combined hit count reaches 8 stacks of 本王允许你进攻, both get a
// one-off burst of effects with no turn of their own.
function runExtraAttacks(
  allCharacterIds: string[],
  triggerAv: number,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates: Map<string, EnergyState>,
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
  results: BattleEvent[],
): void {
  for (const id of allCharacterIds) {
    const config = getBattleConfig(id, energyStates.get(id)?.eidolon ?? 0)
    const extraAttack = config?.extraAttack
    if (!extraAttack) continue
    const energyState = energyStates.get(id)
    const satisfied = extraAttack.condition({
      energy: energyState?.energy ?? 0,
      maxEnergy: energyState?.maxEnergy ?? 0,
      activeInterventions: activeBuffsMap.get(id) ?? [],
      err: energyState?.err ?? 0,
    })
    if (!satisfied) continue

    const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
    const teamBefore = snapshotTeamState(teamState)
    resolveAndApplyTemplates(
      extraAttack.effect, id, triggerAv, -1, undefined,
      allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
      companionIdByOwnerId, ownerIdByCompanionId,
    )

    results.push({
      av: triggerAv,
      characterId: id,
      actionIndex: -1,
      effectiveSpd: computeEffectiveSpd(charStates.get(id)!),
      turnKind: 'extra',
      actionChoice: 'basic',
      hitCount: extraAttack.hitCount,
      stateBefore,
      stateAfter: snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap),
      teamStateBefore: teamBefore,
      teamStateAfter: snapshotTeamState(teamState),
    })
  }
}

// ---- Ult insertion engine ----

function processUlt(
  ult: UltInsertion,
  triggerAv: number,
  charStates: Map<string, CharState>,
  energyStates: Map<string, EnergyState>,
  queue: QueueEntry[],
  allCharacterIds: string[],
  results: BattleEvent[],
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,
  listenerTriggerCounts: Map<string, number>,
  listenerOccurrenceCounts: Map<string, number>,
  entityTypeById: Map<string, BattleEntity['type']>,
  companionIdByOwnerId: Map<string, string>,
  ownerIdByCompanionId: Map<string, string>,
): void {
  const casterEnergy = energyStates.get(ult.casterId)
  if (!casterEnergy) return

  const config    = getBattleConfig(ult.casterId, casterEnergy.eidolon)
  const maxSp     = config?.customMaxEnergy ?? (getGameMetadata().characters?.[ult.casterId as CharacterId]?.max_sp ?? 100)
  const threshold = config?.ultThreshold ?? maxSp
  const cost      = config?.ultEnergyCost ?? threshold

  if (casterEnergy.energy < threshold) return

  const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
  const teamBefore  = snapshotTeamState(teamState)

  // Fire global listeners (e.g. Huohuo's "any ally acts" talent) BEFORE the cost deduction below — at
  // this point the caster is still at/above the energy threshold (i.e. capped at maxEnergy), so a
  // self-triggered gain here gets naturally absorbed by the energy cap instead of surviving into the
  // post-cost total. This only matters for the ult path; normal actions have no cost-deduction step.
  runGlobalListeners(
    ult.casterId, 'ult', config?.hitCounts?.ult ?? 0, triggerAv, allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState,
    listenerTriggerCounts, listenerOccurrenceCounts, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId,
  )

  casterEnergy.energy = Math.max(0, casterEnergy.energy - cost)

  // Dynamic (AbilityResolver) ults aren't supported yet — only basic/skill resolve through the
  // callback path below (see the main loop). Array.isArray guards against silently treating a function
  // as an empty/invalid template list if a config ever sets one here by mistake.
  const ultTemplates: InterventionTemplate[] = Array.isArray(config?.abilities.ult) ? config.abilities.ult : []
  resolveAndApplyTemplates(
    ultTemplates, ult.casterId, triggerAv, -1, ult.targets,
    allCharacterIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
    companionIdByOwnerId, ownerIdByCompanionId,
  )

  // Re-sync passive-driven buffs before this Ult's own snapshot — same reasoning as the normal-action
  // closeOutNormalTurn checkpoint (see its comment): a clear_buff inside this Ult's own templates
  // shouldn't visibly outrun the passiveTrigger-synced buff tied to it.
  runPassiveTriggers(allCharacterIds, triggerAv, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)

  const stateAfter = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
  const casterState = charStates.get(ult.casterId)

  results.push({
    av: triggerAv,
    characterId: ult.casterId,
    actionIndex: -1,
    effectiveSpd: casterState ? computeEffectiveSpd(casterState) : 0,
    turnKind: 'ult' as TurnKind,
    actionChoice: 'ult',
    stateBefore,
    stateAfter,
    teamStateBefore: teamBefore,
    teamStateAfter:  snapshotTeamState(teamState),
    ultInsertionId: ult.id,
    hitCount: config?.hitCounts?.ult ?? 0,
  })
}

// ---- Chained ordering (Intervention.afterItemId / UltInsertion.afterItemId) ----

type MergedEntry =
  | { kind: 'ult'; id: string; item: UltInsertion; afterItemId?: string }
  | { kind: 'intervention'; id: string; item: Intervention; afterItemId?: string }

// ---- Main export ----

export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],
  actionOverrides: ActionNodeOverride[],
  ultInsertions: UltInsertion[],
  totalAv: number,
  // Set when this is a later Wave (混沌回忆换面) continuing from a previous one's cut point — carries
  // over energy/buffs/team SP instead of the normal onBattleStart baseline. See useAVVisualTabStore's
  // Wave.seedState for how it's captured.
  seedState?: WaveSeedState,
): SimulationResult {
  if (entities.length === 0 || totalAv <= 0) return { events: [], energyTimeline: [], initialActiveInterventions: {}, chainSnapshots: {} }

  // Every entity (character, memosprite, summon, marker) runs its own AV cycle and needs a CharState —
  // that's the only thing all four types share. Only 'character'/'memosprite' actually "act" (own
  // energy, own independent buffs, own abilities, valid ability targets); 'summon'/'marker' just occupy
  // a moving position on the timeline (summon mirrors its owner's buffs elsewhere, never queried here).
  const queueParticipants = entities
  const actingEntities = entities.filter((e) => e.type === 'character' || e.type === 'memosprite')
  const targetableIds = actingEntities.map((e) => e.id)
  const entityTypeById = new Map(entities.map((e) => [e.id, e.type]))
  // Relationship lookups for InterventionTemplate's alsoTargetRelated (e.g. Trailblazer-Remembrance E1:
  // a buff granted to a target should also reach that target's own companion, or — if the target IS a
  // companion — its owner). Built once from each entity's ownerId; entities with no companion/owner
  // relationship simply have no entry in either map.
  const companionIdByOwnerId = new Map(
    entities.filter((e) => e.ownerId).map((e) => [e.ownerId!, e.id]),
  )
  const ownerIdByCompanionId = new Map(
    entities.filter((e) => e.ownerId).map((e) => [e.id, e.ownerId!]),
  )

  const charStates = new Map<string, CharState>()
  for (const char of queueParticipants) {
    charStates.set(char.id, { panelSpd: char.spd, whiteSpd: char.baseSpd, spdBuffs: [] })
  }

  const energyStates = new Map<string, EnergyState>()
  for (const char of actingEntities) {
    // customMaxEnergy overrides the game_data lookup — for entities that aren't a real character in
    // game data (e.g. a memosprite's own energy bar, which has no max_sp entry to look up at all).
    const config = getBattleConfig(char.id, char.eidolon)
    const maxEnergy = config?.customMaxEnergy
      ?? (getGameMetadata().characters?.[char.id as CharacterId]?.max_sp ?? 100)
    // Initial energy is 50% of what's actually needed to cast the Ultimate (ultThreshold), not 50% of
    // maxEnergy itself — for most characters these are the same number, but for one with an overflow-
    // style energy cap beyond their ult cost (e.g. Saber: 480/560 maxEnergy vs 360 ultThreshold), the
    // starting baseline should still be relative to the 360, not the inflated cap. seedState (a wave
    // transition — see Wave.seedState) overrides this baseline with whatever energy the character
    // actually carried over from the previous wave's cut point; entities the seed has nothing for (e.g.
    // a companion not yet summoned at cut time) still fall back to the normal baseline.
    const startingBasis = config?.ultThreshold ?? maxEnergy
    const seededEnergy = seedState?.energyByChar[char.id]
    energyStates.set(char.id, { energy: seededEnergy ?? startingBasis * 0.5, maxEnergy, percentBasis: startingBasis, err: char.err, eidolon: char.eidolon, cd: char.cd })
  }

  const activeBuffsMap = new Map<string, ActiveIntervention[]>()
  for (const id of targetableIds) {
    activeBuffsMap.set(id, seedState?.activeInterventionsByChar[id] ?? [])
  }

  // Sum permanent SP cap bonuses from all team members' BattleConfigs (e.g. Sparkle: +3)
  const spCapBonus = targetableIds.reduce((sum, id) => {
    return sum + (getBattleConfig(id, energyStates.get(id)?.eidolon ?? 0)?.spCapBonus ?? 0)
  }, 0)
  // seedState's own teamSp already reflects spCapBonus (captured live from the previous wave, same
  // roster/configs) — only fall back to the normal 3/(5+spCapBonus) baseline when starting fresh.
  const teamState: TeamStateInternal = seedState
    ? { sp: seedState.teamSp.sp, spMax: seedState.teamSp.spMax, spCapChanges: [] }
    : { sp: 3, spMax: 5 + spCapBonus, spCapChanges: [] }

  // Tracks GlobalListener.maxTriggersPerOwnTurn counters, keyed by `${listenerOwnerId}:${listenerIndex}`.
  // Reset per-owner whenever that owner's own turn begins (see the main loop below).
  const listenerTriggerCounts = new Map<string, number>()
  // Tracks GlobalListener.everyNOccurrences counters, same key shape — but never reset (battle-wide).
  const listenerOccurrenceCounts = new Map<string, number>()

  const queue: QueueEntry[] = queueParticipants
    .map((char) => ({ av: 10000 / char.spd, characterId: char.id, actionIndex: 0 }))
    .sort((a, b) => a.av - b.av)

  // Battle-start passives (e.g. Huohuo: +30 energy and a 2-turn Rangming buff at AV=0). Must run after
  // `queue` exists (applyIntervention's AV-gauge math looks up queue entries) and before the first
  // energyTimeline checkpoint below, so the very first snapshot already reflects these effects. Skipped
  // entirely when seedState is set — a wave transition isn't a fresh battle start, it's a continuation;
  // re-running onBattleStart would incorrectly re-grant one-time battle-start effects a second time.
  if (!seedState) {
    for (const char of actingEntities) {
      const onBattleStart = getBattleConfig(char.id, char.eidolon)?.onBattleStart
      if (!onBattleStart) continue
      resolveAndApplyTemplates(
        onBattleStart, char.id, 0, -1, undefined,
        targetableIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
        companionIdByOwnerId, ownerIdByCompanionId,
      )
    }
  }

  // Snapshot right after onBattleStart resolves — see SimulationResult.initialActiveInterventions for why.
  const initialActiveInterventions: Record<string, ActiveIntervention[]> = {}
  for (const char of actingEntities) {
    initialActiveInterventions[char.id] = activeBuffsMap.get(char.id) ?? []
  }

  // Per-chained-item state — see SimulationResult.chainSnapshots' own doc comment.
  const chainSnapshots: Record<string, Record<string, CharacterBattleState>> = {}

  const pendingGlobalBefore = interventions
    .filter((iv) => !iv.beforeCharId && !iv.afterCharId)
    .sort((a, b) => a.triggerAv - b.triggerAv)

  const pendingCharBefore = interventions.filter((iv) => iv.beforeCharId)
  const pendingAfter = interventions.filter((iv) => iv.afterCharId)

  const pendingUltDuringAction = new Map<string, UltInsertion[]>()
  const pendingUltAfterAction  = new Map<string, UltInsertion[]>()
  const pendingUltAtAv = ultInsertions
    .filter((u) => u.timing.type === 'at_av')
    .sort((a, b) => (a.timing as { type: 'at_av'; av: number }).av - (b.timing as { type: 'at_av'; av: number }).av)
  let ultAtAvIdx = 0

  for (const ult of ultInsertions) {
    if (ult.timing.type === 'during_action') {
      const key = `${ult.timing.charId}:${ult.timing.actionIndex}`
      pendingUltDuringAction.set(key, [...(pendingUltDuringAction.get(key) ?? []), ult])
    } else if (ult.timing.type === 'after_action') {
      const key = `${ult.timing.charId}:${ult.timing.actionIndex}`
      pendingUltAfterAction.set(key, [...(pendingUltAfterAction.get(key) ?? []), ult])
    }
  }

  let beforeIdx = 0
  const results: BattleEvent[] = []
  runPassiveTriggers(targetableIds, 0, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
  runExtraAttacks(targetableIds, 0, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId, results)
  runPassiveTriggers(targetableIds, 0, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
  const energyTimeline: EnergyCheckpoint[] = [
    { av: 0, energyMap: snapshotEnergy(energyStates, targetableIds) },
  ]

  while (queue.length > 0 || beforeIdx < pendingGlobalBefore.length || ultAtAvIdx < pendingUltAtAv.length) {
    const nextActionAv     = queue.length > 0 ? queue[0].av : Infinity
    const nextGlobalBeforeAv = beforeIdx < pendingGlobalBefore.length ? pendingGlobalBefore[beforeIdx].triggerAv : Infinity
    const nextUltAtAv      = ultAtAvIdx < pendingUltAtAv.length
      ? (pendingUltAtAv[ultAtAvIdx].timing as { type: 'at_av'; av: number }).av
      : Infinity

    if (Math.min(nextActionAv, nextGlobalBeforeAv, nextUltAtAv) >= totalAv) break

    // at_av Ults and flat (unanchored) interventions sharing this exact AV: gather everything tied at the
    // minimum AV from both buckets and merge — legacy default is "all at_av Ults first, then all flat
    // interventions" (exactly today's behavior); afterItemId splices a specific item in elsewhere.
    const minBeforeOrUltAv = Math.min(nextGlobalBeforeAv, nextUltAtAv)
    if (minBeforeOrUltAv <= nextActionAv) {
      const ultsAtThisAv: UltInsertion[] = []
      while (ultAtAvIdx < pendingUltAtAv.length && (pendingUltAtAv[ultAtAvIdx].timing as { type: 'at_av'; av: number }).av === minBeforeOrUltAv) {
        ultsAtThisAv.push(pendingUltAtAv[ultAtAvIdx])
        ultAtAvIdx++
      }
      const ivsAtThisAv: Intervention[] = []
      while (beforeIdx < pendingGlobalBefore.length && pendingGlobalBefore[beforeIdx].triggerAv === minBeforeOrUltAv) {
        ivsAtThisAv.push(pendingGlobalBefore[beforeIdx])
        beforeIdx++
      }
      const atAvMerged = mergeChainedOrder(
        [
          ...ultsAtThisAv.filter((u) => !u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
          ...ivsAtThisAv.filter((iv) => !iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
        ],
        [
          ...ultsAtThisAv.filter((u) => u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
          ...ivsAtThisAv.filter((iv) => iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
        ],
      )
      for (const entry of atAvMerged) {
        if (entry.kind === 'ult') {
          processUlt(entry.item, minBeforeOrUltAv, charStates, energyStates, queue, targetableIds, results, activeBuffsMap, teamState, listenerTriggerCounts, listenerOccurrenceCounts, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        } else {
          applyIntervention(entry.item, charStates, queue, energyStates, activeBuffsMap, undefined, teamState)
        }
        runPassiveTriggers(targetableIds, minBeforeOrUltAv, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        runExtraAttacks(targetableIds, minBeforeOrUltAv, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId, results)
        runPassiveTriggers(targetableIds, minBeforeOrUltAv, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        energyTimeline.push({ av: minBeforeOrUltAv, energyMap: snapshotEnergy(energyStates, targetableIds) })
        // See SimulationResult.chainSnapshots — recorded after passiveTriggers/extraAttacks too, so this
        // is the fully settled state once this item is done, not just its own immediate effects.
        chainSnapshots[entry.id] = snapshotStates(energyStates, charStates, targetableIds, activeBuffsMap)
      }
      continue
    }

    const head = queue[0]
    const beforeMatches = pendingCharBefore.filter((iv) =>
      iv.beforeCharId === head.characterId
      && iv.triggerAv === head.av
      && (iv.beforeActionIndex ?? 0) === head.actionIndex,
    )
    // Only acting entities can be bound by during_action Ult timing in the first place — matches the
    // isActing check below, computed early here since it gates whether to even look at this bucket.
    const headIsActing = entityTypeById.get(head.characterId) === 'character' || entityTypeById.get(head.characterId) === 'memosprite'
    const duringActionAnchorKey = `${head.characterId}:${head.actionIndex}`
    const ultsDuringHere = headIsActing ? (pendingUltDuringAction.get(duringActionAnchorKey) ?? []) : []

    if (beforeMatches.length > 0 || ultsDuringHere.length > 0) {
      // Same merge as the after_action anchor — legacy default is "all before-interventions, then all
      // during_action Ults in their array order"; afterItemId splices a specific item in elsewhere.
      const beforeMerged = mergeChainedOrder(
        [
          ...beforeMatches.filter((iv) => !iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
          ...ultsDuringHere.filter((u) => !u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
        ],
        [
          ...beforeMatches.filter((iv) => iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
          ...ultsDuringHere.filter((u) => u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
        ],
      )
      for (const entry of beforeMerged) {
        if (entry.kind === 'ult') {
          processUlt(entry.item, head.av, charStates, energyStates, queue, targetableIds, results, activeBuffsMap, teamState, listenerTriggerCounts, listenerOccurrenceCounts, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        } else {
          applyIntervention(entry.item, charStates, queue, energyStates, activeBuffsMap, undefined, teamState)
          pendingCharBefore.splice(pendingCharBefore.indexOf(entry.item), 1)
        }
        // See SimulationResult.chainSnapshots' own doc comment.
        chainSnapshots[entry.id] = snapshotStates(energyStates, charStates, targetableIds, activeBuffsMap)
      }
      pendingUltDuringAction.delete(duringActionAnchorKey)
    }

    const event = queue.shift()!
    const state = charStates.get(event.characterId)!
    const spd = computeEffectiveSpd(state)
    // 'character'/'memosprite' actually act (own energy, own abilities, can be ult targets/casters);
    // 'summon'/'marker' just occupy a moving position on the timeline for this turn.
    const isActing = entityTypeById.get(event.characterId) === 'character'
      || entityTypeById.get(event.characterId) === 'memosprite'

    // Push this character's next action right away (matching the original/SPD-buff-friendly position),
    // but flagged pending — see QueueEntry.pending. This entry's AV gets finalized just before the
    // bottom-of-loop energyTimeline checkpoint, once the *entire* turn (during-action ults, own
    // templates, listeners, after-action ults) is done.
    const nextAvBaseline = event.av + 10000 / spd
    queue.push({ av: nextAvBaseline, characterId: event.characterId, actionIndex: event.actionIndex + 1, pending: true })

    // Look up the override for this action (used for actionChoice and template expansion below)
    const override = isActing
      ? actionOverrides.find((o) => o.characterId === event.characterId && o.actionIndex === event.actionIndex)
      : undefined

    // during_action Ults (and any before-interventions bound to this same action) were already resolved
    // above, before this entry was shifted off the queue — see beforeMatches/ultsDuringHere.

    // 'start'-phase buff tick (e.g. Huohuo's Rangming): happens before this turn's own choice/effects, so
    // if it would expire right now, it's already gone for the rest of this turn — including the
    // stateBefore snapshot taken right after, and the listeners/own templates that follow.
    tickBuffsForCharacter(event.characterId, 'start', event.av, charStates, activeBuffsMap, queue)

    // Snapshot stateBefore/teamBefore: taken after during-action ults and the 'start'-phase buff tick —
    // i.e. once every bit of "housekeeping" for the start of this turn is done, right before this turn's
    // own choice gets made. summon/marker have no energy/buffs of their own to report, so their snapshot
    // is just empty.
    const stateBefore = isActing ? snapshotStates(energyStates, charStates, targetableIds, activeBuffsMap) : {}
    const teamBefore  = snapshotTeamState(teamState)
    // Energy at "turn start" (same point stateBefore is captured) — compared against the final energy
    // once this whole turn is done, to decide below whether autoActsOnOwnEnergy should chain an extra
    // turn (only on a genuine *new* crossing during this turn, not "still happens to read as maxed").
    const ownEnergyAtTurnStart = energyStates.get(event.characterId)?.energy
    // Buff ids already present coming into this turn — passed to the 'end' tick below so a buff freshly
    // granted *during* this same turn isn't immediately docked a turn of its own nominal duration.
    const buffIdsAtTurnStart = new Set([
      ...(state.spdBuffs.map((b) => b.id)),
      ...((activeBuffsMap.get(event.characterId) ?? []).map((b) => b.id)),
    ])

    const normalActionResultIdx = results.length
    results.push({
      av: event.av,
      characterId: event.characterId,
      actionIndex: event.actionIndex,
      effectiveSpd: spd,
      turnKind: 'normal' as TurnKind,
      actionChoice: override?.choice ?? 'basic',
      stateBefore,
      stateAfter: {},  // filled after template expansion below
      teamStateBefore: teamBefore,
      teamStateAfter: { sp: 0, spMax: 5 },  // filled after template expansion below
    })

    // Step C: tick SP cap changes — global tick (any character acting counts as 1 team turn).
    // Unlike SPD/stat buffs, sp_cap_up/down tracks "team turns", not per-caster turns.
    teamState.spCapChanges = teamState.spCapChanges.map((c) => ({
      ...c,
      remainingTurns: c.remainingTurns - 1,
    }))

    const expiredCaps = teamState.spCapChanges.filter((c) => c.remainingTurns <= 0)
    teamState.spCapChanges = teamState.spCapChanges.filter((c) => c.remainingTurns > 0)

    for (const c of expiredCaps) {
      teamState.spMax += c.restoreDelta
      teamState.spMax = Math.max(1, teamState.spMax)
      teamState.sp = Math.min(teamState.sp, teamState.spMax)
    }

    // Always expand templates for effectiveChoice (basic when no override).
    // AV effects: only fire if there's a BattleConfig for this character.
    // Energy effects: always fire, energy gain is tracked for all configured characters.
    // Hoisted above the isActing block (rather than declared inside it) because the end-of-turn
    // autoActsOnOwnEnergy re-check below also needs it.
    const config = isActing ? getBattleConfig(event.characterId, energyStates.get(event.characterId)?.eidolon ?? 0) : undefined

    if (isActing) {
      // Reset this character's own global-listener trigger counters at the start of their own turn
      // (e.g. Trailblazer-Remembrance E2: "once per turn, resets when her own turn starts").
      for (const key of listenerTriggerCounts.keys()) {
        if (key.startsWith(`${event.characterId}:`)) listenerTriggerCounts.delete(key)
      }

      // autoActsOnOwnEnergy: ignores the user's override entirely and decides basic-vs-skill from this
      // character's own live energy instead (e.g. Mimi: below max -> basic, at/above max -> skill).
      const ownEnergy = energyStates.get(event.characterId)
      // actionLock: same idea, but the decision comes from an arbitrary buff condition instead of energy
      // (e.g. Gilgamesh: locked to Basic before Interest Piqued, locked to Skill for good once gained —
      // there's no free-choice state at all). Also takes priority over the user's override — without
      // this, ActionConfigPanel's UI lock was purely cosmetic (it hid the picker but never actually made
      // the simulation itself resolve to the locked choice, so the engine kept silently running Basic).
      const lockedChoice = config?.actionLock?.({
        energy: ownEnergy?.energy ?? 0,
        maxEnergy: ownEnergy?.maxEnergy ?? 0,
        activeInterventions: activeBuffsMap.get(event.characterId) ?? [],
        err: ownEnergy?.err ?? 0,
      })
      const effectiveChoice = config?.autoActsOnOwnEnergy && ownEnergy
        ? (ownEnergy.energy >= ownEnergy.maxEnergy ? 'skill' : 'basic')
        : lockedChoice ?? (override?.choice ?? 'basic')
      // basicVariants: an alternate basic-attack version selected when the caster currently holds a
      // matching stack-based buff (e.g. Trailblazer-Remembrance: with 史诗 stacked, basic becomes the
      // enhanced 2-hit version) — checked in order, first match wins, falls back to abilities.basic.
      const matchedVariant = effectiveChoice === 'basic'
        ? config?.basicVariants?.find((v) =>
            activeBuffsMap.get(event.characterId)?.some((b) => b.effectId === v.requiresEffectId))
        : undefined
      // An ability can be a static template array (the common case) or an AbilityResolver — a function
      // computed fresh right now, given this character's own live energy/buffs, for effects the
      // declarative condition/valueScaling system can't express (e.g. Saber's skill: a full branch
      // between two different effect sets, not a single conditionally-scaled value). See
      // AbilityResolution's own doc comment for why afterEffects is resolved separately, further below.
      const rawAbility = config?.abilities[effectiveChoice]
      const ownEnergyForAbility = energyStates.get(event.characterId)
      const abilityResolution: AbilityResolution = typeof rawAbility === 'function'
        ? rawAbility({
            energy: ownEnergyForAbility?.energy ?? 0,
            maxEnergy: ownEnergyForAbility?.maxEnergy ?? 0,
            activeInterventions: activeBuffsMap.get(event.characterId) ?? [],
            err: ownEnergyForAbility?.err ?? 0,
          })
        : { templates: rawAbility ?? [] }
      const templates: InterventionTemplate[] = matchedVariant?.templates ?? abilityResolution.templates
      const afterEffects: InterventionTemplate[] = abilityResolution.afterEffects ?? []
      // actionChoice was set at push-time from the raw override (or 'basic') — autoActsOnOwnEnergy can
      // override that with a different effectiveChoice, so reflect the real choice that actually ran.
      results[normalActionResultIdx].actionChoice = effectiveChoice
      results[normalActionResultIdx].hitCount = matchedVariant?.hitCount ?? config?.hitCounts?.[effectiveChoice] ?? 0
      // Global listeners (e.g. Huohuo's "any ally acts" talent) fire BEFORE this action's own templates
      // — matching processUlt's existing ordering, and matching the in-game rule that a reactive passive
      // like this triggers at the start of the acting ally's turn, not after their effects have already
      // resolved. This also means a companion that this very action is about to summon (via
      // 'summon_companion' in templates below) correctly isn't a valid target yet for any listener-
      // triggered effect that lands on it this same turn (e.g. a talent-style energy conversion).
      runGlobalListeners(
        event.characterId, effectiveChoice, results[normalActionResultIdx].hitCount ?? 0, event.av, targetableIds, charStates, queue, energyStates, activeBuffsMap,
        teamState, listenerTriggerCounts, listenerOccurrenceCounts, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId,
      )
      resolveAndApplyTemplates(
        templates, event.characterId, event.av, event.actionIndex, override?.targets,
        targetableIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
        companionIdByOwnerId, ownerIdByCompanionId,
      )
      if (matchedVariant?.consumesStack) {
        consumeStack(event.characterId, matchedVariant.requiresEffectId, activeBuffsMap)
      }

      // This character's own ability (listeners + its own templates + consumesStack) has now genuinely
      // "been released" — clear its queued next-action entry's pending flag here, *before* afterEffects/
      // manually-added "after" interventions/after-action ults run, so any of those can freely pull that
      // entry (e.g. an av_advance in afterEffects). Listeners and the ability's own templates above ran
      // while still pending, which is what actually prevents the Huohuo/Mimi-style spurious-rechain bug
      // — this only widens the window *after* that point, where a self-pull is a deliberate, expected one.
      const pendingEntry = queue.find((e) => e.characterId === event.characterId && e.pending)
      if (pendingEntry) {
        pendingEntry.pending = false
        sortQueue(queue)
      }

      // afterEffects (from an AbilityResolver) — resolved now that pending is cleared, so a self-targeting
      // av_advance here (e.g. Saber: "skill that refills energy to full lets her act again immediately")
      // can actually succeed, unlike the same effect placed in templates above.
      if (afterEffects.length > 0) {
        resolveAndApplyTemplates(
          afterEffects, event.characterId, event.av, event.actionIndex, override?.targets,
          targetableIds, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById,
          companionIdByOwnerId, ownerIdByCompanionId,
        )
      }

      // Fire any manually-added "after" interventions, interleaved with after_action Ults bound to this
      // same action — by default ("legacy", no afterItemId on anything here) every intervention resolves
      // before any of the Ults, exactly as before; an intervention/Ult with afterItemId set is spliced in
      // immediately after whichever specific item it points to instead (see mergeChainedOrder).
      // Pass event.characterId as casterId so aura buffs register their tick entry on this character.
      const matchingAfterIvs = pendingAfter.filter((iv) => {
        const targetIdx = iv.afterActionIndex ?? 0
        return iv.afterCharId === event.characterId && iv.triggerAv === event.av && targetIdx === event.actionIndex
      })
      const afterUltKey = `${event.characterId}:${event.actionIndex}`
      const ultsAfterHere = pendingUltAfterAction.get(afterUltKey) ?? []
      const afterMerged = mergeChainedOrder(
        [
          ...matchingAfterIvs.filter((iv) => !iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
          ...ultsAfterHere.filter((u) => !u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
        ],
        [
          ...matchingAfterIvs.filter((iv) => iv.afterItemId).map((iv): MergedEntry => ({ kind: 'intervention', id: iv.id, item: iv, afterItemId: iv.afterItemId })),
          ...ultsAfterHere.filter((u) => u.afterItemId).map((u): MergedEntry => ({ kind: 'ult', id: u.id, item: u, afterItemId: u.afterItemId })),
        ],
      )

      // This normal action (own templates, listeners, manually-added "after" interventions) is fully
      // resolved once we reach the first after_action Ult (or the end, if there are none) — 'end'-phase
      // buff tick (the default — everything except e.g. Huohuo's Rangming) happens here, so stateAfter
      // reflects it: these buffs stay fully active through this whole turn and only disappear starting
      // the next one, unlike 'start'-phase ones which already ticked before this turn did anything.
      // buffIdsAtTurnStart excludes anything granted just now by this same turn's own effects/after-
      // interventions from being immediately docked a turn. Snapshotting here (instead of after every
      // Ult) keeps stateAfter/teamStateAfter as "this action's own result, before any Ult" regardless of
      // how many Ults/interventions are interleaved after it — each Ult gets its own independent snapshot
      // inside processUlt.
      let turnClosedOut = false
      const closeOutNormalTurn = () => {
        if (turnClosedOut) return
        turnClosedOut = true
        tickBuffsForCharacter(event.characterId, 'end', event.av, charStates, activeBuffsMap, queue, buffIdsAtTurnStart)
        // Re-sync passive-driven buffs (e.g. Gilgamesh's Interest-stacks-to-SPD sync) before this action's
        // own snapshot is taken — without this, a clear_buff inside this same action's own templates (e.g.
        // his Skill clearing Interest) would show up in stateAfter immediately, while the buff it's tied
        // to via passiveTrigger would still show its pre-clear value until the next checkpoint runs,
        // making the two visibly out of sync in the panel.
        runPassiveTriggers(targetableIds, event.av, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        results[normalActionResultIdx].stateAfter    = snapshotStates(energyStates, charStates, targetableIds, activeBuffsMap)
        results[normalActionResultIdx].teamStateAfter = snapshotTeamState(teamState)
      }

      for (const entry of afterMerged) {
        if (entry.kind === 'ult') {
          closeOutNormalTurn()
          processUlt(entry.item, event.av, charStates, energyStates, queue, targetableIds, results, activeBuffsMap, teamState, listenerTriggerCounts, listenerOccurrenceCounts, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
        } else {
          applyIntervention(entry.item, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)
        }
        // See SimulationResult.chainSnapshots' own doc comment.
        chainSnapshots[entry.id] = snapshotStates(energyStates, charStates, targetableIds, activeBuffsMap)
      }
      closeOutNormalTurn()
      pendingUltAfterAction.delete(afterUltKey)
    } else {
      // summon/marker: no abilities, no energy of their own — stateAfter stays empty, teamStateAfter
      // is unaffected by their "turn".
      results[normalActionResultIdx].stateAfter = {}
      results[normalActionResultIdx].teamStateAfter = teamBefore
    }

    // Finalize the next-action entry pushed at the top of this iteration. For isActing characters, its
    // pending flag was already cleared further up (right after their own ability resolved) — this still
    // needs to run for that case too (autoActsOnOwnEnergy's chain check below) and is also where a
    // non-acting summon/marker's entry (never reached the isActing branch above) gets unblocked.
    //
    // autoActsOnOwnEnergy chains an extra turn right now, but only on a genuine *new* crossing during
    // this turn (entered below max, ends at/above max) — not just "still reads as maxed". If she was
    // already maxed when this turn started (this turn itself only exists because an earlier chain or
    // external pull put her here, or her "maxed" ability doesn't consume energy at all), don't chain
    // again: re-chaining off a max state that was already accounted for either does nothing new, or —
    // if nothing in her kit ever brings her back below max — loops forever, since "still maxed" would
    // never stop being true.
    const pendingEntry = queue.find((e) => e.characterId === event.characterId)
    if (pendingEntry) {
      const ownEnergyAfter = energyStates.get(event.characterId)
      const crossedIntoMaxThisTurn = !!(
        config?.autoActsOnOwnEnergy && ownEnergyAfter
        && (ownEnergyAtTurnStart ?? 0) < ownEnergyAfter.maxEnergy
        && ownEnergyAfter.energy >= ownEnergyAfter.maxEnergy
      )
      if (crossedIntoMaxThisTurn) pendingEntry.av = event.av
      pendingEntry.pending = false
      sortQueue(queue)
    }

    // Checkpoint after all effects at this action AV have been applied.
    runPassiveTriggers(targetableIds, event.av, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
    runExtraAttacks(targetableIds, event.av, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId, results)
    runPassiveTriggers(targetableIds, event.av, charStates, queue, energyStates, activeBuffsMap, teamState, entityTypeById, companionIdByOwnerId, ownerIdByCompanionId)
    energyTimeline.push({ av: event.av, energyMap: snapshotEnergy(energyStates, targetableIds) })
  }

  return { events: results, energyTimeline, initialActiveInterventions, chainSnapshots }
}
