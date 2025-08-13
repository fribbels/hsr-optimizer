import {
  ConfigProvider,
  Flex,
  theme,
} from 'antd'
import getDesignToken from 'antd/lib/theme/getDesignToken'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getArtistName,
  getPreviewRelics,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  getShowcaseStats,
  handleTeamSelection,
  resolveScoringType,
  ShowcaseDisplayDimensions,
  showcaseOnAddOk,
  showcaseOnEditOk,
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/ShowcaseCharacterHeader'
import { DEFAULT_SHOWCASE_COLOR } from 'lib/characterPreview/showcaseCustomizationController'
import ShowcaseCustomizationSidebar, {
  defaultShowcasePreferences,
  getDefaultColor,
  getOverrideColorMode,
  ShowcaseCustomizationSidebarRef,
  standardShowcasePreferences,
  urlToColorCache,
} from 'lib/characterPreview/ShowcaseCustomizationSidebar'
import {
  ShowcaseCombatScoreDetailsFooter,
  ShowcaseDpsScoreHeader,
  ShowcaseDpsScorePanel,
} from 'lib/characterPreview/ShowcaseDpsScore'
import {
  ShowcaseLightConeLarge,
  ShowcaseLightConeLargeName,
  ShowcaseLightConeSmall,
} from 'lib/characterPreview/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import { ShowcaseStatScore } from 'lib/characterPreview/ShowcaseStatScore'
import {
  ShowcaseColorMode,
  Stats,
} from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  defaultGap,
  middleColumnWidth,
  parentH,
} from 'lib/constants/constantsUi'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { Assets } from 'lib/rendering/assets'

import { getShowcaseSimScoringExecution } from 'lib/scoring/dpsScore'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import DB, { AppPages } from 'lib/state/db'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import {
  colorTransparent,
  showcaseBackgroundColor,
  showcaseCardBackgroundColor,
  showcaseCardBorderColor,
  showcaseSegmentedColor,
  showcaseTransition,
} from 'lib/utils/colorUtils'
import Vibrant from 'node-vibrant'
import {
  useRef,
  useState,
} from 'react'
import { Character } from 'types/character'
import {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import { Relic } from 'types/relic'

const { useToken } = theme

export function CharacterPreview(props: {
  id: string,
  source: ShowcaseSource,
  character: Character | null,
  setOriginalCharacterModalOpen: (open: boolean) => void,
  setOriginalCharacterModalInitialCharacter: (character: Character) => void,
}) {
  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
  } = props

  const { token } = useToken()
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [relicModalOpen, setRelicModalOpen] = useState(false)
  const setEditModalOpen = (open: boolean) => setRelicModalOpen(open)
  const setAddModalOpen = (open: boolean) => {
    setSelectedRelic(null)
    setRelicModalOpen(open)
  }
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig>()
  const [teamSelectionByCharacter, setTeamSelectionByCharacter] = useState<Record<string, string>>({})

  const [storedScoringType, setScoringType] = useState(ScoringType.COMBAT_SCORE)
  const prevCharId = useRef<string>()
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
  const darkMode = window.store((s) => s.savedSession.showcaseDarkMode)

  // Using these to trigger updates on changes
  const refreshOnSpdValueChange = window.store((s) => !character ? undefined : s.scoringMetadataOverrides[character.id]?.stats?.[Stats.SPD])
  const refreshOnTraceChange = window.store((s) => !character ? undefined : s.scoringMetadataOverrides[character.id]?.traces)
  const refreshOnDeprioritizeBuffsChange = window.store((s) => !character ? undefined : s.scoringMetadataOverrides[character.id]?.simulation?.deprioritizeBuffs)
  const showcaseTemporaryOptionsByCharacter = window.store((s) => s.showcaseTemporaryOptionsByCharacter)

  const onRelicModalOk = (relic: Relic) => {
    if (selectedRelic) {
      showcaseOnEditOk(relic, selectedRelic, setSelectedRelic)
    } else {
      showcaseOnAddOk(relic, setSelectedRelic)
    }
  }

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
  const showcaseTemporaryOptions = showcaseTemporaryOptionsByCharacter[character.id]
  const asyncSimScoringExecution = getShowcaseSimScoringExecution(
    character,
    displayRelics,
    currentSelection,
    showcaseTemporaryOptions,
  )
  const scoringType = resolveScoringType(storedScoringType, asyncSimScoringExecution)

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
    ? (
      urlToColorCache[portraitUrl]
        ? (overrideColorMode == ShowcaseColorMode.AUTO)
          ? defaultColor
          : (characterShowcasePreferences.color ?? defaultColor)
        : prevSeedColor.current
    )
    : (
      (overrideColorMode == ShowcaseColorMode.AUTO)
        ? defaultColor
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
        itemSelectedBg: showcaseSegmentedColor(overrideSeedColor, darkMode),
      },
    },
  }

  const seedToken = getDesignToken(seedTheme)
  const derivedShowcaseTheme: ShowcaseTheme = {
    cardBackgroundColor: showcaseCardBackgroundColor(seedToken.colorPrimaryActive, darkMode),
    cardBorderColor: showcaseCardBorderColor(seedToken.colorPrimaryActive, darkMode),
  }

  // ===== Display =====

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, scoringType == ScoringType.COMBAT_SCORE)
  const artistName = getArtistName(character)
  const finalStats = getShowcaseStats(character, displayRelics, showcaseMetadata)

  return (
    <Flex vertical style={{ width: 1068, minHeight: source == ShowcaseSource.BUILDS_MODAL ? 850 : 2000 }}>
      <RelicModal
        selectedRelic={selectedRelic}
        onOk={onRelicModalOk}
        setOpen={setRelicModalOpen}
        open={relicModalOpen}
        defaultWearer={character.id}
      />
      <ShowcaseCustomizationSidebar
        ref={sidebarRef}
        source={source}
        id={props.id}
        characterId={character.id}
        asyncSimScoringExecution={asyncSimScoringExecution}
        token={seedToken}
        showcasePreferences={characterShowcasePreferences}
        scoringType={scoringType}
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
            background: showcaseBackgroundColor(token.colorBgLayout, darkMode),
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
              filter: `blur(20px) brightness(${darkMode ? 0.50 : 0.70}) saturate(${darkMode ? 0.80 : 0.80})`,
              WebkitFilter: `blur(20px) brightness(${darkMode ? 0.50 : 0.70}) saturate(${darkMode ? 0.80 : 0.80})`,
            }}
          />

          {/* Portrait left panel */}
          {source != ShowcaseSource.BUILDS_MODAL && (
            <Flex vertical gap={8} className='character-build-portrait'>
              <ShowcasePortrait
                source={source}
                character={character}
                scoringType={scoringType}
                displayDimensions={displayDimensions}
                customPortrait={portraitToUse}
                editPortraitModalOpen={editPortraitModalOpen}
                setEditPortraitModalOpen={setEditPortraitModalOpen}
                onEditPortraitOk={(payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, setCustomPortrait, setEditPortraitModalOpen)}
                artistName={artistName}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                onPortraitLoad={(img: string) => sidebarRef.current?.onPortraitLoad!(img, character.id)}
              />

              {scoringType == ScoringType.COMBAT_SCORE && (
                <ShowcaseLightConeSmall
                  source={source}
                  character={character}
                  showcaseMetadata={showcaseMetadata}
                  displayDimensions={displayDimensions}
                  setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                  setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                />
              )}
            </Flex>
          )}

          {/* Character details middle panel */}
          <Flex vertical justify='space-between' gap={8} style={{}}>
            <Flex
              vertical
              style={{
                width: middleColumnWidth,
                height: '100%',
                borderRadius: 8,
                zIndex: 10,
                backgroundColor: derivedShowcaseTheme.cardBackgroundColor,
                transition: showcaseTransition(),
                flex: 1,
                paddingRight: 2,
                paddingLeft: 2,
                paddingBottom: 3,
                boxShadow: showcaseShadow + showcaseShadowInsetAddition,
                border: `1px solid ${derivedShowcaseTheme.cardBorderColor}`,
              }}
              justify='space-between'
            >
              <ShowcaseCharacterHeader
                showcaseMetadata={showcaseMetadata}
                scoringType={scoringType}
              />

              <CharacterStatSummary
                characterId={character.id}
                finalStats={finalStats}
                elementalDmgValue={showcaseMetadata.elementalDmgType}
                scoringType={scoringType}
                asyncSimScoringExecution={asyncSimScoringExecution}
              />

              {scoringType == ScoringType.COMBAT_SCORE && (
                <>
                  <ShowcaseDpsScoreHeader asyncSimScoringExecution={asyncSimScoringExecution} relics={displayRelics} />

                  <ShowcaseDpsScorePanel
                    characterId={showcaseMetadata.characterId}
                    token={seedToken}
                    asyncSimScoringExecution={asyncSimScoringExecution}
                    teamSelection={currentSelection}
                    displayRelics={displayRelics}
                    setTeamSelectionByCharacter={wrappedSetTeamSelectionByCharacter}
                    setRedrawTeammates={setRedrawTeammates}
                  />

                  <ShowcaseCombatScoreDetailsFooter asyncSimScoringExecution={asyncSimScoringExecution} />
                </>
              )}

              {scoringType != ScoringType.COMBAT_SCORE && (
                <>
                  {scoringType != ScoringType.NONE && (
                    <ShowcaseStatScore
                      scoringResults={scoringResults}
                    />
                  )}

                  <ShowcaseLightConeLargeName
                    showcaseMetadata={showcaseMetadata}
                  />
                </>
              )}
            </Flex>

            {scoringType != ScoringType.COMBAT_SCORE && (
              <>
                <ShowcaseLightConeLarge
                  source={source}
                  character={character}
                  showcaseMetadata={showcaseMetadata}
                  displayDimensions={displayDimensions}
                  setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                  setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                />
              </>
            )}
          </Flex>

          {/* Relics right panel */}
          <ShowcaseRelicsPanel
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setEditModalOpen}
            setAddModalOpen={setAddModalOpen}
            displayRelics={displayRelics}
            source={source}
            scoringType={scoringType}
            characterId={showcaseMetadata.characterId}
            scoredRelics={scoredRelics}
            showcaseColors={derivedShowcaseTheme}
          />
        </Flex>
      </ConfigProvider>

      <CharacterAnnouncement characterId={showcaseMetadata.characterId} />

      {/* Showcase analysis footer */}
      {source != ShowcaseSource.BUILDS_MODAL && (
        <ShowcaseBuildAnalysis
          token={token}
          asyncSimScoringExecution={asyncSimScoringExecution}
          showcaseMetadata={showcaseMetadata}
          scoringType={storedScoringType}
          displayRelics={displayRelics}
          setScoringType={setScoringType}
        />
      )}
    </Flex>
  )
}

injectBenchmarkDebuggers()
