import { EditOutlined } from '@ant-design/icons'
import { Button, Flex, Image, Segmented, theme, Typography } from 'antd'
import CharacterCustomPortrait from 'lib/characterPreview/CharacterCustomPortrait'
import { showcaseButtonStyle, showcaseDropShadowFilter, showcaseOutline, showcaseShadow, ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getArtistName, getPreviewRelics, presetTeamSelectionDisplay, showcaseIsInactive } from 'lib/characterPreview/characterPreviewController'
import { CharacterCardCombatStats, CharacterCardScoringStatUpgrades, CharacterScoringSummary } from 'lib/characterPreview/CharacterScoringSummary'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'

import Rarity from 'lib/characterPreview/Rarity'
import { ShowcaseDpsScoreHeader, ShowcaseDpsScorePanel } from 'lib/characterPreview/ShowcaseDpsScore'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import StatText from 'lib/characterPreview/StatText'
import { CHARACTER_SCORE, COMBAT_STATS, CUSTOM_TEAM, DAMAGE_UPGRADES, DEFAULT_TEAM, ElementToDamage, SIMULATION_SCORE } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { defaultGap, innerW, lcInnerH, lcInnerW, lcParentH, lcParentW, middleColumnWidth, parentH, parentW } from 'lib/constants/constantsUi'
import { Message } from 'lib/interactions/message'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import EditImageModal from 'lib/overlays/modals/EditImageModal'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicFilters } from 'lib/relics/relicFilters'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { scoreCharacterSimulation } from 'lib/scoring/characterScorer'
import { DB } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { Utils } from 'lib/utils/utils'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Relic } from 'types/relic'

const { useToken } = theme
const { Text } = Typography

// This is hardcoded for the screenshot-to-clipboard util. Probably want a better way to do this if we ever change background colors
export function CharacterPreview(props: {
  id: string
  source: ShowcaseSource
  character: Character
  setOriginalCharacterModalOpen: (open: boolean) => void
  setOriginalCharacterModalInitialCharacter: (character: Character) => void
  setCharacterModalAdd: (add: boolean) => void
}) {
  console.log('======================================================================= RENDER CharacterPreview')

  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    setCharacterModalAdd,
  } = props

  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const { token } = useToken()

  const relicsById = window.store((s) => s.relicsById)
  const [selectedRelic, setSelectedRelic] = useState<Relic | undefined>()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig | undefined>() // <null | CustomImageConfig>
  const [teamSelection, setTeamSelection] = useState(DEFAULT_TEAM)
  const [scoringType, setScoringType] = useState(SIMULATION_SCORE)
  const [combatScoreDetails, setCombatScoreDetails] = useState(COMBAT_STATS)
  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState<Character | undefined>()
  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | undefined>()
  const [redrawTeammates, setRedrawTeammates] = useState<number>(0)
  const activeKey = window.store((s) => s.activeKey)

  // We need to track the previously selected character in order to know which state to put the sim team in.
  const prevCharId = useRef(null)

  const backgroundColor = token.colorBgLayout

  // REFACTOR ZONE ===========================================================================================================================

  const artistName = getArtistName(character)

  // REFACTOR ZONE ===========================================================================================================================

  useEffect(() => {
    presetTeamSelectionDisplay(character, prevCharId, setTeamSelection, setCustomPortrait)
  }, [character])

  if (showcaseIsInactive(source, activeKey)) {
    return <></>
  }

  function onEditOk(relic: Relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  function onAddOk(relic: Relic) {
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
      <div
        style={{
          height: parentH,
          backgroundColor: backgroundColor,
          width: 1066,
          borderRadius: 8,
          marginRight: 2,
          outline: `2px solid ${token.colorBgContainer}`,
        }}
      />
    )
  }

  const { scoringResults, displayRelics } = getPreviewRelics(source, character, relicsById)

  const characterId = character.form.characterId
  const characterMetadata = DB.getMetadata().characters[characterId]
  const characterElement = characterMetadata.element
  const elementalDmgValue = ElementToDamage[characterElement]

  const statCalculationRelics = Utils.clone(displayRelics)
  RelicFilters.condenseRelicSubstatsForOptimizerSingle(Object.values(statCalculationRelics))
  const { c: finalStats } = calculateBuild(OptimizerTabController.displayToForm(OptimizerTabController.formToDisplay(character.form)), statCalculationRelics)
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

  const lcCenter = (character.form.lightCone && character.form.lightCone != '0')
    ? DB.getMetadata().lightCones[character.form.lightCone].imageCenter
    : 0

  const tempLcParentW = simScoringResult ? parentW : lcParentW

  const tempLcParentH = simScoringResult ? newLcHeight : lcParentH
  const tempLcInnerW = simScoringResult ? parentW + 16 : lcInnerW

  const tempLcInnerH = simScoringResult ? 1260 / 902 * tempLcInnerW : lcInnerH

  const tempParentH = simScoringResult ? parentH - newLcHeight - newLcMargin : parentH

  // Since the lc takes some space, we want to zoom the portrait out
  const tempInnerW = simScoringResult ? 950 : innerW

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
            selectedRelic={selectedRelic}
            type='edit'
            onOk={onEditOk}
            setOpen={setEditModalOpen}
            open={editModalOpen}
          />
          <RelicModal
            selectedRelic={selectedRelic}
            type='edit'
            onOk={onAddOk}
            setOpen={setAddModalOpen}
            open={addModalOpen}
          />

          <Flex vertical gap={12} className='character-build-portrait'>
            {source != ShowcaseSource.BUILDS_MODAL && (
              <div
                style={{
                  width: `${parentW}px`,
                  height: `${tempParentH}px`,
                  overflow: 'hidden',
                  borderRadius: '8px',
                  marginRight: defaultGap,
                  outline: showcaseOutline,
                  filter: showcaseDropShadowFilter,
                  position: 'relative',
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
                <Flex vertical style={{ width: 'max-content', marginLeft: 6, marginTop: 6 }} gap={7}>
                  {source != ShowcaseSource.SHOWCASE_TAB && (
                    <Button
                      style={showcaseButtonStyle}
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
                  {source == ShowcaseSource.SHOWCASE_TAB && (
                    <Button
                      style={showcaseButtonStyle}
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
                    style={showcaseButtonStyle}
                    className='character-build-portrait-button'
                    icon={<EditOutlined/>}
                    onClick={() => setEditPortraitModalOpen(true)}
                    type='primary'
                  >
                    {t('CharacterPreview.EditPortrait')/* Edit portrait */}
                  </Button>
                </Flex>
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
                <Flex
                  vertical
                  style={{
                    position: 'relative',
                    top: simScoringResult ? tempParentH - 118 : tempParentH - 111,
                    height: 34,
                    paddingLeft: 4,
                    display: artistName ? 'flex' : 'none',
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
                    {t('CharacterPreview.ArtBy', { artistName: artistName || '' })/* Art by {{artistName}} */}
                  </Text>
                </Flex>
              </div>
            )}

            {
              simScoringResult
              && source != ShowcaseSource.BUILDS_MODAL && (
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
                          outline: showcaseOutline,
                          boxShadow: showcaseShadow,
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
                      outline: showcaseOutline,
                      filter: showcaseDropShadowFilter,
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (source == ShowcaseSource.SHOWCASE_TAB) {
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
                  && <ShowcaseDpsScoreHeader result={simScoringResult} relics={displayRelics}/>
                }
                {
                  simScoringResult
                  && (
                    <ShowcaseDpsScorePanel
                      token={token}
                      simScoringResult={simScoringResult}
                      setCharacterModalOpen={setCharacterModalOpen}
                      setSelectedTeammateIndex={setSelectedTeammateIndex}
                      setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
                    />
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
                        {t('CharacterPreview.CharacterScore', {
                          score: scoringResults.totalScore.toFixed(0),
                          grade: scoringResults.totalScore == 0 ? '' : '(' + scoringResults.totalRating + ')',
                        })}
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
                          outline: showcaseOutline,
                          filter: showcaseDropShadowFilter,
                        }}
                        onClick={() => {
                          if (source == ShowcaseSource.SHOWCASE_TAB) {
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

            <ShowcaseRelicsPanel
              setSelectedRelic={setSelectedRelic}
              setEditModalOpen={setEditModalOpen}
              setAddModalOpen={setAddModalOpen}
              displayRelics={displayRelics}
              source={source}
              characterId={characterId}
              scoredRelics={scoredRelics}
            />
          </Flex>
        </Flex>
      </Flex>

      {source != ShowcaseSource.BUILDS_MODAL && (
        <Flex vertical>
          <Flex justify='center' gap={25}>
            <Flex
              justify='center'
              style={{
                paddingLeft: 20,
                paddingRight: 5,
                borderRadius: 7,
                height: 40,
                marginTop: 10,
                backgroundColor: token.colorBgContainer + '85',
              }}
              align='center'
            >
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

            <Flex
              justify='center'
              style={{
                paddingLeft: 20,
                paddingRight: 5,
                borderRadius: 7,
                height: 40,
                marginTop: 10,
                backgroundColor: token.colorBgContainer + '85',
              }}
              align='center'
            >
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
