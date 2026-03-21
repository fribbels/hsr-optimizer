import { MinQueue } from 'lib/dataStructures/minQueue'

/**
 * Fixed-size min-heap for numeric (key, priority) pairs.
 * Keeps the top N highest-priority items. The minimum (worst) is evicted when full.
 * Zero object allocation — stores keys and priorities directly in typed arrays.
 *
 * Used by the GPU optimizer path where items are just (index, value) pairs.
 */
export class FixedSizeNumericMinQueue {
  private heap: MinQueue
  readonly limit: number

  constructor(limit: number) {
    this.limit = limit
    this.heap = new MinQueue(limit + 1, Float64Array)
  }

  size(): number { return this.heap.length }

  topPriority(): number { return this.heap.peekPriority() }

  topKey(): number { return this.heap.peekKey() }

  fixedSizePush(key: number, priority: number): void {
    if (this.heap.length >= this.limit) {
      if (priority >= this.heap.peekPriority()) {
        this.heap.pop()
        this.heap.push(key, priority)
      }
    } else {
      this.heap.push(key, priority)
    }
  }

  /**
   * Push then pop — assumes queue is at capacity.
   * Returns the new top priority (a valid, slightly tighter threshold for filtering).
   */
  fixedSizePushOvercapped(key: number, priority: number): number {
    this.heap.push(key, priority)
    this.heap.pop()
    return this.heap.peekPriority()
  }

  toResults(): { index: number; value: number }[] {
    this.heap.flush()
    const result: { index: number; value: number }[] = []
    for (let i = 1; i <= this.heap.length; i++) {
      result.push({ index: this.heap.keyAt(i), value: this.heap.priorityAt(i) })
    }
    return result
  }
}

/**
 * Fixed-size min-heap that stores arbitrary objects alongside their priorities.
 * Keeps the top N highest-priority items. The minimum (worst) is evicted when full.
 *
 * Objects are stored in a parallel array indexed by MinQueue keys.
 * When evicting, the evicted ID's slot is reused for the new item — no memory growth.
 *
 * Used by the CPU optimizer path where items are large OptimizerDisplayData objects.
 */
export class FixedSizeMinQueue<T> {
  private heap: MinQueue
  private objects: T[]
  private nextId = 0
  readonly limit: number

  constructor(limit: number) {
    this.limit = limit
    this.heap = new MinQueue(limit + 1, Uint32Array)
    this.objects = new Array(limit + 1)
  }

  size(): number { return this.heap.length }

  top(): T | undefined {
    return this.heap.length > 0 ? this.objects[this.heap.peekKey()] : undefined
  }

  topPriority(): number { return this.heap.peekPriority() }

  fixedSizePush(item: T, priority: number): void {
    if (this.heap.length >= this.limit) {
      if (priority >= this.heap.peekPriority()) {
        const evictedId = this.heap.pop()!
        this.objects[evictedId] = item
        this.heap.push(evictedId, priority)
      }
    } else {
      const id = this.nextId++
      this.objects[id] = item
      this.heap.push(id, priority)
    }
  }

  toArray(): T[] {
    this.heap.flush()
    const result: T[] = []
    for (let i = 1; i <= this.heap.length; i++) {
      result.push(this.objects[this.heap.keyAt(i)]!)
    }
    return result
  }
}
