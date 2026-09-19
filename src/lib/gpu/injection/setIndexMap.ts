import {
  OrnamentSetCount,
  RelicSetCount,
  setConfigRegistry,
} from 'lib/sets/setConfigRegistry'
import {
  type SetConfig,
  SetType,
} from 'types/setConfig'

export type SetRegistryCardinality = {
  relicSetCount: number,
  ornamentSetCount: number,
}

export function assertGpuSetRegistryCardinality(
  configs: Iterable<SetConfig>,
  expected: SetRegistryCardinality,
): void {
  let relicSetCount = 0
  let ornamentSetCount = 0

  for (const config of configs) {
    if (config.info.setType === SetType.RELIC) {
      relicSetCount++
    } else {
      ornamentSetCount++
    }
  }

  if (relicSetCount !== expected.relicSetCount || ornamentSetCount !== expected.ornamentSetCount) {
    throw new Error(
      'GPU set registry cardinality mismatch: '
      + `expected ${expected.relicSetCount} relic / ${expected.ornamentSetCount} ornament, `
      + `got ${relicSetCount} relic / ${ornamentSetCount} ornament. `
      + 'Check for a cross-family setKey collision before Map construction.',
    )
  }
}

export function getSetRegistryCardinality(): SetRegistryCardinality {
  const cardinality = {
    relicSetCount: RelicSetCount,
    ornamentSetCount: OrnamentSetCount,
  }
  assertGpuSetRegistryCardinality(setConfigRegistry.values(), cardinality)
  return cardinality
}

/**
 * Generate WGSL constant declarations for set indices.
 * These map each set name to its raw registry index. The generated accessors split
 * that index into a mask word and bit without changing the caller ABI.
 */
export function generateSetIndexConstants(): string {
  getSetRegistryCardinality()

  const relics: { id: string, index: number }[] = []
  const ornaments: { id: string, index: number }[] = []

  for (const config of setConfigRegistry.values()) {
    const entry = { id: config.setKey, index: config.info.index }
    if (config.info.setType === SetType.RELIC) {
      relics.push(entry)
    } else {
      ornaments.push(entry)
    }
  }

  relics.sort((a, b) => a.index - b.index)
  ornaments.sort((a, b) => a.index - b.index)

  let wgsl = '\n// Relic set indices\n'
  for (const { id, index } of relics) {
    wgsl += `const SET_${id}: u32 = ${index}u;\n`
  }
  wgsl += '\n// Ornament set indices\n'
  for (const { id, index } of ornaments) {
    wgsl += `const SET_${id}: u32 = ${index}u;\n`
  }
  return wgsl
}
