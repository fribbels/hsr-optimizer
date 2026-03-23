import chroma from 'chroma-js'
import { Button, Flex, Group, Text } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { cardTotalW, parentH } from 'lib/constants/constantsUi'
import {
  type ColorPipelineConfig,
  cloneConfig,
  DEFAULT_CONFIG,
} from 'lib/characterPreview/color/colorPipelineConfig'
import { getColorThiefPalette } from 'lib/characterPreview/color/colorThiefExtractor'
import { deriveAntdColorPrimaryActive } from 'lib/characterPreview/color/antdTokenCompat'
import { showcaseCardBackgroundColor, showcaseCardBorderColor } from 'lib/characterPreview/color/colorUtils'
import {
  oklchCardBackgroundColor,
  oklchCardBorderColor,
} from 'lib/characterPreview/color/colorUtilsOklch'
import { ColorDebugPanel, type Extractor } from 'lib/characterPreview/color/debug/ColorDebugPanel'
import { FULL_PRESETS, applyPreset } from 'lib/characterPreview/color/debug/colorPresets'
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
import type { PaletteResponse } from 'lib/characterPreview/color/vibrantFork'

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
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [config, setConfig] = useState<ColorPipelineConfig>(() => cloneConfig(DEFAULT_CONFIG))
  const [extractor, setExtractor] = useState<Extractor>('colorthief')
  const [extractionProgress, setExtractionProgress] = useState('')
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
      setTimeout(() => pushToAllCards(config), 100)
    } else {
      void runColorThiefExtraction(allCharacters, colorThiefPalettes.current, colorThiefSeeds.current, config, darkMode, setExtractionProgress)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCharacters])

  const displayCharacters = useMemo(() => {
    if (shuffleSeed === 0) return allCharacters
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
  // Push OKLCH pipeline colors to all card DOM elements
  // -----------------------------------------------------------------------
  const pushToAllCards = useCallback((cfg: ColorPipelineConfig) => {
    for (const char of allCharacters) {
      const el = document.getElementById(`color-gallery-${char.id}`)
      if (!el) continue
      const seed = getSeedColor(char.id)
      el.style.setProperty('--showcase-card-bg', oklchCardBackgroundColor(seed, darkMode, cfg))
      el.style.setProperty('--showcase-card-border', oklchCardBorderColor(seed, darkMode, cfg))
    }
  }, [allCharacters, darkMode, getSeedColor])

  // -----------------------------------------------------------------------
  // Config change handler — update state + push to all cards
  // -----------------------------------------------------------------------
  const handleConfigChange = useCallback((next: ColorPipelineConfig) => {
    setConfig(next)
    pushToAllCards(next)
  }, [pushToAllCards])

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
        <Button size="xs" variant="light" onClick={() => setShuffleSeed((s) => s + 1)}>
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
            // Show handpicked colors using original pipeline (with antd token derivation)
            for (const char of allCharacters) {
              const el = document.getElementById(`color-gallery-${char.id}`)
              if (!el) continue
              const handpicked = getCharacterConfig(char.id)?.display.showcaseColor ?? DEFAULT_SHOWCASE_COLOR
              const derived = deriveAntdColorPrimaryActive(handpicked)
              el.style.setProperty('--showcase-card-bg', showcaseCardBackgroundColor(derived, darkMode))
              el.style.setProperty('--showcase-card-border', showcaseCardBorderColor(derived, darkMode))
            }
            console.log('[Gallery] Applied handpicked colors via original pipeline (antd darkAlgorithm → HSL)')
          }}
        >
          Show handpicked
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
      </Group>

      <Flex wrap="wrap" gap={50} style={{ maxWidth: 2500 }}>
        {pageCharacters.map((character) => (
          <div key={character.id} style={{ width: SCALED_W, height: SCALED_H, overflow: 'hidden' }}>
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
        onConfigChange={handleConfigChange}
        onExtractorChange={handleExtractorChange}
        onPresetApply={(presetConfig, seeds) => {
          for (const [k, v] of seeds) colorThiefSeeds.current.set(k, v)
          handleConfigChange(presetConfig)
        }}
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
  const { seeds } = applyPreset(FULL_PRESETS[0], new Map([['_', palette]]))
  return seeds.get('_') ?? palette.Vibrant
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
