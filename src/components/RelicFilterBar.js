import {Button, Flex, Select, Space, Typography} from "antd";
import React, {useMemo, useState} from "react";
import {RelicScorer} from "../lib/relicScorer";
import CheckableTag from "antd/lib/tag/CheckableTag";
import {HeaderText} from "./HeaderText";

const { Text } = Typography;

let tagHeight = 34

export default function RelicFilterBar(props) {
  let setRelicTabFilters = store(s => s.setRelicTabFilters);

  const characterOptions = useMemo(() => {
    let characterData = JSON.parse(JSON.stringify(DB.getMetadata().characters));

    for (let value of Object.values(characterData)) {
      value.value = value.id;
      value.label = value.displayName;
    }

    return Object.values(characterData).sort((a, b) => a.label.localeCompare(b.label))
  }, []);

  function generateImageTags(arr, srcFn) {
    return arr.map(x => {
      return {
        key: x,
        display: (
          <img style={{width: tagHeight}} src={srcFn(x)}/>
        )
      }
    })
  }
  function generateTextTags(arr, width) { // arr contains [key, value]
    return arr.map(x => {
      return {
        key: x[0],
        display: (
          <Flex style={{width: width, height: tagHeight}} justify='space-around'>
            <Text style={{fontSize: 20}}>
              {x[1]}
            </Text>
          </Flex>
        )
      }
    })
  }

  let setsData = generateImageTags(Object.values(Constants.SetsRelics).concat(Object.values(Constants.SetsOrnaments)), (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere))
  let partsData = generateImageTags(Object.values(Constants.Parts), (x) => Assets.getPart(x))
  let mainStatsData = generateImageTags(Constants.MainStats, (x) => Assets.getStatIcon(x, true))
  let subStatsData = generateImageTags(Constants.SubStats, (x) => Assets.getStatIcon(x, true))
  let enhanceData = generateTextTags([[0, '+0'], [3, '+3'], [6, '+6'], [9, '+9'], [12, '+12'], [15, '+15']])

  function characterSelectorChange(id) {
    let relics = Object.values(store.getState().relicsById)
    console.log('idChange', id, relics)

    let scoring = DB.getMetadata().characters[id].scores

    for (let relic of relics) {
      let scoringResult = RelicScorer.score(relic, id)
      console.log(scoringResult)
      let subScore = parseFloat(scoringResult.score)
      let mainScore = 0
      if (Utils.hasMainStat([relic.part])) {
        if (scoring.parts[relic.part].includes(relic.main.stat)) {
          mainScore = 64.8
        } else {
          mainScore = scoring.stats[relic.main.stat] * 64.8
        }
      } else {
        mainScore = 64.8
      }
      // + scoringResult.mainStatScore

      relic.relicsTabWeight = Utils.precisionRound(subScore + mainScore)
    }

    DB.setRelics(relics)
    relicsGrid.current.api.redrawRows()
  }

  function clearClicked() {
    setRelicTabFilters({
      set: [],
      part: [],
      enhance: [],
      mainStats: [],
      subStats: [],
    })
  }

  return (
    <Flex vertical gap={2}>
      <Flex gap={10}>
        <Button style={{width: 200}} onClick={clearClicked}>
          Clear filters
        </Button>
        <Select
          showSearch
          filterOption={Utils.characterNameFilterOption}
          style={{ width: 200 }}
          onChange={characterSelectorChange}
          options={characterOptions}
        />
      </Flex>

      <Flex vertical>
        <HeaderText>Set</HeaderText>
        <FilterRow name='set' tags={setsData} flexBasis='6.25%'/>
      </Flex>

      <Flex gap={10}>
        <Flex vertical flex={1}>
          <HeaderText>Part</HeaderText>
          <FilterRow name='part' tags={partsData} flexBasis='15%'/>
        </Flex>
        <Flex vertical style={{height: '100%'}} flex={1}>
          <HeaderText>Enhance</HeaderText>
          <FilterRow name='enhance' tags={enhanceData} flexBasis='15%'/>
        </Flex>
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
  let relicTabFilters = store(s => s.relicTabFilters);
  let setRelicTabFilters = store(s => s.setRelicTabFilters);

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

  console.log(props.name, selectedTags)

  return (
    <Flex>
      <Flex
        style={{
          flexWrap: 'wrap',
          flexGrow: 1,
          backgroundColor: '#243356',
          boxShadow:'0px 0px 0px 1px #3F5A96 inset',
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
            <Flex align='center' justify='space-around' style={{height: '100%'}}>
              {tag.display}
            </Flex>
          </CheckableTag>
        ))}
      </Flex>
    </Flex>
  )
}
