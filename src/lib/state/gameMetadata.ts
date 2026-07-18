import type { CharacterId } from 'types/character'
import type { DBMetadata } from 'types/metadata'

let metadata: DBMetadata = {} as DBMetadata

export function getGameMetadata(): DBMetadata {
  return metadata
}

export function setGameMetadata(m: DBMetadata): void {
  metadata = m
}

// A character is "pre-Novaflare" (deprecated) once a released upgraded `${id}b1` version exists.
export function isPreNovaflare(id: CharacterId): boolean {
  const b1 = metadata.characters?.[`${id}b1` as CharacterId]
  return !!b1 && !b1.unreleased
}
