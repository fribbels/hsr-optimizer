import { PriorityQueue } from '@js-sdsl/priority-queue'

export class FixedSizePriorityQueue<T> extends PriorityQueue<T> {
  limit: number
  compare: (_x: T, _y: T) => number

  constructor(limit: number, compare: (_x: T, _y: T) => number) {
    super([], compare, true)
    this.limit = limit
    this.compare = compare
  }

  fixedPush(item: T): void {
    if (this.size() >= this.limit) {
      if (this.compare(item, this.top()!)) {
        this.pop()
        this.push(item)
      }
    } else {
      this.push(item)
    }
  }
}
