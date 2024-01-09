import {Flex, Select, Space, Typography} from "antd";
import React, {useMemo, useState} from "react";
import {RelicScorer} from "../lib/relicScorer";
import CheckableTag from "antd/lib/tag/CheckableTag";

const { Text } = Typography;

export default function RelicFilterBar(props) {
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
          <img style={{width: 40}} src={srcFn(x)}/>
        )
      }
    })
  }
  function generateTextTags(arr, width) {
    return arr.map(x => {
      return {
        key: x,
        display: (
          <Flex style={{width: width}} justify='space-around'>
            <Text style={{fontSize: 20}}>
              {x}
            </Text>
          </Flex>
        )
      }
    })
  }

  let tagsData = generateImageTags(Object.values(Constants.SetsRelics), (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere))
  let tags2Data = generateImageTags(Object.values(Constants.SetsOrnaments), (x) => Assets.getSetImage(x, Constants.Parts.PlanarSphere))

  let tags3Data = generateImageTags(Object.values(Constants.Parts), (x) => Assets.getPart(x))

  let tags4Data = generateImageTags(Object.values(Constants.Stats), (x) => Assets.getStatIcon(x))
  let tags5Data = generateTextTags(['+0', '+3', '+6', '+9', '+12', '+15'], 100)

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

  return (
    <Flex vertical gap={5}>
      <Select
        showSearch
        filterOption={Utils.characterNameFilterOption}
        style={{ width: 200 }}
        onChange={characterSelectorChange}
        options={characterOptions}
      />

      <FilterRow tags={tagsData}/>
      <FilterRow tags={tags2Data}/>
      <FilterRow tags={tags3Data}/>
      <FilterRow tags={tags4Data}/>
      <FilterRow tags={tags5Data}/>
    </Flex>
  )
}


function FilterRow(props) {
  const [selectedTags, setSelectedTags] = useState([]);

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };

  return (
    <Flex>
      <Flex style={{ height: 50, backgroundColor: '#243356', boxShadow:'0px 0px 0px 1px #3F5A96 inset', borderRadius: 6, overflow: 'hidden' }}>
        {props.tags.map((tag) => (
          <CheckableTag
            key={tag.key}
            checked={selectedTags.includes(tag.key)}
            onChange={(checked) => handleChange(tag.key, checked)}
            style={{boxShadow:'1px 0px 0px 0px #3F5A96'}}
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

function FilterBarItem(props) {
  return (
    <Flex style={{width: 100, backgroundColor: '#243356'}}>
      <Text>
        {props.text}
      </Text>
    </Flex>
  )
}

// #1668DC