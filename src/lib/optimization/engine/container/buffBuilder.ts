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
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainerConfig } from 'lib/optimization/engine/container/computedStatsContainer'

export class BuffBuilder<_Completed extends boolean = false> {
  private readonly _completionBrand!: _Completed

  _elementTags = ALL_ELEMENT_TAGS
  _damageTags = ALL_DAMAGE_TAGS
  _origin = SELF_ENTITY
  _target = SELF_ENTITY
  _targetTags = TargetTag.None
  _source: BuffSource = Source.NONE

  private config!: ComputedStatsContainerConfig

  constructor() {}

  setConfig(config: ComputedStatsContainerConfig): void {
    this.config = config
  }

  reset(): IncompleteBuffBuilder {
    this._elementTags = ALL_ELEMENT_TAGS
    this._damageTags = ALL_DAMAGE_TAGS
    this._origin = SELF_ENTITY
    this._target = SELF_ENTITY
    this._targetTags = TargetTag.None
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

  origin(e: string): IncompleteBuffBuilder {
    this._origin = this.config.entityRegistry.getIndex(e)
    return this as IncompleteBuffBuilder
  }

  target(e: string): IncompleteBuffBuilder {
    this._target = this.config.entityRegistry.getIndex(e)
    return this as IncompleteBuffBuilder
  }

  targets(t: TargetTag): IncompleteBuffBuilder {
    this._targetTags = t
    return this as IncompleteBuffBuilder
  }

  source(s: BuffSource): CompleteBuffBuilder {
    this._source = s
    return this as CompleteBuffBuilder
  }
}

export type IncompleteBuffBuilder = BuffBuilder<false>
export type CompleteBuffBuilder = BuffBuilder<true>
