import i18next from 'i18next'
import { DAMAGE_TAG_ENTRIES } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { PILL_SIZE } from 'lib/characterPreview/buffsAnalysis/designContext'
import { AKeyType } from 'lib/optimization/engine/config/keys'
import {
  newStatsConfig,
  StatConfigEntry,
} from 'lib/optimization/engine/config/statsConfig'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement } from 'react'

export function getStatConfig(stat: string): StatConfigEntry | undefined {
  return newStatsConfig[stat as AKeyType]
}

export function getPrimaryDamageTagColor(damageTags?: number): string {
  if (damageTags == null) return 'transparent'
  for (const entry of DAMAGE_TAG_ENTRIES) {
    if ((damageTags & entry.tag) !== 0) return entry.color
  }

  return 'transparent'
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
