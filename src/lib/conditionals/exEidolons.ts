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
