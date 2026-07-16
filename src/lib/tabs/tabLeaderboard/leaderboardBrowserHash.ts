import type { CharacterId } from 'types/character'

async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function hashLeaderboardUid(uid: string): Promise<string> {
  return sha256Hex(uid)
}

export async function computeBrowserCandidateId(uidHash: string, characterId: CharacterId): Promise<string> {
  const hash = await sha256Hex(JSON.stringify(`${uidHash}#${characterId}`))
  return hash.slice(0, 12)
}
