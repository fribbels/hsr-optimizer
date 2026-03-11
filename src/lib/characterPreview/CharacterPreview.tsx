import { Flex, useMantineTheme } from '@mantine/core'
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
  Parts,
  ShowcaseColorMode,
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

import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { getShowcaseSimScoringExecution } from 'lib/scoring/dpsScore'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import DB, { AppPages } from 'lib/state/db'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import {
  showcaseBackgroundColor,
  showcaseCardBackgroundColor,
  showcaseCardBorderColor,
  showcaseTransition,
} from 'lib/utils/colorUtils'
import {
  useMemo,
  useRef,
  useState,
} from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  Character,
  SavedBuild,
} from 'types/character'
import {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import { Relic } from 'types/relic'

interface InteractiveCharacterPreviewProps {
  setOriginalCharacterModalOpen: (open: boolean) => void
  setOriginalCharacterModalInitialCharacter: (character: Character) => void
  savedBuildOverride?: never
  source: Exclude<ShowcaseSource, ShowcaseSource.BUILDS_MODAL>
}

interface SavedBuildPreviewProps {
  setOriginalCharacterModalOpen?: never
  setOriginalCharacterModalInitialCharacter?: never
  savedBuildOverride: SavedBuild | null
  source: ShowcaseSource.BUILDS_MODAL
}

interface CharacterPreviewPropsBase {
  id: string
  character: Character | null
}

type CharacterPreviewProps = CharacterPreviewPropsBase & (SavedBuildPreviewProps | InteractiveCharacterPreviewProps)

export function CharacterPreview(props: CharacterPreviewProps) {
  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    savedBuildOverride,
  } = props

  const mantineTheme = useMantineTheme()
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [selectedPart, setSelectedPart] = useState<Parts | null>(null)
  const [relicModalOpen, setRelicModalOpen] = useState(false)
  const setEditModalOpen = (open: boolean) => setRelicModalOpen(open)
  const setAddModalOpen = (open: boolean, part: Parts) => {
    setSelectedPart(part)
    setSelectedRelic(null)
    setRelicModalOpen(open)
  }
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig>()

  const {
    teamSelectionByCharacter,
    globalShowcasePreferences,
    showcaseTemporaryOptionsByCharacter,
  } = window.store(
    useShallow((s) => ({
      teamSelectionByCharacter: s.showcaseTeamPreferenceById,
      globalShowcasePreferences: s.showcasePreferences,
      showcaseTemporaryOptionsByCharacter: s.showcaseTemporaryOptionsByCharacter,
    })),
  )

  // Task 2.7: Scope relicsById subscription to only the 6 equipped relic IDs
  const relicsById = window.store(useShallow((s) => {
    if (!character) return null
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope].filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  const [storedScoringType, setScoringType] = useState(window.store.getState().savedSession.scoringType)
  const prevCharId = useRef<string>()
  const prevSeedColor = useRef<string>(DEFAULT_SHOWCASE_COLOR)
  const [_redrawTeammates, setRedrawTeammates] = useState<number>(0)

  const sidebarRef = useRef<ShowcaseCustomizationSidebarRef>(null)
  const [seedColor, setSeedColor] = useState<string>(DEFAULT_SHOWCASE_COLOR)
  const [colorMode, setColorMode] = useState<ShowcaseColorMode>(
    window.store.getState().savedSession[SavedSessionKeys.showcaseStandardMode] ? ShowcaseColorMode.STANDARD : ShowcaseColorMode.AUTO,
  )
  const activeKey = window.store((s) => s.activeKey)
  const darkMode = window.store((s) => s.savedSession.showcaseDarkMode)

  // Using this to trigger updates on scoring metadata changes
  const scoringMetadata = useScoringMetadata(character?.id)

  // Hooks must be called unconditionally before early return to satisfy Rules of Hooks
  const previewRelics = useMemo(() => {
    if (!character || !relicsById) return null
    return getPreviewRelics(source, character, relicsById, savedBuildOverride)
  }, [source, character, relicsById, savedBuildOverride])

  const finalStats = useMemo(() => {
    if (!character || !previewRelics) return undefined
    const metadata = getShowcaseMetadata(character)
    return getShowcaseStats(character, previewRelics.displayRelics, metadata)
  }, [character, previewRelics])

  const onRelicModalOk = (relic: Relic) => {
    if (selectedRelic) {
      showcaseOnEditOk(relic, selectedRelic, setSelectedRelic)
    } else {
      showcaseOnAddOk(relic, setSelectedRelic)
    }
  }

  if (!character
    || (activeKey != AppPages.CHARACTERS && activeKey != AppPages.SHOWCASE && activeKey != AppPages.OPTIMIZER)
    || (source === ShowcaseSource.CHARACTER_TAB && activeKey === AppPages.OPTIMIZER)) {
    return (
      <div
        style={{
          height: parentH,
          width: 1068,
          borderRadius: 8,
          backgroundColor: mantineTheme.colors.dark[8],
          border: `1px solid ${mantineTheme.colors.dark[7]}`,
        }}
      />
    )
  }

  // ===== Relics =====

  const { scoringResults, displayRelics } = previewRelics!
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
    savedBuildOverride,
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

  const derivedShowcaseTheme: ShowcaseTheme = {
    cardBackgroundColor: showcaseCardBackgroundColor(overrideSeedColor, darkMode),
    cardBorderColor: showcaseCardBorderColor(overrideSeedColor, darkMode),
  }

  // ===== Display =====

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, scoringType == ScoringType.COMBAT_SCORE)
  const artistName = getArtistName(character)

  const yOffset = 0
  const zoom = 150

  return (
    <Flex direction="column" style={{ width: source == ShowcaseSource.BUILDS_MODAL ? 1076 : 1068, minHeight: source == ShowcaseSource.BUILDS_MODAL ? 850 : 2000 }}>
      {source !== ShowcaseSource.BUILDS_MODAL && (
        <RelicModal
          selectedRelic={selectedRelic}
          selectedPart={selectedPart}
          onOk={onRelicModalOk}
          setOpen={setRelicModalOpen}
          open={relicModalOpen}
          defaultWearer={character.id}
        />
      )}

      {
        /*
        Will only render (<></>) if source == ShowcaseSource.BUILDS_MODAL
        It still needs to be mounted in order to provide colour to the build modals opened from the optimizer tab
      */
      }
      <ShowcaseCustomizationSidebar
        ref={sidebarRef}
        source={source}
        id={props.id}
        characterId={character.id}
        asyncSimScoringExecution={asyncSimScoringExecution}
        showcasePreferences={characterShowcasePreferences}
        scoringType={scoringType}
        seedColor={overrideSeedColor}
        setSeedColor={setSeedColor}
        colorMode={overrideColorMode}
        setColorMode={setColorMode}
      />

      {/* Showcase full card */}
      <Flex
        id={props.id}
        className='characterPreview'
        style={{
          position: 'relative',
          display: character ? 'flex' : 'none',
          height: parentH,
          background: showcaseBackgroundColor(mantineTheme.colors.dark[8], darkMode),
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
            backgroundSize: `${zoom}%`,
            position: 'absolute',
            top: -yOffset,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            filter: `blur(18px) brightness(${darkMode ? 0.50 : 0.70}) saturate(${darkMode ? 0.80 : 0.80})`,
            WebkitFilter: `blur(18px) brightness(${darkMode ? 0.50 : 0.70}) saturate(${darkMode ? 0.80 : 0.80})`,
          }}
        />

        {/* Portrait left panel */}
        <Flex direction="column" gap={8} className='character-build-portrait'>
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
            setOriginalCharacterModalInitialCharacter={(character) => setOriginalCharacterModalInitialCharacter?.(character)}
            setOriginalCharacterModalOpen={(open) => setOriginalCharacterModalOpen?.(open)}
            onPortraitLoad={(img: string) => sidebarRef.current?.onPortraitLoad!(img, character.id)}
          />

          {scoringType == ScoringType.COMBAT_SCORE && (
            <ShowcaseLightConeSmall
              character={character}
              showcaseMetadata={showcaseMetadata}
              displayDimensions={displayDimensions}
              setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
              setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            />
          )}
        </Flex>

        {/* Character details middle panel */}
        <Flex direction="column" justify='space-between' gap={8} style={{}}>
          <Flex
            direction="column"
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
              finalStats={finalStats!}
              elementalDmgValue={showcaseMetadata.elementalDmgType}
              scoringType={scoringType}
              asyncSimScoringExecution={asyncSimScoringExecution}
            />

            {scoringType == ScoringType.COMBAT_SCORE && (
              <>
                <ShowcaseDpsScoreHeader asyncSimScoringExecution={asyncSimScoringExecution} relics={displayRelics} />

                <ShowcaseDpsScorePanel
                  characterId={showcaseMetadata.characterId}
                  asyncSimScoringExecution={asyncSimScoringExecution}
                  teamSelection={currentSelection}
                  displayRelics={displayRelics}
                  setRedrawTeammates={setRedrawTeammates}
                  source={source}
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
            <ShowcaseLightConeLarge
              character={character}
              showcaseMetadata={showcaseMetadata}
              displayDimensions={displayDimensions}
              setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
              setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            />
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

      <CharacterAnnouncement
        characterId={showcaseMetadata.characterId}
        asyncSimScoringExecution={asyncSimScoringExecution}
      />

      {/* Showcase analysis footer */}
      {source != ShowcaseSource.BUILDS_MODAL && (
        <ShowcaseBuildAnalysis
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
