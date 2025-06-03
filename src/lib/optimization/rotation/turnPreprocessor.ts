import {
  AbilityKind,
  createAbility,
  isEndTurnAbility,
  isNullAbility,
  isStartTurnAbility,
  isWholeTurnAbility,
  NULL_TURN_ABILITY,
  toTurnAbility,
  TurnAbility,
  TurnAbilityName,
  TurnMarker,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { TsUtils } from 'lib/utils/TsUtils'

type TurnState = {
  turnStarts: boolean[],
  turnEnds: boolean[],

  turnRanges: { start: number, end: number }[],

  // Reference to the original and normalized abilities
  originalAbilities: TurnAbility[],
  normalizedAbilities: TurnAbility[],

  inTurn: boolean[], // Tracks which abilities are inside turns
  hasBasicOrSkill: boolean[], // Tracks which turns have BASIC/SKILL
}

export function preprocessTurnAbilityNames(input: TurnAbilityName[]) {
  const turnAbilities = input.map(toTurnAbility)
  return preprocessTurnAbilities(turnAbilities).map((x) => x.name)
}

/**
 * Turn preprocessor to correct invalid turn definitions
 */
export function preprocessTurnAbilities(input: TurnAbility[]): TurnAbility[] {
  if (input.length === 0) {
    return []
  }

  const inputAbilities = TsUtils.clone(input)
  inputAbilities.shift()

  const state: TurnState = {
    turnStarts: new Array(inputAbilities.length).fill(false),
    turnEnds: new Array(inputAbilities.length).fill(false),
    turnRanges: [],
    originalAbilities: inputAbilities,
    normalizedAbilities: [],
    inTurn: new Array(inputAbilities.length).fill(false),
    hasBasicOrSkill: [],
  }

  annotateTurnBoundaries(state)
  normalizeAbilities(state)
  closeHangingOpenBrackets(state)
  closeHangingCloseBrackets(state)
  updateTurnRanges(state)
  annotateOrphanedBasicSkill(state)
  updateTurnRanges(state)
  dissolveTurnsWithoutBasicOrSkill(state)
  // updateTurnRanges(state)
  // extendTurnsForOrphanedUlts(state)

  const outputAbilities = generateFinalSequence(state)

  // console.log(outputAbilities)
  return [NULL_TURN_ABILITY, ...outputAbilities]
}

/**
 * Step 1: Annotate defined start and ends for all abilities
 */
function annotateTurnBoundaries(state: TurnState): void {
  const { originalAbilities, turnStarts, turnEnds } = state

  for (let i = 0; i < originalAbilities.length; i++) {
    const ability = originalAbilities[i]

    if (isNullAbility(ability)) {
      continue
    }

    if (isStartTurnAbility(ability)) {
      turnStarts[i] = true
    }

    if (isEndTurnAbility(ability)) {
      turnEnds[i] = true
    }

    if (isWholeTurnAbility(ability)) {
      turnStarts[i] = true
      turnEnds[i] = true
    }
  }
}

/**
 * Step 2: Extract base abilities, normalize types
 */
function normalizeAbilities(state: TurnState): void {
  state.normalizedAbilities = state.originalAbilities.map((ability) =>
    ability
      ? createAbility(ability.kind, TurnMarker.DEFAULT)
      : NULL_TURN_ABILITY
  )
}

/**
 * Helper: Update the turn ranges based on current start/end markers
 */
function updateTurnRanges(state: TurnState): void {
  const { turnStarts, turnEnds } = state
  state.turnRanges = []

  let currentStart = -1
  for (let i = 0; i < turnStarts.length; i++) {
    if (turnStarts[i] && currentStart === -1) {
      currentStart = i
    }

    if (turnEnds[i] && currentStart !== -1) {
      state.turnRanges.push({ start: currentStart, end: i })
      currentStart = -1
    }
  }

  // Handle unclosed turn
  if (currentStart !== -1) {
    state.turnRanges.push({ start: currentStart, end: turnStarts.length - 1 })
  }

  // Update inTurn array
  state.inTurn.fill(false)
  for (const range of state.turnRanges) {
    for (let i = range.start; i <= range.end; i++) {
      state.inTurn[i] = true
    }
  }
}

/**
 * Step 3: Close hanging open brackets conservatively
 */
function closeHangingOpenBrackets(state: TurnState): void {
  const { turnStarts, turnEnds } = state

  let openCount = 0
  let openIndex = 0
  const toEnclose: number[] = []

  for (let i = 0; i < turnStarts.length; i++) {
    if (turnStarts[i]) {
      openCount++

      if (openCount > 1) {
        toEnclose.push(openIndex)
        openCount--
      }

      openIndex = i
    }

    if (turnEnds[i]) {
      openCount = Math.max(0, openCount - 1)
    }

    if (i == turnStarts.length - 1 && openCount) {
      turnEnds[openIndex] = true
    }
  }

  for (const idx of toEnclose) {
    turnEnds[idx] = true
  }
}

/**
 * Step 4: Close hanging close brackets conservatively
 */
function closeHangingCloseBrackets(state: TurnState): void {
  const { turnStarts, turnEnds } = state

  let closeCount = 0
  let closeIndex = 0
  const toEnclose: number[] = []

  for (let i = turnEnds.length - 1; i >= 0; i--) {
    if (turnEnds[i]) {
      closeCount++

      if (closeCount > 1) {
        toEnclose.push(closeIndex)
        closeCount--
      }

      closeIndex = i
    }

    if (turnStarts[i]) {
      closeCount = Math.max(0, closeCount - 1)
    }

    if (i == 0 && closeCount > 0) {
      turnStarts[closeIndex] = true
    }
  }

  for (const idx of toEnclose) {
    turnStarts[idx] = true
  }
}

/**
 * Step 5: Annotate orphaned BASIC/SKILL as their own whole turns
 */
function annotateOrphanedBasicSkill(state: TurnState): void {
  const { normalizedAbilities, turnStarts, turnEnds, inTurn } = state

  for (let i = 0; i < normalizedAbilities.length; i++) {
    if (!inTurn[i] && (normalizedAbilities[i].kind === AbilityKind.BASIC || normalizedAbilities[i].kind === AbilityKind.SKILL)) {
      turnStarts[i] = true
      turnEnds[i] = true
    }
  }
}

/**
 * Step 6: Dissolve turns without BASIC/SKILL
 */
function dissolveTurnsWithoutBasicOrSkill(state: TurnState): void {
  const { normalizedAbilities, turnRanges, turnStarts, turnEnds } = state

  // Check each turn for BASIC/SKILL
  for (const range of turnRanges) {
    let hasBasicOrSkill = false

    for (let i = range.start; i <= range.end; i++) {
      const ability = normalizedAbilities[i]
      if (ability.kind === AbilityKind.BASIC || ability.kind === AbilityKind.SKILL) {
        hasBasicOrSkill = true
        break
      }
    }

    // Dissolve turn if it doesn't have BASIC/SKILL
    if (!hasBasicOrSkill) {
      turnStarts[range.start] = false
      turnEnds[range.end] = false
    }
  }
}

/**
 * Step 7: Extend turns to incorporate orphaned ULTs
 */
function extendTurnsForOrphanedUlts(state: TurnState): void {
  const { normalizedAbilities, turnRanges, turnStarts, turnEnds } = state

  // Process each turn
  for (const range of turnRanges) {
    if (range.start === 0) continue

    // Look backward for ULTs
    let i = range.start - 1
    while (i >= 0) {
      // Stop if we hit another turn's end
      if (turnEnds[i]) break

      // Stop if we hit another turn's start
      if (turnStarts[i]) break

      if (normalizedAbilities[i].kind === AbilityKind.ULT) {
        // Extend turn to include this ULT
        turnStarts[i] = true
        turnStarts[range.start] = false

        // Update the range for future checks
        range.start = i
      }

      i--
    }
  }
}

/**
 * Final step: Generate final ability sequence with proper turn markers
 */
function generateFinalSequence(state: TurnState): TurnAbility[] {
  const { normalizedAbilities, turnStarts, turnEnds } = state
  const result: TurnAbility[] = []

  for (let i = 0; i < normalizedAbilities.length; i++) {
    const ability = normalizedAbilities[i]
    const kind = ability.kind

    if (turnStarts[i] && turnEnds[i]) {
      result.push(createAbility(kind, TurnMarker.WHOLE))
    } else if (turnStarts[i]) {
      result.push(createAbility(kind, TurnMarker.START))
    } else if (turnEnds[i]) {
      result.push(createAbility(kind, TurnMarker.END))
    } else {
      result.push(createAbility(kind, TurnMarker.DEFAULT))
    }
  }

  return result
}
