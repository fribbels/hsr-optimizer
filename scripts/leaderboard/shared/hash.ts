import { sortKeys } from 'lib/utils/objectUtils'
import { sha256Hex } from './nodeFacade'

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
