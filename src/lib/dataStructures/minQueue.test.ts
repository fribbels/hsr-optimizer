import { describe, expect, it } from 'vitest'
import { MinQueue } from 'lib/dataStructures/minQueue'
import { FixedSizeNumericMinQueue } from 'lib/dataStructures/fixedSizeMinQueue'

describe('MinQueue', () => {
  it('basic push and pop', () => {
    const q = new MinQueue(10, Uint32Array)
    q.push(1, 10)
    q.push(2, 5)
    q.push(3, 15)

    expect(q.peekPriority()).toBe(5)
    expect(q.peekKey()).toBe(2)
    expect(q.length).toBe(3)

    const popped = q.pop()
    expect(popped).toBe(2)
    expect(q.length).toBe(2)
    expect(q.peekPriority()).toBe(10)
  })

  it('pop then push (lazy pop optimization)', () => {
    const q = new MinQueue(10, Uint32Array)
    q.push(1, 10)
    q.push(2, 5)
    q.push(3, 15)

    q.pop()      // removes key=2 (priority 5, the minimum); sets _hasPoppedElement=true
    q.push(4, 8) // takes the lazy path: writes (4,8) directly to root slot, then sifts down

    expect(q.length).toBe(3)
    expect(q.peekPriority()).toBe(8)
    expect(q.peekKey()).toBe(4)
  })

  it('push then pop then peek (fixedSizePushOvercapped pattern)', () => {
    const q = new MinQueue(4, Uint32Array) // capacity 4
    q.push(1, 10)
    q.push(2, 20)
    q.push(3, 30)

    // Mirrors the fixedSizePushOvercapped sequence: push overcapacity, pop min, peek new min
    q.push(4, 25) // length=4
    q.pop()       // lazy — evicts 10 (the current min), length=3
    const newMin = q.peekPriority() // flushes the lazy pop, returns new min

    // Min 10 is gone; remaining {20, 25, 30} → new min is 20
    expect(newMin).toBe(20)
    expect(q.length).toBe(3)
  })

  it('repeated push-pop-peek cycles preserve correctness', () => {
    const q = new MinQueue(110, Uint32Array)
    const limit = 100

    // Fill with values 1..100
    for (let i = 1; i <= limit; i++) {
      q.push(i, i)
    }
    expect(q.length).toBe(100)
    expect(q.peekPriority()).toBe(1)

    // Replace min repeatedly with higher values.
    // At step newVal we push newVal and evict the current minimum.
    // Starting from {1..100}, after replacing 1→101, 2→102, ..., the min at step newVal is (newVal - 99).
    for (let newVal = 101; newVal <= 200; newVal++) {
      q.push(newVal, newVal) // push (length -> 101)
      q.pop()                // pop min (length -> 100, lazy)
      const min = q.peekPriority() // flush

      expect(min).toBe(newVal - 99)
    }

    // Final heap should contain 101..200
    expect(q.length).toBe(100)
    q.flush()

    const values: number[] = []
    for (let i = 1; i <= q.length; i++) {
      values.push(q.priorityAt(i))
    }
    values.sort((a, b) => a - b)
    expect(values).toEqual(Array.from({ length: 100 }, (_, i) => 101 + i))
  })

  it('handles equal priorities', () => {
    const q = new MinQueue(10, Uint32Array)
    q.push(1, 5)
    q.push(2, 5)
    q.push(3, 5)

    expect(q.peekPriority()).toBe(5)
    expect(q.length).toBe(3)

    q.pop()
    expect(q.length).toBe(2)
    expect(q.peekPriority()).toBe(5)
  })

  it('single element push-pop-peek', () => {
    const q = new MinQueue(2, Uint32Array)
    q.push(1, 10)

    q.push(2, 20)
    q.pop()
    expect(q.peekPriority()).toBe(20)
    expect(q.length).toBe(1)
  })
})

describe('FixedSizeNumericMinQueue', () => {
  it('basic fill and threshold', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(10)
  })

  it('rejects values below threshold when full', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    q.fixedSizePush(4, 5) // below min (10), rejected — queue unchanged
    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(10)
  })

  it('accepts values above threshold when full', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    q.fixedSizePush(4, 25) // above min (10), evicts 10
    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(20) // new min
  })

  it('accepts values equal to threshold when full (>= semantics)', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    // priority == topPriority (10): the >= check accepts and evicts the old minimum.
    // Caller guards use `<= top` to skip equal-priority before calling,
    // but the implementation itself accepts ties.
    q.fixedSizePush(4, 10)
    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(10) // still 10; a different key now holds it
  })

  it('fixedSizePushOvercapped basic', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    const newTop = q.fixedSizePushOvercapped(4, 25)
    expect(newTop).toBe(20) // evicted 10, new min is 20
    expect(q.size()).toBe(3)
  })

  it('fixedSizePushOvercapped repeated - simulating GPU hot loop', () => {
    const limit = 100
    const q = new FixedSizeNumericMinQueue(limit)

    // Fill the queue with values 1..100
    for (let i = 0; i < limit; i++) {
      q.fixedSizePush(i, i + 1)
    }
    expect(q.size()).toBe(limit)
    expect(q.topPriority()).toBe(1)

    // Simulate GPU hot loop: push values 101..10000 using fixedSizePushOvercapped.
    // The threshold (top) tightens each time a new value is accepted, so cheap
    // comparisons gate the expensive push in the critical path.
    let top = q.topPriority()
    for (let i = limit; i < 10000; i++) {
      const value = i + 1 // values 101..10000
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)
    }

    // Queue should contain the top 100 values: 9901..10000
    expect(q.size()).toBe(limit)
    expect(q.topPriority()).toBe(9901)

    const results = q.toResults()
    expect(results.length).toBe(limit)

    const values = results.map((r) => r.value).sort((a, b) => a - b)
    expect(values).toEqual(Array.from({ length: limit }, (_, i) => 9901 + i))

    // Also verify keys match
    const indices = results.map((r) => r.index).sort((a, b) => a - b)
    expect(indices).toEqual(Array.from({ length: limit }, (_, i) => 9900 + i))
  })

  it('fixedSizePushOvercapped with random data - stress test', () => {
    const limit = 50
    const q = new FixedSizeNumericMinQueue(limit)
    const allValues: { key: number; value: number }[] = []

    // Generate random data
    const rng = mulberry32(12345) // deterministic seed
    for (let i = 0; i < 10000; i++) {
      allValues.push({ key: i, value: rng() * 1000 })
    }

    // Process through the queue (simulating the GPU pattern)
    let top = 0
    for (const { key, value } of allValues) {
      if (q.size() >= limit) {
        if (value <= top) continue
        top = q.fixedSizePushOvercapped(key, value)
      } else {
        q.fixedSizePush(key, value)
        top = q.topPriority()
      }
    }

    // Verify: queue should contain the top 50 values
    const results = q.toResults()
    const queueValues = results.map((r) => r.value).sort((a, b) => a - b)

    const sortedAll = [...allValues].sort((a, b) => b.value - a.value) // descending
    const expectedTop50 = sortedAll.slice(0, limit).map((r) => r.value).sort((a, b) => a - b)

    expect(queueValues).toEqual(expectedTop50)
  })

  it('toResults returns correct key-value pairs', () => {
    const q = new FixedSizeNumericMinQueue(5)
    q.fixedSizePush(100, 10)
    q.fixedSizePush(200, 20)
    q.fixedSizePush(300, 30)
    q.fixedSizePush(400, 40)
    q.fixedSizePush(500, 50)

    const results = q.toResults().sort((a, b) => a.value - b.value)
    expect(results).toEqual([
      { index: 100, value: 10 },
      { index: 200, value: 20 },
      { index: 300, value: 30 },
      { index: 400, value: 40 },
      { index: 500, value: 50 },
    ])
  })

  it('transition from not-full to full within loop', () => {
    const limit = 5
    const q = new FixedSizeNumericMinQueue(limit)

    // Simulate the processCompactResults not-yet-full branch
    const values = [50, 30, 10, 40, 20, 60, 5, 70, 15, 80]
    let top = 0

    for (let i = 0; i < values.length; i++) {
      const value = values[i]
      if (value <= top && q.size() >= limit) continue
      q.fixedSizePush(i, value)
      top = q.topPriority()
    }

    // Fill phase [50, 30, 10, 40, 20]: queue full, min=10, top=10
    // Post-fill evictions:
    //   60 > 10 → evicts 10, min=20, top=20
    //    5 ≤ 20 → skip
    //   70 > 20 → evicts 20, min=30, top=30
    //   15 ≤ 30 → skip
    //   80 > 30 → evicts 30, min=40, top=40
    // Remaining: {40, 50, 60, 70, 80}

    expect(q.size()).toBe(5)
    const results = q.toResults().map((r) => r.value).sort((a, b) => a - b)
    expect(results).toEqual([40, 50, 60, 70, 80])
  })

  it('GPU optimizer pattern: threshold feedback simulation', () => {
    // Simulates the GPU optimizer's batched processing loop:
    // after each batch, the updated threshold gates the next batch.
    const limit = 10
    const q = new FixedSizeNumericMinQueue(limit)

    // Batch 1: values 1-100 → queue fills with top 10: {91..100}
    let top = 0
    for (let i = 0; i < 100; i++) {
      const value = i + 1
      if (q.size() >= limit) {
        if (value <= top) continue
        top = q.fixedSizePushOvercapped(i, value)
      } else {
        q.fixedSizePush(i, value)
        top = q.topPriority()
      }
    }
    expect(q.topPriority()).toBe(91)

    // Batch 2: GPU threshold is 91, only values > 91 are sent.
    // Processing values 101-200 raises the top-10 to {191..200}.
    const threshold1 = q.topPriority()
    for (let i = 100; i < 200; i++) {
      const value = i + 1
      if (value <= threshold1) continue // GPU filter
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)
    }
    expect(q.topPriority()).toBe(191)

    // Batch 3: threshold is 191 → top-10 becomes {291..300}
    const threshold2 = q.topPriority()
    for (let i = 200; i < 300; i++) {
      const value = i + 1
      if (value <= threshold2) continue // GPU filter
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)
    }
    expect(q.topPriority()).toBe(291)

    // Final check: queue should contain 291-300
    const results = q.toResults().map((r) => r.value).sort((a, b) => a - b)
    expect(results).toEqual(Array.from({ length: 10 }, (_, i) => 291 + i))
  })

  it('large-scale stress test with many fixedSizePushOvercapped calls', () => {
    const limit = 1024
    const q = new FixedSizeNumericMinQueue(limit)

    // Fill
    for (let i = 0; i < limit; i++) {
      q.fixedSizePush(i, i + 1)
    }

    // Push 100K values
    let top = q.topPriority()
    for (let i = limit; i < 100000; i++) {
      const value = i + 1
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)
    }

    // Should have top 1024 values: 98977..100000
    expect(q.topPriority()).toBe(100000 - 1024 + 1)
    expect(q.size()).toBe(limit)

    const results = q.toResults()
    const values = results.map((r) => r.value).sort((a, b) => a - b)
    expect(values[0]).toBe(100000 - 1024 + 1)
    expect(values[values.length - 1]).toBe(100000)
  })

  it('non-monotonic value insertion preserves top-N', () => {
    // Insert values in a pattern that's not monotonically increasing
    // This tests the threshold correctly handles values arriving out of order
    const limit = 5
    const q = new FixedSizeNumericMinQueue(limit)

    const values = [10, 50, 30, 90, 20, 80, 40, 70, 60, 100, 5, 95, 15, 85, 25, 75, 35, 65, 45, 55]

    let top = 0
    for (let i = 0; i < values.length; i++) {
      if (q.size() >= limit) {
        if (values[i] <= top) continue
        top = q.fixedSizePushOvercapped(i, values[i])
      } else {
        q.fixedSizePush(i, values[i])
        top = q.topPriority()
      }
    }

    // Top 5 from this set: 100, 95, 90, 85, 80
    const results = q.toResults().map((r) => r.value).sort((a, b) => b - a)
    expect(results).toEqual([100, 95, 90, 85, 80])
  })

  it('verifies heap invariant is maintained throughout operations', () => {
    const limit = 20
    const q = new FixedSizeNumericMinQueue(limit)

    const rng = mulberry32(42)

    // Fill with random values
    for (let i = 0; i < limit; i++) {
      q.fixedSizePush(i, rng() * 1000)
    }

    // Do many push operations and check heap invariant after each
    let top = q.topPriority()
    for (let i = limit; i < 5000; i++) {
      const value = rng() * 1000
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)

      // Verify heap invariant: topPriority() must equal the actual minimum stored value
      verifyHeapInvariant(q)
    }
  })
})

// Simple deterministic PRNG (mulberry32)
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// =====================================================================
// Key type overflow: Uint32Array vs Float64Array
//
// MinQueue accepts a KeyArray constructor to control key storage.
// Uint32Array overflows at 2^32 (4,294,967,295), so callers expecting
// permutation indices above that limit must use Float64Array.
// FixedSizeNumericMinQueue uses Float64Array internally, which stores
// integers up to 2^53 exactly and handles the full permutation space.
// =====================================================================
describe('key type overflow', () => {
  it('Uint32Array truncates keys > 2^32, Float64Array preserves them', () => {
    const q32 = new MinQueue(4, Uint32Array)
    const q64 = new MinQueue(4, Float64Array)

    const largeIndex = 5_000_000_000 // 5 billion > 2^32 (4,294,967,295)
    q32.push(largeIndex, 100)
    q64.push(largeIndex, 100)

    // Uint32Array wraps: 5000000000 % 2^32 = 705032704
    expect(q32.peekKey()).toBe(705032704)
    // Float64Array stores integers up to 2^53 exactly
    expect(q64.peekKey()).toBe(largeIndex)
  })

  it('FixedSizeNumericMinQueue preserves large indices for large permutation counts', () => {
    // FixedSizeNumericMinQueue uses Float64Array for keys, so permutation indices
    // above 2^32 are stored exactly. A user with ~50 relics/slot has 50^6 ≈ 15.6 billion
    // permutations — well above Uint32's 4.3 billion limit.
    const limit = 3
    const q = new FixedSizeNumericMinQueue(limit)

    q.fixedSizePush(1000, 50)
    q.fixedSizePush(2000, 60)
    q.fixedSizePush(3000, 70)

    // Simulate a late-iteration result with index > 2^32
    const lateIndex = 5_000_000_000
    q.fixedSizePushOvercapped(lateIndex, 80) // evicts 50 (min), inserts (5B, 80)

    // Queue should contain indices 2000, 3000, 5000000000 with values 60, 70, 80
    const results = q.toResults().sort((a, b) => a.value - b.value)

    expect(results[0]).toEqual({ index: 2000, value: 60 })
    expect(results[1]).toEqual({ index: 3000, value: 70 })
    expect(results[2]).toEqual({ index: 5_000_000_000, value: 80 })
  })

  it('simulates GPU optimizer pattern with large permutation space', () => {
    // A user with ~50 relics per slot has 50^6 ≈ 15.6 billion permutations.
    // Later dispatches have offsets > 2^32, so the global index must survive
    // round-trip through the queue for correct build reconstruction.
    const limit = 5
    const q = new FixedSizeNumericMinQueue(limit)

    // Fill queue with early results (correct indices)
    for (let i = 0; i < limit; i++) {
      q.fixedSizePush(i * 1000, (i + 1) * 10)
    }
    // Queue: indices [0, 1000, 2000, 3000, 4000], values [10, 20, 30, 40, 50]

    // Later dispatch with offset > 2^32
    const offset = 5_000_000_000
    let top = q.topPriority() // 10

    // Push a great result from the late dispatch
    const localIndex = 42
    const globalIndex = offset + localIndex // 5,000,000,042
    const value = 100
    if (value > top) {
      top = q.fixedSizePushOvercapped(globalIndex, value)
    }

    // Reconstruct the result — global index must be exact for build identification
    const results = q.toResults()
    const bestResult = results.find((r) => r.value === 100)!
    expect(bestResult.index).toBe(5_000_000_042)
  })
})

function verifyHeapInvariant(q: FixedSizeNumericMinQueue) {
  // Read all stored values and confirm topPriority() equals the actual minimum.
  // toResults() calls flush() internally, so the heap is in a consistent state after.
  const results = q.toResults()
  if (results.length <= 1) return

  const minValue = Math.min(...results.map((r) => r.value))
  const reportedMin = q.topPriority()
  if (Math.abs(reportedMin - minValue) > 1e-10) {
    throw new Error(`Heap invariant violated: topPriority()=${reportedMin} but actual min=${minValue}`)
  }
}
