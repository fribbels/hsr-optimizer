import { Flex } from 'antd'
import i18next from 'i18next'
import { DAMAGE_TAG_ENTRIES } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { DesignContext, ellipsisStyle, FilterContext, PILL_SIZE } from 'lib/characterPreview/buffsAnalysis/designContext'
import { buffMatchesFilter } from 'lib/characterPreview/buffsAnalysis/FilterBar'
import {
  BUFF_ABILITY,
  BUFF_TYPE,
} from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/basicStatsArray'
import { AKeyType } from 'lib/optimization/engine/config/keys'
import { newStatsConfig, StatConfigEntry } from 'lib/optimization/engine/config/statsConfig'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { ReactElement, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function getStatConfig(stat: string): StatConfigEntry | undefined {
  return newStatsConfig[stat as AKeyType]
}

export function getPrimaryDamageTagColor(damageTags?: number): string {
  if (damageTags == null) return 'transparent'
  for (const entry of DAMAGE_TAG_ENTRIES) {
    if (damageTags & entry.tag) return entry.color
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

  const typedLabel = label as { ns: string; key: string; args?: Record<string, unknown> }
  const finalLabel: string = i18next.t(`${typedLabel.ns}:${typedLabel.key}`, typedLabel.args) as string
  return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) as string : finalLabel
}

export function renderPill(key: string, color: string, label: string): ReactElement {
  return (
    <span key={key} style={{
      padding: PILL_SIZE.padding,
      borderRadius: 3,
      fontSize: PILL_SIZE.fontSize,
      fontWeight: 600,
      lineHeight: PILL_SIZE.lineHeight,
      color,
      whiteSpace: 'nowrap',
      border: `1px solid ${color}`,
    }}>
      {label}
    </span>
  )
}

export function BuffRow(props: { buff: Buff; isLast: boolean }) {
  const { buff, isLast } = props
  const options = useContext(DesignContext)
  const activeFilter = useContext(FilterContext)
  const dimmed = !buffMatchesFilter(buff, activeFilter)
  const { t: tOptimizerTab } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const { t: tGameData } = useTranslation('gameData')

  const stat = buff.stat
  const config = getStatConfig(stat)
  const percent = !config?.flat
  const bool = config?.bool
  const statLabel = translatedLabel(stat, buff.memo)

  let sourceLabel: string
  const source = buff.source
  switch (source.buffType) {
    case BUFF_TYPE.CHARACTER:
      if (source.ability === BUFF_ABILITY.CYRENE_ODE_TO) {
        sourceLabel = tGameData('Characters.1415.Name')
      } else {
        sourceLabel = tOptimizerTab(`Sources.${source.ability}`)
      }
      break
    case BUFF_TYPE.LIGHTCONE:
      sourceLabel = tOptimizerTab('Sources.LightCone')
      break
    case BUFF_TYPE.SETS:
      sourceLabel = tOptimizerTab('Sources.Set')
      break
    default:
      sourceLabel = source.label
  }

  let value: string
  if (bool) {
    value = tOptimizerTab(`Values.${buff.value ? 'BoolTrue' : 'BoolFalse'}`)
  } else if (percent) {
    value = TsUtils.precisionRound(buff.value * 100, 2).toLocaleString(currentLocale()) + ' %'
  } else {
    value = TsUtils.precisionRound(buff.value, 0).toLocaleString(currentLocale())
  }

  let rowBackground: string | undefined
  const tintColor = getPrimaryDamageTagColor(buff.damageTags)
  if (tintColor !== 'transparent') {
    const hex = Math.round(options.tintIntensity).toString(16).padStart(2, '0')
    const c = `${tintColor}${hex}`
    const c0 = `${tintColor}00`
    rowBackground = `linear-gradient(to right, ${c0} 0px, ${c} 5px, ${c} calc(100% - 5px), ${c0} 100%)`
  }

  const borderBottomStyle = isLast ? undefined : `1px solid ${options.borderColor}`

  return (
    <Flex
      align='center'
      gap={6}
      style={{
        padding: `0 ${options.rowPaddingX}px`,
        height: options.rowHeight,
        lineHeight: `${options.rowHeight}px`,
        borderBottom: borderBottomStyle,
        background: rowBackground,
        opacity: dimmed ? 0.05 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <span style={{ minWidth: 60, textWrap: 'nowrap', fontSize: options.fontSize }}>{value}</span>

      <span style={{ minWidth: 150, ...ellipsisStyle(options.fontSize) }}>
        {statLabel}
      </span>

      <DamageTagPills damageTags={buff.damageTags} />

      <span style={{
        marginLeft: 'auto',
        color: `rgba(255,255,255,${options.sourceOpacity / 100})`,
        textAlign: 'end',
        flexShrink: 0,
        ...ellipsisStyle(options.fontSize),
      }}>
        {sourceLabel}
      </span>

    </Flex>
  )
}

function DamageTagPills(props: { damageTags?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay.DamageTags' })

  const pills = useMemo(() => {
    if (props.damageTags == null) {
      return [renderPill('ALL', '#8c8c8c', t('ALL'))]
    }

    const result: ReactElement[] = []
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if (props.damageTags & entry.tag) {
        result.push(renderPill(String(entry.tag), entry.color, t(entry.key)))
      }
    }
    return result
  }, [props.damageTags, t])

  if (pills.length === 0) return null
  return <Flex gap={2} wrap='wrap' style={{ flexShrink: 0 }}>{pills}</Flex>
}
