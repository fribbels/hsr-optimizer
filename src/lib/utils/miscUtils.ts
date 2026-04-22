// Requires secure context (HTTPS or localhost)
export function uuid(): string {
  return crypto.randomUUID()
}

/** Validates a 9-digit numeric UID string. Returns trimmed UID or null. */
export function validateUuid(uid: string): string | null {
  const trimmed = uid.trim()
  return /^\d{9}$/.test(trimmed) ? trimmed : null
}

export function stripTrailingSlashes(str: string): string {
  return str.replace(/\/+$/, '')
}

/** Convert milliseconds to "MM:SS" or "H:MM:SS" string. */
export function msToReadable(duration: number): string {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor(duration / (1000 * 60 * 60))

  const hoursS = hours > 0 ? `${hours}:` : ''
  const minutesS = (minutes < 10) ? `0${minutes}` : `${minutes}`
  const secondsS = (seconds < 10) ? `0${seconds}` : `${seconds}`

  return `${hoursS}${minutesS}:${secondsS}`
}

export function consoleWarnWrapper(err: unknown): void {
  if (err instanceof Error) {
    console.warn(err.name, err.message)
  } else {
    console.warn('An unknown error occurred', err)
  }
}

/**
 * Compare two semver strings (e.g. 'v4.0.4', 'v4.0.5').
 * Returns true if `current` is older than `latest`.
 */
export function isVersionOutdated(current: string, latest: string): boolean {
  const pa = current.replace(/^v/, '').split('.').map(Number)
  const pb = latest.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) < (pb[i] || 0)) return true
    if ((pa[i] || 0) > (pb[i] || 0)) return false
  }
  return false
}
