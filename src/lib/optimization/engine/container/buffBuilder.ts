import {
  BuffSource,
  Source,
} from 'lib/optimization/buffSource'
import {
  ALL_DAMAGE_TAGS,
  ALL_DIRECTNESS_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  DirectnessTag,
  ElementTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainerConfig } from 'lib/optimization/engine/container/computedStatsContainer'

export class BuffBuilder<_Completed extends boolean = false> {
  private readonly _completionBrand!: _Completed

  _actionKind: string | undefined = undefined
  _elementTags = ALL_ELEMENT_TAGS
  _damageTags = ALL_DAMAGE_TAGS
  _outputTags = OutputTag.DAMAGE
  _directnessTag = ALL_DIRECTNESS_TAGS
  _origin = SELF_ENTITY_INDEX
  _target = SELF_ENTITY_INDEX
  _targetTags = TargetTag.SelfAndPet
  _deferrable = false
  _source: BuffSource = Source.NONE

  private config!: ComputedStatsContainerConfig

  constructor() {}

  setConfig(config: ComputedStatsContainerConfig): void {
    this.config = config
  }

  reset(): IncompleteBuffBuilder {
    this._actionKind = undefined
    this._elementTags = ALL_ELEMENT_TAGS
    this._damageTags = ALL_DAMAGE_TAGS
    this._outputTags = OutputTag.DAMAGE
    this._directnessTag = ALL_DIRECTNESS_TAGS
    this._origin = SELF_ENTITY_INDEX
    this._target = SELF_ENTITY_INDEX
    this._targetTags = TargetTag.SelfAndPet
    this._deferrable = false
    this._source = Source.NONE
    return this as IncompleteBuffBuilder
  }

  elements(e: ElementTag): IncompleteBuffBuilder {
    this._elementTags = e
    return this as IncompleteBuffBuilder
  }

  damageType(d: DamageTag): IncompleteBuffBuilder {
    // BREAK buffs should also affect SUPER_BREAK hits
    if (d & DamageTag.BREAK) d |= DamageTag.SUPER_BREAK
    this._damageTags = d
    return this as IncompleteBuffBuilder
  }

  outputType(o: OutputTag): IncompleteBuffBuilder {
    this._outputTags = o
    return this as IncompleteBuffBuilder
  }

  directness(d: DirectnessTag): IncompleteBuffBuilder {
    this._directnessTag = d
    return this as IncompleteBuffBuilder
  }

  actionKind(k: string): IncompleteBuffBuilder {
    this._actionKind = k
    return this as IncompleteBuffBuilder
  }

  origin(e: string): IncompleteBuffBuilder {
    this._origin = this.config.entityRegistry.getIndex(e)
    return this as IncompleteBuffBuilder
  }

  target(e: string): IncompleteBuffBuilder {
    this._target = this.config.entityRegistry.getIndex(e)
    this._targetTags = TargetTag.None
    return this as IncompleteBuffBuilder
  }

  targets(t: TargetTag): IncompleteBuffBuilder {
    this._targetTags = t
    if (t & TargetTag.SingleTarget) this._deferrable = true
    return this as IncompleteBuffBuilder
  }

  deferrable(): IncompleteBuffBuilder {
    this._deferrable = true
    return this as IncompleteBuffBuilder
  }

  source(s: BuffSource): CompleteBuffBuilder {
    this._source = s
    return this as CompleteBuffBuilder
  }
}

export type IncompleteBuffBuilder = BuffBuilder<false>
export type CompleteBuffBuilder = BuffBuilder<true>
