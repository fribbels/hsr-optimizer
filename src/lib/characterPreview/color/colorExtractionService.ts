import type {
  ColorWorkerRequest,
  ColorWorkerResponse,
  ColorWorkerResult,
} from './colorExtractionWorker'

export type PaletteResponse = {
  Vibrant: string,
  Muted: string,
  DarkVibrant: string,
  DarkMuted: string,
  LightVibrant: string,
  LightMuted: string,
  colors: string[],
}

let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, {
  resolve: (value: ColorWorkerResult | null) => void,
  reject: (reason: unknown) => void,
}>()

// URL-keyed cache so repeat extractions for the same image are free
const urlCache = new Map<string, PaletteResponse>()

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

/**
 * Extract a color palette from an image URL, fully off the main thread.
 * The worker fetches, decodes, downsamples, and quantizes — main-thread cost is ~0ms.
 */
export async function extractPaletteInWorker(
  url: string,
): Promise<PaletteResponse | null> {
  const cached = urlCache.get(url)
  if (cached) return cached

  try {
    const id = nextId++
    const w = getWorker()

    const result = await new Promise<ColorWorkerResult | null>((resolve, reject) => {
      pending.set(id, { resolve, reject })
      const request: ColorWorkerRequest = { id, url }
      w.postMessage(request)
    })

    if (!result) return null

    const palette: PaletteResponse = {
      ...result.swatchHex,
      colors: result.paletteHex,
    }

    urlCache.set(url, palette)
    return palette
  } catch (e) {
    console.error('[colorExtractionService]', e)
    return null
  }
}
