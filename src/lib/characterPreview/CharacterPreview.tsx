import { Flex, useMantineTheme } from '@mantine/core'
import {
  showcaseShadow,
  showcaseShadowInsetAddition,
  showcaseTransition,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import {
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/card/CharacterStatSummary'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/scoring/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/card/ShowcaseCharacterHeader'
import { ShowcaseCustomizationSidebar } from 'lib/characterPreview/customization/ShowcaseCustomizationSidebar'
import {
  ShowcaseCombatScoreDetailsFooter,
  ShowcaseDpsScoreHeader,
  ShowcaseDpsScorePanel,
} from 'lib/characterPreview/scoring/ShowcaseDpsScore'
import {
  ShowcaseLightConeLarge,
  ShowcaseLightConeLargeName,
  ShowcaseLightConeSmall,
} from 'lib/characterPreview/card/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/card/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/card/ShowcaseRelicsPanel'
import { useProgressivePhase } from 'lib/characterPreview/useProgressivePhase'
import { ShowcaseStatScore } from 'lib/characterPreview/scoring/ShowcaseStatScore'
import { useCharacterPreviewState } from 'lib/characterPreview/useCharacterPreviewState'
import { resolveShowcaseLayout } from 'lib/characterPreview/useShowcaseDerivedData'
import { resolveShowcaseColor, resolveShowcaseTheme } from 'lib/characterPreview/color/showcaseColorService'
import {
  cardTotalW,
  defaultGap,
  middleColumnWidth,
  parentH,
} from 'lib/constants/constantsUi'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import { Assets } from 'lib/rendering/assets'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  computeScoringCacheKey,
  getOrComputePreview,
  requestScore,
} from 'lib/scoring/scoringService'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { useScoringExecution } from 'lib/scoring/useScoringExecution'
import { injectBenchmarkDebuggers } from 'lib/simulations/tests/simDebuggers'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import {
  showcaseBackgroundColor,
  modifyCustomColor,
  organizeColors,
  pickBestSeed,
} from 'lib/characterPreview/color/colorUtils'
import { getColorThiefPalette } from 'lib/characterPreview/color/colorThiefExtractor'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  type Character,
  type SavedBuild,
} from 'types/character'
import {
  type CustomImagePayload,
} from 'types/customImage'

const EMPTY_SWATCHES: string[] = []
const EMPTY_OPTIONS = {}
const EMPTY_SCORED: import('lib/relics/scoring/relicScorer').RelicScoringResult[] = []

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
}

type CharacterPreviewProps = CharacterPreviewPropsBase & (SavedBuildPreviewProps | InteractiveCharacterPreviewProps)

// Portrait background filter defaults
const PORTRAIT_BLUR = 22
const PORTRAIT_BRIGHTNESS = 0.40
const PORTRAIT_SATURATE = 1.80
const CARD_BG_ALPHA_DEFAULT = 0.45

// Shadow defaults
const SHADOW_X = 1
const SHADOW_Y = 1
const SHADOW_BLUR_DEFAULT = 5
const SHADOW_OPACITY = 0.75
const INSET_BLUR_DEFAULT = 2
const INSET_OPACITY = 0.30

function buildPortraitFilter(blur: number, brightness: number, saturate: number) {
  return `blur(${blur}px) brightness(${brightness.toFixed(2)}) saturate(${saturate.toFixed(2)})`
}

function buildShadow(x: number, y: number, blur: number, opacity: number) {
  return `rgba(0, 0, 0, ${opacity.toFixed(2)}) ${x}px ${y}px ${blur}px`
}

function buildInsetShadow(blur: number, opacity: number) {
  return `, inset rgba(255, 255, 255, ${opacity.toFixed(2)}) 0px 0px ${blur}px`
}

function replaceOklchAlpha(cssColor: string, alpha: number): string {
  return cssColor.replace(/\/\s*[\d.]+\)/, `/ ${alpha.toFixed(2)})`)
}

type SliderDef = { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }
type SliderGroup = { title: string; sliders: SliderDef[] }

// Debug slider panel for tuning card visuals — hidden by default, click [+] to show
function DebugSliderPanel({ groups }: { groups: SliderGroup[] }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          borderRadius: 6,
          padding: '4px 10px',
          color: '#ddd',
          fontSize: 16,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        +
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      borderRadius: 8,
      padding: '14px 20px',
      color: '#ddd',
      fontSize: 13,
      minWidth: 520,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      maxHeight: '90vh',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Card Debug Sliders</span>
        <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', padding: '0 4px' }}>x</span>
      </div>
      {groups.map((g) => (
        <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 2, marginTop: 4 }}>{g.title}</div>
          {g.sliders.map((s) => (
            <label key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ minWidth: 100 }}>{s.label}</span>
              <span style={{ minWidth: 40, textAlign: 'right', fontFamily: 'monospace' }}>{s.value.toFixed(2)}</span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={(e) => s.onChange(Number(e.target.value))} style={{ width: 300 }} />
            </label>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CharacterPreview({
  character,
  ...rest
}: CharacterPreviewProps) {
  if (!character) {
    return (
      <div
        style={{
          height: parentH,
          width: cardTotalW,
          borderRadius: 6,
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--mantine-color-dark-7)',
        }}
      />
    )
  }

  return <CharacterPreviewInner character={character} {...rest} />
}

type CharacterPreviewInnerProps = Omit<CharacterPreviewProps, 'character'> & { character: Character | ShowcaseTabCharacter }

const CharacterPreviewInner = memo(function CharacterPreviewInner({
  source,
  character: rawCharacter,
  setOriginalCharacterModalOpen,
  setOriginalCharacterModalInitialCharacter,
  savedBuildOverride,
  id,
}: CharacterPreviewInnerProps) {
  // Safe narrowing: ShowcaseTabCharacter is structurally compatible with Character for all
  // downstream usage. The source-aware branching in useCharacterPreviewState and getPreviewRelics
  // handles the equipped field difference (Relic objects vs string IDs).
  const character = rawCharacter as Character

  const mantineTheme = useMantineTheme()

  const [portraitBlur, setPortraitBlur] = useState(PORTRAIT_BLUR)
  const [portraitBrightness, setPortraitBrightness] = useState(PORTRAIT_BRIGHTNESS)
  const [portraitSaturate, setPortraitSaturate] = useState(PORTRAIT_SATURATE)
  const [cardBgAlpha, setCardBgAlpha] = useState(CARD_BG_ALPHA_DEFAULT)
  const [shadowX, setShadowX] = useState(SHADOW_X)
  const [shadowY, setShadowY] = useState(SHADOW_Y)
  const [shadowBlur, setShadowBlur] = useState(SHADOW_BLUR_DEFAULT)
  const [shadowOpacity, setShadowOpacity] = useState(SHADOW_OPACITY)
  const [insetBlur, setInsetBlur] = useState(INSET_BLUR_DEFAULT)
  const [insetOpacity, setInsetOpacity] = useState(INSET_OPACITY)
  const portraitFilter = buildPortraitFilter(portraitBlur, portraitBrightness, portraitSaturate)

  const state = useCharacterPreviewState(source, rawCharacter, savedBuildOverride)

  const displayRelics = state.previewRelics?.displayRelics ?? null
  const scoringResults = state.previewRelics?.scoringResults ?? null

  // ===== Layout (character-dependent, no color) =====
  // scoringMetadata is not a direct input — it busts the memo cache when scoring overrides
  // change (SPD weight, buff priority), ensuring resolveShowcaseLayout re-reads the latest
  // values from the scoring store via resolveDpsScoreSimulationMetadata.
  const layout = useMemo(
    () => resolveShowcaseLayout({
      character,
      teamSelection: state.teamSelection,
      storedScoringType: state.storedScoringType,
      savedBuildOverride,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character, state.teamSelection, state.storedScoringType, savedBuildOverride, state.scoringMetadata],
  )

  // ===== Color + Theme (color-dependent, cheap) =====
  const { effectiveColorMode, seedColor } = useMemo(
    () => resolveShowcaseColor(
      character.id,
      state.globalColorMode,
      state.showcasePreferences,
      state.portraitColor,
    ),
    [character.id, state.globalColorMode, state.showcasePreferences, state.portraitColor],
  )

  const derivedShowcaseTheme = useMemo(
    () => resolveShowcaseTheme(seedColor, state.darkMode),
    [seedColor, state.darkMode],
  )

  // ===== Portrait palette extraction =====
  // Extracts color swatches for the customization sidebar.
  // Runs as an effect so it works regardless of display mode (Spine, image, custom).
  const portraitImageUrl = character.portrait?.imageUrl
  useEffect(() => {
    // Skip extraction if palette already cached for this character
    const existing = useShowcaseTabStore.getState().portraitSwatchesByCharacterId[character.id]
    if (existing && !portraitImageUrl) return

    const imgSrc = portraitImageUrl ?? Assets.getCharacterPortraitById(character.id)
    let aborted = false

    void (async () => {
      const palette = await getColorThiefPalette(imgSrc)
      if (aborted || !palette) return
      const swatches = organizeColors(palette)
      const color = portraitImageUrl
        ? modifyCustomColor(pickBestSeed(palette))
        : undefined
      useShowcaseTabStore.getState().setPortraitPalette(character.id, color, swatches)
    })()

    return () => { aborted = true }
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

  const cacheKey = useMemo(
    () => {
      if (!displayRelics) return null
      return computeScoringCacheKey(
        character, layout.simulationMetadata, displayRelics as SingleRelicByPart, tempOptions,
      )
    },
    [character, layout.simulationMetadata, displayRelics, state.showcaseTemporaryOptions],
  )

  // Compute preview synchronously — runs prepareOrchestrator (~5ms) on cache miss.
  // Returns null if inputs are missing or if preparation fails (try/catch inside).
  const preview = useMemo(
    () => {
      if (!cacheKey || !layout.simulationMetadata || !displayRelics) return null
      return getOrComputePreview(
        cacheKey, character, layout.simulationMetadata,
        displayRelics as SingleRelicByPart, tempOptions,
      )
    },
    // cacheKey is a content hash of all inputs — sufficient proxy
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey],
  )

  const requestFn = useMemo(() => {
    if (!cacheKey || !layout.simulationMetadata || !displayRelics) return null
    return () => requestScore(
      cacheKey, character, layout.simulationMetadata!,
      displayRelics as SingleRelicByPart, tempOptions,
    )
    // cacheKey is a content hash of all scoring inputs — sufficient proxy for deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  const { done: scoringDone, result: scoringResult } = useScoringExecution(cacheKey, requestFn)

  // Defer analysis section: card renders fully first, analysis phases in after
  const analysisPhase = useProgressivePhase(character.id, 1)

  // ===== Early return after all hooks =====
  if (!state.previewRelics || !state.finalStats || !displayRelics || !scoringResults) {
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
    <Flex direction="column" style={{ width: cardTotalW, minHeight: source === ShowcaseSource.BUILDS_MODAL ? 900 : 2000 }}>
      <DebugSliderPanel groups={[
        { title: 'Portrait BG Filter', sliders: [
          { label: 'Blur', value: portraitBlur, min: 0, max: 50, step: 1, onChange: setPortraitBlur },
          { label: 'Brightness', value: portraitBrightness, min: 0, max: 1, step: 0.01, onChange: setPortraitBrightness },
          { label: 'Saturate', value: portraitSaturate, min: 0, max: 4, step: 0.05, onChange: setPortraitSaturate },
          { label: 'Card BG Alpha', value: cardBgAlpha, min: 0, max: 1, step: 0.01, onChange: setCardBgAlpha },
        ]},
        { title: 'Outer Shadow', sliders: [
          { label: 'X', value: shadowX, min: -5, max: 5, step: 0.5, onChange: setShadowX },
          { label: 'Y', value: shadowY, min: -5, max: 5, step: 0.5, onChange: setShadowY },
          { label: 'Blur', value: shadowBlur, min: 0, max: 15, step: 0.5, onChange: setShadowBlur },
          { label: 'Opacity', value: shadowOpacity, min: 0, max: 1, step: 0.05, onChange: setShadowOpacity },
        ]},
        { title: 'Inset Glow', sliders: [
          { label: 'Blur', value: insetBlur, min: 0, max: 8, step: 0.5, onChange: setInsetBlur },
          { label: 'Opacity', value: insetOpacity, min: 0, max: 1, step: 0.05, onChange: setInsetOpacity },
        ]},
      ]} />
      {
        /*
        Will only render (<></>) if source == ShowcaseSource.BUILDS_MODAL
        It still needs to be mounted in order to provide colour to the build modals opened from the optimizer tab
      */
      }
      <ShowcaseCustomizationSidebar
        source={source}
        id={id}
        characterId={character.id}
        originalSpd={preview?.originalSpd}
        scoringType={scoringType}
        seedColor={seedColor}
        effectiveColorMode={effectiveColorMode}
        portraitSwatches={state.portraitSwatches ?? EMPTY_SWATCHES}
      />

      {/* Showcase full card — CSS custom properties for card theme allow imperative
          color updates during drag without React re-renders */}
      <Flex
        id={id}
        className='characterPreview'
        style={{
          '--showcase-card-bg': replaceOklchAlpha(derivedShowcaseTheme.cardBackgroundColor, cardBgAlpha),
          '--showcase-card-border': derivedShowcaseTheme.cardBorderColor,
          '--showcase-shadow': buildShadow(shadowX, shadowY, shadowBlur, shadowOpacity),
          '--showcase-shadow-inset': buildInsetShadow(insetBlur, insetOpacity),
          color: '#d7d7d7',
          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 1px rgba(0,0,0,0.7)',
          position: 'relative',
          display: 'flex',
          height: parentH,
          background: showcaseBackgroundColor(mantineTheme.colors.dark[8]),
          backgroundBlendMode: 'screen',
          overflow: 'hidden',
          borderRadius: 6,
          transition: showcaseTransition,
        } as React.CSSProperties}
        gap={defaultGap}
      >
        {/* Background */}
        <div
          data-portrait-bg
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
            filter: portraitFilter,
            WebkitFilter: portraitFilter,
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
        </Flex>

        {/* Character details middle panel */}
        <Flex direction="column" justify='space-between' gap={8}>
          <Flex
            direction="column"
            style={{
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
            justify='space-between'
          >
            <ShowcaseCharacterHeader
              showcaseMetadata={showcaseMetadata}
              scoringType={scoringType}
            />

            <CharacterStatSummary
              characterId={character.id}
              finalStats={state.finalStats}
              elementalDmgValue={showcaseMetadata.elementalDmgType}
              scoringType={scoringType}
              scoringDone={scoringDone}
              scoringResult={scoringResult}
              simScore={preview?.originalSimResult.simScore}
            />

            {scoringType === ScoringType.COMBAT_SCORE && (
              <>
                <ShowcaseDpsScoreHeader scoringDone={scoringDone} scoringResult={scoringResult} relics={displayRelics} />

                <ShowcaseDpsScorePanel
                  characterId={showcaseMetadata.characterId}
                  simulationMetadata={layout.simulationMetadata!}
                  teamSelection={layout.currentSelection}
                  source={source}
                />

                <ShowcaseCombatScoreDetailsFooter preview={preview} />
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
        />
      </Flex>

      <CharacterAnnouncement
        characterId={showcaseMetadata.characterId}
        simulationMetadata={layout.simulationMetadata}
      />

      {/* Showcase analysis footer — uses storedScoringType (user's preference) not resolved scoringType,
          so the SegmentedControl reflects their selection even when combat score is unavailable */}
      {source !== ShowcaseSource.BUILDS_MODAL && (
        <ShowcaseBuildAnalysis
          scoringDone={analysisPhase >= 1 && scoringDone}
          scoringResult={analysisPhase >= 1 ? scoringResult : null}
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
