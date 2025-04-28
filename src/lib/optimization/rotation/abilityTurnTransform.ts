import { isEndTurnAbility, isFullTurnAbility, isRegularAbility, isStartTurnAbility, TurnAbility } from 'lib/optimization/rotation/abilityConfig'

type TurnState = {
  turnActive: boolean
}

/**
 * Corrects for invalid turn configurations by applying some heuristics and fixing up the turn markers
 */
export function preprocessAbilityTurns(inputAbilities: TurnAbility[]) {
  const outputAbilities: TurnAbility[] = []
  const state: TurnState = {
    turnActive: false,
  }

  for (let i = 0; i < inputAbilities.length; i++) {
    if (state.turnActive) {
      outputAbilities.push(handleActiveTurn(i, inputAbilities, outputAbilities, state))
    } else {
      outputAbilities.push(handleInactiveTurn(i, inputAbilities, outputAbilities, state))
    }
  }
}

/**
 * Turns: Groupings of actions. Regular abilities can appear outside of a turn grouping as they can trigger in-between turns.
 * Regular abilities can also appear between the START and END markers as part of the turn grouping.
 *
 * START_TURN: Begins a new turn
 * END_TURN: Ends the current turn
 */

function handleActiveTurn(i: number, inputAbilities: TurnAbility[], outputAbilities: TurnAbility[], state: TurnState) {
  const currentAbility = inputAbilities[i]

  if (isStartTurnAbility(currentAbility)) {
    // Tried to start another turn while an existing turn was active. Convert the previous action to include an end state, and make this action a start action. Turn should be active still
    // state.turnActive = ?
    // return ?
  }
  if (isEndTurnAbility(currentAbility)) {
    // This ends the turn which is a valid action, since the there was an active turn in the state. Return this and deactivate the turn.
    // state.turnActive = ?
    // return ?
  }
  if (isFullTurnAbility(currentAbility)) {
    // This is invalid, the previous action needs to be adjusted to include an end state and then this action also ends the turn since its a full turn
    // state.turnActive = ?
    // return ?
  }
  if (isRegularAbility(currentAbility)) {
    // This is valid, the regular ability is a continuation of the turn chain
    // state.turnActive = ?
    // return ?
  }

  // Should not happen
  return currentAbility
}

function handleInactiveTurn(i: number, inputAbilities: TurnAbility[], outputAbilities: TurnAbility[], state: TurnState) {
  const currentAbility = inputAbilities[i]

  if (isStartTurnAbility(currentAbility)) {
    // state.turnActive = ?
    // return ?
  }
  if (isEndTurnAbility(currentAbility)) {
    // state.turnActive = ?
    // return ?
  }
  if (isFullTurnAbility(currentAbility)) {
    // state.turnActive = ?
    // return ?
  }
  if (isRegularAbility(currentAbility)) {
    // state.turnActive = ?
    // return ?
  }

  // Should not happen
  return currentAbility
}
