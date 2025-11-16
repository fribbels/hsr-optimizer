import {ComputedStatsContainer} from 'lib/optimization/engine/container/computedStatsContainer'

export class BuffBuilder {
  private _key = 0
  private _value = 0
  private _elements = 0
  private _damageType = 0

  constructor(private readonly container: ComputedStatsContainer) {}

  init(key: number, value: number): this {
    this._key = key
    this._value = value

    // Reset
    this._elements = 0
    this._damageType = 0
    return this
  }

  elements(e: number): this {
    this._elements = e
    return this
  }

  damageType(a: number): this {
    this._damageType = a
    return this
  }

  source(s: number): ComputedStatsContainer {
    this.container.internalBuff(
      this._key,
      this._value,
      s,
      this._elements,
      this._damageType,
    )
    return this.container
  }
}
