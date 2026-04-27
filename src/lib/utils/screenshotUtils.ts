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
 * - `data-portrait-url/left/top/width`: Portrait positioning data on container
 *
 * ## Capture Flow
 *
 * 1. Patch canvas.getContext for Display P3 color space (better mobile colors)
 * 2. For L2D containers: hide spine wrapper, inject static portrait as data URL
 * 3. snapdom() capture with retry loop (up to 3x, break when blob > 1MB)
 * 4. Restore live DOM (unhide spine, remove injected img)
 * 5. Hand blob to download / Web Share / clipboard
 *
 * ## Mobile-specific Handling
 *
 * - Display P3 color space patch for iOS/Android Chrome (better color accuracy)
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
  preCache,
  snapdom,
} from '@zumer/snapdom'
import i18next from 'i18next'
import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import { Message } from 'lib/interactions/message.js'

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
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, options?: any): any {
    if (contextId === '2d') {
      return Reflect.apply(originalGetContext, this, [contextId, { colorSpace: 'display-p3', ...options }])
    }
    return Reflect.apply(originalGetContext, this, [contextId, options])
  }

  return () => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
  }
}

/**
 * Prepares the live DOM for screenshot capture by handling L2D spine canvases.
 *
 * ## Why this exists
 * Spine canvases use `preserveDrawingBuffer: false` for performance, which means
 * their pixels can't be read after presentation. Snapdom would capture a blank canvas.
 *
 * ## What it does
 * For each L2D-on container (has `data-portrait-spine`):
 * 1. Hide the spine canvas wrapper
 * 2. Fetch the static portrait as a data URL (external URLs have decode races on iOS)
 * 3. Inject a visible <img> with explicit pixel dimensions (height:auto doesn't work in clones)
 *
 * Returns a restore function that undoes all changes in reverse order.
 */
async function prepareLiveDomForCapture(root: HTMLElement): Promise<() => void> {
  const restoreActions: Array<() => void> = []

  const containers = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-inject]'))
  const loadPromises: Promise<void>[] = []

  for (const container of containers) {
    const spineWrapper = container.querySelector<HTMLElement>('[data-portrait-spine]')
    if (!spineWrapper) continue // L2D-off: LoadingBlurredImage renders natively, skip

    const url = container.dataset.portraitUrl
    const left = container.dataset.portraitLeft
    const top = container.dataset.portraitTop
    const width = container.dataset.portraitWidth
    if (!url || !left || !top || !width) continue

    // Hide spine wrapper
    const originalDisplay = spineWrapper.style.display
    spineWrapper.style.display = 'none'
    restoreActions.push(() => {
      if (spineWrapper.isConnected) spineWrapper.style.display = originalDisplay
    })

    // Fetch portrait as data URL to avoid iOS decode race conditions
    try {
      const response = await withTimeout(fetch(url), 4000)
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Probe natural dimensions - explicit height required (height:auto = 0 in clones)
      const probe = new Image()
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight })
        probe.onerror = () => resolve({ w: 1, h: 1 })
        probe.src = dataUrl
      })

      const w = parseFloat(width)
      const h = w * (dims.h / dims.w)

      // Inject visible portrait img
      const img = new Image()
      img.src = dataUrl
      img.style.position = 'absolute'
      img.style.left = `${left}px`
      img.style.top = `${top}px`
      img.style.width = `${w}px`
      img.style.height = `${h}px`
      img.style.zIndex = '1'

      loadPromises.push(new Promise<void>((resolve) => {
        img.onload = async () => {
          if (typeof img.decode === 'function') await img.decode().catch(() => {})
          resolve()
        }
        img.onerror = () => resolve()
      }))

      container.appendChild(img)
      restoreActions.push(() => {
        if (img.isConnected) img.remove()
      })
    } catch {
      // Fetch failed - spine wrapper restore already registered, UI will recover
    }
  }

  // Wait for images with timeout so we don't hang the capture
  await withTimeout(Promise.all(loadPromises), 4000).catch(() => {})

  // Return restore function - executes in reverse order for proper cleanup
  return () => {
    for (let i = restoreActions.length - 1; i >= 0; i--) {
      try { restoreActions[i]() } catch { /* best-effort */ }
    }
  }
}

/** No-op snapdom plugin - all DOM modifications happen before capture now */
function buildNoOpPlugin() {
  return {
    name: 'no-op',
    afterClone() {
      // All modifications now done in prepareLiveDomForCapture
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

    // Warm snapdom's resource cache
    try {
      await preCache(element)
    } catch {
      // Best-effort
    }

    const restoreContext = patchCanvasForDisplayP3()

    let blob: Blob | null = null
    let lastError: unknown = null
    try {
      for (let i = 0; i < maxAttempts; i++) {
        let restoreLiveDom: (() => void) | null = null
        try {
          restoreLiveDom = await prepareLiveDomForCapture(element)
          const capture = await withTimeout(
            snapdom(element, {
              scale: 1.5,
              dpr: 1,
              width: cardTotalW,
              height: parentH,
              backgroundColor: 'transparent',
              outerShadows: true,
              embedFonts: true,
              plugins: [buildNoOpPlugin()],
            }),
            attemptTimeoutMs,
          )
          blob = await capture.toBlob({ type: 'png' })
          if (blob && blob.size > 1_000_000) break
        } catch (e) {
          lastError = e
        } finally {
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
    const filename = `${prefix}-${date}-${time}.png`

    if (action === 'clipboard') {
      if (mobile) {
        const file = new File([blob], filename, { type: 'image/png' })
        const canShareFiles = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
        if (canShareFiles) {
          navigator.share({ files: [file], title: '', text: '' }).catch((e: unknown) => {
            // Don't show error toast when user cancels the share dialog
            if (e instanceof Error && e.name === 'AbortError') return
            Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
          })
        } else {
          Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
        }
      } else {
        try {
          const data = [new ClipboardItem({ [blob.type]: blob })]
          void navigator.clipboard.write(data).then(() => {
            Message.success(i18next.t('charactersTab:ScreenshotMessages.ScreenshotSuccess'))
          })
        } catch (e) {
          console.error(e)
          Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
        }
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

  const blob = await repeatLoadBlob()
  handleBlob(blob)
}
