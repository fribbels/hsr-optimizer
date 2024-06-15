import { Serializable } from '../../format/serializable'
import { EarlyConditional, LateConditional } from '../../stats/conditional'
import { HsrElement, Trait } from '../../stats/context'
import { StepAlgorithm } from '../calculation/calculation'
import { StatLimit } from '../step'

type Producer<T> = (oldVal: T | undefined) => T | undefined

type StepContext = {
  element: HsrElement
  trait: Trait[]
}

type SerializedStep = {
  calculation: StepAlgorithm
  context: StepContext
  // We don't need to serialize stats, because web worker doesn't need them.
  // Everything is already calculated in formula into 'pre' StatCollector.
  /* stats: Map<string,Producer<EarlyConditional | LateConditional> */
  limit?: StatLimit
}

/**
 * A step contains the instruction to get the optimization target index that
 * could be used for comparision. Each step has a single final
 * {@link FinalStats} that it could works with, it cannot modify any stats.
 */
export class Step implements Serializable<SerializedStep, Step> {
  constructor(
    readonly calculation: StepAlgorithm,
    readonly context: StepContext,
    readonly stat?: Map<string, Producer<EarlyConditional | LateConditional>>,
    readonly limit?: StatLimit,
  ) {}

  serialize(): SerializedStep {
    return {
      calculation: this.calculation,
      context: this.context,
      limit: this.limit,
    }
  }

  __deserialize(json: SerializedStep): Step {
    return new Step(json.calculation, json.context, undefined, json.limit)
  }
}
