import {
  BuffSource,
  Source,
} from 'lib/optimization/buffSource'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'

export class BuffBuilder<_Completed extends boolean = false> {
  private readonly _completionBrand!: _Completed

  _elementTags = 0
  _damageTags = 0
  _source = Source.NONE

  reset(): IncompleteBuffBuilder {
    this._elementTags = 0
    this._damageTags = 0
    this._source = Source.NONE
    return this as IncompleteBuffBuilder
  }

  elements(e: ElementTag): IncompleteBuffBuilder {
    this._elementTags = e
    return this as IncompleteBuffBuilder
  }

  damageType(d: DamageTag): IncompleteBuffBuilder {
    this._damageTags = d
    return this as IncompleteBuffBuilder
  }

  source(s: BuffSource): CompleteBuffBuilder {
    this._source = Source.NONE
    return this as CompleteBuffBuilder
  }
}

export type IncompleteBuffBuilder = BuffBuilder<false>
export type CompleteBuffBuilder = BuffBuilder<true>
