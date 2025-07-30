import { ClearOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Select,
  Tooltip,
  Typography,
} from 'antd'
import { useSubscribe } from 'hooks/useSubscribe'
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
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterOptions } from 'lib/rendering/optionGenerator'
import { Renderer } from 'lib/rendering/renderer'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { SegmentedFilterRow } from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { isStatsValues } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  useEffect,
  useMemo,
} from 'react'
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

  const valueColumnOptions = useMemo(() => generateValueColumnOptions(tValueColumn), [tValueColumn])

  const {
    gradeData,
    verifiedData,
    partsData,
    enhanceData,
    equippedByData,
    initialRollsData,
    allCharacterIds,
  } = useMemo(() => ({
    gradeData: generateGradeTags([2, 3, 4, 5]),
    verifiedData: generateVerifiedTags([true, false]),
    partsData: generatePartsTags(Object.values(Constants.Parts), (x) => Assets.getPart(x)),
    enhanceData: generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']]),
    equippedByData: generateEquippedByTags([true, false]),
    initialRollsData: generateInitialRollsTags([4, 3]),
    allCharacterIds: generateCharacterOptions().map((x) => x.id),
  }), [])

  const {
    setsData,
    mainStatsData,
    subStatsData,
  } = useMemo(() => {
    const locale = i18n.resolvedLanguage ?? 'en_US'
    return {
      setsData: generateTooltipTags(Object.values(Sets).filter((x) => !UnreleasedSets[x]), (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere), locale),
      mainStatsData: generateTooltipTags(Constants.MainStats, (x) => Assets.getStatIcon(x, true), locale),
      subStatsData: generateTooltipTags(Constants.SubStats, (x) => Assets.getStatIcon(x, true), locale),
    }
  }, [i18n.resolvedLanguage])

  window.refreshRelicsScore = () => {
    // NOTE: the scoring modal (where this event is published) calls .submit() in the same block of code
    // that it performs the publish. However, react defers and batches events, so the submit (and update
    // of the scoring overrides) doesn't actually happen until *after* this subscribe event is triggered,
    // hence the need for setTimeout
    // TODO: refactor so it's not necessary, which may be tricky - the recommended flow is to have react
    // views as a pure function of props, but because relics (and other state) are updated mutably in
    // a number of places, we need these manual refresh invocations
    setTimeout(() => {
      characterSelectorChange(focusCharacter)
    }, 100)
  }

  useSubscribe('refreshRelicsScore', window.refreshRelicsScore)

  // Kick off an initial calculation to populate value columns. Though empty dependencies
  // are warned about, we genuinely only want to do this on first component render (updates
  // will correctly re-trigger it)
  useEffect(() => {
    if (DB.getState().settings[SettingOptions.RelicPotentialLoadBehavior.name] == SettingOptions.RelicPotentialLoadBehavior.ScoreAtStartup) {
      characterSelectorChange(focusCharacter)
    }
  }, [])

  function onExcludedCharactersChange(map: Map<CharacterId, boolean> | null) {
    const excludedCharacterIds: Array<CharacterId> = []
    map?.forEach((selected, id) => {
      if (selected) excludedCharacterIds.push(id)
    })
    setExcludedRelicPotentialCharacters(excludedCharacterIds)
    SaveState.delayedSave()
    setTimeout(() => rescoreClicked(), 100)
  }

  function characterSelectorChange(characterId: CharacterId | null | undefined, singleRelic?: Relic) {
    const relics = singleRelic ? [singleRelic] : DB.getRelics()
    console.log('idChange', characterId)

    setFocusCharacter(characterId ?? null)

    const relicScorer = new RelicScorer()

    // NOTE: we cannot cache these results between renders by keying on the relic/characterId because
    // both relic stats and char weights can be edited
    for (const relic of relics) {
      const weights: Partial<RelicScoringWeights> = characterId
        ? relicScorer.getFutureRelicScore(relic, characterId)
        : {
          current: 0,
          best: 0,
          average: 0,
        }
      weights.potentialSelected = characterId ? relicScorer.scoreRelicPotential(relic, characterId) : { bestPct: 0, averagePct: 0, rerollAvgPct: 0 }
      weights.potentialAllAll = { bestPct: 0, averagePct: 0, rerollAvgPct: 0 }
      weights.potentialAllCustom = { bestPct: 0, averagePct: 0, rerollAvgPct: 0 }
      weights.rerollAllAll = { bestPct: 0, averagePct: 0, rerollAvgPct: 0 }
      weights.rerollAllCustom = { bestPct: 0, averagePct: 0, rerollAvgPct: 0 }
      weights.rerollAvgSelected = Math.max(0, weights.potentialSelected.rerollAvgPct)

      for (const cid of allCharacterIds) {
        const pct = relicScorer.scoreRelicPotential(relic, cid)
        weights.potentialAllAll = {
          bestPct: Math.max(pct.bestPct, weights.potentialAllAll.bestPct),
          averagePct: Math.max(pct.averagePct, weights.potentialAllAll.averagePct),
          rerollAvgPct: 0,
        }
        weights.rerollAllAll = {
          bestPct: 0,
          averagePct: 0,
          rerollAvgPct: Math.max(pct.rerollAvgPct, weights.rerollAllAll.rerollAvgPct),
        }

        // For custom characters only consider the ones that aren't excluded
        if (!excludedRelicPotentialCharacters.includes(cid)) {
          weights.potentialAllCustom = {
            bestPct: Math.max(pct.bestPct, weights.potentialAllCustom.bestPct),
            averagePct: Math.max(pct.averagePct, weights.potentialAllCustom.averagePct),
            rerollAvgPct: 0,
          }
          weights.rerollAllCustom = {
            bestPct: 0,
            averagePct: 0,
            rerollAvgPct: Math.max(pct.rerollAvgPct, weights.rerollAllCustom.rerollAvgPct),
          }
        }
      }

      weights.rerollAvgSelectedDelta = weights.rerollAvgSelected == 0 ? 0 : (weights.rerollAvgSelected - weights.potentialSelected.averagePct)

      weights.rerollAvgSelectedEquippedDelta = characterId ? weights.rerollAvgSelected : 0
      if (characterId) {
        const equippedRelicId = DB.getCharacterById(characterId)?.equipped?.[relic.part]
        if (equippedRelicId) {
          weights.rerollAvgSelectedEquippedDelta -= relicScorer.scoreRelicPotential(DB.getRelicById(equippedRelicId)!, characterId).averagePct
        }
      }

      relic.weights = weights as RelicScoringWeights
    }

    if (singleRelic) return

    // Clone the relics to refresh the sort
    DB.setRelics(TsUtils.clone(relics))

    if (characterId && window.relicsGrid?.current?.api) {
      const isSorted = window.relicsGrid.current.api.getColumnState().filter((s) => s.sort !== null)

      if (!isSorted) {
        window.relicsGrid.current.api.applyColumnState({
          state: [{ colId: 'weights.current', sort: 'desc' }],
          defaultState: { sort: null },
        })
      }
    }
  }

  function scoringClicked() {
    const relicsTabFocusCharacter = window.store.getState().relicsTabFocusCharacter
    if (relicsTabFocusCharacter) window.store.getState().setScoringAlgorithmFocusCharacter(relicsTabFocusCharacter)
    setOpen(OpenCloseIDs.SCORING_MODAL)
  }

  function rescoreClicked() {
    characterSelectorChange(focusCharacter)
  }

  function rescoreSingleRelic(singleRelic: Relic) {
    characterSelectorChange(focusCharacter, singleRelic)
  }

  window.rescoreSingleRelic = rescoreSingleRelic

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
                setTimeout(() => characterSelectorChange(characterId), 20)
              }}
              withIcon={true}
            />
            <Button
              onClick={rescoreClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ReapplyButton') /* Reapply scores */}
            </Button>
            <Button
              onClick={scoringClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ScoringButton') /* Scoring algorithm */}
            </Button>
          </Flex>
        </Flex>

        <Flex vertical flex={0.25} gap={10}>
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
                style={{ width: 360 }}
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

export type RelicScoringWeights = {
  average: number,
  current: number,
  best: number,
  potentialSelected: PotentialWeights,
  potentialAllAll: PotentialWeights,
  potentialAllCustom: PotentialWeights,
  rerollAllAll: PotentialWeights,
  rerollAllCustom: PotentialWeights,
  rerollAvgSelected: number,
  rerollAvgSelectedDelta: number,
  rerollAvgSelectedEquippedDelta: number,
}

type PotentialWeights = {
  bestPct: number,
  averagePct: number,
  rerollAvgPct: number,
}
