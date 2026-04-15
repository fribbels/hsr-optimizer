import {
  classifySwatches,
  extractPalette,
  MmcqQuantizer,
  validateOptions,
} from './colorthiefImports'

// Runs in a dedicated Web Worker — image decode, downsample, and OKLCH quantization all happen here.

export interface ColorWorkerRequest {
  id: number
  url: string
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

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const DEFAULT_FALLBACK = '#2241be'
const DOWNSAMPLE_SIZE = 150
const EXTRACTION_OPTS = validateOptions({ colorCount: 20, quality: 1, colorSpace: 'oklch', minSaturation: 0.05 })

let quantizerPromise: Promise<MmcqQuantizer> | null = null

async function ensureQuantizer(): Promise<MmcqQuantizer> {
  if (!quantizerPromise) {
    quantizerPromise = (async () => {
      const q = new MmcqQuantizer()
      await q.init()
      return q
    })()
  }
  return quantizerPromise
}

async function fetchAndDownsample(url: string): Promise<ImageData> {
  const response = await fetch(url)
  const blob = await response.blob()
  const bitmap = await createImageBitmap(blob, {
    resizeWidth: DOWNSAMPLE_SIZE,
    resizeHeight: DOWNSAMPLE_SIZE,
    resizeQuality: 'low',
  })
  const canvas = new OffscreenCanvas(DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  return ctx.getImageData(0, 0, DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
}

async function handleRequest(req: ColorWorkerRequest): Promise<ColorWorkerResult | null> {
  const q = await ensureQuantizer()

  const imageData = await fetchAndDownsample(req.url)
  const { data, width, height } = imageData
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

  const swatchSet = new Set(Object.values(swatchHex).filter((hex) => hex !== DEFAULT_FALLBACK))
  const paletteHex = palette
    .map((c: { hex: () => string }) => c.hex())
    .filter((hex: string) => !swatchSet.has(hex) && hexLuminance(hex) >= 0.12)

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
