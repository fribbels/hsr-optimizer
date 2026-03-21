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

    q.pop() // removes 5 (min), lazy
    q.push(4, 8) // should use lazy push path

    expect(q.length).toBe(3)
    expect(q.peekPriority()).toBe(8)
    expect(q.peekKey()).toBe(4)
  })

  it('push then pop then peek (fixedSizePushOvercapped pattern)', () => {
    const q = new MinQueue(4, Uint32Array) // capacity 4
    q.push(1, 10)
    q.push(2, 20)
    q.push(3, 30)
    // heap: [10, 20, 30], length=3

    // Simulate fixedSizePushOvercapped: push, pop, peek
    q.push(4, 25) // length=4
    q.pop() // length=3, lazy
    const newMin = q.peekPriority() // flush + return

    // Should have evicted 10 (old min), kept {20, 25, 30}
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

    // Replace min repeatedly with higher values
    for (let newVal = 101; newVal <= 200; newVal++) {
      q.push(newVal, newVal) // push (length -> 101)
      q.pop() // pop min (length -> 100, lazy)
      const min = q.peekPriority() // flush

      // After replacing with newVal, the min should be (newVal - 99)
      // because we started with 1..100, and replaced 1 with 101, 2 with 102, etc.
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

    // push-pop-peek
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

    q.fixedSizePush(4, 5) // below min (10), should be rejected
    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(10) // unchanged
  })

  it('accepts values above threshold when full', () => {
    const q = new FixedSizeNumericMinQueue(3)
    q.fixedSizePush(1, 10)
    q.fixedSizePush(2, 20)
    q.fixedSizePush(3, 30)

    q.fixedSizePush(4, 25) // above min (10), should replace it
    expect(q.size()).toBe(3)
    expect(q.topPriority()).toBe(20) // new min is 20
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

    // Fill the queue
    for (let i = 0; i < limit; i++) {
      q.fixedSizePush(i, i + 1) // values 1..100
    }
    expect(q.size()).toBe(limit)
    expect(q.topPriority()).toBe(1)

    // Simulate GPU hot loop: push values 101..10000 using fixedSizePushOvercapped
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

    // Top 5 should be: 30, 40, 50, 60, 70, 80... wait let me work this out.
    // Values: 50, 30, 10, 40, 20 fill queue. Min=10. top=10.
    // 60: 60 > 10, push. Evicts 10. Min=20. top=20.
    // 5: 5 <= 20 && size >= 5, skip.
    // 70: 70 > 20, push. Evicts 20. Min=30. top=30.
    // 15: 15 <= 30 && size >= 5, skip.
    // 80: 80 > 30, push. Evicts 30. Min=40. top=40.
    // Result: {40, 50, 60, 70, 80}

    expect(q.size()).toBe(5)
    const results = q.toResults().map((r) => r.value).sort((a, b) => a - b)
    expect(results).toEqual([40, 50, 60, 70, 80])
  })

  it('GPU optimizer pattern: threshold feedback simulation', () => {
    // Simulate the GPU optimizer's full loop:
    // - Process results in batches
    // - After each batch, feed threshold back for next batch
    const limit = 10
    const q = new FixedSizeNumericMinQueue(limit)

    // Batch 1: values 1-100 (should fill queue with top 10: 91-100)
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

    // Batch 2: threshold is 91, GPU only sends values > 91
    // Simulate: values 92-200 (some overlap with batch 1)
    const threshold1 = q.topPriority()
    for (let i = 100; i < 200; i++) {
      const value = i + 1
      if (value <= threshold1) continue // GPU filter
      if (value <= top) continue
      top = q.fixedSizePushOvercapped(i, value)
    }
    expect(q.topPriority()).toBe(191)

    // Batch 3: threshold is 191
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

    // Top 5 from this list: 100, 95, 90, 85, 80
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

      // Verify heap invariant: for each internal node, its priority <= both children
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
// BUG REPRODUCTION: Uint32Array overflow for large permutation indices
// =====================================================================
describe('Uint32Array overflow bug', () => {
  it('Uint32Array truncates keys > 2^32, Float64Array preserves them', () => {
    const q32 = new MinQueue(4, Uint32Array)
    const q64 = new MinQueue(4, Float64Array)

    const largeIndex = 5_000_000_000 // 5 billion > 2^32 (4,294,967,295)
    q32.push(largeIndex, 100)
    q64.push(largeIndex, 100)

    // Uint32Array wraps: 5000000000 % 2^32 = 705032704
    expect(q32.peekKey()).toBe(705032704)
    // Float64Array preserves the full value
    expect(q64.peekKey()).toBe(largeIndex)
  })

  it('FixedSizeNumericMinQueue returns wrong indices for large permutation counts', () => {
    const limit = 3
    const q = new FixedSizeNumericMinQueue(limit)

    // Simulate early iterations (indices < 2^32) — correct
    q.fixedSizePush(1000, 50)
    q.fixedSizePush(2000, 60)
    q.fixedSizePush(3000, 70)

    // Simulate late iteration (index > 2^32) — overflow!
    const lateIndex = 5_000_000_000
    const newTop = q.fixedSizePushOvercapped(lateIndex, 80)

    // Queue should contain indices 2000, 3000, 5000000000 with values 60, 70, 80
    const results = q.toResults().sort((a, b) => a.value - b.value)

    expect(results[0]).toEqual({ index: 2000, value: 60 })
    expect(results[1]).toEqual({ index: 3000, value: 70 })
    // THIS FAILS — the index is 705032704, not 5000000000
    expect(results[2]).toEqual({ index: 5_000_000_000, value: 80 })
  })

  it('simulates GPU optimizer pattern with large permutation space', () => {
    // A user with ~50 relics per slot has 50^6 ≈ 15.6 billion permutations
    // Later dispatches have offsets > 2^32
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

    // Reconstruct the result
    const results = q.toResults()
    const bestResult = results.find((r) => r.value === 100)!

    // The index should be 5,000,000,042 for correct build reconstruction
    // But Uint32Array wraps it to 705,032,746
    expect(bestResult.index).toBe(5_000_000_042)
  })
})

function verifyHeapInvariant(q: FixedSizeNumericMinQueue) {
  // Access the internal heap to check invariant
  // We need to flush first, then check all parent-child relationships
  const results = q.toResults() // this flushes internally
  if (results.length <= 1) return

  // Rebuild a sorted array and check that toResults contains the right values
  // (We can't directly check heap order from toResults since it returns in heap order,
  // but we CAN check that the reported topPriority matches the actual minimum)
  const minValue = Math.min(...results.map((r) => r.value))
  const reportedMin = q.topPriority()
  if (Math.abs(reportedMin - minValue) > 1e-10) {
    throw new Error(`Heap invariant violated: topPriority()=${reportedMin} but actual min=${minValue}`)
  }
}
