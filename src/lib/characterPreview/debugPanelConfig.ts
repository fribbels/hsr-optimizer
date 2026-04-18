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
      title: 'Experimental',
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
      title: 'Silk Variations',
      presets: [
        {
          label: 'SW4849',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.48,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'SW.44',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.44,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'SW.46',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.46,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'SW.50',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.50,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'SW.50/.45',
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
        {
          label: 'SW.52',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.52,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
              blendMode: 'normal',
            }),
        },
        {
          label: 'SW.54',
          apply: () =>
            store.applyPreset({
              portraitBlur: 31,
              portraitBrightness: 0.54,
              portraitSaturate: 1.75,
              cardBgAlpha: 0.36,
              debugMaxC: 0.080,
              debugMinC: 0.040,
              debugChromaScale: 0.55,
              debugTargetL: 0.49,
              debugMinL: 0.05,
              debugMaxL: 0.47,
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
