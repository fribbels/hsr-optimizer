import { BASE_PATH } from 'lib/constants/appPages'
import type { CharacterId } from 'types/character'
import manifest from './spineManifest.json' with { type: 'json' }

const SPINE_BASE = new URL(BASE_PATH + '/assets/spine', import.meta.url).href

function toBaseCharacterId(characterId: string): string {
  return characterId.substring(0, 4)
}

/**
 * Returns the number of skeletons for a character, or null if not in manifest.
 */
export function getSkeletonCount(characterId: CharacterId): number | null {
  const count = (manifest as Record<string, number>)[toBaseCharacterId(characterId)]
  return count ?? null
}

/**
 * Derives asset file paths from character ID and skeleton count.
 * Single skeleton: {charId}.skel, {charId}.atlas
 * Multi skeleton:  {charId}_0.skel, {charId}_0.atlas, {charId}_1.skel, ...
 */
export function getSkeletonFiles(characterId: CharacterId, count: number): { skelFile: string, atlasFile: string }[] {
  const baseId = toBaseCharacterId(characterId)
  if (count === 1) {
    return [{ skelFile: `${baseId}.skel`, atlasFile: `${baseId}.atlas` }]
  }
  return Array.from({ length: count }, (_, i) => ({
    skelFile: `${baseId}_${i}.skel`,
    atlasFile: `${baseId}_${i}.atlas`,
  }))
}

export function getSpineAssetBaseUrl(characterId: CharacterId): string {
  return `${SPINE_BASE}/${toBaseCharacterId(characterId)}/`
}
