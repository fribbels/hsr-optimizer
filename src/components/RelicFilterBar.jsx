import { Button, Flex, Select, theme, Tooltip, Typography } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { RelicScorer } from 'lib/relicScorerPotential'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { HeaderText } from './HeaderText'
import { TooltipImage } from './TooltipImage'
import DB from '../lib/db'
import { Hint } from 'lib/hint'
import { Utils } from 'lib/utils'
import { Constants, SetsRelics, Stats, UnreleasedSets } from 'lib/constants'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import { useSubscribe } from 'hooks/useSubscribe'
import { Renderer } from 'lib/renderer'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import { ClearOutlined } from '@ant-design/icons'
import { SaveState } from 'lib/saveState'
import { SettingOptions } from 'components/SettingsDrawer'

const { useToken } = theme
const { Text } = Typography

const tagHeight = 34
const imgWidth = 34

const BLANK = Assets.getBlank()

export default function RelicFilterBar(props) {
  const setRelicTabFilters = window.store((s) => s.setRelicTabFilters)
  const setRelicsTabFocusCharacter = window.store((s) => s.setRelicsTabFocusCharacter)

  const [currentlySelectedCharacterId, setCurrentlySelectedCharacterId] = useState()

  const characterOptions = useMemo(() => {
    return Utils.generateCharacterOptions()
  }, [])

  function generateImageTags(arr, srcFn, tooltip) {
    function generateDisplay(key) {
      // QOL to colorize elemental stat images instead of using the substat images
      const overrides = {
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
          <Tooltip title={key} mouseEnterDelay={0.2}>
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

  function generateTextTags(arr, width) { // arr contains [key, value]
    return arr.map((x) => {
      return {
        key: x[0],
        display: (
          <Flex style={{ width: width, height: tagHeight }} justify='space-around' align='center'>
            <Text style={{ fontSize: 18 }}>
              {x[1]}
            </Text>
          </Flex>
        ),
      }
    })
  }

  function generateGradeTags(arr) {
    return arr.map((x) => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: x }),
      }
    })
  }

  function generateVerifiedTags(arr) {
    return arr.map((x) => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: -1, verified: x }, true),
      }
    })
  }

  function generateEquippedByTags(arr) {
    return arr.map((x) => {
      return {
        key: x,
        display: Renderer.renderEquippedBy({ equippedBy: x }),
      }
    })
  }

  const gradeData = generateGradeTags([2, 3, 4, 5])
  const verifiedData = generateVerifiedTags(['true', 'false'])
  const setsData = generateImageTags(Object.values(Constants.SetsRelics).concat(Object.values(Constants.SetsOrnaments)).filter((x) => !UnreleasedSets[x]),
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
      characterSelectorChange(currentlySelectedCharacterId)
    }, 100)
  }

  useSubscribe('refreshRelicsScore', window.refreshRelicsScore)

  // Kick off an initial calculation to populate value columns. Though empty dependencies
  // are warned about, we genuinely only want to do this on first component render (updates
  // will correctly re-trigger it)
  useEffect(() => {
    if (DB.getState().settings[SettingOptions.RelicPotentialLoadBehavior.name] == SettingOptions.RelicPotentialLoadBehavior.ScoreAtStartup) {
      characterSelectorChange(currentlySelectedCharacterId)
    }
  }, [])

  function characterSelectorChange(id, singleRelic) {
    const relics = singleRelic ? [singleRelic] : Object.values(DB.getRelicsById())
    console.log('idChange', id)

    setRelicsTabFocusCharacter(id)
    setCurrentlySelectedCharacterId(id)

    const allCharacters = characterOptions.map((val) => val.id)
    const excludedCharacters = window.store.getState().excludedRelicPotentialCharacters

    const relicScorer = new RelicScorer()

    // NOTE: we cannot cache these results between renders by keying on the relic/char id because
    // both relic stats and char weights can be edited
    for (const relic of relics) {
      relic.weights = id ? relicScorer.scoreFutureRelic(relic, id) : { current: 0, best: 0, average: 0 }
      relic.weights.potentialSelected = id ? relicScorer.scoreRelicPotential(relic, id) : { bestPct: 0, averagePct: 0 }
      relic.weights.potentialAllAll = { bestPct: 0, averagePct: 0 }
      relic.weights.potentialAllCustom = { bestPct: 0, averagePct: 0 }

      for (const cid of allCharacters) {
        const pct = relicScorer.scoreRelicPotential(relic, cid)
        relic.weights.potentialAllAll = {
          bestPct: Math.max(pct.bestPct, relic.weights.potentialAllAll.bestPct),
          averagePct: Math.max(pct.averagePct, relic.weights.potentialAllAll.averagePct),
        }

        // For custom characters only consider the ones that aren't excluded
        if (!excludedCharacters.includes(cid)) {
          relic.weights.potentialAllCustom = {
            bestPct: Math.max(pct.bestPct, relic.weights.potentialAllCustom.bestPct),
            averagePct: Math.max(pct.averagePct, relic.weights.potentialAllCustom.averagePct),
          }
        }
      }
    }

    if (singleRelic) return

    // Clone the relics to refresh the sort
    DB.setRelics(Utils.clone(relics))

    if (id && window.relicsGrid?.current?.api) {
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
    const relicsTabFocusCharacter = store.getState().relicsTabFocusCharacter
    if (relicsTabFocusCharacter) store.getState().setScoringAlgorithmFocusCharacter(relicsTabFocusCharacter)
    window.setIsScoringModalOpen(true)
  }

  function rescoreClicked() {
    characterSelectorChange(currentlySelectedCharacterId)
  }

  function rescoreSingleRelic(singleRelic) {
    characterSelectorChange(currentlySelectedCharacterId, singleRelic)
  }

  window.rescoreSingleRelic = rescoreSingleRelic

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Part</HeaderText>
          <FilterRow name='part' tags={partsData} flexBasis='15%'/>
        </Flex>
        <Flex vertical style={{ height: '100%' }} flex={1}>
          <HeaderText>Enhance</HeaderText>
          <FilterRow name='enhance' tags={enhanceData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.5}>
          <HeaderText>Grade</HeaderText>
          <FilterRow name='grade' tags={gradeData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>Verified</HeaderText>
          <FilterRow name='verified' tags={verifiedData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>Equipped</HeaderText>
          <FilterRow name='equippedBy' tags={equippedByData} flexBasis='15%'/>
        </Flex>
        <Flex vertical flex={0.4}>
          <HeaderText>Clear</HeaderText>
          <Button icon={<ClearOutlined/>} onClick={clearClicked} style={{ flexGrow: 1, height: '100%' }}>
            Clear all filters
          </Button>
        </Flex>
      </Flex>

      <Flex vertical>
        <HeaderText>Set</HeaderText>
        <FilterRow name='set' tags={setsData} flexBasis={`${100 / Object.values(SetsRelics).length}%`}/>
      </Flex>

      <Flex vertical>
        <HeaderText>Main stats</HeaderText>
        <FilterRow name='mainStats' tags={mainStatsData}/>
      </Flex>

      <Flex vertical>
        <HeaderText>Substats</HeaderText>
        <FilterRow name='subStats' tags={subStatsData}/>
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={0.5}>
          <HeaderText>Relic recommendation character</HeaderText>
          <Flex gap={10}>
            <CharacterSelect
              value={currentlySelectedCharacterId}
              selectStyle={{ flex: 1 }}
              onChange={(x) => {
                // Wait until after modal closes to update
                setTimeout(() => characterSelectorChange(x), 20)
              }}
              withIcon={true}
            />
            <Button
              onClick={rescoreClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              Reapply scores
            </Button>
            <Button
              onClick={scoringClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              Scoring algorithm
            </Button>
          </Flex>
        </Flex>

        <Flex vertical flex={0.25} gap={10}>
          <Flex vertical>
            <Flex justify='space-between' align='center'>
              <HeaderText>Relic ratings</HeaderText>
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
          <HeaderText>Custom potential characters</HeaderText>
          <CharacterSelect
            value={window.store.getState().excludedRelicPotentialCharacters}
            selectStyle={{ flex: 1 }}
            onChange={(x) => {
              const excludedCharacterIds = Array.from(x || new Map())
                .filter((entry) => entry[1] == true)
                .map((entry) => entry[0])
              window.store.getState().setExcludedRelicPotentialCharacters(excludedCharacterIds)
              SaveState.save()
              setTimeout(() => rescoreClicked(), 100)
            }}
            multipleSelect={true}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
RelicFilterBar.propTypes = {
  setValueColumns: PropTypes.func,
  valueColumnOptions: PropTypes.array,
  valueColumns: PropTypes.array,
}

function FilterRow(props) {
  const { token } = useToken()

  const relicTabFilters = window.store((s) => s.relicTabFilters)
  const setRelicTabFilters = window.store((s) => s.setRelicTabFilters)

  const selectedTags = relicTabFilters[props.name]

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag)

    const clonedFilters = Utils.clone(relicTabFilters)
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

FilterRow.propTypes = {
  name: PropTypes.string,
  tags: PropTypes.array,
  flexBasis: PropTypes.string,
}
