import { DamageTag } from 'lib/optimization/engine/config/tag'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'

/**
 * Single source of truth for ability-type colors used across
 * damage-tag pills, action selector tabs, and filter bar.
 */
export const ABILITY_COLORS = {
  ALL: '#8c8c8c',
  BASIC: '#91caff',
  SKILL: '#b37feb',
  ULT: '#5cdbd3',
  FUA: '#95de64',
  DOT: '#ff7875',
  BREAK: '#ffc069',
  SUPER_BREAK: '#ffd666',
  MEMO: '#adc6ff',
  ADDITIONAL: '#d3adf7',
  ELATION: '#ffadd2',
} as const

export type AbilityColorKey = keyof typeof ABILITY_COLORS
export type TagColorEntry = { key: AbilityColorKey, label: string, color: string }
export type DamageTagEntry = TagColorEntry & { tag: DamageTag }

export const DAMAGE_TAG_ENTRIES: DamageTagEntry[] = [
  { tag: DamageTag.BASIC, key: 'BASIC', label: 'BASIC', color: ABILITY_COLORS.BASIC },
  { tag: DamageTag.SKILL, key: 'SKILL', label: 'SKILL', color: ABILITY_COLORS.SKILL },
  { tag: DamageTag.ULT, key: 'ULT', label: 'ULT', color: ABILITY_COLORS.ULT },
  { tag: DamageTag.FUA, key: 'FUA', label: 'FUA', color: ABILITY_COLORS.FUA },
  { tag: DamageTag.DOT, key: 'DOT', label: 'DOT', color: ABILITY_COLORS.DOT },
  { tag: DamageTag.BREAK, key: 'BREAK', label: 'BREAK', color: ABILITY_COLORS.BREAK },
  { tag: DamageTag.SUPER_BREAK, key: 'SUPER_BREAK', label: 'SUPER BREAK', color: ABILITY_COLORS.SUPER_BREAK },
  { tag: DamageTag.MEMO, key: 'MEMO', label: 'MEMO', color: ABILITY_COLORS.MEMO },
  { tag: DamageTag.ADDITIONAL, key: 'ADDITIONAL', label: 'ADDITIONAL', color: ABILITY_COLORS.ADDITIONAL },
  { tag: DamageTag.ELATION, key: 'ELATION', label: 'ELATION', color: ABILITY_COLORS.ELATION },
]

export const ACTION_COLORS: Partial<Record<AbilityKind, string>> = {
  [AbilityKind.BASIC]: ABILITY_COLORS.BASIC,
  [AbilityKind.SKILL]: ABILITY_COLORS.SKILL,
  [AbilityKind.ULT]: ABILITY_COLORS.ULT,
  [AbilityKind.FUA]: ABILITY_COLORS.FUA,
  [AbilityKind.DOT]: ABILITY_COLORS.DOT,
  [AbilityKind.BREAK]: ABILITY_COLORS.BREAK,
  [AbilityKind.MEMO_SKILL]: ABILITY_COLORS.MEMO,
  [AbilityKind.MEMO_TALENT]: ABILITY_COLORS.MEMO,
  [AbilityKind.ELATION_SKILL]: ABILITY_COLORS.ELATION,
}
