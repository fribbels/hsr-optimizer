/**
 * MinPriorityQueue backed by TypedArrays.
 * Forked from heapify (MIT) — https://github.com/luciopaiva/heapify
 *
 * 1-indexed binary min-heap. Stores (key, priority: float64) pairs.
 * Zero GC pressure — all operations mutate pre-allocated typed arrays.
 *
 * Uses a lazy-pop optimization: after pop(), the root slot isn't immediately
 * filled. Instead, a flag is set, and the sift-down is deferred until the
 * next operation that reads the heap. This makes pop-then-push sequences
 * equivalent to a single replaceTop (one sift instead of two).
 *
 * @param KeyArray — The typed array constructor for keys:
 *   - Uint32Array: max 4,294,967,295. Use for small integer IDs (e.g. node IDs).
 *   - Float64Array: max 9,007,199,254,740,991. Use when keys can exceed 4,294,967,295 (e.g. permutation indices).
 */
export class MinQueue {
  private _capacity: number
  private _keys: Uint32Array | Float64Array
  private _priorities: Float64Array
  private _hasPoppedElement: boolean
  private _KeyArray: typeof Uint32Array | typeof Float64Array
  length: number

  constructor(capacity: number, KeyArray: typeof Uint32Array | typeof Float64Array) {
    this._capacity = capacity
    this._KeyArray = KeyArray
    this._keys = new KeyArray(capacity + 1)
    this._priorities = new Float64Array(capacity + 1)
    this._hasPoppedElement = false
    this.length = 0
  }

  clear(): void {
    this.length = 0
    this._hasPoppedElement = false
  }

  push(key: number, priority: number): void {
    if (this.length === this._capacity) {
      this._grow()
    }

    if (this._hasPoppedElement) {
      this._keys[1] = key
      this._priorities[1] = priority
      this.length++
      this._bubbleDown(1)
      this._hasPoppedElement = false
    } else {
      const pos = this.length + 1
      this._keys[pos] = key
      this._priorities[pos] = priority
      this.length++
      this._bubbleUp(pos)
    }
  }

  pop(): number | undefined {
    if (this.length === 0) return undefined
    this._flushPoppedElement()
    this.length--
    this._hasPoppedElement = true
    return this._keys[1]
  }

  /** Returns the root key (min element). Flushes any pending lazy-pop first. */
  peekKey(): number {
    this._flushPoppedElement()
    return this._keys[1]
  }

  /** Returns the root priority (min element). Flushes any pending lazy-pop first. */
  peekPriority(): number {
    this._flushPoppedElement()
    return this._priorities[1]
  }

  /** Ensures the heap is in a consistent state (flushes pending lazy-pop). */
  flush(): void {
    this._flushPoppedElement()
  }

  /** Raw key access by heap-internal index (1-indexed). Does NOT flush — call flush() first if needed. */
  keyAt(index: number): number {
    return this._keys[index]
  }

  /** Raw priority access by heap-internal index (1-indexed). Does NOT flush — call flush() first if needed. */
  priorityAt(index: number): number {
    return this._priorities[index]
  }

  private _bubbleUp(pos: number): void {
    const key = this._keys[pos]
    const priority = this._priorities[pos]

    while (pos > 1) {
      const parent = pos >>> 1
      if (this._priorities[parent] <= priority) break

      this._keys[pos] = this._keys[parent]
      this._priorities[pos] = this._priorities[parent]
      pos = parent
    }

    this._keys[pos] = key
    this._priorities[pos] = priority
  }

  private _bubbleDown(pos: number): void {
    const key = this._keys[pos]
    const priority = this._priorities[pos]
    const halfLength = 1 + (this.length >>> 1)
    const limit = this.length + 1

    while (pos < halfLength) {
      const left = pos << 1
      let childPriority = this._priorities[left]
      let childKey = this._keys[left]
      let childPos = left

      const right = left + 1
      if (right < limit) {
        const rightPriority = this._priorities[right]
        if (rightPriority < childPriority) {
          childPriority = rightPriority
          childKey = this._keys[right]
          childPos = right
        }
      }

      if (childPriority >= priority) break

      this._keys[pos] = childKey
      this._priorities[pos] = childPriority
      pos = childPos
    }

    this._keys[pos] = key
    this._priorities[pos] = priority
  }

  private _flushPoppedElement(): void {
    if (this._hasPoppedElement) {
      this._keys[1] = this._keys[this.length + 1]
      this._priorities[1] = this._priorities[this.length + 1]
      this._bubbleDown(1)
      this._hasPoppedElement = false
    }
  }

  private _grow(): void {
    const newCapacity = this._capacity * 2
    const newKeys = new this._KeyArray(newCapacity + 1)
    const newPriorities = new Float64Array(newCapacity + 1)
    newKeys.set(this._keys)
    newPriorities.set(this._priorities)
    this._keys = newKeys
    this._priorities = newPriorities
    this._capacity = newCapacity
  }
}
