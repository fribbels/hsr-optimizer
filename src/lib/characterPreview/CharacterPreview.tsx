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
  selectClosestColor,
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

// TEMP: debug portrait filter panel — remove when finalized
export type PortraitFilters = { brightness: number; saturate: number; contrast: number; overlayOpacity: number }

const SLIDER_DEFS = [
  { key: 'brightness', label: 'Bright', min: 0.25, max: 0.70, step: 0.05, default: 0.375 },
  { key: 'saturate', label: 'Sat', min: 0.3, max: 3.0, step: 0.02, default: 2.50 },
  { key: 'contrast', label: 'Contrast', min: 0.50, max: 1.50, step: 0.05, default: 1.00 },
  { key: 'overlayOpacity', label: 'Multiply', min: 0.0, max: 0.50, step: 0.05, default: 0.0 },
] as const

export const PORTRAIT_FILTER_DEFAULTS: PortraitFilters = Object.fromEntries(
  SLIDER_DEFS.map((d) => [d.key, d.default]),
) as PortraitFilters

export const SEED_STRATEGY_NAMES = ['vibrantFirst', 'highestChroma', 'darkVibrant', 'populationWeighted', 'coolBias', 'noAvoidance', 'darkCool', 'darkCoolScored', 'midCool'] as const
export type SeedStrategyName = typeof SEED_STRATEGY_NAMES[number]

declare global {
  interface Window {
    __portraitFilters?: PortraitFilters
    __seedStrategy?: SeedStrategyName
  }
}

export function getPortraitFilters(): PortraitFilters {
  return window.__portraitFilters ?? PORTRAIT_FILTER_DEFAULTS
}

export function buildPortraitFilterStr(f: PortraitFilters): string {
  const parts = [`blur(22px)`, `brightness(${f.brightness})`, `saturate(${f.saturate})`]
  if (f.contrast !== 1.0) parts.push(`contrast(${f.contrast})`)
  return parts.join(' ')
}

function pushFiltersToAll(f: PortraitFilters) {
  window.__portraitFilters = f
  const filterStr = buildPortraitFilterStr(f)
  document.querySelectorAll('[data-portrait-bg]').forEach((el) => {
    const htmlEl = el as HTMLElement
    htmlEl.style.filter = filterStr
    htmlEl.style.webkitFilter = filterStr
  })
  // Multiply overlay: dark div on top of portrait to tame whites
  document.querySelectorAll('[data-portrait-bg]').forEach((el) => {
    let overlay = el.parentElement?.querySelector('[data-portrait-overlay]') as HTMLElement | null
    if (f.overlayOpacity > 0) {
      if (!overlay) {
        overlay = document.createElement('div')
        overlay.setAttribute('data-portrait-overlay', '')
        Object.assign(overlay.style, {
          position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
          zIndex: '0', pointerEvents: 'none', mixBlendMode: 'multiply',
        })
        el.parentElement?.insertBefore(overlay, el.nextSibling)
      }
      overlay.style.background = `rgba(80, 80, 90, ${f.overlayOpacity})`
    } else if (overlay) {
      overlay.remove()
    }
  })
}

const FILTER_PRESETS: { name: string; values: PortraitFilters }[] = [
  { name: 'Default', values: { brightness: 0.60, saturate: 1.00, contrast: 1.10, overlayOpacity: 0.0 } },
  { name: 'F', values: { brightness: 0.43, saturate: 2.00, contrast: 0.80, overlayOpacity: 0.0 } },
  { name: 'F+bright', values: { brightness: 0.48, saturate: 2.00, contrast: 0.80, overlayOpacity: 0.0 } },
  { name: 'F-bright', values: { brightness: 0.38, saturate: 2.00, contrast: 0.80, overlayOpacity: 0.0 } },
  { name: 'F-sat', values: { brightness: 0.43, saturate: 1.80, contrast: 0.80, overlayOpacity: 0.0 } },
  { name: 'F+con', values: { brightness: 0.43, saturate: 2.00, contrast: 0.90, overlayOpacity: 0.0 } },
  { name: 'F-con', values: { brightness: 0.43, saturate: 2.00, contrast: 0.70, overlayOpacity: 0.0 } },
  { name: 'X', values: { brightness: 0.375, saturate: 2.50, contrast: 1.00, overlayOpacity: 0.0 } },
]

const pillStyle = (active: boolean): React.CSSProperties => ({
  background: active ? '#556' : '#333',
  color: active ? '#eee' : '#aaa',
  border: 'none',
  borderRadius: 4,
  padding: '2px 6px',
  fontSize: 10,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

export function PortraitContrastSlider() {
  const [values, setValues] = useState(() => ({ ...getPortraitFilters() }))
  const [strategy, setStrategy] = useState<SeedStrategyName>(() => window.__seedStrategy ?? 'midCool')

  const apply = (f: PortraitFilters) => { setValues({ ...f }); pushFiltersToAll(f) }
  const update = (key: string, v: number) => {
    const next = { ...values, [key]: v }
    setValues(next)
    pushFiltersToAll(next)
  }

  const applyStrategy = (s: SeedStrategyName) => {
    setStrategy(s)
    window.__seedStrategy = s
    window.dispatchEvent(new CustomEvent('seed-strategy-change', { detail: s }))
  }

  const isMatch = (preset: PortraitFilters) =>
    preset.brightness === values.brightness && preset.saturate === values.saturate
    && preset.contrast === values.contrast && preset.overlayOpacity === values.overlayOpacity

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9999, background: '#1a1a1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 450 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#888', fontSize: 11, fontWeight: 600 }}>Portrait BG Debug</span>
        <button onClick={() => apply(PORTRAIT_FILTER_DEFAULTS)} style={pillStyle(isMatch(PORTRAIT_FILTER_DEFAULTS))}>Reset</button>
      </div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {FILTER_PRESETS.map((p) => (
          <button key={p.name} onClick={() => apply(p.values)} style={pillStyle(isMatch(p.values))}>{p.name}</button>
        ))}
      </div>
      {SLIDER_DEFS.map(({ key, label, min, max, step }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#aaa', fontSize: 11, width: 52 }}>{label}</span>
          <input type="range" min={min} max={max} step={step} value={values[key]} onChange={(e) => update(key, parseFloat(e.target.value))} style={{ flex: 1, height: 14 }} />
          <span style={{ color: '#ccc', fontSize: 11, width: 32, textAlign: 'right' }}>{values[key as keyof typeof values].toFixed(2)}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid #333', paddingTop: 4 }}>
        <span style={{ color: '#888', fontSize: 11, fontWeight: 600 }}>Seed Strategy</span>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3 }}>
          {SEED_STRATEGY_NAMES.map((s) => (
            <button key={s} onClick={() => applyStrategy(s)} style={pillStyle(strategy === s)}>{s}</button>
          ))}
        </div>
      </div>
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
  // Extracts color swatches via vibrant for the customization sidebar.
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
        ? modifyCustomColor(
            selectClosestColor([palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted]),
          )
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
          '--showcase-card-bg': derivedShowcaseTheme.cardBackgroundColor,
          '--showcase-card-border': derivedShowcaseTheme.cardBorderColor,
          color: '#e0e0e0',
          textShadow: '0px 0px 3px rgba(0,0,0,0.9), 0px 0px 1px rgba(0,0,0,0.7)',
          position: 'relative',
          display: 'flex',
          height: parentH,
          background: showcaseBackgroundColor(mantineTheme.colors.dark[8], state.darkMode),
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
            filter: buildPortraitFilterStr(getPortraitFilters()),
            WebkitFilter: buildPortraitFilterStr(getPortraitFilters()),
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
