import { Flex, theme } from 'antd'
import i18next from 'i18next'
import { SetKey, Sets } from 'lib/constants/constants'
import { setToId } from 'lib/sets/setConfigRegistry'
import {
  BUFF_ABILITY,
  BUFF_TYPE,
} from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/basicStatsArray'
import { AKeyType } from 'lib/optimization/engine/config/keys'
import { newStatsConfig, StatConfigEntry } from 'lib/optimization/engine/config/statsConfig'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import {
  originalScoringParams,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { AbilityKind, AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { aggregatePerActionBuffs, BuffGroups, PerActionBuffGroups, RotationStepEntry } from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { createContext, ReactElement, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Design Options ──────────────────────────────────────

type DesignOptions = {
  rowHeight: number
  iconSize: number
  sourceOpacity: number
  tintIntensity: number
  panelWidth: number
  rowPaddingX: number
  fontSize: number
  borderColor: string
  cardPadding: number
}

const STAT_ORDER = new Map(Object.keys(newStatsConfig).map((key, i) => [key, i]))

const BORDER_RADIUS = 5
const GROUP_SPACING = 10
const ICON_SIZE_DEFAULT = 48

const DEFAULT_OPTIONS: DesignOptions = {
  rowHeight: 26,
  iconSize: ICON_SIZE_DEFAULT,
  sourceOpacity: 45,
  tintIntensity: 15,
  panelWidth: 600,
  rowPaddingX: 6,
  fontSize: 12,
  borderColor: '#ffffff0f',
  cardPadding: 3,
}

const DesignContext = createContext<DesignOptions>(DEFAULT_OPTIONS)
const FilterContext = createContext<DamageTag | null>(null)

// ─── Existing types & constants ────────────────────────────────

type SummaryIcons = {
  avatar: string
}

type BuffsAnalysisProps = {
  result?: SimulationScore,
  perActionBuffGroups?: PerActionBuffGroups,
  singleColumn?: boolean,
  size?: BuffDisplaySize,
}

export enum BuffDisplaySize {
  SMALL = 390,
  LARGE = 450,
}

function getStatConfig(stat: string): StatConfigEntry | undefined {
  return newStatsConfig[stat as AKeyType]
}

const DAMAGE_TAG_ENTRIES: { tag: DamageTag; key: string; color: string }[] = [
  { tag: DamageTag.BASIC, key: 'BASIC', color: '#91caff' },
  { tag: DamageTag.SKILL, key: 'SKILL', color: '#b37feb' },
  { tag: DamageTag.ULT, key: 'ULT', color: '#5cdbd3' },
  { tag: DamageTag.FUA, key: 'FUA', color: '#95de64' },
  { tag: DamageTag.DOT, key: 'DOT', color: '#ff7875' },
  { tag: DamageTag.BREAK, key: 'BREAK', color: '#ffc069' },
  { tag: DamageTag.SUPER_BREAK, key: 'SUPER_BREAK', color: '#ffd666' },
  { tag: DamageTag.MEMO, key: 'MEMO', color: '#adc6ff' },
  { tag: DamageTag.ADDITIONAL, key: 'ADDITIONAL', color: '#d3adf7' },
  { tag: DamageTag.ELATION, key: 'ELATION', color: '#ffadd2' },
]

const GROUP_ORDER: BUFF_TYPE[] = [
  BUFF_TYPE.PRIMARY,
  BUFF_TYPE.SETS,
  BUFF_TYPE.CHARACTER,
  BUFF_TYPE.LIGHTCONE,
]

function collectAllBuffs(buffGroups: BuffGroups): Buff[] {
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

function computeRelevantTags(allBuffs: Buff[]): Set<DamageTag> {
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

function getBuffSourceIcon(buff: Buff, buffType: BUFF_TYPE) {
  const id = buff.source.id
  if (buffType === BUFF_TYPE.PRIMARY || buffType === BUFF_TYPE.CHARACTER) return Assets.getCharacterAvatarById(id)
  if (buffType === BUFF_TYPE.LIGHTCONE) return Assets.getLightConeIconById(id)
  if (buffType === BUFF_TYPE.SETS) return Assets.getSetImage(Sets[id as SetKey])
  return Assets.getBlank()
}

function getPrimaryDamageTagColor(damageTags?: number): string {
  if (damageTags == null) return 'transparent'
  for (const entry of DAMAGE_TAG_ENTRIES) {
    if (damageTags & entry.tag) return entry.color
  }
  return 'transparent'
}

// ─── Main Component ────────────────────────────────────────────

export function BuffsAnalysisDisplay(props: BuffsAnalysisProps) {
  const perActionBuffGroups = useMemo(
    () => props.perActionBuffGroups ?? rerunSim(props.result),
    [props.perActionBuffGroups, props.result],
  )
  const [selectedAction, setSelectedAction] = useState<number | null>(null) // null = ALL (primary default), index = rotation step
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)
  const options = useMemo(() => ({ ...DEFAULT_OPTIONS, panelWidth: props.size ?? DEFAULT_OPTIONS.panelWidth }), [props.size])

  if (!perActionBuffGroups || Object.keys(perActionBuffGroups.byAction).length === 0) {
    return <></>
  }

  // Resolve active buff groups: null = primary default action, number = rotation step index
  const buffGroups = selectedAction != null && perActionBuffGroups.rotationSteps[selectedAction]
    ? perActionBuffGroups.rotationSteps[selectedAction].groups
    : perActionBuffGroups.byAction[perActionBuffGroups.primaryAction]

  if (!buffGroups) {
    return <></>
  }

  const allBuffs = collectAllBuffs(buffGroups)
  const relevantTags = computeRelevantTags(allBuffs)
  const statSums = computeStatSums(allBuffs, selectedFilter)

  // Icons for summary
  const summaryIcons = (() => {
    const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
    const firstId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
    const avatar = firstId ? Assets.getCharacterAvatarById(firstId) : Assets.getBlank()
    return { avatar }
  })()

  return (
    <DesignContext.Provider value={options}>
    <FilterContext.Provider value={selectedFilter}>
      <Flex vertical gap={5} style={{ width: options.panelWidth }}>
        <ActionSelector
          rotationSteps={perActionBuffGroups.rotationSteps}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
        />
        <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />

        <GroupedLayout buffGroups={buffGroups} />
        <SummaryTitle />
        <StatSummaryTable sums={statSums} icons={summaryIcons} />
      </Flex>
    </FilterContext.Provider>
    </DesignContext.Provider>
  )
}

// ─── Layout Modes ──────────────────────────────────────────────

function renderBuffGroups(buffGroups: BuffGroups, types: BUFF_TYPE[]): ReactElement[] {
  const groups: ReactElement[] = []
  let groupKey = 0
  for (const buffType of types) {
    const groupMap = buffGroups[buffType]
    if (!groupMap) continue
    for (const [id, buffs] of Object.entries(groupMap)) {
      if (buffs.length === 0) continue
      groups.push(<BuffGroup key={groupKey++} id={id} buffs={buffs} buffType={buffType} />)
    }
  }
  return groups
}

function GroupedLayout(props: { buffGroups: BuffGroups }) {
  return <Flex vertical gap={GROUP_SPACING}>{renderBuffGroups(props.buffGroups, GROUP_ORDER)}</Flex>
}

// ─── Action Selector ────────────────────────────────────────────

const ACTION_COLORS: Partial<Record<string, string>> = {
  [AbilityKind.BASIC]: '#91caff',
  [AbilityKind.SKILL]: '#b37feb',
  [AbilityKind.ULT]: '#5cdbd3',
  [AbilityKind.FUA]: '#95de64',
  [AbilityKind.DOT]: '#ff7875',
  [AbilityKind.BREAK]: '#ffc069',
  [AbilityKind.MEMO_SKILL]: '#adc6ff',
  [AbilityKind.MEMO_TALENT]: '#adc6ff',
  [AbilityKind.ELATION_SKILL]: '#ffadd2',
}

type ActionItem = { label: string; color: string; isActive: boolean; onClick: () => void; index: number }

function ActionSelector(props: {
  rotationSteps: RotationStepEntry[]
  selectedAction: number | null
  onActionChange: (action: number | null) => void
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay' })
  const { t: tCombo } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter.ComboOptions' })

  if (props.rotationSteps.length <= 1) return null

  const items: ActionItem[] = [
    { label: 'Default', color: '#8c8c8c', isActive: props.selectedAction === null, onClick: () => props.onActionChange(null), index: -1 },
    ...props.rotationSteps.map((step, index) => {
      const meta = AbilityMeta[step.actionType as AbilityKind]
      const label = meta?.label ? tCombo(meta.label) : step.actionType
      return {
        label: `${index + 1}. ${label}`,
        color: ACTION_COLORS[step.actionType] ?? '#8c8c8c',
        isActive: props.selectedAction === index,
        onClick: () => props.onActionChange(index),
        index,
      }
    }),
  ]

  const sectionLabel = (
    <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>
      {t('ActionLabel')}
    </span>
  )

  return <ActionTabs items={items} label={sectionLabel} />
}

// Tab Underline — text labels with active underline, no box borders
function ActionTabs(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex align='center' gap={0} wrap='wrap' style={{ borderBottom: '1px solid #ffffff15' }}>
        {props.items.map((item) => (
          <span
            key={item.index}
            onClick={item.onClick}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              color: item.isActive ? '#ffffffd9' : '#ffffff59',
              borderBottom: item.isActive ? '2px solid #3f5a96' : '2px solid transparent',
              userSelect: 'none',
              transition: 'color 0.15s, border-color 0.15s',
              marginBottom: -1,
            }}
          >
            {item.label}
          </span>
        ))}
      </Flex>
    </Flex>
  )
}

// ─── Filter Bar ────────────────────────────────────────────────

function FilterBar(props: {
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

// ─── Buff Group ────────────────────────────────────────────────

function getCardStyle(options: DesignOptions, token: { colorBgContainer: string }): React.CSSProperties {
  return { borderRadius: BORDER_RADIUS, overflow: 'hidden', padding: options.cardPadding, backgroundColor: token.colorBgContainer, boxShadow: cardShadow }
}

function getIconStyle(options: DesignOptions): React.CSSProperties {
  return { width: options.iconSize, height: options.iconSize, flexShrink: 0, objectFit: 'cover', margin: '0 4px' }
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE }) {
  const { token } = theme.useToken()
  const options = useContext(DesignContext)
  const { t: tGameData } = useTranslation('gameData')
  const { id, buffs, buffType } = props

  const src = getBuffSourceIcon({ source: { id } } as Buff, buffType)
  let name: string
  if (buffType === BUFF_TYPE.PRIMARY || buffType === BUFF_TYPE.CHARACTER) {
    name = tGameData(`Characters.${id}.Name`)
  } else if (buffType === BUFF_TYPE.LIGHTCONE) {
    name = tGameData(`Lightcones.${id}.Name`)
  } else if (buffType === BUFF_TYPE.SETS) {
    name = tGameData(`RelicSets.${setToId[Sets[id as SetKey]]}.Name`)
  } else {
    name = id
  }

  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  return (
    <Flex align='center' gap={0} style={cardStyleProp}>
      <img src={src} style={iconStyle} />

      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        <CardHeader name={name} />
        {buffs.map((buff, i) => (
          <BuffRow key={i} buff={buff} rowIndex={i} isLast={i === buffs.length - 1} />
        ))}
      </Flex>
    </Flex>
  )
}

function CardHeader(props: { name: string }) {
  const options = useContext(DesignContext)
  return (
    <span style={{
      padding: `0 ${options.rowPaddingX}px`,
      height: options.rowHeight,
      lineHeight: `${options.rowHeight}px`,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontSize: options.fontSize - 1,
      fontWeight: 600,
      color: '#ffffff73',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      borderBottom: '1px solid #ffffff30',
      marginBottom: 2,
    }}>
      {props.name}
    </span>
  )
}

// ─── Buff Row ──────────────────────────────────────────────────

function BuffRow(props: { buff: Buff; rowIndex: number; isLast: boolean }) {
  const { buff, rowIndex, isLast } = props
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

  // Row background (always tinted)
  let rowBackground: string | undefined
  const tintColor = getPrimaryDamageTagColor(buff.damageTags)
  if (tintColor !== 'transparent') {
    const hex = Math.round(options.tintIntensity).toString(16).padStart(2, '0')
    const c = `${tintColor}${hex}`
    const c0 = `${tintColor}00`
    rowBackground = `linear-gradient(to right, ${c0} 0px, ${c} 5px, ${c} calc(100% - 5px), ${c0} 100%)`
  }

  // Row separator
  const borderBottomStyle = isLast ? undefined : getRowSeparator(options)

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

      <span style={{
        minWidth: 150,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textWrap: 'nowrap',
        fontSize: options.fontSize,
      }}
      >
        {statLabel}
      </span>

      <DamageTagPills damageTags={buff.damageTags} />

      <span style={{
        marginLeft: 'auto',
        color: `rgba(255,255,255,${options.sourceOpacity / 100})`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textWrap: 'nowrap',
        fontSize: options.fontSize,
        textAlign: 'end',
        flexShrink: 0,
      }}
      >
        {sourceLabel}
      </span>

    </Flex>
  )
}

function getRowSeparator(options: DesignOptions): string {
  return `1px solid ${options.borderColor}`
}

function buffMatchesFilter(buff: Buff, filter: DamageTag | null): boolean {
  if (filter === null) return true
  // ALL buffs (undefined damageTags) apply to everything — always match
  if (buff.damageTags == null) return true
  return (buff.damageTags & filter) !== 0
}

// ─── Damage Tag Pills ──────────────────────────────────────────

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

const PILL_SIZE = { padding: '0 4px', fontSize: 9, lineHeight: '16px' }

function renderPill(key: string, color: string, label: string): ReactElement {
  return (
    <span key={key} style={{
      padding: PILL_SIZE.padding,
      borderRadius: 3,
      fontSize: PILL_SIZE.fontSize,
      fontWeight: 600,
      lineHeight: PILL_SIZE.lineHeight,
      color: color,
      whiteSpace: 'nowrap',
      border: `1px solid ${color}`,
    }}>
      {label}
    </span>
  )
}


// ─── Stat Sums ─────────────────────────────────────────────────

type StatSumContribution = {
  value: number
  damageTags?: number
}

type StatSum = {
  stat: string
  label: string
  total: number
  count: number
  percent: boolean
  contributions: StatSumContribution[]
}

function computeStatSums(buffs: Buff[], filter: DamageTag | null): StatSum[] {
  // First pass: collect all stat keys in insertion order (unfiltered) for stable ordering
  const allKeys: string[] = []
  const keySet = new Set<string>()
  for (const buff of buffs) {
    const config = getStatConfig(buff.stat)
    if (!config || config.bool) continue
    const key = buff.memo ? `memo:${buff.stat}` : buff.stat
    if (!keySet.has(key)) {
      keySet.add(key)
      allKeys.push(key)
    }
  }

  // Second pass: compute sums with filter applied, preserving the stable key order
  const sumMap = new Map<string, StatSum>()
  for (const key of allKeys) {
    sumMap.set(key, undefined as unknown as StatSum)
  }

  for (const buff of buffs) {
    if (!buffMatchesFilter(buff, filter)) continue
    const config = getStatConfig(buff.stat)
    if (!config || config.bool) continue

    const key = buff.memo ? `memo:${buff.stat}` : buff.stat
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

  return Array.from(sumMap.values())
    .filter((s) => s && s.total !== 0)
    .sort((a, b) => (STAT_ORDER.get(a.stat) ?? 999) - (STAT_ORDER.get(b.stat) ?? 999))
}


function getContributionTagPills(contributions: StatSumContribution[]): { tag: DamageTag | null; color: string; key: string }[] {
  const hasAll = contributions.some((c) => c.damageTags == null)
  const specificTags = new Set<DamageTag>()
  for (const c of contributions) {
    if (c.damageTags != null) {
      for (const entry of DAMAGE_TAG_ENTRIES) {
        if (c.damageTags & entry.tag) specificTags.add(entry.tag)
      }
    }
  }

  const pills: { tag: DamageTag | null; color: string; key: string }[] = []
  if (hasAll) pills.push({ tag: null, color: '#8c8c8c', key: 'ALL' })
  for (const entry of DAMAGE_TAG_ENTRIES) {
    if (specificTags.has(entry.tag)) pills.push({ tag: entry.tag, color: entry.color, key: entry.key })
  }
  return pills
}

function formatStatSum(sum: StatSum): string {
  if (sum.percent) {
    return TsUtils.precisionRound(sum.total * 100, 2).toLocaleString(currentLocale()) + ' %'
  }
  return TsUtils.precisionRound(sum.total, 0).toLocaleString(currentLocale())
}

function SummaryTitle() {
  return (
    <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>
      SUMMARY
    </span>
  )
}

// ─── Summary Components ────────────────────────────────────────


function SummaryTagPills(props: { contributions: StatSumContribution[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay.DamageTags' })
  const pills = getContributionTagPills(props.contributions)
  if (pills.length === 0) return null

  return (
    <Flex gap={2} style={{ flexShrink: 0 }}>
      {pills.map((p) => (
        <span
          key={p.key}
          style={{
            padding: '0 3px',
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 600,
            lineHeight: '14px',
            color: p.color,
            border: `1px solid ${p.color}`,
            whiteSpace: 'nowrap',
          }}
        >
          {t(p.key)}
        </span>
      ))}
    </Flex>
  )
}

function StatSummaryTable(props: { sums: StatSum[]; icons: SummaryIcons }) {
  const options = useContext(DesignContext)
  const { token } = theme.useToken()
  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  return (
    <Flex align='center' gap={0} style={cardStyleProp}>
      <img src={props.icons.avatar} style={iconStyle} />
      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        <CardHeader name='BUFF TOTALS' />
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
            }}
          >
            <span style={{
              minWidth: 60,
              fontSize: options.fontSize,
              textWrap: 'nowrap',
            }}>
              {formatStatSum(sum)}
            </span>

            <span style={{
              minWidth: 150,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textWrap: 'nowrap',
              fontSize: options.fontSize,
            }}>
              {'∑ ' + sum.label}
            </span>

            <SummaryTagPills contributions={sum.contributions} />

            <span style={{
              marginLeft: 'auto',
              color: `rgba(255,255,255,${options.sourceOpacity / 100})`,
              fontSize: options.fontSize,
              textWrap: 'nowrap',
              flexShrink: 0,
            }}>
              {'x' + sum.count}
            </span>
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function rerunSim(result?: SimulationScore): PerActionBuffGroups | null {
  if (!result) return null
  const form = { ...result.simulationForm, trace: true }
  const context = generateContext(form)
  const rerun = runStatSimulations([result.originalSim], form, context, originalScoringParams)[0]
  if (!rerun.actionBuffSnapshots) return null
  return aggregatePerActionBuffs(rerun.actionBuffSnapshots, rerun.rotationBuffSteps ?? [], rerun.x, form, context.primaryAbilityKey)
}

function translatedLabel(stat: string, isMemo = false): string {
  const config = getStatConfig(stat)
  if (!config) return stat

  const label = config.label
  if (typeof label === 'string') {
    return isMemo ? i18next.t('MemospriteLabel', { label }) as string : label
  }

  // @ts-ignore
  const finalLabel: string = i18next.t(`${label.ns}:${label.key}`, label.args)
  return isMemo ? i18next.t('MemospriteLabel', { label: finalLabel }) as string : finalLabel
}
