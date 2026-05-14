/**
 * Screenshot Utilities for Character Card Capture
 *
 * Uses `@zumer/snapdom` for DOM-to-image capture with iOS Safari workarounds.
 *
 * ## Architecture Overview
 *
 * The character card has two visual layers:
 * 1. **Background layer** (`data-portrait-bg`): Blurred portrait as <img> with filter
 * 2. **Portrait layer** (`data-portrait-inject`): Either spine animation (L2D-on) or static image (L2D-off)
 *
 * ## iOS Safari Issues & Solutions
 *
 * ### Problem 1: CSS background-image in foreignObject
 * iOS Safari/WebKit has bugs rendering CSS background-image inside SVG foreignObject
 * (which snapdom uses internally). The background either doesn't render or has decode races.
 *
 * **Solution**: ShowcaseBackgroundBlur now uses an actual <img> element instead of CSS
 * background-image. Filter is applied directly to the img (not a parent wrapper) because
 * Safari sometimes fails to paint filtered imgs when the filter is on a parent element.
 *
 * ### Problem 2: Spine canvas capture shows animated frame / blank
 * When L2D is enabled, the portrait is a spine canvas animation. Snapdom converts canvas
 * elements to PNG images, but this captures whatever frame is currently showing (animated pose).
 * Additionally, spine canvases use `preserveDrawingBuffer: false` for performance, so pixels
 * are cleared after presentation - snapdom may capture a blank canvas.
 *
 * **Solution**: For L2D-on mode, pre-fetch the static portrait image as a data URL, then
 * hide the spine wrapper and inject the static <img> in its place. We use data URLs (not
 * external URLs) to avoid iOS decode race conditions.
 *
 * ### Problem 3: Injected imgs don't render correctly in clones
 * When we inject portrait imgs into the live DOM before snapdom runs, they often don't
 * render correctly in the final capture. Issues include:
 * - `height: auto` doesn't work (clone img has 0 computed height - snapdom's offscreen
 *   clone doesn't compute layout)
 * - External URLs have decode race conditions on iOS
 * - Snapdom may not properly embed the img data
 *
 * **Solution**: Pre-fetch the portrait as a data URL with explicit dimensions calculated
 * from natural size. Set both width AND height explicitly on the injected img.
 *
 * ### Problem 4: L2D-off mode uses LoadingBlurredImage component
 * When L2D is disabled, the portrait is a React-rendered `<img>` inside `data-portrait-foreground`.
 * This renders correctly without intervention.
 *
 * **Solution**: Only apply portrait injection for L2D-on (spine) containers. Leave L2D-off
 * containers alone so LoadingBlurredImage renders naturally.
 *
 * ### Problem 5: Mobile background disappears when zoomed
 * Mobile browsers (Safari + Chrome) aggressively cull off-screen content to save GPU resources.
 * With a blur filter applied, the browser miscalculates the visible area and culls the element
 * even when partially visible.
 *
 * **Solution**: `transform: translateZ(0)` on the background img forces a dedicated GPU
 * compositing layer that won't be culled. (See ShowcaseBackgroundBlur in CharacterPreview.tsx)
 *
 * ## Data Attributes Used
 *
 * - `data-portrait-bg`: The background blur layer div (now contains <img>, not CSS background)
 * - `data-portrait-inject`: The portrait container (has positioning data attributes)
 * - `data-portrait-spine`: Wrapper around spine canvas (L2D-on only) - hidden during capture
 * - `data-portrait-foreground`: Wrapper around LoadingBlurredImage (L2D-off only)
 * - `data-portrait-url/left/top/width`: Default portrait positioning data on container
 * - `data-fallback-src`: Same-origin fallback URL on cross-origin custom portrait images.
 *   Set on the background blur `<img>` and the custom portrait wrapper `<div>`.
 *   Used by buildImageDataUriCache for the blur layer and by prepareLiveDomForCapture
 *   to detect custom portrait containers that need injection.
 *
 * ## Capture Flow
 *
 * 1. Patch canvas.getContext for Display P3 color space (better mobile colors)
 * 2. For L2D/cross-origin containers: hide un-capturable element, inject static portrait as data URL
 * 3. snapdom() capture with retry loop (up to 3x, break when blob > 1MB)
 * 4. Restore live DOM (unhide spine, remove injected img)
 * 5. Hand blob to download / Web Share / clipboard
 *
 * ## Mobile-specific Handling
 *
 * - Display P3 color space patch for iOS/Android Chrome (better color accuracy)
 * - Mobile export skin removes fragile CSS shadows and compensates with a
 *   backdrop overlay plus boosted translucent panel color.
 * - Web Share API for clipboard action on mobile (clipboard.write not supported)
 *
 * ## Historical Notes (things we tried)
 *
 * These are documented to prevent re-investigation of the same issues:
 *
 * - **afterClone modifications**: Didn't work reliably on iOS Safari - modifications made in
 *   afterClone hook weren't included in the final SVG foreignObject render due to timing issues.
 *   Solution: Modify live DOM before capture instead.
 *
 * - **Cache-busting URLs for restore**: When restoring CSS background-image, iOS would evict
 *   decoded images under memory pressure during snapdom's rasterization. Setting the exact same
 *   URL didn't force re-decode. Solution: Use `#r=${Date.now()}` fragment to change cache key.
 *   (No longer needed since we switched to <img> element)
 *
 * - **Filter toggle for re-composite**: Mobile browsers didn't properly re-render blur filter
 *   after backgroundImage change. Solution: Toggle filter off, force reflow with offsetHeight,
 *   toggle filter back. (No longer needed since we use <img> with translateZ(0))
 *
 * - **Safari XMLSerializer quirk**: Safari's XMLSerializer reads style from element.getAttribute('style')
 *   not element.style properties. When injecting imgs for clone, use setAttribute for styles.
 *
 * - **snapdom safariWarmupAttempts**: Snapdom's iOS warmup loop mutates live element's inline
 *   styles concurrently with our restore, causing style-recalc flushes that could drop our
 *   restore. Setting safariWarmupAttempts: 0 disabled this. (Removed - no longer needed)
 */

import {
  type BlobType,
  preCache,
  snapdom,
  type SnapdomPlugin,
} from '@zumer/snapdom'
import chroma from 'chroma-js'
import i18next from 'i18next'
import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import { Message } from 'lib/interactions/message.js'

const FETCH_TIMEOUT_MS = 8000
const MOBILE_EXPORT_BACKGROUND_OVERLAY_OPACITY = 0.15
const MOBILE_EXPORT_PANEL_ALPHA_BOOST = 0.10
const MOBILE_EXPORT_PANEL_SATURATION_BOOST = 0.50

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function isMobileOrSafari(): boolean {
  const userAgent = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|BlackBerry/i.test(userAgent)
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
  return isMobile || isSafari
}

function shouldUseDisplayP3(): boolean {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobileChrome = /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent)
  return isIOS || isMobileChrome
}

/**
 * Patches canvas.getContext to use Display P3 color space on mobile devices.
 * iOS and Android Chrome have wider color gamut displays - using Display P3
 * produces more accurate colors in the captured screenshot.
 * Returns a cleanup function to restore the original getContext.
 */
function patchCanvasForDisplayP3(): () => void {
  if (!shouldUseDisplayP3()) {
    return () => {}
  }

  const originalGetContext = HTMLCanvasElement.prototype.getContext

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, contextId: string, options?: any): any {
    if (contextId === '2d') {
      return Reflect.apply(originalGetContext, this, [contextId, { colorSpace: 'display-p3', ...options }])
    }
    return Reflect.apply(originalGetContext, this, [contextId, options])
  }

  return () => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
  }
}

function buildMobileExportPanelColor(style: CSSStyleDeclaration): string | null {
  const color = chroma(style.backgroundColor)
  const alpha = color.alpha()
  if (!(alpha > 0 && alpha < 1)) return null

  const [h, s, l] = color.hsl()
  return chroma.hsl(
    Number.isFinite(h) ? h : 0,
    Math.min(1, s * (1 + MOBILE_EXPORT_PANEL_SATURATION_BOOST)),
    Math.min(1, l + MOBILE_EXPORT_PANEL_SATURATION_BOOST * 0.08),
  ).alpha(Math.min(0.95, alpha + MOBILE_EXPORT_PANEL_ALPHA_BOOST)).css()
}

function prepareMobileExportSkinForCapture(root: HTMLElement): () => void {
  const restoreActions: Array<() => void> = []

  // Mobile WebKit/Chromium can corrupt CSS shadows during SVG foreignObject -> canvas export.
  // This export skin removes those shadows and restores perceived depth by
  // darkening only the blurred backdrop layer behind the translucent panels.
  const backdrop = root.querySelector<HTMLElement>('[data-portrait-bg]')
  if (backdrop) {
    const overlay = document.createElement('div')
    overlay.style.cssText = [
      'position:absolute',
      'inset:0',
      `background:rgba(0, 0, 0, ${MOBILE_EXPORT_BACKGROUND_OVERLAY_OPACITY})`,
      'pointer-events:none',
      'z-index:0',
    ].join(';')
    backdrop.insertAdjacentElement('afterend', overlay)
    restoreActions.push(() => {
      if (overlay.isConnected) overlay.remove()
    })
  }

  const candidates = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of candidates) {
    const style = getComputedStyle(el)
    if (style.boxShadow === 'none') continue

    const originalBoxShadow = el.style.boxShadow
    const originalBackgroundColor = el.style.backgroundColor
    const exportPanelColor = buildMobileExportPanelColor(style)

    el.style.boxShadow = 'none'
    if (exportPanelColor) {
      el.style.backgroundColor = exportPanelColor
    }

    restoreActions.push(() => {
      if (!el.isConnected) return
      el.style.boxShadow = originalBoxShadow
      el.style.backgroundColor = originalBackgroundColor
    })
  }

  return () => {
    for (let i = restoreActions.length - 1; i >= 0; i--) {
      try {
        restoreActions[i]()
      } catch { /* best-effort */ }
    }
  }
}

/**
 * Prepares the live DOM for screenshot capture by replacing un-capturable portrait
 * elements with static images that snapdom can serialize.
 *
 * Handles two cases for `[data-portrait-inject]` containers:
 * - **Spine/L2D** (`[data-portrait-spine]`): canvas uses preserveDrawingBuffer:false,
 *   so snapdom captures a blank frame. Hides spine, injects static portrait.
 * - **Cross-origin custom portrait** (`[data-fallback-src]`): external images from
 *   servers without CORS headers can't be fetched/inlined by snapdom. Hides the custom
 *   portrait and injects the default character portrait with charCenter positioning.
 *
 * Returns a restore function that undoes all changes in reverse order.
 */
async function prepareLiveDomForCapture(root: HTMLElement, corsFailed: Set<string>): Promise<() => void> {
  const restoreActions: Array<() => void> = []
  const loadPromises: Promise<void>[] = []

  const containers = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-inject]'))

  for (const container of containers) {
    const url = container.dataset.portraitUrl
    const left = container.dataset.portraitLeft
    const top = container.dataset.portraitTop
    const width = container.dataset.portraitWidth
    if (!url || !left || !top || !width) continue

    const spineWrapper = container.querySelector<HTMLElement>('[data-portrait-spine]')
    const customPortraitWrapper = container.querySelector<HTMLElement>('[data-fallback-src]')

    // Default portrait without L2D — renders natively via LoadingBlurredImage, skip
    if (!spineWrapper && !customPortraitWrapper) continue

    let elementToHide: HTMLElement

    if (spineWrapper) {
      elementToHide = spineWrapper
    } else {
      // Custom portrait: skip injection if buildImageDataUriCache already fetched it successfully
      const customImgUrl = customPortraitWrapper!.querySelector<HTMLImageElement>('img')?.src
      if (customImgUrl && !corsFailed.has(customImgUrl)) continue
      elementToHide = customPortraitWrapper!
    }

    const originalDisplay = elementToHide.style.display
    elementToHide.style.display = 'none'
    restoreActions.push(() => {
      if (elementToHide.isConnected) elementToHide.style.display = originalDisplay
    })

    try {
      const response = await withTimeout(fetch(url), FETCH_TIMEOUT_MS)
      const blob = await response.blob()
      const dataUrl = await blobToDataUrl(blob)

      // Probe natural dimensions - explicit height required (height:auto = 0 in clones)
      const probe = new Image()
      const dims = await new Promise<{ w: number, h: number }>((resolve) => {
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight })
        probe.onerror = () => resolve({ w: 1, h: 1 })
        probe.src = dataUrl
      })

      const w = parseFloat(width)
      const h = w * (dims.h / dims.w)

      // Inject visible portrait img with correct charCenter-based positioning
      const img = new Image()
      img.src = dataUrl
      img.style.position = 'absolute'
      img.style.left = `${left}px`
      img.style.top = `${top}px`
      img.style.width = `${w}px`
      img.style.height = `${h}px`
      img.style.zIndex = '1'

      loadPromises.push(
        new Promise<void>((resolve) => {
          img.onload = async () => {
            if (typeof img.decode === 'function') await img.decode().catch(() => {})
            resolve()
          }
          img.onerror = () => resolve()
        }),
      )

      container.appendChild(img)
      restoreActions.push(() => {
        if (img.isConnected) img.remove()
      })
    } catch {
      // Fetch failed - element hide restore already registered, UI will recover
    }
  }

  // Wait for images with timeout so we don't hang the capture
  await withTimeout(Promise.all(loadPromises), 4000).catch(() => {})

  // Return restore function - executes in reverse order for proper cleanup
  return () => {
    for (let i = restoreActions.length - 1; i >= 0; i--) {
      try {
        restoreActions[i]()
      } catch { /* best-effort */ }
    }
  }
}

/**
 * Resolves a data URI for a cross-origin image that tainted the canvas.
 * Tries fetch (works when the server sends CORS headers), then falls back
 * to the same-origin URL from data-fallback-src.
 */
async function resolveTaintedImage(
  img: HTMLImageElement,
  cache: Map<string, string>,
): Promise<{ dataUrl: string } | { corsFailed: true }> {
  try {
    const blob = await withTimeout(fetch(img.src), FETCH_TIMEOUT_MS).then((r) => r.blob())
    return { dataUrl: await blobToDataUrl(blob) }
  } catch { /* CORS fetch failed */ }

  const fallbackUrl = img.dataset.fallbackSrc
    ?? img.closest<HTMLElement>('[data-fallback-src]')?.dataset.fallbackSrc

  if (fallbackUrl && cache.has(fallbackUrl)) {
    return { dataUrl: cache.get(fallbackUrl)! }
  }

  if (fallbackUrl) {
    try {
      const fallbackImg = new Image()
      await withTimeout(
        new Promise<void>((resolve) => {
          fallbackImg.onload = () => resolve()
          fallbackImg.onerror = () => resolve()
          fallbackImg.src = fallbackUrl
        }),
        FETCH_TIMEOUT_MS,
      )
      if (fallbackImg.naturalWidth) {
        const c = document.createElement('canvas')
        const cx = c.getContext('2d')!
        c.width = fallbackImg.naturalWidth
        c.height = fallbackImg.naturalHeight
        cx.drawImage(fallbackImg, 0, 0)
        return { dataUrl: c.toDataURL() }
      }
    } catch { /* best-effort */ }
  }

  return { corsFailed: true }
}

/** Convert loaded images to data URIs so snapdom doesn't re-fetch them.
 *  For cross-origin images that taint the canvas, tries fetch() then a
 *  same-origin fallback from data-fallback-src. Tainted images are resolved
 *  in parallel to avoid sequential timeout delays.
 *  Returns the cache and a set of URLs that failed CORS — used by
 *  prepareLiveDomForCapture to decide whether to inject the default portrait. */
async function buildImageDataUriCache(root: Element): Promise<{ cache: Map<string, string>, corsFailed: Set<string> }> {
  const cache = new Map<string, string>()
  const corsFailed = new Set<string>()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return { cache, corsFailed }

  const taintedWork: Array<{ src: string, promise: Promise<{ dataUrl: string } | { corsFailed: true }> }> = []

  for (const img of root.querySelectorAll<HTMLImageElement>('img')) {
    if (!img.complete || !img.naturalWidth || img.src.startsWith('data:') || cache.has(img.src)) continue
    try {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      cache.set(img.src, canvas.toDataURL())
    } catch {
      taintedWork.push({ src: img.src, promise: resolveTaintedImage(img, cache) })
    }
  }

  const results = await Promise.allSettled(taintedWork.map((w) => w.promise))
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status !== 'fulfilled') continue
    const value = result.value
    if ('dataUrl' in value) {
      cache.set(taintedWork[i].src, value.dataUrl)
    } else {
      corsFailed.add(taintedWork[i].src)
    }
  }

  return { cache, corsFailed }
}

/** Snapdom plugin that replaces img srcs on the clone with pre-built data URIs. */
function buildImageInliningPlugin(cache: Map<string, string>): SnapdomPlugin {
  return {
    name: 'image-inlining',
    afterClone({ clone }) {
      if (!clone) return
      for (const img of clone.querySelectorAll<HTMLImageElement>('img')) {
        const dataUrl = cache.get(img.src)
        if (dataUrl) img.src = dataUrl
      }
    },
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Screenshot attempt timed out after ${ms}ms`)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        resolve(v)
      },
      (e) => {
        clearTimeout(timer)
        reject(e)
      },
    )
  })
}

/**
 * Captures a screenshot of the element and either copies to clipboard or downloads.
 *
 * @param elementId - DOM element ID to capture
 * @param action - 'clipboard' uses Web Share API on mobile, clipboard.write on desktop
 * @param characterName - Optional name for the downloaded file
 *
 * See module-level documentation for details on iOS Safari workarounds.
 */
export async function screenshotElementById(
  elementId: string,
  action: 'clipboard' | 'download',
  characterName?: string | null,
): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    console.warn(`screenshotElementById: element "${elementId}" not found`)
    return
  }

  const mobile = isMobileOrSafari()

  const repeatLoadBlob = async (): Promise<Blob> => {
    const maxAttempts = 3
    const attemptTimeoutMs = 8000

    await Promise.all([
      document.fonts.load('400 1em "Maven Pro"'),
      document.fonts.load('500 1em "Maven Pro"'),
    ]).catch(() => { /* best-effort */ })

    try {
      await preCache(element)
    } catch { /* best-effort */ }
    const { cache: imageCache, corsFailed } = await buildImageDataUriCache(element)

    const restoreContext = patchCanvasForDisplayP3()

    let blob: Blob | null = null
    let lastError: unknown = null
    try {
      for (let i = 0; i < maxAttempts; i++) {
        let restoreLiveDom: (() => void) | null = null
        let restoreMobileExportSkin: (() => void) | null = null
        try {
          restoreLiveDom = await prepareLiveDomForCapture(element, corsFailed)
          if (mobile) {
            restoreMobileExportSkin = prepareMobileExportSkinForCapture(element)
          }
          const capture = await withTimeout(
            snapdom(element, {
              scale: 1,
              dpr: 2,
              width: cardTotalW,
              height: parentH,
              backgroundColor: 'transparent',
              outerShadows: true,
              embedFonts: true,
              fallbackURL: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              plugins: [buildImageInliningPlugin(imageCache)],
            }),
            attemptTimeoutMs,
          )
          // ClipboardItem.supports may be unavailable in older browsers or non-secure contexts
          const supportsWebp = typeof ClipboardItem !== 'undefined'
            && typeof ClipboardItem.supports === 'function'
            && ClipboardItem.supports('image/webp')
          const type: BlobType = (action === 'download' || supportsWebp) ? 'webp' : 'png'
          blob = await capture.toBlob({ type, quality: 1.0 })
          if (blob && blob.size > 1_500_000) break
        } catch (e) {
          lastError = e
        } finally {
          restoreMobileExportSkin?.()
          restoreLiveDom?.()
        }
      }
    } finally {
      restoreContext()
    }

    if (!blob) {
      const msg = lastError instanceof Error ? lastError.message : 'unknown error'
      throw new Error(`Screenshot failed after ${maxAttempts} attempts: ${msg}`)
    }
    return blob
  }

  function handleBlob(blob: Blob): void {
    const prefix = characterName || 'Hsr-optimizer'
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const ext = blob.type === 'image/webp' ? 'webp' : 'png'
    const filename = `${prefix}-${date}-${time}.${ext}`

    if (action === 'clipboard') {
      if (mobile) {
        const file = new File([blob], filename, { type: blob.type })
        const canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
        if (canShareFiles) {
          navigator.share({ files: [file], title: '', text: '' }).catch((e: unknown) => {
            // Don't show error toast when user cancels the share dialog
            if (e instanceof Error && e.name === 'AbortError') return
            Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed.Default'))
          })
        } else {
          Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed.Default'))
        }
      } else {
        const data = [new ClipboardItem({ [blob.type]: blob })]
        void navigator.clipboard.write(data)
          .then(() => Message.success(i18next.t('charactersTab:ScreenshotMessages.ScreenshotSuccess')))
          .catch((e) => {
            if (e instanceof DOMException && e.name === 'NotAllowedError') {
              Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed.NotAllowed'))
            } else {
              Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed.Default'))
            }
            console.error(e)
          })
      }
    }

    if (action === 'download') {
      const fileUrl = window.URL.createObjectURL(blob)
      const anchorElement = document.createElement('a')
      anchorElement.href = fileUrl
      anchorElement.download = filename
      anchorElement.style.display = 'none'
      document.body.appendChild(anchorElement)
      anchorElement.click()
      anchorElement.remove()
      window.URL.revokeObjectURL(fileUrl)
      Message.success(i18next.t('charactersTab:ScreenshotMessages.DownloadSuccess'))
    }
  }

  let blob
  try {
    blob = await repeatLoadBlob()
  } catch (e) {
    Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed.Default'))
    console.error(e)
    return
  }
  handleBlob(blob)
}
