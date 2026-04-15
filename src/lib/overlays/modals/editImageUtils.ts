import type { ImageDimensions } from 'types/customImage'

const IMGUR_API_ENDPOINT = 'https://api.imgur.com/3/image'
// https://api.imgur.com/oauth2/addclient
const CLIENT_ID = '13bf25a25cf82e9'

const isLocalhost = () => location.hostname === 'localhost' || location.hostname === '127.0.0.1'

function fileToDataUrl(file: File): Promise<{ link: string, dimensions?: ImageDimensions } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onerror = () => resolve(null)
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = () =>
        resolve({
          link: dataUrl,
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        })
      img.onerror = () => resolve(null)
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

export const DEFAULT_IMAGE_DIMENSIONS: ImageDimensions = { width: 0, height: 0 }
export const DEFAULT_CROP = { x: 0, y: 0 }
export const DEFAULT_ZOOM = 1
export const DEFAULT_CUSTOM_IMAGE_PARAMS = {
  croppedArea: { x: 0, y: 0, width: 0, height: 0 },
  croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
}
export const MIN_ZOOM = 1
export const MAX_ZOOM = 5

const MAX_IMAGE_SIZE_MB = 20
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024

// Validates file size against limit
export function validateFileSize(file: File, maxSizeBytes: number = MAX_IMAGE_SIZE_BYTES): { valid: boolean, error?: string } {
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Image exceeds ${MAX_IMAGE_SIZE_MB}MB limit. Please resize or choose a different image.`,
    }
  }
  return { valid: true }
}

// Validates URL file size by fetching Content-Length header (no full download)
export async function validateUrlFileSize(url: string, maxSizeBytes: number = MAX_IMAGE_SIZE_BYTES): Promise<{ valid: boolean, error?: string }> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' })
    const contentLength = response.headers.get('content-length')

    if (!contentLength) {
      // If no Content-Length header, allow it to proceed (server might not support HEAD)
      return { valid: true }
    }

    const fileSizeBytes = parseInt(contentLength, 10)
    if (fileSizeBytes > maxSizeBytes) {
      return {
        valid: false,
        error: `Image exceeds ${MAX_IMAGE_SIZE_MB}MB limit. Please resize or choose a different image.`,
      }
    }
    return { valid: true }
  } catch (error) {
    // If HEAD request fails, allow it to proceed and let imgur handle it
    console.warn('Could not validate file size via HEAD request:', error)
    return { valid: true }
  }
}

// Checks if CORS policy allows fetching the image
// Screenshot functionality wont work if CORS blocks the fetch
export async function isCORSallowedImageUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
    })
    return response.ok
  } catch (error) {
    console.log('CORS blocked image fetch, uploading to imgur:', url)
    return false
  }
}

// Verifies that the URL actually links to an image
export async function isValidImageUrl(url: string): Promise<{ valid: boolean, dimensions?: ImageDimensions }> {
  // Sometimes copying an image address that isn't fully loaded will copy the base64
  // We don't want that, so checking here to make sure this is actually a URL
  if (!url.includes('http')) {
    return { valid: false }
  }

  const img = new Image() // Uses the native Image constructor — don't shadow with a component import
  img.src = url

  return new Promise((resolve) => {
    img.onerror = () => resolve({ valid: false })
    img.onload = () => {
      resolve({
        valid: true,
        dimensions: {
          width: img.naturalWidth,
          height: img.naturalHeight,
        },
      })
    }
  })
}

// Verifies that the uploaded file is actually an image
export async function isValidImageFile(file: File): Promise<{ valid: boolean, dimensions?: ImageDimensions }> {
  return new Promise((resolve) => {
    const fileReader = new FileReader()
    fileReader.onerror = () => {
      resolve({ valid: false })
    }
    fileReader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        resolve({
          valid: true,
          dimensions: {
            width: img.width,
            height: img.height,
          },
        })
      }
      img.onerror = () => {
        resolve({ valid: false })
      }
    }
    fileReader.readAsDataURL(file)
  })
}

/************************************************
 IMPORTANT:
 When testing this on localhost, you WILL run into a 429 / 403 issue.
 This is because Imgur API hates localhost for some reason.
 https://stackoverflow.com/questions/66195106/imgur-api-responding-with-code-403-with-server-error-429
 WORKAROUND:
 In vite.config.ts:
 server: {
   open: true,
   host: '127.0.0.1',
   port: 3000,
   allowedHosts: ['testlocalhost.com'],
 },
 Add `127.0.0.1 testlocalhost.com` to windows hosts file, then use testlocalhost.com:3000
 You will not be able to access i.imgur.com/... links using 127.0.0.1,
 So the immediate next step of cropping will not work as expected.
 https://stackoverflow.com/questions/43895390/imgur-images-returning-403
 SUMMARY:
 These Imgur restrictions are incredibly annoying to test with in development,
 however it should have no impact in production.

 When the key goes down: https://api.imgur.com/oauth2/addclient
 *************************************************/
export async function uploadToImgur(image: string | File): Promise<{ link: string, dimensions?: ImageDimensions } | null> {
  // Localhost bypass: imgur blocks requests from localhost/127.0.0.1
  if (isLocalhost() && image instanceof File) {
    console.log('[editImageUtils] Localhost detected, using data URL instead of imgur')
    return fileToDataUrl(image)
  }

  const formData = new FormData()
  formData.append('image', image)

  try {
    const response = await fetch(IMGUR_API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
      },
      body: formData,
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Imgur API error: ${errorData.data.error}`)
    }
    const data = await response.json()
    const dimensions = (data.data.width && data.data.height)
      ? { width: data.data.width, height: data.data.height }
      : undefined
    if (data.success) {
      return { link: data.data.link, dimensions }
    } else {
      throw new Error('Upload to Imgur failed but did not return a typical error response')
    }
  } catch (error) {
    console.error('There was an error uploading the image to Imgur:', error)
    return null
  }
}
