import { ClearOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Select,
  Tooltip,
  Typography,
} from 'antd'
import i18next from 'i18next'
import {
  Constants,
  Parts,
  Sets,
  SetsRelics,
  setToId,
  Stats,
  StatsValues,
  UnreleasedSets,
} from 'lib/constants/constants'
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

const { Text } = Typography

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

  const {
    setsData,
    mainStatsData,
    subStatsData,
  } = useMemo(() => {
    const locale = i18n.resolvedLanguage ?? languages.en_US.locale
    return {
      setsData: generateTooltipTags(
        Object.values(Sets).filter((x) => !UnreleasedSets[x]),
        (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere),
        locale,
      ),
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

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>{t('RelicFilterBar.Part') /* Part */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.part} setCurrentFilters={setFilter('part')} tags={partsData} flexBasis='15%' noHeight />
        </Flex>
        <Flex vertical style={{ height: '100%' }} flex={1}>
          <HeaderText>{t('RelicFilterBar.Enhance') /* Enhance */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.enhance} setCurrentFilters={setFilter('enhance')} tags={enhanceData} flexBasis='15%' noHeight />
        </Flex>
        <Flex vertical flex={0.5}>
          <HeaderText>{t('RelicFilterBar.Grade') /* Grade */}</HeaderText>
          <SegmentedFilterRow currentFilter={filters.grade} setCurrentFilters={setFilter('grade')} tags={gradeData} flexBasis='15%' noHeight />
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.InitialRolls') /* Initial rolls */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.initialRolls}
            setCurrentFilters={setFilter('initialRolls')}
            tags={initialRollsData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Verified') /* Verified */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.verified}
            setCurrentFilters={setFilter('verified')}
            tags={verifiedData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Equipped') /* Equipped */}</HeaderText>
          <SegmentedFilterRow
            currentFilter={filters.equipped}
            setCurrentFilters={setFilter('equipped')}
            tags={equippedByData}
            flexBasis='15%'
            noHeight
          />
        </Flex>
        <Flex vertical flex={0.4}>
          <HeaderText>{t('RelicFilterBar.Clear') /* Clear */}</HeaderText>
          <Button icon={<ClearOutlined />} onClick={resetFilters} style={{ flexGrow: 1, height: '100%' }}>
            {t('RelicFilterBar.ClearButton') /* Clear all filters */}
          </Button>
        </Flex>
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Set') /* Set */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.set}
          setCurrentFilters={setFilter('set')}
          tags={setsData}
          flexBasis={`${100 / Object.values(SetsRelics).length}%`}
          noHeight
        />
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Mainstat') /* Main stats */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.mainStat}
          setCurrentFilters={setFilter('mainStat')}
          tags={mainStatsData}
          noHeight
        />
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Substat') /* Substats */}</HeaderText>
        <SegmentedFilterRow
          currentFilter={filters.subStat}
          setCurrentFilters={setFilter('subStat')}
          tags={subStatsData}
          noHeight
        />
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={0.5}>
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
              onClick={scoringClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ScoringButton') /* Scoring algorithm */}
            </Button>
          </Flex>
        </Flex>

        <Flex vertical flex={0.5} gap={10}>
          <Flex vertical>
            <Flex justify='space-between' align='center'>
              <HeaderText>{t('RelicFilterBar.Rating') /* Relic ratings */}</HeaderText>
              <TooltipImage type={Hint.valueColumns()} />
            </Flex>
            <Flex gap={10}>
              <Select
                mode='multiple'
                allowClear
                value={valueColumns}
                onChange={setValueColumns}
                options={valueColumnOptions}
                maxTagCount='responsive'
                style={{ flex: 1 }}
                listHeight={750}
                dropdownStyle={{ width: 'fit-content' }}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical flex={0.25}>
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

function generateTooltipTags(arr: (Sets | StatsValues)[], srcFn: (s: string) => string, locale: string) {
  return arr.map((x) => ({
    key: x,
    display: generateTooltipDisplay(x, srcFn, locale),
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
      title={isStatsValues(key)
        ? tStats(key)
        : tSets(`${setToId[key]}.Name`)}
      mouseEnterDelay={0.2}
    >
      <img style={{ width: width }} src={src} />
    </Tooltip>
  )
}

const gradeData = generateGradeTags([2, 3, 4, 5])
const verifiedData = generateVerifiedTags([true, false])
const partsData = generatePartsTags(Object.values(Constants.Parts), (x) => Assets.getPart(x))
const enhanceData = generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']])
const equippedByData = generateEquippedByTags([true, false])
const initialRollsData = generateInitialRollsTags([4, 3])
