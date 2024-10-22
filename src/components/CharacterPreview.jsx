import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Flex, Image, Segmented, theme, Typography } from 'antd'
import PropTypes from 'prop-types'
import { RelicScorer } from 'lib/relicScorerPotential'
import { AppPages, DB } from 'lib/db'
import { Assets } from 'lib/assets'
import { CHARACTER_SCORE, COMBAT_STATS, Constants, CUSTOM_TEAM, DAMAGE_UPGRADES, DEFAULT_TEAM, ElementToDamage, SETTINGS_TEAM, SIMULATION_SCORE } from 'lib/constants.ts'
import { defaultGap, innerW, lcInnerH, lcInnerW, lcParentH, lcParentW, middleColumnWidth, parentH, parentW } from 'lib/constantsUi'

import Rarity from 'components/characterPreview/Rarity'
import StatText from 'components/characterPreview/StatText'
import RelicModal from 'components/RelicModal.tsx'
import RelicPreview from 'components/RelicPreview'
import { RelicModalController } from 'lib/relicModalController'
import { CharacterStatSummary } from 'components/characterPreview/CharacterStatSummary'
import { EditOutlined, SettingOutlined, SwapOutlined, SyncOutlined } from '@ant-design/icons'
import EditImageModal from './EditImageModal'
import { Message } from 'lib/message'
import CharacterCustomPortrait from './CharacterCustomPortrait'
import { SaveState } from 'lib/saveState'
import { getSimScoreGrade, scoreCharacterSimulation } from 'lib/characterScorer'
import { Utils } from 'lib/utils'
import { CharacterCardCombatStats, CharacterCardScoringStatUpgrades, CharacterScoringSummary } from 'components/characterPreview/CharacterScoringSummary'
import CharacterModal from 'components/CharacterModal'
import { LoadingBlurredImage } from 'components/LoadingBlurredImage'
import { SavedSessionKeys } from 'lib/constantsSession'
import { HeaderText } from 'components/HeaderText'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { useTranslation } from 'react-i18next'

const { useToken } = theme
const { Text } = Typography

const outline = 'rgb(255 255 255 / 40%) solid 1px'
const shadow = 'rgba(0, 0, 0, 0.5) 1px 1px 1px 1px'
const filter = 'drop-shadow(rgb(0, 0, 0) 1px 1px 3px)'
const buttonStyle = {
  opacity: 0,
  transition: 'opacity 0.3s ease',
  visibility: 'hidden',
  flex: 'auto',
  position: 'absolute',
  left: 6,
  width: 150,
}

// This is hardcoded for the screenshot-to-clipboard util. Probably want a better way to do this if we ever change background colors
export function CharacterPreview(props) {
  console.log('======================================================================= RENDER CharacterPreview')

  const { token } = useToken()

  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const { source, character, setOriginalCharacterModalOpen, setOriginalCharacterModalInitialCharacter, setCharacterModalAdd } = props

  const isScorer = source == 'scorer'
  const isBuilds = source == 'builds'

  const backgroundColor = token.colorBgLayout

  const relicsById = window.store((s) => s.relicsById)
  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState(null) // <null | CustomImageConfig>
  const [teamSelection, setTeamSelection] = useState(DEFAULT_TEAM)
  const [scoringType, setScoringType] = useState(SIMULATION_SCORE)
  const [combatScoreDetails, setCombatScoreDetails] = useState(COMBAT_STATS)
  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState()
  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState()
  const [redrawTeammates, setRedrawTeammates] = useState()
  const activeKey = window.store((s) => s.activeKey)

  // We need to track the previously selected character in order to know which state to put the sim team in.
  const prevCharId = useRef(null)

  useEffect(() => {
    // Use any existing character's portrait instead of the default
    setCustomPortrait(DB.getCharacterById(character?.id)?.portrait || null)
    if (character?.id) {
      // Only for simulation scoring characters
      const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
      if (defaultScoringMetadata?.simulation) {
        const scoringMetadata = DB.getScoringMetadata(character.id)

        if (Utils.objectHash(scoringMetadata.simulation.teammates) != Utils.objectHash(defaultScoringMetadata.simulation.teammates)) {
          setTeamSelection(CUSTOM_TEAM)
        } else {
          setTeamSelection(DEFAULT_TEAM)
        }
      }
      prevCharId.current = character.id
    }
  }, [character])

  if (isScorer && activeKey != AppPages.RELIC_SCORER) {
    return <></>
  } else if (!isScorer && activeKey != AppPages.CHARACTERS) {
    return <></>
  }

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
    SaveState.delayedSave()

    setSelectedRelic(relic)

    Message.success(t('CharacterPreview.Messages.AddedRelic')/* Successfully added relic */)
  }

  function onEditPortraitOk(portraitPayload) {
    const { type, ...portrait } = portraitPayload
    switch (type) {
      case 'add':
        setCustomPortrait({ ...portrait })
        DB.saveCharacterPortrait(character.id, portrait)
        Message.success(t('CharacterPreview.Messages.SavedPortrait')/* Successfully saved portrait */)
        SaveState.delayedSave()
        break
      case 'delete':
        DB.deleteCharacterPortrait(character.id)
        setCustomPortrait(null)
        Message.success(t('CharacterPreview.Messages.RevertedPortrait')/* Successfully reverted portrait */)
        SaveState.delayedSave()
        break
      default:
        console.error(`Payload of type '${type}' is not valid!`)
    }
    setEditPortraitModalOpen(false)
  }

  if (!character) {
    return (
      <Flex style={{ display: 'flex', height: parentH, backgroundColor: backgroundColor }} gap={defaultGap} id={props.id}>
        <div style={{
          width: parentW,
          overflow: 'hidden',
          outline: `2px solid ${token.colorBgContainer}`,
          height: '100%',
          borderRadius: '8px',
        }}
        >
          {/* This is a placeholder for the character portrait when no character is selected */}
        </div>

        <Flex gap={defaultGap}>
          <Flex
            vertical gap={defaultGap} align='center'
            style={{
              outline: `2px solid ${token.colorBgContainer}`,
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            }}
          >
            <Flex vertical style={{ width: middleColumnWidth, height: 280 * 2 + defaultGap }} justify='space-between'>
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
  if (isScorer || isBuilds) {
    const relicsArray = Object.values(character.equipped)
    scoringResults = RelicScorer.scoreCharacterWithRelics(character, relicsArray)
    displayRelics = character.equipped
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
  }

  const characterId = character.form.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterElement = characterMetadata.element
  const elementalDmgValue = ElementToDamage[characterElement]

  const statCalculationRelics = Utils.clone(displayRelics)
  RelicFilters.condenseRelicSubstatsForOptimizerSingle(Object.values(statCalculationRelics))
  const finalStats = calculateBuild(OptimizerTabController.fixForm(OptimizerTabController.getDisplayFormValues(character.form)), statCalculationRelics)
  finalStats.CV = StatCalculator.calculateCv(Object.values(statCalculationRelics))
  finalStats[elementalDmgValue] = finalStats.ELEMENTAL_DMG

  let currentSelection = teamSelection
  if (character?.id) {
    const defaultScoringMetadata = DB.getMetadata().characters[character.id].scoringMetadata
    if (defaultScoringMetadata?.simulation) {
      const scoringMetadata = DB.getScoringMetadata(character.id)

      const hasCustom = Utils.objectHash(scoringMetadata.simulation.teammates) != Utils.objectHash(defaultScoringMetadata.simulation.teammates)

      // Use the previously selected character to handle all cases of overriding the sim team display
      if (prevCharId.current == null) {
        if (hasCustom) {
          currentSelection = CUSTOM_TEAM
        } else {
          currentSelection = DEFAULT_TEAM
        }
      }

      if (prevCharId.current != character.id) {
        if (hasCustom) {
          currentSelection = CUSTOM_TEAM
        } else {
          currentSelection = teamSelection
        }
      }
    }
  }

  let combatSimResult = scoreCharacterSimulation(character, displayRelics, currentSelection)
  let simScoringResult = scoringType == SIMULATION_SCORE && combatSimResult
  if (!simScoringResult?.originalSim) {
    combatSimResult = null
    simScoringResult = null
  } else {
    // Fix elemental damage
    simScoringResult.originalSimResult[elementalDmgValue] = simScoringResult.originalSimResult.ELEMENTAL_DMG
  }

  const scoredRelics = scoringResults.relics || []

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeId ? t(`gameData:Lightcones.${lightConeId}.Name`) : ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''

  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterName = characterId ? t(`gameData:Characters.${characterId}.Name`) : ''
  const characterPath = characterMetadata.path
  // console.log(displayRelics)

  // Temporary w/h overrides while we're split between sim scoring and weight scoring
  const newLcMargin = 5
  const newLcHeight = 125
  // Some APIs return empty light cone as '0'
  const charCenter = DB.getMetadata().characters[character.id].imageCenter

  const lcCenter = (character.form.lightCone && character.form.lightCone != '0') ? DB.getMetadata().lightCones[character.form.lightCone].imageCenter : 0

  const tempLcParentW = simScoringResult ? parentW : lcParentW

  const tempLcParentH = simScoringResult ? newLcHeight : lcParentH
  const tempLcInnerW = simScoringResult ? parentW + 16 : lcInnerW

  const tempLcInnerH = simScoringResult ? 1260 / 902 * tempLcInnerW : lcInnerH

  const tempParentH = simScoringResult ? parentH - newLcHeight - newLcMargin : parentH

  // Since the lc takes some space, we want to zoom the portrait out
  const tempInnerW = simScoringResult ? 950 : innerW

  // Teammate character modal OK
  function onCharacterModalOk(form) {
    if (!form.characterId) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedCharacter')/* No selected character */)
    }
    if (!form.lightCone) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedCharacter')/* No selected character */)
    }

    const scoringMetadata = Utils.clone(DB.getScoringMetadata(characterId))
    const simulation = scoringMetadata.simulation

    simulation.teammates[selectedTeammateIndex] = form

    DB.updateSimulationScoreOverrides(characterId, simulation)
    setRedrawTeammates(Utils.randomId())

    setTeamSelection(CUSTOM_TEAM)
  }

  function ScoreHeader(props) {
    const result = props.result

    const textStyle = {
      fontSize: 17,
      fontWeight: '600',
      textAlign: 'center',
      color: 'rgb(225, 165, 100)',
      height: 23,
      whiteSpace: 'nowrap',
    }

    const textDisplay = (
      <Flex align='center' vertical style={{ marginBottom: 4, paddingTop: 3, paddingBottom: 3 }}>
        <StatText style={textStyle}>
          {t('CharacterPreview.ScoreHeader.Title')/* Combat Sim */}
        </StatText>
        <StatText style={textStyle}>
          {
            t('CharacterPreview.ScoreHeader.Score', { score: Utils.truncate10ths(Math.max(0, result.percent * 100)).toFixed(1), grade: getSimScoreGrade(result.percent) })
            /* DPS Score {{score}}% {{grade}} */
          }
        </StatText>
      </Flex>
    )

    return (
      <Flex vertical>
        {textDisplay}
      </Flex>
    )
  }

  function ScoreFooter(props) {
    const tabsDisplay = (
      <Segmented
        style={{ marginLeft: 10, marginRight: 10, marginTop: 2, marginBottom: 0, alignItems: 'center' }}
        onChange={(selection) => {
          if (selection == SETTINGS_TEAM) {
            window.modalApi.info({
              icon: null,
              width: 400,
              okText: t('common:Ok', { capitalizeLength: -1 }),
              maskClosable: true,
              content: (
                <div style={{ width: '100%' }}>
                  <Flex vertical gap={10}>
                    <HeaderText>{t('modals:ScoreFooter.ModalTitle')/* Combat sim scoring settings */}</HeaderText>
                    <Button
                      icon={<SyncOutlined/>}
                      onClick={() => {
                        const characterMetadata = Utils.clone(DB.getMetadata().characters[character.id])
                        const simulation = characterMetadata.scoringMetadata.simulation

                        DB.updateSimulationScoreOverrides(character.id, simulation)

                        setTeamSelection(DEFAULT_TEAM)
                        setRedrawTeammates(Math.random())

                        Message.success(t('modals:ScoreFooter.ResetSuccessMsg')/* Reset to default teams */)
                      }}
                    >
                      {t('modals:ScoreFooter.ResetButtonText')/* Reset custom team to default */}
                    </Button>
                    <Button
                      icon={<SwapOutlined/>}
                      onClick={() => {
                        const characterMetadata = Utils.clone(DB.getScoringMetadata(character.id))
                        const simulation = characterMetadata.simulation

                        for (const teammate of simulation.teammates) {
                          const form = DB.getCharacterById(teammate.characterId)?.form
                          if (form == null) continue

                          teammate.characterEidolon = form.characterEidolon
                          if (form.lightCone) {
                            teammate.lightCone = form.lightCone
                            teammate.lightConeSuperimposition = form.lightConeSuperimposition || 1
                          }
                        }

                        DB.updateSimulationScoreOverrides(character.id, simulation)
                        setTeamSelection(CUSTOM_TEAM)
                        setRedrawTeammates(Math.random())

                        Message.success(t('modals:ScoreFooter.SyncSuccessMsg')/* Synced teammates */)
                      }}
                    >
                      {t('modals:ScoreFooter.SyncButtonText')/* Sync imported eidolons / light cones */}
                    </Button>
                  </Flex>
                </div>
              ),
            })
          } else {
            setTeamSelection(selection)
          }
        }}
        value={teamSelection}
        block
        options={[
          {
            value: DEFAULT_TEAM,
            label: t('modals:ScoreFooter.TeamOptions.Default')/* Default */,
          },
          {
            label: (
              <SettingOutlined/>
            ),
            value: SETTINGS_TEAM,
            className: 'short-segmented',
          },
          {
            value: CUSTOM_TEAM,
            label: t('modals:ScoreFooter.TeamOptions.Custom')/* Custom */,
          },
        ]}
      />
    )

    return (
      <Flex vertical style={{}} gap={2}>
        <CharacterModal
          onOk={onCharacterModalOk}
          open={isCharacterModalOpen}
          setOpen={setCharacterModalOpen}
          initialCharacter={characterModalInitialCharacter}
        />
        {tabsDisplay}
      </Flex>
    )
  }

  function CharacterPreviewScoringTeammate(props) {
    const { result, index, setCharacterModalOpen, setSelectedTeammateIndex } = props
    const teammate = result.simulationMetadata.teammates[index]
    const iconSize = 64
    return (
      <Card.Grid
        style={gridStyle} hoverable={true}
        onClick={() => {
          setCharacterModalInitialCharacter({ form: teammate })
          setCharacterModalOpen(true)

          setSelectedTeammateIndex(index)
        }}
        className='custom-grid'
      >
        <Flex vertical align='center' gap={0}>
          <img
            src={Assets.getCharacterAvatarById(teammate.characterId)}
            style={{
              height: iconSize,
              width: iconSize,
              borderRadius: 40,
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(5px)',
              outline: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          />
          <OverlayText text={t('common:EidolonNShort', { eidolon: teammate.characterEidolon })} top={-12}/>
          <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{ height: iconSize, marginTop: -3 }}/>
          <OverlayText text={t('common:SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })} top={-18}/>
        </Flex>
      </Card.Grid>
    )
  }

  return (
    <Flex vertical>
      <Flex vertical id={props.id} style={{ backgroundColor: backgroundColor }}>
        <Flex
          style={{
            display: character ? 'flex' : 'none',
            height: parentH,
            margin: 1,
          }}
        >
          <RelicModal
            selectedRelic={selectedRelic} type='edit' onOk={onEditOk}
            setOpen={setEditModalOpen}
            open={editModalOpen}
          />
          <RelicModal
            selectedRelic={selectedRelic} type='edit' onOk={onAddOk}
            setOpen={setAddModalOpen}
            open={addModalOpen}
          />

          <Flex
            vertical gap={12}
            className='character-build-portrait'
          >
            {!isBuilds && (
              <div
                style={{
                  width: `${parentW}px`,
                  height: `${tempParentH}px`,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  marginRight: defaultGap,
                  outline: outline,
                  filter: filter,
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
                        />
                      )
                      : (
                        <LoadingBlurredImage
                          src={Assets.getCharacterPortraitById(character.id)}
                          style={{
                            position: 'absolute',
                            left: -charCenter.x * charCenter.z / 2 * tempInnerW / 1024 + parentW / 2,
                            top: -charCenter.y * charCenter.z / 2 * tempInnerW / 1024 + tempParentH / 2,
                            width: tempInnerW * charCenter.z,
                          }}
                        />
                      )
                  }
                  {!isScorer && (
                    <Button
                      style={{
                        ...buttonStyle,
                        top: 46,
                      }}
                      className='character-build-portrait-button'
                      icon={<EditOutlined/>}
                      onClick={() => {
                        setCharacterModalAdd(false)
                        setOriginalCharacterModalInitialCharacter(character)
                        setOriginalCharacterModalOpen(true)
                      }}
                      type='primary'
                    >
                      {t('CharacterPreview.EditCharacter')/* Edit character */}
                    </Button>
                  )}
                  {isScorer && (
                    <Button
                      style={{
                        ...buttonStyle,
                        top: 46,
                      }}
                      className='character-build-portrait-button'
                      icon={<EditOutlined/>}
                      onClick={() => {
                        setOriginalCharacterModalInitialCharacter(character)
                        setOriginalCharacterModalOpen(true)
                      }}
                      type='primary'
                    >
                      {t('CharacterPreview.EditCharacter')/* Edit character */}
                    </Button>
                  )}
                  <Button
                    style={{
                      ...buttonStyle,
                      top: 7,
                    }}
                    className='character-build-portrait-button'
                    icon={<EditOutlined/>}
                    onClick={() => setEditPortraitModalOpen(true)}
                    type='primary'
                  >
                    {t('CharacterPreview.EditPortrait')/* Edit portrait */}
                  </Button>
                  <EditImageModal
                    title={t('CharacterPreview.EditPortrait')/* Edit portrait */}
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
                    top: simScoringResult ? tempParentH - 44 : tempParentH - 34,
                    height: 34,
                    paddingLeft: 4,
                    display: getArtistName() ? 'flex' : 'none',
                  }}
                  align='flex-start'
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
                    {t('CharacterPreview.ArtBy', { artistName: getArtistName() || '' })/* Art by {{artistName}} */}
                  </Text>
                </Flex>
              </div>

            )}

            {
              simScoringResult
              && !isBuilds && (
                <Flex vertical>
                  {lightConeName && (
                    <Flex
                      vertical
                      style={{
                        position: 'relative',
                        height: 0,
                        top: newLcHeight - 35,
                        // top: newLcHeight - 221, // top right
                        paddingRight: 12,
                      }}
                      align='flex-end'
                    >
                      <Text
                        style={{
                          position: 'absolute',
                          height: 30,
                          backgroundColor: 'rgb(0 0 0 / 70%)',
                          padding: '4px 12px',
                          borderRadius: 8,
                          fontSize: 14,
                          maxWidth: parentW - 50,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          zIndex: 3,
                          textShadow: '0px 0px 10px black',
                          outline: outline,
                          boxShadow: shadow,
                        }}
                      >
                        {`${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })} - ${lightConeName}`}
                      </Text>
                    </Flex>
                  )}
                  <Flex
                    className='lightConeCard'
                    style={{
                      width: `${tempLcParentW}px`,
                      height: `${tempLcParentH}px`,
                      overflow: 'hidden',
                      zIndex: 2,
                      borderRadius: '8px',
                      outline: outline,
                      filter: filter,
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (isScorer) {
                        setOriginalCharacterModalInitialCharacter(character)
                        setOriginalCharacterModalOpen(true)
                      } else {
                        setCharacterModalAdd(false)
                        setOriginalCharacterModalInitialCharacter(character)
                        setOriginalCharacterModalOpen(true)
                      }
                    }}
                  >
                    <LoadingBlurredImage
                      src={lightConeSrc}
                      style={{
                        position: 'absolute',
                        width: 420,
                        top: -lcCenter + newLcHeight / 2,
                        left: -8,
                      }}
                    />
                  </Flex>
                </Flex>
              )
            }
          </Flex>

          <Flex gap={defaultGap}>
            <Flex vertical gap={defaultGap} align='center' justify='space-between'>
              <Flex
                vertical style={{ width: middleColumnWidth, height: '100%' /* 280 * 2 + defaultGap */ }}
                justify='space-between'
              >
                <Flex vertical>
                  <Flex justify='space-around' style={{ height: 26, marginBottom: 6 }} align='center'>
                    <Image
                      preview={false}
                      width={32}
                      src={Assets.getElement(characterElement)}
                    />
                    <Rarity rarity={characterMetadata.rarity}/>
                    <Image
                      preview={false}
                      width={32}
                      src={Assets.getPathFromClass(characterPath)}
                    />
                  </Flex>
                  <Flex vertical>
                    <StatText style={{ fontSize: 24, lineHeight: '30px', fontWeight: 400, textAlign: 'center' }}>
                      {characterName}
                    </StatText>
                    <StatText style={{ fontSize: 16, fontWeight: 400, textAlign: 'center' }}>
                      {`${t('common:LevelShort', { level: characterLevel })} ${t('common:EidolonNShort', { eidolon: characterEidolon })}`}
                    </StatText>
                  </Flex>
                </Flex>

                <CharacterStatSummary
                  finalStats={finalStats}
                  elementalDmgValue={elementalDmgValue}
                  cv={finalStats.CV}
                  simScore={simScoringResult ? simScoringResult.originalSimResult.simScore : undefined}
                />
                {
                  simScoringResult
                  && <ScoreHeader result={simScoringResult}/>
                }
                {
                  simScoringResult
                  && (
                    <Flex
                      vertical
                    >
                      <Card
                        style={{
                          backgroundColor: token.colorBgLayout,
                          padding: '0px !important',
                          body: {
                            height: 500,
                          },
                        }}
                        styles={{
                          body: {
                            padding: 0,
                            borderRadius: 10,
                          },
                        }}
                        className='teamSelectionCard'
                        size='small'
                        bordered={false}
                      >
                        <Flex justify='space-around' style={{ paddingTop: 0 }}>
                          <CharacterPreviewScoringTeammate
                            result={simScoringResult} index={0}
                            setCharacterModalOpen={setCharacterModalOpen}
                            setSelectedTeammateIndex={setSelectedTeammateIndex}
                          />
                          <CharacterPreviewScoringTeammate
                            result={simScoringResult} index={1}
                            setCharacterModalOpen={setCharacterModalOpen}
                            setSelectedTeammateIndex={setSelectedTeammateIndex}
                          />
                          <CharacterPreviewScoringTeammate
                            result={simScoringResult} index={2}
                            setCharacterModalOpen={setCharacterModalOpen}
                            setSelectedTeammateIndex={setSelectedTeammateIndex}
                          />
                        </Flex>
                      </Card>
                      <ScoreFooter result={simScoringResult}/>
                    </Flex>
                  )
                }
                {
                  simScoringResult && combatScoreDetails == DAMAGE_UPGRADES && (
                    <Flex vertical gap={defaultGap}>
                      <CharacterCardScoringStatUpgrades result={simScoringResult}/>
                    </Flex>
                  )
                }

                {
                  simScoringResult && combatScoreDetails == COMBAT_STATS && (
                    <Flex vertical gap={defaultGap}>
                      <CharacterCardCombatStats result={simScoringResult}/>
                    </Flex>
                  )
                }

                {
                  !simScoringResult
                  && (
                    <Flex vertical>
                      <StatText style={{ fontSize: 17, fontWeight: 600, textAlign: 'center', color: '#e1a564' }}>
                        {t('CharacterPreview.CharacterScore', { score: scoringResults.totalScore.toFixed(0), grade: scoringResults.totalScore == 0 ? '' : '(' + scoringResults.totalRating + ')' })}
                      </StatText>
                    </Flex>
                  )
                }
                {
                  !simScoringResult
                  && (
                    <Flex vertical style={{ width: middleColumnWidth }}>
                      <Flex vertical>
                        <StatText
                          style={{ fontSize: 18, fontWeight: 400, marginLeft: 10, marginRight: 10, textAlign: 'center' }}
                          ellipsis={true}
                        >
                          {`${lightConeName}`}
                          &nbsp;
                        </StatText>
                        <StatText style={{ fontSize: 18, fontWeight: 400, textAlign: 'center' }}>
                          {
                            `${t('common:LevelShort', { level: lightConeLevel })} ${t('common:SuperimpositionNShort', { superimposition: lightConeSuperimposition })}`
                            /* Lv 80 S5 */
                          }
                        </StatText>
                      </Flex>
                      <div
                        className='lightConeCard'
                        style={{
                          width: `${tempLcParentW}px`,
                          height: `${tempLcParentH}px`,
                          overflow: 'hidden',
                          borderRadius: '8px',
                          outline: outline,
                          filter: filter,
                        }}
                        onClick={() => {
                          if (isScorer) {
                            setOriginalCharacterModalInitialCharacter(character)
                            setOriginalCharacterModalOpen(true)
                          } else {
                            setCharacterModalAdd(false)
                            setOriginalCharacterModalInitialCharacter(character)
                            setOriginalCharacterModalOpen(true)
                          }
                        }}
                      >
                        <LoadingBlurredImage
                          src={lightConeSrc}
                          style={{
                            width: tempLcInnerW,
                            transform: `translate(${(tempLcInnerW - tempLcParentW) / 2 / tempLcInnerW * -100}%, ${(tempLcInnerH - tempLcParentH) / 2 / tempLcInnerH * -100 + 8}%)`, // Magic # 8 to fit certain LCs
                          }}
                        />
                      </div>
                    </Flex>
                  )
                }
              </Flex>
            </Flex>

            <Flex vertical gap={defaultGap}>
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{ ...displayRelics.Head, part: Constants.Parts.Head }}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Head)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{ ...displayRelics.Body, part: Constants.Parts.Body }}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Body)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{ ...displayRelics.PlanarSphere, part: Constants.Parts.PlanarSphere }}
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
                relic={{ ...displayRelics.Hands, part: Constants.Parts.Hands }}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Hands)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{ ...displayRelics.Feet, part: Constants.Parts.Feet }}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.Feet)}
              />
              <RelicPreview
                setEditModalOpen={setEditModalOpen}
                setSelectedRelic={setSelectedRelic}
                setAddModelOpen={setAddModalOpen}
                relic={{ ...displayRelics.LinkRope, part: Constants.Parts.LinkRope }}
                source={props.source}
                characterId={characterId}
                score={scoredRelics.find((x) => x.part == Constants.Parts.LinkRope)}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      {!isBuilds && (
        <Flex vertical>
          <Flex justify='center' gap={25}>
            <Flex justify='center' style={{ paddingLeft: 20, paddingRight: 5, borderRadius: 7, height: 40, marginTop: 10, backgroundColor: token.colorBgContainer + '85' }} align='center'>
              <Text style={{ width: 150 }}>
                {t('CharacterPreview.AlgorithmSlider.Title')/* Scoring algorithm: */}
              </Text>
              <Segmented
                style={{ width: 325, height: 30 }}
                onChange={(selection) => {
                  setScoringType(selection)
                  window.store.getState().setSavedSessionKey(SavedSessionKeys.scoringType, selection)
                  SaveState.delayedSave()
                }}
                value={scoringType}
                block
                options={[
                  {
                    label: characterMetadata.scoringMetadata.simulation == null
                      ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD')/* Combat Score (TBD) */
                      : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
                    value: SIMULATION_SCORE,
                    disabled: false,
                  },
                  {
                    label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
                    value: CHARACTER_SCORE,
                    disabled: false,
                  },
                ]}
              />
            </Flex>

            <Flex justify='center' style={{ paddingLeft: 20, paddingRight: 5, borderRadius: 7, height: 40, marginTop: 10, backgroundColor: token.colorBgContainer + '85' }} align='center'>
              <Text style={{ width: 150 }}>
                {t('CharacterPreview.DetailsSlider.Title')/* Combat score details: */}
              </Text>
              <Segmented
                style={{ width: 325, height: 30 }}
                onChange={(selection) => {
                  setCombatScoreDetails(selection)
                  window.store.getState().setSavedSessionKey(SavedSessionKeys.combatScoreDetails, selection)
                  SaveState.delayedSave()
                }}
                value={combatScoreDetails}
                block
                options={[
                  {
                    label: t('CharacterPreview.DetailsSlider.Labels.CombatStats'), /* Combat Stats */
                    value: COMBAT_STATS,
                    disabled: characterMetadata.scoringMetadata.simulation == null || scoringType == CHARACTER_SCORE,
                  },
                  {
                    label: t('CharacterPreview.DetailsSlider.Labels.DMGUpgrades'), /* Damage Upgrades */
                    value: DAMAGE_UPGRADES,
                    disabled: characterMetadata.scoringMetadata.simulation == null || scoringType == CHARACTER_SCORE,
                  },
                ]}
              />
            </Flex>
          </Flex>
          <CharacterScoringSummary simScoringResult={simScoringResult}/>
        </Flex>
      )}
    </Flex>
  )
}

CharacterPreview.propTypes = {
  source: PropTypes.string,
  character: PropTypes.object,
  id: PropTypes.string,
}

function OverlayText(props) {
  const top = props.top
  return (
    <Flex
      vertical
      style={{
        position: 'relative',
        height: 0,
        top: top,
      }}
      align='center'
    >
      <Text
        style={{
          position: 'absolute',
          backgroundColor: 'rgb(0 0 0 / 75%)',
          padding: '2px 14px',
          borderRadius: 4,
          fontSize: 12,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textShadow: '0px 0px 10px black',
          outline: outline,
          filter: filter,
          lineHeight: '12px',
        }}
      >
        {props.text}
      </Text>
    </Flex>
  )
}

const gridStyle = {
  width: '33.3333%',
  textAlign: 'center',
  padding: 1,
  // border: 'none',
  boxShadow: 'none',
}
