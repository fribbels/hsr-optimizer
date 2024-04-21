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
  // how is each step constructed? Note that the array is a step builder array,
  // allowing downstream to customize behavior of each step, for example, if
  // these steps should use average crit or all crit.
  //
  // Note: currently StepBuilder is an empty type.
  steps: StepBuilder[]
  // all steps will have this global modifiers
  modifiers: Modifiers
  // what is target called? Normal Attack, Skill, Ultimate?
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
