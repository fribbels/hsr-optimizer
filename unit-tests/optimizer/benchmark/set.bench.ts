/**
 * Set effects collection benchmarking.
 *
 * Highly recommended to run this benchmark with any command prompt.
 *
 * Run the run file from the root directory (for correct node module file
 * resolution). Alternatively, in the root folder, run ```npx vitest bench
 * tests/optimizer/benchmark/set.bench.ts```.
 *
 * An extra turbofan tracing command is included in the trace_turbo fan with the
 * approriate filter set. I used this mainly because of paranoid from dead code
 * elimination.
 */

import { BuildCandidate } from 'lib/optimizer/new/opt/iteration/build'
import { getSetEffects } from 'lib/optimizer/new/opt/iteration/set'
import { getSetEffects2 } from 'lib/optimizer/new/opt/iteration/set_experimental'
import { bench, describe } from 'vitest'
import { extendedRelics, limitedRelics, limitedSetEffects } from '../jingliu/relics'

// 4 Hunters - 2 Rutilant
const candidate1: BuildCandidate = {
  head: limitedRelics.head[0],
  hand: limitedRelics.hand[0],
  body: limitedRelics.feet[0],
  feet: limitedRelics.feet[0],
  sphere: limitedRelics.sphere[0],
  rope: limitedRelics.rope[0],
}

// 3 Hunters, 1 Genius - 2 Rutilant
const candidate2: BuildCandidate = {
  head: extendedRelics.head[2],
  hand: limitedRelics.hand[0],
  body: limitedRelics.feet[0],
  feet: limitedRelics.feet[0],
  sphere: limitedRelics.sphere[0],
  rope: limitedRelics.rope[0],
}

// Make sure that turbofan is triggered
const options: Parameters<typeof bench>[2] = {
  warmupIterations: 10000,
}

/**
 * For those who doesn't wanna run the benchmark themself, the adhoc version is
 * much more performant and resilient to deoptimization.
 *
 * On the same VM, ad hoc version may outperform as far as 2x throughput
 * compared to the supposedly clean and easy to understand object as map
 * version. Reason? I'm not into V8 performance, how would I know?
 *
 * One thing I do notice from the traces is that getSetEffects2 trace file is a
 * fair bit longer than getSetEffects, indicating longer compilation pipeline
 * and less successful speculative optimization.
 */
describe('Set effects logic benchmarking', () => {
  describe.shuffle('set 4 - 2', () => {
    bench('object as map', () => {
      getSetEffects2(candidate1, limitedSetEffects)
    }, options)
    bench('ad hoc logic', () => {
      getSetEffects(candidate1, limitedSetEffects)
    }, options)
  })
  describe.shuffle('set 3/1 - 2', () => {
    bench('object as map', () => {
      getSetEffects2(candidate2, limitedSetEffects)
    }, options)
    bench('ad hoc logic', () => {
      getSetEffects(candidate2, limitedSetEffects)
    }, options)
  })
})
