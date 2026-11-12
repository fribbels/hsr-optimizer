import type {
  ExEidolon,
  ExFlags,
} from 'types/character'

// Check whether an EX eidolon is enabled. Missing flags mean EX is off.
export function hasExEidolon(mask: ExFlags | undefined, flag: ExEidolon): boolean {
  return ((mask ?? 0) & flag) === flag
}

// Enable or disable one EX eidolon without changing the other flags.
export function setExEidolon(mask: ExFlags, flag: ExEidolon, enabled: boolean): ExFlags {
  return enabled ? mask | flag : mask & ~flag
}

// Keep only the EX flags supported by the character.
export function getSupportedFlags(flags: ExFlags, supportedFlags: ExFlags): ExFlags {
  return flags & supportedFlags
}

// Game EX eidolon ids are the base character id × 100 + the EX number, e.g. 121301 is EX1 for 1213
const EX_EIDOLON_ID_MULTIPLIER = 100

// Convert game EX eidolon ids into EX flags. Accepts suffixed ids like '1005b1'.
export function exFlagsFromEidolonIds(characterId: string | number, exEidolonIds: number[]): ExFlags {
  const baseId = parseInt(String(characterId), 10) * EX_EIDOLON_ID_MULTIPLIER
  let flags: ExFlags = 0
  for (const exEidolonId of exEidolonIds) {
    const exNumber = exEidolonId - baseId
    if (exNumber >= 1 && exNumber <= 30) flags |= 1 << (exNumber - 1)
  }
  return flags
}
