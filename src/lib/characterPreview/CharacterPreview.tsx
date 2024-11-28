import { ConfigProvider, Flex, theme } from 'antd'
import getDesignToken from 'antd/lib/theme/getDesignToken'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getArtistName,
  getPreviewRelics,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  getShowcaseSimScoringResult,
  getShowcaseStats,
  handleTeamSelection,
  ShowcaseDisplayDimensions,
  showcaseOnAddOk,
  showcaseOnEditOk,
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { MemoizedShowcaseBuildAnalysis } from 'lib/characterPreview/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/ShowcaseCharacterHeader'
import { DEFAULT_SHOWCASE_COLOR } from 'lib/characterPreview/showcaseCustomizationController'
import {
  defaultShowcasePreferences,
  getDefaultColor,
  getOverrideColorMode,
  ShowcaseCustomizationSidebar,
  ShowcaseCustomizationSidebarRef,
  standardShowcasePreferences,
  urlToColorCache,
} from 'lib/characterPreview/ShowcaseCustomizationSidebar'
import { ShowcaseCombatScoreDetailsFooter, ShowcaseDpsScoreHeader, ShowcaseDpsScorePanel } from 'lib/characterPreview/ShowcaseDpsScore'
import { ShowcaseLightConeLarge, ShowcaseLightConeLargeName, ShowcaseLightConeSmall } from 'lib/characterPreview/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import { ShowcaseStatScore } from 'lib/characterPreview/ShowcaseStatScore'
import { COMBAT_STATS, ShowcaseColorMode, SIMULATION_SCORE } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { defaultGap, middleColumnWidth, parentH } from 'lib/constants/constantsUi'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/characterScorer'
import DB, { AppPages } from 'lib/state/db'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { colorTransparent, showcaseBackgroundColor, showcaseCardBackgroundColor, showcaseCardBorderColor, showcaseSegmentedColor, showcaseTransition } from 'lib/utils/colorUtils'
import Vibrant from 'node-vibrant'
import React, { useRef, useState } from 'react'
import { Character } from 'types/character'
import { CustomImageConfig, CustomImagePayload } from 'types/customImage'
import { Relic } from 'types/relic'

const { useToken } = theme

// @ts-ignore
window.Vibrant = Vibrant

export function CharacterPreview(props: {
  id: string
  source: ShowcaseSource
  character: Character
  setOriginalCharacterModalOpen: (open: boolean) => void
  setOriginalCharacterModalInitialCharacter: (character: Character) => void
  setCharacterModalAdd: (add: boolean) => void
}) {
  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    setCharacterModalAdd,
  } = props

  const { token } = useToken()
  const [selectedRelic, setSelectedRelic] = useState<Relic | undefined>()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig | undefined>()
  const [teamSelectionByCharacter, setTeamSelectionByCharacter] = useState<Record<string, string>>({})

  const [scoringType, setScoringType] = useState(SIMULATION_SCORE)
  const [combatScoreDetails, setCombatScoreDetails] = useState(COMBAT_STATS)
  const prevCharId = useRef<string | undefined>()
  const prevSeedColor = useRef<string>(DEFAULT_SHOWCASE_COLOR)
  const relicsById = window.store((s) => s.relicsById)
  const [_redrawTeammates, setRedrawTeammates] = useState<number>(0)
  const globalShowcasePreferences = window.store((s) => s.showcasePreferences)

  const sidebarRef = useRef<ShowcaseCustomizationSidebarRef>(null)
  const [seedColor, setSeedColor] = useState<string>(DEFAULT_SHOWCASE_COLOR)
  const [colorMode, setColorMode] = useState<ShowcaseColorMode>(
    window.store.getState().savedSession[SavedSessionKeys.showcaseStandardMode] ? ShowcaseColorMode.STANDARD : ShowcaseColorMode.AUTO,
  )
  const activeKey = window.store((s) => s.activeKey)

  if (!character || (activeKey != AppPages.CHARACTERS && activeKey != AppPages.SHOWCASE)) {
    return (
      <div
        style={{
          height: parentH,
          width: 1068,
          borderRadius: 8,
          backgroundColor: token.colorBgLayout,
          border: `1px solid ${token.colorBgContainer}`,
        }}
      />
    )
  }

  console.log('======================================================================= RENDER CharacterPreview', source)

  function wrappedSetTeamSelectionByCharacter(update: Record<string, string>) {
    setTeamSelectionByCharacter({
      ...teamSelectionByCharacter,
      ...update,
    })
  }

  // ===== Relics =====

  const { scoringResults, displayRelics } = getPreviewRelics(source, character, relicsById)
  const scoredRelics = scoringResults.relics || []

  const showcaseMetadata = getShowcaseMetadata(character)

  // ===== Simulation =====

  const currentSelection = handleTeamSelection(character, prevCharId, teamSelectionByCharacter)
  const simScoringResult = getShowcaseSimScoringResult(
    character,
    displayRelics,
    scoringType,
    currentSelection,
    showcaseMetadata,
  )

  // ===== Portrait =====

  const portraitToUse = DB.getCharacterById(character?.id)?.portrait ?? undefined
  const portraitUrl = portraitToUse?.imageUrl ?? Assets.getCharacterPortraitById(character.id)

  // ===== Color =====

  const defaultColor = getDefaultColor(character.id, portraitUrl, colorMode)

  const characterShowcasePreferences = colorMode == ShowcaseColorMode.STANDARD
    ? standardShowcasePreferences()
    : globalShowcasePreferences[character.id] ?? defaultShowcasePreferences(defaultColor)

  const overrideColorMode = getOverrideColorMode(colorMode, globalShowcasePreferences, character)

  const overrideSeedColor = portraitToUse
    ?
    (
      urlToColorCache[portraitUrl]
        ? (overrideColorMode == ShowcaseColorMode.AUTO)
          ? (defaultColor)
          : (characterShowcasePreferences.color ?? defaultColor)
        : prevSeedColor.current
    )
    :
    (
      (overrideColorMode == ShowcaseColorMode.AUTO)
        ? (defaultColor)
        : (characterShowcasePreferences.color ?? defaultColor)
    )

  prevSeedColor.current = overrideSeedColor

  // ===== Theme =====

  const seedTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgLayout: overrideSeedColor,
      colorPrimary: overrideSeedColor,
    },
    components: {
      Segmented: {
        trackBg: colorTransparent(),
        itemSelectedBg: showcaseSegmentedColor(overrideSeedColor),
      },
    },
  }

  const seedToken = getDesignToken(seedTheme)
  const derivedShowcaseTheme: ShowcaseTheme = {
    cardBackgroundColor: showcaseCardBackgroundColor(seedToken.colorPrimaryActive),
    cardBorderColor: showcaseCardBorderColor(seedToken.colorPrimaryActive),
  }

  // ===== Display =====

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, Boolean(simScoringResult))
  const artistName = getArtistName(character)
  const finalStats = getShowcaseStats(character, displayRelics, showcaseMetadata)

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
      <ShowcaseCustomizationSidebar
        ref={sidebarRef}
        id={props.id}
        characterId={character.id}
        token={seedToken}
        showcasePreferences={characterShowcasePreferences}
        setOverrideTheme={() => {
        }}
        seedColor={overrideSeedColor}
        setSeedColor={setSeedColor}
        colorMode={overrideColorMode}
        setColorMode={setColorMode}
      />

      <ConfigProvider theme={seedTheme}>

        {/* Showcase full card */}
        <Flex
          id={props.id}
          className='characterPreview'
          style={{
            position: 'relative',
            display: character ? 'flex' : 'none',
            height: parentH,
            background: showcaseBackgroundColor(token.colorBgLayout),
            backgroundBlendMode: 'screen',
            overflow: 'hidden',
            borderRadius: 7,
            transition: showcaseTransition(),
          }}
          gap={defaultGap}
        >

          {/* Background */}
          <div
            style={{
              backgroundImage: `url(${portraitUrl})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '150%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              filter: 'blur(20px) brightness(0.75) saturate(0.8)',
              WebkitFilter: 'blur(20px) brightness(0.75) saturate(0.8)',
            }}
          />

          {/* Portrait left panel */}
          {source != ShowcaseSource.BUILDS_MODAL &&
            <Flex vertical gap={12} className='character-build-portrait'>
              <ShowcasePortrait
                source={source}
                character={character}
                displayDimensions={displayDimensions}
                customPortrait={portraitToUse}
                editPortraitModalOpen={editPortraitModalOpen}
                setEditPortraitModalOpen={setEditPortraitModalOpen}
                onEditPortraitOk={(payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, setCustomPortrait, setEditPortraitModalOpen)}
                simScoringResult={simScoringResult as SimulationScore}
                artistName={artistName}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setCharacterModalAdd={setCharacterModalAdd}
                onPortraitLoad={(img: string) => sidebarRef.current?.onPortraitLoad!(img, character.id)}
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

          {/* Character details middle panel */}
          <Flex vertical justify='space-between' gap={8}>
            <Flex
              vertical
              style={{
                width: middleColumnWidth,
                height: '100%',
                border: `1px solid ${derivedShowcaseTheme.cardBorderColor}`,
                borderRadius: 8,
                zIndex: 1,
                backgroundColor: derivedShowcaseTheme.cardBackgroundColor,
                transition: showcaseTransition(),
                flex: 1,
                paddingRight: 2,
                paddingLeft: 2,
                paddingBottom: 3,
              }}
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
                <ShowcaseDpsScoreHeader result={simScoringResult} relics={displayRelics}/>

                <ShowcaseDpsScorePanel
                  characterId={showcaseMetadata.characterId}
                  token={seedToken}
                  simScoringResult={simScoringResult}
                  teamSelection={currentSelection}
                  combatScoreDetails={combatScoreDetails}
                  displayRelics={displayRelics}
                  setTeamSelectionByCharacter={wrappedSetTeamSelectionByCharacter}
                  setRedrawTeammates={setRedrawTeammates}
                />

                <ShowcaseCombatScoreDetailsFooter combatScoreDetails={combatScoreDetails} simScoringResult={simScoringResult}/>
              </>}

              {!simScoringResult && <>
                <ShowcaseStatScore
                  scoringResults={scoringResults}
                />

                <ShowcaseLightConeLargeName
                  showcaseMetadata={showcaseMetadata}
                />
              </>}
            </Flex>

            {!simScoringResult && <>
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

          {/* Relics right panel */}
          <ShowcaseRelicsPanel
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setEditModalOpen}
            setAddModalOpen={setAddModalOpen}
            displayRelics={displayRelics}
            source={source}
            characterId={showcaseMetadata.characterId}
            scoredRelics={scoredRelics}
            showcaseColors={derivedShowcaseTheme}
          />
        </Flex>
      </ConfigProvider>

      {/* Showcase analysis footer */}
      {source != ShowcaseSource.BUILDS_MODAL &&
        <MemoizedShowcaseBuildAnalysis
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
