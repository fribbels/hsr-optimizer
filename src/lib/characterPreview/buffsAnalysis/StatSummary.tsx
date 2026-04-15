import type {
  AbilityColorKey,
  TagColorEntry,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import {
  ABILITY_COLORS,
  DAMAGE_TAG_ENTRIES,
} from 'lib/characterPreview/buffsAnalysis/abilityColors'
import {
  CardHeader,
  CardShell,
} from 'lib/characterPreview/buffsAnalysis/BuffGroup'
import {
  formatBuffValue,
  getStatConfig,
  renderPill,
  translatedLabel,
} from 'lib/characterPreview/buffsAnalysis/buffUtils'
import {
  DesignContext,
  ellipsisStyle,
  FilterContext,
  getRowBaseStyle,
  getSourceLabelStyle,
  GROUP_ORDER,
} from 'lib/characterPreview/buffsAnalysis/designContext'
import { HitDefinitionRows } from 'lib/characterPreview/buffsAnalysis/HitDefinitionDisplay'
import type { Buff } from 'lib/optimization/basicStatsArray'
import { AKeyNames } from 'lib/optimization/engine/config/keys'
import type { DamageTag } from 'lib/optimization/engine/config/tag'
import type { BuffGroups } from 'lib/simulations/combatBuffsAnalysis'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import type { OptimizerContext } from 'types/optimizer'

// Summary totals filter: only sums universal buffs when unfiltered, sums universal + matching when filtered
function buffMatchesSumFilter(buff: Buff, filter: DamageTag | null): boolean {
  if (filter === null) return buff.damageTags == null
  if (buff.damageTags == null) return true
  return (buff.damageTags & filter) !== 0
}

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
  allContributions: StatSumContribution[],
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
  // First pass: collect all stat keys in insertion order (unfiltered) for stable ordering, metadata, and all contributions for pills
  const metaMap = new Map<string, Pick<StatSum, 'stat' | 'label' | 'percent'>>()
  const allContributionsMap = new Map<string, StatSumContribution[]>()
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
      allContributionsMap.set(key, [])
    }
    allContributionsMap.get(key)!.push({ value: buff.value, damageTags: buff.damageTags })
  }

  // Second pass: compute sums with filter applied
  const sumMap = new Map<string, StatSum>()
  for (const buff of buffs) {
    if (!buffMatchesSumFilter(buff, filter)) continue
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
        allContributions: allContributionsMap.get(key) ?? [],
      })
    }
  }

  // Return all keys in stable order, using zero entries for keys with no filtered matches
  return Array.from(metaMap.keys())
    .map((key) => {
      const existing = sumMap.get(key)
      if (existing) return existing
      const meta = metaMap.get(key)!
      return {
        stat: meta.stat,
        label: meta.label,
        total: 0,
        count: 0,
        percent: meta.percent,
        contributions: [],
        allContributions: allContributionsMap.get(key) ?? [],
      }
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

function isPillActive(pillKey: AbilityColorKey, filter: DamageTag | null): boolean {
  if (pillKey === 'ALL') return true
  if (filter === null) return false
  const entry = DAMAGE_TAG_ENTRIES.find((e) => e.key === pillKey)
  return entry != null && (entry.tag & filter) !== 0
}

function SummaryTagPills(props: { allContributions: StatSumContribution[] }) {
  const filter = useContext(FilterContext)
  const pills = getContributionTagPills(props.allContributions)
  if (pills.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
      {pills.map((p) => renderPill(p.key, p.color, p.label, !isPillActive(p.key, filter)))}
    </div>
  )
}

export function StatSummaryTable(props: {
  sums: StatSum[],
  avatarSrc: string,
}) {
  const options = useContext(DesignContext)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const rowBase = getRowBaseStyle(options)
  const sourceLabelStyle = getSourceLabelStyle(options)

  return (
    <CardShell avatarSrc={props.avatarSrc}>
      <CardHeader label={t('SummaryLabel')} />
      {props.sums.map((sum, i) => (
        <div
          key={sum.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            ...rowBase,
            borderBottom: i < props.sums.length - 1 ? `1px solid ${options.borderColor}` : undefined,
            opacity: sum.total === 0 ? 0.15 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ minWidth: 60, fontSize: options.fontSize, textWrap: 'nowrap' }}>
            {formatBuffValue(sum.total, sum.percent)}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 150, overflow: 'hidden' }}>
            <span style={{ fontSize: options.fontSize, flexShrink: 0, position: 'relative', top: -1 }}>∑</span>
            <span style={ellipsisStyle(options.fontSize)}>{sum.label}</span>
          </div>

          <SummaryTagPills allContributions={sum.allContributions} />

          <span style={sourceLabelStyle}>
            {'x' + sum.count}
          </span>
        </div>
      ))}
    </CardShell>
  )
}

export function HitDefinitionTable(props: {
  avatarSrc: string,
  context: OptimizerContext,
  selectedAction?: number | null,
}) {
  return (
    <CardShell avatarSrc={props.avatarSrc}>
      <HitDefinitionRows
        context={props.context}
        selectedAction={props.selectedAction ?? null}
      />
    </CardShell>
  )
}
