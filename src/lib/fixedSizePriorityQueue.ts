import { PriorityQueue } from '@js-sdsl/priority-queue'

/**
 * Priority queue which evicts the TOP element on fixedSizePush when the max limit is exceeded
 * Used to store top results for optimizer columns
 */
export class FixedSizePriorityQueue<T> extends PriorityQueue<T> {
  limit: number
  compare: (_x: T, _y: T) => number

  constructor(limit: number, compare: (_x: T, _y: T) => number) {
    super([], compare, false)
    this.limit = limit
    this.compare = compare
  }

  fixedSizePush(item: T): void {
    if (this.size() >= this.limit) {
      if (this.compare(item, this.top()!) >= 0) {
        this.pop()
        this.push(item)
      }
    } else {
      this.push(item)
    }
  }

  // If we already know the queue is full, skip the checks
  fixedSizePushOvercapped(item: T): T {
    this.push(item)
    return this.pop()!
  }
}
