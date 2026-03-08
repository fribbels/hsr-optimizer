import { Flex } from 'antd'
import { DAMAGE_TAG_ENTRIES } from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { PILL_SIZE } from 'lib/characterPreview/buffsAnalysis/designContext'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { Buff } from 'lib/optimization/basicStatsArray'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function computeRelevantTags(allBuffs: Buff[]): Set<DamageTag> {
  const tags = new Set<DamageTag>()
  for (const buff of allBuffs) {
    if (buff.damageTags == null) continue
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if (buff.damageTags & entry.tag) {
        tags.add(entry.tag)
      }
    }
  }
  return tags
}

export function buffMatchesFilter(buff: Buff, filter: DamageTag | null): boolean {
  if (filter === null) return true
  // ALL buffs (undefined damageTags) apply to everything — always match
  if (buff.damageTags == null) return true
  return (buff.damageTags & filter) !== 0
}

export function FilterBar(props: {
  selectedFilter: DamageTag | null
  onFilterChange: (f: DamageTag | null) => void
  relevantTags: Set<DamageTag>
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const visibleEntries = DAMAGE_TAG_ENTRIES.filter((e) => props.relevantTags.has(e.tag))
  if (visibleEntries.length <= 1) return null

  return (
    <Flex justify='center' style={{ padding: '4px 0' }}>
      <Flex gap={4} wrap='wrap' justify='center'>
        <FilterButton label={t('DamageTags.ALL')} color='#8c8c8c' isActive={props.selectedFilter === null} onClick={() => props.onFilterChange(null)} />
        {visibleEntries.map((entry) => (
          <FilterButton
            key={entry.tag}
            label={t(`DamageTags.${entry.key}`)}
            color={entry.color}
            isActive={props.selectedFilter === entry.tag}
            onClick={() => props.onFilterChange(entry.tag)}
          />
        ))}
      </Flex>
    </Flex>
  )
}

function FilterButton(props: { label: string; color: string; isActive: boolean; onClick: () => void }) {
  return (
    <span
      onClick={props.onClick}
      style={{
        padding: PILL_SIZE.padding,
        borderRadius: 3,
        fontSize: PILL_SIZE.fontSize,
        fontWeight: 600,
        lineHeight: PILL_SIZE.lineHeight,
        cursor: 'pointer',
        border: `1px solid ${props.color}`,
        color: props.isActive ? '#141414' : props.color,
        backgroundColor: props.isActive ? props.color : 'transparent',
        userSelect: 'none',
        transition: 'all 0.15s',
      }}
    >
      {props.label}
    </span>
  )
}
