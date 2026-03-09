import {
  Flex,
  theme,
} from 'antd'
import {
  ABILITY_COLORS,
  DAMAGE_TAG_ENTRIES,
  TagColorEntry,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { CardHeader } from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  formatBuffValue,
  getStatConfig,
  renderPill,
  translatedLabel,
} from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  DesignContext,
  ellipsisStyle,
  getCardStyle,
  getIconStyle,
  GROUP_ORDER,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import { buffMatchesFilter } from 'lib/characterPreview/buffsAnalysis/FilterBar'
import { Buff } from 'lib/optimization/basicStatsArray'
import { AKeyNames } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { BuffGroups } from 'lib/simulations/combatBuffsAnalysis'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

const STAT_ORDER = new Map<string, number>(AKeyNames.map((key, i) => [key, i]))

type StatSumContribution = {
  value: number,
  damageTags?: number,
}

type StatSum = {
  stat: string,
  label: string,
  total: number,
  count: number,
  percent: boolean,
  contributions: StatSumContribution[],
}

export function collectAllBuffs(buffGroups: BuffGroups): Buff[] {
  const all: Buff[] = []
  for (const buffType of GROUP_ORDER) {
    const groupMap = buffGroups[buffType]
    if (!groupMap) continue
    for (const buffs of Object.values(groupMap)) {
      all.push(...buffs)
    }
  }

  return all
}

function getBuffStatKey(buff: Buff): string {
  return buff.memo ? `memo:${buff.stat}` : buff.stat
}

export function computeStatSums(buffs: Buff[], filter: DamageTag | null): StatSum[] {
  // First pass: collect all stat keys in insertion order (unfiltered) for stable ordering + metadata
  const metaMap = new Map<string, Pick<StatSum, 'stat' | 'label' | 'percent'>>()
  for (const buff of buffs) {
    const config = getStatConfig(buff.stat)
    if (!config || config.bool) continue
    const key = getBuffStatKey(buff)
    if (!metaMap.has(key)) {
      metaMap.set(key, {
        stat: buff.stat,
        label: translatedLabel(buff.stat, buff.memo),
        percent: !config.flat,
      })
    }
  }

  // Second pass: compute sums with filter applied
  const sumMap = new Map<string, StatSum>()
  for (const buff of buffs) {
    if (!buffMatchesFilter(buff, filter)) continue
    const config = getStatConfig(buff.stat)
    if (!config || config.bool) continue

    const key = getBuffStatKey(buff)
    const contribution: StatSumContribution = {
      value: buff.value,
      damageTags: buff.damageTags,
    }

    const existing = sumMap.get(key)
    if (existing) {
      existing.total += buff.value
      existing.count++
      existing.contributions.push(contribution)
    } else {
      sumMap.set(key, {
        stat: buff.stat,
        label: translatedLabel(buff.stat, buff.memo),
        total: buff.value,
        count: 1,
        percent: !config.flat,
        contributions: [contribution],
      })
    }
  }

  // Return all keys in stable order, using zero entries for keys with no filtered matches
  return Array.from(metaMap.keys())
    .map((key) => {
      const existing = sumMap.get(key)
      if (existing) return existing
      const meta = metaMap.get(key)!
      return { stat: meta.stat, label: meta.label, total: 0, count: 0, percent: meta.percent, contributions: [] }
    })
    .sort((a, b) => (STAT_ORDER.get(a.stat) ?? 999) - (STAT_ORDER.get(b.stat) ?? 999))
}

function getContributionTagPills(contributions: StatSumContribution[]): TagColorEntry[] {
  const hasAll = contributions.some((c) => c.damageTags == null)
  const specificTags = new Set<DamageTag>()

  for (const c of contributions) {
    if (c.damageTags != null) {
      for (const entry of DAMAGE_TAG_ENTRIES) {
        if ((c.damageTags & entry.tag) !== 0) specificTags.add(entry.tag)
      }
    }
  }

  const pills: TagColorEntry[] = []
  if (hasAll) pills.push({ color: ABILITY_COLORS.ALL, key: 'ALL', label: 'ALL' })
  for (const entry of DAMAGE_TAG_ENTRIES) {
    if (specificTags.has(entry.tag)) pills.push({ color: entry.color, key: entry.key, label: entry.label })
  }
  return pills
}

function SummaryTagPills(props: { contributions: StatSumContribution[] }) {
  const pills = getContributionTagPills(props.contributions)
  if (pills.length === 0) return null

  return (
    <Flex gap={2} style={{ flexShrink: 0 }}>
      {pills.map((p) => renderPill(p.key, p.color, p.label))}
    </Flex>
  )
}

export function StatSummaryTable(props: { sums: StatSum[], avatarSrc: string }) {
  const options = useContext(DesignContext)
  const { token } = theme.useToken()
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  return (
    <Flex align='center' gap={0} style={cardStyleProp}>
      <img src={props.avatarSrc} style={iconStyle} />
      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        <CardHeader label={t('SummaryLabel')} />
        {props.sums.map((sum, i) => (
          <Flex
            key={sum.label}
            align='center'
            gap={6}
            style={{
              padding: `0 ${options.rowPaddingX}px`,
              height: options.rowHeight,
              lineHeight: `${options.rowHeight}px`,
              borderBottom: i < props.sums.length - 1 ? `1px solid ${options.borderColor}` : undefined,
              opacity: sum.total === 0 ? 0.05 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <span style={{ minWidth: 60, fontSize: options.fontSize, textWrap: 'nowrap' }}>
              {formatBuffValue(sum.total, sum.percent)}
            </span>

            <Flex align='center' gap={3} style={{ minWidth: 150, overflow: 'hidden' }}>
              <span style={{ fontSize: options.fontSize, flexShrink: 0, position: 'relative', top: -1 }}>∑</span>
              <span style={{ ...ellipsisStyle(options.fontSize) }}>{sum.label}</span>
            </Flex>

            <SummaryTagPills contributions={sum.contributions} />

            <span
              style={{
                marginLeft: 'auto',
                color: `rgba(255,255,255,${options.sourceOpacity / 100})`,
                fontSize: options.fontSize,
                textWrap: 'nowrap',
                flexShrink: 0,
              }}
            >
              {'x' + sum.count}
            </span>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}
