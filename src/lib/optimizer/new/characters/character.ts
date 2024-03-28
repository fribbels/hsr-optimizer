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
