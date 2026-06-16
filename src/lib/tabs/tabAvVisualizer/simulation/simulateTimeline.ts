import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'

type SimCharacter = {
  id: string
  spd: number      // Character's total panel speed (relics included)
  baseSpd: number  // White-value speed (base character speed, no relics), used for percent-based speed buff math
}

// SpdBuff is always stored internally as a flat delta (percent is converted to flat against the white value when applied)
type SpdBuff = {
  delta: number
  remainingTurns: number
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

function computeEffectiveSpd(state: CharState): number {
  const buffTotal = state.spdBuffs.reduce((sum, b) => sum + b.delta, 0)
  return Math.max(state.panelSpd + buffTotal, 1)
}

// Primary key: av ascending; on a tie, the smaller originalAv (pre-pull position) acts first (closer to this AV)
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
): void {
  for (const targetId of iv.targets) {
    const targetState = charStates.get(targetId)
    if (!targetState) continue

    if (iv.type === 'spd_up' || iv.type === 'spd_down') {
      // percent is converted to flat against the white value; HSR mechanic: X% = X% × white value, independent of panel speed
      const flatDelta = iv.unit === 'flat'
        ? iv.value
        : targetState.whiteSpd * (iv.value / 100)
      const delta = iv.type === 'spd_up' ? flatDelta : -flatDelta

      const oldSpd = computeEffectiveSpd(targetState)
      const newBuff: SpdBuff = { delta, remainingTurns: iv.durationTurns }
      targetState.spdBuffs.push(newBuff)
      const newSpd = computeEffectiveSpd(targetState)

      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        const remainingAv = targetEntry.av - iv.triggerAv

        if (remainingAv > 0) {
          // Mid-cycle, cross-character application: recompute via gauge conservation + consume 1 turn
          // (the recomputed interval itself counts as 1 turn of the buff)
          if (oldSpd !== newSpd) {
            const gaugeDistance = remainingAv * oldSpd
            targetEntry.av = iv.triggerAv + gaugeDistance / newSpd
          }
          newBuff.remainingTurns -= 1
          if (newBuff.remainingTurns <= 0) {
            targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
          }
        } else if (remainingAv === 0) {
          // During action (before): the buff is consumed by the current action, decremented immediately
          // → durationTurns=1 is fully consumed, no effect on any future action AV
          // → durationTurns=N leaves N-1 turns remaining, affecting the next N-1 actions
          // Note: "after" interventions fire once the character has been re-enqueued, so remainingAv > 0 there
          // and this branch is never hit for them
          newBuff.remainingTurns -= 1
          if (newBuff.remainingTurns <= 0) {
            targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
          }
        }
        // remainingAv < 0: should not happen (the target already acted before triggerAv); silently ignored
      }
    } else {
      // av_advance / av_delay: directly modify the target's next-action AV in the queue
      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        // percent is based on the target's current max action interval (10000/effectiveSpd), matching game mechanics
        const maxInterval = 10000 / computeEffectiveSpd(targetState)
        const delta = iv.unit === 'flat'
          ? iv.value
          : maxInterval * (iv.value / 100)

        const oldAv = targetEntry.av
        targetEntry.av = iv.type === 'av_advance'
          ? Math.max(iv.triggerAv, targetEntry.av - delta)
          : targetEntry.av + delta

        // Record the pre-pull original AV, used for the same-AV sort tiebreaker (closer to this AV acts first)
        if (iv.type === 'av_advance' && targetEntry.av < oldAv) {
          targetEntry.originalAv = oldAv
        }
      }
    }
  }

  sortQueue(queue)
}

export function simulateTimeline(
  characters: SimCharacter[],
  interventions: Intervention[],
  totalAv: number,
): SimEvent[] {
  if (characters.length === 0 || totalAv <= 0) return []

  const charStates = new Map<string, CharState>()
  for (const char of characters) {
    charStates.set(char.id, { panelSpd: char.spd, whiteSpd: char.baseSpd, spdBuffs: [] })
  }

  const queue: QueueEntry[] = characters
    .map((char) => ({ av: 10000 / char.spd, characterId: char.id, actionIndex: 0 }))
    .sort((a, b) => a.av - b.av)

  // Three kinds of interventions:
  // Global "during action" (no beforeCharId, no afterCharId): fires once based purely on triggerAv, unrelated to any specific character's action
  // Character "during action" (beforeCharId set): fires right before that character's beforeActionIndex-th action starts
  // Character "end-of-action instant" (afterCharId set): fires right after that character's afterActionIndex-th action ends
  const pendingGlobalBefore = interventions
    .filter((iv) => !iv.beforeCharId && !iv.afterCharId)
    .sort((a, b) => a.triggerAv - b.triggerAv)

  const pendingCharBefore = interventions.filter((iv) => iv.beforeCharId)
  const pendingAfter = interventions.filter((iv) => iv.afterCharId)

  let beforeIdx = 0
  const results: SimEvent[] = []

  // Unified discrete event loop:
  // 1. First drain all global "before" interventions whose triggerAv <= the AV of the character at the head of the queue
  // 2. Check whether the head-of-queue character's upcoming action matches a character-specific "before" intervention,
  //    apply it in place and remove it from the list (without popping the queue) if it matches
  // 3. Process the character's action and record the result
  // 4. Re-enqueue the character
  // 5. Immediately process any "after" interventions for this character at this AV (may change the re-enqueued AV)
  while (queue.length > 0 || beforeIdx < pendingGlobalBefore.length) {
    const nextActionAv = queue.length > 0 ? queue[0].av : Infinity
    const nextGlobalBeforeAv = beforeIdx < pendingGlobalBefore.length ? pendingGlobalBefore[beforeIdx].triggerAv : Infinity

    if (Math.min(nextActionAv, nextGlobalBeforeAv) >= totalAv) break

    if (nextGlobalBeforeAv <= nextActionAv) {
      applyIntervention(pendingGlobalBefore[beforeIdx], charStates, queue)
      beforeIdx++
      continue
    }

    // The head-of-queue character is about to act: check for a "during action" intervention bound to this exact
    // action (peek, don't pop). If it matches, apply it in place (the queue entry still exists, so the remainingAv=0
    // branch fires correctly) and remove it from the list to prevent re-triggering
    const head = queue[0]
    const charBeforeMatch = pendingCharBefore.find((iv) =>
      iv.beforeCharId === head.characterId
      && iv.triggerAv === head.av
      && (iv.beforeActionIndex ?? 0) === head.actionIndex,
    )
    if (charBeforeMatch) {
      applyIntervention(charBeforeMatch, charStates, queue)
      pendingCharBefore.splice(pendingCharBefore.indexOf(charBeforeMatch), 1)
      continue
    }

    const event = queue.shift()!
    const state = charStates.get(event.characterId)!
    const spd = computeEffectiveSpd(state)

    results.push({
      av: event.av,
      characterId: event.characterId,
      actionIndex: event.actionIndex,
      effectiveSpd: spd,
    })

    const nextAv = event.av + 10000 / spd

    // Decrement remaining SPD buff turns after this action (decrement happens after scheduling, since the buff
    // already counted toward the interval just used)
    state.spdBuffs = state.spdBuffs
      .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter((b) => b.remainingTurns > 0)

    // Re-enqueue the character first so "after" interventions can find and modify its queue entry
    // Note: this must happen even if nextAv >= totalAv, otherwise "after" interventions would find no target.
    // Entries >= totalAv that aren't modified by an "after" intervention get truncated by the break condition
    // at the top of the next loop iteration.
    queue.push({ av: nextAv, characterId: event.characterId, actionIndex: event.actionIndex + 1 })
    sortQueue(queue)

    // Fire any "after" interventions for this character at this AV whose actionIndex matches
    // Each intervention is bound to an exact (charId, av, afterActionIndex) triple, so it can never refire
    for (const iv of pendingAfter) {
      const targetIdx = iv.afterActionIndex ?? 0
      if (iv.afterCharId === event.characterId && iv.triggerAv === event.av && targetIdx === event.actionIndex) {
        applyIntervention(iv, charStates, queue)
      }
    }
  }

  return results
}
