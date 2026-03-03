import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { SetType } from 'types/setConfig'

/**
 * Generate WGSL constant declarations for set bit indices.
 * These map each set name to its bit position in the bitmask registers.
 * Relic sets use bits 0..N in relicMatch2/relicMatch4.
 * Ornament sets use bits 0..M in ornamentMatch2.
 */
export function generateSetBitConstants(): string {
  const relics: { id: string; index: number }[] = []
  const ornaments: { id: string; index: number }[] = []

  for (const config of setConfigRegistry.values()) {
    const entry = { id: config.id, index: config.info.index }
    if (config.info.setType === SetType.RELIC) {
      relics.push(entry)
    } else {
      ornaments.push(entry)
    }
  }

  relics.sort((a, b) => a.index - b.index)
  ornaments.sort((a, b) => a.index - b.index)

  let wgsl = '\n// Relic set bit indices\n'
  for (const { id, index } of relics) {
    wgsl += `const SET_${id}: u32 = ${index}u;\n`
  }
  wgsl += '\n// Ornament set bit indices\n'
  for (const { id, index } of ornaments) {
    wgsl += `const SET_${id}: u32 = ${index}u;\n`
  }
  return wgsl
}
