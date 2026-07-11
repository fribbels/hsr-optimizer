export interface CardColorConfig {
  // Lightness
  targetL: number // base OKLCH lightness
  lInputScale: number // how much input L influences output: outputL = targetL + (inputL - 0.5) * lInputScale
  minL: number // floor for output L
  maxL: number // ceiling for output L

  // Chroma
  chromaScale: number // multiply input chroma by this
  minC: number // floor for scaled chroma
  maxC: number // ceiling for scaled chroma

  // Alpha
  alpha: number // CSS alpha
}

export interface DarkModeConfig {
  lOffset: number // added to L (negative = darker)
  cScale: number // multiplied with C (< 1 = desaturate)
  brightnessOffset: number // added to portrait filter brightness (negative = darker)
}

export interface ColorPipelineConfig {
  cardBg: CardColorConfig
  cardBorder: CardColorConfig
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
    targetL: 0.50,
    lInputScale: 0.15,
    minL: 0.05,
    maxL: 0.70,
    chromaScale: 1.20,
    minC: 0.010,
    maxC: 0.120,
    alpha: 0.20,
  },
  cardBorder: {
    targetL: 0.80,
    lInputScale: 0.0,
    minL: 0.20,
    maxL: 0.78,
    chromaScale: 1.20,
    minC: 0.010,
    maxC: 0.120,
    alpha: 0.40,
  },
  characterListBg: {
    targetL: 0.48,
    lInputScale: 0.0,
    minL: 0.38,
    maxL: 0.62,
    chromaScale: 1.00,
    minC: 0.08,
    maxC: 0.10,
    alpha: 0.70,
  },
  darkMode: {
    lOffset: -0.05,
    cScale: 0.90,
    brightnessOffset: -0.05,
  },
}
