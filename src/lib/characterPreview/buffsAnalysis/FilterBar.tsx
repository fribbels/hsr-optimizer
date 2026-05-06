import {
  ABILITY_COLORS,
  DAMAGE_TAG_ENTRIES,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import { PILL_SIZE } from 'lib/characterPreview/buffsAnalysis/designContext'
import type { Buff } from 'lib/optimization/basicStatsArray'
import type { DamageTag } from 'lib/optimization/engine/config/tag'
import { useTranslation } from 'react-i18next'
import classes from './FilterBar.module.css'

export function computeRelevantTags(allBuffs: Buff[]): Set<DamageTag> {
  const tags = new Set<DamageTag>()

  for (const buff of allBuffs) {
    if (buff.damageTags == null) continue
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if ((buff.damageTags & entry.tag) !== 0) {
        tags.add(entry.tag)
      }
    }
  }

  return tags
}

// Detail view filter: shows all buffs when unfiltered, matches universal + specific when filtered
export function buffMatchesFilter(buff: Buff, filter: DamageTag | null): boolean {
  if (filter === null) return true
  if (buff.damageTags == null) return true

  return (buff.damageTags & filter) !== 0
}

export function FilterBar({ selectedFilter, onFilterChange, relevantTags }: {
  selectedFilter: DamageTag | null,
  onFilterChange: (f: DamageTag | null) => void,
  relevantTags: Set<DamageTag>,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.DamageTags' })
  const visibleEntries = DAMAGE_TAG_ENTRIES.filter((e) => relevantTags.has(e.tag))

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }} className={classes.filterBarOuter}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <FilterButton
          label={t('ALL')}
          color={ABILITY_COLORS.ALL}
          isActive={selectedFilter === null}
          onClick={() => onFilterChange(null)}
        />
        {visibleEntries.map(
          (entry) => (
            <FilterButton
              key={entry.tag}
              label={t(entry.key)}
              color={entry.color}
              isActive={selectedFilter === entry.tag}
              onClick={() => onFilterChange(entry.tag)}
            />
          ),
        )}
      </div>
    </div>
  )
}

function FilterButton({ label, color, isActive, onClick }: {
  label: string,
  color: string,
  isActive: boolean,
  onClick: () => void,
}) {
  return (
    <span
      onClick={onClick}
      className={classes.filterButton}
      style={{
        padding: PILL_SIZE.padding,
        fontSize: PILL_SIZE.fontSize,
        lineHeight: PILL_SIZE.lineHeight,
        border: `1px solid ${color}`,
        color: isActive ? '#141414' : color,
        backgroundColor: isActive ? color : 'transparent',
        userSelect: 'none',
      }}
    >
      {label}
    </span>
  )
}
