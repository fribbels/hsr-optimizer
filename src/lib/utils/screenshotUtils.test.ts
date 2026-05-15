import {
  buildRawSvgBlobExportPlugin,
  renderSvgDataUrlToPngBlob,
} from 'lib/utils/screenshotUtils'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

describe('renderSvgDataUrlToPngBlob', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('draws the raw SVG URL to a DPR-scaled PNG canvas', async () => {
    const drawImage = vi.fn()
    const scale = vi.fn()
    const toBlob = vi.fn((callback: BlobCallback, type?: string, quality?: number) => {
      callback(new Blob(['png'], { type }))
      expect(type).toBe('image/png')
      expect(quality).toBe(1)
    })

    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        width: 0,
        height: 0,
        style: {},
        getContext: vi.fn(() => ({ drawImage, scale })),
        toBlob,
      })),
    })

    class FakeImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage)

    const blob = await renderSvgDataUrlToPngBlob('data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E', 1100, 880, 2)

    expect(blob.type).toBe('image/png')
    expect(scale).toHaveBeenCalledWith(2, 2)
    expect(drawImage).toHaveBeenCalledWith(expect.any(FakeImage), 0, 0, 1100, 880)
    expect(document.createElement).toHaveBeenCalledWith('canvas')
  })
})

describe('buildRawSvgBlobExportPlugin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('provides a blob exporter that uses the unprocessed SVG export URL', async () => {
    const plugin = buildRawSvgBlobExportPlugin(1100, 880, 2)
    const exports = await plugin.defineExports?.({} as never)

    expect(exports?.blob).toBeTypeOf('function')
  })
})
