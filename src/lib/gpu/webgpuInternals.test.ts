// @vitest-environment jsdom
import {
  getResultBindGroupEntries,
  getResultMatrixBufferSize,
} from 'lib/gpu/webgpuInternals'
import {
  describe,
  expect,
  it,
} from 'vitest'

const buffer = {} as GPUBuffer

describe('WebGPU result buffer layout', () => {
  it('binds the debug results array and valid permutation counter', () => {
    const entries = getResultBindGroupEntries(true, buffer, buffer, buffer, buffer)

    expect(entries.map((entry) => entry.binding)).toEqual([0, 3])
  })

  it('binds the release compaction buffers and valid permutation counter', () => {
    const entries = getResultBindGroupEntries(false, buffer, buffer, buffer, buffer)

    expect(entries.map((entry) => entry.binding)).toEqual([1, 2, 3])
  })

  it('sizes debug output by the full container stride', () => {
    expect(getResultMatrixBufferSize(true, 16_384, 97)).toBe(6_356_992)
    expect(getResultMatrixBufferSize(true, 16_384, 257)).toBe(16_842_752)
    expect(getResultMatrixBufferSize(false, 16_384, 257)).toBe(4)
  })
})
