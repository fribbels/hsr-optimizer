import {
  type BuffSource,
  Source,
} from 'lib/optimization/buffSource'
import {
  type AKeyValue,
} from 'lib/optimization/engine/config/keys'
import type { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
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

enum BuffBuilderDirtyFlag {
  ELEMENT = 1,
  DAMAGE = 2,
  OUTPUT = 4,
  DIRECTNESS = 8,
  TARGET = 16,
  TARGET_TAGS = 32,
  DEFERRABLE = 64,
  BUFF_STAT = 128,
  ACTION_KIND = 256,
}

export class BuffBuilder<_Completed extends boolean = false, _HasHitFilter extends boolean = false> {
  private readonly _completionBrand!: _Completed
  declare readonly _hitFilterBrand: _HasHitFilter

  _actionKind: AbilityKind | undefined = undefined
  _elementTags = ALL_ELEMENT_TAGS
  _damageTags = ALL_DAMAGE_TAGS
  _outputTags = OutputTag.DAMAGE
  _directnessTag = ALL_DIRECTNESS_TAGS
  _target = SELF_ENTITY_INDEX
  _targetTags = TargetTag.SelfAndPet
  _deferrable = false
  _buffStatFilter: AKeyValue | null = null
  _source: BuffSource = Source.NONE
  _dirty = 0
  _tracing = false

  private config!: ComputedStatsContainerConfig

  setConfig(config: ComputedStatsContainerConfig): void {
    this.config = config
  }

  reset(): IncompleteActionBuff {
    const d = this._dirty
    if (d) {
      if (d & BuffBuilderDirtyFlag.ELEMENT) this._elementTags = ALL_ELEMENT_TAGS
      if (d & BuffBuilderDirtyFlag.DAMAGE) this._damageTags = ALL_DAMAGE_TAGS
      if (d & BuffBuilderDirtyFlag.OUTPUT) this._outputTags = OutputTag.DAMAGE
      if (d & BuffBuilderDirtyFlag.DIRECTNESS) this._directnessTag = ALL_DIRECTNESS_TAGS
      if (d & BuffBuilderDirtyFlag.TARGET) this._target = SELF_ENTITY_INDEX
      if (d & BuffBuilderDirtyFlag.TARGET_TAGS) this._targetTags = TargetTag.SelfAndPet
      if (d & BuffBuilderDirtyFlag.DEFERRABLE) this._deferrable = false
      if (d & BuffBuilderDirtyFlag.BUFF_STAT) this._buffStatFilter = null
      if (d & BuffBuilderDirtyFlag.ACTION_KIND) this._actionKind = undefined
      this._dirty = 0
    }
    return this as IncompleteActionBuff
  }

  // Hit-filter methods - mark _HasHitFilter as true
  elements(e: ElementTag): IncompleteHitBuff {
    this._dirty |= BuffBuilderDirtyFlag.ELEMENT
    this._elementTags = e
    return this as IncompleteHitBuff
  }

  damageType(d: DamageTag): IncompleteHitBuff {
    this._dirty |= BuffBuilderDirtyFlag.DAMAGE
    // BREAK buffs should also affect SUPER_BREAK hits
    if (d & DamageTag.BREAK) d |= DamageTag.SUPER_BREAK
    this._damageTags = d
    return this as IncompleteHitBuff
  }

  outputType(o: OutputTag): IncompleteHitBuff {
    this._dirty |= BuffBuilderDirtyFlag.OUTPUT
    this._outputTags = o
    return this as IncompleteHitBuff
  }

  outputBuff(stat: AKeyValue): IncompleteHitBuff {
    this._dirty |= BuffBuilderDirtyFlag.OUTPUT | BuffBuilderDirtyFlag.BUFF_STAT
    this._outputTags = OutputTag.BUFF
    this._buffStatFilter = stat
    return this as IncompleteHitBuff
  }

  directness(d: DirectnessTag): IncompleteHitBuff {
    this._dirty |= BuffBuilderDirtyFlag.DIRECTNESS
    this._directnessTag = d
    return this as IncompleteHitBuff
  }

  // Non-filter methods - propagate _HasHitFilter
  actionKind(k: AbilityKind): BuffBuilder<false, _HasHitFilter> {
    this._dirty |= BuffBuilderDirtyFlag.ACTION_KIND
    this._actionKind = k
    return this as BuffBuilder<false, _HasHitFilter>
  }

  target(e: string): BuffBuilder<false, _HasHitFilter> {
    this._dirty |= BuffBuilderDirtyFlag.TARGET | BuffBuilderDirtyFlag.TARGET_TAGS
    this._target = this.config.entityRegistry.getRequiredIndex(e)
    this._targetTags = TargetTag.None
    return this as BuffBuilder<false, _HasHitFilter>
  }

  targets(t: TargetTag): BuffBuilder<false, _HasHitFilter> {
    this._dirty |= BuffBuilderDirtyFlag.TARGET_TAGS | BuffBuilderDirtyFlag.DEFERRABLE
    this._targetTags = t
    if (t & TargetTag.SingleTarget) this._deferrable = true
    return this as BuffBuilder<false, _HasHitFilter>
  }

  deferrable(): BuffBuilder<false, _HasHitFilter> {
    this._dirty |= BuffBuilderDirtyFlag.DEFERRABLE
    this._deferrable = true
    return this as BuffBuilder<false, _HasHitFilter>
  }

  source(s: BuffSource): BuffBuilder<true, _HasHitFilter> {
    if (this._tracing) this._source = s
    return this as BuffBuilder<true, _HasHitFilter>
  }
}

export type IncompleteActionBuff = BuffBuilder<false, false>
export type IncompleteHitBuff = BuffBuilder<false, true>
export type CompleteActionBuff = BuffBuilder<true, false>
export type CompleteHitBuff = BuffBuilder<true, true>
