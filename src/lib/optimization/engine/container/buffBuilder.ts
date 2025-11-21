import {
  BuffSource,
  Source,
} from 'lib/optimization/buffSource'
import {
  ALL_DAMAGE_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  ElementTag,
  SELF_ENTITY,
} from 'lib/optimization/engine/config/tag'
import {
  ComputedStatsContainer,
  OptimizerEntity,
} from 'lib/optimization/engine/container/computedStatsContainer'
import { NamedArray } from 'lib/optimization/engine/util/namedArray'

export class BuffBuilder<_Completed extends boolean = false> {
  private readonly _completionBrand!: _Completed

  _elementTags = ALL_ELEMENT_TAGS
  _damageTags = ALL_DAMAGE_TAGS
  _origin = SELF_ENTITY
  _target = SELF_ENTITY
  _source = Source.NONE

  entityRegistry: NamedArray<OptimizerEntity>

  constructor(container: ComputedStatsContainer) {
    this.entityRegistry = container.entityRegistry
  }

  reset(): IncompleteBuffBuilder {
    this._elementTags = ALL_ELEMENT_TAGS
    this._damageTags = ALL_DAMAGE_TAGS
    this._origin = SELF_ENTITY
    this._target = SELF_ENTITY
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

  origin(entity: string): IncompleteBuffBuilder {
    this._origin = this.entityRegistry.getIndex(entity)
    return this as IncompleteBuffBuilder
  }

  target(entity: string): IncompleteBuffBuilder {
    this._target = this.entityRegistry.getIndex(entity)
    return this as IncompleteBuffBuilder
  }

  source(s: BuffSource): CompleteBuffBuilder {
    this._source = Source.NONE
    return this as CompleteBuffBuilder
  }
}

export type IncompleteBuffBuilder = BuffBuilder<false>
export type CompleteBuffBuilder = BuffBuilder<true>
