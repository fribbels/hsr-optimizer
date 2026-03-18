import type { DBMetadata } from 'types/metadata'

let metadata: DBMetadata = {} as DBMetadata

export function getGameMetadata(): DBMetadata {
  return metadata
}

export function setGameMetadata(m: DBMetadata): void {
  metadata = m
}
