import type { ColorWorkerRequest, ColorWorkerResponse, ColorWorkerResult } from './colorExtractionWorker'

const DOWNSAMPLE_SIZE = 150

export type PaletteResponse = {
  Vibrant: string
  Muted: string
  DarkVibrant: string
  DarkMuted: string
  LightVibrant: string
  LightMuted: string
  colors: string[]
}

let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, {
  resolve: (value: ColorWorkerResult | null) => void
  reject: (reason: unknown) => void
}>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL('./colorExtractionWorker.ts', import.meta.url),
      { type: 'module' },
    )
    worker.onmessage = (e: MessageEvent<ColorWorkerResponse>) => {
      const { id, result, error } = e.data
      const entry = pending.get(id)
      if (!entry) return
      pending.delete(id)
      if (error) {
        entry.reject(new Error(error))
      } else {
        entry.resolve(result)
      }
    }
    worker.onerror = (e) => {
      console.error('[colorExtractionService] Worker error:', e)
      for (const [id, entry] of pending) {
        entry.reject(new Error('Worker error'))
        pending.delete(id)
      }
      worker = null
    }
  }
  return worker
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Reused across calls to avoid repeated canvas allocation
let offscreenCanvas: HTMLCanvasElement | null = null
let offscreenCtx: CanvasRenderingContext2D | null = null

function downsampleToImageData(source: HTMLImageElement | HTMLCanvasElement): ImageData {
  if (!offscreenCanvas) {
    offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = DOWNSAMPLE_SIZE
    offscreenCanvas.height = DOWNSAMPLE_SIZE
    offscreenCtx = offscreenCanvas.getContext('2d')!
  }
  offscreenCtx!.clearRect(0, 0, DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
  offscreenCtx!.drawImage(source, 0, 0, DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
  return offscreenCtx!.getImageData(0, 0, DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
}

/**
 * Extract a color palette from an image URL or canvas, fully off the main thread.
 * Main-thread cost: image load + downsample (~2-5ms).
 */
export async function extractPaletteInWorker(
  src: string | HTMLCanvasElement,
): Promise<PaletteResponse | null> {
  try {
    const source = typeof src === 'string' ? await loadImage(src) : src
    const imageData = downsampleToImageData(source)

    const id = nextId++
    const w = getWorker()

    const result = await new Promise<ColorWorkerResult | null>((resolve, reject) => {
      pending.set(id, { resolve, reject })
      const request: ColorWorkerRequest = { id, imageData }
      w.postMessage(request, [imageData.data.buffer])
    })

    if (!result) return null

    return {
      ...result.swatchHex,
      colors: result.paletteHex,
    }
  } catch (e) {
    console.error('[colorExtractionService]', e)
    return null
  }
}
