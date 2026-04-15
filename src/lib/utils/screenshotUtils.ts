import * as htmlToImage from 'html-to-image'
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
    const minDataLength = 1200000
    const maxAttempts = mobile ? 9 : 3
    const scale = 1.5
    const w = cardTotalW * scale
    const h = parentH * scale

    const options = {
      pixelRatio: 1,
      height: h,
      canvasHeight: h,
      width: w,
      canvasWidth: w,
      skipAutoScale: true,
      style: { zoom: scale } as unknown as Partial<CSSStyleDeclaration>,
      skipFonts: true,
    }

    let i = 0
    let blob: Blob | null = null

    while (i < maxAttempts) {
      i++
      blob = await htmlToImage.toBlob(element, options)
      if (blob && blob.size > minDataLength) break
    }

    if (mobile) {
      blob = await htmlToImage.toBlob(element, options)
    }

    return blob!
  }

  function handleBlob(blob: Blob): void {
    const prefix = characterName || 'Hsr-optimizer'
    const dateTime = new Date().toISOString()
    const filename = `${prefix}_${dateTime}.png`

    if (action === 'clipboard') {
      if (mobile) {
        const file = new File([blob], filename, { type: 'image/png' })
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          void navigator.share({ files: [file], title: '', text: '' })
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
