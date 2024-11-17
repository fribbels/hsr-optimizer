import { Flex, theme, Typography } from 'antd'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getArtistName,
  getPreviewRelics,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  getShowcaseSimScoringResult,
  getShowcaseStats,
  handleTeamSelection,
  presetTeamSelectionDisplay,
  showcaseIsInactive,
  showcaseOnAddOk,
  showcaseOnEditOk,
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/ShowcaseCharacterHeader'
import { ShowcaseDpsScorePanel } from 'lib/characterPreview/ShowcaseDpsScore'
import { ShowcaseLightConeLarge, ShowcaseLightConeSmall } from 'lib/characterPreview/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import { ShowcaseStatScore } from 'lib/characterPreview/ShowcaseStatScore'
import { COMBAT_STATS, DEFAULT_TEAM, SIMULATION_SCORE } from 'lib/constants/constants'
import { defaultGap, middleColumnWidth, parentH } from 'lib/constants/constantsUi'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { SimulationScore } from 'lib/scoring/characterScorer'
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
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig | undefined>()
  const [teamSelection, setTeamSelection] = useState(DEFAULT_TEAM)
  const [scoringType, setScoringType] = useState(SIMULATION_SCORE)
  const [combatScoreDetails, setCombatScoreDetails] = useState(COMBAT_STATS)
  const activeKey = window.store((s) => s.activeKey)

  // We need to track the previously selected character in order to know which state to put the sim team in.
  const prevCharId = useRef<string | undefined>()

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

  // const characterId = character.form.characterId
  // const characterMetadata = DB.getMetadata().characters[characterId]
  // const characterElement = characterMetadata.element
  // const elementalDmgType = ElementToDamage[characterElement]
  //
  // const lightConeId = character.form.lightCone
  // const lightConeLevel = 80
  // const lightConeSuperimposition = character.form.lightConeSuperimposition
  // const lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
  // const lightConeName = lightConeId ? t(`gameData:Lightcones.${lightConeId}.Name` as never) : ''
  // const lightConeSrc = Assets.getLightConePortrait(lightConeMetadata) || ''
  //
  // const characterLevel = 80
  // const characterEidolon = character.form.characterEidolon
  // const characterName = characterId ? t(`gameData:Characters.${characterId}.Name` as never) : ''
  // const characterPath = characterMetadata.path

  const showcaseMetadata = getShowcaseMetadata(character)

  const finalStats = getShowcaseStats(character, displayRelics, showcaseMetadata)
  const currentSelection = handleTeamSelection(character, prevCharId, teamSelection)
  const simScoringResult = getShowcaseSimScoringResult(
    character,
    displayRelics,
    scoringType,
    currentSelection,
    showcaseMetadata,
  )

  const scoredRelics = scoringResults.relics || []

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, Boolean(simScoringResult))

  return (
    <Flex vertical>
      <RelicModal
        selectedRelic={selectedRelic}
        type='edit'
        onOk={(relic: Relic) => showcaseOnEditOk(relic, selectedRelic, setSelectedRelic)}
        setOpen={setEditModalOpen}
        open={editModalOpen}
      />
      <RelicModal
        selectedRelic={selectedRelic}
        type='edit'
        onOk={(relic: Relic) => showcaseOnAddOk(relic, setSelectedRelic)}
        setOpen={setAddModalOpen}
        open={addModalOpen}
      />

      <Flex
        id={props.id}
        style={{
          display: character ? 'flex' : 'none',
          height: parentH,
          margin: 1,
          backgroundColor: backgroundColor,
        }}
        gap={defaultGap}
      >
        {source != ShowcaseSource.BUILDS_MODAL &&
          <Flex vertical gap={12} className='character-build-portrait'>
            <ShowcasePortrait
              source={source}
              character={character}
              displayDimensions={displayDimensions}
              customPortrait={customPortrait}
              editPortraitModalOpen={editPortraitModalOpen}
              setEditPortraitModalOpen={setEditPortraitModalOpen}
              onEditPortraitOk={(payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, setCustomPortrait, setEditPortraitModalOpen)}
              simScoringResult={simScoringResult as SimulationScore}
              artistName={artistName}
              setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
              setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
              setCharacterModalAdd={setCharacterModalAdd}
            />

            {simScoringResult && (
              <ShowcaseLightConeSmall
                source={source}
                character={character}
                showcaseMetadata={showcaseMetadata}
                displayDimensions={displayDimensions}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setCharacterModalAdd={setCharacterModalAdd}
              />
            )}
          </Flex>
        }

        <Flex
          vertical
          gap={defaultGap}
          style={{ width: middleColumnWidth, height: '100%' }}
          justify='space-between'
        >
          <ShowcaseCharacterHeader
            showcaseMetadata={showcaseMetadata}
          />

          <CharacterStatSummary
            finalStats={finalStats}
            elementalDmgValue={showcaseMetadata.elementalDmgType}
            cv={finalStats.CV}
            simScore={simScoringResult ? simScoringResult.originalSimResult.simScore : undefined}
          />

          {simScoringResult && <>
            <ShowcaseDpsScorePanel
              characterId={showcaseMetadata.characterId}
              token={token}
              simScoringResult={simScoringResult}
              teamSelection={teamSelection}
              combatScoreDetails={combatScoreDetails}
              displayRelics={displayRelics}
              setTeamSelection={setTeamSelection}
            />
          </>}

          {!simScoringResult && <>
            <ShowcaseStatScore
              scoringResults={scoringResults}
            />

            <ShowcaseLightConeLarge
              source={source}
              character={character}
              showcaseMetadata={showcaseMetadata}
              displayDimensions={displayDimensions}
              setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
              setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
              setCharacterModalAdd={setCharacterModalAdd}
            />
          </>}
        </Flex>

        <ShowcaseRelicsPanel
          setSelectedRelic={setSelectedRelic}
          setEditModalOpen={setEditModalOpen}
          setAddModalOpen={setAddModalOpen}
          displayRelics={displayRelics}
          source={source}
          characterId={showcaseMetadata.characterId}
          scoredRelics={scoredRelics}
        />
      </Flex>

      {source != ShowcaseSource.BUILDS_MODAL &&
        <ShowcaseBuildAnalysis
          token={token}
          simScoringResult={simScoringResult as SimulationScore}
          combatScoreDetails={combatScoreDetails}
          showcaseMetadata={showcaseMetadata}
          scoringType={scoringType}
          setScoringType={setScoringType}
          setCombatScoreDetails={setCombatScoreDetails}
        />
      }
    </Flex>
  )
}
