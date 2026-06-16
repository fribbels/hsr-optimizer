export type InterventionType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
export type InterventionUnit = 'flat' | 'percent'

export type Intervention = {
  id: string
  triggerAv: number
  // During action (before): fires right before the target character's beforeActionIndex-th action;
  // the spd buff is consumed by that very action (no effect when durationTurns=1)
  // When both beforeCharId and afterCharId are undefined = global "during action": not bound to any
  // character, fires once based purely on triggerAv (kept for backward compat / flat-view scenarios)
  beforeCharId?: string
  // Which action (0-based) this fires before; only meaningful when beforeCharId is set;
  // undefined is equivalent to 0 (before the 1st action)
  beforeActionIndex?: number
  // End-of-action instant (after): fires right after the target character's afterActionIndex-th action ends
  afterCharId?: string
  // Which action (0-based) this fires after; only meaningful when afterCharId is set;
  // undefined is equivalent to 0 (after the 1st action)
  afterActionIndex?: number
  // @deprecated Superseded by beforeCharId; kept only for backward compat with old data. The engine no longer reads this field.
  sourceCharId?: string
  type: InterventionType
  targets: string[]
  value: number
  unit: InterventionUnit
  durationTurns: number
}

export type SimEvent = {
  av: number
  characterId: string
  actionIndex: number
  effectiveSpd: number
}

// Shared contract between ActionDisplayPanel (emits requests) and EditPanel (consumes them), lifted in
// AvVisualizerTab. 'add' carries the timing context (before/after/global) the request originated from;
// 'edit' carries the full intervention being edited.
export type EditRequest =
  | { mode: 'add'; beforeCharId?: string; beforeActionIndex?: number; afterCharId?: string; afterActionIndex?: number }
  | { mode: 'edit'; intervention: Intervention }
