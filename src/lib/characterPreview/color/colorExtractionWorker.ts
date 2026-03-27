// Runs in a dedicated Web Worker — all heavy OKLCH quantization happens here.

import {
  extractPalette,
  classifySwatches,
  validateOptions,
  MmcqQuantizer,
} from './colorthiefImports'

export interface ColorWorkerRequest {
  id: number
  imageData: ImageData
}

export interface ColorWorkerResponse {
  id: number
  result: ColorWorkerResult | null
  error?: string
}

export type SwatchHex = Record<'Vibrant' | 'Muted' | 'DarkVibrant' | 'DarkMuted' | 'LightVibrant' | 'LightMuted', string>

export interface ColorWorkerResult {
  swatchHex: SwatchHex
  paletteHex: string[]
}

const DEFAULT_FALLBACK = '#2241be'
const EXTRACTION_OPTS = validateOptions({ colorCount: 20, quality: 10, colorSpace: 'oklch' })

let quantizer: MmcqQuantizer | null = null

async function ensureQuantizer(): Promise<MmcqQuantizer> {
  if (!quantizer) {
    quantizer = new MmcqQuantizer()
    await quantizer.init()
  }
  return quantizer
}

async function handleRequest(req: ColorWorkerRequest): Promise<ColorWorkerResult | null> {
  const q = await ensureQuantizer()

  const { data, width, height } = req.imageData
  const palette = extractPalette(data, width, height, EXTRACTION_OPTS, q)
  if (!palette || palette.length === 0) return null

  const swatchMap = classifySwatches(palette)

  const swatchHex: SwatchHex = {
    Vibrant: swatchMap.Vibrant?.color.hex() ?? DEFAULT_FALLBACK,
    Muted: swatchMap.Muted?.color.hex() ?? DEFAULT_FALLBACK,
    DarkVibrant: swatchMap.DarkVibrant?.color.hex() ?? DEFAULT_FALLBACK,
    DarkMuted: swatchMap.DarkMuted?.color.hex() ?? DEFAULT_FALLBACK,
    LightVibrant: swatchMap.LightVibrant?.color.hex() ?? DEFAULT_FALLBACK,
    LightMuted: swatchMap.LightMuted?.color.hex() ?? DEFAULT_FALLBACK,
  }

  const swatchSet = new Set(Object.values(swatchHex))
  const paletteHex = palette
    .map((c: { hex: () => string }) => c.hex())
    .filter((hex: string) => {
      if (swatchSet.has(hex)) return false
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return lum >= 0.12
    })

  return { swatchHex, paletteHex }
}

self.onmessage = async (e: MessageEvent<ColorWorkerRequest>) => {
  const req = e.data
  try {
    const result = await handleRequest(req)
    const response: ColorWorkerResponse = { id: req.id, result }
    self.postMessage(response)
  } catch (err) {
    const response: ColorWorkerResponse = {
      id: req.id,
      result: null,
      error: err instanceof Error ? err.message : 'Unknown worker error',
    }
    self.postMessage(response)
  }
}
