const BITS_PER_WORD = 32
const WORD_SHIFT = 5
const BIT_INDEX_MASK = BITS_PER_WORD - 1

export function bitpackBooleanArray(values: readonly number[]): number[] {
  const paddedLength = Math.ceil(values.length / BITS_PER_WORD) * BITS_PER_WORD
  const result: number[] = []

  for (let i = 0; i < paddedLength; i += BITS_PER_WORD) {
    let packedValue = 0
    for (let j = 0; j < BITS_PER_WORD; j++) {
      const value = i + j < values.length ? values[i + j] : 0
      packedValue |= value << j
    }
    result.push(packedValue >>> 0)
  }

  return result
}

export function isSetSolutionValid(bitpackedArray: readonly number[], index: number): boolean {
  const packedIndex = index >>> WORD_SHIFT
  const bitIndex = index & BIT_INDEX_MASK
  return ((bitpackedArray[packedIndex] >> bitIndex) & 1) === 1
}
