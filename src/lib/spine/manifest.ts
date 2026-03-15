const manifestCache = new Map<string, Record<string, string>>()
const manifestPromises = new Map<string, Promise<Record<string, string>>>()

export async function getManifest(cdnBase: string): Promise<Record<string, string>> {
  const cached = manifestCache.get(cdnBase)
  if (cached) return cached

  let promise = manifestPromises.get(cdnBase)
  if (!promise) {
    promise = fetch(`${cdnBase}/manifest.json`)
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        manifestCache.set(cdnBase, data)
        return data
      })
      .catch((err) => {
        manifestPromises.delete(cdnBase)
        throw err
      })
    manifestPromises.set(cdnBase, promise)
  }
  return promise
}

/**
 * Returns the skeleton name for a character, or null if unsupported.
 * Multi-skeleton characters (pipe-separated entries) are excluded.
 */
export function toBaseCharacterId(characterId: string): string {
  return characterId.substring(0, 4)
}

export async function getSkeletonName(characterId: string, cdnBase: string): Promise<string | null> {
  const manifest = await getManifest(cdnBase)
  const entry = manifest[toBaseCharacterId(characterId)]
  if (!entry) return null
  if (entry.includes('|')) return null
  return entry
}
