import { Button, Flex, Select, Tooltip, Typography } from "antd";
import React, { useMemo, useState } from "react";
import { RelicScorer } from "../lib/relicScorer.ts";
import CheckableTag from "antd/lib/tag/CheckableTag";
import { HeaderText } from "./HeaderText";
import DB from "../lib/db";
import { Utils } from "../lib/utils";
import { Constants } from "../lib/constants.ts";
import { Assets } from "../lib/assets";
import PropTypes from "prop-types";
import { useSubscribe } from 'hooks/useSubscribe';
import { Renderer } from "lib/renderer.js";

const { Text } = Typography;

const tagHeight = 34
const imgWidth = 34

export default function RelicFilterBar() {
  const setRelicTabFilters = global.store(s => s.setRelicTabFilters);
  const setScoringAlgorithmFocusCharacter = global.store(s => s.setScoringAlgorithmFocusCharacter);

  const [currentlySelectedCharacterId, setCurrentlySelectedCharacterId] = useState()

  const characterOptions = useMemo(() => {
    return Utils.generateCharacterOptions();
  }, []);

  function generateImageTags(arr, srcFn, tooltip) {
    return arr.map(x => {
      return {
        key: x,
        display:
          tooltip ?
            (
              <Tooltip title={x} mouseEnterDelay={0.4}>
                <img style={{ width: imgWidth }} src={srcFn(x)} />
              </Tooltip>
            )
            :
            (
              <img style={{ width: imgWidth }} src={srcFn(x)} />
            )
      }
    })
  }
  function generateTextTags(arr, width) { // arr contains [key, value]
    return arr.map(x => {
      return {
        key: x[0],
        display: (
          <Flex style={{ width: width, height: tagHeight }} justify='space-around' align='center'>
            <Text style={{ fontSize: 18 }}>
              {x[1]}
            </Text>
          </Flex>
        )
      }
    })
  }

  function generateGradeTags(arr) {
    return arr.map(x => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: x })
      }
    })
  }

  function generateVerifiedTags(arr) {
    return arr.map(x => {
      return {
        key: x,
        display: Renderer.renderGrade({ grade: -1, verified: x })
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
    setTimeout(() => { characterSelectorChange(currentlySelectedCharacterId) }, 100);
  });

  function characterSelectorChange(id) {
    if (!id) return

    let relics = Object.values(global.store.getState().relicsById)
    console.log('idChange', id)

    setScoringAlgorithmFocusCharacter(id)
    setCurrentlySelectedCharacterId(id)

    let scoringMetadata = Utils.clone(DB.getScoringMetadata(id))
    let possibleSubstats = Object.assign(...Constants.SubStats.map(x => ({ [x]: true })));
    let level80Stats = DB.getMetadata().characters[id].promotions[80]
    scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * 38 / (level80Stats[Constants.Stats.HP] * 2 * 0.03888)
    scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * 19 / (level80Stats[Constants.Stats.ATK] * 2 * 0.03888)
    scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * 19 / (level80Stats[Constants.Stats.DEF] * 2 * 0.04860)

    for (let relic of relics) {
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
      let substats = relic.substats
      let substatScoreEntries = Object.entries(scoringMetadata.stats)
        .filter(x => possibleSubstats[x[0]])
        .filter(x => !substats.map(x => x.stat).includes(x[0])) // Exclude already existing substats
        .sort((a, b) => b[1] - a[1])

      let bestUnobtainedSubstat = substatScoreEntries[0]
      let finalSubstats = [...substats.map(x => x.stat), bestUnobtainedSubstat[0]]
      let finalSubstatWeights = finalSubstats.map(x => scoringMetadata.stats[x])
      let bestOverallSubstatWeight = finalSubstatWeights.sort((a, b) => b - a)[0]
      let avgWeight = (finalSubstatWeights.reduce((a, b) => a + b, 0) - bestUnobtainedSubstat[1] / 2) / 4

      let extraRolls = 0

      let missingSubstats = (4 - substats.length)
      let missingRolls = Math.ceil(((15 - (5 - relic.grade) * 3) - relic.enhance) / 3) - missingSubstats

      for (let i = 0; i < missingSubstats; i++) {
        extraRolls += 1 * bestUnobtainedSubstat[1]
      }

      for (let i = 0; i < missingRolls; i++) {
        extraRolls += bestOverallSubstatWeight
      }


      relic.relicsTabWeight = Utils.precisionRound(subScore + mainScore)
      relic.bestCaseWeight = relic.relicsTabWeight + extraRolls * 6.48
      relic.averageCaseWeight = relic.relicsTabWeight + extraRolls * 6.48 * avgWeight
    }

    DB.setRelics(relics)

    global.relicsGrid.current.api.applyColumnState({
      defaultState: { sort: null },
    });

    global.relicsGrid.current.api.applyColumnState({
      state: [{ colId: 'relicsTabWeight', sort: 'desc' }],
      defaultState: { sort: null },
    });

    global.relicsGrid.current.api.redrawRows()
  }

  function clearClicked() {
    setRelicTabFilters({
      set: [],
      part: [],
      enhance: [],
      mainStats: [],
      subStats: [],
      grade: [],
      verified: []
    })
  }

  function scoringClicked() {
    global.setIsScoringModalOpen(true)
  }

  function rescoreClicked() {
    characterSelectorChange(currentlySelectedCharacterId)
  }

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Relic recommendation character</HeaderText>
          <Flex gap={10}>
            <Select
              showSearch
              filterOption={Utils.characterNameFilterOption}
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
          <FilterRow name='grade' tags={gradeData} flexBasis='25%' />
        </Flex>
        <Flex vertical flex={0.25}>
          <HeaderText>Verified</HeaderText>
          <FilterRow name='verified' tags={verifiedData} flexBasis='15%' />
        </Flex>
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Part</HeaderText>
          <FilterRow name='part' tags={partsData} flexBasis='15%' />
        </Flex>
        <Flex vertical style={{ height: '100%' }} flex={1}>
          <HeaderText>Enhance</HeaderText>
          <FilterRow name='enhance' tags={enhanceData} flexBasis='15%' />
        </Flex>
      </Flex>

      <Flex vertical>
        <HeaderText>Set</HeaderText>
        <FilterRow name='set' tags={setsData} flexBasis='6.25%' />
      </Flex>

      <Flex vertical>
        <HeaderText>Main stats</HeaderText>
        <FilterRow name='mainStats' tags={mainStatsData} />
      </Flex>

      <Flex vertical>
        <HeaderText>Substats</HeaderText>
        <FilterRow name='subStats' tags={subStatsData} />
      </Flex>
    </Flex>
  )
}

function FilterRow(props) {
  let relicTabFilters = global.store(s => s.relicTabFilters);
  let setRelicTabFilters = global.store(s => s.setRelicTabFilters);

  let selectedTags = relicTabFilters[props.name]

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag);

    let clonedFilters = Utils.clone(relicTabFilters)
    clonedFilters[props.name] = nextSelectedTags
    console.log('Relic tab filters', props.name, clonedFilters);

    setRelicTabFilters(clonedFilters)
  };

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: '#243356',
        boxShadow: '0px 0px 0px 1px #3F5A96 inset',
        borderRadius: 6,
        overflow: 'hidden'
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
            boxShadow: '1px 1px 0px 0px #3F5A96'
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


