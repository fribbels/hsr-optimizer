import { Flex } from '@mantine/core'
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
    { value: true, label: 'Equipped' },
    { value: false, label: 'Unequipped' },
  ], [])

  const verifiedOptions: FilterOption<boolean>[] = useMemo(() => [
    { value: true, label: 'Verified' },
    { value: false, label: 'Unverified' },
  ], [])

  const setOptions: FilterOption<Sets>[] = useMemo(() => {
    const relicSets = Object.values(SetsRelics).filter((x) => !UnreleasedSets[x])
    const ornamentSets = Object.values(SetsOrnaments).filter((x) => !UnreleasedSets[x])
    return [...relicSets, ...ornamentSets].map((set) => ({
      value: set,
      label: tSets(`${setToId[set]}.Name`),
      icon: <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} style={{ width: 22, height: 22 }} />,
    }))
  }, [tSets])

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
    <Flex direction="column" gap={6} flex={1} justify="center">
      {/* Row 1: Filter pills + trailing spacer to align with row 2's help icon (16px) */}
      <Flex gap={5} align="center">
        <FilterPill label={t('RelicFilterBar.Part')} options={partOptions} selected={filters.part} onChange={setFilter('part')} />
        <FilterPill label={t('RelicFilterBar.Set')} options={setOptions} selected={filters.set} onChange={setFilter('set')} popoverWidth={280} />
        <FilterPill label={t('RelicFilterBar.Grade')} options={gradeOptions} selected={filters.grade} onChange={setFilter('grade')} />
        <FilterPill label={t('RelicFilterBar.Enhance')} options={enhanceOptions} selected={filters.enhance} onChange={setFilter('enhance')} columns={2} />
        <FilterPill label={t('RelicFilterBar.InitialRolls')} options={initialRollsOptions} selected={filters.initialRolls} onChange={setFilter('initialRolls')} />
        <FilterPill label={t('RelicFilterBar.Mainstat')} options={mainStatOptions} selected={filters.mainStat} onChange={setFilter('mainStat')} popoverWidth={260} />
        <FilterPill label={t('RelicFilterBar.Substat')} options={subStatOptions} selected={filters.subStat} onChange={setFilter('subStat')} popoverWidth={260} />
        <FilterPill label={t('RelicFilterBar.Equipped')} options={equippedOptions} selected={filters.equipped} onChange={setFilter('equipped')} />
        <FilterPill label={t('RelicFilterBar.Verified')} options={verifiedOptions} selected={filters.verified} onChange={setFilter('verified')} />
        <TooltipImage type={Hint.relics()} />
      </Flex>

      {/* Row 2: Custom characters + Ratings + Help */}
      <Flex gap={5} align="center">
        <CharacterMultiSelect
          value={excludedCharactersSet}
          selectStyle={{ flex: 1 }}
          onChange={onExcludedCharactersChange}
          maxDisplayedValues={0}
        />
        <MultiSelectPills
          clearable
          size="xs"
          value={valueColumns}
          onChange={(values) => setValueColumns(values as typeof valueColumns)}
          data={valueColumnOptions.map((group) => ({
            group: group.label,
            items: group.options.map((opt) => ({ value: opt.value, label: opt.label })),
          }))}
          style={{ flex: 1 }}
          maxDropdownHeight={750}
          dropdownWidth="fit-content"
        />
        <TooltipImage type={Hint.valueColumns()} />
      </Flex>
    </Flex>
  )
}
