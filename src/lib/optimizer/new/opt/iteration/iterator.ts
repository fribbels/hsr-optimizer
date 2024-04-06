import { BuildIndex } from './build'

export class BuildIterator implements Iterator<Readonly<BuildIndex>, number> {
  constructor(
    protected current: BuildIndex,
    protected to: BuildIndex,
    protected limit: BuildIndex,
    private done: boolean = false,
    private _iterated: number = 0,
  ) {}

  public get iterated() {
    return this._iterated
  }

  next(): IteratorResult<BuildIndex, number> {
    if (this.done) {
      return {
        done: true,
        value: this._iterated,
      }
    }
    if (!this.tryIncrement()) {
      this.done = true
      return {
        done: true,
        value: this._iterated,
      }
    }
    this._iterated += 1
    return {
      done: false,
      value: this.current,
    }
  }

  private tryIncrement(): boolean {
    if (!arrLessThan(this.current, this.to)) {
      return false
    }
    for (let i = 5; i > 0; i--) {
      if (this.current[i] < this.limit[i]) {
        this.current[i]++
        return true
      } else {
        this.current[i] = 0
      }
    }
    if (this.current[0] >= this.to[0]) {
      return false
    }
    this.current[0]++

    return true
  }
}

function arrLessThan(left: BuildIndex, right: BuildIndex) {
  if (left[0] < right[0]) return true
  else if (left[1] < right[1]) return true
  else if (left[2] < right[2]) return true
  else if (left[3] < right[3]) return true
  else if (left[4] < right[4]) return true
  return (left[5] < right[5])
}
