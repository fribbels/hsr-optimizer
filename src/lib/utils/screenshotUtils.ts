import { snapdom } from '@zumer/snapdom'
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

function injectHiddenLiveBgImages(root: HTMLElement): () => void {
  const bgElements = Array.from(root.querySelectorAll<HTMLElement>('[data-portrait-bg]'))
  const injectedImgs: HTMLImageElement[] = []

  for (const el of bgElements) {
    const bgStyleRaw = el.style.backgroundImage
    const match = /url\(["']?([^"')]+)["']?\)/.exec(bgStyleRaw)
    if (!match) continue

    const url = match[1]
    const bgSize = el.style.backgroundSize
    const bgPos = el.style.backgroundPosition

    const img = document.createElement('img')
    positionImgLikeBackground(img, bgSize, bgPos)
    img.setAttribute('data-snap-bg-img', '')
    img.style.visibility = 'hidden' // invisible on live page, only shown in clone
    img.src = url
    el.appendChild(img)
    injectedImgs.push(img)
  }

  Message.warning(`[bg-inline] injected ${injectedImgs.length} bg imgs (sync)`)
  return () => {
    for (const img of injectedImgs) img.remove()
  }
}

function buildRevealBgPlugin() {
  return {
    name: 'reveal-bg-in-clone',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterClone(context: any) {
      const clone = context?.clone
      if (!clone || typeof clone.querySelectorAll !== 'function') return
      const bgDivs = clone.querySelectorAll('[data-portrait-bg]') as NodeListOf<HTMLElement>
      let stripped = 0
      let revealed = 0
      bgDivs.forEach((div) => {
        div.style.backgroundImage = 'none'
        stripped++
        const imgs = div.querySelectorAll('[data-snap-bg-img]') as NodeListOf<HTMLElement>
        imgs.forEach((img) => {
          img.style.visibility = 'visible'
          revealed++
        })
      })
      Message.warning(`[bg-inline] clone reveal: stripped ${stripped} bgs, revealed ${revealed} imgs`)
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

    Message.warning(`[v38] sync-inject`)

    // Sync inject hidden <img> into live DOM — no awaits between injection and snapdom so React can't re-render and remove our imgs
    const restoreBackgrounds = injectHiddenLiveBgImages(element)
    // Plugin strips CSS bg + reveals the img only in the clone
    const revealPlugin = buildRevealBgPlugin()
    // Patch canvas to use Display P3 on mobile
    const restoreContext = patchCanvasForDisplayP3()

    let blob: Blob | null = null
    try {
      for (let i = 0; i < maxAttempts; i++) {
        const attemptStart = performance.now()
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
          Message.warning(`[snapdom] attempt ${i + 1}: ${blob ? `${Math.round(blob.size / 1024)}KB` : 'null'} ${Math.round(performance.now() - attemptStart)}ms`)
          if (blob && blob.size > 50000) break
        } catch (e) {
          Message.error(`[snapdom] attempt ${i + 1} failed: ${e}`)
        }
      }
    } finally {
      restoreContext()
      restoreBackgrounds()
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
