import { Eidolon as $$Eidolon } from 'types/Character'
import { Modifiers } from '../stats/modifier'
import { StepBuilder } from '../step/builder'
import { Formula } from '../step/formula'
import { Step } from '../step/step'

/**
 * Files in this folder are a big TODO
 */
/**
 * {@link StepProvider} can look at the action list and provide a matching step.
 */
export type StepProvider = {
  getStep(): Step[]
}

export type CharacterSteps = {
  steps: StepBuilder[]
  modifiers: Modifiers
  type: string
}

export type CharacterPreset = {
  type: string
  formula: Formula
}

export type Eidolon = $$Eidolon

// TODO Eidolon is not considered in any of the check. Expect some refactor
// there. We could (and should) modify any API here.
export abstract class Character<T = object> {
  constructor(protected eidolon: Eidolon, protected metadata: T) {}
  abstract readonly asTeammate: Modifiers
  // This one is a big TODO
  abstract readonly asOptiTarget: CharacterSteps[]
  abstract readonly presets: CharacterPreset[]
}
