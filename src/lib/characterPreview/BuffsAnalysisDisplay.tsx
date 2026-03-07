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
import { ALL_DAMAGE_TAGS, DamageTag } from 'lib/optimization/engine/config/tag'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { Assets } from 'lib/rendering/assets'
import {
  originalScoringParams,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { aggregateCombatBuffs } from 'lib/simulations/combatBuffsAnalysis'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { currentLocale } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { createContext, ReactElement, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// ─── Debug Design Options ──────────────────────────────────────

type DesignOptions = {
  layoutMode: 'icon-left' | 'icon-top' | 'flat' | 'two-column'
  pillStyle: 'outlined' | 'filled' | 'dot' | 'left-border' | 'none'
  pillPosition: 'after-stat' | 'before-value' | 'end-of-row'
  pillSize: 'small' | 'medium' | 'large'
  rowHeight: number
  iconSize: number
  iconShape: 'square' | 'rounded' | 'circle'
  sourceLabel: 'inline-right' | 'hidden' | 'below-stat'
  sourceOpacity: number
  groupSpacing: number
  rowBackground: 'none' | 'alternating' | 'tinted'
  tintIntensity: number
  showGroupName: boolean
  valueStyle: 'normal' | 'bold' | 'colored'
  cardStyle: 'card' | 'bordered' | 'minimal'
  panelWidth: number
  allPillMode: 'ALL' | 'expanded' | 'hidden'
  rowSeparator: 'solid' | 'dashed' | 'dotted' | 'none'
  rowPaddingX: number
  fontSize: number
  iconAlign: 'top' | 'center' | 'stretch'
  borderRadius: number
  borderColor: string
  cardPadding: number
}

const DEFAULT_OPTIONS: DesignOptions = {
  layoutMode: 'icon-left',
  pillStyle: 'outlined',
  pillPosition: 'after-stat',
  pillSize: 'small',
  rowHeight: 26,
  iconSize: 56,
  iconShape: 'square',
  sourceLabel: 'inline-right',
  sourceOpacity: 45,
  groupSpacing: 5,
  rowBackground: 'tinted',
  tintIntensity: 15,
  showGroupName: false,
  valueStyle: 'normal',
  cardStyle: 'card',
  panelWidth: 600,
  allPillMode: 'ALL',
  rowSeparator: 'solid',
  rowPaddingX: 6,
  fontSize: 12,
  iconAlign: 'center',
  borderRadius: 5,
  borderColor: '#354b7d',
  cardPadding: 3,
}

const DesignContext = createContext<DesignOptions>(DEFAULT_OPTIONS)
const FilterContext = createContext<DamageTag | null>(null)

// ─── Existing types & constants ────────────────────────────────

type BuffsAnalysisProps = {
  result?: SimulationScore,
  buffGroups?: Record<BUFF_TYPE, Record<string, Buff[]>>,
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

function collectAllBuffs(buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>): Buff[] {
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
  const buffGroups = props.buffGroups ?? rerunSim(props.result)
  const [selectedFilter, setSelectedFilter] = useState<DamageTag | null>(null)
  const [options, setOptions] = useState<DesignOptions>({ ...DEFAULT_OPTIONS, panelWidth: props.size ?? DEFAULT_OPTIONS.panelWidth })
  const [debugOpen, setDebugOpen] = useState(true)

  if (!buffGroups) {
    return <></>
  }

  const allBuffs = collectAllBuffs(buffGroups)
  debugLogBuffTags(allBuffs)
  const relevantTags = computeRelevantTags(allBuffs)

  return (
    <DesignContext.Provider value={options}>
    <FilterContext.Provider value={selectedFilter}>
      <Flex vertical gap={5} style={{ width: options.panelWidth }}>
        <DebugPanel options={options} setOptions={setOptions} open={debugOpen} setOpen={setDebugOpen} />
        <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />

        {options.layoutMode === 'two-column'
          ? <TwoColumnLayout buffGroups={buffGroups} selectedFilter={selectedFilter} />
          : options.layoutMode === 'flat'
            ? <FlatLayout buffGroups={buffGroups} selectedFilter={selectedFilter} />
            : <GroupedLayout buffGroups={buffGroups} selectedFilter={selectedFilter} />}
      </Flex>
    </FilterContext.Provider>
    </DesignContext.Provider>
  )
}

// ─── Layout Modes ──────────────────────────────────────────────

function GroupedLayout(props: { buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>; selectedFilter: DamageTag | null }) {
  const options = useContext(DesignContext)
  const groups: ReactElement[] = []
  let groupKey = 0

  for (const buffType of GROUP_ORDER) {
    const groupMap = props.buffGroups[buffType]
    if (!groupMap) continue
    for (const [id, buffs] of Object.entries(groupMap)) {
      if (buffs.length === 0) continue
      groups.push(<BuffGroup key={groupKey++} id={id} buffs={buffs} buffType={buffType} />)
    }
  }

  return <Flex vertical gap={options.groupSpacing}>{groups}</Flex>
}

function TwoColumnLayout(props: { buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>; selectedFilter: DamageTag | null }) {
  const options = useContext(DesignContext)
  const leftTypes = [BUFF_TYPE.PRIMARY, BUFF_TYPE.SETS]
  const rightTypes = [BUFF_TYPE.CHARACTER, BUFF_TYPE.LIGHTCONE]

  const renderColumn = (types: BUFF_TYPE[]) => {
    const groups: ReactElement[] = []
    let key = 0
    for (const buffType of types) {
      const groupMap = props.buffGroups[buffType]
      if (!groupMap) continue
      for (const [id, buffs] of Object.entries(groupMap)) {
        if (buffs.length === 0) continue
        groups.push(<BuffGroup key={key++} id={id} buffs={buffs} buffType={buffType} />)
      }
    }
    return <Flex vertical gap={options.groupSpacing}>{groups}</Flex>
  }

  return (
    <Flex gap={10} justify='space-between' style={{ width: '100%' }}>
      {renderColumn(leftTypes)}
      {renderColumn(rightTypes)}
    </Flex>
  )
}

function FlatLayout(props: { buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>>; selectedFilter: DamageTag | null }) {
  const { token } = theme.useToken()
  const options = useContext(DesignContext)

  const allRows: { buff: Buff; buffType: BUFF_TYPE; index: number }[] = []
  let idx = 0
  for (const buffType of GROUP_ORDER) {
    const groupMap = props.buffGroups[buffType]
    if (!groupMap) continue
    for (const buffs of Object.values(groupMap)) {
      for (const buff of buffs) {
        allRows.push({ buff, buffType, index: idx++ })
      }
    }
  }

  return (
    <Flex vertical gap={0} style={getCardStyle(options, token)}>
      {allRows.map(({ buff, buffType, index }, i) => (
        <Flex key={index} align='center' gap={6}>
          <img src={getBuffSourceIcon(buff, buffType)} style={{ width: 28, height: 28, flexShrink: 0, marginLeft: 4 }} />
          <Flex style={{ flex: 1, overflow: 'hidden' }}>
            <BuffRow buff={buff} rowIndex={index} isLast={i === allRows.length - 1} />
          </Flex>
        </Flex>
      ))}
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
    <Flex vertical gap={4}>
      <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>
        {t('FilterLabel')}
      </span>
      <Flex gap={4} wrap='wrap'>
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
        padding: '2px 8px',
        borderRadius: 3,
        fontSize: 12,
        fontWeight: 600,
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
  const base: React.CSSProperties = { borderRadius: options.borderRadius, overflow: 'hidden', padding: options.cardPadding }
  switch (options.cardStyle) {
    case 'card':
      return { ...base, backgroundColor: token.colorBgContainer, boxShadow: cardShadow }
    case 'bordered':
      return { ...base, border: `1px solid ${options.borderColor}` }
    case 'minimal':
      return base
  }
}

function getIconStyle(options: DesignOptions): React.CSSProperties {
  const base: React.CSSProperties = { width: options.iconSize, height: options.iconSize, flexShrink: 0, objectFit: 'cover' }
  switch (options.iconShape) {
    case 'rounded':
      return { ...base, borderRadius: 8 }
    case 'circle':
      return { ...base, borderRadius: '50%' }
    default:
      return base
  }
}

function BuffGroup(props: { id: string; buffs: Buff[]; buffType: BUFF_TYPE }) {
  const { token } = theme.useToken()
  const options = useContext(DesignContext)
  const { t: tGameData } = useTranslation('gameData')
  const { id, buffs, buffType } = props

  let src: string
  let name: string
  if (buffType === BUFF_TYPE.PRIMARY || buffType === BUFF_TYPE.CHARACTER) {
    src = Assets.getCharacterAvatarById(id)
    name = tGameData(`Characters.${id}.Name`)
  } else if (buffType === BUFF_TYPE.LIGHTCONE) {
    src = Assets.getLightConeIconById(id)
    name = tGameData(`Lightcones.${id}.Name`)
  } else if (buffType === BUFF_TYPE.SETS) {
    src = Assets.getSetImage(Sets[id as SetKey])
    name = tGameData(`RelicSets.${setToId[Sets[id as SetKey]]}.Name`)
  } else {
    src = Assets.getBlank()
    name = id
  }

  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  if (options.layoutMode === 'icon-top') {
    return (
      <Flex vertical gap={0} style={cardStyleProp}>
        <Flex align='center' gap={8} style={{ padding: '6px 8px', borderBottom: `1px solid ${options.borderColor}` }}>
          <img src={src} style={{ ...iconStyle, width: options.iconSize * 0.6, height: options.iconSize * 0.6 }} />
          {options.showGroupName && <span style={{ fontWeight: 600, fontSize: options.fontSize }}>{name}</span>}
        </Flex>
        <Flex vertical gap={0}>
          {buffs.map((buff, i) => (
            <BuffRow key={i} buff={buff} rowIndex={i} isLast={i === buffs.length - 1} />
          ))}
        </Flex>
      </Flex>
    )
  }

  // icon-left (default)
  const alignItems = options.iconAlign === 'top' ? 'flex-start' : options.iconAlign === 'stretch' ? 'stretch' : 'center'

  return (
    <Flex align={alignItems} gap={0} style={cardStyleProp}>
      <Flex vertical align='center' gap={2} style={{ flexShrink: 0 }}>
        <img src={src} style={iconStyle} />
        {options.showGroupName && (
          <span style={{ fontSize: 10, color: '#ffffff73', textAlign: 'center', maxWidth: options.iconSize, overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap' }}>
            {name}
          </span>
        )}
      </Flex>

      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        {buffs.map((buff, i) => (
          <BuffRow key={i} buff={buff} rowIndex={i} isLast={i === buffs.length - 1} />
        ))}
      </Flex>
    </Flex>
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
      sourceLabel = tGameData(`Lightcones.${source.id}.Name`)
      break
    case BUFF_TYPE.SETS:
      sourceLabel = tGameData(`RelicSets.${setToId[Sets[source.id]]}.Name`)
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

  // Row background
  let rowBackground: string | undefined
  if (options.rowBackground === 'alternating') {
    rowBackground = rowIndex % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)'
  } else if (options.rowBackground === 'tinted') {
    const tintColor = getPrimaryDamageTagColor(buff.damageTags)
    if (tintColor !== 'transparent') {
      const hex = Math.round(options.tintIntensity).toString(16).padStart(2, '0')
      const c = `${tintColor}${hex}`
      const c0 = `${tintColor}00`
      rowBackground = `linear-gradient(to right, ${c0} 0px, ${c} 5px, ${c} calc(100% - 5px), ${c0} 100%)`
    }
  }

  // Value style
  const valueStyles: React.CSSProperties = {
    minWidth: 60,
    textWrap: 'nowrap',
    fontSize: options.fontSize,
    fontWeight: options.valueStyle === 'bold' ? 700 : 400,
    color: options.valueStyle === 'colored' ? getValueColor(stat) : undefined,
  }

  // Left border mode
  const leftBorder = options.pillStyle === 'left-border'
    ? `3px solid ${getPrimaryDamageTagColor(buff.damageTags) || '#8c8c8c'}`
    : undefined

  // Row separator
  const borderBottomStyle = isLast ? undefined : getRowSeparator(options)

  // Pills element
  const pillsEl = options.pillStyle !== 'none' && options.pillStyle !== 'left-border'
    ? <DamageTagPills damageTags={buff.damageTags} />
    : null

  // Source element
  const sourceEl = options.sourceLabel === 'inline-right'
    ? (
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
    )
    : null

  return (
    <Flex vertical gap={0}>
      <Flex
        align='center'
        gap={6}
        style={{
          padding: `0 ${options.rowPaddingX}px`,
          height: options.rowHeight,
          lineHeight: `${options.rowHeight}px`,
          borderBottom: borderBottomStyle,
          background: rowBackground,
          borderLeft: leftBorder,
          opacity: dimmed ? 0.05 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {options.pillPosition === 'before-value' && pillsEl}

        <span style={valueStyles}>{value}</span>

        <span style={{
          minWidth: 100,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textWrap: 'nowrap',
          fontSize: options.fontSize,
        }}
        >
          {statLabel}
        </span>

        {options.pillPosition === 'after-stat' && pillsEl}

        {sourceEl}

        {options.pillPosition === 'end-of-row' && pillsEl}
      </Flex>

      {options.sourceLabel === 'below-stat' && (
        <Flex style={{ padding: `0 ${options.rowPaddingX}px 2px`, fontSize: options.fontSize - 2, color: `rgba(255,255,255,${options.sourceOpacity / 100})` }}>
          {sourceLabel}
        </Flex>
      )}
    </Flex>
  )
}

function getRowSeparator(options: DesignOptions): string | undefined {
  if (options.rowSeparator === 'none') return undefined
  return `1px ${options.rowSeparator} ${options.borderColor}`
}

function getValueColor(stat: string): string {
  if (stat.includes('DMG_BOOST') || stat.includes('CR') || stat.includes('CD')) return '#91caff'
  if (stat.includes('DEF_PEN')) return '#ff7875'
  if (stat.includes('VULNERABILITY')) return '#ffc069'
  if (stat.includes('RES_PEN')) return '#b37feb'
  if (stat.includes('ATK')) return '#95de64'
  if (stat.includes('SPD')) return '#5cdbd3'
  return '#ffffffd9'
}

function buffMatchesFilter(buff: Buff, filter: DamageTag | null): boolean {
  if (filter === null) return true
  // ALL buffs (undefined damageTags) apply to everything — always match
  if (buff.damageTags == null) return true
  return (buff.damageTags & filter) !== 0
}

// Temporary debug: log buff damageTags to verify data is flowing
function debugLogBuffTags(buffs: Buff[]) {
  const summary = buffs.map((b) => `${b.stat}: ${b.damageTags ?? 'ALL'}`).join(', ')
  console.log('[BuffsDebug]', summary)
}

// ─── Damage Tag Pills ──────────────────────────────────────────

function DamageTagPills(props: { damageTags?: number }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ExpandedDataPanel.BuffsAnalysisDisplay.DamageTags' })
  const options = useContext(DesignContext)

  const pills = useMemo(() => {
    const isAll = props.damageTags == null
    if (isAll && options.allPillMode === 'hidden') return []
    if (isAll && options.allPillMode === 'ALL') {
      return [renderPill('ALL', '#8c8c8c', t('ALL'), options.pillStyle, options.pillSize)]
    }

    const mask = props.damageTags ?? ALL_DAMAGE_TAGS
    const result: ReactElement[] = []
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if (mask & entry.tag) {
        result.push(renderPill(String(entry.tag), entry.color, t(entry.key), options.pillStyle, options.pillSize))
      }
    }
    return result
  }, [props.damageTags, t, options.pillStyle, options.allPillMode, options.pillSize])

  if (pills.length === 0) return null
  return <Flex gap={2} wrap='wrap' style={{ flexShrink: 0 }}>{pills}</Flex>
}

const PILL_SIZES = {
  small: { padding: '0 4px', fontSize: 9, lineHeight: '16px', dot: 6 },
  medium: { padding: '0 5px', fontSize: 10, lineHeight: '18px', dot: 8 },
  large: { padding: '0 7px', fontSize: 12, lineHeight: '20px', dot: 10 },
}

function renderPill(key: string, color: string, label: string, style: DesignOptions['pillStyle'], size: DesignOptions['pillSize']): ReactElement {
  const sz = PILL_SIZES[size]

  if (style === 'dot') {
    return (
      <span key={key} title={label} style={{
        width: sz.dot,
        height: sz.dot,
        borderRadius: sz.dot / 2,
        backgroundColor: color,
        display: 'inline-block',
        flexShrink: 0,
      }}
      />
    )
  }

  const base: React.CSSProperties = {
    padding: sz.padding,
    borderRadius: 3,
    fontSize: sz.fontSize,
    fontWeight: 600,
    lineHeight: sz.lineHeight,
    color: color,
    whiteSpace: 'nowrap',
  }

  if (style === 'filled') {
    return <span key={key} style={{ ...base, backgroundColor: `${color}30` }}>{label}</span>
  }

  // outlined (default)
  return <span key={key} style={{ ...base, border: `1px solid ${color}` }}>{label}</span>
}

// ─── Debug Panel ───────────────────────────────────────────────

type OptionDef =
  | { type: 'select'; key: keyof DesignOptions; label: string; choices: { value: string | number; label: string }[] }
  | { type: 'toggle'; key: keyof DesignOptions; label: string }
  | { type: 'slider'; key: keyof DesignOptions; label: string; min: number; max: number; step: number }
  | { type: 'color'; key: keyof DesignOptions; label: string; choices: { value: string; label: string }[] }

const OPTION_DEFS: OptionDef[] = [
  {
    type: 'select', key: 'layoutMode', label: 'Layout',
    choices: [
      { value: 'icon-left', label: 'Icon Left' },
      { value: 'icon-top', label: 'Icon Top' },
      { value: 'flat', label: 'Flat List' },
      { value: 'two-column', label: 'Two Column' },
    ],
  },
  {
    type: 'select', key: 'pillStyle', label: 'Pill Style',
    choices: [
      { value: 'outlined', label: 'Outlined' },
      { value: 'filled', label: 'Filled' },
      { value: 'dot', label: 'Dot' },
      { value: 'left-border', label: 'Left Border' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    type: 'select', key: 'pillPosition', label: 'Pill Pos',
    choices: [
      { value: 'after-stat', label: 'After Stat' },
      { value: 'before-value', label: 'Before Value' },
      { value: 'end-of-row', label: 'End of Row' },
    ],
  },
  {
    type: 'select', key: 'pillSize', label: 'Pill Size',
    choices: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
  },
  {
    type: 'select', key: 'allPillMode', label: 'ALL Pills',
    choices: [
      { value: 'ALL', label: 'Show ALL' },
      { value: 'expanded', label: 'Expanded' },
      { value: 'hidden', label: 'Hidden' },
    ],
  },
  {
    type: 'select', key: 'rowBackground', label: 'Row BG',
    choices: [
      { value: 'none', label: 'None' },
      { value: 'alternating', label: 'Alternating' },
      { value: 'tinted', label: 'Tinted' },
    ],
  },
  {
    type: 'select', key: 'rowSeparator', label: 'Separator',
    choices: [
      { value: 'solid', label: 'Solid' },
      { value: 'dashed', label: 'Dashed' },
      { value: 'dotted', label: 'Dotted' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    type: 'select', key: 'sourceLabel', label: 'Source',
    choices: [
      { value: 'inline-right', label: 'Right' },
      { value: 'hidden', label: 'Hidden' },
      { value: 'below-stat', label: 'Below' },
    ],
  },
  {
    type: 'select', key: 'valueStyle', label: 'Value Style',
    choices: [
      { value: 'normal', label: 'Normal' },
      { value: 'bold', label: 'Bold' },
      { value: 'colored', label: 'Colored' },
    ],
  },
  {
    type: 'select', key: 'cardStyle', label: 'Card Style',
    choices: [
      { value: 'card', label: 'Card' },
      { value: 'bordered', label: 'Bordered' },
      { value: 'minimal', label: 'Minimal' },
    ],
  },
  {
    type: 'select', key: 'iconShape', label: 'Icon Shape',
    choices: [
      { value: 'square', label: 'Square' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'circle', label: 'Circle' },
    ],
  },
  {
    type: 'select', key: 'iconAlign', label: 'Icon Align',
    choices: [
      { value: 'center', label: 'Center' },
      { value: 'top', label: 'Top' },
      { value: 'stretch', label: 'Stretch' },
    ],
  },
  {
    type: 'color', key: 'borderColor', label: 'Border',
    choices: [
      { value: '#354b7d', label: 'Default' },
      { value: '#3f5a96', label: 'Lighter' },
      { value: '#2a3a5c', label: 'Darker' },
      { value: '#4a4a4a', label: 'Gray' },
      { value: '#1a3050', label: 'Navy' },
    ],
  },
  { type: 'toggle', key: 'showGroupName', label: 'Show Name' },
  { type: 'slider', key: 'rowHeight', label: 'Row H', min: 20, max: 40, step: 2 },
  { type: 'slider', key: 'iconSize', label: 'Icon Size', min: 32, max: 96, step: 4 },
  { type: 'slider', key: 'groupSpacing', label: 'Gap', min: 0, max: 16, step: 1 },
  { type: 'slider', key: 'panelWidth', label: 'Width', min: 300, max: 800, step: 10 },
  { type: 'slider', key: 'fontSize', label: 'Font', min: 10, max: 16, step: 1 },
  { type: 'slider', key: 'rowPaddingX', label: 'Pad X', min: 0, max: 16, step: 2 },
  { type: 'slider', key: 'sourceOpacity', label: 'Src Alpha', min: 10, max: 100, step: 5 },
  { type: 'slider', key: 'tintIntensity', label: 'Tint', min: 5, max: 60, step: 5 },
  { type: 'slider', key: 'borderRadius', label: 'Radius', min: 0, max: 16, step: 1 },
  { type: 'slider', key: 'cardPadding', label: 'Card Pad', min: 0, max: 12, step: 1 },
]

const debugLabelStyle: React.CSSProperties = { fontSize: 11, color: '#ffffff99', minWidth: 65 }
const debugBtnBase: React.CSSProperties = {
  fontSize: 11, padding: '1px 4px', backgroundColor: '#1a1a2e', color: '#ffffffcc',
  border: '1px solid #3f5a96', borderRadius: 3, outline: 'none', cursor: 'pointer',
}

function DebugPanel(props: {
  options: DesignOptions
  setOptions: React.Dispatch<React.SetStateAction<DesignOptions>>
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const { options, setOptions } = props

  const update = (key: keyof DesignOptions, value: string | number | boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Flex vertical gap={4} style={{
      border: '1px solid #3f5a96',
      borderRadius: 5,
      padding: props.open ? '8px 10px' : '4px 10px',
      backgroundColor: '#141428',
    }}
    >
      <Flex
        justify='space-between'
        align='center'
        onClick={() => props.setOpen(!props.open)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff73', letterSpacing: 1 }}>DEBUG DESIGN OPTIONS</span>
        <span style={{ fontSize: 12, color: '#ffffff59' }}>{props.open ? '▲' : '▼'}</span>
      </Flex>

      {props.open && (
        <Flex vertical gap={4}>
          {OPTION_DEFS.map((def) => {
            if (def.type === 'select' || def.type === 'color') {
              return (
                <Flex key={def.key} align='center' gap={6}>
                  <span style={debugLabelStyle}>{def.label}</span>
                  <Flex gap={3} wrap='wrap'>
                    {def.choices.map((c) => {
                      const isActive = options[def.key] === c.value
                      const colorSwatch = def.type === 'color'
                        ? { borderLeft: `4px solid ${c.value}` }
                        : {}
                      return (
                        <span
                          key={c.value}
                          onClick={() => update(def.key, c.value)}
                          style={{
                            ...debugBtnBase,
                            ...colorSwatch,
                            backgroundColor: isActive ? '#3f5a96' : '#1a1a2e',
                            fontWeight: isActive ? 700 : 400,
                          }}
                        >
                          {c.label}
                        </span>
                      )
                    })}
                  </Flex>
                </Flex>
              )
            }

            if (def.type === 'toggle') {
              const isOn = !!options[def.key]
              return (
                <Flex key={def.key} align='center' gap={6}>
                  <span style={debugLabelStyle}>{def.label}</span>
                  <span
                    onClick={() => update(def.key, !isOn)}
                    style={{
                      ...debugBtnBase,
                      backgroundColor: isOn ? '#3f5a96' : '#1a1a2e',
                      fontWeight: isOn ? 700 : 400,
                      padding: '1px 8px',
                    }}
                  >
                    {isOn ? 'ON' : 'OFF'}
                  </span>
                </Flex>
              )
            }

            if (def.type === 'slider') {
              return (
                <Flex key={def.key} align='center' gap={6}>
                  <span style={debugLabelStyle}>{def.label}</span>
                  <input
                    type='range'
                    min={def.min}
                    max={def.max}
                    step={def.step}
                    value={options[def.key] as number}
                    onChange={(e) => update(def.key, Number(e.target.value))}
                    style={{ width: 100, accentColor: '#3f5a96' }}
                  />
                  <span style={{ fontSize: 11, color: '#ffffff73', minWidth: 24 }}>{String(options[def.key])}</span>
                </Flex>
              )
            }

            return null
          })}
        </Flex>
      )}
    </Flex>
  )
}

// ─── Helpers ───────────────────────────────────────────────────

function rerunSim(result?: SimulationScore) {
  if (!result) return null
  result.simulationForm.trace = true
  const context = generateContext(result.simulationForm)
  const rerun = runStatSimulations([result.originalSim], result.simulationForm, context, originalScoringParams)[0]
  return aggregateCombatBuffs(rerun.x, result.simulationForm)
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
