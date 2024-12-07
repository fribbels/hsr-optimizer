import { ClearOutlined } from '@ant-design/icons'
import { Button, Flex, Select, theme, Tooltip, Typography } from 'antd'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { useSubscribe } from 'hooks/useSubscribe'
import { Constants, Sets, SetsRelics, setToId, Stats, UnreleasedSets } from 'lib/constants/constants'
import { Hint } from 'lib/interactions/hint'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { Assets } from 'lib/rendering/assets'
import { generateCharacterOptions } from 'lib/rendering/optionGenerator'
import { Renderer } from 'lib/rendering/renderer'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import CharacterSelect from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { TsUtils } from 'lib/utils/TsUtils'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'
import { Relic } from 'types/relic'
import { RelicTabFilters } from 'types/store'

const { useToken } = theme
const { Text } = Typography

const tagHeight = 34
const imgWidth = 34

const BLANK = Assets.getBlank()

export default function RelicFilterBar(props: {
  setValueColumns: () => void
  valueColumnOptions: {
    label: string
    options: unknown[]
  }[]
  valueColumns: string[]
}) {
  const setRelicTabFilters = window.store((s) => s.setRelicTabFilters)
  const setRelicsTabFocusCharacter = window.store((s) => s.setRelicsTabFocusCharacter)

  const [currentlySelectedCharacterId, setCurrentlySelectedCharacterId] = useState<string | undefined>()

  const { t, i18n } = useTranslation(['relicsTab', 'common', 'gameData'])

  const characterOptions = useMemo(() => {
    return generateCharacterOptions()
  }, [])

  function generateImageTags(arr: string[], srcFn: (s: string) => string, tooltip: boolean) {
    function generateDisplay(key: string) {
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

      const width = overrides[key] ? 30 : imgWidth
      const elementOrBlank = Assets.getElement(overrides[key])
      const src = elementOrBlank != BLANK ? elementOrBlank : srcFn(key)

      return tooltip
        ? (
          // @ts-ignore
          <Tooltip title={i18n.exists(`common:Stats.${key}`) ? t(`common:Stats.${key}`) : t(`gameData:RelicSets.${setToId[key]}.Name`)} mouseEnterDelay={0.2}>
            <img style={{ width: width }} src={src}/>
          </Tooltip>
        )
        : (
          <img style={{ width: width }} src={src}/>
        )
    }

    return arr.map((x) => {
      return {
        key: x,
        display: generateDisplay(x),
      }
    })
  }

  function generateTextTags(arr: [n: number, s: string][]) { // arr contains [key, value]
    return arr.map((x: [n: number, s: string]) => {
      return {
        key: x[0],
        display: (
          <Flex style={{ height: tagHeight }} justify='space-around' align='center'>
            <Text style={{ fontSize: 18 }}>
              {x[1]}
            </Text>
          </Flex>
        ),
      }
    })
  }

  function generateGradeTags(arr: number[]) {
    return arr.map((x: number) => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: x } as Relic),
      }
    })
  }

  function generateVerifiedTags(arr: string[]) {
    return arr.map((x: string) => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: -1, verified: x == 'true' } as Relic),
      }
    })
  }

  function generateEquippedByTags(arr: string[]) {
    return arr.map((equippedBy: string) => {
      return {
        key: equippedBy,
        display: Renderer.renderEquippedBy(equippedBy),
      }
    })
  }

  const gradeData = generateGradeTags([2, 3, 4, 5])
  const verifiedData = generateVerifiedTags(['true', 'false'])
  const setsData = generateImageTags(Object.values(Sets).filter((x) => !UnreleasedSets[x]),
    (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere), true)
  const partsData = generateImageTags(Object.values(Constants.Parts), (x) => Assets.getPart(x), false)
  const mainStatsData = generateImageTags(Constants.MainStats, (x) => Assets.getStatIcon(x, true), true)
  const subStatsData = generateImageTags(Constants.SubStats, (x) => Assets.getStatIcon(x, true), true)
  const enhanceData = generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']])
  const equippedByData = generateEquippedByTags(['true', 'false'])

  window.refreshRelicsScore = () => {
    // NOTE: the scoring modal (where this event is published) calls .submit() in the same block of code
    // that it performs the publish. However, react defers and batches events, so the submit (and update
    // of the scoring overrides) doesn't actually happen until *after* this subscribe event is triggered,
    // hence the need for setTimeout
    // TODO: refactor so it's not necessary, which may be tricky - the recommended flow is to have react
    // views as a pure function of props, but because relics (and other state) are updated mutably in
    // a number of places, we need these manual refresh invocations
    setTimeout(() => {
      characterSelectorChange(currentlySelectedCharacterId!)
    }, 100)
  }

  useSubscribe('refreshRelicsScore', window.refreshRelicsScore)

  // Kick off an initial calculation to populate value columns. Though empty dependencies
  // are warned about, we genuinely only want to do this on first component render (updates
  // will correctly re-trigger it)
  useEffect(() => {
    if (DB.getState().settings[SettingOptions.RelicPotentialLoadBehavior.name] == SettingOptions.RelicPotentialLoadBehavior.ScoreAtStartup) {
      characterSelectorChange(currentlySelectedCharacterId!)
    }
  }, [])

  function characterSelectorChange(characterId: string, singleRelic?: Relic) {
    const relics = singleRelic ? [singleRelic] : Object.values(DB.getRelicsById())
    console.log('idChange', characterId)

    setRelicsTabFocusCharacter(characterId)
    setCurrentlySelectedCharacterId(characterId)

    const allCharacters = characterOptions.map((val) => val.id)
    const excludedCharacters = window.store.getState().excludedRelicPotentialCharacters

    const relicScorer = new RelicScorer()

    // NOTE: we cannot cache these results between renders by keying on the relic/characterId because
    // both relic stats and char weights can be edited
    for (const relic of relics) {
      const weights: Partial<RelicScoringWeights> = characterId ? relicScorer.getFutureRelicScore(relic, characterId) : { current: 0, best: 0, average: 0 }
      weights.potentialSelected = characterId ? relicScorer.scoreRelicPotential(relic, characterId) : { bestPct: 0, averagePct: 0 }
      weights.potentialAllAll = { bestPct: 0, averagePct: 0 }
      weights.potentialAllCustom = { bestPct: 0, averagePct: 0 }

      for (const cid of allCharacters) {
        const pct = relicScorer.scoreRelicPotential(relic, cid)
        weights.potentialAllAll = {
          bestPct: Math.max(pct.bestPct, weights.potentialAllAll.bestPct),
          averagePct: Math.max(pct.averagePct, weights.potentialAllAll.averagePct),
        }

        // For custom characters only consider the ones that aren't excluded
        if (!excludedCharacters.includes(cid)) {
          weights.potentialAllCustom = {
            bestPct: Math.max(pct.bestPct, weights.potentialAllCustom.bestPct),
            averagePct: Math.max(pct.averagePct, weights.potentialAllCustom.averagePct),
          }
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

    DB.refreshRelics()
  }

  function clearClicked() {
    setRelicTabFilters({
      set: [],
      part: [],
      enhance: [],
      mainStats: [],
      subStats: [],
      grade: [],
      verified: [],
      equippedBy: [],
    })
  }

  function scoringClicked() {
    const relicsTabFocusCharacter = window.store.getState().relicsTabFocusCharacter
    if (relicsTabFocusCharacter) window.store.getState().setScoringAlgorithmFocusCharacter(relicsTabFocusCharacter)
    window.store.getState().setScoringModalOpen(true)
  }

  function rescoreClicked() {
    characterSelectorChange(currentlySelectedCharacterId!)
  }

  function rescoreSingleRelic(singleRelic: Relic) {
    characterSelectorChange(currentlySelectedCharacterId!, singleRelic)
  }

  window.rescoreSingleRelic = rescoreSingleRelic

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>{t('RelicFilterBar.Part')/* Part */}</HeaderText>
          <FilterRow name='part' tags={partsData} flexBasis='15%'/>
        </Flex>
        <Flex vertical style={{ height: '100%' }} flex={1}>
          <HeaderText>{t('RelicFilterBar.Enhance')/* Enhance */}</HeaderText>
          <FilterRow name='enhance' tags={enhanceData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.5}>
          <HeaderText>{t('RelicFilterBar.Grade')/* Grade */}</HeaderText>
          <FilterRow name='grade' tags={gradeData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Verified')/* Verified */}</HeaderText>
          <FilterRow name='verified' tags={verifiedData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.Equipped')/* Equipped */}</HeaderText>
          <FilterRow name='equippedBy' tags={equippedByData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.4}>
          <HeaderText>{t('RelicFilterBar.Clear')/* Clear */}</HeaderText>
          <Button icon={<ClearOutlined/>} onClick={clearClicked} style={{ flexGrow: 1, height: '100%' }}>
            {t('RelicFilterBar.ClearButton')/* Clear all filters */}
          </Button>
        </Flex>
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Set')/* Set */}</HeaderText>
        <FilterRow name='set' tags={setsData} flexBasis={`${100 / Object.values(SetsRelics).length}%`}/>
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Mainstat')/* Main stats */}</HeaderText>
        <FilterRow name='mainStats' tags={mainStatsData}/>
      </Flex>

      <Flex vertical>
        <HeaderText>{t('RelicFilterBar.Substat')/* Substats */}</HeaderText>
        <FilterRow name='subStats' tags={subStatsData}/>
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={0.5}>
          <HeaderText>{t('RelicFilterBar.RecommendationHeader')/* Relic recommendation character */}</HeaderText>
          <Flex gap={10}>
            <CharacterSelect
              value={currentlySelectedCharacterId}
              selectStyle={{ flex: 1 }}
              onChange={(characterId: string) => {
                // Wait until after modal closes to update
                setTimeout(() => characterSelectorChange(characterId), 20)
              }}
              withIcon={true}
            />
            <Button
              onClick={rescoreClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ReapplyButton')/* Reapply scores */}
            </Button>
            <Button
              onClick={scoringClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              {t('RelicFilterBar.ScoringButton')/* Scoring algorithm */}
            </Button>
          </Flex>
        </Flex>

        <Flex vertical flex={0.25} gap={10}>
          <Flex vertical>
            <Flex justify='space-between' align='center'>
              <HeaderText>{t('RelicFilterBar.Rating')/* Relic ratings */}</HeaderText>
              <TooltipImage type={Hint.valueColumns()}/>
            </Flex>
            <Flex gap={10}>
              <Select
                mode='multiple'
                allowClear
                value={props.valueColumns}
                onChange={props.setValueColumns}
                options={props.valueColumnOptions}
                maxTagCount='responsive'
                style={{ flex: 1 }}
                listHeight={750}
              />
            </Flex>
          </Flex>
        </Flex>

        <Flex vertical flex={0.25}>
          <HeaderText>{t('RelicFilterBar.CustomCharsHeader')/* Custom potential characters */}</HeaderText>
          <CharacterSelect
            value={window.store.getState().excludedRelicPotentialCharacters}
            selectStyle={{ flex: 1 }}
            onChange={(excludedMap: Map<string, boolean>) => {
              const excludedCharacterIds = Array.from(excludedMap || new Map<string, boolean>())
                .filter((entry) => entry[1])
                .map((entry) => entry[0])
              window.store.getState().setExcludedRelicPotentialCharacters(excludedCharacterIds)
              SaveState.delayedSave()
              setTimeout(() => rescoreClicked(), 100)
            }}
            multipleSelect={true}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

type FilterTag = {
  key: string | number
  display: ReactElement
}

function FilterRow(props: {
  name: keyof RelicTabFilters
  tags: FilterTag[]
  flexBasis?: string
}) {
  const { token } = useToken()

  const relicTabFilters = window.store((s) => s.relicTabFilters)
  const setRelicTabFilters = window.store((s) => s.setRelicTabFilters)

  const selectedTags = relicTabFilters[props.name]

  const handleChange = (tag: string | number, checked: boolean) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag)

    const clonedFilters = TsUtils.clone(relicTabFilters)
    clonedFilters[props.name] = nextSelectedTags
    console.log('Relic tab filters', props.name, clonedFilters)

    setRelicTabFilters(clonedFilters)
  }

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: token.colorBgContainer,
        boxShadow: `0px 0px 0px 1px ${token.colorBorder} inset`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {props.tags.map((tag) => (
        <CheckableTag
          key={tag.key}
          checked={selectedTags.includes(tag.key)}
          onChange={(checked) => handleChange(tag.key, checked)}
          style={{
            flex: 1,
            flexBasis: props.flexBasis,
            boxShadow: `1px 1px 1px 0px ${token.colorBorder}`,
            backgroundColor: selectedTags.includes(tag.key) ? token.colorPrimary : 'transparent',
          }}
        >
          <Flex align='center' justify='space-around' style={{ height: '100%' }}>
            {tag.display}
          </Flex>
        </CheckableTag>
      ))}
    </Flex>
  )
}

export type RelicScoringWeights = {
  average: number
  current: number
  best: number
  potentialSelected: PotentialWeights
  potentialAllAll: PotentialWeights
  potentialAllCustom: PotentialWeights
}

type PotentialWeights = {
  bestPct: number
  averagePct: number
  // worstPct: number
  // meta: { bestAddedStats: string[]; bestUpgradedStats: string[] }
}
