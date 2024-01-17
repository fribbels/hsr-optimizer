import React from 'react';
import { Divider, Flex, Image, Typography } from "antd";
import RelicPreview from "./RelicPreview";
import styled from "styled-components";
import PropTypes from 'prop-types';
import { RelicScorer } from "../lib/relicScorer";
import { StatCalculator } from "../lib/statCalculator";
import { DB } from "../lib/db";
import { Assets } from "../lib/assets";
import { Utils } from "../lib/utils";
import { Constants } from "../lib/constants";

const { Text } = Typography;

const StatText = styled(Text)`
  font-family: Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif;
  font-size: 17px;
  font-weight: 400;
`

let defaultGap = 8;
let parentH = 280 * 3 + defaultGap * 2;
let parentW = 150 + 200 + defaultGap;
let innerW = 1024;
let lcParentH = 280;
let lcParentW = 240;
let lcInnerW = 250;
let lcInnerH = 1260 / 902 * lcInnerW;
let middleColumnWidth = 240;

export function CharacterPreview(props) {
  console.log('CharacterPreview', props)

  const { source, character } = props;

  let relicsById = global.store(s => s.relicsById)
  let characterTabBlur = global.store(s => s.characterTabBlur);
  let setCharacterTabBlur = global.store(s => s.setCharacterTabBlur);
  let isScorer = source == 'scorer'

  if (!character) {
    return (
      <Flex style={{ display: 'flex', height: parentH }} gap={defaultGap}>
        <div style={{ width: parentW, overflow: 'hidden', outline: '2px solid #243356', height: '100%', borderRadius: '10px' }}>
        </div>

        <Flex gap={defaultGap}>
          <Flex vertical gap={defaultGap} align='center' style={{ outline: '2px solid #243356', width: '100%', height: '100%', borderRadius: '10px' }}>
            <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify='space-between'>
              <Flex></Flex>
            </Flex>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview />
            <RelicPreview />
            <RelicPreview />
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview />
            <RelicPreview />
            <RelicPreview />
          </Flex>
        </Flex>
      </Flex>
    )
  }

  let displayRelics
  let scoringResults
  let finalStats
  if (isScorer) {
    let relicsArray = Object.values(character.equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray);
    displayRelics = character.equipped
    finalStats = StatCalculator.calculateCharacterWithRelics(character, Object.values(character.equipped));
  } else {
    scoringResults = RelicScorer.scoreCharacter(character);
    displayRelics = {
      Head: relicsById[character.equipped?.Head],
      Hands: relicsById[character.equipped?.Hands],
      Body: relicsById[character.equipped?.Body],
      Feet: relicsById[character.equipped?.Feet],
      PlanarSphere: relicsById[character.equipped?.PlanarSphere],
      LinkRope: relicsById[character.equipped?.LinkRope],
    }
    finalStats = StatCalculator.calculate(character);
  }
  let scoredRelics = scoringResults.relics || []

  console.log('SCORING RESULTS', scoringResults)

  console.log({ finalStats })
  console.log({ character })

  let lightConeId = character.form.lightCone
  let lightConeLevel = character.form.lightConeLevel
  let lightConeSuperimposition = character.form.lightConeSuperimposition
  let lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  let lightConeName = lightConeMetadata?.name || ''
  let lightConeSrc = Assets.getLightConePortrait(lightConeMetadata)

  let characterId = character.form.characterId
  let characterLevel = character.form.characterLevel
  let characterEidolon = character.form.characterEidolon
  let characterMetadata = DB.getMetadata().characters[characterId]
  let characterName = characterMetadata.displayName
  let characterPath = characterMetadata.path
  let characterElement = characterMetadata.element

  console.log('Level ' + characterLevel + ' E' + characterEidolon)
  console.log('Level ' + lightConeLevel + ' S' + lightConeSuperimposition)

  let elementToDmgValueMapping = {
    Physical: Constants.Stats.Physical_DMG,
    Fire: Constants.Stats.Fire_DMG,
    Ice: Constants.Stats.Ice_DMG,
    Thunder: Constants.Stats.Lightning_DMG,
    Wind: Constants.Stats.Wind_DMG,
    Quantum: Constants.Stats.Quantum_DMG,
    Imaginary: Constants.Stats.Imaginary_DMG,
  }
  let elementalDmgValue = elementToDmgValueMapping[characterElement]
  // let cv = character.cv

  console.log({
    lightConeMetadata,
    characterMetadata
  })

  let iconSize = 25

  function StatRow(props) {
    const { stat } = props
    let readableStat = stat.replace('DMG Boost', 'DMG')
    let value = finalStats[stat]

    if (stat == 'CV') {
      value = Utils.truncate10ths(value).toFixed(1)
    } else if (stat == Constants.Stats.SPD) {
      value = Utils.truncate10ths(value).toFixed(1)
    } else if (Utils.isFlat(stat)) {
      value = Math.floor(value)
    } else {
      value = Utils.truncate10ths(value * 100).toFixed(1)
    }

    if (!finalStats) return console.log('No final stats');
    return (
      <Flex justify='space-between' align='center'>
        <img src={Assets.getStatIcon(stat)} style={{ width: iconSize, height: iconSize, marginRight: 3 }}/>
        <StatText>{readableStat}</StatText>
        <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} dashed />
        <StatText>{`${value}${Utils.isFlat(stat) || stat == 'CV' ? '' : '%'}`}</StatText>
      </Flex>
    )
  }
  StatRow.propTypes = {
    stat: PropTypes.string,
  };

  function Rarity() {
    let children = []
    for (let i = 0; i < characterMetadata.rarity; i++) {
      children.push(
        <img src={Assets.getStar()} key={i} style={{ width: 20, height: 20 }}/>
      )
    }
    return (
      <Flex gap={0} align='center'>
        {children}
      </Flex>
    )
  }

  return (
    <Flex style={{ display: character ? 'flex' : 'none', height: parentH }} gap={defaultGap}>
      <div style={{ width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
        <div 
          style={{ 
            position: 'relative', 
          }}
        >
          <img 
            src={Assets.getCharacterPortraitById(character.id)} 
            style={{
              position: 'absolute',
              left: -DB.getMetadata().characters[character.id].imageCenter.x / 2 + parentW / 2,
              top: -DB.getMetadata().characters[character.id].imageCenter.y / 2 + parentH / 2, 
              width: innerW,
              filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : ''
            }}
            onLoad={() => setTimeout(() => setCharacterTabBlur(false), 100)}
          />
        </div>
      </div>

      <Flex gap={defaultGap}>
        <Flex vertical gap={defaultGap} align='center'>
          <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify='space-between'>
            <Flex vertical gap={defaultGap}>
              <Flex justify='space-between' style={{ height: 50 }}>
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getElement(characterElement)}
                />
                <Rarity />
                <Image
                  preview={false}
                  width={50}
                  src={Assets.getPathFromClass(characterPath)}
                />
              </Flex>
              <Flex vertical>
                <StatText style={{ fontSize: 24, fontWeight: 400, textAlign: 'center' }}>
                  {characterName}
                </StatText>
                <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                  {`Lv${characterLevel} E${characterEidolon}`}
                </StatText>
              </Flex>
            </Flex>

            <Flex vertical style={{ width: middleColumnWidth, paddingLeft: 8, paddingRight: 12 }} gap={4}>
              <StatRow stat={Constants.Stats.HP} source={props.source} />
              <StatRow stat={Constants.Stats.ATK} source={props.source} />
              <StatRow stat={Constants.Stats.DEF} source={props.source} />
              <StatRow stat={Constants.Stats.SPD} source={props.source} />
              <StatRow stat={Constants.Stats.CR} source={props.source} />
              <StatRow stat={Constants.Stats.CD} source={props.source} />
              <StatRow stat={Constants.Stats.EHR} source={props.source} />
              <StatRow stat={Constants.Stats.RES} source={props.source} />
              <StatRow stat={Constants.Stats.BE} source={props.source} />
              <StatRow stat={elementalDmgValue} source={props.source} />
              <StatRow stat={'CV'} source={props.source} />
            </Flex>

            <Flex vertical>
              <StatText style={{ fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#e1a564' }} ellipsis={false}>
                {`Character score: ${scoringResults.totalScore.toFixed(0)} ${scoringResults.totalScore == 0 ? '' : '(' + scoringResults.totalRating + ')'}`}
              </StatText>
            </Flex>

            <Flex vertical>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }} ellipsis={true}>
                {`${lightConeName}`}&nbsp;
              </StatText>
              <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                {`Lv${lightConeLevel} S${lightConeSuperimposition}`}
              </StatText>
            </Flex>
          </Flex>
          <div style={{ width: `${lcParentW}px`, height: `${lcParentH}px`, overflow: 'hidden', borderRadius: '10px' }}>
            <img
              src={lightConeSrc}
              style={{ 
                width: lcInnerW, 
                transform: `translate(${(lcInnerW - lcParentW) / 2 / lcInnerW * -100}%, ${(lcInnerH - lcParentH) / 2 / lcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '' 
              }}
            />
          </div>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview relic={displayRelics.Head} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.Head)} />
          <RelicPreview relic={displayRelics.Body} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.Body)} />
          <RelicPreview relic={displayRelics.PlanarSphere} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.PlanarSphere)} />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview relic={displayRelics.Hands} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.Hands)} />
          <RelicPreview relic={displayRelics.Feet} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.Feet)} />
          <RelicPreview relic={displayRelics.LinkRope} source={props.source} characterId={characterId} score={scoredRelics.find(x => x.part == Constants.Parts.LinkRope)}/>
        </Flex>
      </Flex>
    </Flex>
  )
}
CharacterPreview.propTypes = {
  source: PropTypes.string,
  character: PropTypes.object
};