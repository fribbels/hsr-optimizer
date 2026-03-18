import {
  type BuffSource,
  Source,
} from 'lib/optimization/buffSource'
import {
  ALL_DAMAGE_TAGS,
  ALL_DIRECTNESS_TAGS,
  ALL_ELEMENT_TAGS,
  DamageTag,
  type DirectnessTag,
  type ElementTag,
  OutputTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainerConfig } from 'lib/optimization/engine/container/computedStatsContainer'

export class BuffBuilder<_Completed extends boolean = false, _HasHitFilter extends boolean = false> {
  private readonly _completionBrand!: _Completed
  declare readonly _hitFilterBrand: _HasHitFilter

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

  setConfig(config: ComputedStatsContainerConfig): void {
    this.config = config
  }

  reset(): IncompleteActionBuff {
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
    return this as IncompleteActionBuff
  }

  // Hit-filter methods - mark _HasHitFilter as true
  elements(e: ElementTag): IncompleteHitBuff {
    this._elementTags = e
    return this as IncompleteHitBuff
  }

  damageType(d: DamageTag): IncompleteHitBuff {
    // BREAK buffs should also affect SUPER_BREAK hits
    if (d & DamageTag.BREAK) d |= DamageTag.SUPER_BREAK
    this._damageTags = d
    return this as IncompleteHitBuff
  }

  outputType(o: OutputTag): IncompleteHitBuff {
    this._outputTags = o
    return this as IncompleteHitBuff
  }

  directness(d: DirectnessTag): IncompleteHitBuff {
    this._directnessTag = d
    return this as IncompleteHitBuff
  }

  // Non-filter methods - propagate _HasHitFilter
  actionKind(k: string): BuffBuilder<false, _HasHitFilter> {
    this._actionKind = k
    return this as BuffBuilder<false, _HasHitFilter>
  }

  origin(e: string): BuffBuilder<false, _HasHitFilter> {
    this._origin = this.config.entityRegistry.getIndex(e)
    return this as BuffBuilder<false, _HasHitFilter>
  }

  target(e: string): BuffBuilder<false, _HasHitFilter> {
    this._target = this.config.entityRegistry.getIndex(e)
    this._targetTags = TargetTag.None
    return this as BuffBuilder<false, _HasHitFilter>
  }

  targets(t: TargetTag): BuffBuilder<false, _HasHitFilter> {
    this._targetTags = t
    if (t & TargetTag.SingleTarget) this._deferrable = true
    return this as BuffBuilder<false, _HasHitFilter>
  }

  deferrable(): BuffBuilder<false, _HasHitFilter> {
    this._deferrable = true
    return this as BuffBuilder<false, _HasHitFilter>
  }

  source(s: BuffSource): BuffBuilder<true, _HasHitFilter> {
    this._source = s
    return this as BuffBuilder<true, _HasHitFilter>
  }
}

export type IncompleteActionBuff = BuffBuilder<false, false>
export type IncompleteHitBuff = BuffBuilder<false, true>
export type CompleteActionBuff = BuffBuilder<true, false>
export type CompleteHitBuff = BuffBuilder<true, true>
