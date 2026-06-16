export type InterventionType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
export type InterventionUnit = 'flat' | 'percent'

export type Intervention = {
  id: string
  triggerAv: number
  // 行动期间（before）：在指定角色第 beforeActionIndex 次行动开始前触发，spd buff 被当前行动消耗（对 durationTurns=1 无效果）
  // beforeCharId 为 undefined 且 afterCharId 也为 undefined 时 = 全局行动期间：不绑定角色，仅按 triggerAv 触发一次（向后兼容旧数据/平铺视图场景）
  beforeCharId?: string
  // 第几次行动（0-base）开始前触发；beforeCharId 有值时有效；undefined 等同于 0（第1次行动前）
  beforeActionIndex?: number
  // 行动结束瞬间（after）：在指定角色第 afterActionIndex 次行动结束后触发
  afterCharId?: string
  // 第几次行动（0-base）后触发；afterCharId 有值时有效；undefined 等同于 0（第1次行动后）
  afterActionIndex?: number
  // @deprecated 已被 beforeCharId 取代，仅为兼容旧数据保留；引擎不再读取此字段
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
