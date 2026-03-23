// ---------------------------------------------------------------------------
// Preset definitions: seed selection strategy + normalization config combos.
// Each preset fully describes how to go from extracted palette → card background.
// ---------------------------------------------------------------------------

import chroma from 'chroma-js'
import type { ColorPipelineConfig, CardColorConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { DEFAULT_CONFIG, cloneConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { deriveAntdColorPrimaryActive } from 'lib/characterPreview/color/antdTokenCompat'
import type { PaletteResponse } from 'lib/characterPreview/color/vibrantFork'

const FALLBACK_BLUE = '#2241be'
const SWATCH_KEYS = ['Vibrant', 'DarkVibrant', 'Muted', 'DarkMuted', 'LightVibrant', 'LightMuted'] as const

// ---------------------------------------------------------------------------
// Hue avoidance
// ---------------------------------------------------------------------------
function isAvoidedHue(h: number, c: number, l: number): boolean {
  // Yellow-greens (Material Design "disliked" range ~80-130°)
  if (h >= 80 && h <= 130 && c > 0.04) return true
  // Browns / muddy warm tones (~30-80°, low-mid L, low-mid chroma)
  if (h >= 30 && h <= 80 && c > 0.03 && l < 0.55) return true
  // Brown-reds / dirty reds (~15-45°, low chroma = muddy, low L = dark)
  if (h >= 15 && h <= 45 && c < 0.13 && l < 0.50) return true
  // Skin tones (peach/tan ~40-70°, low-mid chroma)
  if (h >= 40 && h <= 70 && c > 0.02 && c < 0.12) return true
  return false
  // Note: light reds/pinks (h ~0-20° or ~340-360°, high L) are NOT penalized
}

function isCoolHue(h: number): boolean {
  return (h >= 180 && h <= 310)
}

// ---------------------------------------------------------------------------
// Seed selection strategies
// ---------------------------------------------------------------------------
type SeedPicker = (palette: PaletteResponse) => string

function getAllColors(palette: PaletteResponse): string[] {
  return [
    ...SWATCH_KEYS.map((k) => palette[k]),
    ...palette.colors,
  ].filter((c) => c !== FALLBACK_BLUE)
}

const seedStrategies: Record<string, SeedPicker> = {
  highestChroma: (palette) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l)) score *= 0.1
      if (score > bestScore) { bestScore = score; best = color }
    }
    return best
  },

  vibrantFirst: (palette) => {
    const v = palette.Vibrant
    if (v !== FALLBACK_BLUE) {
      const [l, c, h] = chroma(v).oklch()
      if (!isAvoidedHue(h, c, l) && c > 0.05) return v
    }
    return seedStrategies.highestChroma(palette)
  },

  darkVibrant: (palette) => {
    const dv = palette.DarkVibrant
    if (dv !== FALLBACK_BLUE) {
      const [l, c, h] = chroma(dv).oklch()
      if (!isAvoidedHue(h, c, l) && c > 0.03) return dv
    }
    return seedStrategies.highestChroma(palette)
  },

  populationWeighted: (palette) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (let i = 0; i < all.length; i++) {
      const [l, c, h] = chroma(all[i]).oklch()
      const popWeight = 1 / (1 + i * 0.1)
      let score = c * popWeight
      if (isAvoidedHue(h, c, l)) score *= 0.1
      if (score > bestScore) { bestScore = score; best = all[i] }
    }
    return best
  },

  coolBias: (palette) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l)) score *= 0.1
      if (isCoolHue(h)) score *= 1.5
      if (score > bestScore) { bestScore = score; best = color }
    }
    return best
  },

  noAvoidance: (palette) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestC = 0
    for (const color of all) {
      const c = chroma(color).oklch()[1]
      if (c > bestC) { bestC = c; best = color }
    }
    return best
  },
}

// ---------------------------------------------------------------------------
// Seed preprocessors
// ---------------------------------------------------------------------------
type SeedPreprocessor = (seed: string) => string

const seedPreprocessors: Record<string, SeedPreprocessor> = {
  none: (s) => s,
  antdDerived: (s) => deriveAntdColorPrimaryActive(s),
  chromaBoost: (s) => {
    const [l, c, h] = chroma(s).oklch()
    return chroma.oklch(l, Math.min(c * 1.5, 0.35), h).hex()
  },
  desat: (s) => {
    const [l, c, h] = chroma(s).oklch()
    return chroma.oklch(l, c * 0.5, h).hex()
  },
}

// ---------------------------------------------------------------------------
// Config helpers
// ---------------------------------------------------------------------------
function withCardBg(overrides: Partial<CardColorConfig>): ColorPipelineConfig {
  const cfg = cloneConfig(DEFAULT_CONFIG)
  Object.assign(cfg.cardBg, overrides)
  return cfg
}

// ---------------------------------------------------------------------------
// Preset definitions
// ---------------------------------------------------------------------------
export interface FullPreset {
  name: string
  seedStrategy: string
  seedPreprocess: string
  config: ColorPipelineConfig
  description: string
}

export const FULL_PRESETS: FullPreset[] = [
  // --- Seed selection variants (all use optimized config) ---
  {
    name: 'optimized',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Optimizer output + highest chroma seed + hue avoidance',
  },
  {
    name: 'vibrantFirst',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Prefer colorthief Vibrant swatch',
  },
  {
    name: 'darkVibrant',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Prefer DarkVibrant for darker seeds',
  },
  {
    name: 'populationWt',
    seedStrategy: 'populationWeighted',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Balance vividness with image dominance',
  },
  {
    name: 'coolBias',
    seedStrategy: 'coolBias',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Prefer blue/purple/cyan tones',
  },
  {
    name: 'noAvoidance',
    seedStrategy: 'noAvoidance',
    seedPreprocess: 'none',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Pure chroma, no hue penalties',
  },

  // --- Config variants (all use highestChroma seed) ---
  {
    name: 'darker',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.28, lInputScale: 0.05 }),
    description: 'Darker backgrounds',
  },
  {
    name: 'vividDark',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.26, chromaScale: 1.2, maxC: 0.08 }),
    description: 'Dark + strong color tint',
  },
  {
    name: 'muted',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.32, chromaScale: 0.3, maxC: 0.03 }),
    description: 'Subtle tinted gray',
  },
  {
    name: 'highContrast',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.22, chromaScale: 0.9, minC: 0.04, maxC: 0.08 }),
    description: 'Deep dark with strong tint',
  },
  {
    name: 'adaptive',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.30, lInputScale: 0.15 }),
    description: 'Heavy input-relative L scaling',
  },

  // --- Seed preprocessing variants ---
  {
    name: 'antdDerived',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'antdDerived',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Apply antd dark transform to seed first',
  },
  {
    name: 'chromaBoost',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'chromaBoost',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Boost seed chroma 1.5x before pipeline',
  },
  {
    name: 'desaturated',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'desat',
    config: cloneConfig(DEFAULT_CONFIG),
    description: 'Halve seed chroma before pipeline',
  },

  // --- Combined strategies ---
  {
    name: 'spotify',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.18, chromaScale: 1.5, minC: 0.03, maxC: 0.10 }),
    description: 'Spotify-style: dark + vivid dominant color',
  },
  {
    name: 'materialYou',
    seedStrategy: 'populationWeighted',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.22, chromaScale: 0.15, minC: 0.005, maxC: 0.02 }),
    description: 'Material Design 3: whisper of color',
  },
  {
    name: 'coolDark',
    seedStrategy: 'coolBias',
    seedPreprocess: 'antdDerived',
    config: withCardBg({ targetL: 0.28, chromaScale: 0.8, minC: 0.03, maxC: 0.06 }),
    description: 'Cool tones + antd transform + darker',
  },

  // --- Alpha & hue shift variants ---
  {
    name: 'opaqueDeep',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.26, alpha: 0.85 }),
    description: 'More opaque (0.85) + darker',
  },
  {
    name: 'glassy',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.34, alpha: 0.50 }),
    description: 'Semi-transparent (0.50) — background shows through',
  },
  {
    name: 'warmShift',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ hueShift: 15 }),
    description: 'Rotate hue +15° (warmer)',
  },
  {
    name: 'coolShift',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ hueShift: -15 }),
    description: 'Rotate hue -15° (cooler)',
  },
  {
    name: 'vividGlass',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'chromaBoost',
    config: withCardBg({ targetL: 0.30, alpha: 0.55, chromaScale: 1.0, maxC: 0.08 }),
    description: 'Vivid tint + transparency — rich but see-through',
  },
  {
    name: 'deepOpaque',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.20, alpha: 0.90, chromaScale: 0.9, minC: 0.03, maxC: 0.07 }),
    description: 'Very dark, nearly opaque, strong tint',
  },

  // --- Round 2: based on feedback ---
  {
    name: 'glassyMuted',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.34, alpha: 0.50, chromaScale: 0.4, maxC: 0.035 }),
    description: 'Glassy + less chroma (fix vividGlass shine)',
  },
  {
    name: 'glassyCool',
    seedStrategy: 'coolBias',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.34, alpha: 0.50, hueShift: -10 }),
    description: 'Glassy + cool tone bias + slight cool shift',
  },
  {
    name: 'glassyDkVib',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.32, alpha: 0.50 }),
    description: 'DarkVibrant seed + glassy',
  },
  {
    name: 'cleanDark',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.30, alpha: 0.65 }),
    description: 'DarkVibrant + slightly darker, moderate alpha',
  },
  {
    name: 'popGlassy',
    seedStrategy: 'populationWeighted',
    seedPreprocess: 'none',
    config: withCardBg({ targetL: 0.34, alpha: 0.50 }),
    description: 'Population-weighted seed + glassy',
  },
  {
    name: 'antdGlassy',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'antdDerived',
    config: withCardBg({ targetL: 0.34, alpha: 0.50 }),
    description: 'Antd-derived seed + glassy',
  },
]

// ---------------------------------------------------------------------------
// Apply a preset: re-derive seeds from cached palettes + return config
// ---------------------------------------------------------------------------
export function applyPreset(
  preset: FullPreset,
  palettes: Map<string, PaletteResponse>,
): { config: ColorPipelineConfig; seeds: Map<string, string> } {
  const picker = seedStrategies[preset.seedStrategy] ?? seedStrategies.highestChroma
  const preprocess = seedPreprocessors[preset.seedPreprocess] ?? seedPreprocessors.none
  const seeds = new Map<string, string>()

  for (const [charId, palette] of palettes) {
    const raw = picker(palette)
    seeds.set(charId, preprocess(raw))
  }

  return { config: cloneConfig(preset.config), seeds }
}
