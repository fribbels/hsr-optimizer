import { getGameMetadata } from 'lib/state/gameMetadata'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import type {
  ActionNodeOverride,
  ActiveIntervention,
  BattleEntity,
  BattleEvent,
  CharacterBattleState,
  Intervention,
  InterventionTemplate,
  TargetType,
  TeamBattleState,
  TurnKind,
  UltInsertion,
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
}

type EnergyState = { energy: number; maxEnergy: number }

// ---- Public output types ----

export type EnergyCheckpoint = {
  av: number
  energyMap: Record<string, number>
}

export type SimulationResult = {
  events: BattleEvent[]
  energyTimeline: EnergyCheckpoint[]
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

  // Aura buff: register ONE entry on the caster's activeBuffsMap before the per-target loop.
  // This covers both spd_up/down aura (whose SpdBuff goes on each target) and stat_buff/debuff aura
  // (which has no per-target state change — the entry on the caster drives tick and display).
  if (
    activeBuffsMap && casterId && buffKind === 'aura' && iv.targets.length > 0
    && (iv.type === 'spd_up' || iv.type === 'spd_down' || iv.type === 'stat_buff' || iv.type === 'stat_debuff')
  ) {
    const list = activeBuffsMap.get(casterId) ?? []
    list.push({
      id: iv.id,
      sourceCharacterId: casterId,
      sourceAbility: 'external',
      type: iv.type,
      stat: iv.stat,
      value: iv.value,
      unit: iv.unit,
      remainingTurns: iv.durationTurns,
      buffKind: 'aura',
      auraTargets: iv.auraTargets,
    })
    activeBuffsMap.set(casterId, list)
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

      const oldSpd = computeEffectiveSpd(targetState)
      const newBuff: SpdBuff = {
        id: iv.id,
        delta,
        // Aura buffs never expire via the target's tick; sentinel prevents filter from removing them.
        remainingTurns: buffKind === 'aura' ? Number.MAX_SAFE_INTEGER : iv.durationTurns,
        buffKind,
        casterId: effectiveCasterId,
      }
      targetState.spdBuffs.push(newBuff)
      const newSpd = computeEffectiveSpd(targetState)

      const targetEntry = queue.find((e) => e.characterId === targetId)
      let displayRemainingTurns = iv.durationTurns

      if (targetEntry) {
        const remainingAv = targetEntry.av - iv.triggerAv
        if (remainingAv > 0) {
          if (oldSpd !== newSpd) {
            const gaugeDistance = remainingAv * oldSpd
            targetEntry.av = iv.triggerAv + gaugeDistance / newSpd
          }
          // Immediate tick: only for direct buffs (aura turns counted on caster's actions)
          if (buffKind !== 'aura') {
            newBuff.remainingTurns -= 1
            displayRemainingTurns -= 1
            if (newBuff.remainingTurns <= 0) {
              targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
            }
          }
        } else if (remainingAv === 0) {
          if (buffKind !== 'aura') {
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
          auraTargets: iv.auraTargets,
        })
        activeBuffsMap.set(targetId, list)
      }
    } else if (iv.type === 'energy_gain' || iv.type === 'energy_loss') {
      const energyTarget = energyStates?.get(targetId)
      if (!energyTarget) continue
      const delta = iv.unit === 'percent'
        ? energyTarget.maxEnergy * (iv.value / 100)
        : iv.value
      energyTarget.energy = iv.type === 'energy_gain'
        ? Math.min(energyTarget.maxEnergy, energyTarget.energy + delta)
        : Math.max(0, energyTarget.energy - delta)
    } else if (iv.type === 'stat_buff' || iv.type === 'stat_debuff') {
      // Aura stat buff: already registered on caster before the loop; no per-target AV state to update.
      // Direct stat buff: register per-target entry; no AV/energy effect.
      if (activeBuffsMap && buffKind === 'direct') {
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
        })
        activeBuffsMap.set(targetId, list)
      }
    } else {
      // av_advance / av_delay: directly modify the target's next-action AV in the queue
      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
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
): string[] {
  switch (targetType) {
    case 'self':        return [casterId]
    case 'all_allies':  return allCharacterIds
    case 'single_ally': return overrideTargets ?? []
    default:            return []  // enemy targets and 'team' (SP): skipped in Step 3
  }
}

function expandAvTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  casterId: string,
  actionIndex: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'av_advance' && template.type !== 'av_delay') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
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
): Intervention | null {
  if (template.type !== 'spd_up' && template.type !== 'spd_down') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    buffKind: template.buffKind,
    auraTargets: template.auraTargets,
  }
}

function expandStatTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'stat_buff' && template.type !== 'stat_debuff') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    stat: template.stat,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    buffKind: template.buffKind,
    auraTargets: template.auraTargets,
  }
}

function expandEnergyTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'energy_gain' && template.type !== 'energy_loss') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
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
): void {
  const casterEnergy = energyStates.get(ult.casterId)
  if (!casterEnergy) return

  const metadata = getGameMetadata().characters?.[ult.casterId as CharacterId]
  const maxSp     = metadata?.max_sp ?? 100
  const config    = getBattleConfig(ult.casterId)
  const threshold = config?.ultThreshold ?? maxSp
  const cost      = config?.ultEnergyCost ?? threshold

  if (casterEnergy.energy < threshold) return

  const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
  const teamBefore  = snapshotTeamState(teamState)

  casterEnergy.energy = Math.max(0, casterEnergy.energy - cost)

  const ultTemplates: InterventionTemplate[] = config?.abilities.ult ?? []
  for (const template of ultTemplates) {
    const resolvedTargets = resolveTargets(
      template.targets, ult.casterId, allCharacterIds, ult.targets,
    )
    const avIv = expandAvTemplate(template, triggerAv, ult.casterId, -1, resolvedTargets)
    if (avIv) applyIntervention(avIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)

    const energyIv = expandEnergyTemplate(template, triggerAv, resolvedTargets)
    if (energyIv) applyIntervention(energyIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)

    const spdIv = expandSpdTemplate(template, triggerAv, resolvedTargets)
    if (spdIv) applyIntervention(spdIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)

    const statIv = expandStatTemplate(template, triggerAv, resolvedTargets)
    if (statIv) applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)

    const spIv = expandSpTemplate(template, triggerAv)
    if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)
  }

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
  })
}

// ---- Main export ----

export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],
  actionOverrides: ActionNodeOverride[],
  ultInsertions: UltInsertion[],
  totalAv: number,
): SimulationResult {
  if (entities.length === 0 || totalAv <= 0) return { events: [], energyTimeline: [] }

  // Only character entities participate in the AV queue; summons are skipped until Step 8
  const characters = entities.filter((e) => e.type === 'character')
  const allCharacterIds = characters.map((e) => e.id)

  const charStates = new Map<string, CharState>()
  for (const char of characters) {
    charStates.set(char.id, { panelSpd: char.spd, whiteSpd: char.baseSpd, spdBuffs: [] })
  }

  const energyStates = new Map<string, EnergyState>()
  for (const char of characters) {
    const maxEnergy = getGameMetadata().characters?.[char.id as CharacterId]?.max_sp ?? 100
    energyStates.set(char.id, { energy: maxEnergy * 0.5, maxEnergy })
  }

  const activeBuffsMap = new Map<string, ActiveIntervention[]>()
  for (const id of allCharacterIds) {
    activeBuffsMap.set(id, [])
  }

  // Sum permanent SP cap bonuses from all team members' BattleConfigs (e.g. Sparkle: +3)
  const spCapBonus = allCharacterIds.reduce((sum, id) => {
    return sum + (getBattleConfig(id)?.spCapBonus ?? 0)
  }, 0)
  const teamState: TeamStateInternal = {
    sp: 3,
    spMax: 5 + spCapBonus,
    spCapChanges: [],
  }

  const queue: QueueEntry[] = characters
    .map((char) => ({ av: 10000 / char.spd, characterId: char.id, actionIndex: 0 }))
    .sort((a, b) => a.av - b.av)

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
  const energyTimeline: EnergyCheckpoint[] = [
    { av: 0, energyMap: snapshotEnergy(energyStates, allCharacterIds) },
  ]

  while (queue.length > 0 || beforeIdx < pendingGlobalBefore.length || ultAtAvIdx < pendingUltAtAv.length) {
    const nextActionAv     = queue.length > 0 ? queue[0].av : Infinity
    const nextGlobalBeforeAv = beforeIdx < pendingGlobalBefore.length ? pendingGlobalBefore[beforeIdx].triggerAv : Infinity
    const nextUltAtAv      = ultAtAvIdx < pendingUltAtAv.length
      ? (pendingUltAtAv[ultAtAvIdx].timing as { type: 'at_av'; av: number }).av
      : Infinity

    if (Math.min(nextActionAv, nextGlobalBeforeAv, nextUltAtAv) >= totalAv) break

    // at_av ults fire before global interventions and character actions at the same AV
    if (nextUltAtAv <= nextGlobalBeforeAv && nextUltAtAv <= nextActionAv) {
      processUlt(pendingUltAtAv[ultAtAvIdx], nextUltAtAv, charStates, energyStates, queue, allCharacterIds, results, activeBuffsMap, teamState)
      energyTimeline.push({ av: nextUltAtAv, energyMap: snapshotEnergy(energyStates, allCharacterIds) })
      ultAtAvIdx++
      continue
    }

    if (nextGlobalBeforeAv <= nextActionAv) {
      applyIntervention(pendingGlobalBefore[beforeIdx], charStates, queue, energyStates, activeBuffsMap, undefined, teamState)
      energyTimeline.push({ av: nextGlobalBeforeAv, energyMap: snapshotEnergy(energyStates, allCharacterIds) })
      beforeIdx++
      continue
    }

    const head = queue[0]
    const charBeforeMatch = pendingCharBefore.find((iv) =>
      iv.beforeCharId === head.characterId
      && iv.triggerAv === head.av
      && (iv.beforeActionIndex ?? 0) === head.actionIndex,
    )
    if (charBeforeMatch) {
      applyIntervention(charBeforeMatch, charStates, queue, energyStates, activeBuffsMap, undefined, teamState)
      pendingCharBefore.splice(pendingCharBefore.indexOf(charBeforeMatch), 1)
      continue
    }

    const event = queue.shift()!
    const state = charStates.get(event.characterId)!
    const spd = computeEffectiveSpd(state)

    // Look up the override for this action (used for actionChoice and template expansion below)
    const override = actionOverrides.find(
      (o) => o.characterId === event.characterId && o.actionIndex === event.actionIndex,
    )

    // Fire during_action ults BEFORE the normal action — these push their own BattleEvents first,
    // so they appear before the normal action in results at the same AV.
    const duringUltKey = `${event.characterId}:${event.actionIndex}`
    for (const ult of (pendingUltDuringAction.get(duringUltKey) ?? [])) {
      processUlt(ult, event.av, charStates, energyStates, queue, allCharacterIds, results, activeBuffsMap, teamState)
    }
    pendingUltDuringAction.delete(duringUltKey)

    // Snapshot stateBefore/teamBefore: taken after during-action ults, so energy deductions from them
    // are already reflected in the normal action's stateBefore.
    const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
    const teamBefore  = snapshotTeamState(teamState)

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

    const nextAv = event.av + 10000 / spd

    // ---- Buff tick for event.characterId ----

    // Step A: tick direct SPD buffs. Aura buffs have remainingTurns=MAX_SAFE_INTEGER and are
    // never removed here; they expire via Step B when the caster's activeBuffsMap entry expires.
    state.spdBuffs = state.spdBuffs
      .map((b) => b.buffKind === 'direct' ? { ...b, remainingTurns: b.remainingTurns - 1 } : b)
      .filter((b) => b.buffKind !== 'direct' || b.remainingTurns > 0)

    queue.push({ av: nextAv, characterId: event.characterId, actionIndex: event.actionIndex + 1 })

    // Step B: tick all activeBuffsMap entries for event.characterId.
    // This covers: direct buffs received by this char + aura buffs this char emits.
    // Expired aura SPD buffs need reverse gauge conservation on all affected targets.
    const myActive = activeBuffsMap.get(event.characterId) ?? []
    const afterTickActive = myActive.map((a) => ({ ...a, remainingTurns: a.remainingTurns - 1 }))
    const expiredActive = afterTickActive.filter((a) => a.remainingTurns <= 0)
    activeBuffsMap.set(event.characterId, afterTickActive.filter((a) => a.remainingTurns > 0))

    for (const expired of expiredActive) {
      if (expired.buffKind !== 'aura') continue
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
          if (targetEntry && targetEntry.av > event.av) {
            const gaugeDistance = (targetEntry.av - event.av) * oldSpd
            targetEntry.av = event.av + gaugeDistance / newSpd
          }
        }
      }
    }

    sortQueue(queue)

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
    const effectiveChoice = override?.choice ?? 'basic'
    const config = getBattleConfig(event.characterId)
    const templates: InterventionTemplate[] = config?.abilities[effectiveChoice] ?? []
    for (const template of templates) {
      const resolvedTargets = resolveTargets(
        template.targets, event.characterId, allCharacterIds, override?.targets,
      )
      const avIv = expandAvTemplate(template, event.av, event.characterId, event.actionIndex, resolvedTargets)
      if (avIv) applyIntervention(avIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)

      const energyIv = expandEnergyTemplate(template, event.av, resolvedTargets)
      if (energyIv) applyIntervention(energyIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)

      const spdIv = expandSpdTemplate(template, event.av, resolvedTargets)
      if (spdIv) applyIntervention(spdIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)

      const statIv = expandStatTemplate(template, event.av, resolvedTargets)
      if (statIv) applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)

      const spIv = expandSpTemplate(template, event.av)
      if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)
    }

    // Fire any manually-added "after" interventions for this action.
    // Pass event.characterId as casterId so aura buffs register their tick entry on this character.
    for (const iv of pendingAfter) {
      const targetIdx = iv.afterActionIndex ?? 0
      if (iv.afterCharId === event.characterId && iv.triggerAv === event.av && targetIdx === event.actionIndex) {
        applyIntervention(iv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)
      }
    }

    // Snapshot stateAfter/teamStateAfter for the normal action (before after-action ults,
    // so each event has independent snapshots).
    results[normalActionResultIdx].stateAfter     = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
    results[normalActionResultIdx].teamStateAfter  = snapshotTeamState(teamState)

    // Fire after_action ults — these push their own BattleEvents after the normal action in results.
    const afterUltKey = `${event.characterId}:${event.actionIndex}`
    for (const ult of (pendingUltAfterAction.get(afterUltKey) ?? [])) {
      processUlt(ult, event.av, charStates, energyStates, queue, allCharacterIds, results, activeBuffsMap, teamState)
    }
    pendingUltAfterAction.delete(afterUltKey)

    // Checkpoint after all effects at this action AV have been applied.
    energyTimeline.push({ av: event.av, energyMap: snapshotEnergy(energyStates, allCharacterIds) })
  }

  return { events: results, energyTimeline }
}
