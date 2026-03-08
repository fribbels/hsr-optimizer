import { IconEraser } from '@tabler/icons-react'
import { Button, Flex, MultiSelect, Text, Tooltip } from '@mantine/core'
import i18next from 'i18next'
import {
  Constants,
  Parts,
  Sets,
  Stats,
  StatsValues,
  UnreleasedSets,
} from 'lib/constants/constants'
import {
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { Renderer } from 'lib/rendering/renderer'
import { SaveState } from 'lib/state/saveState'
import { SegmentedFilterRow } from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import {
  isStatsValues,
  languages,
} from 'lib/utils/i18nUtils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

const tagHeight = 34
const imgWidth = 34

export default function RelicFilterBar() {
  const {
    filters,
    setFilter,
    resetFilters,
    focusCharacter,
    setFocusCharacter,
    excludedRelicPotentialCharacters,
    setExcludedRelicPotentialCharacters,
    valueColumns,
    setValueColumns,
  } = useRelicsTabStore()

  const { t, i18n } = useTranslation('relicsTab')
  const { t: tValueColumn } = useTranslation('relicsTab', { keyPrefix: 'RelicGrid' })

  const valueColumnOptions = useMemo(() => {
    return generateValueColumnOptions(tValueColumn)
  }, [tValueColumn])

  const relicSetFlexBasis = `${100 / Math.ceil(Object.values(SetsRelics).length / 2)}%`
  const ornamentSetFlexBasis = `${100 / Object.values(SetsOrnaments).length}%`

  const {
    setsData,
    mainStatsData,
    subStatsData,
  } = useMemo(() => {
    const locale = i18n.resolvedLanguage ?? languages.en_US.locale
    const setImageFn = (x: string) => Assets.getSetImage(x, Constants.Parts.PlanarSphere)
    const relicSets = Object.values(SetsRelics).filter((x) => !UnreleasedSets[x])
    const relicSetsColumnMajor = [...relicSets.filter((_, i) => i % 2 === 0), ...relicSets.filter((_, i) => i % 2 === 1)]
    return {
      setsData: [
        ...generateTooltipTags(
          relicSetsColumnMajor,
          setImageFn,
          locale,
          relicSetFlexBasis,
        ),
        ...generateTooltipTags(
          Object.values(SetsOrnaments).filter((x) => !UnreleasedSets[x]),
          setImageFn,
          locale,
          ornamentSetFlexBasis,
        ),
      ],
      mainStatsData: generateTooltipTags(Constants.MainStats, (x) => Assets.getStatIcon(x, true), locale),
      subStatsData: generateTooltipTags(Constants.SubStats, (x) => Assets.getStatIcon(x, true), locale),
    }
  }, [i18n.resolvedLanguage])

  function onExcludedCharactersChange(map: Map<CharacterId, boolean> | null) {
    const excludedCharacterIds: Array<CharacterId> = []
    map?.forEach((selected, id) => {
      if (selected) excludedCharacterIds.push(id)
    })
    setExcludedRelicPotentialCharacters(excludedCharacterIds)
    SaveState.delayedSave()
  }

  function scoringClicked() {
    if (focusCharacter) window.store.getState().setScoringAlgorithmFocusCharacter(focusCharacter)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  const gradeData = generateGradeTags([2, 3, 4, 5])
  const verifiedData = generateVerifiedTags([true, false])
  const partsData = generatePartsTags(Object.values(Constants.Parts), (x) => Assets.getPart(x))
  const enhanceData = generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']])
  const equippedByData = generateEquippedByTags([true, false])
  const initialRollsData = generateInitialRollsTags([4, 3])

  return (
    <Flex direction="column" gap={2}>
      <Flex gap={10}>
        <Flex direction="column" flex={1}>
          <HeaderText>{t('RelicFilterBar.Part') /* Part */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.part} setCurrentFilters={setFilter('part')} tags={partsData} flexBasis='15%' noHeight />
        </Flex>
        <Flex direction="column" style={{ height: '100%' }} flex={1}>
          <HeaderText>{t('RelicFilterBar.Enhance') /* Enhance */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.enhance} setCurrentFilters={setFilter('enhance')} tags={enhanceData} flexBasis='15%' noHeight />
        </Flex>
        <Flex direction="column" flex={0.5}>
          <HeaderText>{t('RelicFilterBar.Grade') /* Grade */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.grade} setCurrentFilters={setFilter('grade')} tags={gradeData} flexBasis='15%' noHeight />
        </Flex>
        <Flex direction="column" flex={0.25}>
          <HeaderText>{t('RelicFilterBar.InitialRolls') /* Initial rolls */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.initialRolls}
            setCurrentFilters={setFilter('initialRolls')}
            tags={initialRollsData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex direction="column" flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Verified') /* Verified */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.verified}
            setCurrentFilters={setFilter('verified')}
            tags={verifiedData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex direction="column" flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Equipped') /* Equipped */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.equipped}
            setCurrentFilters={setFilter('equipped')}
            tags={equippedByData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex direction="column" flex={0.4}>
          <HeaderText>{t('RelicFilterBar.Clear') /* Clear */}</HeaderText>
          <Button variant="default" leftSection={<IconEraser size={16} />} onClick={resetFilters} style={{ flexGrow: 1, height: '100%' }}>
            {t('RelicFilterBar.ClearButton') /* Clear all filters */}
          </Button>
        </Flex>
      </Flex>

      <Flex direction="column">
        <HeaderText>{t('RelicFilterBar.Set') /* Set */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.set}
          setCurrentFilters={setFilter('set')}
          tags={setsData}
          noHeight
        />
      </Flex>

      <Flex direction="column">
        <HeaderText>{t('RelicFilterBar.Mainstat') /* Main stats */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.mainStat}
          setCurrentFilters={setFilter('mainStat')}
          tags={mainStatsData}
          noHeight
        />
      </Flex>

      <Flex direction="column">
        <HeaderText>{t('RelicFilterBar.Substat') /* Substats */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.subStat}
          setCurrentFilters={setFilter('subStat')}
          tags={subStatsData}
          noHeight
        />
      </Flex>

      <Flex gap={10}>
        <Flex direction="column" flex={0.5}>
          <HeaderText>{t('RelicFilterBar.RecommendationHeader') /* Relic recommendation character */}</HeaderText>
          <Flex gap={10}>
            <CharacterSelect
              value={focusCharacter}
              selectStyle={{ flex: 1 }}
              onChange={(characterId) => {
                // Wait until after modal closes to update
                setTimeout(() => setFocusCharacter(characterId ?? null), 20)
              }}
              withIcon={true}
            />
            <Button
              variant="default"
              onClick={scoringClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ScoringButton') /* Scoring algorithm */}
            </Button>
          </Flex>
        </Flex>

        <Flex direction="column" flex={0.5} gap={10}>
          <Flex direction="column">
            <Flex justify='space-between' align='center'>
              <HeaderText>{t('RelicFilterBar.Rating') /* Relic ratings */}</HeaderText>
              <TooltipImage type={Hint.valueColumns()} />
            </Flex>
            <Flex gap={10}>
              <MultiSelect
                clearable
                value={valueColumns}
                onChange={(values) => setValueColumns(values as typeof valueColumns)}
                data={valueColumnOptions.map((group) => ({
                  group: group.label,
                  items: group.options.map((opt) => ({ value: opt.value, label: opt.label })),
                }))}
                style={{ flex: 1 }}
                maxDropdownHeight={750}
                comboboxProps={{ width: 'fit-content' }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex direction="column" flex={0.25}>
          <HeaderText>{t('RelicFilterBar.CustomCharsHeader') /* Custom potential characters */}</HeaderText>
          <CharacterSelect
            value={excludedRelicPotentialCharacters}
            selectStyle={{ flex: 1 }}
            onChange={onExcludedCharactersChange}
            multipleSelect={true}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

function generateTextTags(arr: [key: number, value: string][]) {
  return arr.map((x) => ({
    key: x[0],
    display: (
      <Flex style={{ height: tagHeight }} justify='space-around' align='center'>
        <Text style={{ fontSize: 18 }}>
          {x[1]}
        </Text>
      </Flex>
    ),
  }))
}

function generateGradeTags(arr: number[]) {
  return arr.map((x) => ({
    key: x,
    display: Renderer.renderGrade({ grade: x } as Relic),
  }))
}

function generateVerifiedTags(arr: boolean[]) {
  return arr.map((verified) => ({
    key: verified,
    display: Renderer.renderGrade({ grade: -1, verified } as Relic),
  }))
}

function generateEquippedByTags(arr: boolean[]) {
  return arr.map((equipped) => ({
    key: equipped,
    display: Renderer.renderEquipped(equipped),
  }))
}

function generateInitialRollsTags(arr: number[]) {
  return arr.map((x) => ({
    key: x,
    display: Renderer.renderInitialRolls({ initialRolls: x, grade: 5 } as Relic),
  }))
}

function generatePartsTags(keys: Parts[], srcFn: (s: string) => string) {
  return keys.map((key) => ({
    key,
    display: <img style={{ width: imgWidth }} src={srcFn(key)} />,
  }))
}

function generateTooltipTags(arr: (Sets | StatsValues)[], srcFn: (s: string) => string, locale: string, flexBasis?: string) {
  return arr.map((x) => ({
    key: x,
    display: generateTooltipDisplay(x, srcFn, locale),
    flexBasis,
  }))
}

// QOL to colorize elemental stat images instead of using the substat images
const overrides: Record<string, string> = {
  [Stats.Physical_DMG]: 'Physical',
  [Stats.Fire_DMG]: 'Fire',
  [Stats.Ice_DMG]: 'Ice',
  [Stats.Lightning_DMG]: 'Lightning',
  [Stats.Wind_DMG]: 'Wind',
  [Stats.Quantum_DMG]: 'Quantum',
  [Stats.Imaginary_DMG]: 'Imaginary',
}

function generateTooltipDisplay(key: Sets | StatsValues, srcFn: (s: string) => string, locale: string) {
  const tStats = i18next.getFixedT(locale, 'common', 'Stats')
  const tSets = i18next.getFixedT(locale, 'gameData', 'RelicSets')

  const width = overrides[key] ? 30 : imgWidth
  const src = overrides[key] ? Assets.getElement(overrides[key]) : srcFn(key)

  return (
    <Tooltip
      label={isStatsValues(key)
        ? tStats(key)
        : tSets(`${setToId[key]}.Name`)}
      openDelay={200}
    >
      <img style={{ width: width }} src={src} />
    </Tooltip>
  )
}
