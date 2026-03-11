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
import { computeShowcaseDerivedData } from 'lib/characterPreview/useShowcaseDerivedData'
import {
  Parts,
} from 'lib/constants/constants'
import {
  defaultGap,
  middleColumnWidth,
  parentH,
} from 'lib/constants/constantsUi'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import RelicModal from 'lib/overlays/modals/RelicModal'

import { ScoringType } from 'lib/scoring/simScoringUtils'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import { AppPages } from 'lib/constants/appPages'
import {
  showcaseBackgroundColor,
  showcaseTransition,
} from 'lib/utils/colorUtils'
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

export function CharacterPreview(props: CharacterPreviewProps) {
  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    savedBuildOverride,
  } = props

  const mantineTheme = useMantineTheme()

  const state = useCharacterPreviewState(source, character, savedBuildOverride)

  // Hooks must be called unconditionally before early return to satisfy Rules of Hooks
  if (!character
    || (state.activeKey != AppPages.CHARACTERS && state.activeKey != AppPages.SHOWCASE && state.activeKey != AppPages.OPTIMIZER)
    || (source === ShowcaseSource.CHARACTER_TAB && state.activeKey === AppPages.OPTIMIZER)) {
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

  const { scoringResults, displayRelics } = state.previewRelics!
  const scoredRelics = scoringResults.relics || []

  // ===== Derived data (simulation, portrait, color, theme, display) =====

  const derived = computeShowcaseDerivedData({
    character,
    prevCharId: state.prevCharId,
    prevSeedColor: state.prevSeedColor,
    teamSelectionByCharacter: state.teamSelectionByCharacter,
    showcaseTemporaryOptionsByCharacter: state.showcaseTemporaryOptionsByCharacter,
    globalShowcasePreferences: state.globalShowcasePreferences,
    displayRelics,
    storedScoringType: state.storedScoringType,
    colorMode: state.colorMode,
    darkMode: state.darkMode,
    savedBuildOverride,
  })

  const {
    showcaseMetadata,
    currentSelection,
    asyncSimScoringExecution,
    scoringType,
    portraitToUse,
    portraitUrl,
    overrideColorMode,
    derivedShowcaseTheme,
    displayDimensions,
    artistName,
  } = derived

  const yOffset = 0
  const zoom = 150

  return (
    <Flex direction="column" style={{ width: source == ShowcaseSource.BUILDS_MODAL ? 1076 : 1068, minHeight: source == ShowcaseSource.BUILDS_MODAL ? 850 : 2000 }}>
      {source !== ShowcaseSource.BUILDS_MODAL && (
        <RelicModal
          selectedRelic={state.selectedRelic}
          selectedPart={state.selectedPart}
          onOk={state.onRelicModalOk}
          setOpen={state.setRelicModalOpen}
          open={state.relicModalOpen}
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
        ref={state.sidebarRef}
        source={source}
        id={props.id}
        characterId={character.id}
        asyncSimScoringExecution={asyncSimScoringExecution}
        showcasePreferences={derived.characterShowcasePreferences}
        scoringType={scoringType}
        seedColor={derived.overrideSeedColor}
        setSeedColor={state.setSeedColor}
        colorMode={overrideColorMode}
        setColorMode={state.setColorMode}
      />

      {/* Showcase full card */}
      <Flex
        id={props.id}
        className='characterPreview'
        style={{
          position: 'relative',
          display: character ? 'flex' : 'none',
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
        <Flex direction="column" gap={8} className='character-build-portrait'>
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
              finalStats={state.finalStats!}
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
                  setRedrawTeammates={state.setRedrawTeammates}
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
        asyncSimScoringExecution={asyncSimScoringExecution}
      />

      {/* Showcase analysis footer */}
      {source != ShowcaseSource.BUILDS_MODAL && (
        <ShowcaseBuildAnalysis
          asyncSimScoringExecution={asyncSimScoringExecution}
          showcaseMetadata={showcaseMetadata}
          scoringType={state.storedScoringType}
          displayRelics={displayRelics}
          setScoringType={state.setScoringType}
        />
      )}
    </Flex>
  )
}

injectBenchmarkDebuggers()
