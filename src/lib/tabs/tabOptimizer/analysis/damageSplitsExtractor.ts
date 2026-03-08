import { DamageTag, OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { OptimizerAction } from 'types/optimizer'

// --- Types ---

export type DamageSplitSegment = {
  damageType: number
  label: string
  damage: number
  hitIndex: number
}

export type DamageSplitEntry = {
  name: string
  segments: DamageSplitSegment[]
  total: number
}

// --- Label decoding ---

const DAMAGE_TAG_NAMES: Record<number, string> = {
  [DamageTag.BASIC]: 'Basic',
  [DamageTag.SKILL]: 'Skill',
  [DamageTag.ULT]: 'Ult',
  [DamageTag.FUA]: 'Fua',
  [DamageTag.DOT]: 'DoT',
  [DamageTag.BREAK]: 'Break',
  [DamageTag.SUPER_BREAK]: 'Super Break',
  [DamageTag.MEMO]: 'Memo',
  [DamageTag.ADDITIONAL]: 'Additional',
  [DamageTag.ELATION]: 'Elation',
}

const DAMAGE_TAG_FLAGS = Object.values(DamageTag)
  .filter((v): v is number => typeof v === 'number' && v > 0)
  .sort((a, b) => a - b)

export function decodeDamageTypeLabel(damageType: number): string {
  const parts: string[] = []
  for (const flag of DAMAGE_TAG_FLAGS) {
    if (damageType & flag) {
      parts.push(DAMAGE_TAG_NAMES[flag] ?? `Unknown(${flag})`)
    }
  }
  return parts.join(' · ') || 'None'
}

// --- Shared chart constants ---

export const chartColor = '#DDD'

// --- Color system ---

const DAMAGE_TAG_BASE_COLORS: Record<number, string> = {
  [DamageTag.BASIC]: '#78A8C4',
  [DamageTag.SKILL]: '#609CC6',
  [DamageTag.ULT]: '#A686BA',
  [DamageTag.FUA]: '#50A290',
  [DamageTag.DOT]: '#56AA78',
  [DamageTag.BREAK]: '#D8B26C',
  [DamageTag.SUPER_BREAK]: '#C88E64',
  [DamageTag.MEMO]: '#B8685E',
  [DamageTag.ADDITIONAL]: '#9C96BC',
  [DamageTag.ELATION]: '#D28AA4',
}

const colorCache = new Map<number, string>()

function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function toHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function getDamageTypeColor(damageType: number): string {
  const cached = colorCache.get(damageType)
  if (cached) return cached

  const matchedFlags: number[] = []
  for (const flag of DAMAGE_TAG_FLAGS) {
    if ((damageType & flag) && DAMAGE_TAG_BASE_COLORS[flag]) {
      matchedFlags.push(flag)
    }
  }

  let color: string
  if (matchedFlags.length === 0) {
    color = '#888888'
  } else if (matchedFlags.length === 1) {
    color = DAMAGE_TAG_BASE_COLORS[matchedFlags[0]]
  } else {
    const components = matchedFlags.map((f) => parseHex(DAMAGE_TAG_BASE_COLORS[f]))
    const r = Math.round(components.reduce((s, c) => s + c[0], 0) / components.length)
    const g = Math.round(components.reduce((s, c) => s + c[1], 0) / components.length)
    const b = Math.round(components.reduce((s, c) => s + c[2], 0) / components.length)
    color = toHex(r, g, b)
  }

  colorCache.set(damageType, color)
  return color
}

// --- Pie chart aggregation ---

export type DamageTagSlice = {
  damageType: number
  label: string
  color: string
  value: number
  percent: number
}

export function extractDamageByTag(
  x: ComputedStatsContainer,
  actions: OptimizerAction[],
): DamageTagSlice[] {
  const totals = new Map<number, number>()
  let grandTotal = 0

  for (const action of actions) {
    if (!action.hits?.length) continue
    for (const hit of action.hits) {
      if (hit.outputTag !== OutputTag.DAMAGE) continue
      const damage = x.getHitRegisterValue(hit.registerIndex)
      if (damage === 0) continue
      totals.set(hit.damageType, (totals.get(hit.damageType) ?? 0) + damage)
      grandTotal += damage
    }
  }

  if (grandTotal === 0) return []

  const slices: DamageTagSlice[] = []
  for (const [damageType, value] of totals) {
    slices.push({
      damageType,
      label: decodeDamageTypeLabel(damageType),
      color: getDamageTypeColor(damageType),
      value,
      percent: value / grandTotal,
    })
  }

  slices.sort((a, b) => b.value - a.value)
  return slices
}

// --- Action name formatting ---

function formatActionName(action: OptimizerAction, mode: 'default' | 'rotation', comboIndex?: number): string {
  const label = AbilityMeta[action.actionType].label

  if (mode === 'default') {
    return label
  }

  return comboIndex != null ? `${comboIndex + 1}. ${label}` : label
}

// --- Main extraction ---

export function extractDamageSplits(
  x: ComputedStatsContainer,
  actions: OptimizerAction[],
  mode: 'default' | 'rotation',
): DamageSplitEntry[] {
  const entries: DamageSplitEntry[] = []

  for (let actionIdx = 0; actionIdx < actions.length; actionIdx++) {
    const action = actions[actionIdx]
    if (!action.hits?.length) continue

    const segments: DamageSplitSegment[] = []
    let total = 0

    for (let i = 0; i < action.hits.length; i++) {
      const hit = action.hits[i]

      if (hit.outputTag !== OutputTag.DAMAGE) continue

      const damage = x.getHitRegisterValue(hit.registerIndex)
      if (damage === 0) continue

      segments.push({
        damageType: hit.damageType,
        label: decodeDamageTypeLabel(hit.damageType),
        damage,
        hitIndex: i,
      })
      total += damage
    }

    if (segments.length === 0) continue

    entries.push({
      name: formatActionName(action, mode, actionIdx),
      segments,
      total,
    })
  }

  if (mode === 'default') {
    entries.sort((a, b) => b.total - a.total)
  }

  return entries
}
