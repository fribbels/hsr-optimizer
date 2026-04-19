import { DEFAULT_CONFIG } from './color/colorPipelineConfig'
import type {
  PillGroup,
  PresetGroup,
  SliderGroup,
} from './DebugSliderPanel'
import {
  BLEND_MODE_DEFAULT,
  CARD_BG_ALPHA_DEFAULT,
  INSET_BLUR,
  INSET_OPACITY,
  PORTRAIT_BLUR,
  PORTRAIT_BRIGHTNESS,
  PORTRAIT_SATURATE,
  SHADOW_BLUR,
  SHADOW_OPACITY,
  SHADOW_X,
  SHADOW_Y,
  TEXT_SHADOW_DEFAULT,
  TEXT_SHADOW_PRESETS,
  useDebugVisualConfigStore,
} from './debugVisualConfigStore'

// Hook version for reactive components
export function useDebugPanelConfig() {
  const store = useDebugVisualConfigStore()
  return buildDebugPanelConfig(store)
}

// Non-reactive version for one-time reads
export function getDebugPanelConfig() {
  const store = useDebugVisualConfigStore.getState()
  return buildDebugPanelConfig(store)
}

// Shared config builder
function buildDebugPanelConfig(store: ReturnType<typeof useDebugVisualConfigStore.getState>) {
  const savedPresetGroups: PresetGroup[] = [
    {
      title: 'Default',
      presets: [
        {
          label: 'Default',
          apply: () =>
            store.applyPreset({
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
            }),
        },
      ],
    },
    {
      title: 'Reference',
      presets: [
        {
          label: 'Legacy',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.50,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.45,
              debugMinL: 0.05,
              debugMaxL: 0.45,
              blendMode: 'normal',
            }),
        },
      ],
    },
    {
      title: 'Finalists',
      presets: [
        {
          label: 'Satin',
          apply: () =>
            store.applyPreset({
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
            }),
        },
        {
          label: 'Gloss',
          apply: () =>
            store.applyPreset({
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
            }),
        },
      ],
    },
    {
      title: 'Originals',
      presets: [
        {
          label: 'Coral',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.28,
              portraitSaturate: 2.00,
              cardBgAlpha: 0.20,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 1.00,
              debugTargetL: 0.425,
              debugMinL: 0.04,
              debugMaxL: 0.50,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Matte',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.40,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.40,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.45,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'AvgNormal',
          apply: () =>
            store.applyPreset({
              portraitBlur: 29,
              portraitBrightness: 0.54,
              portraitSaturate: 1.63,
              cardBgAlpha: 0.39,
              debugMaxC: 0.077,
              debugMinC: 0.043,
              debugChromaScale: 0.52,
              debugTargetL: 0.46,
              debugMinL: 0.05,
              debugMaxL: 0.45,
              blendMode: 'normal',
            }),
        },
        {
          label: 'AvgScreen',
          apply: () =>
            store.applyPreset({
              portraitBlur: 30,
              portraitBrightness: 0.34,
              portraitSaturate: 2.08,
              cardBgAlpha: 0.33,
              debugMaxC: 0.089,
              debugMinC: 0.042,
              debugChromaScale: 0.75,
              debugTargetL: 0.49,
              debugMinL: 0.04,
              debugMaxL: 0.52,
              blendMode: 'screen',
            }),
        },
        {
          label: 'CurSilk',
          apply: () =>
            store.applyPreset({
              portraitBlur: 27,
              portraitBrightness: 0.47,
              portraitSaturate: 1.67,
              cardBgAlpha: 0.42,
              debugMaxC: 0.060,
              debugMinC: 0.036,
              debugChromaScale: 0.53,
              debugTargetL: 0.45,
              debugMinL: 0.05,
              debugMaxL: 0.45,
              blendMode: 'normal',
            }),
        },
      ],
    },
    {
      title: 'Atm Normal',
      presets: [
        {
          label: 'Mist',
          apply: () =>
            store.applyPreset({
              portraitBlur: 46,
              portraitBrightness: 0.50,
              portraitSaturate: 1.45,
              cardBgAlpha: 0.25,
              debugMaxC: 0.055,
              debugMinC: 0.030,
              debugChromaScale: 0.42,
              debugTargetL: 0.48,
              debugMinL: 0.08,
              debugMaxL: 0.52,
              blendMode: 'normal',
            }),
        },
        {
          label: 'Cloud',
          apply: () =>
            store.applyPreset({
              portraitBlur: 50,
              portraitBrightness: 0.55,
              portraitSaturate: 1.55,
              cardBgAlpha: 0.20,
              debugMaxC: 0.058,
              debugMinC: 0.030,
              debugChromaScale: 0.45,
              debugTargetL: 0.52,
              debugMinL: 0.08,
              debugMaxL: 0.56,
              blendMode: 'normal',
            }),
        },
      ],
    },
    {
      title: 'Gem Vivid',
      presets: [
        {
          label: 'Prism',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.32,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.26,
              debugMaxC: 0.120,
              debugMinC: 0.060,
              debugChromaScale: 1.15,
              debugTargetL: 0.40,
              debugMinL: 0.03,
              debugMaxL: 0.45,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Crystal',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.04,
              debugMaxL: 0.46,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Reef',
          apply: () =>
            store.applyPreset({
              portraitBlur: 22,
              portraitBrightness: 0.38,
              portraitSaturate: 2.15,
              cardBgAlpha: 0.22,
              debugMaxC: 0.105,
              debugMinC: 0.052,
              debugChromaScale: 1.05,
              debugTargetL: 0.45,
              debugMinL: 0.04,
              debugMaxL: 0.48,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Ruby',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.32,
              portraitSaturate: 2.35,
              cardBgAlpha: 0.28,
              debugMaxC: 0.130,
              debugMinC: 0.065,
              debugChromaScale: 1.25,
              debugTargetL: 0.40,
              debugMinL: 0.03,
              debugMaxL: 0.44,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Gem Soft',
      presets: [
        {
          label: 'Gem',
          apply: () =>
            store.applyPreset({
              portraitBlur: 22,
              portraitBrightness: 0.38,
              portraitSaturate: 2.10,
              cardBgAlpha: 0.24,
              debugMaxC: 0.110,
              debugMinC: 0.055,
              debugChromaScale: 1.00,
              debugTargetL: 0.44,
              debugMinL: 0.04,
              debugMaxL: 0.48,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Opal',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.40,
              portraitSaturate: 2.00,
              cardBgAlpha: 0.22,
              debugMaxC: 0.100,
              debugMinC: 0.050,
              debugChromaScale: 0.95,
              debugTargetL: 0.44,
              debugMinL: 0.04,
              debugMaxL: 0.48,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Lagoon',
          apply: () =>
            store.applyPreset({
              portraitBlur: 28,
              portraitBrightness: 0.38,
              portraitSaturate: 2.05,
              cardBgAlpha: 0.24,
              debugMaxC: 0.098,
              debugMinC: 0.049,
              debugChromaScale: 0.90,
              debugTargetL: 0.45,
              debugMinL: 0.05,
              debugMaxL: 0.48,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Core',
      presets: [
        {
          label: 'Spread',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Sprawl',
          apply: () =>
            store.applyPreset({
              portraitBlur: 20,
              portraitBrightness: 0.35,
              portraitSaturate: 2.25,
              cardBgAlpha: 0.25,
              debugMaxC: 0.118,
              debugMinC: 0.059,
              debugChromaScale: 1.12,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Tide',
          apply: () =>
            store.applyPreset({
              portraitBlur: 22,
              portraitBrightness: 0.34,
              portraitSaturate: 2.25,
              cardBgAlpha: 0.27,
              debugMaxC: 0.120,
              debugMinC: 0.060,
              debugChromaScale: 1.15,
              debugTargetL: 0.40,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Current',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.36,
              portraitSaturate: 2.10,
              cardBgAlpha: 0.25,
              debugMaxC: 0.108,
              debugMinC: 0.054,
              debugChromaScale: 1.00,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Soft Chroma',
      presets: [
        {
          label: 'Glimmer',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.36,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.80,
              debugTargetL: 0.43,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Orbit',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.36,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.70,
              debugTargetL: 0.43,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Cliff',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.36,
              portraitSaturate: 2.25,
              cardBgAlpha: 0.20,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.70,
              debugTargetL: 0.43,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Meld',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.35,
              portraitSaturate: 2.40,
              cardBgAlpha: 0.26,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.70,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Vivid Mid',
      presets: [
        {
          label: 'Thick',
          apply: () =>
            store.applyPreset({
              portraitBlur: 30,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.30,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Gale',
          apply: () =>
            store.applyPreset({
              portraitBlur: 30,
              portraitBrightness: 0.36,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.28,
              debugMaxC: 0.125,
              debugMinC: 0.062,
              debugChromaScale: 1.20,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Soft Mid',
      presets: [
        {
          label: 'Plume',
          apply: () =>
            store.applyPreset({
              portraitBlur: 32,
              portraitBrightness: 0.35,
              portraitSaturate: 1.90,
              cardBgAlpha: 0.24,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.72,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Vapor',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.38,
              portraitSaturate: 1.85,
              cardBgAlpha: 0.23,
              debugMaxC: 0.075,
              debugMinC: 0.038,
              debugChromaScale: 0.68,
              debugTargetL: 0.45,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Petal',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.38,
              portraitSaturate: 1.95,
              cardBgAlpha: 0.24,
              debugMaxC: 0.085,
              debugMinC: 0.042,
              debugChromaScale: 0.78,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Blur Vivid',
      presets: [
        {
          label: 'Wisp',
          apply: () =>
            store.applyPreset({
              portraitBlur: 38,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Reed',
          apply: () =>
            store.applyPreset({
              portraitBlur: 38,
              portraitBrightness: 0.33,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.26,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.25,
              debugTargetL: 0.41,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Brier',
          apply: () =>
            store.applyPreset({
              portraitBlur: 38,
              portraitBrightness: 0.40,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.46,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Blur Soft',
      presets: [
        {
          label: 'Dew',
          apply: () =>
            store.applyPreset({
              portraitBlur: 36,
              portraitBrightness: 0.36,
              portraitSaturate: 2.30,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.80,
              debugTargetL: 0.43,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Sway',
          apply: () =>
            store.applyPreset({
              portraitBlur: 36,
              portraitBrightness: 0.42,
              portraitSaturate: 2.40,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.85,
              debugTargetL: 0.45,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Outliers',
      presets: [
        {
          label: 'Rise',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.10,
              debugTargetL: 0.48,
              debugMinL: 0.20,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Clamp',
          apply: () =>
            store.applyPreset({
              portraitBlur: 44,
              portraitBrightness: 0.50,
              portraitSaturate: 1.55,
              cardBgAlpha: 0.22,
              debugMaxC: 0.060,
              debugMinC: 0.050,
              debugChromaScale: 0.45,
              debugTargetL: 0.48,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'normal',
            }),
        },
        {
          label: 'Range',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.32,
              portraitSaturate: 2.40,
              cardBgAlpha: 0.28,
              debugMaxC: 0.135,
              debugMinC: 0.068,
              debugChromaScale: 1.30,
              debugTargetL: 0.38,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Pane',
          apply: () =>
            store.applyPreset({
              portraitBlur: 22,
              portraitBrightness: 0.40,
              portraitSaturate: 2.00,
              cardBgAlpha: 0.22,
              debugMaxC: 0.090,
              debugMinC: 0.045,
              debugChromaScale: 0.80,
              debugTargetL: 0.46,
              debugMinL: 0.00,
              debugMaxL: 0.65,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Flux',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.42,
              portraitSaturate: 2.40,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.20,
              debugTargetL: 0.46,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Shimmer',
          apply: () =>
            store.applyPreset({
              portraitBlur: 28,
              portraitBrightness: 0.42,
              portraitSaturate: 2.10,
              cardBgAlpha: 0.24,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.72,
              debugTargetL: 0.45,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Hymn',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.38,
              portraitSaturate: 1.90,
              cardBgAlpha: 0.16,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.68,
              debugTargetL: 0.45,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Nook',
          apply: () =>
            store.applyPreset({
              portraitBlur: 24,
              portraitBrightness: 0.36,
              portraitSaturate: 1.85,
              cardBgAlpha: 0.26,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.25,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Grove',
          apply: () =>
            store.applyPreset({
              portraitBlur: 32,
              portraitBrightness: 0.37,
              portraitSaturate: 2.25,
              cardBgAlpha: 0.22,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.05,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Swell',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.160,
              debugMinC: 0.020,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Burst',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.35,
              portraitSaturate: 2.20,
              cardBgAlpha: 0.25,
              debugMaxC: 0.170,
              debugMinC: 0.010,
              debugChromaScale: 1.10,
              debugTargetL: 0.42,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Gauze',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.38,
              portraitSaturate: 2.15,
              cardBgAlpha: 0.16,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.05,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Tender',
          apply: () =>
            store.applyPreset({
              portraitBlur: 26,
              portraitBrightness: 0.38,
              portraitSaturate: 2.15,
              cardBgAlpha: 0.20,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 1.05,
              debugTargetL: 0.44,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
        {
          label: 'Echo',
          apply: () =>
            store.applyPreset({
              portraitBlur: 25,
              portraitBrightness: 0.36,
              portraitSaturate: 2.25,
              cardBgAlpha: 0.16,
              debugMaxC: 0.115,
              debugMinC: 0.058,
              debugChromaScale: 0.70,
              debugTargetL: 0.43,
              debugMinL: 0.00,
              debugMaxL: 0.70,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Normal',
      presets: [
        {
          label: 'Silk',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.54,
              portraitSaturate: 1.53,
              cardBgAlpha: 0.38,
              debugMaxC: 0.067,
              debugMinC: 0.037,
              debugChromaScale: 0.47,
              debugTargetL: 0.47,
              debugMinL: 0.05,
              debugMaxL: 0.45,
              blendMode: 'normal',
            }),
        },
      ],
    },
    {
      title: 'Screen Soft',
      presets: [
        {
          label: 'Plush',
          apply: () =>
            store.applyPreset({
              portraitBlur: 44,
              portraitBrightness: 0.30,
              portraitSaturate: 1.68,
              cardBgAlpha: 0.40,
              debugMaxC: 0.095,
              debugMinC: 0.050,
              debugChromaScale: 0.56,
              debugTargetL: 0.48,
              debugMinL: 0.06,
              debugMaxL: 0.48,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Screen Moody',
      presets: [
        {
          label: 'Shade',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.33,
              portraitSaturate: 1.88,
              cardBgAlpha: 0.34,
              debugMaxC: 0.101,
              debugMinC: 0.048,
              debugChromaScale: 0.76,
              debugTargetL: 0.47,
              debugMinL: 0.04,
              debugMaxL: 0.51,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Screen Warm',
      presets: [
        {
          label: 'CoralSilk',
          apply: () =>
            store.applyPreset({
              portraitBlur: 28,
              portraitBrightness: 0.36,
              portraitSaturate: 1.88,
              cardBgAlpha: 0.28,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.78,
              debugTargetL: 0.46,
              debugMinL: 0.045,
              debugMaxL: 0.49,
              blendMode: 'screen',
            }),
        },
      ],
    },
    {
      title: 'Iteration',
      presets: [
        {
          // Avg of Clamp and Cloud
          label: 'Nimbus',
          apply: () =>
            store.applyPreset({
              portraitBlur: 47,
              portraitBrightness: 0.53,
              portraitSaturate: 1.55,
              cardBgAlpha: 0.21,
              debugMaxC: 0.059,
              debugMinC: 0.040,
              debugChromaScale: 0.45,
              debugTargetL: 0.50,
              debugMinL: 0.04,
              debugMaxL: 0.63,
              blendMode: 'normal',
            }),
        },
      ],
    },
  ]

  const pillGroups: PillGroup[] = [
    {
      title: 'Blend Mode',
      active: store.blendMode,
      options: (['screen', 'normal'] as const).map((mode) => ({
        label: mode,
        value: mode,
        apply: () => store.setBlendMode(mode),
      })),
    },
    {
      title: 'Text Shadow',
      active: store.textShadow,
      options: TEXT_SHADOW_PRESETS.map((p) => ({
        label: p.label,
        value: p.value,
        apply: () => store.setTextShadow(p.value),
      })),
    },
  ]

  const groups: SliderGroup[] = [
    {
      title: 'Portrait BG Filter',
      sliders: [
        { label: 'Blur', value: store.portraitBlur, min: 12, max: 50, step: 1, onChange: store.setPortraitBlur },
        { label: 'Brightness', value: store.portraitBrightness, min: 0.15, max: 0.75, step: 0.01, onChange: store.setPortraitBrightness },
        { label: 'Saturate', value: store.portraitSaturate, min: 1.00, max: 3.00, step: 0.05, onChange: store.setPortraitSaturate },
        { label: 'Card BG Alpha', value: store.cardBgAlpha, min: 0, max: 0.50, step: 0.01, onChange: store.setCardBgAlpha },
      ],
    },
    {
      title: 'Outer Shadow',
      sliders: [
        { label: 'X', value: store.shadowX, min: -5, max: 5, step: 0.5, onChange: store.setShadowX },
        { label: 'Y', value: store.shadowY, min: -5, max: 5, step: 0.5, onChange: store.setShadowY },
        { label: 'Blur', value: store.shadowBlur, min: 0, max: 15, step: 0.5, onChange: store.setShadowBlur },
        { label: 'Opacity', value: store.shadowOpacity, min: 0, max: 1, step: 0.05, onChange: store.setShadowOpacity },
      ],
    },
    {
      title: 'Inset Glow',
      sliders: [
        { label: 'Blur', value: store.insetBlur, min: 0, max: 8, step: 0.5, onChange: store.setInsetBlur },
        { label: 'Opacity', value: store.insetOpacity, min: 0, max: 1, step: 0.05, onChange: store.setInsetOpacity },
      ],
    },
    {
      title: 'OKLCH Pipeline',
      sliders: [
        { label: 'Max Chroma', value: store.debugMaxC, min: 0.03, max: 0.18, step: 0.002, onChange: store.setDebugMaxC },
        { label: 'Min Chroma', value: store.debugMinC, min: 0.00, max: 0.10, step: 0.002, onChange: store.setDebugMinC },
        { label: 'Chroma Scale', value: store.debugChromaScale, min: 0.1, max: 2.0, step: 0.02, onChange: store.setDebugChromaScale },
        { label: 'Target L', value: store.debugTargetL, min: 0.15, max: 0.60, step: 0.01, onChange: store.setDebugTargetL },
        { label: 'Min L', value: store.debugMinL, min: 0.00, max: 0.30, step: 0.01, onChange: store.setDebugMinL },
        { label: 'Max L', value: store.debugMaxL, min: 0.30, max: 0.70, step: 0.01, onChange: store.setDebugMaxL },
      ],
    },
  ]

  return {
    savedPresetGroups,
    pillGroups,
    groups,
  }
}
