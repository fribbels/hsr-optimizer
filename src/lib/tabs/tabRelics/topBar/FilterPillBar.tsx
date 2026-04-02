import i18next from 'i18next'
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  Constants,
  type MainStats,
  type Parts,
  type Sets,
  type SubStats,
  UnreleasedSets,
} from 'lib/constants/constants'
import { SetsOrnaments, SetsRelics, setToId } from 'lib/sets/setConfigRegistry'
import { Assets } from 'lib/rendering/assets'
import { Hint } from 'lib/interactions/hint'
import { SaveState } from 'lib/state/saveState'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { CharacterMultiSelect } from 'lib/ui/selectors/CharacterMultiSelect'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import { FilterPill, type FilterOption } from 'lib/tabs/tabRelics/topBar/FilterPill'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { isStatsValues, languages } from 'lib/utils/i18nUtils'
import type { CharacterId } from 'types/character'

export function FilterPillBar() {
  const {
    filters,
    setFilter,
    valueColumns,
    setValueColumns,
    excludedRelicPotentialCharacters,
    setExcludedRelicPotentialCharacters,
  } = useRelicsTabStore(
    useShallow((s) => ({
      filters: s.filters,
      setFilter: s.setFilter,
      valueColumns: s.valueColumns,
      setValueColumns: s.setValueColumns,
      excludedRelicPotentialCharacters: s.excludedRelicPotentialCharacters,
      setExcludedRelicPotentialCharacters: s.setExcludedRelicPotentialCharacters,
    })),
  )

  // Pre-memoize curried setFilter results for stable references.
  // setFilter is a stable zustand action; calling setFilter('part') inline creates a new closure each render.
  const filterHandlers = useMemo(() => ({
    part: setFilter('part'),
    mainStat: setFilter('mainStat'),
    subStat: setFilter('subStat'),
    enhance: setFilter('enhance'),
    grade: setFilter('grade'),
    initialRolls: setFilter('initialRolls'),
    equipped: setFilter('equipped'),
    verified: setFilter('verified'),
    set: setFilter('set'),
  }), [setFilter])

  const { t, i18n } = useTranslation('relicsTab')
  const { t: tValueColumn } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const valueColumnOptions = useMemo(() => generateValueColumnOptions(tValueColumn), [tValueColumn])

  const locale = i18n.resolvedLanguage ?? languages.en_US.locale
  const tStats = useMemo(() => i18next.getFixedT(locale, 'common', 'Stats'), [locale])
  const tSets = useMemo(() => i18next.getFixedT(locale, 'gameData', 'RelicSets'), [locale])
  const tParts = useMemo(() => i18next.getFixedT(locale, 'common', 'Parts'), [locale])

  const partOptions: FilterOption<Parts>[] = useMemo(() =>
    Object.values(Constants.Parts).map((part) => ({
      value: part,
      label: tParts(part),
      icon: <img src={Assets.getPart(part)} style={{ width: 22, height: 22 }} />,
    })),
  [tParts])

  const enhanceOptions: FilterOption<number>[] = useMemo(() =>
    [0, 3, 6, 9, 12, 15].map((n) => ({ value: n, label: `+${n}` })),
  [])

  const gradeOptions: FilterOption<number>[] = useMemo(() =>
    [5, 4, 3, 2].map((n) => ({ value: n, label: `${n}★` })),
  [])

  const initialRollsOptions: FilterOption<number>[] = useMemo(() =>
    [4, 3].map((n) => ({ value: n, label: `${n} substats` })),
  [])

  const equippedOptions: FilterOption<boolean>[] = useMemo(() => [
    { value: true, label: t('RelicFilterBar.Equipped') },
    { value: false, label: t('RelicFilterBar.Unequipped') },
  ], [t])

  const verifiedOptions: FilterOption<boolean>[] = useMemo(() => [
    { value: true, label: t('RelicFilterBar.Verified') },
    { value: false, label: t('RelicFilterBar.Unverified') },
  ], [t])

  const relicSetOptions: FilterOption<Sets>[] = useMemo(() =>
    Object.values(SetsRelics).filter((x) => !UnreleasedSets[x]).map((set) => ({
      value: set,
      label: tSets(`${setToId[set]}.Name`),
      icon: <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 22, height: 22 }} />,
    })),
  [tSets])

  const ornamentSetOptions: FilterOption<Sets>[] = useMemo(() =>
    Object.values(SetsOrnaments).filter((x) => !UnreleasedSets[x]).map((set) => ({
      value: set,
      label: tSets(`${setToId[set]}.Name`),
      icon: <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 22, height: 22 }} />,
    })),
  [tSets])

  const mainStatOptions: FilterOption<MainStats>[] = useMemo(() =>
    Constants.MainStats.map((stat) => ({
      value: stat,
      label: isStatsValues(stat) ? tStats(stat) : stat,
      icon: <img src={Assets.getStatIcon(stat, true)} style={{ width: 22, height: 22 }} />,
    })),
  [tStats])

  const subStatOptions: FilterOption<SubStats>[] = useMemo(() =>
    Constants.SubStats.map((stat) => ({
      value: stat,
      label: isStatsValues(stat) ? tStats(stat) : stat,
      icon: <img src={Assets.getStatIcon(stat, true)} style={{ width: 22, height: 22 }} />,
    })),
  [tStats])

  const excludedCharactersSet = useMemo(
    () => new Set(excludedRelicPotentialCharacters),
    [excludedRelicPotentialCharacters],
  )

  function onExcludedCharactersChange(excluded: Set<CharacterId>) {
    setExcludedRelicPotentialCharacters([...excluded])
    SaveState.delayedSave()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, justifyContent: 'center' }}>
      {/* 8-column grid for both rows so widths align perfectly */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr) auto', gap: 5, alignItems: 'center' }}>
        {/* Row 1: 8 × 1-unit pills */}
        <FilterPill label={t('RelicFilterBar.Part')} options={partOptions} selected={filters.part} onChange={filterHandlers.part} />
        <FilterPill label={t('RelicFilterBar.Mainstat')} options={mainStatOptions} selected={filters.mainStat} onChange={filterHandlers.mainStat} searchable />
        <FilterPill label={t('RelicFilterBar.Substat')} options={subStatOptions} selected={filters.subStat} onChange={filterHandlers.subStat} searchable />
        <FilterPill label={t('RelicFilterBar.Enhance')} options={enhanceOptions} selected={filters.enhance} onChange={filterHandlers.enhance} />
        <FilterPill label={t('RelicFilterBar.Grade')} options={gradeOptions} selected={filters.grade} onChange={filterHandlers.grade} />
        <FilterPill label={t('RelicFilterBar.InitialRolls')} options={initialRollsOptions} selected={filters.initialRolls} onChange={filterHandlers.initialRolls} />
        <FilterPill label={t('RelicFilterBar.Equipped')} options={equippedOptions} selected={filters.equipped} onChange={filterHandlers.equipped} />
        <FilterPill label={t('RelicFilterBar.Verified')} options={verifiedOptions} selected={filters.verified} onChange={filterHandlers.verified} />
        <div style={{ marginLeft: 4 }}><TooltipImage type={Hint.relics()} /></div>

        {/* Row 2: 4 × 2-unit items (each spans 2 grid columns) */}
        <div style={{ gridColumn: 'span 2' }}>
          <FilterPill label={t('RelicFilterBar.RelicSets')} options={relicSetOptions} selected={filters.set} onChange={filterHandlers.set} searchable columns={2} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <FilterPill label={t('RelicFilterBar.OrnamentSets')} options={ornamentSetOptions} selected={filters.set} onChange={filterHandlers.set} searchable columns={2} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <CharacterMultiSelect
            value={excludedCharactersSet}
            selectStyle={{ width: '100%' }}
            onChange={onExcludedCharactersChange}
            maxDisplayedValues={0}
          />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <MultiSelectPills
            clearable
            size="xs"
            value={valueColumns}
            onChange={(values) => setValueColumns(values as typeof valueColumns)}
            data={valueColumnOptions.map((group) => ({
              group: group.label,
              items: group.options.map((opt) => ({ value: opt.value, label: opt.label })),
            }))}
            maxDropdownHeight={750}
            dropdownWidth="fit-content"
          />
        </div>
        <div style={{ marginLeft: 4 }}><TooltipImage type={Hint.valueColumns()} /></div>
      </div>
    </div>
  )
}
