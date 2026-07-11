import { sha256Hex } from 'leaderboard/shared/nodeFacade'
import { sortKeys } from 'lib/utils/objectUtils'

export type HashString = string

export function stableJson(value: unknown): string {
  const json = JSON.stringify(sortKeys(value))
  if (json === undefined) {
    throw new Error('stableJson: value is not JSON-serializable')
  }
  return json
}

export function sha256Text(text: string): HashString {
  return sha256Hex(text)
}

export function hashObject(value: unknown): HashString {
  return sha256Text(stableJson(value))
}

export function hashUid(uid: string): HashString {
  return sha256Text(uid)
}

export function computeBuildId(uidHash: string, characterId: string, configType: string, teamId: string): string {
  return hashObject(`${uidHash}#${characterId}#${configType}#${teamId}`).slice(0, 12)
}
