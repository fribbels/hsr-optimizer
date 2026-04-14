import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/card/ShowcaseCharacterHeader'
import {
  ShowcaseLightConeLarge,
  ShowcaseLightConeLargeName,
  ShowcaseLightConeSmall,
} from 'lib/characterPreview/card/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/card/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/card/ShowcaseRelicsPanel'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  ShowcaseSource,
  showcaseTransition,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { extractPaletteInWorker } from 'lib/characterPreview/color/colorExtractionService'
import { DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import type { ColorPipelineConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { withAlpha } from 'lib/characterPreview/color/colorUtils'
import {
  modifyCustomColor,
  organizeColors,
  pickBestSeed,
} from 'lib/characterPreview/color/colorUtils'
import {
  resolveShowcaseColor,
  resolveShowcaseTheme,
} from 'lib/characterPreview/color/showcaseColorService'
import { ShowcaseCustomizationSidebar } from 'lib/characterPreview/customization/ShowcaseCustomizationSidebar'
import { useDebugPanelConfig } from 'lib/characterPreview/debugPanelConfig'
import { DebugSliderPanel } from 'lib/characterPreview/DebugSliderPanel'
import {
  CARD_BG_ALPHA_DEFAULT,
  type DebugVisualConfig,
  INSET_BLUR,
  INSET_OPACITY,
  PORTRAIT_BLUR,
  PORTRAIT_BRIGHTNESS,
  PORTRAIT_SATURATE,
  SHADOW_BLUR,
  SHADOW_OPACITY,
  SHADOW_X,
  SHADOW_Y,
  TEXT_SHADOW_DEFAULT,
  useDebugVisualConfigStore,
} from 'lib/characterPreview/debugVisualConfigStore'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/scoring/ShowcaseBuildAnalysis'
import {
  ShowcaseCombatScoreDetailsFooter,
  ShowcaseDpsScoreHeader,
  ShowcaseDpsScorePanel,
} from 'lib/characterPreview/scoring/ShowcaseDpsScore'
import { ShowcaseStatScore } from 'lib/characterPreview/scoring/ShowcaseStatScore'
import { resolveShowcaseLayout } from 'lib/characterPreview/showcaseDerivedData'
import { useCharacterPreviewState } from 'lib/characterPreview/useCharacterPreviewState'
import { type BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  cardTotalW,
  defaultGap,
  middleColumnWidth,
  parentH,
} from 'lib/constants/constantsUi'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import type { RelicScoringResult } from 'lib/relics/scoring/types'
import { Assets } from 'lib/rendering/assets'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { DeferReveal } from 'lib/ui/DeferredRender'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  type Character,
  type CharacterId,
  type SavedBuild,
} from 'types/character'
import type {
  CustomImageConfig,
  CustomImagePayload,
} from 'types/customImage'
import type { ShowcaseTemporaryOptions } from 'types/metadata'
import {
  ScoringSelector,
  SimScoringContextProvider,
  useSimScoringContext,
} from './SimScoringContext'

const EMPTY_SWATCHES: string[] = []
const EMPTY_OPTIONS: ShowcaseTemporaryOptions = {}
const EMPTY_SCORED: RelicScoringResult[] = []

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
  character: Character | ShowcaseTabCharacter | null
  /** Debug mode: disables L2D, forces stat score, hides analysis footer */
  forceDebug?: boolean
  /** Override debug visual config (for shared debug panel across multiple cards) */
  debugVisualConfig?: DebugVisualConfig
}

type CharacterPreviewProps = CharacterPreviewPropsBase & (SavedBuildPreviewProps | InteractiveCharacterPreviewProps)

globalThis.CARD_DEBUG = false

function buildPortraitFilter(blur: number, brightness: number, saturate: number) {
  return `blur(${blur}px) brightness(${brightness.toFixed(2)}) saturate(${saturate.toFixed(2)})`
}

function buildShadow(x: number, y: number, blur: number, opacity: number) {
  return `rgba(0, 0, 0, ${opacity.toFixed(2)}) ${x}px ${y}px ${blur}px`
}

function buildInsetShadow(blur: number, opacity: number) {
  return `, inset rgba(255, 255, 255, ${opacity.toFixed(2)}) 0px 0px ${blur}px`
}

/** Blurred portrait background fill behind the card */
function ShowcaseBackgroundBlur({
  portraitUrl,
  portraitToUse,
  displayDimensions,
  portraitFilter,
  blendMode,
}: {
  portraitUrl: string,
  portraitToUse: CustomImageConfig | undefined,
  displayDimensions: { charCenter: { x: number, y: number, z: number } },
  portraitFilter: string,
  blendMode: 'screen' | 'normal',
}) {
  let bgSize: string
  let bgPos: string

  if (portraitToUse) {
    // Custom portrait: CSS cover guarantees no visible edges,
    // percentage position centers on the crop focal point
    const crop = portraitToUse.customImageParams.croppedAreaPixels
    const origW = portraitToUse.originalDimensions.width
    const origH = portraitToUse.originalDimensions.height
    bgSize = 'cover'
    if (origW > 0 && origH > 0) {
      const pctX = (crop.x + crop.width / 2) / origW * 100
      const pctY = (crop.y + crop.height / 2) / origH * 100
      bgPos = `${pctX}% ${pctY}%`
    } else {
      bgPos = 'center'
    }
  } else {
    // Default portrait: pixel positioning using curated charCenter values
    const bgZoom = displayDimensions.charCenter.z * 1.75
    const bgScale = bgZoom / 2 * cardTotalW / 1024
    bgSize = `${cardTotalW * bgZoom}px auto`
    bgPos = `${-displayDimensions.charCenter.x * bgScale + cardTotalW / 2}px ${-displayDimensions.charCenter.y * bgScale + parentH / 2}px`
  }

  return (
    <div
      data-portrait-bg
      style={{
        backgroundImage: `url(${portraitUrl})`,
        backgroundPosition: bgPos,
        backgroundRepeat: 'no-repeat',
        backgroundSize: bgSize,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        filter: portraitFilter,
        WebkitFilter: portraitFilter,
        mixBlendMode: blendMode,
      }}
    />
  )
}

/** Resolve debug visual config with defaults - single source of truth for fallback values */
function resolveDebugVisualConfig(config: DebugVisualConfig | undefined) {
  return {
    portraitBlur: config?.portraitBlur ?? PORTRAIT_BLUR,
    portraitBrightness: config?.portraitBrightness ?? PORTRAIT_BRIGHTNESS,
    portraitSaturate: config?.portraitSaturate ?? PORTRAIT_SATURATE,
    cardBgAlpha: config?.cardBgAlpha ?? CARD_BG_ALPHA_DEFAULT,
    debugMaxC: config?.debugMaxC ?? DEFAULT_CONFIG.cardBg.maxC,
    debugMinC: config?.debugMinC ?? DEFAULT_CONFIG.cardBg.minC,
    debugChromaScale: config?.debugChromaScale ?? DEFAULT_CONFIG.cardBg.chromaScale,
    debugTargetL: config?.debugTargetL ?? DEFAULT_CONFIG.cardBg.targetL,
    debugMinL: config?.debugMinL ?? DEFAULT_CONFIG.cardBg.minL,
    debugMaxL: config?.debugMaxL ?? DEFAULT_CONFIG.cardBg.maxL,
    blendMode: config?.blendMode ?? 'normal' as const,
    shadowX: config?.shadowX ?? SHADOW_X,
    shadowY: config?.shadowY ?? SHADOW_Y,
    shadowBlur: config?.shadowBlur ?? SHADOW_BLUR,
    shadowOpacity: config?.shadowOpacity ?? SHADOW_OPACITY,
    insetBlur: config?.insetBlur ?? INSET_BLUR,
    insetOpacity: config?.insetOpacity ?? INSET_OPACITY,
    textShadow: config?.textShadow ?? TEXT_SHADOW_DEFAULT,
  }
}

export function CharacterPreview({
  character,
  forceDebug,
  debugVisualConfig,
  ...rest
}: CharacterPreviewProps) {
  if (!character) {
    return (
      <div
        style={{
          height: parentH,
          width: cardTotalW,
          borderRadius: 6,
          backgroundColor: 'var(--layer-0)',
          border: '1px solid var(--layer-0)',
        }}
      />
    )
  }

  // Development debug mode: subscribe to store and show panel
  // Only when CARD_DEBUG is on AND no external config is provided AND not in forceDebug mode
  if (globalThis.CARD_DEBUG && !debugVisualConfig && !forceDebug) {
    return <CharacterPreviewWithDebug character={character} forceDebug={forceDebug} {...rest} />
  }

  return <CharacterPreviewInner character={character} forceDebug={forceDebug} debugVisualConfig={debugVisualConfig} {...rest} />
}

/** Wrapper that subscribes to debug store and renders panel - only used when CARD_DEBUG */
function CharacterPreviewWithDebug(props: Omit<CharacterPreviewProps, 'debugVisualConfig'> & { character: Character | ShowcaseTabCharacter }) {
  const debugConfig = useDebugVisualConfigStore()
  const { savedPresetGroups, pillGroups, groups } = useDebugPanelConfig()

  return (
    <>
      <DebugSliderPanel
        savedPresetGroups={savedPresetGroups}
        pillGroups={pillGroups}
        groups={groups}
      />
      <CharacterPreviewInner {...props} debugVisualConfig={debugConfig} />
    </>
  )
}

type CharacterPreviewInnerProps = Omit<CharacterPreviewProps, 'character'> & { character: Character | ShowcaseTabCharacter }

const CharacterPreviewInner = memo(function CharacterPreviewInner({
  source,
  character: rawCharacter,
  setOriginalCharacterModalOpen,
  setOriginalCharacterModalInitialCharacter,
  savedBuildOverride,
  id,
  forceDebug,
  debugVisualConfig,
}: CharacterPreviewInnerProps) {
  // Safe narrowing: ShowcaseTabCharacter is structurally compatible with Character for all
  // downstream usage. The source-aware branching in useCharacterPreviewState and getPreviewRelics
  // handles the equipped field difference (Relic objects vs string IDs).
  const character = rawCharacter as Character

  // Debug visual config with defaults
  const { t } = useTranslation('gameData')
  const visual = resolveDebugVisualConfig(debugVisualConfig)

  const colorPipelineConfig = useMemo<ColorPipelineConfig>(() => ({
    ...DEFAULT_CONFIG,
    cardBg: {
      ...DEFAULT_CONFIG.cardBg,
      maxC: visual.debugMaxC,
      minC: visual.debugMinC,
      chromaScale: visual.debugChromaScale,
      targetL: visual.debugTargetL,
      minL: visual.debugMinL,
      maxL: visual.debugMaxL,
    },
  }), [visual.debugMaxC, visual.debugMinC, visual.debugChromaScale, visual.debugTargetL, visual.debugMinL, visual.debugMaxL])

  const state = useCharacterPreviewState(source, rawCharacter, savedBuildOverride)

  // Portrait filter with dark mode brightness offset
  const effectiveBrightness = visual.portraitBrightness + (state.darkMode ? DEFAULT_CONFIG.darkMode.brightnessOffset : 0)
  const portraitFilter = buildPortraitFilter(visual.portraitBlur, effectiveBrightness, visual.portraitSaturate)

  const { displayRelics, scoringResults } = state.previewRelics

  // Layout: forceDebug disables L2D, forces SUBSTAT_SCORE, hides analysis footer
  const effectiveScoringType = forceDebug ? ScoringType.SUBSTAT_SCORE : state.storedScoringType
  // Cache-buster: state.scoringMetadata invalidates when scoring overrides change (SPD weight, buff priority)
  const _scoringMetadataCacheBuster = state.scoringMetadata
  const layout = useMemo(
    () => {
      void _scoringMetadataCacheBuster // explicit cache invalidation dependency
      const baseLayout = resolveShowcaseLayout({
        character,
        teamSelection: state.teamSelection,
        storedScoringType: effectiveScoringType,
        savedBuildOverride,
        t,
      })
      if (forceDebug) {
        return { ...baseLayout, displayDimensions: { ...baseLayout.displayDimensions, disableSpine: true } }
      }
      return baseLayout
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character, state.teamSelection, effectiveScoringType, savedBuildOverride, _scoringMetadataCacheBuster, t, forceDebug],
  )

  // ===== Color + Theme (color-dependent, cheap) =====
  const portraitImageUrl = character.portrait?.imageUrl
  const { effectiveColorMode, seedColor } = useMemo(
    () =>
      resolveShowcaseColor(
        character.id,
        state.globalColorMode,
        state.showcasePreferences,
        state.portraitColor,
        !!portraitImageUrl,
      ),
    [character.id, state.globalColorMode, state.showcasePreferences, state.portraitColor, portraitImageUrl],
  )

  const derivedShowcaseTheme = useMemo(
    () => resolveShowcaseTheme(seedColor, state.darkMode, colorPipelineConfig),
    [seedColor, state.darkMode, colorPipelineConfig],
  )

  useEffect(() => {
    const imgSrc = portraitImageUrl ?? Assets.getCharacterPortraitById(character.id)
    let aborted = false

    void (async () => {
      const palette = await extractPaletteInWorker(imgSrc)
      if (aborted || !palette) return
      const swatches = organizeColors(palette)
      const color = portraitImageUrl
        ? modifyCustomColor(pickBestSeed(palette))
        : undefined
      useShowcaseTabStore.getState().setPortraitPalette(character.id, color, swatches)
    })()

    return () => {
      aborted = true
    }
  }, [character.id, portraitImageUrl])

  // ===== Stable callback refs for child components =====
  const handleEditPortraitOk = useCallback(
    (payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, state.setCustomPortrait, state.setEditPortraitModalOpen),
    [character, state.setCustomPortrait, state.setEditPortraitModalOpen],
  )

  const handleSetOriginalCharacterModalInitialCharacter = useCallback(
    (character: Character) => setOriginalCharacterModalInitialCharacter?.(character),
    [setOriginalCharacterModalInitialCharacter],
  )

  const handleSetOriginalCharacterModalOpen = useCallback(
    (open: boolean) => setOriginalCharacterModalOpen?.(open),
    [setOriginalCharacterModalOpen],
  )

  // --- Scoring (useSyncExternalStore for cache reads, effect for cache misses) ---
  const tempOptions = state.showcaseTemporaryOptions ?? EMPTY_OPTIONS

  // ===== Early return after all hooks =====
  if (!state.previewRelics || !state.finalStats) {
    return null
  }

  const {
    showcaseMetadata,
    scoringType,
    portraitUrl,
    portraitToUse,
    displayDimensions,
    artistName,
  } = layout

  const scoredRelics = scoringResults.relics ?? EMPTY_SCORED

  return (
    <SimScoringContextProvider
      character={character}
      simulationMetadata={layout.simulationMetadata}
      showcaseTemporaryOptions={tempOptions}
      singleRelicByPart={displayRelics}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: cardTotalW,
          minHeight: forceDebug ? 'auto' : (source === ShowcaseSource.BUILDS_MODAL ? 900 : 2000),
        }}
      >
        {
          /*
        Will only render (<></>) if source == ShowcaseSource.BUILDS_MODAL
        It still needs to be mounted in order to provide colour to the build modals opened from the optimizer tab.
        Hidden in forceDebug mode.
      */
        }
        {!forceDebug && (
          <ShowcaseCustomizationSidebar
            source={source}
            id={id}
            characterId={character.id}
            scoringType={scoringType}
            seedColor={seedColor}
            effectiveColorMode={effectiveColorMode}
            portraitSwatches={state.portraitSwatches ?? EMPTY_SWATCHES}
            cardBgAlpha={visual.cardBgAlpha}
          />
        )}

        {
          /* Showcase full card — CSS custom properties for card theme allow imperative
          color updates during drag without React re-renders */
        }
        <div
          id={id}
          className='characterPreview'
          style={{
            '--showcase-card-bg': withAlpha(derivedShowcaseTheme.cardBackgroundColor, visual.cardBgAlpha),
            '--showcase-card-border': derivedShowcaseTheme.cardBorderColor,
            '--showcase-shadow': buildShadow(visual.shadowX, visual.shadowY, visual.shadowBlur, visual.shadowOpacity),
            '--showcase-shadow-inset': buildInsetShadow(visual.insetBlur, visual.insetOpacity),
            'color': 'rgba(220, 220, 220, 1)',
            'textShadow': visual.textShadow,
            'position': 'relative',
            'display': 'flex',
            'height': parentH,
            'background': 'var(--layer-inset)',
            'backgroundBlendMode': visual.blendMode,
            'overflow': 'hidden',
            'borderRadius': 6,
            'transition': showcaseTransition,
            'gap': defaultGap,
          } as React.CSSProperties}
        >
          <ShowcaseBackgroundBlur
            portraitUrl={portraitUrl}
            portraitToUse={portraitToUse}
            displayDimensions={displayDimensions}
            portraitFilter={portraitFilter}
            blendMode={visual.blendMode}
          />

          {/* Portrait left panel */}
          <div className='character-build-portrait' style={{ display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1 }}>
            <ShowcasePortrait
              source={source}
              character={character}
              scoringType={scoringType}
              displayDimensions={displayDimensions}
              customPortrait={portraitToUse}
              editPortraitModalOpen={state.editPortraitModalOpen}
              setEditPortraitModalOpen={state.setEditPortraitModalOpen}
              onEditPortraitOk={handleEditPortraitOk}
              artistName={artistName}
              setOriginalCharacterModalInitialCharacter={handleSetOriginalCharacterModalInitialCharacter}
              setOriginalCharacterModalOpen={handleSetOriginalCharacterModalOpen}
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
          </div>

          {/* Character details middle panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: middleColumnWidth,
                height: '100%',
                borderRadius: 6,
                zIndex: 10,
                backgroundColor: 'var(--showcase-card-bg)',
                transition: showcaseTransition,
                flex: 1,
                paddingRight: 2,
                paddingLeft: 2,
                paddingBottom: 3,
                boxShadow: showcaseShadow + showcaseShadowInsetAddition,
                border: '1px solid var(--showcase-card-border)',
              }}
            >
              <ShowcaseCharacterHeader
                showcaseMetadata={showcaseMetadata}
                scoringType={scoringType}
              />

              <WrappedCharacterStatSummary
                characterId={character.id}
                finalStats={state.finalStats}
                elementalDmgValue={showcaseMetadata.elementalDmgType}
                scoringType={scoringType}
                hasScoring={layout.simulationMetadata !== null}
              />

              {scoringType === ScoringType.COMBAT_SCORE && (
                <>
                  <ShowcaseDpsScoreHeader relics={displayRelics} tempOptions={tempOptions} />

                  <ShowcaseDpsScorePanel
                    characterId={showcaseMetadata.characterId}
                    simulationMetadata={layout.simulationMetadata!}
                    teamSelection={layout.currentSelection}
                    source={source}
                  />

                  <ShowcaseCombatScoreDetailsFooter />
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
            </div>

            {scoringType !== ScoringType.COMBAT_SCORE && (
              <ShowcaseLightConeLarge
                character={character}
                showcaseMetadata={showcaseMetadata}
                displayDimensions={displayDimensions}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
              />
            )}
          </div>

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
          />
        </div>

        <CharacterAnnouncement
          characterId={showcaseMetadata.characterId}
          simulationMetadata={layout.simulationMetadata}
        />

        {
          /* Showcase analysis footer — uses storedScoringType (user's preference) not resolved scoringType,
          so the SegmentedControl reflects their selection even when combat score is unavailable.
          Hidden in forceDebug mode. */
        }
        {source !== ShowcaseSource.BUILDS_MODAL && !forceDebug && (
          <DeferReveal>
            <ShowcaseBuildAnalysis
              showcaseMetadata={showcaseMetadata}
              scoringType={state.storedScoringType}
              displayRelics={displayRelics}
            />
          </DeferReveal>
        )}
      </div>
    </SimScoringContextProvider>
  )
})

const WrappedCharacterStatSummary = memo(function({ characterId, finalStats, elementalDmgValue, scoringType, hasScoring }: {
  characterId: CharacterId,
  finalStats: BasicStatsObject,
  elementalDmgValue: string,
  scoringType: ScoringType,
  hasScoring: boolean,
}) {
  const preview = useSimScoringContext(ScoringSelector.Preview)
  const simScore = preview?.originalSimResult.simScore ?? 0
  return (
    <CharacterStatSummary
      characterId={characterId}
      finalStats={finalStats}
      elementalDmgValue={elementalDmgValue}
      scoringType={scoringType}
      hasScoring={hasScoring}
      simScore={simScore}
    />
  )
})

injectBenchmarkDebuggers()
