import chroma from 'chroma-js'
import {
  type CardColorConfig,
  type ColorPipelineConfig,
  DEFAULT_CONFIG,
} from 'lib/characterPreview/color/colorPipelineConfig'

// Input chroma at which the minC floor fully applies. Below this, minC ramps
// smoothly down to 0 so near-achromatic inputs don't cliff-jump to a saturated
// tint (e.g., #c2c2c2 vs #c2c4c4).
const MIN_C_RAMP_EDGE = 0.05

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function normalizeOklch(seedColor: string, cfg: CardColorConfig): string {
  const [l, c, h] = chroma(seedColor).oklch()

  // Lightness: base target + input-relative scaling, clamped
  const rawL = cfg.targetL + (l - 0.5) * cfg.lInputScale
  const outL = Math.max(cfg.minL, Math.min(rawL, cfg.maxL))

  // Chroma: linear scale, clamped. minC floor ramps in smoothly based on input
  // chroma — fully off at c=0 (pure grey), fully on at c>=MIN_C_RAMP_EDGE.
  const minCEffective = cfg.minC * smoothstep(0, MIN_C_RAMP_EDGE, c)
  const scaledC = Math.max(minCEffective, Math.min(c * cfg.chromaScale, cfg.maxC))
  const outH = Number.isNaN(h) ? 0 : h

  const result = chroma.oklch(outL, scaledC, outH).alpha(cfg.alpha)
  if (result.clipped()) {
    return chroma.oklch(outL, scaledC * 0.5, outH).alpha(cfg.alpha).css()
  }
  return result.css()
}

function applyDarkMode(color: string, darkMode: boolean, config: ColorPipelineConfig): string {
  if (!darkMode) return color
  const parsed = chroma(color)
  const [l, c, h] = parsed.oklch()
  const a = parsed.alpha()
  return chroma.oklch(
    Math.max(0, l + config.darkMode.lOffset),
    c * config.darkMode.cScale,
    Number.isNaN(h) ? 0 : h,
  ).alpha(a).css()
}

export function oklchCardBackgroundColor(
  seedColor: string,
  darkMode: boolean,
  config: ColorPipelineConfig = DEFAULT_CONFIG,
): string {
  const base = normalizeOklch(seedColor, config.cardBg)
  return applyDarkMode(base, darkMode, config)
}

export function oklchCharacterListColor(
  seedColor: string,
  darkMode: boolean,
  config: ColorPipelineConfig = DEFAULT_CONFIG,
): string {
  const base = normalizeOklch(seedColor, config.characterListBg)
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
