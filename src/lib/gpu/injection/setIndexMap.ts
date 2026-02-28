import { Constants } from 'lib/constants/constants'

const { SetsRelics, SetsOrnaments } = Constants

const relicSetKeys = Object.keys(SetsRelics)
const ornamentSetKeys = Object.keys(SetsOrnaments)
/**
 * Generate WGSL constant declarations for set bit indices.
 * These map each set name to its bit position in the bitmask registers.
 * Relic sets use bits 0..N in relicMatch2/relicMatch4.
 * Ornament sets use bits 0..M in ornamentMatch2.
 */
export function generateSetBitConstants(): string {
  let wgsl = '\n// Relic set bit indices\n'
  for (let i = 0; i < relicSetKeys.length; i++) {
    wgsl += `const SET_${relicSetKeys[i]}: u32 = ${i}u;\n`
  }
  wgsl += '\n// Ornament set bit indices\n'
  for (let i = 0; i < ornamentSetKeys.length; i++) {
    wgsl += `const SET_${ornamentSetKeys[i]}: u32 = ${i}u;\n`
  }
  return wgsl
}
