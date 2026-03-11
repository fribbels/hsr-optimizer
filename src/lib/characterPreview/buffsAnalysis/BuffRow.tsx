import { Flex } from 'antd'
import {
  ABILITY_COLORS,
  DAMAGE_TAG_ENTRIES,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import {
  formatBuffValue,
  getPrimaryDamageTagColor,
  getStatConfig,
  renderPill,
  translatedLabel,
} from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  DesignContext,
  ellipsisStyle,
  FilterContext,
  getSourceLabelStyle,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import { buffMatchesFilter } from 'lib/characterPreview/buffsAnalysis/FilterBar'
import { Buff } from 'lib/optimization/basicStatsArray'
import {
  BUFF_ABILITY,
  BUFF_TYPE,
} from 'lib/optimization/buffSource'
import React, {
  ReactElement,
  useContext,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

export function BuffRow(props: { buff: Buff, isLast: boolean }) {
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

  const value = bool
    ? tOptimizerTab(`Values.${buff.value ? 'BoolTrue' : 'BoolFalse'}`)
    : formatBuffValue(buff.value, percent)

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
        opacity: dimmed ? 0.15 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <span style={{ minWidth: 60, textWrap: 'nowrap', fontSize: options.fontSize }}>{value}</span>

      <span style={{ minWidth: 150, ...ellipsisStyle(options.fontSize) }}>
        {statLabel}
      </span>

      <DamageTagPills damageTags={buff.damageTags} />

      <span
        style={{
          ...getSourceLabelStyle(options),
          textAlign: 'end',
          ...ellipsisStyle(options.fontSize),
        }}
      >
        {sourceLabel}
      </span>
    </Flex>
  )
}

function DamageTagPills(props: { damageTags?: number }) {
  const pills = useMemo(() => {
    if (props.damageTags == null) {
      return [renderPill('ALL', ABILITY_COLORS.ALL, 'ALL')]
    }

    const result: ReactElement[] = []
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if ((props.damageTags & entry.tag) !== 0) {
        result.push(renderPill(String(entry.tag), entry.color, entry.label))
      }
    }
    return result
  }, [props.damageTags])

  if (pills.length === 0) return null
  return <Flex gap={2} wrap='wrap' style={{ flexShrink: 0 }}>{pills}</Flex>
}
