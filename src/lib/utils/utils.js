import * as htmlToImage from 'html-to-image'
import i18next from 'i18next'
import stringify from 'json-stable-stringify'
import { Constants } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message.js'
import { currentLocale } from 'lib/utils/i18nUtils.js'

console.debug = (...args) => {
  const messageConfig = '%c%s '

  console.log(messageConfig, 'color: orange', '[DEBUG]', ...args)
}

export const Utils = {
  // Hashes an object for uniqueness checks
  objectHash: (obj) => {
    return stringify(obj)
  },

  // Fill array of size n with 0s
  arrayOfZeroes: (n) => {
    return new Array(n).fill(0)
  },

  // Fill array of size n with value x
  arrayOfValue: (n, x) => {
    return new Array(n).fill(x)
  },

  nullUndefinedToZero: (x) => {
    if (x == null) return 0
    return x
  },

  // TODO: Deprecate these
  mergeDefinedValues: (target, source) => {
    if (!source) return target

    for (const key of Object.keys(target)) {
      if (source[key] != null) {
        target[key] = source[key]
      }
    }
    return target
  },

  // TODO: Deprecate these
  mergeUndefinedValues: (target, source) => {
    for (const key of Object.keys(source)) {
      if (target[key] == null) {
        target[key] = source[key]
      }
    }
    return target
  },

  // await sleep(ms) to block
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  // Flat stats HP/ATK/DEF/SPD
  isFlat: (stat) => {
    return stat == Constants.Stats.HP
      || stat == Constants.Stats.ATK
      || stat == Constants.Stats.DEF
      || stat == Constants.Stats.SPD
  },

  isMobileOrSafari: () => {
    const userAgent = navigator.userAgent

    // Detect mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|BlackBerry/i.test(userAgent)

    // Detect Safari (excluding Chrome on iOS)
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

    return isMobile || isSafari
  },

  // Util to capture a div and screenshot it to clipboard/file
  screenshotElementById: async (elementId, action, characterName) => {
    const isMobileOrSafari = Utils.isMobileOrSafari()
    const repeatLoadBlob = async () => {
      const minDataLength = 1200000
      const maxAttempts = isMobileOrSafari ? 9 : 3
      const scale = 1.5
      const w = 1068 * scale
      const h = 856 * scale

      const options = {
        pixelRatio: 1,
        height: h,
        canvasHeight: h,
        width: w,
        canvasWidth: w,
        skipAutoScale: true,
        style: {
          zoom: scale,
        },
        skipFonts: true, // TODO: remove once html-to-image gets patched (c.f. https://github.com/bubkoo/html-to-image/issues/508)?
      }

      let i = 0
      let blob

      while (i < maxAttempts) {
        i++
        blob = await htmlToImage.toBlob(document.getElementById(elementId), options)

        if (blob.size > minDataLength) {
          break
        }
      }

      if (isMobileOrSafari) {
        // Render again
        blob = await htmlToImage.toBlob(document.getElementById(elementId), options)
      }

      return blob
    }

    function handleBlob(blob) {
      const prefix = characterName || 'Hsr-optimizer'
      const dateTime = new Date().toISOString()
      const filename = `${prefix}_${dateTime}.png`

      if (action == 'clipboard') {
        if (isMobileOrSafari) {
          const file = new File([blob], filename, { type: 'image/png' })
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: '',
              text: '',
            })
          } else {
            Message.error('Unable to save screenshot to clipboard, try the download button to the right')
            // 'Unable to save screenshot to clipboard, try the download button to the right'
          }
        } else {
          try {
            const data = [new window.ClipboardItem({ [blob.type]: blob })]
            navigator.clipboard.write(data).then(() => {
              Message.success(i18next.t('charactersTab:ScreenshotMessages.ScreenshotSuccess')) // 'Copied screenshot to clipboard'
            })
          } catch (e) {
            console.error(e)
            Message.error(i18next.t('charactersTab:ScreenshotMessages.ScreenshotFailed'))
            // 'Unable to save screenshot to clipboard, try the download button to the right'
          }
        }
      }

      if (action == 'download') {
        const fileUrl = window.URL.createObjectURL(blob)
        const anchorElement = document.createElement('a')
        anchorElement.href = fileUrl
        anchorElement.download = filename
        anchorElement.style.display = 'none'
        document.body.appendChild(anchorElement)
        anchorElement.click()
        anchorElement.remove()
        window.URL.revokeObjectURL(fileUrl)
        Message.success(i18next.t('charactersTab:ScreenshotMessages.DownloadSuccess')) // 'Downloaded screenshot'
      }
    }

    return new Promise((resolve) => {
      repeatLoadBlob().then((blob) => {
        handleBlob(blob)
        resolve()
      })
    })
  },

  // truncate10ths(16.1999999312682) == 16.1
  truncate10ths: (x) => {
    return Math.floor(x * 10) / 10
  },

  // truncate100ths(16.1999999312682) == 16.19
  truncate100ths: (x) => {
    return Math.floor(x * 100) / 100
  },

  // truncate100ths(16.1999999312682) == 16.199
  truncate1000ths: (x) => {
    return Math.floor(x * 1000) / 1000
  },

  // truncate10000ths(16.1999999312682) == 16.1999
  truncate10000ths: (x) => {
    return Math.floor(x * 10000) / 10000
  },

  // Round a number to a certain precision. Useful for js floats: precisionRound(16.1999999312682. 5) == 16.2
  precisionRound(number, precision = 5) {
    const factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  },

  // Reverse an object's keys/values
  flipMapping: (obj) => {
    return Object.fromEntries(Object.entries(obj).map((a) => a.reverse()))
  },

  // Deep clone an object, different implementations have different browser performance impacts
  clone: (obj) => {
    if (!obj) return null // TODO is this a good idea
    return JSON.parse(JSON.stringify(obj))
  },

  // Used for antd's selects to allow searching by the lowercase label
  labelFilterOption: (input, option) => {
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
  },

  // TODO: standardize all these
  nameFilterOption: (input, option) => {
    return (option?.name ?? '').toLowerCase().includes(input.toLowerCase())
  },

  titleFilterOption: (input, option) => {
    return (option?.title ?? '').toLowerCase().includes(input.toLowerCase())
  },

  // Returns body/feet/rope/sphere
  hasMainStat: (part) => {
    return part == Constants.Parts.Body || part == Constants.Parts.Feet || part == Constants.Parts.LinkRope || part == Constants.Parts.PlanarSphere
  },

  // Used to convert output formats for relic scorer, snake-case to camelCase
  recursiveToCamel: (item) => {
    if (Array.isArray(item)) {
      return item.map((el) => Utils.recursiveToCamel(el))
    } else if (typeof item === 'function' || item !== Object(item)) {
      return item
    }
    return Object.fromEntries(
      Object.entries(item).map(([key, value]) => [
        key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, '')),
        Utils.recursiveToCamel(value),
      ]),
    )
  },

  // Generate a random uuid
  randomId: () => {
    return crypto.randomUUID()
  },

  // 5, 4, 3
  sortRarityDesc: (a, b) => {
    return b.rarity - a.rarity
  },

  // [1, 2, 3] => 6
  sumArray: (arr) => {
    return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
  },

  msToReadable: (duration) => {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor(duration / (1000 * 60 * 60))

    const hoursS = hours > 0 ? `${hours}:` : ''
    const minutesS = (minutes < 10) ? `0${minutes}` : `${minutes}`
    const secondsS = (seconds < 10) ? `0${seconds}` : `${seconds}`

    return `${hoursS}${minutesS}:${secondsS}`
  },
}
