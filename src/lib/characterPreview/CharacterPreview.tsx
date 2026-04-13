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
  useState,
} from 'react'
import {
  type Character,
  type CharacterId,
  type SavedBuild,
} from 'types/character'
import {
  type CustomImagePayload,
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

// Text shadow presets for readability tuning
const TEXT_SHADOW_DEFAULT = '1px 1px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(0,0,0,0.3), 1px -1px 0 rgba(0,0,0,0.3), -1px 1px 0 rgba(0,0,0,0.3)'

const TEXT_SHADOW_PRESETS: { label: string, value: string }[] = [
  { label: 'Current (blur only)', value: TEXT_SHADOW_DEFAULT },
  { label: 'A: Faint outline 0.20', value: '1px 1px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(0,0,0,0.2), 1px -1px 0 rgba(0,0,0,0.2), -1px 1px 0 rgba(0,0,0,0.2)' },
  { label: 'B: Subtle outline 0.30', value: '1px 1px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(0,0,0,0.3), 1px -1px 0 rgba(0,0,0,0.3), -1px 1px 0 rgba(0,0,0,0.3)' },
  { label: 'C: Light outline 0.40', value: '1px 1px 0 rgba(0,0,0,0.4), -1px -1px 0 rgba(0,0,0,0.4), 1px -1px 0 rgba(0,0,0,0.4), -1px 1px 0 rgba(0,0,0,0.4)' },
  { label: 'B: Medium outline', value: '1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6)' },
  {
    label: 'C: Outline + soft glow',
    value: '1px 1px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.4)',
  },
  {
    label: 'D: 8-dir light',
    value:
      '-1px 0 0 rgba(0,0,0,0.35), 1px 0 0 rgba(0,0,0,0.35), 0 -1px 0 rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.35), -1px -1px 0 rgba(0,0,0,0.35), 1px -1px 0 rgba(0,0,0,0.35), -1px 1px 0 rgba(0,0,0,0.35), 1px 1px 0 rgba(0,0,0,0.35)',
  },
  {
    label: 'E: 8-dir medium',
    value:
      '-1px 0 0 rgba(0,0,0,0.55), 1px 0 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(0,0,0,0.55), 0 1px 0 rgba(0,0,0,0.55), -1px -1px 0 rgba(0,0,0,0.55), 1px -1px 0 rgba(0,0,0,0.55), -1px 1px 0 rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.55)',
  },
  {
    label: 'F: 8-dir + glow',
    value:
      '-1px 0 0 rgba(0,0,0,0.45), 1px 0 0 rgba(0,0,0,0.45), 0 -1px 0 rgba(0,0,0,0.45), 0 1px 0 rgba(0,0,0,0.45), -1px -1px 0 rgba(0,0,0,0.45), 1px -1px 0 rgba(0,0,0,0.45), -1px 1px 0 rgba(0,0,0,0.45), 1px 1px 0 rgba(0,0,0,0.45), 0 0 6px rgba(0,0,0,0.35)',
  },
  { label: 'G: None', value: 'none' },
]

// globalThis.CARD_DEBUG = true

function buildPortraitFilter(blur: number, brightness: number, saturate: number) {
  return `blur(${blur}px) brightness(${brightness.toFixed(2)}) saturate(${saturate.toFixed(2)})`
}

function buildShadow(x: number, y: number, blur: number, opacity: number) {
  return `rgba(0, 0, 0, ${opacity.toFixed(2)}) ${x}px ${y}px ${blur}px`
}

function buildInsetShadow(blur: number, opacity: number) {
  return `, inset rgba(255, 255, 255, ${opacity.toFixed(2)}) 0px 0px ${blur}px`
}

type SliderDef = { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }
type SliderGroup = { title: string, sliders: SliderDef[] }
type DebugPreset = { label: string, apply: () => void }
type PillGroup = { title: string, active: string, options: { label: string, value: string, apply: () => void }[] }

const pillStyle: React.CSSProperties = {
  padding: '3px 10px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid #555',
  background: 'rgba(255,255,255,0.08)',
  color: '#ccc',
  userSelect: 'none',
}

const pillActiveStyle: React.CSSProperties = {
  ...pillStyle,
  border: '1px solid #88f',
  background: 'rgba(100,100,255,0.25)',
  color: '#fff',
}

// Debug slider panel for tuning card visuals — hidden by default, click [+] to show
function DebugSliderPanel({ groups, presets, pillGroups }: { groups: SliderGroup[], presets?: DebugPreset[], pillGroups?: PillGroup[] }) {
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
    <div
      style={{
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
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Card Debug Sliders</span>
        <span onClick={() => setOpen(false)} style={{ cursor: 'pointer', padding: '0 4px' }}>x</span>
      </div>
      {presets && presets.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          {presets.map((p) => <span key={p.label} onClick={p.apply} style={pillStyle}>{p.label}</span>)}
        </div>
      )}
      {pillGroups && pillGroups.map((pg) => (
        <div key={pg.title} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 2, marginTop: 4 }}>{pg.title}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {pg.options.map((o) => <span key={o.label} onClick={o.apply} style={pg.active === o.value ? pillActiveStyle : pillStyle}>{o.label}</span>)}
          </div>
        </div>
      ))}
      {groups.map((g) => (
        <div key={g.title} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 2, marginTop: 4 }}>{g.title}</div>
          {g.sliders.map((s) => (
            <label key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <span style={{ minWidth: 100 }}>{s.label}</span>
              <span style={{ minWidth: 40, textAlign: 'right', fontFamily: 'monospace' }}>{s.value.toFixed(2)}</span>
              <input
                type='range'
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.onChange(Number(e.target.value))}
                style={{ width: 300 }}
              />
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
          backgroundColor: 'var(--layer-0)',
          border: '1px solid var(--layer-0)',
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
  const [textShadowPreset, setTextShadowPreset] = useState(TEXT_SHADOW_DEFAULT)
  const portraitFilter = buildPortraitFilter(portraitBlur, portraitBrightness, portraitSaturate)

  // OKLCH pipeline debug sliders
  const [debugMaxC, setDebugMaxC] = useState(DEFAULT_CONFIG.cardBg.maxC)
  const [debugMinC, setDebugMinC] = useState(DEFAULT_CONFIG.cardBg.minC)
  const [debugChromaScale, setDebugChromaScale] = useState(DEFAULT_CONFIG.cardBg.chromaScale)
  const [debugTargetL, setDebugTargetL] = useState(DEFAULT_CONFIG.cardBg.targetL)
  const [debugDarkCScale, setDebugDarkCScale] = useState(DEFAULT_CONFIG.darkMode.cScale)

  const debugConfig = useMemo<ColorPipelineConfig>(() => ({
    ...DEFAULT_CONFIG,
    cardBg: {
      ...DEFAULT_CONFIG.cardBg,
      maxC: debugMaxC,
      minC: debugMinC,
      chromaScale: debugChromaScale,
      targetL: debugTargetL,
    },
    darkMode: {
      ...DEFAULT_CONFIG.darkMode,
      cScale: debugDarkCScale,
    },
  }), [debugMaxC, debugMinC, debugChromaScale, debugTargetL, debugDarkCScale])

  const state = useCharacterPreviewState(source, rawCharacter, savedBuildOverride)

  const { displayRelics, scoringResults } = state.previewRelics

  // ===== Layout (character-dependent, no color) =====
  // scoringMetadata is not a direct input — it busts the memo cache when scoring overrides
  // change (SPD weight, buff priority), ensuring resolveShowcaseLayout re-reads the latest
  // values from the scoring store via resolveDpsScoreSimulationMetadata.
  const layout = useMemo(
    () =>
      resolveShowcaseLayout({
        character,
        teamSelection: state.teamSelection,
        storedScoringType: state.storedScoringType,
        savedBuildOverride,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [character, state.teamSelection, state.storedScoringType, savedBuildOverride, state.scoringMetadata],
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
    () => resolveShowcaseTheme(seedColor, state.darkMode, debugConfig),
    [seedColor, state.darkMode, debugConfig],
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
      <div style={{ display: 'flex', flexDirection: 'column', width: cardTotalW, minHeight: source === ShowcaseSource.BUILDS_MODAL ? 900 : 2000 }}>
        {globalThis.CARD_DEBUG && (
          <DebugSliderPanel
            presets={[
              {
                label: 'Preset A (current)',
                apply: () => {
                  setPortraitBlur(22)
                  setPortraitBrightness(0.40)
                  setPortraitSaturate(1.80)
                  setCardBgAlpha(0.45)
                  setShadowX(1)
                  setShadowY(1)
                  setShadowBlur(5)
                  setShadowOpacity(0.75)
                  setInsetBlur(2)
                  setInsetOpacity(0.30)
                  setDebugMaxC(0.052)
                  setDebugMinC(0.034)
                  setDebugChromaScale(0.58)
                  setDebugTargetL(0.42)
                  setDebugDarkCScale(0.80)
                },
              },
              {
                label: 'Preset B (vivid)',
                apply: () => {
                  setPortraitBlur(24)
                  setPortraitBrightness(0.45)
                  setPortraitSaturate(1.80)
                  setCardBgAlpha(0.50)
                  setShadowX(1)
                  setShadowY(1)
                  setShadowBlur(5)
                  setShadowOpacity(0.75)
                  setInsetBlur(2)
                  setInsetOpacity(0.30)
                  setDebugMaxC(0.09)
                  setDebugMinC(0.05)
                  setDebugChromaScale(0.50)
                  setDebugTargetL(0.40)
                  setDebugDarkCScale(0.80)
                },
              },
              {
                label: 'Preset D (bright)',
                apply: () => {
                  setPortraitBlur(24)
                  setPortraitBrightness(0.50)
                  setPortraitSaturate(1.80)
                  setCardBgAlpha(0.50)
                  setShadowX(1)
                  setShadowY(1)
                  setShadowBlur(5)
                  setShadowOpacity(0.75)
                  setInsetBlur(2)
                  setInsetOpacity(0.30)
                  setDebugMaxC(0.09)
                  setDebugMinC(0.05)
                  setDebugChromaScale(0.50)
                  setDebugTargetL(0.35)
                  setDebugDarkCScale(0.80)
                },
              },
              {
                label: 'Preset E (mid)',
                apply: () => {
                  setPortraitBlur(26)
                  setPortraitBrightness(0.475)
                  setPortraitSaturate(1.75)
                  setCardBgAlpha(0.50)
                  setShadowX(1)
                  setShadowY(1)
                  setShadowBlur(5)
                  setShadowOpacity(0.75)
                  setInsetBlur(2)
                  setInsetOpacity(0.30)
                  setDebugMaxC(0.09)
                  setDebugMinC(0.05)
                  setDebugChromaScale(0.50)
                  setDebugTargetL(0.375)
                  setDebugDarkCScale(0.80)
                },
              },
            ]}
            pillGroups={[
              {
                title: 'Text Shadow',
                active: textShadowPreset,
                options: TEXT_SHADOW_PRESETS.map((p) => ({
                  label: p.label,
                  value: p.value,
                  apply: () => setTextShadowPreset(p.value),
                })),
              },
            ]}
            groups={[
              {
                title: 'Portrait BG Filter',
                sliders: [
                  { label: 'Blur', value: portraitBlur, min: 0, max: 50, step: 1, onChange: setPortraitBlur },
                  { label: 'Brightness', value: portraitBrightness, min: 0, max: 1, step: 0.01, onChange: setPortraitBrightness },
                  { label: 'Saturate', value: portraitSaturate, min: 0, max: 4, step: 0.05, onChange: setPortraitSaturate },
                  { label: 'Card BG Alpha', value: cardBgAlpha, min: 0, max: 1, step: 0.01, onChange: setCardBgAlpha },
                ],
              },
              {
                title: 'Outer Shadow',
                sliders: [
                  { label: 'X', value: shadowX, min: -5, max: 5, step: 0.5, onChange: setShadowX },
                  { label: 'Y', value: shadowY, min: -5, max: 5, step: 0.5, onChange: setShadowY },
                  { label: 'Blur', value: shadowBlur, min: 0, max: 15, step: 0.5, onChange: setShadowBlur },
                  { label: 'Opacity', value: shadowOpacity, min: 0, max: 1, step: 0.05, onChange: setShadowOpacity },
                ],
              },
              {
                title: 'Inset Glow',
                sliders: [
                  { label: 'Blur', value: insetBlur, min: 0, max: 8, step: 0.5, onChange: setInsetBlur },
                  { label: 'Opacity', value: insetOpacity, min: 0, max: 1, step: 0.05, onChange: setInsetOpacity },
                ],
              },
              {
                title: 'OKLCH Pipeline',
                sliders: [
                  { label: 'Max Chroma', value: debugMaxC, min: 0.03, max: 0.18, step: 0.002, onChange: setDebugMaxC },
                  { label: 'Min Chroma', value: debugMinC, min: 0.00, max: 0.10, step: 0.002, onChange: setDebugMinC },
                  { label: 'Chroma Scale', value: debugChromaScale, min: 0.1, max: 2.0, step: 0.02, onChange: setDebugChromaScale },
                  { label: 'Target L', value: debugTargetL, min: 0.15, max: 0.60, step: 0.01, onChange: setDebugTargetL },
                  { label: 'Dark C Scale', value: debugDarkCScale, min: 0.5, max: 1.0, step: 0.02, onChange: setDebugDarkCScale },
                ],
              },
            ]}
          />
        )}
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
          scoringType={scoringType}
          seedColor={seedColor}
          effectiveColorMode={effectiveColorMode}
          portraitSwatches={state.portraitSwatches ?? EMPTY_SWATCHES}
          cardBgAlpha={cardBgAlpha}
        />

        {
          /* Showcase full card — CSS custom properties for card theme allow imperative
          color updates during drag without React re-renders */
        }
        <div
          id={id}
          className='characterPreview'
          style={{
            '--showcase-card-bg': withAlpha(derivedShowcaseTheme.cardBackgroundColor, cardBgAlpha),
            '--showcase-card-border': derivedShowcaseTheme.cardBorderColor,
            '--showcase-shadow': buildShadow(shadowX, shadowY, shadowBlur, shadowOpacity),
            '--showcase-shadow-inset': buildInsetShadow(insetBlur, insetOpacity),
            'color': 'rgba(220, 220, 220, 1)',
            'textShadow': textShadowPreset,
            'position': 'relative',
            'display': 'flex',
            'height': parentH,
            'background': 'var(--layer-inset)',
            'backgroundBlendMode': 'screen',
            'overflow': 'hidden',
            'borderRadius': 6,
            'transition': showcaseTransition,
            'gap': defaultGap,
          } as React.CSSProperties}
        >
          {/* Background — blurred portrait fill behind the card */}
          {(() => {
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
                }}
              />
            )
          })()}

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
          so the SegmentedControl reflects their selection even when combat score is unavailable */
        }
        {source !== ShowcaseSource.BUILDS_MODAL && (
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
