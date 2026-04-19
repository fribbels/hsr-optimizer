import { DEFAULT_CONFIG } from 'lib/characterPreview/color/colorPipelineConfig'
import { create } from 'zustand'

export type BlendMode = 'screen' | 'normal'

export interface DebugVisualConfig {
  portraitBlur: number
  portraitBrightness: number
  portraitSaturate: number
  cardBgAlpha: number
  debugMaxC: number
  debugMinC: number
  debugChromaScale: number
  debugTargetL: number
  debugMinL: number
  debugMaxL: number
  blendMode: BlendMode
  // Shadow/glow
  shadowX: number
  shadowY: number
  shadowBlur: number
  shadowOpacity: number
  insetBlur: number
  insetOpacity: number
  // Text
  textShadow: string
}

// ============================================================
// Canonical defaults - single source of truth for all visual config
// ============================================================

// Portrait background filter defaults (Matte preset)
export const PORTRAIT_BLUR = 25
export const PORTRAIT_BRIGHTNESS = 0.40
export const PORTRAIT_SATURATE = 1.75
export const CARD_BG_ALPHA_DEFAULT = 0.40

// Blend mode default
export const BLEND_MODE_DEFAULT: BlendMode = 'normal'

// Shadow/glow defaults
export const SHADOW_X = 1
export const SHADOW_Y = 1
export const SHADOW_BLUR = 5
export const SHADOW_OPACITY = 0.75
export const INSET_BLUR = 2
export const INSET_OPACITY = 0.30

// Text shadow default — Faint 0.20
export const TEXT_SHADOW_DEFAULT = '1px 1px 0 rgba(0,0,0,0.2), -1px -1px 0 rgba(0,0,0,0.2), 1px -1px 0 rgba(0,0,0,0.2), -1px 1px 0 rgba(0,0,0,0.2)'

// Text shadow presets for readability tuning
export const TEXT_SHADOW_PRESETS: { label: string, value: string }[] = [
  { label: 'Default', value: TEXT_SHADOW_DEFAULT },
  { label: 'Subtle 0.30', value: '1px 1px 0 rgba(0,0,0,0.3), -1px -1px 0 rgba(0,0,0,0.3), 1px -1px 0 rgba(0,0,0,0.3), -1px 1px 0 rgba(0,0,0,0.3)' },
  { label: 'Light 0.40', value: '1px 1px 0 rgba(0,0,0,0.4), -1px -1px 0 rgba(0,0,0,0.4), 1px -1px 0 rgba(0,0,0,0.4), -1px 1px 0 rgba(0,0,0,0.4)' },
  { label: 'Medium 0.60', value: '1px 1px 0 rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.6), 1px -1px 0 rgba(0,0,0,0.6), -1px 1px 0 rgba(0,0,0,0.6)' },
  {
    label: 'Glow',
    value: '1px 1px 0 rgba(0,0,0,0.5), -1px -1px 0 rgba(0,0,0,0.5), 1px -1px 0 rgba(0,0,0,0.5), -1px 1px 0 rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.4)',
  },
  {
    label: '8-dir light',
    value:
      '-1px 0 0 rgba(0,0,0,0.35), 1px 0 0 rgba(0,0,0,0.35), 0 -1px 0 rgba(0,0,0,0.35), 0 1px 0 rgba(0,0,0,0.35), -1px -1px 0 rgba(0,0,0,0.35), 1px -1px 0 rgba(0,0,0,0.35), -1px 1px 0 rgba(0,0,0,0.35), 1px 1px 0 rgba(0,0,0,0.35)',
  },
  {
    label: '8-dir medium',
    value:
      '-1px 0 0 rgba(0,0,0,0.55), 1px 0 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(0,0,0,0.55), 0 1px 0 rgba(0,0,0,0.55), -1px -1px 0 rgba(0,0,0,0.55), 1px -1px 0 rgba(0,0,0,0.55), -1px 1px 0 rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.55)',
  },
  {
    label: '8-dir glow',
    value:
      '-1px 0 0 rgba(0,0,0,0.45), 1px 0 0 rgba(0,0,0,0.45), 0 -1px 0 rgba(0,0,0,0.45), 0 1px 0 rgba(0,0,0,0.45), -1px -1px 0 rgba(0,0,0,0.45), 1px -1px 0 rgba(0,0,0,0.45), -1px 1px 0 rgba(0,0,0,0.45), 1px 1px 0 rgba(0,0,0,0.45), 0 0 6px rgba(0,0,0,0.35)',
  },
  { label: 'None', value: 'none' },
]

// ============================================================
// User-facing showcase visual presets — toggled from the sidebar
// ============================================================

export enum ShowcasePreset {
  SHINE = 'shine',
  NATURAL = 'natural',
}

export const SHINE_PRESET: DebugVisualConfig = {
  portraitBlur: 28,
  portraitBrightness: 0.37,
  portraitSaturate: 2.00,
  cardBgAlpha: 0.25,
  debugMaxC: 0.08,
  debugMinC: 0.06,
  debugChromaScale: 1.00,
  debugTargetL: 0.45,
  debugMinL: 0.00,
  debugMaxL: 0.66,
  blendMode: 'screen',
  shadowX: 1.00,
  shadowY: 1.00,
  shadowBlur: 5.00,
  shadowOpacity: 0.75,
  insetBlur: 2.00,
  insetOpacity: 0.30,
  textShadow: TEXT_SHADOW_DEFAULT,
}

export const NATURAL_PRESET: DebugVisualConfig = {
  portraitBlur: 46,
  portraitBrightness: 0.50,
  portraitSaturate: 1.75,
  cardBgAlpha: 0.20,
  debugMaxC: 0.06,
  debugMinC: 0.04,
  debugChromaScale: 1.00,
  debugTargetL: 0.50,
  debugMinL: 0.08,
  debugMaxL: 0.63,
  blendMode: 'normal',
  shadowX: 1.00,
  shadowY: 1.00,
  shadowBlur: 5.00,
  shadowOpacity: 0.75,
  insetBlur: 2.00,
  insetOpacity: 0.30,
  textShadow: TEXT_SHADOW_DEFAULT,
}

export function getShowcasePreset(name: ShowcasePreset): DebugVisualConfig {
  return name === ShowcasePreset.SHINE ? SHINE_PRESET : NATURAL_PRESET
}

interface DebugVisualConfigStore extends DebugVisualConfig {
  setPortraitBlur: (v: number) => void
  setPortraitBrightness: (v: number) => void
  setPortraitSaturate: (v: number) => void
  setCardBgAlpha: (v: number) => void
  setDebugMaxC: (v: number) => void
  setDebugMinC: (v: number) => void
  setDebugChromaScale: (v: number) => void
  setDebugTargetL: (v: number) => void
  setDebugMinL: (v: number) => void
  setDebugMaxL: (v: number) => void
  setBlendMode: (v: BlendMode) => void
  setShadowX: (v: number) => void
  setShadowY: (v: number) => void
  setShadowBlur: (v: number) => void
  setShadowOpacity: (v: number) => void
  setInsetBlur: (v: number) => void
  setInsetOpacity: (v: number) => void
  setTextShadow: (v: string) => void
  applyPreset: (preset: Partial<DebugVisualConfig>) => void
}

export const useDebugVisualConfigStore = create<DebugVisualConfigStore>((set) => ({
  portraitBlur: PORTRAIT_BLUR,
  portraitBrightness: PORTRAIT_BRIGHTNESS,
  portraitSaturate: PORTRAIT_SATURATE,
  cardBgAlpha: CARD_BG_ALPHA_DEFAULT,
  debugMaxC: DEFAULT_CONFIG.cardBg.maxC,
  debugMinC: DEFAULT_CONFIG.cardBg.minC,
  debugChromaScale: DEFAULT_CONFIG.cardBg.chromaScale,
  debugTargetL: DEFAULT_CONFIG.cardBg.targetL,
  debugMinL: DEFAULT_CONFIG.cardBg.minL,
  debugMaxL: DEFAULT_CONFIG.cardBg.maxL,
  blendMode: BLEND_MODE_DEFAULT,
  shadowX: SHADOW_X,
  shadowY: SHADOW_Y,
  shadowBlur: SHADOW_BLUR,
  shadowOpacity: SHADOW_OPACITY,
  insetBlur: INSET_BLUR,
  insetOpacity: INSET_OPACITY,
  textShadow: TEXT_SHADOW_DEFAULT,

  setPortraitBlur: (v) => set({ portraitBlur: v }),
  setPortraitBrightness: (v) => set({ portraitBrightness: v }),
  setPortraitSaturate: (v) => set({ portraitSaturate: v }),
  setCardBgAlpha: (v) => set({ cardBgAlpha: v }),
  setDebugMaxC: (v) => set({ debugMaxC: v }),
  setDebugMinC: (v) => set({ debugMinC: v }),
  setDebugChromaScale: (v) => set({ debugChromaScale: v }),
  setDebugTargetL: (v) => set({ debugTargetL: v }),
  setDebugMinL: (v) => set({ debugMinL: v }),
  setDebugMaxL: (v) => set({ debugMaxL: v }),
  setBlendMode: (v) => set({ blendMode: v }),
  setShadowX: (v) => set({ shadowX: v }),
  setShadowY: (v) => set({ shadowY: v }),
  setShadowBlur: (v) => set({ shadowBlur: v }),
  setShadowOpacity: (v) => set({ shadowOpacity: v }),
  setInsetBlur: (v) => set({ insetBlur: v }),
  setInsetOpacity: (v) => set({ insetOpacity: v }),
  setTextShadow: (v) => set({ textShadow: v }),
  applyPreset: (preset) => set(preset),
}))

export function getDebugVisualConfig(): DebugVisualConfig {
  const s = useDebugVisualConfigStore.getState()
  return {
    portraitBlur: s.portraitBlur,
    portraitBrightness: s.portraitBrightness,
    portraitSaturate: s.portraitSaturate,
    cardBgAlpha: s.cardBgAlpha,
    debugMaxC: s.debugMaxC,
    debugMinC: s.debugMinC,
    debugChromaScale: s.debugChromaScale,
    debugTargetL: s.debugTargetL,
    debugMinL: s.debugMinL,
    debugMaxL: s.debugMaxL,
    blendMode: s.blendMode,
    shadowX: s.shadowX,
    shadowY: s.shadowY,
    shadowBlur: s.shadowBlur,
    shadowOpacity: s.shadowOpacity,
    insetBlur: s.insetBlur,
    insetOpacity: s.insetOpacity,
    textShadow: s.textShadow,
  }
}
