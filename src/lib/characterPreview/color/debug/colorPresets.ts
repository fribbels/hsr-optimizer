// ---------------------------------------------------------------------------
// Preset definitions: seed selection strategy + normalization config combos.
// Each preset fully describes how to go from extracted palette → card background.
// ---------------------------------------------------------------------------

import chroma from 'chroma-js'
import type { ColorPipelineConfig, CardColorConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { DEFAULT_CONFIG, cloneConfig } from 'lib/characterPreview/color/colorPipelineConfig'
import { deriveAntdColorPrimaryActive } from 'lib/characterPreview/color/antdTokenCompat'
import type { PaletteResponse } from 'lib/characterPreview/color/colorThiefExtractor'

const FALLBACK_BLUE = '#2241be'
const SWATCH_KEYS = ['Vibrant', 'DarkVibrant', 'Muted', 'DarkMuted', 'LightVibrant', 'LightMuted'] as const

// ---------------------------------------------------------------------------
// Hue avoidance
// ---------------------------------------------------------------------------
// Avoidance levels: 'standard' for default, 'aggressive' for stronger filtering
type AvoidanceLevel = 'standard' | 'aggressive' | 'none'

function isAvoidedHue(h: number, c: number, l: number, level: AvoidanceLevel = 'standard'): boolean {
  if (level === 'none') return false

  // Yellow-greens (Material Design "disliked" range, extended to 150°)
  if (h >= 80 && h <= 150 && c > 0.04) return true
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
  ].filter((c) => {
    if (c === FALLBACK_BLUE) return false
    // Filter out near-white / near-black / achromatic (white bg problem)
    const [l, ch] = chroma(c).oklch()
    if (l > 0.90 && ch < 0.03) return false // near-white
    if (l < 0.05) return false               // near-black
    return true
  })
}

export const seedStrategies: Record<string, SeedPicker> = {
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

  // DarkVibrant preferred, cool hue bonus, falls back to best scored
  darkCool: (palette, avoidance) => {
    const dv = palette.DarkVibrant
    if (dv !== FALLBACK_BLUE) {
      const [l, c, h] = chroma(dv).oklch()
      if (!isAvoidedHue(h, c, l, avoidance) && c > 0.03 && isCoolHue(h)) return dv
    }
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
      if (isCoolHue(h)) score *= 1.5
      if (color === dv) score *= 1.3
      if (score > bestScore) { bestScore = score; best = color }
    }
    return best
  },

  // Score all: chroma × dark bonus (lower L = higher) × cool bonus
  darkCoolScored: (palette, avoidance) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
      if (isCoolHue(h)) score *= 1.5
      // Prefer darker colors: L=0.3 gets 1.4×, L=0.7 gets 0.8×
      score *= (1.5 - l)
      if (score > bestScore) { bestScore = score; best = color }
    }
    return best
  },

  // Prefer mid-lightness (0.3-0.6) + cool bias — avoids both washed-out and too-dark
  midCool: (palette, avoidance) => {
    const all = getAllColors(palette)
    if (!all.length) return palette.Vibrant
    let best = all[0], bestScore = -Infinity
    for (const color of all) {
      const [l, c, h] = chroma(color).oklch()
      let score = c
      if (isAvoidedHue(h, c, l, avoidance)) score *= 0.1
      if (isCoolHue(h)) score *= 1.5
      // Bell curve around L=0.45: peak at 0.45, drops off at extremes
      const lDist = Math.abs(l - 0.45)
      score *= Math.max(0.2, 1 - lDist * 2)
      if (score > bestScore) { bestScore = score; best = color }
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
  useHSL?: boolean // Use old HSL pipeline instead of OKLCH
}

// Round 9 — Three 5★ keepers: radiantInk, inkDeep, ember.
// inkDeep: targetL 0.38, alpha 0.58, chroma 0.52/0.048, portrait 18/0.64/0.88
// ember:   targetL 0.41, alpha 0.55, chroma 0.52/0.048, portrait 16/0.60/1.0, hueShift +8
// DRILL(2): blend inkDeep + ember traits
// EXPLORE(4): new territory — antd preprocess, no-preprocess raw, extreme blur, high lInputScale
export const FULL_PRESETS: FullPreset[] = [
  {
    name: 'hslBase',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: cloneConfig(DEFAULT_CONFIG),
    portrait: { blur: 18, brightness: 0.70, saturate: 0.80 },
    description: 'Old HSL pipeline — exact HMR match, baseline to tune from',
    useHSL: true,
  },
  // --- Migrating toward handpicked feel ---
  {
    name: 'lumin75',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.36, alpha: 0.63, chromaScale: 0.60, maxC: 0.055 }),
    portrait: { blur: 18, brightness: 0.68, saturate: 0.82 },
    description: '75% toward handpicked: alpha 0.63, portrait bright 0.68',
  },
  {
    name: 'lumin50',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.38, alpha: 0.60, chromaScale: 0.58, maxC: 0.053 }),
    portrait: { blur: 20, brightness: 0.65, saturate: 0.84 },
    description: '50% toward handpicked: alpha 0.60, portrait bright 0.65',
  },
  {
    name: 'lumin25',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.39, alpha: 0.58, chromaScale: 0.58, maxC: 0.055 }),
    portrait: { blur: 20, brightness: 0.62, saturate: 0.86 },
    description: '25% toward handpicked: alpha 0.58, portrait bright 0.62',
  },
  // --- Previous winners ---
  {
    name: 'inkDeep',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.38, alpha: 0.55, chromaScale: 0.52, maxC: 0.048 }),
    portrait: { blur: 22, brightness: 0.64, saturate: 0.88 },
    description: 'R8 winner anchor — vibFirst+boost, dark opaque panel, bright portrait',
  },
  {
    name: 'deepEmber',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.39, alpha: 0.55, chromaScale: 0.52, maxC: 0.048, hueShift: 5 }),
    portrait: { blur: 22, brightness: 0.62, saturate: 0.95 },
    description: 'Midpoint of inkDeep + ember — darkVib, mild warm shift, split-the-diff portrait',
  },
  // --- EXPLORE: genuinely different directions ---
  {
    name: 'mercury',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'antdDerived',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.40, alpha: 0.55, chromaScale: 0.52, maxC: 0.048 }),
    portrait: { blur: 22, brightness: 0.62, saturate: 0.88 },
    description: 'inkDeep values but antd preprocess instead of chromaBoost — different seed character',
  },
  {
    name: 'rawSilk',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'none',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.42, alpha: 0.55, chromaScale: 0.58, maxC: 0.052 }),
    portrait: { blur: 22, brightness: 0.62, saturate: 0.90 },
    description: 'No preprocessing — raw seed with higher chroma to compensate, brighter panel',
  },
  {
    name: 'titanium',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.39, alpha: 0.55, chromaScale: 0.58, maxC: 0.053 }),
    portrait: { blur: 22, brightness: 0.60, saturate: 1.0 },
    description: 'Iridium DNA + more blur (22), diffused bg for readability',
  },
  {
    name: 'crucible',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.40, alpha: 0.55, chromaScale: 0.55, maxC: 0.050, hueShift: 8 }),
    portrait: { blur: 22, brightness: 0.58, saturate: 1.10 },
    description: 'Forge DNA + more blur (22), warm shift, vivid diffused bg',
  },
  // --- Round 10: new exploration presets ---
  {
    name: 'polaris',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.42, alpha: 0.55, chromaScale: 0.56, maxC: 0.052, hueShift: -6 }),
    portrait: { blur: 22, brightness: 0.60, saturate: 0.92 },
    description: 'Bright + cool-shifted, higher chroma, crisp portrait',
  },
  {
    name: 'iridium',
    seedStrategy: 'highestChroma',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.40, alpha: 0.55, chromaScale: 0.60, maxC: 0.055 }),
    portrait: { blur: 22, brightness: 0.58, saturate: 1.05 },
    description: 'Max chroma seed, rich panel, crisp vivid portrait',
  },
  {
    name: 'forge',
    seedStrategy: 'darkVibrant',
    seedPreprocess: 'none',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.38, alpha: 0.55, chromaScale: 0.55, maxC: 0.050, hueShift: 10 }),
    portrait: { blur: 22, brightness: 0.56, saturate: 1.15 },
    description: 'Raw darkVib, warm shift +10, sharp hyper-saturated portrait',
  },
  {
    name: 'spectrum',
    seedStrategy: 'vibrantFirst',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.41, alpha: 0.58, chromaScale: 0.62, maxC: 0.058, hueShift: -3 }),
    portrait: { blur: 22, brightness: 0.60, saturate: 0.95 },
    description: 'Highest chroma ceiling yet (0.058), subtle cool nudge, balanced portrait',
  },
  {
    name: 'alloy',
    seedStrategy: 'populationWeighted',
    seedPreprocess: 'chromaBoost',
    avoidance: 'aggressive',
    config: withCardBg({ targetL: 0.39, alpha: 0.55, chromaScale: 0.54, maxC: 0.050 }),
    portrait: { blur: 22, brightness: 0.62, saturate: 0.92 },
    description: 'Population-weighted seed (favors dominant image color), opaque panel',
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
