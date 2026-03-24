// ---------------------------------------------------------------------------
// Color Pipeline Configuration
// All tunable parameters for OKLCH-based color normalization.
// Every function in colorUtilsOklch.ts accepts an optional config override,
// defaulting to DEFAULT_CONFIG when omitted.
// ---------------------------------------------------------------------------

export interface CardColorConfig {
  // Lightness
  targetL: number       // base OKLCH lightness
  lInputScale: number   // how much input L influences output: outputL = targetL + (inputL - 0.5) * lInputScale
  minL: number          // floor for output L
  maxL: number          // ceiling for output L

  // Chroma
  chromaScale: number   // multiply input chroma by this
  chromaPower: number   // power curve: inputC^chromaPower * chromaScale
  minC: number          // floor for scaled chroma
  maxC: number          // ceiling for scaled chroma

  // Hue
  hueShift: number      // degrees to rotate output hue

  // Alpha
  alpha: number         // CSS alpha
}

export interface DarkModeConfig {
  lOffset: number       // added to L (negative = darker)
  cScale: number        // multiplied with C (< 1 = desaturate)
}

export interface ColorPipelineConfig {
  cardBg: CardColorConfig
  cardBorder: CardColorConfig
  outerBg: CardColorConfig
  characterListBg: CardColorConfig
  darkMode: DarkModeConfig
}

// ---------------------------------------------------------------------------
// Default — starting point
// ---------------------------------------------------------------------------
// Optimized via coordinate descent against handpicked showcase colors
// processed through the antd dark algorithm (replicated in antdTokenCompat.ts).
// Score: 2.204 avg deltaE across 87 characters (ignoring worst 10 outliers).
export const DEFAULT_CONFIG: ColorPipelineConfig = {
  cardBg: {
    targetL: 0.42,
    lInputScale: 0.02,
    minL: 0.05,
    maxL: 0.45,
    chromaScale: 0.58,
    chromaPower: 1.0,
    minC: 0.034,
    maxC: 0.052,
    hueShift: 0,
    alpha: 0.55,
  },
  cardBorder: {
    targetL: 0.58,
    lInputScale: 0.0,
    minL: 0.20,
    maxL: 0.70,
    chromaScale: 0.45,
    chromaPower: 1.0,
    minC: 0.03,
    maxC: 0.08,
    hueShift: 0,
    alpha: 0.80,
  },
  outerBg: {
    targetL: 0.08,
    lInputScale: 0.0,
    minL: 0.02,
    maxL: 0.20,
    chromaScale: 0.15,
    chromaPower: 1.0,
    minC: 0.005,
    maxC: 0.01,
    hueShift: 0,
    alpha: 0.0,
  },
  characterListBg: {
    targetL: 0.50,
    lInputScale: 0.0,
    minL: 0.10,
    maxL: 0.60,
    chromaScale: 1.00,
    chromaPower: 1.0,
    minC: 0.10,
    maxC: 0.20,
    hueShift: 0,
    alpha: 0.50,
  },
  darkMode: {
    lOffset: -0.02,
    cScale: 0.90,
  },
}