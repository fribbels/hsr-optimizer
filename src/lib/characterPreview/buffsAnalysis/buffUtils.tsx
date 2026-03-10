import i18next from 'i18next'
import { DAMAGE_TAG_ENTRIES } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { PILL_SIZE } from 'lib/characterPreview/buffsAnalysis/designContext'
import { AKeyType } from 'lib/optimization/engine/config/keys'
import {
  newStatsConfig,
  StatConfigEntry,
} from 'lib/optimization/engine/config/statsConfig'
import {
  DamageTag,
  OutputTag,
} from 'lib/optimization/engine/config/tag'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export function getStatConfig(stat: string): StatConfigEntry | undefined {
  return newStatsConfig[stat as AKeyType]
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

export function getPrimaryDamageTagColor(damageTags?: number): string {
  if (damageTags == null) return 'transparent'

  const matched = DAMAGE_TAG_ENTRIES.filter((e) => (damageTags & e.tag) !== 0)
  if (matched.length === 0) return 'transparent'
  if (matched.length === 1) return matched[0].color

  const rgbs = matched.map((e) => hexToRgb(e.color))
  const r = rgbs.reduce((s, c) => s + c[0], 0) / matched.length
  const g = rgbs.reduce((s, c) => s + c[1], 0) / matched.length
  const b = rgbs.reduce((s, c) => s + c[2], 0) / matched.length
  return rgbToHex(r, g, b)
}

export function translatedLabel(stat: string, isMemo = false): string {
  const config = getStatConfig(stat)
  if (!config) return stat

  const label = config.label
  if (typeof label === 'string') {
    return isMemo ? i18next.t('MemospriteLabel', { label }) as string : label
  }

  const finalLabel: string = i18next.t(label.key, label.key, { ns: label.ns, ...label.args })
  return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) as string : finalLabel
}

export function formatBuffValue(value: number, percent: boolean): string {
  if (percent) return TsUtils.precisionRound(value * 100, 2).toLocaleString(currentLocale()) + ' %'
  return TsUtils.precisionRound(value, 0).toLocaleString(currentLocale())
}

export function renderPill(key: string, color: string, label: string): ReactElement {
  return (
    <span
      key={key}
      style={{
        padding: PILL_SIZE.padding,
        borderRadius: 3,
        fontSize: PILL_SIZE.fontSize,
        fontWeight: 600,
        lineHeight: PILL_SIZE.lineHeight,
        color,
        whiteSpace: 'nowrap',
        border: `1px solid ${color}`,
      }}
    >
      {label}
    </span>
  )
}

export function getSelectedActions(
  context: OptimizerContext,
  selectedAction: number | null,
): OptimizerAction[] {
  if (selectedAction != null && context.rotationActions[selectedAction]) {
    return [context.rotationActions[selectedAction]]
  }
  return selectedAction != null ? [] : context.defaultActions
}

export function seedRelevantTagsFromHits(
  relevantTags: Set<DamageTag>,
  context: OptimizerContext,
  selectedAction: number | null,
): void {
  const actions = getSelectedActions(context, selectedAction)
  const damageHits = actions.flatMap((a) => a.hits ?? [])
    .filter((h) => h.outputTag === OutputTag.DAMAGE)

  for (const hit of damageHits) {
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if ((hit.damageType & entry.tag) !== 0) relevantTags.add(entry.tag)
    }
  }
}
