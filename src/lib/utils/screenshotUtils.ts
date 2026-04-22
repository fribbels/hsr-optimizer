/**
 * Screenshot Utilities for Character Card Capture
 *
 * This module handles DOM-to-image capture using snapdom library, with specific
 * workarounds for iOS Safari compatibility issues.
 *
 * ## Architecture Overview
 *
 * The character card has two main visual layers:
 * 1. **Background layer** (`data-portrait-bg`): Blurred character portrait as CSS background-image
 * 2. **Portrait layer** (`data-portrait-inject`): Either spine animation (L2D-on) or static image (L2D-off)
 *
 * ## iOS Safari Issues & Solutions
 *
 * ### Problem 1: CSS background-image in foreignObject
 * iOS Safari/WebKit has bugs rendering CSS background-image inside SVG foreignObject
 * (which snapdom uses internally). The background either doesn't render or has decode races.
 *
 * **Solution**: Inject a hidden `<img>` element into the live DOM alongside the CSS background.
 * In the clone's afterClone hook, strip the CSS background-image and reveal the injected img.
 * This converts the CSS background to a real img element that renders reliably.
 *
 * ### Problem 2: Spine canvas capture shows animated frame
 * When L2D is enabled, the portrait is a spine canvas animation. Snapdom converts canvas
 * elements to PNG images, but this captures whatever frame is currently showing (animated pose).
 * Users want the static character portrait instead.
 *
 * **Solution**: For L2D-on mode, pre-fetch the static portrait image as a data URL, then
 * inject it directly into the clone during afterClone (hiding the spine-converted PNG).
 *
 * ### Problem 3: Injected imgs in live DOM don't render in clone
 * When we inject portrait imgs into the live DOM before snapdom runs, they often don't
 * render correctly in the final capture. Issues include:
 * - `height: auto` doesn't work (clone img has 0 computed height)
 * - External URLs have decode race conditions on iOS
 * - Snapdom may not properly embed the img data
 *
 * **Solution**: Don't inject portrait into live DOM. Instead:
 * 1. Pre-fetch the portrait as a data URL with explicit dimensions calculated from natural size
 * 2. Inject directly into the clone during afterClone callback
 * This bypasses all snapdom cloning issues since we create the img fresh in the clone.
 *
 * ### Problem 4: L2D-off mode uses LoadingBlurredImage component
 * When L2D is disabled, the portrait is a React-rendered `<img>` inside `data-portrait-foreground`.
 * This renders correctly without intervention.
 *
 * **Solution**: Only apply portrait injection for L2D-on (spine) containers. Leave L2D-off
 * containers alone so LoadingBlurredImage renders naturally.
 *
 * ## Data Attributes Used
 *
 * - `data-portrait-bg`: The background blur layer div (has CSS background-image)
 * - `data-portrait-inject`: The portrait container (has positioning data attributes)
 * - `data-portrait-spine`: Wrapper around spine canvas (L2D-on only)
 * - `data-portrait-foreground`: Wrapper around LoadingBlurredImage (L2D-off only)
 * - `data-snap-bg-img`: Injected background img (hidden in live DOM, revealed in clone)
 * - `data-portrait-url/left/top/width`: Portrait positioning data on container
 *
 * ## Capture Flow
 *
 * 1. Pre-cache resources with snapdom's preCache()
 * 2. For L2D-on containers: fetch portrait as data URL, calculate explicit dimensions
 * 3. Inject hidden bg imgs into live DOM
 * 4. Run snapdom capture with afterClone plugin:
 *    a. Strip CSS background-image from bg divs, reveal injected bg imgs
 *    b. For L2D-on: hide all imgs in container, inject fresh portrait img
 *    c. For L2D-off: leave container alone (LoadingBlurredImage renders naturally)
 * 5. Convert capture to PNG blob
 * 6. Clean up injected elements from live DOM
 *
 * ## Mobile-specific Handling
 *
 * - Display P3 color space patch for iOS/Android Chrome (better color accuracy)
 * - Web Share API for clipboard action on mobile (clipboard.write not supported)
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

function positionImgLikeBackground(img: HTMLImageElement, bgSize: string, bgPos: string): void {
  img.style.position = 'absolute'
  img.style.display = 'block'
  img.style.pointerEvents = 'none'
  if (bgSize === 'cover') {
    img.style.left = '0'
    img.style.top = '0'
    img.style.width = '100%'
    img.style.height = '100%'
    img.style.objectFit = 'cover'
    img.style.objectPosition = bgPos || 'center'
  } else {
    const sizeMatch = /^(-?[\d.]+)px\s+auto$/.exec(bgSize)
    const posMatch = /^(-?[\d.]+)px\s+(-?[\d.]+)px$/.exec(bgPos)
    if (sizeMatch && posMatch) {
      img.style.width = `${sizeMatch[1]}px`
      img.style.height = 'auto'
      img.style.left = `${posMatch[1]}px`
      img.style.top = `${posMatch[2]}px`
    } else {
      img.style.left = '0'
      img.style.top = '0'
      img.style.width = '100%'
      img.style.height = 'auto'
    }
  }
}

/**
 * Injects hidden <img> elements into the live DOM to replace CSS background-images.
 *
 * iOS Safari has bugs rendering CSS background-image inside SVG foreignObject.
 * This function creates a real <img> positioned to match the CSS background,
 * hidden via visibility:hidden. The afterClone hook will strip the CSS background
 * and reveal the img.
 *
 * Why inject into live DOM (not clone)?
 * - The bg img needs to be loaded before snapdom clones
 * - We use cache-busted URLs to ensure fresh fetch
 * - The img is positioned using the same size/position as the CSS background
 *
 * Returns a cleanup function to remove injected elements after capture.
 */
async function injectHiddenLiveBgImages(root: HTMLElement, cacheBust: string): Promise<() => void> {
  const bgElements = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-bg]'))
  const injectedImgs: HTMLImageElement[] = []
  const loadPromises: Promise<void>[] = []

  for (const el of bgElements) {
    const bgStyleRaw = el.style.backgroundImage
    const match = /url\(["']?([^"')]+)["']?\)/.exec(bgStyleRaw)
    if (!match) continue

    const url = match[1]
    const bgSize = el.style.backgroundSize
    const bgPos = el.style.backgroundPosition
    // Cache-bust passed from outside retry loop to reuse decode cache across attempts
    const cacheBustedUrl = `${url}#${cacheBust}`

    const img = document.createElement('img')
    positionImgLikeBackground(img, bgSize, bgPos)
    img.setAttribute('data-snap-bg-img', '')
    // Hidden in live DOM - will be revealed in clone by afterClone hook
    img.style.visibility = 'hidden'

    const loadPromise = new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
    loadPromises.push(loadPromise)

    img.src = cacheBustedUrl
    el.appendChild(img)
    injectedImgs.push(img)
  }

  // Wait for all imgs to load before snapdom clones the DOM
  if (loadPromises.length > 0) {
    await Promise.all(loadPromises)
  }

  return () => {
    for (const img of injectedImgs) img.remove()
  }
}

/**
 * Pre-fetched portrait data for injection into clone.
 * Contains everything needed to create the img element in afterClone.
 */
interface PortraitData {
  dataUrl: string  // Base64 data URL (embedded, no external fetch needed)
  left: string     // CSS left position
  top: string      // CSS top position
  width: number    // Explicit width in pixels
  height: number   // Explicit height in pixels (calculated from aspect ratio)
}

/**
 * Pre-fetches portrait images as data URLs for L2D-on (spine) containers.
 *
 * Why pre-fetch as data URL?
 * - External URLs have decode race conditions on iOS Safari
 * - Data URLs are embedded, so no network fetch needed in clone
 * - We can calculate explicit dimensions from natural size
 *
 * Why explicit dimensions?
 * - `height: auto` doesn't work in cloned DOM (getBoundingClientRect returns 0x0)
 * - The clone is off-screen, so browser doesn't calculate auto dimensions
 * - We must set both width AND height explicitly
 *
 * Why only for L2D-on (spine) containers?
 * - L2D-off uses LoadingBlurredImage which renders correctly without intervention
 * - We detect spine by checking for [data-portrait-spine] child element
 *
 * Returns a Map from portrait URL to PortraitData for use in afterClone.
 */
async function preparePortraitData(root: HTMLElement): Promise<Map<string, PortraitData>> {
  const containers = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-inject]'))
  const portraitDataMap = new Map<string, PortraitData>()

  // Filter to spine containers and extract positioning data
  const spineContainers = containers
    .filter((c) => c.querySelector('[data-portrait-spine]') != null)
    .map((c) => ({
      url: c.dataset.portraitUrl,
      left: c.dataset.portraitLeft,
      top: c.dataset.portraitTop,
      width: c.dataset.portraitWidth,
    }))
    .filter((d): d is { url: string; left: string; top: string; width: string } =>
      d.url != null && d.left != null && d.top != null && d.width != null
    )

  // Fetch all portraits in parallel
  await Promise.all(spineContainers.map(async ({ url, left, top, width }) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const tempImg = new Image()
      const dims = await new Promise<{ w: number; h: number }>((resolve) => {
        tempImg.onload = () => resolve({ w: tempImg.naturalWidth, h: tempImg.naturalHeight })
        tempImg.onerror = () => resolve({ w: 1, h: 1 })
        tempImg.src = dataUrl
      })

      const w = parseFloat(width)
      const aspectRatio = dims.h / dims.w
      portraitDataMap.set(url, {
        dataUrl,
        left,
        top,
        width: w,
        height: w * aspectRatio,
      })
    } catch {
      // Skip failed fetches
    }
  }))

  return portraitDataMap
}

/**
 * Creates a snapdom plugin that processes the cloned DOM before capture.
 *
 * This plugin runs in the afterClone hook, which fires after snapdom clones
 * the DOM but before it renders to canvas. This is the ideal place to:
 * 1. Swap CSS backgrounds for real img elements
 * 2. Replace spine animation with static portrait
 *
 * Why afterClone instead of modifying live DOM?
 * - Changes to clone don't affect the live page
 * - We can be more aggressive (hide elements, inject new ones)
 * - Avoids race conditions with React reconciliation
 *
 * Why inject portrait into clone (not live DOM)?
 * - Imgs injected into live DOM have issues in the clone:
 *   - `height: auto` returns 0 (clone is off-screen)
 *   - External URLs may not load in time
 *   - Snapdom may not properly embed the data
 * - Injecting fresh into clone with data URL and explicit dimensions
 *   bypasses all these issues
 */
function buildRevealBgPlugin(portraitDataMap: Map<string, PortraitData>) {
  return {
    name: 'reveal-bg-in-clone',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterClone(context: any) {
      const clone = context?.clone
      if (!clone || typeof clone.querySelectorAll !== 'function') {
        return
      }

      // Step 1: Process background layer
      // Strip CSS background-image (iOS Safari bug) and reveal injected img
      const bgDivs = clone.querySelectorAll('[data-portrait-bg]') as NodeListOf<HTMLElement>
      bgDivs.forEach((div) => {
        div.style.backgroundImage = 'none'
        const imgs = div.querySelectorAll('[data-snap-bg-img]') as NodeListOf<HTMLImageElement>
        imgs.forEach((img) => {
          img.style.visibility = 'visible'
        })
      })

      // Step 2: Process portrait containers
      const containers = clone.querySelectorAll('[data-portrait-inject]') as NodeListOf<HTMLElement>
      containers.forEach((container) => {
        const url = container.dataset.portraitUrl
        const portraitData = url ? portraitDataMap.get(url) : null

        // Only modify if we have portrait data (L2D-on with spine)
        // L2D-off containers have no data - LoadingBlurredImage renders naturally
        if (portraitData) {
          // Hide ALL existing imgs (includes spine canvas converted to PNG by snapdom)
          const allImgs = container.querySelectorAll('img') as NodeListOf<HTMLImageElement>
          allImgs.forEach((img) => {
            img.style.display = 'none'
          })

          // Inject fresh portrait img with data URL and explicit dimensions
          const img = document.createElement('img')
          img.src = portraitData.dataUrl
          img.style.position = 'absolute'
          img.style.left = `${portraitData.left}px`
          img.style.top = `${portraitData.top}px`
          img.style.width = `${portraitData.width}px`
          img.style.height = `${portraitData.height}px`
          img.style.zIndex = '10'
          container.appendChild(img)
        }
      })
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

    // Pre-fetch portrait data (for L2D-on, we inject directly into clone)
    const portraitDataMap = await preparePortraitData(element)

    const revealPlugin = buildRevealBgPlugin(portraitDataMap)
    const restoreContext = patchCanvasForDisplayP3()
    // Cache-bust created once outside retry loop to reuse decode cache across attempts
    const cacheBust = `__snap-bg=${Date.now()}`

    let blob: Blob | null = null
    let lastError: unknown = null
    try {
      for (let i = 0; i < maxAttempts; i++) {
        const restoreBgInjection = await injectHiddenLiveBgImages(element, cacheBust)
        try {
          const capture = await withTimeout(
            snapdom(element, {
              scale: 1.5,
              dpr: 1,
              width: cardTotalW,
              height: parentH,
              backgroundColor: 'transparent',
              outerShadows: true,
              embedFonts: true,
              plugins: [revealPlugin],
            }),
            attemptTimeoutMs,
          )
          blob = await capture.toBlob({ type: 'png' })
          if (blob && blob.size > 1_000_000) break
        } catch (e) {
          lastError = e
        } finally {
          restoreBgInjection()
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
