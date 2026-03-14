import { Flex, useMantineTheme } from '@mantine/core'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/ShowcaseCharacterHeader'
import ShowcaseCustomizationSidebar from 'lib/characterPreview/ShowcaseCustomizationSidebar'
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
import { useCharacterPreviewState } from 'lib/characterPreview/useCharacterPreviewState'
import { computeShowcaseVisualData } from 'lib/characterPreview/useShowcaseDerivedData'
import {
  Parts,
} from 'lib/constants/constants'
import {
  defaultGap,
  middleColumnWidth,
  parentH,
} from 'lib/constants/constantsUi'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  computeScoringCacheKey,
  requestScore,
} from 'lib/scoring/scoringService'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useScoringExecution } from 'lib/scoring/useScoringExecution'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import { AppPages } from 'lib/constants/appPages'
import {
  showcaseBackgroundColor,
  showcaseTransition,
} from 'lib/utils/colorUtils'
import {
  memo,
  useEffect,
  useMemo,
} from 'react'
import {
  Character,
  SavedBuild,
} from 'types/character'
import {
  CustomImagePayload,
} from 'types/customImage'

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

export function CharacterPreview({
  character,
  ...rest
}: CharacterPreviewProps) {
  if (!character) {
    return (
      <div
        style={{
          height: parentH,
          width: 1068,
          borderRadius: 8,
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--mantine-color-dark-7)',
        }}
      />
    )
  }

  return <CharacterPreviewInner character={character} {...rest} />
}

type CharacterPreviewInnerProps = Omit<CharacterPreviewProps, 'character'> & { character: Character }

const CharacterPreviewInner = memo(function CharacterPreviewInner({
  source,
  character,
  setOriginalCharacterModalOpen,
  setOriginalCharacterModalInitialCharacter,
  savedBuildOverride,
  id,
}: CharacterPreviewInnerProps) {

  const mantineTheme = useMantineTheme()

  const state = useCharacterPreviewState(source, character, savedBuildOverride)

  // ===== Relics =====

  const { scoringResults, displayRelics } = state.previewRelics!
  const scoredRelics = scoringResults.relics || []

  // ===== Visual data (memoized, no side effects) =====
  // prevSeedColor.current is intentionally read during render — it represents the previous frame's value.
  // The ref is updated in a useEffect below, so it changes identity after this memoization runs.

  const visualData = useMemo(
    () => computeShowcaseVisualData({
      character,
      prevSeedColor: state.prevSeedColor.current,
      teamSelectionByCharacter: state.teamSelectionByCharacter,
      globalShowcasePreferences: state.globalShowcasePreferences,
      storedScoringType: state.storedScoringType,
      colorMode: state.colorMode,
      darkMode: state.darkMode,
      savedBuildOverride,
    }),
    [character, state.teamSelectionByCharacter, state.globalShowcasePreferences,
     state.storedScoringType, state.colorMode, state.darkMode, savedBuildOverride],
  )

  const {
    showcaseMetadata,
    currentSelection,
    scoringType,
    portraitToUse,
    portraitUrl,
    overrideColorMode,
    derivedShowcaseTheme,
    displayDimensions,
    artistName,
  } = visualData

  // --- Ref side effects (isolated in effects) ---
  useEffect(() => { state.prevCharId.current = character.id }, [character.id])
  useEffect(() => { state.prevSeedColor.current = visualData.overrideSeedColor }, [visualData.overrideSeedColor])

  // --- Scoring (useSyncExternalStore for cache reads, effect for cache misses) ---
  const cacheKey = useMemo(
    () => computeScoringCacheKey(
      character, currentSelection, displayRelics as SingleRelicByPart,
      state.showcaseTemporaryOptionsByCharacter[character.id] ?? {},
      savedBuildOverride,
    ),
    [character, currentSelection, displayRelics, state.showcaseTemporaryOptionsByCharacter, savedBuildOverride],
  )

  const requestFn = useMemo(() => {
    if (!cacheKey || !visualData.simulationMetadata) return null
    return () => requestScore(
      cacheKey, character, visualData.simulationMetadata!,
      displayRelics as SingleRelicByPart,
      state.showcaseTemporaryOptionsByCharacter[character.id] ?? {},
    )
    // cacheKey is a content hash of all scoring inputs — sufficient proxy for deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  const { done: scoringDone, result: scoringResult } = useScoringExecution(cacheKey, requestFn)

  const yOffset = 0
  const zoom = 150

  return (
    <Flex direction="column" style={{ width: source === ShowcaseSource.BUILDS_MODAL ? 1076 : 1068, minHeight: source === ShowcaseSource.BUILDS_MODAL ? 850 : 2000 }}>
      {
        /*
        Will only render (<></>) if source == ShowcaseSource.BUILDS_MODAL
        It still needs to be mounted in order to provide colour to the build modals opened from the optimizer tab
      */
      }
      <ShowcaseCustomizationSidebar
        ref={state.sidebarRef}
        source={source}
        id={id}
        characterId={character.id}
        scoringResult={scoringResult}
        showcasePreferences={visualData.characterShowcasePreferences}
        scoringType={scoringType}
        seedColor={visualData.overrideSeedColor}
        setSeedColor={state.setSeedColor}
        colorMode={overrideColorMode}
        setColorMode={state.setColorMode}
      />

      {/* Showcase full card */}
      <Flex
        id={id}
        className='characterPreview'
        style={{
          position: 'relative',
          display: 'flex',
          height: parentH,
          background: showcaseBackgroundColor(mantineTheme.colors.dark[8], state.darkMode),
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
            filter: `blur(18px) brightness(${state.darkMode ? 0.50 : 0.70}) saturate(${state.darkMode ? 0.80 : 0.80})`,
            WebkitFilter: `blur(18px) brightness(${state.darkMode ? 0.50 : 0.70}) saturate(${state.darkMode ? 0.80 : 0.80})`,
          }}
        />

        {/* Portrait left panel */}
        <Flex direction="column" gap={8} className='character-build-portrait' style={{ zIndex: 1 }}>
          <ShowcasePortrait
            source={source}
            character={character}
            scoringType={scoringType}
            displayDimensions={displayDimensions}
            customPortrait={portraitToUse}
            editPortraitModalOpen={state.editPortraitModalOpen}
            setEditPortraitModalOpen={state.setEditPortraitModalOpen}
            onEditPortraitOk={(payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, state.setCustomPortrait, state.setEditPortraitModalOpen)}
            artistName={artistName}
            setOriginalCharacterModalInitialCharacter={(character) => setOriginalCharacterModalInitialCharacter?.(character)}
            setOriginalCharacterModalOpen={(open) => setOriginalCharacterModalOpen?.(open)}
            onPortraitLoad={(img: string) => state.sidebarRef.current?.onPortraitLoad!(img, character.id)}
          />

          {scoringType === ScoringType.COMBAT_SCORE && (
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
        <Flex direction="column" justify='space-between' gap={8}>
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
              finalStats={state.finalStats!}
              elementalDmgValue={showcaseMetadata.elementalDmgType}
              scoringType={scoringType}
              scoringDone={scoringDone}
              scoringResult={scoringResult}
            />

            {scoringType === ScoringType.COMBAT_SCORE && (
              <>
                <ShowcaseDpsScoreHeader scoringDone={scoringDone} scoringResult={scoringResult} relics={displayRelics} />

                <ShowcaseDpsScorePanel
                  characterId={showcaseMetadata.characterId}
                  scoringDone={scoringDone}
                  scoringResult={scoringResult}
                  teamSelection={currentSelection}
                  displayRelics={displayRelics}
                  setRedrawTeammates={state.setRedrawTeammates}
                  source={source}
                />

                <ShowcaseCombatScoreDetailsFooter scoringDone={scoringDone} scoringResult={scoringResult} />
              </>
            )}

            {scoringType !== ScoringType.COMBAT_SCORE && (
              <>
                {scoringType !== ScoringType.NONE && (
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

          {scoringType !== ScoringType.COMBAT_SCORE && (
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
          setSelectedRelic={state.setSelectedRelic}
          setEditModalOpen={state.setEditModalOpen}
          setAddModalOpen={state.setAddModalOpen}
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
        scoringResult={scoringResult}
      />

      {/* Showcase analysis footer */}
      {source !== ShowcaseSource.BUILDS_MODAL && (
        <ShowcaseBuildAnalysis
          scoringDone={scoringDone}
          scoringResult={scoringResult}
          showcaseMetadata={showcaseMetadata}
          scoringType={state.storedScoringType}
          displayRelics={displayRelics}
          setScoringType={state.setScoringType}
        />
      )}
    </Flex>
  )
})

injectBenchmarkDebuggers()
