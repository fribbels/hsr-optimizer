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

// ─── Debug Design Options ──────────────────────────────────────

type ActionStyle = 'pills' | 'segmented' | 'tabs' | 'stepper' | 'dropdown' | 'numbered' | 'mono' | 'sized' | 'header-bar'
type FilterPosition = 'left' | 'centered' | 'inline' | 'under-tabs' | 'integrated'
type CardHeaderStyle = 'none' | 'plain' | 'underline' | 'tinted' | 'bold' | 'compact' | 'compact-border' | 'compact-indent' | 'compact-accent' | 'compact-dim' | 'compact-right'

type DesignOptions = {
  pillStyle: 'outlined' | 'filled'
  rowHeight: number
  iconSize: number
  sourceOpacity: number
  rowBackground: 'none' | 'alternating' | 'tinted'
  tintIntensity: number
  panelWidth: number
  rowSeparator: 'solid' | 'dashed' | 'dotted' | 'none'
  rowPaddingX: number
  fontSize: number
  borderColor: string
  cardPadding: number
  summaryMode: 'none' | 'table' | 'pills'
  summaryPosition: 'top' | 'bottom'
  summaryShowTags: boolean
  summaryShowDelta: boolean
  actionStyle: ActionStyle
  summarySeparator: 'none' | 'label' | 'line' | 'gap' | 'tint'
  filterPosition: FilterPosition
  cardHeaderStyle: CardHeaderStyle
}

const BORDER_RADIUS = 5
const GROUP_SPACING = 10
const ICON_SIZE_DEFAULT = 48

const DEFAULT_OPTIONS: DesignOptions = {
  pillStyle: 'outlined',
  rowHeight: 26,
  iconSize: ICON_SIZE_DEFAULT,
  sourceOpacity: 45,
  rowBackground: 'tinted',
  tintIntensity: 15,
  panelWidth: 600,
  rowSeparator: 'solid',
  rowPaddingX: 6,
  fontSize: 12,
  borderColor: '#ffffff08',
  cardPadding: 3,
  summaryMode: 'table',
  summaryPosition: 'bottom',
  summaryShowTags: true,
  summaryShowDelta: false,
  actionStyle: 'tabs',
  summarySeparator: 'none',
  filterPosition: 'integrated',
  cardHeaderStyle: 'compact-border',
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
  const [options, setOptions] = useState<DesignOptions>({ ...DEFAULT_OPTIONS, panelWidth: props.size ?? DEFAULT_OPTIONS.panelWidth })
  const [debugOpen, setDebugOpen] = useState(false)

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

  // Baseline sums (no filter) for delta comparison
  const baselineSums = selectedFilter != null
    ? new Map(computeStatSums(allBuffs, null).map((s) => [s.label, s.total]))
    : undefined

  // Icons for summary
  const summaryIcons = (() => {
    const primaryGroup = buffGroups[BUFF_TYPE.PRIMARY]
    const firstId = primaryGroup ? Object.keys(primaryGroup)[0] : undefined
    const avatar = firstId ? Assets.getCharacterAvatarById(firstId) : Assets.getBlank()
    return { avatar }
  })()

  const showSummaryAt = (pos: 'top' | 'bottom') =>
    options.summaryMode !== 'none'
    && options.summaryPosition === pos

  const summaryElement = options.summaryMode === 'table'
    ? <StatSummaryTable sums={statSums} baselineSums={baselineSums} icons={summaryIcons} />
    : options.summaryMode === 'pills'
      ? <StatSummaryPills sums={statSums} />
      : null

  return (
    <DesignContext.Provider value={options}>
    <FilterContext.Provider value={selectedFilter}>
      <Flex vertical gap={5} style={{ width: options.panelWidth }}>
        <DebugPanel options={options} setOptions={setOptions} open={debugOpen} setOpen={setDebugOpen} />
        <ActionSelector
          rotationSteps={perActionBuffGroups.rotationSteps}
          selectedAction={selectedAction}
          onActionChange={setSelectedAction}
        />
        <FilterBar selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} relevantTags={relevantTags} />

        {showSummaryAt('top') && <><SummarySeparator position='top' /><SummaryTitle />{summaryElement}</>}
        <GroupedLayout buffGroups={buffGroups} />
        {showSummaryAt('bottom') && <><SummarySeparator position='bottom' /><SummaryTitle />{summaryElement}</>}
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
  const options = useContext(DesignContext)

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

  switch (options.actionStyle) {
    case 'segmented':
      return <ActionSegmented items={items} label={sectionLabel} />
    case 'tabs':
      return <ActionTabs items={items} label={sectionLabel} />
    case 'stepper':
      return <ActionStepper items={items} label={sectionLabel} />
    case 'dropdown':
      return <ActionDropdown items={items} label={sectionLabel} />
    case 'numbered':
      return <ActionNumbered items={items} label={sectionLabel} />
    case 'mono':
      return <ActionMono items={items} label={sectionLabel} />
    case 'sized':
      return <ActionSized items={items} label={sectionLabel} />
    case 'header-bar':
      return <ActionHeaderBar items={items} label={sectionLabel} />
    default:
      return (
        <Flex vertical gap={4}>
          {sectionLabel}
          <Flex gap={4} wrap='wrap'>
            {items.map((item) => (
              <FilterButton key={item.index} label={item.label} color={item.color} isActive={item.isActive} onClick={item.onClick} />
            ))}
          </Flex>
        </Flex>
      )
  }
}

// A. Segmented Control — connected buttons forming a single bar
function ActionSegmented(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex
        align='center'
        gap={0}
        style={{
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid #3f5a96',
          width: 'fit-content',
        }}
      >
        {props.items.map((item, i) => (
          <span
            key={item.index}
            onClick={item.onClick}
            style={{
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: item.isActive ? 700 : 400,
              cursor: 'pointer',
              color: item.isActive ? '#141414' : '#ffffffcc',
              backgroundColor: item.isActive ? '#5cdbd3' : 'transparent',
              borderLeft: i > 0 ? '1px solid #3f5a96' : undefined,
              userSelect: 'none',
              transition: 'all 0.15s',
            }}
          >
            {item.label}
          </span>
        ))}
      </Flex>
    </Flex>
  )
}

// B. Tab Underline — text labels with active underline, no box borders
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

// C. Stepper — connected circles with lines between them
function ActionStepper(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex align='center' gap={0}>
        {props.items.map((item, i) => (
          <React.Fragment key={item.index}>
            {i > 0 && (
              <div style={{
                width: 20,
                height: 2,
                backgroundColor: '#ffffff20',
                flexShrink: 0,
              }} />
            )}
            <Flex
              align='center'
              justify='center'
              onClick={item.onClick}
              style={{
                minWidth: item.isActive ? 'auto' : 24,
                height: 24,
                borderRadius: 12,
                padding: item.isActive ? '0 10px' : 0,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                color: item.isActive ? '#141414' : item.color,
                backgroundColor: item.isActive ? item.color : 'transparent',
                border: `2px solid ${item.color}`,
                userSelect: 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
            >
              {item.isActive ? item.label : (i + 1)}
            </Flex>
          </React.Fragment>
        ))}
      </Flex>
    </Flex>
  )
}

// D. Dropdown Select — single select box
function ActionDropdown(props: { items: ActionItem[]; label: React.ReactNode }) {
  const active = props.items.find((i) => i.isActive)

  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex align='center' gap={8}>
        <span style={{ fontSize: 12, color: '#ffffff73' }}>Viewing:</span>
        <select
          value={active?.index ?? -1}
          onChange={(e) => {
            const idx = Number(e.target.value)
            const item = props.items.find((i) => i.index === idx)
            item?.onClick()
          }}
          style={{
            padding: '3px 8px',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: '#1a1a2e',
            color: active?.color ?? '#ffffffcc',
            border: '1px solid #3f5a96',
            borderRadius: 4,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {props.items.map((item) => (
            <option key={item.index} value={item.index}>{item.label}</option>
          ))}
        </select>
      </Flex>
    </Flex>
  )
}

// E. Numbered — chips with step number badges
function ActionNumbered(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex gap={4} wrap='wrap'>
        {props.items.map((item, i) => (
          <Flex
            key={item.index}
            align='center'
            gap={4}
            onClick={item.onClick}
            style={{
              padding: '2px 8px',
              borderRadius: 3,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${item.color}`,
              color: item.isActive ? '#141414' : item.color,
              backgroundColor: item.isActive ? item.color : 'transparent',
              userSelect: 'none',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              height: 16,
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 800,
              backgroundColor: item.isActive ? 'rgba(0,0,0,0.2)' : `${item.color}30`,
              color: item.isActive ? '#141414' : item.color,
            }}>
              {i + 1}
            </span>
            {item.label}
          </Flex>
        ))}
      </Flex>
    </Flex>
  )
}

// F. Mono — neutral/monochrome palette (structural navigation feel)
function ActionMono(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex gap={4} wrap='wrap'>
        {props.items.map((item) => (
          <span
            key={item.index}
            onClick={item.onClick}
            style={{
              padding: '2px 10px',
              borderRadius: 3,
              fontSize: 12,
              fontWeight: item.isActive ? 700 : 400,
              cursor: 'pointer',
              border: '1px solid #ffffff30',
              color: item.isActive ? '#141414' : '#ffffffb3',
              backgroundColor: item.isActive ? '#ffffffd9' : 'transparent',
              userSelect: 'none',
              transition: 'all 0.15s',
            }}
          >
            {item.label}
          </span>
        ))}
      </Flex>
    </Flex>
  )
}

// G. Sized — larger/bolder buttons (primary navigation weight)
function ActionSized(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex vertical gap={4}>
      {props.label}
      <Flex gap={5} wrap='wrap'>
        {props.items.map((item) => (
          <span
            key={item.index}
            onClick={item.onClick}
            style={{
              padding: '5px 14px',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              border: `2px solid ${item.isActive ? item.color : '#ffffff20'}`,
              color: item.isActive ? '#141414' : '#ffffffcc',
              backgroundColor: item.isActive ? item.color : 'rgba(255,255,255,0.04)',
              userSelect: 'none',
              transition: 'all 0.15s',
              letterSpacing: 0.5,
            }}
          >
            {item.label}
          </span>
        ))}
      </Flex>
    </Flex>
  )
}

// H. Header Bar — dark toolbar strip at the top
function ActionHeaderBar(props: { items: ActionItem[]; label: React.ReactNode }) {
  return (
    <Flex
      align='center'
      gap={0}
      style={{
        borderRadius: BORDER_RADIUS,
        overflow: 'hidden',
        backgroundColor: '#0d0d1a',
        border: '1px solid #ffffff10',
      }}
    >
      <Flex
        align='center'
        justify='center'
        style={{
          padding: '6px 10px',
          backgroundColor: '#ffffff08',
          borderRight: '1px solid #ffffff10',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, color: '#ffffff59', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Action
        </span>
      </Flex>
      {props.items.map((item, i) => (
        <span
          key={item.index}
          onClick={item.onClick}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: item.isActive ? 700 : 400,
            cursor: 'pointer',
            color: item.isActive ? item.color : '#ffffff59',
            backgroundColor: item.isActive ? `${item.color}15` : 'transparent',
            borderBottom: item.isActive ? `2px solid ${item.color}` : '2px solid transparent',
            borderRight: i < props.items.length - 1 ? '1px solid #ffffff08' : undefined,
            userSelect: 'none',
            transition: 'all 0.15s',
          }}
        >
          {item.label}
        </span>
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
  const options = useContext(DesignContext)
  const visibleEntries = DAMAGE_TAG_ENTRIES.filter((e) => props.relevantTags.has(e.tag))
  if (visibleEntries.length <= 1) return null

  const filterButtons = (
    <>
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
    </>
  )

  const filterLabel = (
    <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>
      {t('FilterLabel')}
    </span>
  )

  switch (options.filterPosition) {
    case 'centered':
      return (
        <Flex vertical gap={4} align='center'>
          {filterLabel}
          <Flex gap={4} wrap='wrap' justify='center'>{filterButtons}</Flex>
        </Flex>
      )
    case 'inline':
      return (
        <Flex align='center' gap={8} wrap='wrap'>
          {filterLabel}
          <Flex gap={4} wrap='wrap'>{filterButtons}</Flex>
        </Flex>
      )
    case 'under-tabs':
      return (
        <Flex gap={4} wrap='wrap' style={{
          padding: '4px 8px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: 4,
          marginTop: -2,
        }}>
          {filterButtons}
        </Flex>
      )
    case 'integrated':
      return (
        <Flex justify='center' style={{ padding: '4px 0' }}>
          <Flex gap={4} wrap='wrap' justify='center'>{filterButtons}</Flex>
        </Flex>
      )
    default: // 'left'
      return (
        <Flex vertical gap={4}>
          {filterLabel}
          <Flex gap={4} wrap='wrap'>{filterButtons}</Flex>
        </Flex>
      )
  }
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
  const hasHeader = options.cardHeaderStyle !== 'none'

  return (
    <Flex align='center' gap={0} style={cardStyleProp}>
      <img src={src} style={iconStyle} />

      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        {hasHeader && <CardHeader name={name} />}
        {buffs.map((buff, i) => (
          <BuffRow key={i} buff={buff} rowIndex={i} isLast={i === buffs.length - 1} />
        ))}
      </Flex>
    </Flex>
  )
}

function CardHeader(props: { name: string }) {
  const options = useContext(DesignContext)
  const style = options.cardHeaderStyle

  const base: React.CSSProperties = {
    padding: `0 ${options.rowPaddingX}px`,
    height: options.rowHeight,
    lineHeight: `${options.rowHeight}px`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const compactBase: React.CSSProperties = {
    ...base,
    fontSize: options.fontSize - 1,
    fontWeight: 600,
    color: '#ffffff73',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  }

  switch (style) {
    case 'plain':
      return (
        <span style={{
          ...base,
          fontSize: options.fontSize,
          color: '#ffffffa0',
        }}>
          {props.name}
        </span>
      )
    case 'underline':
      return (
        <span style={{
          ...base,
          fontSize: options.fontSize,
          color: '#ffffffa0',
          borderBottom: `1px solid ${options.borderColor}`,
        }}>
          {props.name}
        </span>
      )
    case 'tinted':
      return (
        <span style={{
          ...base,
          fontSize: options.fontSize,
          color: '#ffffffb3',
          backgroundColor: 'rgba(255,255,255,0.04)',
        }}>
          {props.name}
        </span>
      )
    case 'bold':
      return (
        <span style={{
          ...base,
          fontSize: options.fontSize + 1,
          fontWeight: 700,
          color: '#ffffffd9',
        }}>
          {props.name}
        </span>
      )
    case 'compact':
      return <span style={compactBase}>{props.name}</span>
    case 'compact-border':
      return (
        <span style={{
          ...compactBase,
          borderBottom: '1px solid #ffffff20',
          marginBottom: 2,
        }}>
          {props.name}
        </span>
      )
    case 'compact-indent':
      return (
        <span style={{
          ...compactBase,
          paddingLeft: options.rowPaddingX + 8,
        }}>
          {props.name}
        </span>
      )
    case 'compact-accent':
      return (
        <span style={{
          ...compactBase,
          borderLeft: '3px solid #3f5a96',
          paddingLeft: options.rowPaddingX + 4,
        }}>
          {props.name}
        </span>
      )
    case 'compact-dim':
      return (
        <span style={{
          ...compactBase,
          color: '#ffffff40',
        }}>
          {props.name}
        </span>
      )
    case 'compact-right':
      return (
        <span style={{
          ...compactBase,
          textAlign: 'right',
          paddingRight: options.rowPaddingX + 4,
        }}>
          {props.name}
        </span>
      )
    default:
      return null
  }
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

function getRowSeparator(options: DesignOptions): string | undefined {
  if (options.rowSeparator === 'none') return undefined
  return `1px ${options.rowSeparator} ${options.borderColor}`
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
  const options = useContext(DesignContext)

  const pills = useMemo(() => {
    if (props.damageTags == null) {
      return [renderPill('ALL', '#8c8c8c', t('ALL'), options.pillStyle)]
    }

    const result: ReactElement[] = []
    for (const entry of DAMAGE_TAG_ENTRIES) {
      if (props.damageTags & entry.tag) {
        result.push(renderPill(String(entry.tag), entry.color, t(entry.key), options.pillStyle))
      }
    }
    return result
  }, [props.damageTags, t, options.pillStyle])

  if (pills.length === 0) return null
  return <Flex gap={2} wrap='wrap' style={{ flexShrink: 0 }}>{pills}</Flex>
}

const PILL_SIZE = { padding: '0 4px', fontSize: 9, lineHeight: '16px' }

function renderPill(key: string, color: string, label: string, style: DesignOptions['pillStyle']): ReactElement {
  const base: React.CSSProperties = {
    padding: PILL_SIZE.padding,
    borderRadius: 3,
    fontSize: PILL_SIZE.fontSize,
    fontWeight: 600,
    lineHeight: PILL_SIZE.lineHeight,
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
    type: 'select', key: 'actionStyle', label: 'Action Style',
    choices: [
      { value: 'pills', label: 'Pills' },
      { value: 'segmented', label: 'Segmented' },
      { value: 'tabs', label: 'Tabs' },
      { value: 'stepper', label: 'Stepper' },
      { value: 'dropdown', label: 'Dropdown' },
      { value: 'numbered', label: 'Numbered' },
      { value: 'mono', label: 'Mono' },
      { value: 'sized', label: 'Sized' },
      { value: 'header-bar', label: 'Header Bar' },
    ],
  },
  {
    type: 'select', key: 'cardHeaderStyle', label: 'Card Header',
    choices: [
      { value: 'none', label: 'None' },
      { value: 'plain', label: 'Plain' },
      { value: 'underline', label: 'Underline' },
      { value: 'tinted', label: 'Tinted' },
      { value: 'bold', label: 'Bold' },
      { value: 'compact', label: 'Compact' },
      { value: 'compact-border', label: 'Compact+Border' },
      { value: 'compact-indent', label: 'Compact+Indent' },
      { value: 'compact-accent', label: 'Compact+Accent' },
      { value: 'compact-dim', label: 'Compact+Dim' },
      { value: 'compact-right', label: 'Compact+Right' },
    ],
  },
  {
    type: 'select', key: 'pillStyle', label: 'Pill Style',
    choices: [
      { value: 'outlined', label: 'Outlined' },
      { value: 'filled', label: 'Filled' },
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
    type: 'color', key: 'borderColor', label: 'Border',
    choices: [
      { value: '#354b7d', label: 'Default' },
      { value: '#3f5a96', label: 'Lighter' },
      { value: '#2a3a5c', label: 'Darker' },
      { value: '#4a4a4a', label: 'Gray' },
      { value: '#1a3050', label: 'Navy' },
    ],
  },
  {
    type: 'select', key: 'summaryMode', label: 'Summary',
    choices: [
      { value: 'none', label: 'None' },
      { value: 'table', label: 'Table' },
      { value: 'pills', label: 'Pills' },
    ],
  },
  {
    type: 'select', key: 'summaryPosition', label: 'Sum Pos',
    choices: [
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
    ],
  },
  { type: 'toggle', key: 'summaryShowTags', label: 'Sum Tags' },
  { type: 'toggle', key: 'summaryShowDelta', label: 'Sum Delta' },
  {
    type: 'select', key: 'summarySeparator', label: 'Sum Sep',
    choices: [
      { value: 'none', label: 'None' },
      { value: 'label', label: 'Label' },
      { value: 'line', label: 'Line' },
      { value: 'gap', label: 'Gap' },
      { value: 'tint', label: 'Tint' },
    ],
  },
  {
    type: 'select', key: 'filterPosition', label: 'Filter Pos',
    choices: [
      { value: 'left', label: 'Left' },
      { value: 'centered', label: 'Centered' },
      { value: 'inline', label: 'Inline' },
      { value: 'under-tabs', label: 'Under Tabs' },
      { value: 'integrated', label: 'Integrated' },
    ],
  },
  { type: 'slider', key: 'rowHeight', label: 'Row H', min: 20, max: 40, step: 2 },
  { type: 'slider', key: 'iconSize', label: 'Icon Size', min: 32, max: 96, step: 4 },
  { type: 'slider', key: 'panelWidth', label: 'Width', min: 300, max: 800, step: 10 },
  { type: 'slider', key: 'fontSize', label: 'Font', min: 10, max: 16, step: 1 },
  { type: 'slider', key: 'rowPaddingX', label: 'Pad X', min: 0, max: 16, step: 2 },
  { type: 'slider', key: 'sourceOpacity', label: 'Src Alpha', min: 10, max: 100, step: 5 },
  { type: 'slider', key: 'tintIntensity', label: 'Tint', min: 5, max: 60, step: 5 },
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
        <Flex align='center' gap={6}>
          {props.open && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                setOptions((prev) => ({ ...DEFAULT_OPTIONS, panelWidth: prev.panelWidth }))
              }}
              style={{ ...debugBtnBase, fontSize: 10, padding: '1px 6px', color: '#ff7875', borderColor: '#ff7875' }}
            >
              Reset
            </span>
          )}
          <span style={{ fontSize: 12, color: '#ffffff59' }}>{props.open ? '▲' : '▼'}</span>
        </Flex>
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

  return Array.from(sumMap.values()).filter((s) => s && s.total !== 0)
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

// ─── Summary Separator ─────────────────────────────────────────

function SummaryTitle() {
  return (
    <span style={{ fontSize: 11, color: '#ffffff73', letterSpacing: 1, fontWeight: 600 }}>
      SUMMARY
    </span>
  )
}

function SummarySeparator(props: { position: 'top' | 'bottom' }) {
  const options = useContext(DesignContext)
  if (options.summarySeparator === 'none') return null

  switch (options.summarySeparator) {
    case 'label':
      return (
        <span style={{
          fontSize: 11,
          color: '#ffffff73',
          letterSpacing: 1,
          fontWeight: 600,
          marginTop: props.position === 'bottom' ? 4 : 0,
          marginBottom: props.position === 'top' ? 4 : 0,
        }}>
          BUFF TOTALS
        </span>
      )
    case 'line':
      return (
        <div style={{
          height: 1,
          backgroundColor: options.borderColor,
          margin: '4px 0',
        }} />
      )
    case 'gap':
      return <div style={{ height: 10 }} />
    case 'tint':
      return null // tint is handled by the summary card itself
    default:
      return null
  }
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

function DeltaIndicator(props: { currentTotal: number; baselineTotal: number; percent: boolean }) {
  const options = useContext(DesignContext)
  if (!options.summaryShowDelta) return null

  const delta = props.currentTotal - props.baselineTotal
  if (Math.abs(delta) < 0.0001) return null

  const formatted = props.percent
    ? (delta > 0 ? '+' : '') + TsUtils.precisionRound(delta * 100, 2).toLocaleString(currentLocale()) + '%'
    : (delta > 0 ? '+' : '') + TsUtils.precisionRound(delta, 0).toLocaleString(currentLocale())

  return (
    <span style={{
      fontSize: options.fontSize - 2,
      color: delta > 0 ? '#95de64' : '#ff7875',
      flexShrink: 0,
      fontWeight: 600,
    }}>
      {formatted}
    </span>
  )
}

function StatSummaryTable(props: { sums: StatSum[]; baselineSums?: Map<string, number>; icons: SummaryIcons }) {
  const options = useContext(DesignContext)
  const { token } = theme.useToken()
  const cardStyleProp = getCardStyle(options, token)
  const iconStyle = getIconStyle(options)

  const tinted = options.summarySeparator === 'tint'
  const cardStyle = tinted
    ? { ...cardStyleProp, border: '1px solid #3f5a96', backgroundColor: '#141428' }
    : cardStyleProp

  return (
    <Flex align='center' gap={0} style={cardStyle}>
      <img src={props.icons.avatar} style={iconStyle} />
      <Flex vertical gap={0} style={{ flex: 1, overflow: 'hidden' }}>
        <CardHeader name='BUFF TOTALS' />
        {props.sums.map((sum, i) => {
          const baselineTotal = props.baselineSums?.get(sum.label)

          return (
            <Flex
              key={sum.label}
              align='center'
              gap={6}
              style={{
                padding: `0 ${options.rowPaddingX}px`,
                height: options.rowHeight,
                lineHeight: `${options.rowHeight}px`,
                borderBottom: undefined,
                background: undefined,
              }}
            >
              <span style={{
                minWidth: 60,
                fontSize: options.fontSize,
                textWrap: 'nowrap',
              }}>
                {formatStatSum(sum)}
              </span>

              {baselineTotal != null && (
                <DeltaIndicator currentTotal={sum.total} baselineTotal={baselineTotal} percent={sum.percent} />
              )}

              <span style={{
                minWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textWrap: 'nowrap',
                fontSize: options.fontSize,
              }}>
                {'∑ ' + sum.label}
              </span>

              {options.summaryShowTags && <SummaryTagPills contributions={sum.contributions} />}

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
          )
        })}
      </Flex>
    </Flex>
  )
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

function StatSummaryPills(props: { sums: StatSum[] }) {
  const options = useContext(DesignContext)

  return (
    <Flex gap={6} wrap='wrap'>
      {props.sums.map((sum) => {
        const color = getValueColor(sum.stat)
        return (
          <Flex
            key={sum.label}
            align='center'
            gap={4}
            style={{
              padding: '4px 10px',
              borderRadius: 16,
              backgroundColor: `${color}15`,
              border: `1px solid ${color}40`,
            }}
          >
            <span style={{ fontSize: options.fontSize - 1, color: '#ffffffa0' }}>{sum.label}</span>
            <span style={{ fontSize: options.fontSize, fontWeight: 700 }}>
              {formatStatSum(sum)}
            </span>
          </Flex>
        )
      })}
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
