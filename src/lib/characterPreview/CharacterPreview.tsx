import { Flex, Image, Segmented, theme, Typography } from 'antd'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getArtistName, getPreviewRelics, getShowcaseDisplayDimensions, presetTeamSelectionDisplay, showcaseIsInactive } from 'lib/characterPreview/characterPreviewController'
import { CharacterScoringSummary } from 'lib/characterPreview/CharacterScoringSummary'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'

import Rarity from 'lib/characterPreview/Rarity'
import { ShowcaseDpsScorePanel } from 'lib/characterPreview/ShowcaseDpsScore'
import { ShowcaseLightConeLarge, ShowcaseLightConeSmall } from 'lib/characterPreview/ShowcaseLightCone'
import { ShowcasePortraitSmall } from 'lib/characterPreview/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import StatText from 'lib/characterPreview/StatText'
import { BasicStatsObjectCV } from 'lib/conditionals/conditionalConstants'
import { CHARACTER_SCORE, COMBAT_STATS, CUSTOM_TEAM, DAMAGE_UPGRADES, DEFAULT_TEAM, ElementToDamage, SIMULATION_SCORE } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { defaultGap, middleColumnWidth, parentH } from 'lib/constants/constantsUi'
import { Message } from 'lib/interactions/message'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicFilters } from 'lib/relics/relicFilters'
import { StatCalculator } from 'lib/relics/statCalculator'
import { Assets } from 'lib/rendering/assets'
import { scoreCharacterSimulation } from 'lib/scoring/characterScorer'
import { DB } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { Utils } from 'lib/utils/utils'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { CustomImageConfig, CustomImagePayload } from 'types/customImage'
import { ImageCenter } from 'types/metadata'
import { Relic } from 'types/relic'

const { useToken } = theme
const { Text } = Typography

export type ShowcaseDisplayDimensions = {
  tempLcParentW: number
  tempLcParentH: number
  tempLcInnerW: number
  tempLcInnerH: number
  tempInnerW: number
  tempParentH: number
  newLcHeight: number
  newLcMargin: number
  lcCenter: number
  charCenter: ImageCenter
}

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
  const activeKey = window.store((s) => s.activeKey)

  // We need to track the previously selected character in order to know which state to put the sim team in.
  const prevCharId = useRef(null)

  const backgroundColor = token.colorBgLayout

  // REFACTOR ZONE ===========================================================================================================================

  useEffect(() => {
    presetTeamSelectionDisplay(character, prevCharId, setTeamSelection, setCustomPortrait)
  }, [character])

  if (showcaseIsInactive(source, activeKey)) {
    return <></>
  }

  const artistName = getArtistName(character)

  // REFACTOR ZONE ===========================================================================================================================

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

  function onEditPortraitOk(portraitPayload: CustomImagePayload) {
    const { type, ...portrait } = portraitPayload
    switch (type) {
      case 'add':
        setCustomPortrait(portrait)
        DB.saveCharacterPortrait(character.id, portrait)
        Message.success(t('CharacterPreview.Messages.SavedPortrait')/* Successfully saved portrait */)
        SaveState.delayedSave()
        break
      case 'delete':
        DB.deleteCharacterPortrait(character.id)
        setCustomPortrait(undefined)
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
  const { c: basicStats } = calculateBuild(OptimizerTabController.displayToForm(OptimizerTabController.formToDisplay(character.form)), statCalculationRelics)
  const finalStats: BasicStatsObjectCV = {
    ...basicStats,
    CV: StatCalculator.calculateCv(Object.values(statCalculationRelics)),
  }

  finalStats.CV =
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

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, Boolean(simScoringResult))
  const {
    tempInnerW,
    tempParentH,
    charCenter,
  } = displayDimensions

  const lightConeId = character.form.lightCone
  const lightConeLevel = 80
  const lightConeSuperimposition = character.form.lightConeSuperimposition
  const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  const lightConeName = lightConeId ? t(`gameData:Lightcones.${lightConeId}.Name` as never) : ''
  const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''

  const characterLevel = 80
  const characterEidolon = character.form.characterEidolon
  const characterName = characterId ? t(`gameData:Characters.${characterId}.Name` as never) : ''
  const characterPath = characterMetadata.path

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
              <ShowcasePortraitSmall
                source={source}
                character={character}
                displayDimensions={displayDimensions}
                customPortrait={customPortrait}
                editPortraitModalOpen={editPortraitModalOpen}
                setEditPortraitModalOpen={setEditPortraitModalOpen}
                onEditPortraitOk={onEditPortraitOk}
                simScoringResult={simScoringResult}
                artistName={artistName}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setCharacterModalAdd={setCharacterModalAdd}
              />
            )}

            {
              simScoringResult
              && source != ShowcaseSource.BUILDS_MODAL && (
                <ShowcaseLightConeSmall
                  source={source}
                  character={character}
                  lightConeSrc={lightConeSrc}
                  lightConeName={lightConeName}
                  lightConeLevel={lightConeLevel}
                  lightConeSuperimposition={lightConeSuperimposition}
                  displayDimensions={displayDimensions}
                  setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                  setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                  setCharacterModalAdd={setCharacterModalAdd}
                />
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
                  simScoringResult &&
                  (
                    <ShowcaseDpsScorePanel
                      characterId={characterId}
                      token={token}
                      simScoringResult={simScoringResult}
                      teamSelection={teamSelection}
                      combatScoreDetails={combatScoreDetails}
                      displayRelics={displayRelics}
                      setTeamSelection={setTeamSelection}
                    />
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
                  !simScoringResult &&
                  <ShowcaseLightConeLarge
                    source={source}
                    character={character}
                    lightConeSrc={lightConeSrc}
                    lightConeName={lightConeName}
                    lightConeLevel={lightConeLevel}
                    lightConeSuperimposition={lightConeSuperimposition}
                    displayDimensions={displayDimensions}
                    setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                    setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                    setCharacterModalAdd={setCharacterModalAdd}
                  />
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
