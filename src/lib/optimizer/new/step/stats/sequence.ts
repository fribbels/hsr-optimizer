import { EarlyConditional, LateConditional } from '../../stats/conditional'
import { Step } from '../step'

// This file is a TODO
type Stats = {
  early: EarlyConditional[]
  late: LateConditional[]
}

type StatsBuilder = () => Stats

export type StepSequence = {
  readonly parent: StepSequence
  children(): Iterator<[Step | StepSequence, StatsBuilder]>
}
