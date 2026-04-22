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

function patchCanvasForDisplayP3(): () => void {
  if (!shouldUseDisplayP3()) {
    return () => {} // No-op on desktop
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

async function injectHiddenLiveBgImages(root: HTMLElement): Promise<() => void> {
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
    const cacheBustedUrl = `${url}#__snap-bg=${Date.now()}`

    const img = document.createElement('img')
    positionImgLikeBackground(img, bgSize, bgPos)
    img.setAttribute('data-snap-bg-img', '')
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

  if (loadPromises.length > 0) {
    await Promise.all(loadPromises)
  }

  return () => {
    for (const img of injectedImgs) img.remove()
  }
}

interface PortraitData {
  dataUrl: string
  left: string
  top: string
  width: number
  height: number
}

async function preparePortraitData(root: HTMLElement): Promise<Map<string, PortraitData>> {
  // Pre-fetch portrait data for spine containers (L2D-on).
  // We'll inject directly into the clone in afterClone.
  const containers = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-inject]'))
  const portraitDataMap = new Map<string, PortraitData>()

  for (const container of containers) {
    const hasSpine = container.querySelector('[data-portrait-spine]') != null
    if (!hasSpine) continue

    const url = container.dataset.portraitUrl
    const left = container.dataset.portraitLeft
    const top = container.dataset.portraitTop
    const width = container.dataset.portraitWidth

    if (!url || left == null || top == null || width == null) continue

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // Get natural dimensions
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
      continue
    }
  }

  return portraitDataMap
}

function buildRevealBgPlugin(portraitDataMap: Map<string, PortraitData>) {
  return {
    name: 'reveal-bg-in-clone',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterClone(context: any) {
      const clone = context?.clone
      if (!clone || typeof clone.querySelectorAll !== 'function') {
        return
      }

      // 1. Strip CSS background-image from bg divs and reveal injected bg imgs
      const bgDivs = clone.querySelectorAll('[data-portrait-bg]') as NodeListOf<HTMLElement>
      bgDivs.forEach((div) => {
        div.style.backgroundImage = 'none'
        const imgs = div.querySelectorAll('[data-snap-bg-img]') as NodeListOf<HTMLImageElement>
        imgs.forEach((img) => {
          img.style.visibility = 'visible'
        })
      })

      // 2. Process portrait containers
      const containers = clone.querySelectorAll('[data-portrait-inject]') as NodeListOf<HTMLElement>
      containers.forEach((container) => {
        const url = container.dataset.portraitUrl
        const portraitData = url ? portraitDataMap.get(url) : null

        // Only modify container if we have portrait data (L2D-on case)
        // For L2D-off, LoadingBlurredImage renders naturally
        if (portraitData) {
          // Hide ALL existing imgs in container (spine PNG, etc)
          const allImgs = container.querySelectorAll('img') as NodeListOf<HTMLImageElement>
          allImgs.forEach((img) => {
            img.style.display = 'none'
          })

          // Inject portrait directly into clone
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

    // Plugin handles bg reveal and portrait injection into clone
    const revealPlugin = buildRevealBgPlugin(portraitDataMap)
    const restoreContext = patchCanvasForDisplayP3()

    let blob: Blob | null = null
    try {
      for (let i = 0; i < maxAttempts; i++) {
        const attemptStart = performance.now()

        // Inject bg imgs into live DOM (will be cloned)
        const restoreBgInjection = await injectHiddenLiveBgImages(element)
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
        } catch {
          // Retry
        } finally {
          restoreBgInjection()
        }
      }
    } finally {
      restoreContext()
    }

    if (!blob) {
      throw new Error('Screenshot failed: null blob from all attempts')
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
        const hasCanShare = typeof navigator.canShare === 'function'
        const canShareFiles = hasCanShare ? navigator.canShare({ files: [file] }) : false
        Message.error(
          `[debug] secure=${window.isSecureContext} hasCanShare=${hasCanShare} canShareFiles=${canShareFiles} blobSize=${blob.size} type=${blob.type}`,
        )
        if (canShareFiles) {
          navigator.share({ files: [file], title: '', text: '' }).catch((e: unknown) => {
            const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
            Message.error(`[debug] share() threw: ${msg}`)
          })
        } else {
          Message.error('Unable to save screenshot to clipboard, try the download button to the right')
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
