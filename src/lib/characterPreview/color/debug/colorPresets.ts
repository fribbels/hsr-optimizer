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
// Avoidance levels: 'standard' for default, 'aggressive' for stronger filtering
type AvoidanceLevel = 'standard' | 'aggressive' | 'none'

function isAvoidedHue(h: number, c: number, l: number, level: AvoidanceLevel = 'standard'): boolean {
  if (level === 'none') return false

  // Yellow-greens (Material Design "disliked" range ~80-130°)
  if (h >= 80 && h <= 130 && c > 0.04) return true
  // Browns / muddy warm tones (~30-80°, low-mid L)
  if (h >= 30 && h <= 80 && l < 0.55) return true
  // Brown-reds / dirty reds (~10-50°, not vivid enough to be clean red/pink)
  if (h >= 10 && h <= 50 && c < 0.15 && l < 0.55) return true
  // Skin tones (peach/tan ~40-70°, low-mid chroma)
  if (h >= 40 && h <= 70 && c > 0.02 && c < 0.12) return true

  if (level === 'aggressive') {
    // Wider warm rejection: anything 10-80° that isn't clearly vivid
    if (h >= 10 && h <= 80 && c < 0.22) return true
    // Extended muddy range: 80-100° at low chroma still looks brown-green
    if (h >= 80 && h <= 100 && c < 0.12) return true
  }

  return false
  // Note: light reds/pinks (h ~340-360° or ~0-10°, high chroma or high L) pass through
}

function isCoolHue(h: number): boolean {
  return (h >= 180 && h <= 310)
}

// ---------------------------------------------------------------------------
// Seed selection strategies
// ---------------------------------------------------------------------------
type SeedPicker = (palette: PaletteResponse, avoidance: AvoidanceLevel) => string

function getAllColors(palette: PaletteResponse): string[] {
  return [
    ...SWATCH_KEYS.map((k) => palette[k]),
    ...palette.colors,
  ].filter((c) => c !== FALLBACK_BLUE)
}

const seedStrategies: Record<string, SeedPicker> = {
  highestChroma: (palette, avoidance) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
      if (score > bestScore) { bestScore = score; best = color }
    }
    return best
  },

  vibrantFirst: (palette, avoidance) => {
    const v = palette.Vibrant
    if (v !== FALLBACK_BLUE) {
      const [l, c, h] = chroma(v).oklch()
      if (!isAvoidedHue(h, c, l, avoidance) && c > 0.05) return v
    }
    return seedStrategies.highestChroma(palette, avoidance)
  },

  darkVibrant: (palette, avoidance) => {
    const dv = palette.DarkVibrant
    if (dv !== FALLBACK_BLUE) {
      const [l, c, h] = chroma(dv).oklch()
      if (!isAvoidedHue(h, c, l, avoidance) && c > 0.03) return dv
    }
    return seedStrategies.highestChroma(palette, avoidance)
  },

  populationWeighted: (palette, avoidance) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (let i = 0; i < all.length; i++) {
      const [l, c, h] = chroma(all[i]).oklch()
      const popWeight = 1 / (1 + i * 0.1)
      let score = c * popWeight
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
      if (score > bestScore) { bestScore = score; best = all[i] }
    }
    return best
  },

  coolBias: (palette, avoidance) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
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
export interface PortraitFilterPreset {
  blur: number
  brightness: number
  saturate: number
}

const DEFAULT_PORTRAIT: PortraitFilterPreset = { blur: 18, brightness: 0.50, saturate: 0.80 }

export interface FullPreset {
  name: string
  seedStrategy: string
  seedPreprocess: string
  avoidance: AvoidanceLevel
  config: ColorPipelineConfig
  portrait: PortraitFilterPreset
  description: string
}

// Round 9 — Three 5★ keepers: radiantInk, inkDeep, ember.
// inkDeep: targetL 0.38, alpha 0.58, chroma 0.52/0.048, portrait 18/0.64/0.88
// ember:   targetL 0.41, alpha 0.55, chroma 0.52/0.048, portrait 16/0.60/1.0, hueShift +8
// DRILL(2): blend inkDeep + ember traits
// EXPLORE(4): new territory — antd preprocess, no-preprocess raw, extreme blur, high lInputScale
export const FULL_PRESETS: FullPreset[] = [
  // --- DRILL: blend the two 5★+keep winners ---
  {
    name: 'inkDeep',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.38, alpha: 0.58, chromaScale: 0.52, maxC: 0.048 }),
    portrait: { blur: 18, brightness: 0.64, saturate: 0.88 },
    description: 'R8 winner anchor — vibFirst+boost, dark opaque panel, bright portrait',
  },
  {
    name: 'deepEmber',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.39, alpha: 0.57, chromaScale: 0.52, maxC: 0.048, hueShift: 5 }),
    portrait: { blur: 16, brightness: 0.62, saturate: 0.95 },
    description: 'Midpoint of inkDeep + ember — darkVib, mild warm shift, split-the-diff portrait',
  },
  // --- EXPLORE: genuinely different directions ---
  {
    name: 'mercury',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'antdDerived',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.40, alpha: 0.56, chromaScale: 0.52, maxC: 0.048 }),
    portrait: { blur: 18, brightness: 0.62, saturate: 0.88 },
    description: 'inkDeep values but antd preprocess instead of chromaBoost — different seed character',
  },
  {
    name: 'rawSilk',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'none',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.42, alpha: 0.56, chromaScale: 0.58, maxC: 0.052 }),
    portrait: { blur: 18, brightness: 0.62, saturate: 0.90 },
    description: 'No preprocessing — raw seed with higher chroma to compensate, brighter panel',
  },
  {
    name: 'cinematic',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.36, alpha: 0.62, chromaScale: 0.48, maxC: 0.044 }),
    portrait: { blur: 10, brightness: 0.58, saturate: 1.10 },
    description: 'Darkest panel + most opaque, sharp vivid portrait — movie poster look',
  },
  {
    name: 'adaptive',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.38, alpha: 0.56, chromaScale: 0.50, maxC: 0.045, lInputScale: 0.12 }),
    portrait: { blur: 18, brightness: 0.62, saturate: 0.88 },
    description: 'High lInputScale (0.12) — panel brightness varies per character seed lightness',
  },
]

// ---------------------------------------------------------------------------
// Apply a preset: re-derive seeds from cached palettes + return config
// ---------------------------------------------------------------------------
export function applyPreset(
  preset: FullPreset,
  palettes: Map<string, PaletteResponse>,
): { config: ColorPipelineConfig; seeds: Map<string, string>; portrait: PortraitFilterPreset } {
  const picker = seedStrategies[preset.seedStrategy] ?? seedStrategies.highestChroma
  const preprocess = seedPreprocessors[preset.seedPreprocess] ?? seedPreprocessors.none
  const seeds = new Map<string, string>()

  for (const [charId, palette] of palettes) {
    const raw = picker(palette, preset.avoidance)
    seeds.set(charId, preprocess(raw))
  }

  return { config: cloneConfig(preset.config), seeds, portrait: { ...preset.portrait } }
}
