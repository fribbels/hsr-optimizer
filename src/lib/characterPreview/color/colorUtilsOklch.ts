// ---------------------------------------------------------------------------
// OKLCH-based color normalization pipeline
// Pure functions: config in, color out. No side effects.
// ---------------------------------------------------------------------------

import chroma from 'chroma-js'
import {
  type CardColorConfig,
  type ColorPipelineConfig,
  DEFAULT_CONFIG,
} from 'lib/characterPreview/color/colorPipelineConfig'

// ---------------------------------------------------------------------------
// Core: normalize any seed color to a target OKLCH range
// ---------------------------------------------------------------------------
function normalizeOklch(seedColor: string, cfg: CardColorConfig): string {
  const [l, c, h] = chroma(seedColor).oklch()

  // Lightness: base target + input-relative scaling, clamped
  const rawL = cfg.targetL + (l - 0.5) * cfg.lInputScale
  const outL = Math.max(cfg.minL, Math.min(rawL, cfg.maxL))

  // Chroma: power curve then linear scale, clamped
  const powered = Math.pow(c, cfg.chromaPower)
  const scaledC = Math.max(cfg.minC, Math.min(powered * cfg.chromaScale, cfg.maxC))

  // Hue: shift
  const outH = (h + cfg.hueShift) % 360

  const result = chroma.oklch(outL, scaledC, outH).alpha(cfg.alpha)
  if (result.clipped()) {
    return chroma.oklch(outL, scaledC * 0.5, outH).alpha(cfg.alpha).css()
  }
  return result.css()
}

function applyDarkMode(color: string, darkMode: boolean, config: ColorPipelineConfig): string {
  if (!darkMode) return color
  const [l, c, h] = chroma(color).oklch()
  const a = chroma(color).alpha()
  return chroma.oklch(
    Math.max(0, l + config.darkMode.lOffset),
    c * config.darkMode.cScale,
    h,
  ).alpha(a).css()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function oklchCardBackgroundColor(
  seedColor: string,
  darkMode: boolean,
  config: ColorPipelineConfig = DEFAULT_CONFIG,
): string {
  const base = normalizeOklch(seedColor, config.cardBg)
  return applyDarkMode(base, darkMode, config)
}

export function oklchCardBorderColor(
  seedColor: string,
  darkMode: boolean,
  config: ColorPipelineConfig = DEFAULT_CONFIG,
): string {
  const base = normalizeOklch(seedColor, config.cardBorder)
  return applyDarkMode(base, darkMode, config)
}

export function oklchBackgroundColor(
  seedColor: string,
  darkMode: boolean,
  config: ColorPipelineConfig = DEFAULT_CONFIG,
): string {
  const base = normalizeOklch(seedColor, config.outerBg)
  return applyDarkMode(base, darkMode, config)
}

// ---------------------------------------------------------------------------
// Utilities for debug panel
// ---------------------------------------------------------------------------

export interface OklchInfo {
  l: number
  c: number
  h: number
  hex: string
}

export function getOklchInfo(color: string): OklchInfo {
  const [l, c, h] = chroma(color).oklch()
  return { l, c, h, hex: chroma(color).hex() }
}

export function getContrastOnDark(bgColor: string): number {
  return chroma.contrast(bgColor, 'white')
}
