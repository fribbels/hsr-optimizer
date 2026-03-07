import { DamageTag, OutputTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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

// --- Color system ---

const DAMAGE_TAG_BASE_COLORS: Record<number, [number, number, number]> = {
  [DamageTag.BASIC]: [133, 193, 233],
  [DamageTag.SKILL]: [93, 173, 226],
  [DamageTag.ULT]: [187, 143, 206],
  [DamageTag.FUA]: [69, 179, 157],
  [DamageTag.DOT]: [82, 190, 128],
  [DamageTag.BREAK]: [248, 196, 113],
  [DamageTag.SUPER_BREAK]: [229, 152, 102],
  [DamageTag.MEMO]: [205, 97, 85],
  [DamageTag.ADDITIONAL]: [174, 168, 211],
  [DamageTag.ELATION]: [241, 148, 182],
}

const colorCache = new Map<number, string>()

export function getDamageTypeColor(damageType: number): string {
  const cached = colorCache.get(damageType)
  if (cached) return cached

  const components: [number, number, number][] = []
  for (const flag of DAMAGE_TAG_FLAGS) {
    if (damageType & flag) {
      const base = DAMAGE_TAG_BASE_COLORS[flag]
      if (base) components.push(base)
    }
  }

  let color: string
  if (components.length === 0) {
    color = '#888888'
  } else if (components.length === 1) {
    const [r, g, b] = components[0]
    color = `rgb(${r},${g},${b})`
  } else {
    const r = Math.round(components.reduce((s, c) => s + c[0], 0) / components.length)
    const g = Math.round(components.reduce((s, c) => s + c[1], 0) / components.length)
    const b = Math.round(components.reduce((s, c) => s + c[2], 0) / components.length)
    color = `rgb(${r},${g},${b})`
  }

  colorCache.set(damageType, color)
  return color
}

// --- Action name formatting ---

function formatAbilityKind(kind: string): string {
  // "ELATION_SKILL" -> "Elation Skill", "FUA" -> "Fua", "MEMO_TALENT" -> "Memo Talent"
  return kind
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

function formatActionName(action: OptimizerAction, mode: 'default' | 'rotation', comboIndex?: number): string {
  const kind = formatAbilityKind(action.actionType)

  if (mode === 'default') {
    return kind
  }

  return comboIndex != null ? `${comboIndex + 1}. ${kind}` : kind
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
