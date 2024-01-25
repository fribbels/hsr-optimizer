import React, { useState } from 'react';
import { Flex, Image } from 'antd';
import PropTypes from 'prop-types';
import { RelicScorer } from 'lib/relicScorer.ts';
import { StatCalculator } from 'lib/statCalculator';
import { DB } from 'lib/db';
import { Assets } from 'lib/assets';
import { Message } from 'lib/message';
import { Constants } from 'lib/constants.ts';
import {
  defaultGap, parentH, parentW, middleColumnWidth, innerW,
  lcParentW, lcParentH, lcInnerW, lcInnerH,
} from 'lib/constantsUi';

import Rarity from 'components/characterPreview/Rarity';
import StatRow from 'components/characterPreview/StatRow';
import StatText from 'components/characterPreview/StatText';
import RelicModal from 'components/RelicModal';
import RelicPreview from 'components/RelicPreview';

export function CharacterPreview(props) {
  console.log('@CharacterPreview')

  const { source, character } = props;
  const isScorer = source == 'scorer';

  const relicsById = global.store(s => s.relicsById)
  const characterTabBlur = global.store(s => s.characterTabBlur);
  const setCharacterTabBlur = global.store(s => s.setCharacterTabBlur);
  const [selectedRelic, setSelectedRelic] = useState();
  const [editModalOpen, setEditModalOpen] = useState(false);


  function onEditOk(relic) {
    relic.id = selectedRelic.id

    const updatedRelic = { ...selectedRelic, ...relic }

    if (updatedRelic.equippedBy) {
      DB.equipRelic(updatedRelic, updatedRelic.equippedBy)
    } else {
      DB.unequipRelicById(updatedRelic.id);
    }

    DB.setRelic(updatedRelic)
    // setRelicRows(DB.getRelics())
    // SaveState.save()

    setSelectedRelic(updatedRelic)

    window.forceOptimizerBuildPreviewUpdate()
    window.forceCharacterTabUpdate()

    Message.success('Successfully edited relic')
    console.log('onEditOk', updatedRelic)
  }

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
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
            <RelicPreview setSelectedRelic={setSelectedRelic} />
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
  const scoredRelics = scoringResults.relics || []

  const lightConeId = character.form.lightCone
  const lightConeLevel = character.form.lightConeLevel
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeMetadata?.name || ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata)

  const characterId = character.form.characterId
  const characterLevel = character.form.characterLevel
  const characterEidolon = character.form.characterEidolon
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterName = characterMetadata.displayName
  const characterPath = characterMetadata.path
  const characterElement = characterMetadata.element

  const elementToDmgValueMapping = {
    Physical: Constants.Stats.Physical_DMG,
    Fire: Constants.Stats.Fire_DMG,
    Ice: Constants.Stats.Ice_DMG,
    Thunder: Constants.Stats.Lightning_DMG,
    Wind: Constants.Stats.Wind_DMG,
    Quantum: Constants.Stats.Quantum_DMG,
    Imaginary: Constants.Stats.Imaginary_DMG,
  }
  const elementalDmgValue = elementToDmgValueMapping[characterElement]
  console.log(displayRelics);
  return (
    <Flex style={{ display: character ? 'flex' : 'none', height: parentH }} gap={defaultGap}>
      <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />

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
                <Rarity rarity={characterMetadata.rarity} />
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
              <StatRow finalStats={finalStats} stat={Constants.Stats.HP} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.ATK} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.DEF} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.SPD} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.CR} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.CD} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.EHR} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.RES} source={props.source} />
              <StatRow finalStats={finalStats} stat={Constants.Stats.BE} source={props.source} />
              <StatRow finalStats={finalStats} stat={elementalDmgValue} source={props.source} />
              <StatRow finalStats={finalStats} stat={'CV'} source={props.source} />
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
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Head}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.Head)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Body}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.Body)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.PlanarSphere}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.PlanarSphere)}
          />
        </Flex>

        <Flex vertical gap={defaultGap}>
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Hands}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.Hands)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.Feet}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.Feet)}
          />
          <RelicPreview
            setEditModalOpen={setEditModalOpen}
            setSelectedRelic={setSelectedRelic}
            relic={displayRelics.LinkRope}
            source={props.source}
            characterId={characterId}
            score={scoredRelics.find(x => x.part == Constants.Parts.LinkRope)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
CharacterPreview.propTypes = {
  source: PropTypes.string,
  character: PropTypes.object
};