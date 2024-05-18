import React, { useEffect, useState } from 'react'
import { Button, Flex, Image, theme, Typography } from 'antd'
import PropTypes from 'prop-types'
import { RelicScorer } from 'lib/relicScorer.ts'
import { StatCalculator } from 'lib/statCalculator'
import { DB } from 'lib/db'
import { Assets } from 'lib/assets'
import { Constants, ElementToDamage } from 'lib/constants.ts'
import {
  defaultGap,
  innerW,
  lcInnerH,
  lcInnerW,
  lcParentH,
  lcParentW,
  middleColumnWidth,
  parentH,
  parentW
} from 'lib/constantsUi'

import Rarity from 'components/characterPreview/Rarity'
import StatText from 'components/characterPreview/StatText'
import RelicModal from 'components/RelicModal'
import RelicPreview from 'components/RelicPreview'
import { RelicModalController } from 'lib/relicModalController'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { EditOutlined } from '@ant-design/icons'
import EditImageModal from './EditImageModal'
import { Message } from 'lib/message'
import CharacterCustomPortrait from './CharacterCustomPortrait'
import { SaveState } from 'lib/saveState'
import { getSimScoreGrade, scoreCharacterSimulation } from 'lib/characterScorer'
import { Utils } from 'lib/utils'
import {
  CharacterCardScoringStatUpgrades,
  CharacterScoringSummary,
  ScoringTeammate
} from 'components/characterPreview/CharacterScoringSummary'

const {useToken} = theme
const {Text} = Typography

// This is hardcoded for the screenshot-to-clipboard util. Probably want a better way to do this if we ever change background colors
export function CharacterPreview(props) {
  console.log('@CharacterPreview')

  const {token} = useToken()

  const {source, character} = props

  const isScorer = source == 'scorer'
  const isBuilds = source == 'builds'

  const backgroundColor = token.colorBgLayout

  const relicsById = window.store((s) => s.relicsById)
  const characterTabBlur = window.store((s) => s.characterTabBlur)
  const setCharacterTabBlur = window.store((s) => s.setCharacterTabBlur)
  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState(null) // <null | CustomImageConfig>

  useEffect(() => {
    // Use any existing character's portrait instead of the default
    setCustomPortrait(DB.getCharacterById(character?.id)?.portrait || null)
  }, [character])

  function getArtistName() {
    const artistName = character?.portrait?.artistName || DB.getCharacterById(character?.id)?.portrait?.artistName
    if (!artistName) return null

    const name = artistName.trim()
    return name.length < 1 ? null : name
  }

  function onEditOk(relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  function onAddOk(relic) {
    DB.setRelic(relic)
    setRelicRows(DB.getRelics())
    SaveState.save()

    setSelectedRelic(relic)

    Message.success('Successfully added relic')
  }

  function onEditPortraitOk(portraitPayload) {
    const {type, ...portrait} = portraitPayload
    switch (type) {
      case 'add':
        setCustomPortrait({...portrait})
        DB.saveCharacterPortrait(character.id, portrait)
        Message.success('Successfully saved portrait')
        SaveState.save()
        break
      case 'delete':
        DB.deleteCharacterPortrait(character.id)
        setCustomPortrait(null)
        Message.success('Successfully reverted portrait')
        SaveState.save()
        break
      default:
        console.error(`Payload of type '${type}' is not valid!`)
    }
    setEditPortraitModalOpen(false)
  }

  if (!character) {
    return (
      <Flex style={{display: 'flex', height: parentH, backgroundColor: backgroundColor}} gap={defaultGap} id={props.id}>

        <div style={{
          width: parentW,
          overflow: 'hidden',
          outline: `2px solid ${token.colorBgContainer}`,
          height: '100%',
          borderRadius: '10px'
        }}>
        </div>

        <Flex gap={defaultGap}>
          <Flex vertical gap={defaultGap} align="center" style={{
            outline: `2px solid ${token.colorBgContainer}`,
            width: '100%',
            height: '100%',
            borderRadius: '10px'
          }}>
            <Flex vertical style={{width: middleColumnWidth, height: 280 * 2 + defaultGap}} justify="space-between">
              <Flex></Flex>
            </Flex>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
            <RelicPreview setSelectedRelic={setSelectedRelic}/>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  let displayRelics
  let scoringResults
  let finalStats
  if (isScorer || isBuilds) {
    const relicsArray = Object.values(character.equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray)
    displayRelics = character.equipped
    finalStats = StatCalculator.calculateCharacterWithRelics(character, Object.values(character.equipped))
  } else {
    scoringResults = RelicScorer.scoreCharacter(character)
    displayRelics = {
      Head: relicsById[character.equipped?.Head],
      Hands: relicsById[character.equipped?.Hands],
      Body: relicsById[character.equipped?.Body],
      Feet: relicsById[character.equipped?.Feet],
      PlanarSphere: relicsById[character.equipped?.PlanarSphere],
      LinkRope: relicsById[character.equipped?.LinkRope],
    }
    finalStats = StatCalculator.calculate(character)
  }

  const simScoringResult = scoreCharacterSimulation(character, finalStats, displayRelics)

  const scoredRelics = scoringResults.relics || []

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeMetadata?.name || ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''

  const characterId = character.form.characterId
  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterName = characterMetadata.displayName
  const characterPath = characterMetadata.path
  const characterElement = characterMetadata.element

  const elementalDmgValue = ElementToDamage[characterElement]
  console.log(displayRelics)

  // Temporary w/h overrides while we're split between sim scoring and weight scoring
  const newLcMargin = 5
  const newLcHeight = 225
  const lcCenter = character.form.lightCone ? DB.getMetadata().lightCones[character.form.lightCone].imageCenter : 0

  const tempLcParentW = simScoringResult ? parentW : lcParentW

  const tempLcParentH = simScoringResult ? newLcHeight : lcParentH
  const tempLcInnerW = simScoringResult ? parentW + 16 : lcInnerW

  const tempLcInnerH = simScoringResult ? 1260 / 902 * tempLcInnerW : lcInnerH

  const tempParentH = simScoringResult ? parentH - newLcHeight - newLcMargin : parentH

  const outline = 'rgb(255 255 255 / 40%) solid 1px'
  const shadow = 'rgba(0, 0, 0, 0.74) 2px 2px 5px 0px'

  return (
    <Flex vertical>
      <Flex vertical id={props.id} style={{backgroundColor: backgroundColor}}>
        <Flex
          style={{
            display: character ? 'flex' : 'none',
            height: parentH,
            margin: 2
          }}
        >
          <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onEditOk} setOpen={setEditModalOpen}
                      open={editModalOpen}/>
          <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onAddOk} setOpen={setAddModalOpen}
                      open={addModalOpen}/>

          <Flex vertical gap={15}>
            {!isBuilds && (
              <div
                className="character-build-portrait"
                style={{
                  width: `${parentW}px`,
                  height: `${tempParentH}px`,
                  overflow: 'hidden',
                  borderRadius: '10px',
                  marginRight: defaultGap,
                  outline: outline,
                  boxShadow: shadow,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {
                    (character.portrait || customPortrait)
                      ? (
                        <CharacterCustomPortrait
                          customPortrait={customPortrait ?? character.portrait}
                          parentW={parentW}
                          isBlur={characterTabBlur && !isScorer}
                          setBlur={setCharacterTabBlur}
                        />
                      )
                      : (
                        <img
                          src={Assets.getCharacterPortraitById(character.id)}
                          style={{
                            position: 'absolute',
                            left: -DB.getMetadata().characters[character.id].imageCenter.x / 2 + parentW / 2,
                            top: -DB.getMetadata().characters[character.id].imageCenter.y / 2 + parentH / 2,
                            width: innerW,
                            filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '',
                          }}
                          onLoad={() => setTimeout(() => setCharacterTabBlur(false), 50)}
                        />
                      )
                  }
                  <Button
                    style={{
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      visibility: 'hidden',
                      flex: 'auto',
                      position: 'absolute',
                      top: 6,
                      left: 5,
                    }}
                    className="character-build-portrait-button"
                    icon={<EditOutlined/>}
                    onClick={() => setEditPortraitModalOpen(true)}
                    type="primary"
                  >
                    {(character.portrait || customPortrait) ? 'Update crop' : 'Edit portrait'}
                  </Button>
                  <EditImageModal
                    title="portrait"
                    aspectRatio={parentW / parentH}
                    existingConfig={customPortrait ?? character.portrait}
                    open={editPortraitModalOpen}
                    setOpen={setEditPortraitModalOpen}
                    onOk={onEditPortraitOk}
                    defaultImageUrl={Assets.getCharacterPortraitById(character.id)}
                    width={500}
                  />
                </div>
                <Flex
                  vertical
                  style={{
                    position: 'relative',
                    top: tempParentH - 38,
                    height: 34,
                    paddingRight: 5,
                    display: getArtistName() ? 'flex' : 'none',
                  }}
                  align="flex-start"
                >
                  <Text
                    style={{
                      backgroundColor: 'rgb(0 0 0 / 40%)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: 14,
                      maxWidth: parentW - 150,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      zIndex: 2,
                      textShadow: '0px 0px 10px black',
                    }}
                  >
                    Art by {getArtistName() || ''}
                  </Text>
                </Flex>
              </div>

            )}

            {
              simScoringResult &&
              <Flex vertical>
                <Flex
                  vertical
                  style={{
                    position: 'relative',
                    height: 0,
                    top: newLcHeight - 37,
                    // top: newLcHeight - 221, // top right
                    paddingRight: 12,
                  }}
                  align="flex-end"
                >
                  <Text
                    style={{
                      position: 'absolute',
                      height: 32,
                      backgroundColor: 'rgb(0 0 0 / 70%)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: 14,
                      maxWidth: parentW - 150,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      zIndex: 3,
                      textShadow: '0px 0px 10px black',
                      outline: outline,
                      boxShadow: shadow,
                    }}
                  >
                    {`S${lightConeSuperimposition} - ${lightConeName}`}
                  </Text>
                </Flex>
                <Flex
                  vertical
                  style={{
                    width: `${tempLcParentW}px`,
                    height: `${tempLcParentH}px`,
                    overflow: 'hidden',
                    zIndex: 2,
                    borderRadius: '10px',
                    outline: outline,
                    boxShadow: shadow,
                    position: 'relative'
                  }}
                >
                  <img
                    src={lightConeSrc}
                    style={{
                      position: 'absolute',
                      width: 450,
                      top: -lcCenter + newLcHeight / 2,
                      left: -25,
                      // transform: `translate(${(tempLcInnerW - tempLcParentW) / 2 / tempLcInnerW * -100}%, ${(tempLcInnerH - tempLcParentH) / 2 / tempLcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                      // transform: `translate(${(tempLcInnerW - tempLcParentW) / 2 / tempLcInnerW * -100}%, ${(tempLcInnerH - tempLcParentH) / 2 / tempLcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                      filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '',
                    }}
                  />
                </Flex>
              </Flex>
            }
          </Flex>

          <Flex gap={defaultGap}>
            <Flex vertical gap={defaultGap} align="center" justify="space-between">
              <Flex vertical style={{width: middleColumnWidth, height: '100%' /*280 * 2 + defaultGap*/}}
                    justify="space-between">
                <Flex vertical gap={0}>
                  <Flex justify="space-between" style={{height: 50}}>
                    <Image
                      preview={false}
                      width={50}
                      src={Assets.getElement(characterElement)}
                    />
                    <Rarity rarity={characterMetadata.rarity}/>
                    <Image
                      preview={false}
                      width={50}
                      src={Assets.getPathFromClass(characterPath)}
                    />
                  </Flex>
                  <Flex vertical>
                    <StatText style={{fontSize: 24, fontWeight: 400, textAlign: 'center'}}>
                      {characterName}
                    </StatText>
                    <StatText style={{fontSize: 18, fontWeight: 400, textAlign: 'center'}}>
                      {`Lv${characterLevel} E${characterEidolon}`}
                    </StatText>
                  </Flex>
                </Flex>

                <CharacterStatSummary finalStats={finalStats} elementalDmgValue={elementalDmgValue}/>
                {
                  !simScoringResult &&
                  <Flex vertical>
                    <StatText style={{fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#e1a564'}}>
                      {`Character score: ${scoringResults.totalScore.toFixed(0)} ${scoringResults.totalScore == 0 ? '' : '(' + scoringResults.totalRating + ')'}`}
                    </StatText>
                  </Flex>
                }
                {
                  simScoringResult &&
                  <Flex vertical>
                    <StatText style={{fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#d53333'}}>
                      {`DPS score: ${Utils.truncate10ths(simScoringResult.percent * 100).toFixed(1)}% (${getSimScoreGrade(simScoringResult.percent)})`}
                    </StatText>
                  </Flex>
                }

                {simScoringResult &&
                  <Flex gap={defaultGap} justify='space-around'>
                    <ScoringTeammate result={simScoringResult} index={0}/>
                    <ScoringTeammate result={simScoringResult} index={1}/>
                    <ScoringTeammate result={simScoringResult} index={2}/>
                  </Flex>
                }

                {simScoringResult &&
                  <Flex vertical gap={defaultGap}>
                    <CharacterCardScoringStatUpgrades result={simScoringResult}/>
                  </Flex>
                }
              </Flex>
              {
                !simScoringResult &&
                <Flex vertical style={{width: middleColumnWidth}}>

                  <Flex vertical>
                    <StatText
                      style={{fontSize: 18, fontWeight: 400, marginLeft: 10, marginRight: 10, textAlign: 'center'}}
                      ellipsis={true}>
                      {`${lightConeName}`}
                      &nbsp;
                    </StatText>
                    <StatText style={{fontSize: 18, fontWeight: 400, textAlign: 'center'}}>
                      {`Lv${lightConeLevel} S${lightConeSuperimposition}`}
                    </StatText>
                  </Flex>
                  <div style={{
                    width: `${tempLcParentW}px`,
                    height: `${tempLcParentH}px`,
                    overflow: 'hidden',
                    borderRadius: '10px',
                    outline: outline,
                    boxShadow: shadow,
                  }}>
                    <img
                      src={lightConeSrc}
                      style={{
                        width: tempLcInnerW,
                        transform: `translate(${(tempLcInnerW - tempLcParentW) / 2 / tempLcInnerW * -100}%, ${(tempLcInnerH - tempLcParentH) / 2 / tempLcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                        filter: (characterTabBlur && !isScorer) ? 'blur(20px)' : '',
                      }}
                    />
                  </div>
                </Flex>
              }
            </Flex>

            <Flex vertical gap={defaultGap}>
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.Head, part: Constants.Parts.Head}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Head)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.Body, part: Constants.Parts.Body}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Body)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.PlanarSphere, part: Constants.Parts.PlanarSphere}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.PlanarSphere)}
              />
            </Flex>

            <Flex vertical gap={defaultGap}>
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.Hands, part: Constants.Parts.Hands}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Hands)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.Feet, part: Constants.Parts.Feet}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Feet)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{...displayRelics.LinkRope, part: Constants.Parts.LinkRope}}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.LinkRope)}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <CharacterScoringSummary simScoringResult={simScoringResult}/>
    </Flex>
  )
}

CharacterPreview.propTypes = {
  source: PropTypes.string,
  character: PropTypes.object,
  id: PropTypes.string,
}
