import { Button, Flex, Select, Tooltip, Typography } from 'antd'
import React, { useMemo, useState } from 'react'
import { RelicScorer } from 'lib/relicScorer'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { HeaderText } from './HeaderText'
import DB from '../lib/db'
import { Utils } from 'lib/utils'
import { Constants, Stats } from 'lib/constants'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import { useSubscribe } from 'hooks/useSubscribe'
import { Renderer } from 'lib/renderer'

const { Text } = Typography

const tagHeight = 34
const imgWidth = 34

const BLANK = Assets.getBlank()

export default function RelicFilterBar() {
  const setRelicTabFilters = window.store((s) => s.setRelicTabFilters)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const [currentlySelectedCharacterId, setCurrentlySelectedCharacterId] = useState()
  const [aggregatedBestCaseColumn, setAggregatedBestCaseColumn] = useState('all')

  const characterOptions = useMemo(() => {
    return Utils.generateCharacterOptions()
  }, [])

  const characterRelicScoreMetas = useMemo(() =>
    new Map(Object.keys(DB.getMetadata().characters).map((id) => [id, getRelicScoreMeta(id)]))
  , [])

  function getRelicScoreMeta(id) {
    let scoringMetadata = Utils.clone(DB.getScoringMetadata(id))
    let level80Stats = DB.getMetadata().characters[id].promotions[80]
    scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * 38 / (level80Stats[Constants.Stats.HP] * 2 * 0.03888)
    scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * 19 / (level80Stats[Constants.Stats.ATK] * 2 * 0.03888)
    scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * 19 / (level80Stats[Constants.Stats.DEF] * 2 * 0.04860)
    return scoringMetadata
  }

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
            <img style={{ width: width }} src={src} />
          </Tooltip>
        )
        : (
          <img style={{ width: width }} src={src} />
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
          <Flex style={{ width: width, height: tagHeight }} justify="space-around" align="center">
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
        display: Renderer.renderGrade({ grade: -1, verified: x }),
      }
    })
  }

  let gradeData = generateGradeTags([2, 3, 4, 5])
  let verifiedData = generateVerifiedTags([false, true])
  let setsData = generateImageTags(Object.values(Constants.SetsRelics).concat(Object.values(Constants.SetsOrnaments)), (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere), true)
  let partsData = generateImageTags(Object.values(Constants.Parts), (x) => Assets.getPart(x), false)
  let mainStatsData = generateImageTags(Constants.MainStats, (x) => Assets.getStatIcon(x, true), true)
  let subStatsData = generateImageTags(Constants.SubStats, (x) => Assets.getStatIcon(x, true), true)
  let enhanceData = generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']])

  useSubscribe('refreshRelicsScore', () => {
    // TODO: understand why setTimeout is needed and refactor
    setTimeout(() => {
      characterSelectorChange(currentlySelectedCharacterId)
    }, 100)
  })

  function characterSelectorChange(id) {
    if (!id) return

    let relics = Object.values(DB.getRelicsById())
    console.log('idChange', id)

    setScoringAlgorithmFocusCharacter(id)
    setCurrentlySelectedCharacterId(id)

    let possibleSubstats = new Set(Constants.SubStats)
    let scoringMetadata = characterRelicScoreMetas.get(id)
    let charMetas = (aggregatedBestCaseColumn === 'all' ? characterOptions : DB.getCharacters())
      .map((val) => characterRelicScoreMetas.get(val.id))

    // NOTE: we cannot cache these results by keying on the relic/char id because both relic stats
    // and char weights can be edited
    for (let relic of relics) {
      let aggBestCaseWeight = 0
      let relicWeights = new Map()

      for (let scoringMetadata of charMetas) {
        let weights = scoreRelic(relic, scoringMetadata.characterId, scoringMetadata, possibleSubstats)
        aggBestCaseWeight = Math.max(aggBestCaseWeight, weights.best)
        relicWeights.set(scoringMetadata.characterId, weights)
      }

      let weights = relicWeights.get(id)
      weights.aggregatedBest = aggBestCaseWeight
      relic.weights = weights
    }

    DB.setRelics(relics)

    window.relicsGrid.current.api.applyColumnState({
      defaultState: { sort: null },
    })

    window.relicsGrid.current.api.applyColumnState({
      state: [{ colId: 'weights.current', sort: 'desc' }],
      defaultState: { sort: null },
    })

    window.relicsGrid.current.api.redrawRows()
  }

  function scoreRelic(relic, id, scoringMetadata, possibleSubstats) {
    let scoringResult = RelicScorer.score(relic, id)
    let subScore = parseFloat(scoringResult.score)
    let mainScore = 0
    if (Utils.hasMainStat([relic.part])) {
      if (scoringMetadata.parts[relic.part].includes(relic.main.stat)) {
        mainScore = 64.8
      } else {
        mainScore = scoringMetadata.stats[relic.main.stat] * 64.8
      }
    } else {
      mainScore = 64.8
    }

    // Predict substat scores
    let substats = new Set(relic.substats.map((x) => x.stat))
    let substatScoreEntries = Object.entries(scoringMetadata.stats)
      .filter((x) => possibleSubstats.has(x[0]))
      .filter((x) => !substats.has(x[0])) // Exclude already existing substats
      .sort((a, b) => b[1] - a[1])

    let bestUnobtainedSubstat = substatScoreEntries[0]
    let finalSubstats = [...substats, bestUnobtainedSubstat[0]]
    let finalSubstatWeights = finalSubstats.map((x) => scoringMetadata.stats[x])
    let bestOverallSubstatWeight = Math.max(...finalSubstatWeights)
    let avgWeight = (finalSubstatWeights.reduce((a, b) => a + b, 0) - bestUnobtainedSubstat[1] / 2) / 4

    let extraRolls = 0

    let missingSubstats = (4 - substats.size)
    let missingRolls = Math.ceil(((15 - (5 - relic.grade) * 3) - relic.enhance) / 3) - missingSubstats

    for (let i = 0; i < missingSubstats; i++) {
      extraRolls += 1 * bestUnobtainedSubstat[1]
    }

    for (let i = 0; i < missingRolls; i++) {
      extraRolls += bestOverallSubstatWeight
    }

    let currentWeight = Utils.precisionRound(subScore + mainScore);
    return {
      current: currentWeight,
      best: currentWeight + extraRolls * 6.48,
      average: currentWeight + extraRolls * 6.48 * avgWeight,
    }
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
    })
  }

  function scoringClicked() {
    window.setIsScoringModalOpen(true)
  }

  function rescoreClicked() {
    characterSelectorChange(currentlySelectedCharacterId)
  }

  //function toggleOwnedCharacterBestWeightColumnClicked() {
  //    // TODO
  //}

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Relic recommendation character</HeaderText>
          <Flex gap={10}>
            <Select
              showSearch
              filterOption={Utils.labelFilterOption}
              onChange={characterSelectorChange}
              options={characterOptions}
              style={{ flex: 1 }}
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
        <Flex flex={1} gap={10}>
          <Flex vertical style={{ height: '100%' }} flex={0.5}>
            <HeaderText>Filter actions</HeaderText>
            <Flex gap={10}>
              <Button onClick={clearClicked} style={{ flexGrow: 1 }}>
                Clear filters
              </Button>
            </Flex>
          </Flex>
          <Flex vertical flex={0.5}>
            <HeaderText>Grade</HeaderText>
            <FilterRow name="grade" tags={gradeData} flexBasis="25%" />
          </Flex>
          <Flex vertical flex={0.25}>
            <HeaderText>Verified</HeaderText>
            <FilterRow name="verified" tags={verifiedData} flexBasis="15%" />
          </Flex>
        </Flex>
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Part</HeaderText>
          <FilterRow name="part" tags={partsData} flexBasis="15%" />
        </Flex>
        <Flex vertical style={{ height: '100%' }} flex={1}>
          <HeaderText>Enhance</HeaderText>
          <FilterRow name="enhance" tags={enhanceData} flexBasis="15%" />
        </Flex>
      </Flex>

      <Flex vertical>
        <HeaderText>Set</HeaderText>
        <FilterRow name="set" tags={setsData} flexBasis="5.55%" />
      </Flex>

      <Flex vertical>
        <HeaderText>Main stats</HeaderText>
        <FilterRow name="mainStats" tags={mainStatsData} />
      </Flex>

      <Flex vertical>
        <HeaderText>Substats</HeaderText>
        <FilterRow name="subStats" tags={subStatsData} />
      </Flex>

      <Flex vertical>
        <Flex vertical flex={0.5}>
          <HeaderText>Aggregated Best Case Column</HeaderText>
          <Flex gap={10}>
            <Select
              defaultValue={aggregatedBestCaseColumn}
              onChange={(val) => setAggregatedBestCaseColumn(val)}
              options={[
                { 'value': 'all', 'label': 'All Characters' },
                { 'value': 'owned', 'label': 'Owned Characters' },
              ]}
              style={{ flex: 1 }}
            />
            {/*<Button
              onClick={toggleOwnedCharacterBestWeightColumnClicked}
              style={{ flex: 1, padding: '0px' }}
            >
              Best Case Owned-Character Rank
            </Button>
            <Button
              onClick={() => {}}
              style={{ flex: 1, padding: '0px' }}
            >
              Best Case All-Character Rank
            </Button>*/}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

function FilterRow(props) {
  let relicTabFilters = window.store((s) => s.relicTabFilters)
  let setRelicTabFilters = window.store((s) => s.setRelicTabFilters)

  let selectedTags = relicTabFilters[props.name]

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag)

    let clonedFilters = Utils.clone(relicTabFilters)
    clonedFilters[props.name] = nextSelectedTags
    console.log('Relic tab filters', props.name, clonedFilters)

    setRelicTabFilters(clonedFilters)
  }

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: '#243356',
        boxShadow: '0px 0px 0px 1px #3F5A96 inset',
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
            boxShadow: '1px 1px 0px 0px #3F5A96',
          }}
        >
          <Flex align="center" justify="space-around" style={{ height: '100%' }}>
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
