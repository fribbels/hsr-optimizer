import { BASE_PATH } from 'lib/constants/appPages'

const SPINE_BASE = new URL(BASE_PATH + '/assets/spine', import.meta.url).href

let manifestCache: Record<string, number> | null = null
let manifestPromise: Promise<Record<string, number>> | null = null

async function getManifest(): Promise<Record<string, number>> {
  if (manifestCache) return manifestCache
  if (!manifestPromise) {
    manifestPromise = fetch(`${SPINE_BASE}/manifest.json`)
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        manifestCache = data
        return data
      })
      .catch((err) => {
        manifestPromise = null
        throw err
      })
  }
  return manifestPromise
}

function toBaseCharacterId(characterId: string): string {
  return characterId.substring(0, 4)
}

/**
 * Returns the number of skeletons for a character, or null if not in manifest.
 */
export async function getSkeletonCount(characterId: string): Promise<number | null> {
  const manifest = await getManifest()
  const count = manifest[toBaseCharacterId(characterId)]
  return count ?? null
}

/**
 * Derives asset file paths from character ID and skeleton count.
 * Single skeleton: {charId}.skel, {charId}.atlas
 * Multi skeleton:  {charId}_0.skel, {charId}_0.atlas, {charId}_1.skel, ...
 */
export function getSkeletonFiles(characterId: string, count: number): { skelFile: string; atlasFile: string }[] {
  const baseId = toBaseCharacterId(characterId)
  if (count === 1) {
    return [{ skelFile: `${baseId}.skel`, atlasFile: `${baseId}.atlas` }]
  }
  return Array.from({ length: count }, (_, i) => ({
    skelFile: `${baseId}_${i}.skel`,
    atlasFile: `${baseId}_${i}.atlas`,
  }))
}

export function getSpineAssetBaseUrl(characterId: string): string {
  return `${SPINE_BASE}/${toBaseCharacterId(characterId)}/`
}
