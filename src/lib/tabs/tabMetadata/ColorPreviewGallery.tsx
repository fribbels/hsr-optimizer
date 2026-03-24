import chroma from 'chroma-js'
import { Button, Flex, Group, Text } from '@mantine/core'
import { buildPortraitFilterStr, CharacterPreview, getPortraitFilters } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { cardTotalW, parentH } from 'lib/constants/constantsUi'
import {
  type ColorPipelineConfig,
  cloneConfig,
  DEFAULT_CONFIG,
} from 'lib/characterPreview/color/colorPipelineConfig'
import { getColorThiefPalette } from 'lib/characterPreview/color/colorThiefExtractor'
import { deriveAntdColorPrimaryActive } from 'lib/characterPreview/color/antdTokenCompat'
import { showcaseCardBackgroundColor, showcaseCardBorderColor, showcaseBackgroundColor } from 'lib/characterPreview/color/colorUtils'
import {
  oklchBackgroundColor,
  oklchCardBackgroundColor,
  oklchCardBorderColor,
} from 'lib/characterPreview/color/colorUtilsOklch'
import { ColorDebugPanel, DEFAULT_PORTRAIT_FILTER, type Extractor, type PortraitFilterConfig } from 'lib/characterPreview/color/debug/ColorDebugPanel'
import {
  type HeuristicFlags,
  DEFAULT_HEURISTIC_FLAGS,
  hueNudge as applyHueNudge,
  applyChromaLUT,
  fixDisliked,
  adaptivePortraitFilter,
  gamutMapChroma,
  contrastAwareAlpha,
  seedRelativeLightness,
  complementaryBorderHue,
  CHROMA_COMPENSATE_MAX_C_MULT,
  estimatePortraitLuminance,
  createEdgeMaskedCanvas,
  createBlurredCanvas,
} from 'lib/characterPreview/color/colorHeuristics'
import { FULL_PRESETS, applyPreset, seedStrategies } from 'lib/characterPreview/color/debug/colorPresets'
import { DEFAULT_SHOWCASE_COLOR } from 'lib/characterPreview/color/showcaseColorService'
import { getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import { Parts } from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Character, CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { PaletteResponse } from 'lib/characterPreview/color/colorThiefExtractor'

const PALETTE_CACHE_KEY = 'colorDebug_colorthiefPalettes'

// Cache stores full palettes per character — optimizer picks best swatch
function loadPaletteCache(): Record<string, PaletteResponse> | null {
  try {
    const raw = localStorage.getItem(PALETTE_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePaletteCache(palettes: Map<string, PaletteResponse>) {
  localStorage.setItem(PALETTE_CACHE_KEY, JSON.stringify(Object.fromEntries(palettes)))
  console.log(`[Cache] Saved ${palettes.size} palettes to localStorage`)
}

function clearPaletteCache() {
  localStorage.removeItem(PALETTE_CACHE_KEY)
  console.log('[Cache] Cleared')
}

const SCALE = 1.0
const PER_PAGE = 30
const SCALED_W = Math.ceil(cardTotalW * SCALE)
const SCALED_H = Math.ceil(parentH * SCALE)

export function ColorPreviewGallery() {
  const [page, setPage] = useState(0)
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null)
  const [config, setConfig] = useState<ColorPipelineConfig>(() => cloneConfig(DEFAULT_CONFIG))
  const [extractor, setExtractor] = useState<Extractor>('colorthief')
  const [extractionProgress, setExtractionProgress] = useState('')
  const [portraitFilter, setPortraitFilter] = useState<PortraitFilterConfig>({ ...DEFAULT_PORTRAIT_FILTER })
  const [activePresetName, setActivePresetName] = useState('optimized')
  const [heuristics, setHeuristics] = useState<HeuristicFlags>({ ...DEFAULT_HEURISTIC_FLAGS })
  const heuristicsRef = useRef(heuristics)
  heuristicsRef.current = heuristics
  const darkMode = useGlobalStore((s) => s.savedSession.showcaseDarkMode ?? true)

  // colorthief-extracted full palettes, keyed by characterId
  const colorThiefPalettes = useRef(new Map<string, PaletteResponse>())
  // Derived: best seed per character (set by optimizer or default picker)
  const colorThiefSeeds = useRef(new Map<string, string>())
  // vibrant-extracted seed colors (forced from extraction, not char config)
  const vibrantSeeds = useRef(new Map<string, string>())

  const allCharacters = useMemo(() => {
    const metadata = getGameMetadata()

    const lcByPath = new Map<string, { id: string }>()
    for (const lc of Object.values(metadata.lightCones).sort((a, b) => b.rarity - a.rarity)) {
      if (!lcByPath.has(lc.path)) lcByPath.set(lc.path, lc)
    }

    // Grab +15 relics from store, grouped by part
    const allRelics = useRelicStore.getState().relics
    const relicsByPart: Partial<Record<Parts, string[]>> = {}
    for (const relic of allRelics) {
      if (relic.enhance !== 15) continue
      const list = relicsByPart[relic.part] ?? []
      list.push(relic.id)
      relicsByPart[relic.part] = list
    }

    const charIds = new Set(Object.keys(metadata.characters))
    const filtered = Object.values(metadata.characters)
      .filter((c) => !charIds.has(`${c.id}b1`))

    let relicIdx = 0
    return filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((charMeta) => {
        const charId = charMeta.id as CharacterId
        const form = getDefaultForm({ id: charId })
        const lc = lcByPath.get(charMeta.path)
        if (lc) {
          form.lightCone = lc.id as LightConeId
          form.lightConeSuperimposition = 1
        }

        // Assign random +15 relics (cycle through available)
        const equipped: Partial<Record<Parts, string>> = {}
        for (const part of [Parts.Head, Parts.Hands, Parts.Body, Parts.Feet, Parts.PlanarSphere, Parts.LinkRope]) {
          const pool = relicsByPart[part]
          if (pool && pool.length > 0) {
            equipped[part] = pool[relicIdx % pool.length]
          }
        }
        relicIdx++

        return { id: charId, equipped, form } as Character
      })
  }, [])

  // Auto-trigger colorthief extraction on mount — use cache if available
  const extractionStarted = useRef(false)
  useEffect(() => {
    // Debug: log current card state BEFORE we do anything
    const metadata = getGameMetadata()
    const logChars = allCharacters.slice(0, 3)
    for (const char of logChars) {
      const el = document.getElementById(`color-gallery-${char.id}`)
      if (!el) continue
      const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
      const name = metadata.characters[char.id]?.name ?? char.id
      console.log(`[Gallery] EFFECT START — ${name}:`, {
        extractionStarted: extractionStarted.current,
        cardBg: el.style.getPropertyValue('--showcase-card-bg'),
        cardBorder: el.style.getPropertyValue('--showcase-card-border'),
        background: el.style.background,
        portraitFilter: bgDiv?.style.filter || 'none set',
        seed: colorThiefSeeds.current.get(char.id) ?? 'no seed',
      })
    }

    if (extractionStarted.current || extractor !== 'colorthief') return
    extractionStarted.current = true

    const cached = loadPaletteCache()
    if (cached) {
      for (const [k, v] of Object.entries(cached)) colorThiefPalettes.current.set(k, v)
      // Derive seeds from cached palettes using default picker
      for (const [k, v] of colorThiefPalettes.current) {
        colorThiefSeeds.current.set(k, pickSeedFromPalette(v))
      }
      setExtractionProgress(`Loaded ${colorThiefPalettes.current.size} palettes from cache`)
      // Log what's being applied on mount/hot-reload
      console.log('[Gallery] Mount/HMR state:', {
        config: JSON.parse(JSON.stringify(config)),
        portraitFilter: { ...portraitFilter },
        heuristics: { ...heuristics },
        seedCount: colorThiefSeeds.current.size,
        firstSeed: colorThiefSeeds.current.values().next().value,
      })
      setTimeout(() => {
        // Log what the first few cards look like before and after push
        const logChars = allCharacters.slice(0, 5)
        const metadata = getGameMetadata()
        console.log('[Gallery] BEFORE pushToAllCards — first 5 cards:')
        for (const char of logChars) {
          const el = document.getElementById(`color-gallery-${char.id}`)
          if (!el) continue
          const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
          const name = metadata.characters[char.id]?.name ?? char.id
          const bgVal = el.style.getPropertyValue('--showcase-card-bg')
          console.log(`  ${name}:`, {
            cardBg: bgVal,
            cardBgOklch: bgVal ? (() => { try { return chroma(bgVal).oklch() } catch { return 'parse error' } })() : null,
            cardBorder: el.style.getPropertyValue('--showcase-card-border'),
            background: el.style.background,
            portraitFilter: bgDiv?.style.filter || 'none',
          })
        }
        pushToAllCards(config)
        console.log('[Gallery] AFTER pushToAllCards — first 5 cards:')
        for (const char of logChars) {
          const el = document.getElementById(`color-gallery-${char.id}`)
          if (!el) continue
          const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
          const name = metadata.characters[char.id]?.name ?? char.id
          const seed = getSeedColor(char.id)
          console.log(`  ${name}:`, {
            seed,
            seedOklch: chroma(seed).oklch(),
            cardBg: el.style.getPropertyValue('--showcase-card-bg'),
            cardBorder: el.style.getPropertyValue('--showcase-card-border'),
            background: el.style.background,
            portraitFilter: bgDiv?.style.filter || 'none',
          })
        }
      }, 100)
    } else {
      void runColorThiefExtraction(allCharacters, colorThiefPalettes.current, colorThiefSeeds.current, config, darkMode, setExtractionProgress)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCharacters])

  const displayCharacters = useMemo(() => {
    if (shuffleSeed == null) return allCharacters
    const shuffled = [...allCharacters]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [allCharacters, shuffleSeed])

  // -----------------------------------------------------------------------
  // Seed color resolution: picks the right seed for a character based on
  // current extractor mode
  // -----------------------------------------------------------------------
  const getSeedColor = useCallback((charId: CharacterId): string => {
    if (extractor === 'colorthief') {
      return colorThiefSeeds.current.get(charId) ?? DEFAULT_SHOWCASE_COLOR
    }
    // vibrant: use store-extracted color, or vibrant forced-extraction, or char config fallback
    const storeColor = useShowcaseTabStore.getState().portraitColorByCharacterId[charId]
    return vibrantSeeds.current.get(charId) ?? storeColor ?? DEFAULT_SHOWCASE_COLOR
  }, [extractor])

  // -----------------------------------------------------------------------
  // Heuristic-aware color computation for a single seed
  // Applies enabled heuristics at the right pipeline stage.
  // -----------------------------------------------------------------------
  const computeCardColors = useCallback((seed: string, cfg: ColorPipelineConfig, flags: HeuristicFlags, forBorder: boolean = false): string => {
    let [l, c, h] = chroma(seed).oklch()
    const inputL = l

    // Pre-normalization heuristics (modify seed LCH)
    if (flags.hueNudge) {
      h = applyHueNudge(h, c, l)
    }
    if (flags.dislikeFix) {
      const fixed = fixDisliked(l, c, h)
      l = fixed.l; c = fixed.c; h = fixed.h
    }

    // Normalization (inline, mirrors normalizeOklch but with heuristic hooks)
    const cardCfg = forBorder ? cfg.cardBorder : cfg.cardBg

    // Lightness
    let rawL = cardCfg.targetL + (l - 0.5) * cardCfg.lInputScale
    if (flags.seedRelativeL && !forBorder) {
      rawL = seedRelativeLightness(cardCfg.targetL, inputL)
    }
    let outL = Math.max(cardCfg.minL, Math.min(rawL, cardCfg.maxL))

    // Chroma — chromaCompensate widens the maxC ceiling
    const effectiveMaxC = flags.chromaCompensate ? cardCfg.maxC * CHROMA_COMPENSATE_MAX_C_MULT : cardCfg.maxC
    const powered = Math.pow(c, cardCfg.chromaPower)
    let scaledC = Math.max(cardCfg.minC, Math.min(powered * cardCfg.chromaScale, effectiveMaxC))
    if (flags.chromaLUT) {
      scaledC = applyChromaLUT(scaledC, h)
      scaledC = Math.max(cardCfg.minC, Math.min(scaledC, effectiveMaxC))
    }

    // Gamut map: push chroma to fraction of gamut boundary (overrides normal scaling)
    if (flags.gamutMap) {
      scaledC = gamutMapChroma(outL, scaledC, h)
    }

    // Hue
    let outH = (h + cardCfg.hueShift) % 360
    if (flags.compBorder && forBorder) {
      outH = complementaryBorderHue(outH)
    }

    // Alpha — adaptive: dark seeds more transparent, light seeds more opaque
    let alpha = cardCfg.alpha
    if (flags.contrastAlpha && !forBorder) {
      alpha = contrastAwareAlpha(outL, 0, alpha, inputL)
    }

    // Dark mode
    if (darkMode) {
      outL = Math.max(0, outL + cfg.darkMode.lOffset)
      scaledC = scaledC * cfg.darkMode.cScale
    }

    const result = chroma.oklch(outL, scaledC, outH).alpha(alpha)
    if (result.clipped()) {
      // Binary search for safe chroma
      let lo = 0, hi = scaledC
      for (let i = 0; i < 10; i++) {
        const mid = (lo + hi) / 2
        if (chroma.oklch(outL, mid, outH).clipped()) hi = mid; else lo = mid
      }
      return chroma.oklch(outL, lo * 0.95, outH).alpha(alpha).css()
    }
    return result.css()
  }, [darkMode])

  // -----------------------------------------------------------------------
  // Push OKLCH pipeline colors to all card DOM elements
  // -----------------------------------------------------------------------
  const pushToAllCards = useCallback((cfg: ColorPipelineConfig, flags?: HeuristicFlags) => {
    const f = flags ?? heuristicsRef.current
    const anyHeuristic = Object.values(f).some(Boolean)
    for (const char of allCharacters) {
      const el = document.getElementById(`color-gallery-${char.id}`)
      if (!el) continue
      const seed = getSeedColor(char.id)
      if (anyHeuristic) {
        el.style.setProperty('--showcase-card-bg', computeCardColors(seed, cfg, f, false))
        el.style.setProperty('--showcase-card-border', computeCardColors(seed, cfg, f, true))
      } else {
        el.style.setProperty('--showcase-card-bg', oklchCardBackgroundColor(seed, darkMode, cfg))
        el.style.setProperty('--showcase-card-border', oklchCardBorderColor(seed, darkMode, cfg))
      }
      el.style.background = oklchBackgroundColor(seed, darkMode, cfg)

      // Adaptive portrait: per-character portrait filter
      if (f.adaptivePortrait) {
        const [sl, sc, sh] = chroma(seed).oklch()
        const adapted = adaptivePortraitFilter(sl, sc, sh)
        const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
        if (bgDiv) {
          const filterStr = `blur(${adapted.blur}px) brightness(${adapted.brightness}) saturate(${adapted.saturate})`
          bgDiv.style.filter = filterStr
          bgDiv.style.webkitFilter = filterStr
        }
      }
    }
  }, [allCharacters, darkMode, getSeedColor, computeCardColors])

  // Push portrait background filter to all cards
  const pushPortraitFilter = useCallback((_filter?: PortraitFilterConfig) => {
    const filterStr = buildPortraitFilterStr(getPortraitFilters())
    for (const char of allCharacters) {
      const el = document.getElementById(`color-gallery-${char.id}`)
      if (!el) continue
      const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
      if (bgDiv) {
        bgDiv.style.filter = filterStr
        bgDiv.style.webkitFilter = filterStr
      }
    }
  }, [allCharacters])

  const handlePortraitFilterChange = useCallback((filter: PortraitFilterConfig) => {
    setPortraitFilter(filter)
    pushPortraitFilter(filter)
  }, [pushPortraitFilter])

  // -----------------------------------------------------------------------
  // Config change handler — update state + push to all cards
  // -----------------------------------------------------------------------
  const handleConfigChange = useCallback((next: ColorPipelineConfig) => {
    setConfig(next)
    pushToAllCards(next)
  }, [pushToAllCards])

  // -----------------------------------------------------------------------
  // Heuristics change — update state + re-push with new flags
  // -----------------------------------------------------------------------
  // Alternate palettes stored separately so we can swap back
  const edgePalettes = useRef(new Map<string, PaletteResponse>())
  const edgeSeeds = useRef(new Map<string, string>())
  const edgeExtracted = useRef(false)
  const blurPalettes = useRef(new Map<string, PaletteResponse>())
  const blurSeeds = useRef(new Map<string, string>())
  const blurExtracted = useRef(false)

  const handleHeuristicsChange = useCallback((next: HeuristicFlags) => {
    setHeuristics(next)
    heuristicsRef.current = next

    // Edge sample toggled on
    if (next.edgeSample && !heuristics.edgeSample) {
      if (edgeExtracted.current && edgePalettes.current.size > 0) {
        for (const [k, v] of edgeSeeds.current) colorThiefSeeds.current.set(k, v)
        pushToAllCards(config, next)
      } else {
        edgeExtracted.current = true
        void runEdgeExtraction(allCharacters, edgePalettes.current, edgeSeeds.current, setExtractionProgress)
          .then(() => {
            for (const [k, v] of edgeSeeds.current) colorThiefSeeds.current.set(k, v)
            pushToAllCards(config, heuristicsRef.current)
          })
      }
      return
    }

    // Blur sample toggled on
    if (next.blurSample && !heuristics.blurSample) {
      if (blurExtracted.current && blurPalettes.current.size > 0) {
        for (const [k, v] of blurSeeds.current) colorThiefSeeds.current.set(k, v)
        pushToAllCards(config, next)
      } else {
        blurExtracted.current = true
        void runBlurExtraction(allCharacters, blurPalettes.current, blurSeeds.current, setExtractionProgress)
          .then(() => {
            for (const [k, v] of blurSeeds.current) colorThiefSeeds.current.set(k, v)
            pushToAllCards(config, heuristicsRef.current)
          })
      }
      return
    }

    // Edge/blur sample toggled off: restore original seeds
    if ((!next.edgeSample && heuristics.edgeSample) || (!next.blurSample && heuristics.blurSample)) {
      for (const [k, v] of colorThiefPalettes.current) {
        colorThiefSeeds.current.set(k, pickSeedFromPalette(v))
      }
    }

    pushToAllCards(config, next)
    if (!next.adaptivePortrait) {
      pushPortraitFilter(portraitFilter)
    }
  }, [config, heuristics, allCharacters, pushToAllCards, pushPortraitFilter, portraitFilter])

  // -----------------------------------------------------------------------
  // Seed strategy change — re-derive all seeds from existing palettes
  // -----------------------------------------------------------------------
  useEffect(() => {
    const handler = () => {
      for (const [k, v] of colorThiefPalettes.current) {
        colorThiefSeeds.current.set(k, pickSeedFromPalette(v))
      }
      pushToAllCards(config)
      pushPortraitFilter()
    }
    window.addEventListener('seed-strategy-change', handler)
    return () => window.removeEventListener('seed-strategy-change', handler)
  }, [config, pushToAllCards, pushPortraitFilter])

  // -----------------------------------------------------------------------
  // Extractor change — run extraction for all characters
  // -----------------------------------------------------------------------
  const handleExtractorChange = useCallback((next: Extractor) => {
    setExtractor(next)

    if (next === 'colorthief') {
      void runColorThiefExtraction(allCharacters, colorThiefPalettes.current, colorThiefSeeds.current, config, darkMode, setExtractionProgress)
    } else {
      // Switch back to vibrant — re-push using vibrant/store seeds
      setExtractionProgress('')
      // Need to use a timeout so the extractor state is updated before getSeedColor reads it
      setTimeout(() => {
        for (const char of allCharacters) {
          const el = document.getElementById(`color-gallery-${char.id}`)
          if (!el) continue
          const storeColor = useShowcaseTabStore.getState().portraitColorByCharacterId[char.id]
          const seed = vibrantSeeds.current.get(char.id) ?? storeColor ?? DEFAULT_SHOWCASE_COLOR
          el.style.setProperty('--showcase-card-bg', oklchCardBackgroundColor(seed, darkMode, config))
          el.style.setProperty('--showcase-card-border', oklchCardBorderColor(seed, darkMode, config))
        }
      }, 0)
    }
  }, [allCharacters, config, darkMode])

  // Example seed for the comparison section (first character's seed)
  const exampleSeed = getSeedColor(allCharacters[0]?.id)

  const totalPages = Math.ceil(displayCharacters.length / PER_PAGE)
  const pageCharacters = displayCharacters.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <Flex direction="column" gap={12}>
      <Group>
        <Button size="xs" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Prev
        </Button>
        <Text size="sm">
          Page {page + 1} / {totalPages} ({allCharacters.length} characters)
        </Text>
        <Button size="xs" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          Next
        </Button>
        <Button size="xs" variant="light" onClick={() => {
          setShuffleSeed((s) => (s ?? 0) + 1)
          // Re-push colors + portrait filter after shuffle re-renders
          setTimeout(() => { pushToAllCards(config); pushPortraitFilter(portraitFilter) }, 50)
        }}>
          Shuffle
        </Button>
        <Button
          size="xs"
          variant="light"
          color="teal"
          onClick={() => evaluateFitness(allCharacters, colorThiefPalettes.current, colorThiefSeeds.current, config, darkMode)}
        >
          Evaluate fitness
        </Button>
        <Button
          size="xs"
          variant="light"
          color="orange"
          onClick={() => {
            void (async () => {
              const result = await runOptimizer(allCharacters, colorThiefPalettes.current, config, darkMode, setExtractionProgress)
              if (result) {
                for (const [k, v] of result.bestSeeds) colorThiefSeeds.current.set(k, v)
                handleConfigChange(result.config)
              }
            })()
          }}
        >
          Auto-optimize
        </Button>
        <Button
          size="xs"
          variant="light"
          color="cyan"
          onClick={() => {
            // Exact HMR replica: raw handpicked seed → old HSL pipeline, brightness 0.70, solid dark bg
            const hmrPortraitFilter = 'blur(18px) brightness(0.70) saturate(0.80)'
            for (const char of allCharacters) {
              const el = document.getElementById(`color-gallery-${char.id}`)
              if (!el) continue
              const handpicked = getCharacterConfig(char.id)?.display.showcaseColor ?? DEFAULT_SHOWCASE_COLOR
              el.style.setProperty('--showcase-card-bg', showcaseCardBackgroundColor(handpicked, darkMode))
              el.style.setProperty('--showcase-card-border', showcaseCardBorderColor(handpicked, darkMode))
              el.style.background = showcaseBackgroundColor('#1a1b1e', darkMode)
              const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
              if (bgDiv) {
                bgDiv.style.filter = hmrPortraitFilter
                bgDiv.style.webkitFilter = hmrPortraitFilter
              }
            }
            setActivePresetName('handpickedHMR')
            console.log('[Gallery] Applied HMR replica: handpicked → HSL, brightness 0.70, solid dark bg')
          }}
        >
          Show handpicked
        </Button>
        <Button
          size="xs"
          variant="light"
          color="cyan"
          onClick={() => {
            // Apply old HSL pipeline using extracted seeds (what hot reload shows)
            for (const char of allCharacters) {
              const el = document.getElementById(`color-gallery-${char.id}`)
              if (!el) continue
              const seed = getSeedColor(char.id)
              el.style.setProperty('--showcase-card-bg', showcaseCardBackgroundColor(seed, darkMode))
              el.style.setProperty('--showcase-card-border', showcaseCardBorderColor(seed, darkMode))
              el.style.background = showcaseBackgroundColor(seed, darkMode)
            }
            setActivePresetName('oldHSL')
            console.log('[Gallery] Applied old HSL pipeline with extracted seeds')
          }}
        >
          Old HSL pipeline
        </Button>
        <Button
          size="xs"
          variant="subtle"
          color="grape"
          onClick={() => analyzeAntdTransform(allCharacters)}
        >
          Analyze antd
        </Button>
        <Button
          size="xs"
          variant="subtle"
          color="red"
          onClick={() => {
            clearPaletteCache()
            colorThiefPalettes.current.clear()
            colorThiefSeeds.current.clear()
            extractionStarted.current = false
            setExtractionProgress('Cache cleared — re-extracting...')
            void runColorThiefExtraction(allCharacters, colorThiefPalettes.current, colorThiefSeeds.current, config, darkMode, setExtractionProgress)
          }}
        >
          Clear cache
        </Button>
        <Button
          size="xs"
          variant="light"
          color="pink"
          onClick={() => {
            void fetchDanbooruPortraits(
              pageCharacters,
              colorThiefPalettes.current,
              colorThiefSeeds.current,
              setExtractionProgress,
              (charId) => {
                // Re-push colors for this card using current config + heuristics
                const el = document.getElementById(`color-gallery-${charId}`)
                if (!el) return
                const seed = colorThiefSeeds.current.get(charId)
                if (!seed) return
                const f = heuristicsRef.current
                const anyH = Object.values(f).some(Boolean)
                if (anyH) {
                  el.style.setProperty('--showcase-card-bg', computeCardColors(seed, config, f, false))
                  el.style.setProperty('--showcase-card-border', computeCardColors(seed, config, f, true))
                } else {
                  el.style.setProperty('--showcase-card-bg', oklchCardBackgroundColor(seed, darkMode, config))
                  el.style.setProperty('--showcase-card-border', oklchCardBorderColor(seed, darkMode, config))
                }
                el.style.background = oklchBackgroundColor(seed, darkMode, config)
                // Apply portrait filter
                const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
                if (bgDiv) {
                  const pFilterStr = buildPortraitFilterStr(getPortraitFilters())
                  bgDiv.style.filter = pFilterStr
                  bgDiv.style.webkitFilter = pFilterStr
                }
              },
            )
          }}
        >
          Danbooru portraits
        </Button>
      </Group>

      <Flex wrap="wrap" gap={20} style={{ maxWidth: SCALED_W * 3 + 20 * 2 }}>
        {pageCharacters.map((character) => (
          <div key={character.id} style={{ width: SCALED_W, height: SCALED_H, overflow: 'hidden', color: '#dddddd' }}>
            <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
              <CharacterPreview
                character={character}
                id={`color-gallery-${character.id}`}
                source={ShowcaseSource.BUILDS_MODAL}
                savedBuildOverride={null}
              />
            </div>
          </div>
        ))}
      </Flex>

      <ColorDebugPanel
        config={config}
        extractor={extractor}
        exampleSeedColor={exampleSeed}
        darkMode={darkMode}
        extractionProgress={extractionProgress}
        palettes={colorThiefPalettes.current}
        activePresetName={activePresetName}
        portraitFilter={portraitFilter}
        heuristics={heuristics}
        onConfigChange={handleConfigChange}
        onExtractorChange={handleExtractorChange}
        onPresetApply={(presetConfig, seeds, presetName, presetPortrait, useHSL) => {
          for (const [k, v] of seeds) colorThiefSeeds.current.set(k, v)
          setActivePresetName(presetName)

          if (useHSL) {
            // Apply old HSL pipeline with handpicked seeds (matches HMR / production)
            const portraitFilterStr = `blur(${presetPortrait.blur}px) brightness(${presetPortrait.brightness}) saturate(${presetPortrait.saturate})`
            for (const char of allCharacters) {
              const el = document.getElementById(`color-gallery-${char.id}`)
              if (!el) continue
              const handpicked = getCharacterConfig(char.id)?.display.showcaseColor ?? DEFAULT_SHOWCASE_COLOR
              el.style.setProperty('--showcase-card-bg', showcaseCardBackgroundColor(handpicked, darkMode))
              el.style.setProperty('--showcase-card-border', showcaseCardBorderColor(handpicked, darkMode))
              el.style.background = showcaseBackgroundColor('#1a1b1e', darkMode)
              const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
              if (bgDiv) {
                bgDiv.style.filter = portraitFilterStr
                bgDiv.style.webkitFilter = portraitFilterStr
              }
            }
            setConfig(presetConfig)
            setPortraitFilter(presetPortrait)
          } else {
            handleConfigChange(presetConfig)
            handlePortraitFilterChange(presetPortrait)
          }
        }}
        onPortraitFilterChange={handlePortraitFilterChange}
        onHeuristicsChange={handleHeuristicsChange}
      />
    </Flex>
  )
}

// ---------------------------------------------------------------------------
// Async colorthief extraction — runs progressively, updates cards as it goes
// ---------------------------------------------------------------------------
const CONCURRENCY = 8

async function runColorThiefExtraction(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  seedMap: Map<string, string>,
  config: ColorPipelineConfig,
  darkMode: boolean,
  setProgress: (msg: string) => void,
) {
  const toExtract = characters.filter((c) => !paletteMap.has(c.id))
  let done = characters.length - toExtract.length
  setProgress(`Extracting ${done}/${characters.length}...`)

  for (let i = 0; i < toExtract.length; i += CONCURRENCY) {
    const batch = toExtract.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async (char) => {
      try {
        const imgSrc = Assets.getCharacterPortraitById(char.id)
        const palette = await getColorThiefPalette(imgSrc)
        if (palette) {
          paletteMap.set(char.id, palette)
          const seed = pickSeedFromPalette(palette)
          seedMap.set(char.id, seed)

          const el = document.getElementById(`color-gallery-${char.id}`)
          if (el) {
            el.style.setProperty('--showcase-card-bg', oklchCardBackgroundColor(seed, darkMode, config))
            el.style.setProperty('--showcase-card-border', oklchCardBorderColor(seed, darkMode, config))
          }
        }
      } catch (e) {
        console.error(`[colorthief] Failed for ${char.id}`, e)
      }
      done++
    }))
    setProgress(`Extracting ${done}/${characters.length}...`)
  }

  savePaletteCache(paletteMap)
  setProgress(`Done — ${paletteMap.size} extracted (cached)`)

  // Log all extracted colors for comparison
  const metadata = getGameMetadata()
  const logData = characters.map((char) => {
    const extracted = seedMap.get(char.id) ?? '—'
    const handpicked = getCharacterConfig(char.id)?.display.showcaseColor ?? '—'
    const name = metadata.characters[char.id]?.name ?? char.id
    return { name, id: char.id, extracted, handpicked }
  })
  console.table(logData)
}

// Default seed picker — delegates to the preset system's highestChroma strategy
function pickSeedFromPalette(palette: PaletteResponse): string {
  const strategyName = window.__seedStrategy ?? 'midCool'
  const picker = seedStrategies[strategyName] ?? seedStrategies.midCool
  return picker(palette, 'aggressive')
}

// ---------------------------------------------------------------------------
// Edge-only extraction — loads portrait, masks center, extracts from edges
// ---------------------------------------------------------------------------
async function runEdgeExtraction(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  seedMap: Map<string, string>,
  setProgress: (msg: string) => void,
) {
  let done = 0
  setProgress(`Edge extracting 0/${characters.length}...`)

  for (let i = 0; i < characters.length; i += CONCURRENCY) {
    const batch = characters.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async (char) => {
      try {
        const imgSrc = Assets.getCharacterPortraitById(char.id)
        const img = await loadImageForEdge(imgSrc)
        const edgeCanvas = createEdgeMaskedCanvas(img, 0.25)
        const palette = await getColorThiefPalette(edgeCanvas)
        if (palette) {
          paletteMap.set(char.id, palette)
          seedMap.set(char.id, pickSeedFromPalette(palette))
        }
      } catch (e) {
        console.error(`[edgeExtract] Failed for ${char.id}`, e)
      }
      done++
    }))
    setProgress(`Edge extracting ${done}/${characters.length}...`)
  }
  setProgress(`Edge extraction done — ${paletteMap.size} extracted`)
}

function loadImageForEdge(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// ---------------------------------------------------------------------------
// Blur extraction — simulates the blurred portrait background then extracts
// ---------------------------------------------------------------------------
async function runBlurExtraction(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  seedMap: Map<string, string>,
  setProgress: (msg: string) => void,
) {
  let done = 0
  setProgress(`Blur extracting 0/${characters.length}...`)

  for (let i = 0; i < characters.length; i += CONCURRENCY) {
    const batch = characters.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(async (char) => {
      try {
        const imgSrc = Assets.getCharacterPortraitById(char.id)
        const img = await loadImageForEdge(imgSrc)
        const blurCanvas = createBlurredCanvas(img)
        const palette = await getColorThiefPalette(blurCanvas)
        if (palette) {
          paletteMap.set(char.id, palette)
          seedMap.set(char.id, pickSeedFromPalette(palette))
        }
      } catch (e) {
        console.error(`[blurExtract] Failed for ${char.id}`, e)
      }
      done++
    }))
    setProgress(`Blur extracting ${done}/${characters.length}...`)
  }
  setProgress(`Blur extraction done — ${paletteMap.size} extracted`)
}

// ---------------------------------------------------------------------------
// Danbooru portrait fetch — grab random character art + extract colors
// Uses the public API with rating:general filter.
// ---------------------------------------------------------------------------
// Full mapping of game character names → Danbooru tags
const DANBOORU_TAGS: Record<string, string> = {
  'Acheron': 'acheron_(honkai:_star_rail)',
  'Aglaea': 'aglaea_(honkai:_star_rail)',
  'Anaxa': 'anaxa_(honkai:_star_rail)',
  'Argenti': 'argenti_(honkai:_star_rail)',
  'Arlan': 'arlan_(honkai:_star_rail)',
  'Ashveil': 'ashveil_(honkai:_star_rail)',
  'Asta': 'asta_(honkai:_star_rail)',
  'Aventurine': 'aventurine_(honkai:_star_rail)',
  'Bailu': 'bailu_(honkai:_star_rail)',
  'Black Swan': 'black_swan_(honkai:_star_rail)',
  'Blade': 'blade_(honkai:_star_rail)',
  'Boothill': 'boothill_(honkai:_star_rail)',
  'Bronya': 'bronya_rand',
  'Castorice': 'castorice_(honkai:_star_rail)',
  'Cerydra': 'cerydra_(honkai:_star_rail)',
  'Cipher': 'cipher_(honkai:_star_rail)',
  'Clara': 'clara_(honkai:_star_rail)',
  'Cyrene': 'cyrene_(honkai:_star_rail)',
  'Dan Heng': 'dan_heng_(honkai:_star_rail)',
  'Dan Heng \u2022 Imbibitor Lunae': 'dan_heng_(imbibitor_lunae)_(honkai:_star_rail)',
  'Dan Heng \u2022 Permansor Terrae': 'dan_heng_(permansor_terrae)_(honkai:_star_rail)',
  'Dr. Ratio': 'dr._ratio_(honkai:_star_rail)',
  'Evernight': 'evernight_(honkai:_star_rail)',
  'Feixiao': 'feixiao_(honkai:_star_rail)',
  'Firefly': 'firefly_(honkai:_star_rail)',
  'Fu Xuan': 'fu_xuan_(honkai:_star_rail)',
  'Fugue': 'fugue_(honkai:_star_rail)',
  'Gallagher': 'gallagher_(honkai:_star_rail)',
  'Gepard': 'gepard_landau',
  'Guinaifen': 'guinaifen_(honkai:_star_rail)',
  'Hanya': 'hanya_(honkai:_star_rail)',
  'Herta': 'herta_(honkai:_star_rail)',
  'Himeko': 'himeko_(honkai:_star_rail)',
  'Hook': 'hook_(honkai:_star_rail)',
  'Huohuo': 'huohuo_(honkai:_star_rail)',
  'Hyacine': 'hyacine_(honkai:_star_rail)',
  'Hysilens': 'hysilens_(honkai:_star_rail)',
  'Jade': 'jade_(honkai:_star_rail)',
  'Jiaoqiu': 'jiaoqiu_(honkai:_star_rail)',
  'Jing Yuan': 'jing_yuan',
  'Jingliu': 'jingliu_(honkai:_star_rail)',
  'Kafka': 'kafka_(honkai:_star_rail)',
  'Lingsha': 'lingsha_(honkai:_star_rail)',
  'Luka': 'luka_(honkai:_star_rail)',
  'Luocha': 'luocha_(honkai:_star_rail)',
  'Lynx': 'lynx_landau',
  'March 7th': 'march_7th_(honkai:_star_rail)',
  'Misha': 'misha_(honkai:_star_rail)',
  'Moze': 'moze_(honkai:_star_rail)',
  'Mydei': 'mydei_(honkai:_star_rail)',
  'Natasha': 'natasha_(honkai:_star_rail)',
  'Pela': 'pela_(honkai:_star_rail)',
  'Phainon': 'phainon_(honkai:_star_rail)',
  'Qingque': 'qingque_(honkai:_star_rail)',
  'Rappa': 'rappa_(honkai:_star_rail)',
  'Robin': 'robin_(honkai:_star_rail)',
  'Ruan Mei': 'ruan_mei_(honkai:_star_rail)',
  'Sampo': 'sampo_koski',
  'Seele': 'seele_(honkai:_star_rail)',
  'Serval': 'serval_landau',
  'Silver Wolf': 'silver_wolf_(honkai:_star_rail)',
  'Sparkle': 'sparkle_(honkai:_star_rail)',
  'Sunday': 'sunday_(honkai:_star_rail)',
  'Sushang': 'sushang_(honkai:_star_rail)',
  'The Herta': 'the_herta_(honkai:_star_rail)',
  'Tingyun': 'tingyun_(honkai:_star_rail)',
  'Topaz': 'topaz_(honkai:_star_rail)',
  'Trailblazer': 'stelle_(honkai:_star_rail)',
  'Tribbie': 'tribbie_(honkai:_star_rail)',
  'Welt': 'welt_yang',
  'Xueyi': 'xueyi_(honkai:_star_rail)',
  'Yanqing': 'yanqing_(honkai:_star_rail)',
  'Yao Guang': 'yao_guang_(honkai:_star_rail)',
  'Yukong': 'yukong_(honkai:_star_rail)',
  'Yunli': 'yunli_(honkai:_star_rail)',
}

function resolveDanbooruTag(name: string): string | null {
  return DANBOORU_TAGS[name] ?? null
}

async function fetchDanbooruPortraits(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  seedMap: Map<string, string>,
  setProgress: (msg: string) => void,
  onCardReady?: (charId: string) => void,
) {
  const metadata = getGameMetadata()
  let done = 0
  let found = 0
  setProgress(`Fetching Danbooru 0/${characters.length}...`)

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    try {
      const name = metadata.characters[char.id]?.name ?? char.id
      const tag = resolveDanbooruTag(name)
      if (!tag) { done++; continue }

      // Try with solo first, fall back without it
      let validPosts: { file_url?: string; large_file_url?: string }[] = []
      for (const tags of [`${tag} rating:general solo`, `${tag} rating:general`]) {
        const url = `https://danbooru.donmai.us/posts.json?` + new URLSearchParams({ tags, limit: '20' })
        const resp = await fetch(url)
        if (!resp.ok) continue
        const posts = (await resp.json()) as { file_url?: string; large_file_url?: string }[]
        validPosts = posts.filter((p) => p.file_url || p.large_file_url)
        if (validPosts.length) break
      }
      if (!validPosts.length) {
        console.warn(`[Danbooru] No results for ${name} (${tag})`)
        continue
      }

      const post = validPosts[Math.floor(Math.random() * validPosts.length)]
      const imageUrl = post.large_file_url || post.file_url!

      // Fetch image as blob for both canvas extraction and display (avoids CORS)
      const imgResp = await fetch(imageUrl)
      const imgBlob = await imgResp.blob()
      const displayUrl = URL.createObjectURL(imgBlob)

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = reject
        el.src = displayUrl
      })

      const el = document.getElementById(`color-gallery-${char.id}`)
      if (el) {
        const bgDiv = el.querySelector('[data-portrait-bg]') as HTMLElement | null
        if (bgDiv) {
          bgDiv.style.backgroundImage = `url(${displayUrl})`
          const filterStr = buildPortraitFilterStr(getPortraitFilters())
          bgDiv.style.filter = filterStr
          bgDiv.style.webkitFilter = filterStr
        }

        const portraitContainer = el.querySelector('.character-build-portrait > div') as HTMLElement | null
        const portraitImg = portraitContainer?.querySelector('img') as HTMLImageElement | null
        if (portraitImg && portraitContainer) {
          portraitImg.src = displayUrl
          portraitImg.style.left = '0'
          portraitImg.style.top = '0'
          portraitImg.style.width = '100%'
          portraitImg.style.height = '100%'
          portraitImg.style.objectFit = 'cover'
          portraitImg.style.objectPosition = 'center 20%'
        }
      }

      const canvas = imageToCanvas(img)
      const palette = await getColorThiefPalette(canvas)
      if (palette) {
        paletteMap.set(char.id, palette)
        seedMap.set(char.id, pickSeedFromPalette(palette))
        onCardReady?.(char.id)

        // Debug: log seed color details
        const seed = seedMap.get(char.id)!
        const [sL, sC, sH] = chroma(seed).oklch()
        const allColors = [palette.Vibrant, palette.DarkVibrant, palette.Muted, palette.DarkMuted, palette.LightVibrant, palette.LightMuted, ...palette.colors]
        const colorInfo = allColors.slice(0, 6).map((c) => {
          const [l, ch, h] = chroma(c).oklch()
          return `${c} L:${l.toFixed(2)} C:${ch.toFixed(3)} H:${Math.round(h)}°`
        })
        console.log(
          `[Danbooru] ${name}: seed=${seed} L:${sL.toFixed(2)} C:${sC.toFixed(3)} H:${Math.round(sH)}°\n` +
          `  palette: ${colorInfo.join(' | ')}`,
        )
      }

      found++
    } catch (e) {
      console.warn(`[Danbooru] Failed for ${char.id}`, e)
    }
    done++
    setProgress(`Danbooru ${done}/${characters.length} (${found} found)...`)
    await new Promise((r) => setTimeout(r, 1000))
  }
  setProgress(`Danbooru done — ${found}/${characters.length} found`)
}

async function loadImageCors(url: string): Promise<HTMLImageElement> {
  // Try direct CORS load first
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.crossOrigin = 'anonymous'
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = url
    })
    return img
  } catch { /* CORS blocked — fall back to blob fetch */ }

  // Fetch as blob to bypass CORS on the image
  const resp = await fetch(url)
  const blob = await resp.blob()
  const blobUrl = URL.createObjectURL(blob)
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => { URL.revokeObjectURL(blobUrl); resolve(el) }
    el.onerror = reject
    el.src = blobUrl
  })
}

function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

// ---------------------------------------------------------------------------
// Fitness evaluation
//
// Ground truth:  OLD_HSL_PIPELINE(handpicked seed) → target background color
// Candidate:     NEW_OKLCH_PIPELINE(extracted seed) → candidate background color
// Score:         deltaE(target, candidate) — lower = new system reproduces hand-tuned look
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Coordinate descent optimizer
// Sweeps each normalization parameter while holding others fixed.
// Alpha params are excluded (tuned manually).
// Repeats until deltaE stops improving.
// ---------------------------------------------------------------------------

interface ParamDef {
  section: 'cardBg' | 'cardBorder' | 'outerBg' | 'darkMode'
  key: string
  min: number
  max: number
  steps: number
}

// Ranges informed by sensitivity analysis + optimizer convergence:
// - chromaPower always 1.0, hueShift always 0, maxL never hit → frozen
// - targetL: dominant, tightened around 0.28-0.40
// - minL/lInputScale: moderate impact, tightened
// - chroma params: low impact, coarse
const PARAM_DEFS: ParamDef[] = [
  { section: 'cardBg', key: 'targetL', min: 0.25, max: 0.40, steps: 30 },
  { section: 'cardBg', key: 'lInputScale', min: 0.0, max: 0.15, steps: 15 },
  { section: 'cardBg', key: 'minL', min: 0.05, max: 0.20, steps: 10 },
  { section: 'cardBg', key: 'maxC', min: 0.03, max: 0.06, steps: 10 },
  { section: 'cardBg', key: 'chromaScale', min: 0.4, max: 1.0, steps: 10 },
  { section: 'cardBg', key: 'minC', min: 0.01, max: 0.04, steps: 10 },
]

const SWATCH_KEYS = ['Vibrant', 'DarkVibrant', 'Muted', 'DarkMuted', 'LightVibrant', 'LightMuted'] as const
type SwatchKey = typeof SWATCH_KEYS[number]

// Evaluation pair: target bg + all candidate swatches for one character
interface EvalPair {
  name: string
  targetBg: string
  allColors: string[] // all swatches + palette colors, deduplicated, no fallbacks
}

const FALLBACK_BLUE = '#2241be'

function buildEvalPairs(characters: Character[], paletteMap: Map<string, PaletteResponse>, darkMode: boolean): EvalPair[] {
  const metadata = getGameMetadata()
  const pairs: EvalPair[] = []

  for (const char of characters) {
    const handpickedSeed = getCharacterConfig(char.id)?.display.showcaseColor
    if (!handpickedSeed) continue
    const palette = paletteMap.get(char.id)
    if (!palette) continue

    const derivedSeed = deriveAntdColorPrimaryActive(handpickedSeed)
    const targetBg = showcaseCardBackgroundColor(derivedSeed, darkMode)

    // Collect ALL colors: 6 swatches + extra palette colors
    const raw = [
      ...SWATCH_KEYS.map((k) => palette[k]),
      ...palette.colors,
    ]
    // Deduplicate and filter out the injected fallback blue
    const allColors = [...new Set(raw)].filter((c) => c !== FALLBACK_BLUE)

    const name = metadata.characters[char.id]?.name ?? char.id
    if (allColors.length > 0) {
      pairs.push({ name, targetBg, allColors })
    }
  }
  return pairs
}

const IGNORE_WORST_N = 10 // Exclude worst N outliers from avg (artistic mismatches)

// For each character, pick the color that gives lowest deltaE, return avg (excluding worst N)
function fastFitness(pairs: EvalPair[], config: ColorPipelineConfig, darkMode: boolean): number {
  const deltas: number[] = []
  for (const { targetBg, allColors } of pairs) {
    let bestDelta = Infinity
    for (const color of allColors) {
      const candidateBg = oklchCardBackgroundColor(color, darkMode, config)
      const delta = chroma.deltaE(targetBg, candidateBg)
      if (delta < bestDelta) bestDelta = delta
    }
    deltas.push(bestDelta)
  }
  // Sort ascending, drop the worst N
  deltas.sort((a, b) => a - b)
  const kept = deltas.slice(0, deltas.length - IGNORE_WORST_N)
  return kept.reduce((a, b) => a + b, 0) / kept.length
}

// For each character, return which color was picked
function pickBestColors(pairs: EvalPair[], config: ColorPipelineConfig, darkMode: boolean): Map<string, string> {
  const result = new Map<string, string>()
  for (const { name, targetBg, allColors } of pairs) {
    let bestColor = allColors[0]
    let bestDelta = Infinity
    for (const color of allColors) {
      const candidateBg = oklchCardBackgroundColor(color, darkMode, config)
      const delta = chroma.deltaE(targetBg, candidateBg)
      if (delta < bestDelta) {
        bestDelta = delta
        bestColor = color
      }
    }
    result.set(name, bestColor)
  }
  return result
}

function setParam(config: ColorPipelineConfig, def: ParamDef, value: number): ColorPipelineConfig {
  const clone = cloneConfig(config)
  const section = clone[def.section] as unknown as Record<string, number>
  section[def.key] = value
  return clone
}

interface OptimizerResult {
  config: ColorPipelineConfig
  bestSeeds: Map<string, string> // characterId → best swatch hex
}

const NUM_RESTARTS = 0
const MAX_ROUNDS = 8

// Generate a random config by sampling each param uniformly in its range.
// Alpha values are preserved from the start config.
function randomConfig(startConfig: ColorPipelineConfig): ColorPipelineConfig {
  let config = cloneConfig(startConfig)
  for (const def of PARAM_DEFS) {
    const val = def.min + Math.random() * (def.max - def.min)
    config = setParam(config, def, val)
  }
  // Fix constraint violations
  const bg = config.cardBg
  if (bg.maxC < bg.minC) bg.maxC = bg.minC
  if (bg.maxL < bg.minL) bg.maxL = bg.minL
  return config
}

const yieldToUI = () => new Promise<void>((r) => setTimeout(r, 0))

// Single coordinate descent run from a starting config
async function coordinateDescent(
  pairs: EvalPair[],
  startConfig: ColorPipelineConfig,
  darkMode: boolean,
  label: string,
): Promise<{ config: ColorPipelineConfig; score: number }> {
  let config = cloneConfig(startConfig)
  let bestScore = fastFitness(pairs, config, darkMode)

  for (let round = 0; round < MAX_ROUNDS; round++) {
    let improved = false

    for (const def of PARAM_DEFS) {
      const prevVal = (config[def.section] as unknown as Record<string, number>)[def.key]
      let bestVal = prevVal
      let bestParamScore = bestScore

      for (let i = 0; i <= def.steps; i++) {
        const val = def.min + (def.max - def.min) * (i / def.steps)

        const sec = config[def.section] as unknown as Record<string, number>
        if (def.key === 'maxC' && val < sec.minC) continue
        if (def.key === 'minC' && val > sec.maxC) continue
        if (def.key === 'maxL' && val < sec.minL) continue
        if (def.key === 'minL' && val > sec.maxL) continue

        const candidate = setParam(config, def, val)
        const score = fastFitness(pairs, candidate, darkMode)
        if (score < bestParamScore) {
          bestParamScore = score
          bestVal = val
        }
      }

      if (bestParamScore < bestScore) {
        config = setParam(config, def, bestVal)
        bestScore = bestParamScore
        improved = true
      }
    }

    if (!improved) break
    await yieldToUI()
  }

  console.log(`[Optimizer]   ${label}: score=${bestScore.toFixed(3)}`)
  return { config, score: bestScore }
}

async function runOptimizer(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  startConfig: ColorPipelineConfig,
  darkMode: boolean,
  setProgress: (msg: string) => void,
): Promise<OptimizerResult | null> {
  const pairs = buildEvalPairs(characters, paletteMap, darkMode)
  if (pairs.length === 0) {
    console.warn('[Optimizer] No evaluation pairs — extraction may not be done yet')
    return null
  }

  const avgColors = pairs.reduce((sum, p) => sum + p.allColors.length, 0) / pairs.length
  const t0 = performance.now()
  console.log(`[Optimizer] ${pairs.length} chars, avg ${avgColors.toFixed(0)} colors each, ignoring worst ${IGNORE_WORST_N}, ${NUM_RESTARTS} restarts`)

  // Sensitivity analysis: sweep each param, log score range
  setProgress('Analyzing param sensitivity...')
  await yieldToUI()
  const baseScore = fastFitness(pairs, startConfig, darkMode)
  const sensitivity: { param: string; bestVal: number; bestScore: number; worstScore: number; impact: number }[] = []
  for (const def of PARAM_DEFS) {
    let best = baseScore, worst = baseScore, bestVal = (startConfig[def.section] as unknown as Record<string, number>)[def.key]
    for (let i = 0; i <= def.steps; i++) {
      const val = def.min + (def.max - def.min) * (i / def.steps)
      const score = fastFitness(pairs, setParam(startConfig, def, val), darkMode)
      if (score < best) { best = score; bestVal = val }
      if (score > worst) worst = score
    }
    sensitivity.push({ param: `${def.section}.${def.key}`, bestVal: Math.round(bestVal * 1000) / 1000, bestScore: Math.round(best * 100) / 100, worstScore: Math.round(worst * 100) / 100, impact: Math.round((worst - best) * 100) / 100 })
  }
  sensitivity.sort((a, b) => b.impact - a.impact)
  console.log('[Optimizer] Param sensitivity (impact = worst - best score across range):')
  console.table(sensitivity)

  // Run from the user's current config first
  setProgress('Optimizing: start config...')
  let best = await coordinateDescent(pairs, startConfig, darkMode, 'Start config')
  console.log(`[Optimizer] Best so far: ${best.score.toFixed(3)}`)

  // Random restarts
  for (let r = 0; r < NUM_RESTARTS; r++) {
    setProgress(`Optimizing: restart ${r + 1}/${NUM_RESTARTS} (best: ${best.score.toFixed(2)})`)
    await yieldToUI()
    const candidate = await coordinateDescent(pairs, randomConfig(startConfig), darkMode, `Restart ${r + 1}/${NUM_RESTARTS}`)
    if (candidate.score < best.score) {
      best = candidate
      console.log(`[Optimizer] ★ New best: ${best.score.toFixed(3)} (restart ${r + 1})`)
    }
  }
  setProgress('')

  const config = best.config

  // Pick best color per character with final config
  const bestColorsByName = pickBestColors(pairs, config, darkMode)

  // Log per-character results
  const perChar: { name: string; bestColor: string; deltaE: number }[] = []
  for (const { name, targetBg, allColors } of pairs) {
    const bestColor = bestColorsByName.get(name)!
    const candidateBg = oklchCardBackgroundColor(bestColor, darkMode, config)
    const deltaE = chroma.deltaE(targetBg, candidateBg)
    perChar.push({ name, bestColor, deltaE: Math.round(deltaE * 100) / 100 })
  }
  perChar.sort((a, b) => b.deltaE - a.deltaE)

  const elapsed = performance.now() - t0
  console.log(`[Optimizer] Done in ${(elapsed / 1000).toFixed(1)}s — best score: ${best.score.toFixed(3)}`)
  console.log('[Optimizer] Optimal cardBg:', JSON.stringify(config.cardBg, null, 2))

  // Log where each param landed relative to its range
  const paramPositions = PARAM_DEFS.map((def) => {
    const val = (config[def.section] as unknown as Record<string, number>)[def.key]
    const pct = ((val - def.min) / (def.max - def.min) * 100)
    const atBoundary = pct <= 2 ? '⚠ AT MIN' : pct >= 98 ? '⚠ AT MAX' : ''
    return { param: `${def.section}.${def.key}`, value: Math.round(val * 1000) / 1000, min: def.min, max: def.max, pctInRange: Math.round(pct), atBoundary }
  })
  console.log('[Optimizer] Param positions (check for boundary hits → may need wider range):')
  console.table(paramPositions)
  console.log('[Optimizer] Per-character (worst first):')
  console.table(perChar)

  // Convert name-keyed map to characterId-keyed
  const metadata = getGameMetadata()
  const nameToId = new Map(characters.map((c) => [metadata.characters[c.id]?.name, c.id]))
  const bestSeedsById = new Map<string, string>()
  for (const [name, color] of bestColorsByName) {
    const id = nameToId.get(name)
    if (id) bestSeedsById.set(id, color)
  }

  return { config, bestSeeds: bestSeedsById }
}

function evaluateFitness(
  characters: Character[],
  paletteMap: Map<string, PaletteResponse>,
  seedMap: Map<string, string>,
  config: ColorPipelineConfig,
  darkMode: boolean,
) {
  const metadata = getGameMetadata()
  const results: { name: string; handpickedSeed: string; usedSeed: string; whichSwatch: string; deltaE: number }[] = []
  let totalDelta = 0
  let count = 0

  for (const char of characters) {
    const handpickedSeed = getCharacterConfig(char.id)?.display.showcaseColor
    if (!handpickedSeed) continue
    const palette = paletteMap.get(char.id)
    const usedSeed = seedMap.get(char.id)
    if (!usedSeed) continue

    const derivedSeed = deriveAntdColorPrimaryActive(handpickedSeed)
    const targetBg = showcaseCardBackgroundColor(derivedSeed, darkMode)
    const candidateBg = oklchCardBackgroundColor(usedSeed, darkMode, config)
    const deltaE = chroma.deltaE(targetBg, candidateBg)

    // Figure out which swatch was used
    let whichSwatch = 'unknown'
    if (palette) {
      for (const key of SWATCH_KEYS) {
        if (palette[key] === usedSeed) { whichSwatch = key; break }
      }
    }

    const name = metadata.characters[char.id]?.name ?? char.id
    results.push({ name, handpickedSeed, usedSeed, whichSwatch, deltaE: Math.round(deltaE * 100) / 100 })
    totalDelta += deltaE
    count++
  }

  results.sort((a, b) => b.deltaE - a.deltaE)
  console.log(`[Fitness] Avg deltaE: ${(totalDelta / count).toFixed(2)} across ${count} characters (lower = better)`)
  console.log('[Fitness] All results (worst first):')
  console.table(results)
}

// ---------------------------------------------------------------------------
// Analyze antd's colorPrimaryActive transformation in OKLCH space.
// Helps us build a pure replacement without the antd dependency.
// ---------------------------------------------------------------------------
function analyzeAntdTransform(characters: Character[]) {
  const metadata = getGameMetadata()
  const rows: {
    name: string
    inputHex: string
    outputHex: string
    inL: number; inC: number; inH: number
    outL: number; outC: number; outH: number
    dL: number; dC: number; dH: number
  }[] = []

  for (const char of characters) {
    const seed = getCharacterConfig(char.id)?.display.showcaseColor
    if (!seed) continue

    const derived = deriveAntdColorPrimaryActive(seed)
    const [inL, inC, inH] = chroma(seed).oklch()
    const [outL, outC, outH] = chroma(derived).oklch()

    const name = metadata.characters[char.id]?.name ?? char.id
    rows.push({
      name,
      inputHex: seed,
      outputHex: derived,
      inL: Math.round(inL * 1000) / 1000,
      inC: Math.round(inC * 1000) / 1000,
      inH: Math.round(inH * 10) / 10,
      outL: Math.round(outL * 1000) / 1000,
      outC: Math.round(outC * 1000) / 1000,
      outH: Math.round(outH * 10) / 10,
      dL: Math.round((outL - inL) * 1000) / 1000,
      dC: Math.round((outC - inC) * 1000) / 1000,
      dH: Math.round((outH - inH) * 10) / 10,
    })
  }

  // Summary statistics
  const dLs = rows.map((r) => r.dL)
  const dCs = rows.map((r) => r.dC)
  const dHs = rows.map((r) => r.dH)
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const min = (arr: number[]) => Math.min(...arr)
  const max = (arr: number[]) => Math.max(...arr)
  const std = (arr: number[]) => {
    const m = avg(arr)
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
  }

  console.log('[AntD Analysis] Per-character OKLCH transformation (input → output):')
  console.table(rows)
  console.log('[AntD Analysis] Delta summary:')
  console.table({
    dL: { avg: avg(dLs).toFixed(4), min: min(dLs).toFixed(4), max: max(dLs).toFixed(4), std: std(dLs).toFixed(4) },
    dC: { avg: avg(dCs).toFixed(4), min: min(dCs).toFixed(4), max: max(dCs).toFixed(4), std: std(dCs).toFixed(4) },
    dH: { avg: avg(dHs).toFixed(4), min: min(dHs).toFixed(4), max: max(dHs).toFixed(4), std: std(dHs).toFixed(4) },
  })

  // Check if it's a simple linear relationship
  console.log('[AntD Analysis] Scatter data for regression (paste into spreadsheet):')
  console.log('inL,outL,inC,outC,inH,outH')
  for (const r of rows) {
    console.log(`${r.inL},${r.outL},${r.inC},${r.outC},${r.inH},${r.outH}`)
  }
}
